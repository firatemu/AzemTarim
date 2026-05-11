"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalaryPaymentService", {
    enumerable: true,
    get: function() {
        return SalaryPaymentService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SalaryPaymentService = class SalaryPaymentService {
    async createOdeme(dto, userId) {
        return this.prisma.$transaction(async (tx)=>{
            const plan = await tx.salaryPlan.findUnique({
                where: {
                    id: dto.salaryPlanId
                }
            });
            if (!plan) throw new _common.NotFoundException('Salary plan not found');
            const payment = await tx.salaryPayment.create({
                data: {
                    employeeId: dto.employeeId,
                    salaryPlanId: dto.salaryPlanId,
                    month: plan.month,
                    year: plan.year,
                    totalAmount: dto.amount,
                    paymentDate: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes,
                    createdBy: userId,
                    status: 'PENDING',
                    paymentDetails: {
                        create: dto.paymentDetails.map((d)=>({
                                cashboxId: d.cashboxId,
                                bankAccountId: d.bankAccountId,
                                amount: d.amount,
                                paymentMethod: d.paymentMethod,
                                referenceNo: d.referenceNo,
                                notes: d.notes
                            }))
                    }
                }
            });
            // Update plan status and paid amounts
            const newPaidAmount = new _library.Decimal(plan.paidAmount.toString()).add(new _library.Decimal(dto.amount.toString()));
            const newRemainingAmount = new _library.Decimal(plan.total.toString()).sub(newPaidAmount);
            let status = _client.SalaryStatus.PARTIALLY_PAID;
            if (newRemainingAmount.lte(0)) {
                status = _client.SalaryStatus.FULLY_PAID;
            }
            await tx.salaryPlan.update({
                where: {
                    id: dto.salaryPlanId
                },
                data: {
                    paidAmount: newPaidAmount,
                    remainingAmount: newRemainingAmount,
                    status: status
                }
            });
            // Update Employee balance
            await tx.employee.update({
                where: {
                    id: dto.employeeId
                },
                data: {
                    balance: {
                        decrement: dto.amount
                    }
                }
            });
            // Update Cashbox/Bank balances based on details
            for (const detail of dto.paymentDetails){
                if (detail.cashboxId) {
                    await tx.cashbox.update({
                        where: {
                            id: detail.cashboxId
                        },
                        data: {
                            balance: {
                                decrement: detail.amount
                            }
                        }
                    });
                } else if (detail.bankAccountId) {
                    await tx.bankAccount.update({
                        where: {
                            id: detail.bankAccountId
                        },
                        data: {
                            balance: {
                                decrement: detail.amount
                            }
                        }
                    });
                }
            }
            return payment;
        });
    }
    async getOdemelerByPlan(salaryPlanId) {
        return this.prisma.salaryPayment.findMany({
            where: {
                salaryPlanId
            },
            include: {
                paymentDetails: {
                    include: {
                        cashbox: {
                            select: {
                                name: true
                            }
                        },
                        bankAccount: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                createdByUser: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getOdemelerByPersonel(employeeId, year) {
        return this.prisma.salaryPayment.findMany({
            where: {
                employeeId,
                year
            },
            include: {
                paymentDetails: true,
                salaryPlan: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    // Placeholder for required methods in controller (to be implemented if needed)
    async exportExcel(year, month) {
        throw new _common.BadRequestException('Excel export not implemented yet');
    }
    async generateMakbuz(id) {
        throw new _common.BadRequestException('Makbuz generation not implemented yet');
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SalaryPaymentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SalaryPaymentService);

//# sourceMappingURL=salary-payment.service.js.map