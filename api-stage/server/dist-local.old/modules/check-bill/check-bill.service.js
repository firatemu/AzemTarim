"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillService", {
    enumerable: true,
    get: function() {
        return CheckBillService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _exceljs = /*#__PURE__*/ _interop_require_wildcard(require("exceljs"));
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _stagingutil = require("../../common/utils/staging.util");
const _statustransitionutil = require("./utils/status-transition.util");
const _accountbalanceservice = require("../account-balance/account-balance.service");
const _codetemplateservice = require("../code-template/code-template.service");
const _codetemplateenums = require("../code-template/code-template.enums");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CheckBillService = class CheckBillService {
    async findAll(filter) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const take = filter.take ?? 200;
        const skip = filter.skip ?? 0;
        const orderField = filter.sortBy ?? 'dueDate';
        const orderDir = filter.sortOrder ?? 'asc';
        const search = filter.search?.trim();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null,
            ...filter.type && {
                type: filter.type
            },
            ...filter.portfolioType && {
                portfolioType: filter.portfolioType
            },
            ...filter.status && {
                status: filter.status
            },
            ...filter.accountId && {
                accountId: filter.accountId
            },
            ...filter.isProtested !== undefined && {
                isProtested: filter.isProtested
            },
            ...filter.dueDateFrom || filter.dueDateTo ? {
                dueDate: {
                    ...filter.dueDateFrom && {
                        gte: new Date(filter.dueDateFrom)
                    },
                    ...filter.dueDateTo && {
                        lte: new Date(filter.dueDateTo)
                    }
                }
            } : {},
            ...search ? {
                OR: [
                    {
                        checkNo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        serialNo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        notes: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        account: {
                            title: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            } : {}
        };
        const [items, total] = await Promise.all([
            this.prisma.checkBill.findMany({
                where,
                include: {
                    account: {
                        select: {
                            title: true,
                            code: true
                        }
                    }
                },
                orderBy: {
                    [orderField]: orderDir
                },
                skip,
                take
            }),
            this.prisma.checkBill.count({
                where
            })
        ]);
        return {
            items,
            total,
            skip,
            take
        };
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const checkBill = await this.prisma.checkBill.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: true,
                journalItems: {
                    include: {
                        journal: true
                    }
                },
                endorsements: {
                    orderBy: {
                        sequence: 'asc'
                    }
                },
                collections: {
                    orderBy: {
                        collectionDate: 'desc'
                    }
                }
            }
        });
        if (!checkBill || checkBill.deletedAt) {
            throw new _common.NotFoundException('Document not found');
        }
        return checkBill;
    }
    async getUpcomingChecks(startDate, endDate) {
        console.log('[CheckBillService] getUpcomingChecks called with:', {
            startDate,
            endDate
        });
        const tenantId = await this.tenantResolver.resolveForQuery();
        console.log('[CheckBillService] getUpcomingChecks tenantId:', tenantId);
        /** String literals: SWC/Nest prod bundle’da enum referansları için güvenli */ const upcomingStatuses = [
            'IN_PORTFOLIO',
            'SENT_TO_BANK'
        ];
        return this.prisma.checkBill.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                dueDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    in: upcomingStatuses
                }
            },
            include: {
                account: {
                    select: {
                        title: true,
                        code: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    }
    async getEndorsements(checkBillId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillEndorsement.findMany({
            where: {
                checkBillId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                sequence: 'asc'
            }
        });
    }
    async getCollectionHistory(checkBillId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillCollection.findMany({
            where: {
                checkBillId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                collectionDate: 'desc'
            }
        });
    }
    async processAction(dto, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const result = await this.prisma.$transaction(async (tx)=>{
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: dto.checkBillId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    deletedAt: null
                }
            });
            if (!checkBill) throw new _common.NotFoundException('Document not found');
            (0, _statustransitionutil.assertLegalTransitionForPortfolio)(checkBill.status, dto.newStatus, checkBill.portfolioType);
            const movementTenantId = checkBill.tenantId || tenantId;
            if (!movementTenantId) throw new Error('Tenant ID çözümlenemedi');
            const isDebit = checkBill.portfolioType === _client.PortfolioType.DEBIT;
            const txAmount = Number(dto.transactionAmount ?? 0);
            // ── 1. Kalan Tutar Hesabı ─────────────────────────────────────────────────
            let newRemainingAmount = checkBill.remainingAmount;
            if (dto.newStatus === _client.CheckBillStatus.COLLECTED || dto.newStatus === _client.CheckBillStatus.PAID) {
                const calculated = Number(checkBill.remainingAmount) - txAmount;
                newRemainingAmount = new _library.Decimal(Math.max(0, calculated));
            } else if (dto.newStatus === _client.CheckBillStatus.PARTIAL_PAID) {
                const calculated = Number(checkBill.remainingAmount) - txAmount;
                newRemainingAmount = new _library.Decimal(Math.max(0, calculated));
            } else if (dto.newStatus === _client.CheckBillStatus.RETURNED) {
                newRemainingAmount = checkBill.amount; // orijinal tutara dön
            } else if (dto.newStatus === _client.CheckBillStatus.WRITTEN_OFF || dto.newStatus === _client.CheckBillStatus.CANCELLED) {
                newRemainingAmount = new _library.Decimal(0);
            }
            // ENDORSED, IN_BANK_COLLECTION, IN_BANK_GUARANTEE, WITHOUT_COVERAGE, PROTESTED → tutar değişmez
            await tx.checkBill.updateMany({
                where: {
                    id: dto.checkBillId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    status: dto.newStatus,
                    remainingAmount: newRemainingAmount,
                    updatedBy: userId
                }
            });
            const updated = await tx.checkBill.findFirst({
                where: {
                    id: dto.checkBillId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            // ── 2. Aksiyon Bazlı Hareketler ──────────────────────────────────────────
            // ── 2a. Bankaya Tahsilata / Teminata Ver → Hareket Yok ──────────────────
            if (dto.newStatus === _client.CheckBillStatus.IN_BANK_COLLECTION || dto.newStatus === _client.CheckBillStatus.IN_BANK_GUARANTEE) {
                // Finansal hareket oluşturulmaz ancak BankSubmission kaydı eklenir
                if (dto.bankAccountId) {
                    const submissionType = dto.newStatus === _client.CheckBillStatus.IN_BANK_COLLECTION ? 'COLLECTION' : 'GUARANTEE';
                    await tx.checkBillBankSubmission.create({
                        data: {
                            tenantId: movementTenantId,
                            checkBillId: checkBill.id,
                            bankAccountId: dto.bankAccountId,
                            submissionType,
                            submittedAt: new Date(dto.date),
                            status: 'SUBMITTED',
                            createdById: userId
                        }
                    });
                }
            } else if (dto.newStatus === _client.CheckBillStatus.ENDORSED) {
                if (dto.toAccountId) {
                    // Cari Hareket (Ekstre için)
                    await tx.accountMovement.create({
                        data: {
                            tenantId: movementTenantId,
                            accountId: dto.toAccountId,
                            type: _client.DebitCredit.DEBIT,
                            amount: checkBill.amount,
                            balance: 0,
                            documentType: _client.DocumentType.CHECK_EXIT,
                            documentNo: checkBill.checkNo || checkBill.id,
                            date: new Date(dto.date),
                            notes: dto.notes || '',
                            checkBillId: checkBill.id
                        }
                    });
                    await this.accountBalanceService.recalculateAccountBalance(dto.toAccountId, tx);
                }
            } else if (dto.newStatus === _client.CheckBillStatus.COLLECTED || dto.newStatus === _client.CheckBillStatus.PARTIAL_PAID || dto.newStatus === _client.CheckBillStatus.PAID) {
                const method = dto.paymentMethod ?? 'ELDEN';
                // Kasa hareketi
                if (method === 'KASA' && dto.cashboxId) {
                    const cashbox = await tx.cashbox.findFirst({
                        where: {
                            id: dto.cashboxId,
                            ...(0, _stagingutil.buildTenantWhereClause)(movementTenantId)
                        },
                        select: {
                            balance: true
                        }
                    });
                    if (cashbox) {
                        const movementType = isDebit ? _client.CashboxMovementType.PAYMENT : _client.CashboxMovementType.COLLECTION;
                        const delta = isDebit ? -txAmount : txAmount;
                        const newBalance = cashbox.balance.toNumber() + delta;
                        await tx.cashboxMovement.create({
                            data: {
                                tenantId: movementTenantId,
                                cashboxId: dto.cashboxId,
                                movementType,
                                amount: txAmount,
                                balance: newBalance,
                                notes: dto.notes || (isDebit ? 'Evrak Ödemesi' : 'Evrak Tahsilatı'),
                                date: new Date(dto.date),
                                accountId: checkBill.accountId,
                                documentType: 'CHECK_BILL',
                                documentNo: checkBill.id,
                                createdBy: userId
                            }
                        });
                        await tx.cashbox.updateMany({
                            where: {
                                id: dto.cashboxId,
                                ...(0, _stagingutil.buildTenantWhereClause)(movementTenantId)
                            },
                            data: {
                                balance: newBalance
                            }
                        });
                    }
                }
                // Banka hareketi
                if (method === 'BANKA' && dto.bankAccountId) {
                    const bankAccount = await tx.bankAccount.findFirst({
                        where: {
                            id: dto.bankAccountId,
                            ...(0, _stagingutil.buildTenantWhereClause)(movementTenantId)
                        },
                        select: {
                            balance: true
                        }
                    });
                    if (bankAccount) {
                        const movementType = isDebit ? _client.BankMovementType.OUTGOING : _client.BankMovementType.INCOMING;
                        const delta = isDebit ? -txAmount : txAmount;
                        const newBalance = bankAccount.balance.toNumber() + delta;
                        await tx.bankAccountMovement.create({
                            data: {
                                tenantId: movementTenantId,
                                bankAccountId: dto.bankAccountId,
                                movementType,
                                amount: new _client.Prisma.Decimal(txAmount),
                                balance: new _client.Prisma.Decimal(newBalance),
                                notes: dto.notes || (isDebit ? 'Evrak Ödemesi' : 'Evrak Tahsilatı'),
                                date: new Date(dto.date),
                                accountId: checkBill.accountId,
                                referenceNo: checkBill.checkNo || checkBill.id
                            }
                        });
                        await tx.bankAccount.updateMany({
                            where: {
                                id: dto.bankAccountId,
                                ...(0, _stagingutil.buildTenantWhereClause)(movementTenantId)
                            },
                            data: {
                                balance: newBalance
                            }
                        });
                    }
                }
                // Tahsilat Geçmişine (CheckBillCollection) kayıt atıyoruz
                await tx.checkBillCollection.create({
                    data: {
                        tenantId: movementTenantId,
                        checkBillId: checkBill.id,
                        collectedAmount: new _client.Prisma.Decimal(txAmount),
                        collectionDate: new Date(dto.date),
                        collectionMethod: dto.paymentMethod === 'KASA' ? 'CASH' : 'BANK_TRANSFER',
                        journalId: 'ghost-journal',
                        createdById: userId
                    }
                });
            } else if (dto.newStatus === _client.CheckBillStatus.RETURNED) {
                // Giriş hareketinin tersini oluşturarak bakiyeyi eski haline getir
                // CREDIT (Customer check) idi -> İade (Debit) olmalı
                // DEBIT (Company check) idi -> İade (Credit) olmalı
                const movType = checkBill.portfolioType === _client.PortfolioType.CREDIT ? _client.DebitCredit.DEBIT : _client.DebitCredit.CREDIT;
                await tx.accountMovement.create({
                    data: {
                        tenantId: movementTenantId,
                        accountId: checkBill.accountId,
                        type: movType,
                        amount: checkBill.amount,
                        balance: 0,
                        documentType: _client.DocumentType.RETURN,
                        documentNo: checkBill.checkNo || checkBill.id,
                        date: new Date(dto.date),
                        notes: dto.notes || '',
                        checkBillId: checkBill.id
                    }
                });
            }
            this.logger.log(`[tenantId=${tenantId}] [userId=${userId}] Evrak ${checkBill.id}: ${checkBill.status} → ${dto.newStatus} | yöntem: ${dto.paymentMethod ?? '-'}`);
            const needsRecalc = dto.newStatus === _client.CheckBillStatus.COLLECTED || dto.newStatus === _client.CheckBillStatus.PARTIAL_PAID || dto.newStatus === _client.CheckBillStatus.PAID || dto.newStatus === _client.CheckBillStatus.ENDORSED || dto.newStatus === _client.CheckBillStatus.RETURNED;
            return {
                updated,
                recalcAccountId: needsRecalc ? checkBill.accountId : null
            };
        });
        if (result.recalcAccountId) {
            await this.accountBalanceService.recalculateAccountBalance(result.recalcAccountId);
        }
        return result.updated;
    }
    async create(dto, checkBillJournalId, createdByUserId) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) throw new _common.BadRequestException('Kiracı bilgisi bulunamadı.');
        const checkBill = await this.prisma.$transaction(async (tx)=>{
            const cb = await tx.checkBill.create({
                data: {
                    tenantId: dto.tenantId || tenantId || undefined,
                    type: dto.type,
                    portfolioType: dto.portfolioType,
                    amount: dto.amount,
                    remainingAmount: dto.amount,
                    dueDate: new Date(dto.dueDate),
                    issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
                    accountId: dto.accountId,
                    bank: dto.bank,
                    branch: dto.branch,
                    accountNo: dto.accountNo,
                    checkNo: dto.checkNo,
                    serialNo: dto.serialNo,
                    status: _client.CheckBillStatus.IN_PORTFOLIO,
                    notes: dto.notes,
                    lastJournalId: checkBillJournalId,
                    createdBy: createdByUserId
                }
            });
            // ── Account Movement (Cari Hareket) Oluştur ─────────────────────────
            // CREDIT -> Biz çek aldık -> Cari borçlanır (CREDIT movement)
            // DEBIT -> Biz çek verdik -> Cari alacaklanır (DEBIT movement)
            if (dto.accountId) {
                const movType = dto.portfolioType === _client.PortfolioType.CREDIT ? _client.DebitCredit.CREDIT : _client.DebitCredit.DEBIT;
                const docType = dto.portfolioType === _client.PortfolioType.CREDIT ? _client.DocumentType.CHECK_ENTRY : _client.DocumentType.CHECK_EXIT;
                await tx.accountMovement.create({
                    data: {
                        tenantId: cb.tenantId || tenantId,
                        accountId: cb.accountId,
                        type: movType,
                        amount: cb.amount,
                        balance: 0,
                        documentType: docType,
                        documentNo: cb.checkNo || cb.id,
                        date: new Date(),
                        notes: cb.notes || '',
                        checkBillId: cb.id
                    }
                });
                // Bakiye güncelleme (tx içinde yapılmalı)
                await this.accountBalanceService.recalculateAccountBalance(cb.accountId, tx);
            }
            return cb;
        });
        // Numara şablonu sayaç güncelleme (başarılı kayıt sonrası)
        if (dto.checkNo) {
            this.codeTemplateService.saveLastCode(_codetemplateenums.ModuleType.CHECK_BILL_DOCUMENT, dto.checkNo).catch((err)=>{
                this.logger.warn(`Numara şablonu sayaç güncellenirken hata: ${err.message}`);
            });
        }
        return checkBill;
    }
    async update(id, dto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const existing = await this.prisma.checkBill.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!existing) {
            throw new Error('Evrak bulunamadı');
        }
        const dataToUpdate = {
            checkNo: dto.checkNo,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
            bank: dto.bank,
            branch: dto.branch,
            accountNo: dto.accountNo,
            notes: dto.notes
        };
        if (dto.amount !== undefined) {
            dataToUpdate.amount = dto.amount;
            const collected = Number(existing.amount) - Number(existing.remainingAmount);
            dataToUpdate.remainingAmount = dto.amount - collected;
            // Ilgili tum AccountMovement'lerin tutarlarini guncelle (Raw SQL ile stale client'i asalim)
            await this.prisma.$executeRawUnsafe(`UPDATE account_movements SET amount = $1, document_no = $2 WHERE check_bill_id = $3 AND "tenantId" = $4`, dto.amount, dto.checkNo || existing.checkNo || '—', id, tenantId);
        }
        await this.prisma.checkBill.updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: dataToUpdate
        });
        // Bakiyeleri tekrar hesapla (Raw SQL ile)
        const movements = await this.prisma.$queryRawUnsafe(`SELECT account_id FROM account_movements WHERE check_bill_id = $1 AND "tenantId" = $2`, id, tenantId);
        const accountIdsToRecalculate = movements.map((m)=>m.account_id);
        if (accountIdsToRecalculate.length > 0) {
            await this.accountBalanceService.recalculateMultipleBalances(accountIdsToRecalculate);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                deletedAt: new Date()
            }
        });
    }
    async getStatsSummary() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const base = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        const [byStatus, byType, byPortfolio, sumRemaining] = await Promise.all([
            this.prisma.checkBill.groupBy({
                by: [
                    'status'
                ],
                where: base,
                _count: {
                    _all: true
                }
            }),
            this.prisma.checkBill.groupBy({
                by: [
                    'type'
                ],
                where: base,
                _count: {
                    _all: true
                }
            }),
            this.prisma.checkBill.groupBy({
                by: [
                    'portfolioType'
                ],
                where: base,
                _count: {
                    _all: true
                }
            }),
            this.prisma.checkBill.aggregate({
                where: base,
                _sum: {
                    remainingAmount: true,
                    amount: true
                }
            })
        ]);
        return {
            byStatus,
            byType,
            byPortfolio,
            totalFaceAmount: sumRemaining._sum.amount,
            totalRemainingAmount: sumRemaining._sum.remainingAmount
        };
    }
    async getStatsAging() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const base = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d30 = new Date(today);
        d30.setDate(d30.getDate() + 30);
        const d60 = new Date(today);
        d60.setDate(d60.getDate() + 60);
        const d90 = new Date(today);
        d90.setDate(d90.getDate() + 90);
        const [overdue, bucket0_30, bucket31_60, bucket61_90, bucket90p] = await Promise.all([
            this.prisma.checkBill.aggregate({
                where: {
                    ...base,
                    dueDate: {
                        lt: today
                    }
                },
                _sum: {
                    remainingAmount: true
                },
                _count: true
            }),
            this.prisma.checkBill.aggregate({
                where: {
                    ...base,
                    dueDate: {
                        gte: today,
                        lte: d30
                    }
                },
                _sum: {
                    remainingAmount: true
                },
                _count: true
            }),
            this.prisma.checkBill.aggregate({
                where: {
                    ...base,
                    dueDate: {
                        gt: d30,
                        lte: d60
                    }
                },
                _sum: {
                    remainingAmount: true
                },
                _count: true
            }),
            this.prisma.checkBill.aggregate({
                where: {
                    ...base,
                    dueDate: {
                        gt: d60,
                        lte: d90
                    }
                },
                _sum: {
                    remainingAmount: true
                },
                _count: true
            }),
            this.prisma.checkBill.aggregate({
                where: {
                    ...base,
                    dueDate: {
                        gt: d90
                    }
                },
                _sum: {
                    remainingAmount: true
                },
                _count: true
            })
        ]);
        return {
            overdue,
            upcoming0to30Days: bucket0_30,
            upcoming31to60Days: bucket31_60,
            upcoming61to90Days: bucket61_90,
            upcoming90PlusDays: bucket90p
        };
    }
    /** Önümüzdeki 90 gün: vade tarihine göre kalan tutar tahmini */ async getStatsCashflow() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const base = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 90);
        const rows = await this.prisma.checkBill.groupBy({
            by: [
                'dueDate'
            ],
            where: {
                ...base,
                dueDate: {
                    gte: start,
                    lte: end
                },
                status: {
                    notIn: [
                        _client.CheckBillStatus.COLLECTED,
                        _client.CheckBillStatus.PAID,
                        _client.CheckBillStatus.WRITTEN_OFF,
                        _client.CheckBillStatus.CANCELLED
                    ]
                }
            },
            _sum: {
                remainingAmount: true
            }
        });
        return {
            from: start,
            to: end,
            byDueDate: rows
        };
    }
    async getOverdue() {
        console.log('[CheckBillService] getOverdue called');
        const tenantId = await this.tenantResolver.resolveForQuery();
        console.log('[CheckBillService] getOverdue tenantId:', tenantId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const excluded = [
            'COLLECTED',
            'PAID',
            'WRITTEN_OFF',
            'CANCELLED'
        ];
        return this.prisma.checkBill.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                dueDate: {
                    lt: today
                },
                status: {
                    notIn: excluded
                }
            },
            include: {
                account: {
                    select: {
                        title: true,
                        code: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    }
    async getAtRisk(minScore = 70) {
        console.log('[CheckBillService] getAtRisk called with minScore:', minScore);
        const tenantId = await this.tenantResolver.resolveForQuery();
        console.log('[CheckBillService] getAtRisk tenantId:', tenantId);
        return this.prisma.checkBill.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                riskScore: {
                    gte: minScore
                }
            },
            include: {
                account: {
                    select: {
                        title: true,
                        code: true
                    }
                }
            },
            orderBy: [
                {
                    riskScore: 'desc'
                },
                {
                    dueDate: 'asc'
                }
            ]
        });
    }
    async getTimeline(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const checkBill = await this.prisma.checkBill.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!checkBill) {
            throw new _common.NotFoundException('Document not found');
        }
        const [logs, endorsements, collections] = await Promise.all([
            this.prisma.checkBillLog.findMany({
                where: {
                    checkBillId: id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                orderBy: {
                    createdAt: 'asc'
                },
                include: {
                    performedBy: {
                        select: {
                            fullName: true
                        }
                    }
                }
            }),
            this.prisma.checkBillEndorsement.findMany({
                where: {
                    checkBillId: id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                orderBy: {
                    sequence: 'asc'
                }
            }),
            this.prisma.checkBillCollection.findMany({
                where: {
                    checkBillId: id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                orderBy: {
                    collectionDate: 'asc'
                }
            })
        ]);
        const events = [];
        for (const l of logs){
            events.push({
                at: l.createdAt.toISOString(),
                kind: 'LOG',
                title: l.actionType,
                payload: {
                    fromStatus: l.fromStatus,
                    toStatus: l.toStatus,
                    notes: l.notes,
                    by: l.performedBy?.fullName
                }
            });
        }
        for (const e of endorsements){
            events.push({
                at: e.endorsedAt.toISOString(),
                kind: 'ENDORSEMENT',
                title: `Ciro #${e.sequence}`,
                payload: {
                    fromAccountId: e.fromAccountId,
                    toAccountId: e.toAccountId
                }
            });
        }
        for (const c of collections){
            events.push({
                at: c.collectionDate.toISOString(),
                kind: 'COLLECTION',
                title: 'Tahsilat',
                payload: {
                    amount: c.collectedAmount,
                    method: c.collectionMethod
                }
            });
        }
        events.sort((a, b)=>a.at.localeCompare(b.at));
        return {
            checkBillId: id,
            events
        };
    }
    async getGlEntriesForCheckBill(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const checkBill = await this.prisma.checkBill.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!checkBill) {
            throw new _common.NotFoundException('Document not found');
        }
        const tid = checkBill.tenantId ?? tenantId ?? undefined;
        if (!tid) {
            return [];
        }
        return this.prisma.checkBillGlEntry.findMany({
            where: {
                checkBillId: id,
                tenantId: tid
            },
            orderBy: {
                accountingDate: 'desc'
            }
        });
    }
    async getDocuments(id) {
        const row = await this.findOne(id);
        return {
            checkBillId: id,
            attachmentUrls: row.attachmentUrls,
            tags: row.tags,
            internalRef: row.internalRef,
            externalRef: row.externalRef
        };
    }
    async bulkSoftDelete(checkBillIds, deletedBy) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (checkBillIds.length === 0) {
            return {
                ok: true,
                affected: 0
            };
        }
        // Tahsil edilmiş veya ödemesi yapılmış evraklar silinemez
        const { BadRequestException } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("@nestjs/common")));
        const blocked = await this.prisma.checkBill.findMany({
            where: {
                id: {
                    in: checkBillIds
                },
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                status: {
                    in: [
                        _client.CheckBillStatus.COLLECTED,
                        _client.CheckBillStatus.PAID
                    ]
                }
            },
            select: {
                id: true,
                checkNo: true,
                status: true
            }
        });
        if (blocked.length > 0) {
            const nos = blocked.map((b)=>b.checkNo || b.id).join(', ');
            throw new BadRequestException(`Tahsil edilmiş veya ödemesi yapılmış evraklar silinemez: ${nos}`);
        }
        const res = await this.prisma.checkBill.updateMany({
            where: {
                id: {
                    in: checkBillIds
                },
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            data: {
                deletedAt: new Date(),
                deletedBy
            }
        });
        return {
            ok: true,
            affected: res.count
        };
    }
    /** Excel (XLSX) formatında export; büyük listeler için take yüksek */ async exportExcel(filter) {
        const { items } = await this.findAll({
            ...filter,
            take: Math.min(filter.take ?? 10_000, 50_000),
            skip: filter.skip ?? 0
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Çek Senet Listesi');
        // Column headers
        worksheet.columns = [
            {
                header: 'Çek/Senet No',
                key: 'checkNo',
                width: 20
            },
            {
                header: 'Cari Kod',
                key: 'accountCode',
                width: 15
            },
            {
                header: 'Cari Ünvan',
                key: 'accountTitle',
                width: 30
            },
            {
                header: 'Banka',
                key: 'bank',
                width: 20
            },
            {
                header: 'Vade Tarihi',
                key: 'dueDate',
                width: 15
            },
            {
                header: 'Tutar',
                key: 'amount',
                width: 15
            },
            {
                header: 'Kalan Tutar',
                key: 'remainingAmount',
                width: 15
            },
            {
                header: 'Durum',
                key: 'status',
                width: 15
            },
            {
                header: 'Portföy Tipi',
                key: 'portfolioType',
                width: 12
            }
        ];
        // Header style
        worksheet.getRow(1).font = {
            bold: true,
            size: 11
        };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FFE0E0E0'
            }
        };
        // Data rows
        items.forEach((r)=>{
            worksheet.addRow({
                checkNo: r.checkNo || '',
                accountCode: r.account?.code || '',
                accountTitle: r.account?.title || '',
                bank: r.bank || '',
                dueDate: r.dueDate instanceof Date ? r.dueDate.toISOString().split('T')[0] : String(r.dueDate),
                amount: r.amount ? Number(r.amount) : 0,
                remainingAmount: r.remainingAmount ? Number(r.remainingAmount) : 0,
                status: r.status,
                portfolioType: r.portfolioType
            });
        });
        // Format amount columns
        [
            'F',
            'G'
        ].forEach((col)=>{
            worksheet.getColumn(col).numFmt = '#,##0.00';
        });
        return workbook.xlsx.writeBuffer();
    }
    constructor(prisma, tenantResolver, accountBalanceService, codeTemplateService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.accountBalanceService = accountBalanceService;
        this.codeTemplateService = codeTemplateService;
        this.logger = new _common.Logger(CheckBillService.name);
    }
};
CheckBillService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], CheckBillService);

//# sourceMappingURL=check-bill.service.js.map