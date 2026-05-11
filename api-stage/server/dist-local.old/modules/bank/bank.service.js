"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankService", {
    enumerable: true,
    get: function() {
        return BankService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BankService = class BankService {
    // ============ BANK CRUD ============
    async create(createBankDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        return this.prisma.bank.create({
            data: {
                ...createBankDto,
                tenantId
            },
            include: {
                accounts: true
            }
        });
    }
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.bank.findMany({
            where: {
                tenantId
            },
            include: {
                accounts: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        balance: true,
                        accountNo: true,
                        iban: true
                    }
                },
                _count: {
                    select: {
                        accounts: true
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
        const bank = await this.prisma.bank.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                accounts: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        loans: {
                            include: {
                                plans: true
                            }
                        }
                    }
                }
            }
        });
        if (!bank) {
            throw new _common.NotFoundException(`Bank with ID ${id} not found`);
        }
        return bank;
    }
    async update(id, updateBankDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        await this.findOne(id);
        return this.prisma.bank.update({
            where: {
                id,
                tenantId
            },
            data: updateBankDto
        });
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const bank = await this.findOne(id);
        const accountIds = bank.accounts.map((h)=>h.id);
        if (accountIds.length > 0) {
            const [hareketCount, havaleCount, tahsilatCount, salaryCount, loanCount] = await Promise.all([
                this.prisma.bankAccountMovement.count({
                    where: {
                        bankAccountId: {
                            in: accountIds
                        },
                        tenantId: tenantId ?? undefined
                    }
                }),
                this.prisma.bankTransfer.count({
                    where: {
                        bankAccountId: {
                            in: accountIds
                        },
                        tenantId: tenantId ?? undefined
                    }
                }),
                this.prisma.collection.count({
                    where: {
                        bankAccountId: {
                            in: accountIds
                        },
                        tenantId: tenantId ?? undefined
                    }
                }),
                this.prisma.salaryPaymentDetail.count({
                    where: {
                        bankAccountId: {
                            in: accountIds
                        },
                        tenantId: tenantId ?? undefined
                    }
                }),
                this.prisma.bankLoan.count({
                    where: {
                        bankAccountId: {
                            in: accountIds
                        },
                        tenantId: tenantId ?? undefined
                    }
                })
            ]);
            if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || salaryCount > 0 || loanCount > 0) {
                throw new _common.BadRequestException('Bank üzerinde işlem görmüş hesaplar bulunduğu için silinemez. Pasife alabilirsiniz.');
            }
        }
        return this.prisma.bank.delete({
            where: {
                id,
                tenantId
            }
        });
    }
    // ============ HESAP İŞLEMLERİ ============
    async createAccount(bankId, createHesapDto) {
        await this.findOne(bankId);
        return this.prisma.bankAccount.create({
            data: {
                bankId,
                code: createHesapDto.code || `ACC-${Date.now()}`,
                name: createHesapDto.name,
                accountNo: createHesapDto.accountNo,
                iban: createHesapDto.iban,
                type: createHesapDto.type,
                commissionRate: createHesapDto.commissionRate,
                creditLimit: createHesapDto.creditLimit,
                cardLimit: createHesapDto.cardLimit,
                statementDay: createHesapDto.statementDay,
                paymentDueDay: createHesapDto.paymentDueDay,
                terminalNo: createHesapDto.terminalNo,
                isActive: createHesapDto.isActive ?? true
            }
        });
    }
    async findAccount(accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const hesap = await this.prisma.bankAccount.findUnique({
            where: {
                id: accountId
            },
            include: {
                bank: true
            }
        });
        if (!hesap || hesap.bank.tenantId !== tenantId) {
            throw new _common.NotFoundException('Bank account not found');
        }
        return hesap;
    }
    async updateAccount(accountId, updateHesapDto) {
        await this.findAccount(accountId);
        return this.prisma.bankAccount.update({
            where: {
                id: accountId
            },
            data: {
                name: updateHesapDto.name,
                accountNo: updateHesapDto.accountNo,
                iban: updateHesapDto.iban,
                isActive: updateHesapDto.isActive,
                commissionRate: updateHesapDto.commissionRate,
                creditLimit: updateHesapDto.creditLimit,
                cardLimit: updateHesapDto.cardLimit,
                statementDay: updateHesapDto.statementDay,
                paymentDueDay: updateHesapDto.paymentDueDay,
                terminalNo: updateHesapDto.terminalNo
            }
        });
    }
    async removeAccount(accountId) {
        const hesap = await this.findAccount(accountId);
        const [hareketCount, havaleCount, tahsilatCount, salaryCount, loanCount] = await Promise.all([
            this.prisma.bankAccountMovement.count({
                where: {
                    bankAccountId: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(hesap.bank.tenantId || undefined)
                }
            }),
            this.prisma.bankTransfer.count({
                where: {
                    bankAccountId: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(hesap.bank.tenantId || undefined)
                }
            }),
            this.prisma.collection.count({
                where: {
                    bankAccountId: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(hesap.bank.tenantId || undefined)
                }
            }),
            this.prisma.salaryPaymentDetail.count({
                where: {
                    bankAccountId: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(hesap.bank.tenantId || undefined)
                }
            }),
            this.prisma.bankLoan.count({
                where: {
                    bankAccountId: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(hesap.bank.tenantId || undefined)
                }
            })
        ]);
        if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || salaryCount > 0 || loanCount > 0) {
            return this.prisma.bankAccount.update({
                where: {
                    id: accountId
                },
                data: {
                    isActive: false
                }
            });
        }
        return this.prisma.bankAccount.delete({
            where: {
                id: accountId
            }
        });
    }
    // ============ MOVEMENT OPERATIONS ============
    async createMovement(accountId, dto) {
        const hesap = await this.findAccount(accountId);
        const currentBalance = new _library.Decimal(hesap.balance.toString());
        const amount = new _library.Decimal(dto.amount);
        const yeniBakiye = dto.movementType === _client.BankMovementType.INCOMING ? currentBalance.add(amount) : currentBalance.sub(amount);
        return this.prisma.$transaction(async (tx)=>{
            const hareket = await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: dto.movementType,
                    movementSubType: dto.movementSubType,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: dto.notes,
                    referenceNo: dto.referenceNo,
                    date: dto.date ? new Date(dto.date) : new Date()
                }
            });
            await tx.bankAccount.update({
                where: {
                    id: accountId
                },
                data: {
                    balance: yeniBakiye
                }
            });
            return hareket;
        });
    }
    async createPosMovement(accountId, dto) {
        const hesap = await this.findAccount(accountId);
        if (hesap.type !== _client.BankAccountType.POS) {
            throw new _common.BadRequestException('Sadece POS hesapları için POS hareketi oluşturulabilir');
        }
        const currentBalance = new _library.Decimal(hesap.balance.toString());
        const amount = new _library.Decimal(dto.amount);
        const komisyonOrani = new _library.Decimal(hesap.commissionRate?.toString() || '0');
        const komisyonTutar = amount.mul(komisyonOrani).div(100);
        const netTutar = amount.sub(komisyonTutar);
        const yeniBakiye = currentBalance.add(netTutar);
        return this.prisma.$transaction(async (tx)=>{
            const hareket = await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: _client.BankMovementType.INCOMING,
                    movementSubType: _client.BankMovementSubType.POS_COLLECTION,
                    amount: amount,
                    commissionRate: komisyonOrani,
                    commissionAmount: komisyonTutar,
                    netAmount: netTutar,
                    balance: yeniBakiye,
                    notes: dto.notes || `POS Collection - Komisyon: %${komisyonOrani}`,
                    referenceNo: dto.referenceNo,
                    date: dto.date ? new Date(dto.date) : new Date()
                }
            });
            await tx.bankAccount.update({
                where: {
                    id: accountId
                },
                data: {
                    balance: yeniBakiye
                }
            });
            return hareket;
        });
    }
    async getMovements(accountId, options) {
        await this.findAccount(accountId);
        const where = {
            bankAccountId: accountId
        };
        if (options?.startDate || options?.endDate) {
            where.date = {};
            if (options.startDate) where.date.gte = options.startDate;
            if (options.endDate) where.date.lte = options.endDate;
        }
        return this.prisma.bankAccountMovement.findMany({
            where,
            orderBy: {
                date: 'desc'
            },
            take: options?.limit || 50
        });
    }
    // ============ LOAN OPERATIONS ============
    async useLoan(accountId, dto) {
        const hesap = await this.findAccount(accountId);
        if (hesap.type !== _client.BankAccountType.LOAN) {
            throw new _common.BadRequestException('Sadece KREDİ hesapları için loan kullanımı oluşturulabilir');
        }
        const amount = new _library.Decimal(dto.amount);
        const installmentCount = dto.installmentCount;
        const startDate = new Date(dto.startDate);
        const firstInstallmentDate = new Date(dto.firstInstallmentDate);
        const installmentAmount = new _library.Decimal(dto.installmentAmount);
        const totalRepayment = installmentAmount.mul(installmentCount);
        const totalInterest = totalRepayment.sub(amount);
        const frequency = dto.paymentFrequency || 1;
        const plans = [];
        for(let i = 0; i < installmentCount; i++){
            const dueDate = new Date(firstInstallmentDate);
            dueDate.setMonth(dueDate.getMonth() + i * frequency);
            plans.push({
                installmentNo: i + 1,
                dueDate: dueDate,
                amount: installmentAmount,
                status: _client.CreditPlanStatus.PENDING
            });
        }
        return this.prisma.$transaction(async (tx)=>{
            const tenantId = hesap.bank.tenantId;
            const loan = await tx.bankLoan.create({
                data: {
                    bankAccountId: accountId,
                    amount: amount,
                    totalRepayment: totalRepayment,
                    totalInterest: totalInterest,
                    installmentCount: installmentCount,
                    startDate: startDate,
                    notes: dto.notes,
                    loanType: dto.loanType,
                    annualInterestRate: new _library.Decimal(dto.annualInterestRate),
                    paymentFrequency: dto.paymentFrequency || 1,
                    status: _client.LoanStatus.ACTIVE,
                    tenantId: tenantId,
                    plans: {
                        create: plans.map((plan)=>({
                                ...plan,
                                tenantId: tenantId
                            }))
                    }
                }
            });
            const yeniBakiye = new _library.Decimal(hesap.balance.toString()).add(amount);
            await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: accountId,
                    movementType: _client.BankMovementType.INCOMING,
                    movementSubType: _client.BankMovementSubType.LOAN_USAGE,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: `Loan Kullanımı - ${dto.loanType} - %${dto.annualInterestRate} Faiz`,
                    date: startDate
                }
            });
            await tx.bankAccount.update({
                where: {
                    id: accountId
                },
                data: {
                    balance: yeniBakiye
                }
            });
            return loan;
        });
    }
    async payInstallment(planId, dto) {
        return this.prisma.$transaction(async (tx)=>{
            const plan = await tx.bankLoanPlan.findUnique({
                where: {
                    id: planId
                },
                include: {
                    loan: {
                        include: {
                            bankAccount: true
                        }
                    }
                }
            });
            if (!plan) throw new _common.NotFoundException('Installment plan not found');
            const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();
            const amount = new _library.Decimal(dto.amount);
            const newPaidAmount = new _library.Decimal(plan.paidAmount.toString()).add(amount);
            const isFullyPaid = newPaidAmount.gte(plan.amount);
            await tx.bankLoanPlan.update({
                where: {
                    id: planId
                },
                data: {
                    paidAmount: newPaidAmount,
                    status: isFullyPaid ? _client.CreditPlanStatus.PAID : _client.CreditPlanStatus.PARTIALLY_PAID
                }
            });
            const currentBalance = new _library.Decimal(plan.loan.bankAccount.balance.toString());
            const yeniBakiye = currentBalance.sub(amount);
            await tx.bankAccountMovement.create({
                data: {
                    bankAccountId: plan.loan.bankAccountId,
                    movementType: _client.BankMovementType.OUTGOING,
                    movementSubType: _client.BankMovementSubType.LOAN_INSTALLMENT_PAYMENT,
                    amount: amount,
                    balance: yeniBakiye,
                    notes: dto.notes || `Loan Installment Ödemesi - Installment #${plan.installmentNo}`,
                    date: paymentDate
                }
            });
            await tx.bankAccount.update({
                where: {
                    id: plan.loan.bankAccountId
                },
                data: {
                    balance: yeniBakiye
                }
            });
            return {
                success: true
            };
        });
    }
    async getBanksSummary() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const banks = await this.prisma.bank.findMany({
            where: {
                tenantId,
                isActive: true
            },
            include: {
                accounts: {
                    where: {
                        isActive: true
                    },
                    select: {
                        id: true,
                        name: true,
                        accountNo: true,
                        iban: true,
                        type: true,
                        balance: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        return {
            bankalar: banks.map((bank)=>({
                    id: bank.id,
                    ad: bank.name,
                    hesaplar: bank.accounts.map((acc)=>({
                            id: acc.id,
                            hesapAdi: acc.name,
                            hesapNo: acc.accountNo,
                            iban: acc.iban,
                            hesapTipi: acc.type,
                            balance: acc.balance
                        }))
                }))
        };
    }
    async findAllAccounts() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.bankAccount.findMany({
            where: {
                bank: {
                    tenantId
                }
            },
            include: {
                bank: true
            }
        });
    }
    async getAllLoans() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.bankLoan.findMany({
            where: {
                bankAccount: {
                    bank: {
                        tenantId
                    }
                }
            },
            include: {
                bankAccount: {
                    include: {
                        bank: true
                    }
                },
                plans: true
            }
        });
    }
    async getLoans(accountId) {
        return this.prisma.bankLoan.findMany({
            where: {
                bankAccountId: accountId
            },
            include: {
                plans: true
            }
        });
    }
    async getLoanDetail(loanId) {
        return this.prisma.bankLoan.findUnique({
            where: {
                id: loanId
            },
            include: {
                plans: true,
                bankAccount: {
                    include: {
                        bank: true
                    }
                }
            }
        });
    }
    async getUpcomingInstallments(startDate, endDate) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.bankLoanPlan.findMany({
            where: {
                dueDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    not: _client.CreditPlanStatus.PAID
                },
                loan: {
                    bankAccount: {
                        bank: {
                            tenantId
                        }
                    }
                }
            },
            include: {
                loan: {
                    include: {
                        bankAccount: {
                            include: {
                                bank: true
                            }
                        }
                    }
                }
            }
        });
    }
    async getUpcomingCreditCardDates(startDate, endDate) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.companyCreditCard.findMany({
            where: {
                paymentDueDate: {
                    gte: startDate,
                    lte: endDate
                },
                isActive: true,
                cashbox: {
                    tenantId
                }
            },
            include: {
                cashbox: true
            }
        });
    }
    async addLoanPlan(loanId, dto) {
        return this.prisma.bankLoanPlan.create({
            data: {
                loanId,
                amount: new _library.Decimal(dto.amount),
                dueDate: dto.dueDate,
                installmentNo: 99,
                status: _client.CreditPlanStatus.PENDING
            }
        });
    }
    async updateLoanPlan(id, dto) {
        return this.prisma.bankLoanPlan.update({
            where: {
                id
            },
            data: {
                amount: dto.amount ? new _library.Decimal(dto.amount) : undefined,
                dueDate: dto.dueDate
            }
        });
    }
    async deleteLoanPlan(id) {
        return this.prisma.bankLoanPlan.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
BankService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], BankService);

//# sourceMappingURL=bank.service.js.map