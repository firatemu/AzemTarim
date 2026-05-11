"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdvanceService", {
    enumerable: true,
    get: function() {
        return AdvanceService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AdvanceService = class AdvanceService {
    /**
     * Advance ver
     */ async createAdvance(createDto, userId) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                id: createDto.employeeId
            }
        });
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        if (!employee.isActive) {
            throw new _common.BadRequestException('Advance cannot be given to a passive employee');
        }
        // Cashbox kontrolü
        if (createDto.cashboxId) {
            const cashbox = await this.prisma.cashbox.findUnique({
                where: {
                    id: createDto.cashboxId
                }
            });
            if (!cashbox || !cashbox.isActive) {
                throw new _common.NotFoundException('Valid cashbox not found');
            }
        }
        return this.prisma.$transaction(async (prisma)=>{
            const date = createDto.date ? new Date(createDto.date) : new Date();
            // Advance kaydı oluştur
            const advance = await prisma.advance.create({
                data: {
                    employeeId: createDto.employeeId,
                    amount: createDto.amount,
                    date: createDto.date ? new Date(createDto.date) : new Date(),
                    notes: createDto.notes,
                    cashboxId: createDto.cashboxId,
                    settledAmount: 0,
                    remainingAmount: createDto.amount,
                    status: _client.AdvanceStatus.OPEN,
                    createdBy: userId
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true
                        }
                    },
                    cashbox: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            // Cashboxdan düş
            if (createDto.cashboxId) {
                const cashbox = await prisma.cashbox.findUnique({
                    where: {
                        id: createDto.cashboxId
                    }
                });
                if (cashbox) {
                    const yeniCashboxBakiye = Number(cashbox.balance) - createDto.amount;
                    if (yeniCashboxBakiye < 0) {
                        throw new _common.BadRequestException('Not enough balance in the cashbox');
                    }
                    await prisma.cashbox.update({
                        where: {
                            id: createDto.cashboxId
                        },
                        data: {
                            balance: yeniCashboxBakiye
                        }
                    });
                }
            }
            return advance;
        });
    }
    /**
     * Advance mahsuplaştır
     */ async mahsuplastir(mahsupDto) {
        const advance = await this.prisma.advance.findUnique({
            where: {
                id: mahsupDto.advanceId
            },
            include: {
                employee: true
            }
        });
        if (!advance) {
            throw new _common.NotFoundException('Advance not found');
        }
        if (advance.status === _client.AdvanceStatus.CLOSED) {
            throw new _common.BadRequestException('This advance is already closed');
        }
        // Toplam mahsup amountını hesapla
        const toplamMahsup = mahsupDto.planlar.reduce((sum, plan)=>sum + plan.amount, 0);
        if (toplamMahsup > Number(advance.remainingAmount)) {
            throw new _common.BadRequestException(`Settlement amount (${toplamMahsup}) cannot be greater than remaining advance amount (${advance.remainingAmount})`);
        }
        // Planları kontrol et
        for (const planDto of mahsupDto.planlar){
            const plan = await this.prisma.salaryPlan.findUnique({
                where: {
                    id: planDto.planId
                }
            });
            if (!plan) {
                throw new _common.NotFoundException(`Plan not found: ${planDto.planId}`);
            }
            if (plan.employeeId !== advance.employeeId) {
                throw new _common.BadRequestException('Plan belongs to a different employee');
            }
        }
        return this.prisma.$transaction(async (prisma)=>{
            // Mahsuplaşmaları oluştur
            for (const planDto of mahsupDto.planlar){
                await prisma.advanceSettlement.create({
                    data: {
                        advanceId: mahsupDto.advanceId,
                        salaryPlanId: planDto.planId,
                        amount: planDto.amount,
                        description: planDto.notes
                    }
                });
                // Planın remainingAmount amountını azalt
                const plan = await prisma.salaryPlan.findUnique({
                    where: {
                        id: planDto.planId
                    }
                });
                if (plan) {
                    const yeniKalanTutar = Number(plan.remainingAmount) - planDto.amount;
                    await prisma.salaryPlan.update({
                        where: {
                            id: planDto.planId
                        },
                        data: {
                            remainingAmount: yeniKalanTutar < 0 ? 0 : yeniKalanTutar
                        }
                    });
                }
            }
            // Advance statusunu güncelle
            const yeniMahsupEdilen = Number(advance.settledAmount) + toplamMahsup;
            const yeniKalan = Number(advance.amount) - yeniMahsupEdilen;
            let newStatus;
            if (yeniKalan <= 0.01) {
                newStatus = _client.AdvanceStatus.CLOSED;
            } else if (yeniMahsupEdilen > 0) {
                newStatus = _client.AdvanceStatus.PARTIAL;
            } else {
                newStatus = _client.AdvanceStatus.OPEN;
            }
            return prisma.advance.update({
                where: {
                    id: mahsupDto.advanceId
                },
                data: {
                    settledAmount: yeniMahsupEdilen,
                    remainingAmount: yeniKalan,
                    status: newStatus
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true
                        }
                    },
                    settlements: {
                        include: {
                            salaryPlan: {
                                select: {
                                    year: true,
                                    month: true
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    /**
     * Employee advancelarını getir
     */ async getAdvanceByEmployee(employeeId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const employee = await this.prisma.employee.findFirst({
            where: {
                id: employeeId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        return this.prisma.advance.findMany({
            where: {
                employeeId
            },
            include: {
                cashbox: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                settlements: {
                    include: {
                        salaryPlan: {
                            select: {
                                year: true,
                                month: true
                            }
                        }
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    /**
     * Advance detayı
     */ async getAdvanceDetay(id) {
        const advance = await this.prisma.advance.findUnique({
            where: {
                id
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeCode: true
                    }
                },
                cashbox: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                settlements: {
                    include: {
                        salaryPlan: {
                            select: {
                                year: true,
                                month: true,
                                total: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            }
        });
        if (!advance) {
            throw new _common.NotFoundException('Advance not found');
        }
        return advance;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
AdvanceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], AdvanceService);

//# sourceMappingURL=advance.service.js.map