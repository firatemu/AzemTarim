"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAccountService", {
    enumerable: true,
    get: function() {
        return B2bAccountService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _excelonesheetutil = require("../../../common/utils/excel-one-sheet.util");
const _prismaservice = require("../../../common/prisma.service");
const _b2bcartorderservice = require("./b2b-cart-order.service");
const _b2bfifoservice = require("./b2b-fifo.service");
const _b2briskcheckservice = require("./b2b-risk-check.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bAccountService = class B2bAccountService {
    /** Tüm hareketler — FIFO tahsılata göre doğru sıra için tarih + id ile sıralı */ async fetchMovementsForFifo(tenantId, customerId) {
        return this.prisma.b2BAccountMovement.findMany({
            where: {
                tenantId,
                customerId
            },
            orderBy: [
                {
                    date: 'asc'
                },
                {
                    id: 'asc'
                }
            ],
            select: {
                id: true,
                date: true,
                type: true,
                debit: true,
                credit: true
            }
        });
    }
    async getSummary(tenantId, customerId) {
        const customer = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                id: true,
                name: true,
                email: true,
                vatDays: true,
                erpAccountId: true
            }
        });
        if (!customer) {
            throw new _common.NotFoundException('Musteri bulunamadi');
        }
        const account = await this.prisma.account.findFirst({
            where: {
                id: customer.erpAccountId,
                tenantId,
                deletedAt: null
            },
            select: {
                balance: true,
                creditLimit: true,
                creditStatus: true,
                title: true
            }
        });
        const overdueAgg = await this.prisma.b2BAccountMovement.aggregate({
            where: {
                tenantId,
                customerId,
                isPastDue: true
            },
            _sum: {
                debit: true,
                credit: true
            },
            _count: true
        });
        const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
        const fifoResult = this.fifo.calculateFifo(fifoInputs, customer.vatDays ?? 30);
        const fifoPastDueCount = fifoResult.movements.filter((m)=>m.isPastDue).length;
        const openOrders = await this.prisma.b2BOrder.count({
            where: {
                tenantId,
                customerId,
                status: {
                    in: [
                        _client.B2BOrderStatus.PENDING,
                        _client.B2BOrderStatus.APPROVED
                    ]
                }
            }
        });
        let cartPreviewBlocked = false;
        let cartPreviewReason = null;
        try {
            const cart = await this.cartOrder.getCartSummary(tenantId, customerId);
            if (cart.items.length > 0) {
                await this.risk.assertOrderAllowed(tenantId, customerId, cart.totals.totalFinalPrice);
            }
        } catch (e) {
            cartPreviewBlocked = true;
            cartPreviewReason = e instanceof Error ? e.message : 'Risk kontrolu basarisiz';
        }
        return {
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                vatDays: customer.vatDays
            },
            erpAccount: account ? {
                title: account.title,
                balance: new _client.Prisma.Decimal(account.balance).toString(),
                creditLimit: account.creditLimit != null ? new _client.Prisma.Decimal(account.creditLimit).toString() : null,
                creditStatus: account.creditStatus
            } : null,
            overdue: {
                pastDueLineCount: overdueAgg._count,
                sumDebit: (overdueAgg._sum.debit ?? new _client.Prisma.Decimal(0)).toString(),
                sumCredit: (overdueAgg._sum.credit ?? new _client.Prisma.Decimal(0)).toString()
            },
            fifo: {
                totalDebit: fifoResult.summary.totalDebit.toString(),
                totalCredit: fifoResult.summary.totalCredit.toString(),
                balance: fifoResult.summary.balance.toString(),
                overdueAmount: fifoResult.summary.overdueAmount.toString(),
                oldestOverdueDate: fifoResult.summary.oldestOverdueDate?.toISOString() ?? null,
                pastDueMovementCount: fifoPastDueCount
            },
            openOrdersCount: openOrders,
            placeOrderWithCurrentCart: {
                blocked: cartPreviewBlocked,
                reason: cartPreviewReason
            }
        };
    }
    async listMovements(tenantId, customerId, query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 25;
        const where = {
            tenantId,
            customerId,
            ...query.dateFrom || query.dateTo ? {
                date: {
                    ...query.dateFrom ? {
                        gte: new Date(query.dateFrom)
                    } : {},
                    ...query.dateTo ? {
                        lte: new Date(query.dateTo)
                    } : {}
                }
            } : {}
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.b2BAccountMovement.count({
                where
            }),
            this.prisma.b2BAccountMovement.findMany({
                where,
                orderBy: {
                    date: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            })
        ]);
        let rows = data;
        if (query.includeFifo) {
            const cust = await this.prisma.b2BCustomer.findFirst({
                where: {
                    id: customerId,
                    tenantId
                },
                select: {
                    vatDays: true
                }
            });
            const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
            const fr = this.fifo.calculateFifo(fifoInputs, cust?.vatDays ?? 30);
            const byId = new Map(fr.movements.map((m)=>[
                    m.id,
                    m
                ]));
            rows = data.map((row)=>{
                const f = byId.get(row.id);
                if (!f) {
                    return row;
                }
                return {
                    ...row,
                    fifoDueDate: f.dueDate ?? null,
                    fifoRemainingDebit: f.remainingInvoiceDebit != null ? f.remainingInvoiceDebit.toString() : null,
                    fifoIsPastDue: f.isPastDue
                };
            });
        }
        return {
            data: rows,
            meta: {
                total,
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize)
            }
        };
    }
    /** Portal: FIFO sütunlarıyla cari hareket Excel (en yeni önce, maxRows sınırlı) */ async exportMovementsXlsx(tenantId, customerId, query) {
        const maxRows = Math.min(query.maxRows ?? 5000, 10000);
        const where = {
            tenantId,
            customerId,
            ...query.dateFrom || query.dateTo ? {
                date: {
                    ...query.dateFrom ? {
                        gte: new Date(query.dateFrom)
                    } : {},
                    ...query.dateTo ? {
                        lte: new Date(query.dateTo)
                    } : {}
                }
            } : {}
        };
        const data = await this.prisma.b2BAccountMovement.findMany({
            where,
            orderBy: {
                date: 'desc'
            },
            take: maxRows
        });
        const cust = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                vatDays: true
            }
        });
        const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
        const fr = this.fifo.calculateFifo(fifoInputs, cust?.vatDays ?? 30);
        const byId = new Map(fr.movements.map((m)=>[
                m.id,
                m
            ]));
        const headers = [
            'Tarih',
            'Tip',
            'Aciklama',
            'Borc',
            'Alacak',
            'Bakiye',
            'FaturaNo',
            'FIFO vade',
            'FIFO kalan borc',
            'FIFO gecikme'
        ];
        const rows = data.map((row)=>{
            const f = byId.get(row.id);
            return [
                row.date.toISOString(),
                row.type,
                row.description ?? '',
                row.debit.toString(),
                row.credit.toString(),
                row.balance.toString(),
                row.erpInvoiceNo ?? '',
                f?.dueDate ? f.dueDate.toISOString() : '',
                f?.remainingInvoiceDebit != null ? f.remainingInvoiceDebit.toString() : '',
                f?.isPastDue ? 'Evet' : 'Hayir'
            ];
        });
        return (0, _excelonesheetutil.excelOneSheetBuffer)('B2B Hareketler', headers, rows);
    }
    /** Dashboard / sepet oncesi: limit ve risk durumu */ async getRiskSnapshot(tenantId, customerId) {
        const customer = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                erpAccountId: true,
                vatDays: true
            }
        });
        if (!customer) {
            throw new _common.NotFoundException('Musteri bulunamadi');
        }
        const account = await this.prisma.account.findFirst({
            where: {
                id: customer.erpAccountId,
                tenantId,
                deletedAt: null
            },
            select: {
                balance: true,
                creditLimit: true,
                creditStatus: true
            }
        });
        const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
        const fifoResult = this.fifo.calculateFifo(fifoInputs, customer.vatDays ?? 30);
        const overdueMovementCount = fifoResult.movements.filter((m)=>m.isPastDue).length;
        const blockedStatuses = [
            _client.RiskStatus.BLACK_LIST,
            _client.RiskStatus.IN_COLLECTION
        ];
        const creditBlocked = !!account?.creditStatus && blockedStatuses.includes(account.creditStatus);
        let overCreditAfterCart = false;
        try {
            const cart = await this.cartOrder.getCartSummary(tenantId, customerId);
            if (cart.items.length > 0 && account?.creditLimit != null) {
                const bal = new _client.Prisma.Decimal(account.balance);
                const lim = new _client.Prisma.Decimal(account.creditLimit);
                const exp = bal.add(cart.totals.totalFinalPrice);
                overCreditAfterCart = exp.gt(lim);
            }
        } catch  {
            overCreditAfterCart = true;
        }
        return {
            creditStatus: account?.creditStatus ?? null,
            balance: account?.balance != null ? new _client.Prisma.Decimal(account.balance).toString() : null,
            creditLimit: account?.creditLimit != null ? new _client.Prisma.Decimal(account.creditLimit).toString() : null,
            overdueMovementCount,
            fifoOverdueAmount: fifoResult.summary.overdueAmount.toString(),
            blocked: creditBlocked || overdueMovementCount > 0 || overCreditAfterCart,
            reasons: {
                creditStatusBlocked: creditBlocked,
                hasOverdueMovements: overdueMovementCount > 0,
                wouldExceedCreditWithCart: overCreditAfterCart
            }
        };
    }
    constructor(prisma, risk, cartOrder, fifo){
        this.prisma = prisma;
        this.risk = risk;
        this.cartOrder = cartOrder;
        this.fifo = fifo;
    }
};
B2bAccountService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2briskcheckservice.B2bRiskCheckService === "undefined" ? Object : _b2briskcheckservice.B2bRiskCheckService,
        typeof _b2bcartorderservice.B2bCartOrderService === "undefined" ? Object : _b2bcartorderservice.B2bCartOrderService,
        typeof _b2bfifoservice.B2BFifoService === "undefined" ? Object : _b2bfifoservice.B2BFifoService
    ])
], B2bAccountService);

//# sourceMappingURL=b2b-account.service.js.map