"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmployeeService", {
    enumerable: true,
    get: function() {
        return EmployeeService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _client = require("@prisma/client");
const _codetemplateservice = require("../code-template/code-template.service");
const _codetemplateenums = require("../code-template/code-template.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let EmployeeService = class EmployeeService {
    async create(createDto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        if (createDto.identityNumber && tenantId) {
            const existingTc = await this.prisma.employee.findFirst({
                where: {
                    identityNumber: createDto.identityNumber,
                    tenantId
                }
            });
            if (existingTc) {
                throw new _common.BadRequestException('Bu TC Kimlik No ile kayıtlı employee var');
            }
        }
        if (!createDto.employeeCode) {
            try {
                createDto.employeeCode = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.PERSONNEL);
            } catch (error) {
                throw new Error('Employee kodu girilmeli veya otomatik kod şablonu tanımlanmalı');
            }
        }
        const finalTenantId = createDto.tenantId ?? tenantId;
        if (finalTenantId) {
            const existingKod = await this.prisma.employee.findFirst({
                where: {
                    employeeCode: createDto.employeeCode,
                    tenantId: finalTenantId
                }
            });
            if (existingKod) {
                throw new _common.BadRequestException('Bu employee kodu kullanılıyor');
            }
        }
        const data = {
            employeeCode: createDto.employeeCode,
            identityNumber: createDto.identityNumber,
            firstName: createDto.firstName,
            lastName: createDto.lastName,
            phone: createDto.phone,
            email: createDto.email,
            address: createDto.address,
            city: createDto.il,
            district: createDto.district,
            position: createDto.pozisyon,
            department: createDto.department,
            salary: createDto.salary,
            salaryDay: createDto.salaryGunu,
            socialSecurityNo: createDto.sgkNo,
            iban: createDto.ibanNo,
            notes: createDto.notes,
            ...finalTenantId != null && {
                tenantId: finalTenantId
            },
            createdBy: userId
        };
        if (createDto.birthDate) {
            data.birthDate = new Date(createDto.birthDate);
        }
        if (createDto.startDate) {
            data.startDate = new Date(createDto.startDate);
        }
        if (createDto.endDate) {
            data.endDate = new Date(createDto.endDate);
        }
        const created = await this.prisma.employee.create({
            data,
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            }
        });
        // Update code template counter
        await this.codeTemplateService.saveLastCode(_codetemplateenums.ModuleType.PERSONNEL, created.employeeCode);
        return created;
    }
    async findAll(isActive, department) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (department) {
            where.department = department;
        }
        return this.prisma.employee.findMany({
            where,
            include: {
                _count: {
                    select: {
                        payments: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const employee = await this.prisma.employee.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                payments: {
                    include: {
                        cashbox: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    take: 50
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            }
        });
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        return employee;
    }
    async update(id, updateDto, userId) {
        const existing = await this.prisma.employee.findUnique({
            where: {
                id
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Employee not found');
        }
        const updateData = {
            employeeCode: updateDto.employeeCode,
            identityNumber: updateDto.identityNumber,
            firstName: updateDto.firstName,
            lastName: updateDto.lastName,
            phone: updateDto.phone,
            email: updateDto.email,
            address: updateDto.address,
            city: updateDto.il,
            district: updateDto.district,
            position: updateDto.pozisyon,
            department: updateDto.department,
            salary: updateDto.salary,
            salaryDay: updateDto.salaryGunu,
            socialSecurityNo: updateDto.sgkNo,
            iban: updateDto.ibanNo,
            notes: updateDto.notes,
            updatedBy: userId
        };
        if (updateDto.birthDate) {
            updateData.birthDate = new Date(updateDto.birthDate);
        }
        if (updateDto.startDate) {
            updateData.startDate = new Date(updateDto.startDate);
        }
        if (updateDto.endDate) {
            updateData.endDate = new Date(updateDto.endDate);
        }
        return this.prisma.employee.update({
            where: {
                id
            },
            data: updateData,
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            }
        });
    }
    async remove(id) {
        const employee = await this.prisma.employee.findUnique({
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
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        if (employee._count.payments > 0) {
            throw new _common.BadRequestException('Bu employeee ait ödeme kayıtları var. Önce bunları silmeniz gerekir.');
        }
        return this.prisma.employee.delete({
            where: {
                id
            }
        });
    }
    // Ödeme işlemleri
    async createOdeme(createOdemeDto, userId) {
        const employee = await this.prisma.employee.findUnique({
            where: {
                id: createOdemeDto.employeeId
            }
        });
        if (!employee) {
            throw new _common.NotFoundException('Employee not found');
        }
        if (!employee.isActive) {
            throw new _common.BadRequestException('Pasif employeee ödeme yapılamaz');
        }
        // Kasa varsa kontrol et
        if (createOdemeDto.cashboxId) {
            const cashbox = await this.prisma.cashbox.findUnique({
                where: {
                    id: createOdemeDto.cashboxId
                }
            });
            if (!cashbox || !cashbox.isActive) {
                throw new _common.NotFoundException('Valid cashbox not found');
            }
        }
        return this.prisma.$transaction(async (prisma)=>{
            const date = createOdemeDto.date ? new Date(createOdemeDto.date) : new Date();
            // Ödeme kaydı oluştur
            const odeme = await prisma.employeePayment.create({
                data: {
                    employeeId: createOdemeDto.employeeId,
                    type: createOdemeDto.tip,
                    amount: createOdemeDto.amount,
                    date: date,
                    period: createOdemeDto.donem,
                    notes: createOdemeDto.notes,
                    cashboxId: createOdemeDto.cashboxId,
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
                            fullName: true,
                            username: true
                        }
                    }
                }
            });
            // Employee bakiyesini güncelle
            // Bakiye mantığı: Pozitif bakiye = Employeee ödenecek, Negatif bakiye = Employeeden alınacak (fazla ödeme)
            let yeniBakiye = Number(employee.balance);
            switch(createOdemeDto.tip){
                case _client.EmployeePaymentType.ENTITLEMENT:
                    // Hak ediş tanımlandı -> employeein alacağı artar (bakiye artar)
                    yeniBakiye += createOdemeDto.amount;
                    break;
                case _client.EmployeePaymentType.SALARY:
                case _client.EmployeePaymentType.BONUS:
                case _client.EmployeePaymentType.ADVANCE:
                    // Ödeme yapıldı -> employeein alacağı azalır (bakiye azalır)
                    yeniBakiye -= createOdemeDto.amount;
                    break;
                case _client.EmployeePaymentType.DEDUCTION:
                    // Kesinti -> employeein alacağı artar (ödenmeyecek quantity artar)
                    yeniBakiye += createOdemeDto.amount;
                    break;
                case _client.EmployeePaymentType.ALLOCATION:
                    // Zimmet -> employeein borcu artar (bakiye azalır)
                    yeniBakiye -= createOdemeDto.amount;
                    break;
                case _client.EmployeePaymentType.ALLOCATION_RETURN:
                    // Zimmet iadesi -> employeein borcu azalır (bakiye artar)
                    yeniBakiye += createOdemeDto.amount;
                    break;
            }
            await prisma.employee.update({
                where: {
                    id: createOdemeDto.employeeId
                },
                data: {
                    balance: yeniBakiye
                }
            });
            // Kasadan ödendi ise kasa bakiyesini güncelle
            if (createOdemeDto.cashboxId) {
                const cashbox = await prisma.cashbox.findUnique({
                    where: {
                        id: createOdemeDto.cashboxId
                    }
                });
                if (cashbox) {
                    const yeniKasaBakiye = createOdemeDto.tip === _client.EmployeePaymentType.ALLOCATION_RETURN ? Number(cashbox.balance) + createOdemeDto.amount // Zimmet iadesi -> kasa artar
                     : Number(cashbox.balance) - createOdemeDto.amount; // Ödeme -> kasa azalır
                    if (yeniKasaBakiye < 0 && createOdemeDto.tip !== _client.EmployeePaymentType.ALLOCATION_RETURN) {
                        throw new _common.BadRequestException('Kasada yeterli bakiye yok');
                    }
                    await prisma.cashbox.update({
                        where: {
                            id: createOdemeDto.cashboxId
                        },
                        data: {
                            balance: yeniKasaBakiye
                        }
                    });
                }
            }
            return odeme;
        });
    }
    async getOdemeler(employeeId) {
        return this.prisma.employeePayment.findMany({
            where: {
                employeeId: employeeId
            },
            include: {
                cashbox: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async getStats(department, isActive) {
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (department) {
            where.department = department;
        }
        const [employeeler, toplamMaas, departmentlar] = await Promise.all([
            this.prisma.employee.count({
                where
            }),
            this.prisma.employee.aggregate({
                where,
                _sum: {
                    salary: true,
                    balance: true
                }
            }),
            this.prisma.employee.groupBy({
                by: [
                    'department'
                ],
                where,
                _count: true,
                _sum: {
                    salary: true
                }
            })
        ]);
        return {
            toplamEmployee: employeeler,
            toplamMaasBordro: toplamMaas._sum.salary || 0,
            toplamBakiye: toplamMaas._sum.balance || 0,
            departmentlar: departmentlar.map((d)=>({
                    department: d.department || 'Belirtilmemiş',
                    employeeSayisi: d._count,
                    toplamMaas: d._sum.salary || 0
                }))
        };
    }
    async getDepartmanlar() {
        const result = await this.prisma.employee.groupBy({
            by: [
                'department'
            ],
            _count: true
        });
        return result.filter((r)=>r.department).map((r)=>({
                department: r.department,
                employeeSayisi: r._count
            }));
    }
    constructor(prisma, tenantResolver, codeTemplateService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
    }
};
EmployeeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_codetemplateservice.CodeTemplateService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], EmployeeService);

//# sourceMappingURL=employee.service.js.map