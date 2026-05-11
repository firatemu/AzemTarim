"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReportingService", {
    enumerable: true,
    get: function() {
        return ReportingService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ReportingService = class ReportingService {
    async getOverview(query) {
        const range = this.resolveRange(query);
        const now = new Date();
        const faturaWhereBase = {
            deletedAt: null,
            date: {
                gte: range.startDate,
                lte: range.endDate
            }
        };
        const approvedSalesWhereBase = {
            ...faturaWhereBase,
            status: 'APPROVED'
        };
        const approvedPurchaseWhereBase = {
            ...faturaWhereBase,
            status: 'APPROVED'
        };
        const [satisSum, satisIadeSum, alisSum, alisIadeSum, collectionsSum, paymentsSum, expenseSum, receivableInvoices, payableInvoices, topCustomersRaw, topProductsRaw] = await Promise.all([
            this.prisma.invoice.aggregate({
                where: {
                    ...approvedSalesWhereBase,
                    invoiceType: 'SALE'
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.invoice.aggregate({
                where: {
                    ...approvedSalesWhereBase,
                    invoiceType: 'SALES_RETURN'
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.invoice.aggregate({
                where: {
                    ...approvedPurchaseWhereBase,
                    invoiceType: 'PURCHASE'
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.invoice.aggregate({
                where: {
                    ...approvedPurchaseWhereBase,
                    invoiceType: 'PURCHASE_RETURN'
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.collection.aggregate({
                where: {
                    type: 'COLLECTION',
                    date: {
                        gte: range.startDate,
                        lte: range.endDate
                    }
                },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.collection.aggregate({
                where: {
                    type: 'PAYMENT',
                    date: {
                        gte: range.startDate,
                        lte: range.endDate
                    }
                },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.expense.aggregate({
                where: {
                    date: {
                        gte: range.startDate,
                        lte: range.endDate
                    }
                },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.invoice.findMany({
                where: {
                    ...approvedSalesWhereBase,
                    invoiceType: {
                        in: [
                            'SALE',
                            'SALES_RETURN'
                        ]
                    },
                    payableAmount: {
                        gt: 0
                    }
                },
                select: {
                    id: true,
                    invoiceType: true,
                    payableAmount: true,
                    dueDate: true,
                    accountId: true
                }
            }),
            this.prisma.invoice.findMany({
                where: {
                    ...approvedPurchaseWhereBase,
                    invoiceType: {
                        in: [
                            'PURCHASE',
                            'PURCHASE_RETURN'
                        ]
                    },
                    payableAmount: {
                        gt: 0
                    }
                },
                select: {
                    id: true,
                    invoiceType: true,
                    payableAmount: true,
                    dueDate: true,
                    accountId: true
                }
            }),
            this.prisma.invoice.groupBy({
                by: [
                    'accountId'
                ],
                where: {
                    ...approvedSalesWhereBase,
                    invoiceType: 'SALE'
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    _all: true
                },
                orderBy: {
                    _sum: {
                        grandTotal: 'desc'
                    }
                },
                take: 5
            }),
            this.prisma.invoiceItem.groupBy({
                by: [
                    'productId'
                ],
                where: {
                    invoice: {
                        ...approvedSalesWhereBase,
                        invoiceType: 'SALE'
                    }
                },
                _sum: {
                    amount: true,
                    quantity: true
                },
                _count: {
                    _all: true
                },
                orderBy: {
                    _sum: {
                        amount: 'desc'
                    }
                },
                take: 5
            })
        ]);
        const totalSales = this.toNumber(satisSum._sum.grandTotal) - this.toNumber(satisIadeSum._sum.grandTotal);
        const totalPurchases = this.toNumber(alisSum._sum.grandTotal) - this.toNumber(alisIadeSum._sum.grandTotal);
        const collections = this.toNumber(collectionsSum._sum.amount);
        const payments = this.toNumber(paymentsSum._sum.amount);
        const expenses = this.toNumber(expenseSum._sum.amount);
        const grossProfit = totalSales - totalPurchases;
        const netCashFlow = collections - payments;
        const receivablesTotal = receivableInvoices.reduce((sum, fatura)=>sum + this.toNumber(fatura.payableAmount), 0);
        const receivablesOverdue = receivableInvoices.filter((fatura)=>fatura.dueDate && fatura.dueDate < now).reduce((sum, fatura)=>sum + this.toNumber(fatura.payableAmount), 0);
        const payablesTotal = payableInvoices.reduce((sum, fatura)=>sum + this.toNumber(fatura.payableAmount), 0);
        const payablesOverdue = payableInvoices.filter((fatura)=>fatura.dueDate && fatura.dueDate < now).reduce((sum, fatura)=>sum + this.toNumber(fatura.payableAmount), 0);
        const accountIds = topCustomersRaw.map((item)=>item.accountId);
        const [accounts, products] = await Promise.all([
            accountIds.length ? this.prisma.account.findMany({
                where: {
                    id: {
                        in: accountIds
                    }
                },
                select: {
                    id: true,
                    code: true,
                    title: true
                }
            }) : Promise.resolve([]),
            topProductsRaw.length ? this.prisma.product.findMany({
                where: {
                    id: {
                        in: topProductsRaw.map((item)=>item.productId)
                    }
                },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    unit: true
                }
            }) : Promise.resolve([])
        ]);
        const cariMap = new Map(accounts.map((cari)=>[
                cari.id,
                cari
            ]));
        const stokMap = new Map(products.map((product)=>[
                product.id,
                product
            ]));
        const topCustomers = topCustomersRaw.map((item)=>{
            const cari = cariMap.get(item.accountId);
            return {
                accountId: item.accountId,
                code: cari?.code ?? 'Bilinmiyor',
                title: cari?.title ?? 'Bilinmeyen Cari',
                totalAmount: this.toNumber(item._sum?.grandTotal),
                invoiceCount: item._count?._all ?? 0
            };
        });
        const topProducts = topProductsRaw.map((item)=>{
            const product = stokMap.get(item.productId);
            return {
                productId: item.productId,
                code: product?.code ?? 'Bilinmiyor',
                name: product?.name ?? 'Bilinmeyen Ürün',
                unit: product?.unit ?? '-',
                totalAmount: this.toNumber(item._sum?.amount),
                totalQuantity: item._sum?.quantity ?? 0,
                soldItemCount: item._count?._all ?? 0
            };
        });
        const lowStockItems = await this.getLowStockItems();
        return {
            range: {
                startDate: range.startDate.toISOString(),
                endDate: range.endDate.toISOString(),
                preset: range.preset
            },
            financialSummary: {
                totalSales,
                totalSalesCount: satisSum._count.id ?? 0,
                totalSalesReturns: this.toNumber(satisIadeSum._sum.grandTotal),
                totalPurchases,
                totalPurchaseCount: alisSum._count.id ?? 0,
                totalPurchaseReturns: this.toNumber(alisIadeSum._sum.grandTotal),
                grossProfit,
                collections,
                collectionsCount: collectionsSum._count.id ?? 0,
                payments,
                paymentsCount: paymentsSum._count.id ?? 0,
                expenses,
                expensesCount: expenseSum._count.id ?? 0,
                netCashFlow
            },
            receivables: {
                total: receivablesTotal,
                overdue: receivablesOverdue
            },
            payables: {
                total: payablesTotal,
                overdue: payablesOverdue
            },
            topCustomers,
            topProducts,
            lowStockItems
        };
    }
    async getLowStockItems() {
        const candidates = await this.prisma.product.findMany({
            where: {
                criticalQty: {
                    gt: 0
                }
            },
            select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                criticalQty: true
            },
            take: 25,
            orderBy: {
                criticalQty: 'desc'
            }
        });
        const itemsWithStock = await Promise.all(candidates.map(async (product)=>{
            const hareketler = await this.prisma.productMovement.groupBy({
                by: [
                    'movementType'
                ],
                where: {
                    productId: product.id
                },
                _sum: {
                    quantity: true
                }
            });
            const netMiktar = hareketler.reduce((total, hareket)=>{
                const quantity = hareket._sum.quantity ?? 0;
                switch(hareket.movementType){
                    case 'ENTRY':
                    case 'COUNT_SURPLUS':
                    case 'RETURN':
                    case 'CANCELLATION_ENTRY':
                        return total + quantity;
                    case 'EXIT':
                    case 'SALE':
                    case 'COUNT_SHORTAGE':
                    case 'CANCELLATION_EXIT':
                        return total - quantity;
                    default:
                        return total;
                }
            }, 0);
            const kritik = Number(product.criticalQty);
            return {
                productId: product.id,
                code: product.code,
                name: product.name,
                unit: product.unit,
                quantity: netMiktar,
                criticalQty: kritik,
                shortage: kritik - netMiktar
            };
        }));
        return itemsWithStock.filter((item)=>item.quantity <= item.criticalQty).sort((a, b)=>b.shortage - a.shortage).slice(0, 5);
    }
    toNumber(value) {
        if (!value) {
            return 0;
        }
        if (typeof value === 'number') {
            return value;
        }
        return Number(value.toString());
    }
    resolveRange(query) {
        const endDate = query.endDate ? new Date(query.endDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        let startDate;
        let preset = query.preset ?? 'last30';
        switch(preset){
            case 'today':
                {
                    startDate = new Date(endDate);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                }
            case 'thisMonth':
                {
                    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                    break;
                }
            case 'lastMonth':
                {
                    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
                    endDate.setTime(new Date(endDate.getFullYear(), endDate.getMonth(), 0, 23, 59, 59, 999).getTime());
                    break;
                }
            case 'last90':
                {
                    startDate = new Date(endDate);
                    startDate.setDate(startDate.getDate() - 89);
                    break;
                }
            case 'custom':
                {
                    if (!query.startDate || !query.endDate) {
                        throw new Error('Özel date aralığı için başlangıç ve bitiş tarihi gereklidir.');
                    }
                    startDate = new Date(query.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                }
            case 'last30':
            default:
                {
                    preset = 'last30';
                    startDate = new Date(endDate);
                    startDate.setDate(startDate.getDate() - 29);
                    break;
                }
        }
        return {
            startDate,
            endDate,
            preset
        };
    }
    async getSalespersonPerformance(query) {
        const range = this.resolveRange(query);
        const [salesRaw, collectionsRaw, salespersons] = await Promise.all([
            this.prisma.invoice.groupBy({
                by: [
                    'salesAgentId'
                ],
                where: {
                    invoiceType: 'SALE',
                    status: 'APPROVED',
                    date: {
                        gte: range.startDate,
                        lte: range.endDate
                    },
                    deletedAt: null,
                    salesAgentId: {
                        not: null
                    }
                },
                _sum: {
                    grandTotal: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.collection.groupBy({
                by: [
                    'salesAgentId'
                ],
                where: {
                    type: 'COLLECTION',
                    date: {
                        gte: range.startDate,
                        lte: range.endDate
                    },
                    salesAgentId: {
                        not: null
                    }
                },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            }),
            this.prisma.salesAgent.findMany({
                where: {
                    isActive: true
                },
                select: {
                    id: true,
                    fullName: true
                }
            })
        ]);
        const performanceData = salespersons.map((se)=>{
            const sales = salesRaw.find((s)=>s.salesAgentId === se.id);
            const collections = collectionsRaw.find((c)=>c.salesAgentId === se.id);
            return {
                salespersonId: se.id,
                fullName: se.fullName,
                totalSales: this.toNumber(sales?._sum?.grandTotal),
                salesCount: sales?._count?.id ?? 0,
                totalCollections: this.toNumber(collections?._sum?.amount),
                collectionsCount: collections?._count?.id ?? 0
            };
        });
        return {
            range: {
                startDate: range.startDate.toISOString(),
                endDate: range.endDate.toISOString(),
                preset: range.preset
            },
            performance: performanceData.sort((a, b)=>b.totalSales - a.totalSales)
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
ReportingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ReportingService);

//# sourceMappingURL=reporting.service.js.map