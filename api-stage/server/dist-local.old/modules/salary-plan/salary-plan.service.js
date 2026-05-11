"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalaryPlanService", {
    enumerable: true,
    get: function() {
        return SalaryPlanService;
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
let SalaryPlanService = class SalaryPlanService {
    /**
     * Employee için 12 monthlık maaş planı oluşturur
     * Employeein işe başlama tarihinden itibaren planlar doldurulur
     */ async createPlanForEmployee(createDto) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                id: createDto.employeeId
            }
        });
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        // Maaş ve bonus bilgilerini al (DTO'dan veya employeeden)
        const salary = createDto.salary ?? employee.salary ?? 0;
        const bonus = createDto.bonus ?? employee.bonus ?? 0;
        const total = Number(salary) + Number(bonus);
        // İşe başlama tarihi
        const startDate = employee.startDate ? new Date(employee.startDate) : new Date();
        const baslamaAy = startDate.getMonth() + 1; // 1-12
        // Mevcut planları kontrol et
        const mevcutPlanlar = await this.prisma.salaryPlan.findMany({
            where: {
                employeeId: createDto.employeeId,
                year: createDto.year
            }
        });
        if (mevcutPlanlar.length > 0) {
            throw new _common.BadRequestException(`Plan for year ${createDto.year} already exists`);
        }
        // 12 monthlık plan oluştur
        const planlar = [];
        for(let month = 1; month <= 12; month++){
            // Employee bu monthda çalışıyor mu?
            const monthinYili = createDto.year;
            const employeeCalisiyorMu = monthinYili > startDate.getFullYear() || monthinYili === startDate.getFullYear() && month >= baslamaAy;
            // Çıkış tarihi varsa kontrol et
            let isActive = employeeCalisiyorMu;
            if (employee.endDate) {
                const cikisTarihi = new Date(employee.endDate);
                const cikisYili = cikisTarihi.getFullYear();
                const cikisAyi = cikisTarihi.getMonth() + 1;
                if (monthinYili > cikisYili || monthinYili === cikisYili && month > cikisAyi) {
                    isActive = false;
                }
            }
            const planMaas = isActive ? salary : 0;
            const planPrim = isActive ? bonus : 0;
            const planToplam = Number(planMaas) + Number(planPrim);
            planlar.push({
                employeeId: createDto.employeeId,
                year: createDto.year,
                month,
                salary: planMaas,
                bonus: planPrim,
                total: planToplam,
                status: _client.SalaryStatus.UNPAID,
                paidAmount: 0,
                remainingAmount: planToplam,
                isActive
            });
        }
        // Toplu oluştur
        const result = await this.prisma.salaryPlan.createMany({
            data: planlar
        });
        return {
            message: `12-month plan created for year ${createDto.year}`,
            count: result.count,
            year: createDto.year,
            employeeId: createDto.employeeId
        };
    }
    /**
     * Employeein yıllık planını getir
     */ async getPlanByEmployee(employeeId, year) {
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
        const planlar = await this.prisma.salaryPlan.findMany({
            where: {
                employeeId,
                year
            },
            include: {
                payments: {
                    include: {
                        paymentDetails: {
                            include: {
                                cashbox: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                bankAccount: {
                                    select: {
                                        id: true,
                                        name: true
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
                        createdAt: 'desc'
                    }
                },
                settlements: {
                    include: {
                        advance: {
                            select: {
                                id: true,
                                amount: true,
                                date: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                month: 'asc'
            }
        });
        return {
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeCode: employee.employeeCode,
                salary: employee.salary,
                bonus: employee.bonus
            },
            year,
            planlar
        };
    }
    /**
     * Tek plan detmonthı
     */ async getPlanById(id) {
        const plan = await this.prisma.salaryPlan.findUnique({
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
                payments: {
                    include: {
                        paymentDetails: {
                            include: {
                                cashbox: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                bankAccount: {
                                    select: {
                                        id: true,
                                        name: true
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
                        createdAt: 'desc'
                    }
                },
                settlements: {
                    include: {
                        advance: true
                    }
                }
            }
        });
        if (!plan) {
            throw new _common.NotFoundException('Plan not found');
        }
        return plan;
    }
    /**
     * Plan güncelle
     */ async updatePlan(id, updateDto) {
        const existing = await this.prisma.salaryPlan.findUnique({
            where: {
                id
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Plan not found');
        }
        const updateData = {
            ...updateDto
        };
        // Maaş veya bonus değiştiyse total ve kalan amountı yeniden hesapla
        if (updateDto.salary !== undefined || updateDto.bonus !== undefined) {
            const yeniMaas = updateDto.salary ?? existing.salary;
            const yeniPrim = updateDto.bonus ?? existing.bonus;
            updateData.total = Number(yeniMaas) + Number(yeniPrim);
            updateData.remainingAmount = Number(updateData.total) - Number(existing.paidAmount);
        }
        return this.prisma.salaryPlan.update({
            where: {
                id
            },
            data: updateData
        });
    }
    /**
     * Belirli monthdaki ödenecek maaşları getir
     */ async getOdenecekMaaslar(year, month) {
        console.log(`getOdenecekMaaslar called for ${year}/${month}`);
        try {
            const tenantId = await this.tenantResolver.resolveForQuery();
            console.log('Tenant resolved:', tenantId);
            const planlar = await this.prisma.salaryPlan.findMany({
                where: {
                    year,
                    month,
                    isActive: true,
                    status: {
                        in: [
                            _client.SalaryStatus.UNPAID,
                            _client.SalaryStatus.PARTIALLY_PAID
                        ]
                    },
                    employee: {
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                        isActive: true
                    }
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeCode: true,
                            department: true
                        }
                    }
                },
                orderBy: {
                    employee: {
                        firstName: 'asc'
                    }
                }
            });
            // Decimal alanları number'a çevir
            const safePlanlar = planlar.map((p)=>({
                    ...p,
                    salary: Number(p.salary),
                    bonus: Number(p.bonus),
                    total: Number(p.total),
                    paidAmount: Number(p.paidAmount),
                    remainingAmount: Number(p.remainingAmount)
                }));
            const total = planlar.reduce((sum, plan)=>sum + Number(plan.remainingAmount), 0);
            return {
                year,
                month,
                planlar: safePlanlar,
                totalOdenecek: total,
                employeeCount: planlar.length
            };
        } catch (error) {
            console.error('getOdenecekMaaslar ERROR:', error);
            throw error;
        }
    }
    /**
     * Planı sil
     */ async deletePlan(id) {
        const plan = await this.prisma.salaryPlan.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: {
                        payments: true
                    }
                }
            }
        });
        if (!plan) {
            throw new _common.NotFoundException('Plan not found');
        }
        if (plan._count.payments > 0) {
            throw new _common.BadRequestException('There are payment records for this plan. You must delete the payments first.');
        }
        return this.prisma.salaryPlan.delete({
            where: {
                id
            }
        });
    }
    /**
     * Yıllık planı sil (tüm monthlar)
     */ async deleteYillikPlan(employeeId, year) {
        const planlar = await this.prisma.salaryPlan.findMany({
            where: {
                employeeId,
                year
            },
            include: {
                _count: {
                    select: {
                        payments: true
                    }
                }
            }
        });
        const odemeliPlanlar = planlar.filter((p)=>p._count.payments > 0);
        if (odemeliPlanlar.length > 0) {
            throw new _common.BadRequestException('There are payment records for some plans. You must delete the payments first.');
        }
        const result = await this.prisma.salaryPlan.deleteMany({
            where: {
                employeeId,
                year
            }
        });
        return {
            message: `Plan for year ${year} deleted`,
            count: result.count
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SalaryPlanService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SalaryPlanService);

//# sourceMappingURL=salary-plan.service.js.map