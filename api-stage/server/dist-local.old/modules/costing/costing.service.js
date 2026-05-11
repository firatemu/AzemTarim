"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CostingService", {
    enumerable: true,
    get: function() {
        return CostingService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../common/prisma.service");
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
let CostingService = class CostingService {
    async getLatestCosts(query) {
        const { search, brand, mainCategory, subCategory, limit: limitParam, page: pageParam } = query;
        const parsedLimit = typeof limitParam === 'number' && !Number.isNaN(limitParam) ? limitParam : Number(limitParam);
        const parsedPage = typeof pageParam === 'number' && !Number.isNaN(pageParam) ? pageParam : Number(pageParam);
        const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.max(parsedLimit, 1), 500) : 100;
        const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const skip = (page - 1) * limit;
        const tenantId = await this.tenantResolver.resolveForQuery();
        const productWhere = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        if (search?.trim()) {
            const term = search.trim();
            productWhere.OR = [
                {
                    code: {
                        contains: term,
                        mode: 'insensitive'
                    }
                },
                {
                    name: {
                        contains: term,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (brand) {
            productWhere.brand = {
                equals: brand
            };
        }
        if (mainCategory) {
            productWhere.mainCategory = {
                equals: mainCategory
            };
        }
        if (subCategory) {
            productWhere.subCategory = {
                equals: subCategory
            };
        }
        const [total, stocks] = await this.prisma.$transaction([
            this.prisma.product.count({
                where: productWhere
            }),
            this.prisma.product.findMany({
                where: productWhere,
                select: {
                    id: true,
                    code: true,
                    name: true,
                    brand: true,
                    mainCategory: true,
                    subCategory: true
                },
                orderBy: {
                    code: 'asc'
                },
                skip,
                take: limit
            })
        ]);
        if (stocks.length === 0) {
            return {
                data: [],
                total,
                page,
                limit
            };
        }
        const productIds = stocks.map((stock)=>stock.id);
        const histories = await this.prisma.productCostHistory.findMany({
            where: {
                productId: {
                    in: productIds
                },
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                computedAt: 'desc'
            }
        });
        const latestHistoryMap = new Map();
        for (const history of histories){
            if (!latestHistoryMap.has(history.productId)) {
                latestHistoryMap.set(history.productId, history);
            }
        }
        const data = stocks.map((stock)=>{
            const latest = latestHistoryMap.get(stock.id);
            return {
                productId: stock.id,
                code: stock.code,
                name: stock.name,
                brand: stock.brand,
                mainCategory: stock.mainCategory,
                subCategory: stock.subCategory,
                cost: latest ? Number(latest.cost) : null,
                computedAt: latest?.computedAt?.toISOString() ?? null,
                note: latest?.note ?? null
            };
        });
        return {
            data,
            total,
            page,
            limit
        };
    }
    async calculateWeightedAverageCost(productId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                id: true,
                code: true,
                name: true,
                brand: true,
                mainCategory: true,
                subCategory: true,
                tenantId: true
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found.');
        }
        // Tüm geçmiş hareketleri al (sadece ONAYLANDI değil, tüm statuslar)
        // Ancak silinmemiş faturaları al (deletedAt null olanlar)
        const purchaseLines = await this.prisma.invoiceItem.findMany({
            where: {
                productId: productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                invoice: {
                    invoiceType: _client.InvoiceType.PURCHASE,
                    status: _client.InvoiceStatus.APPROVED,
                    deletedAt: null,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            select: {
                quantity: true,
                unitPrice: true,
                amount: true,
                vatAmount: true,
                invoice: {
                    select: {
                        date: true,
                        invoiceNo: true
                    }
                }
            },
            orderBy: {
                invoice: {
                    date: 'asc'
                }
            }
        });
        const salesLines = await this.prisma.invoiceItem.findMany({
            where: {
                productId: productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                invoice: {
                    invoiceType: {
                        in: [
                            _client.InvoiceType.SALE,
                            _client.InvoiceType.PURCHASE_RETURN
                        ]
                    },
                    status: _client.InvoiceStatus.APPROVED,
                    deletedAt: null,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            select: {
                quantity: true,
                invoice: {
                    select: {
                        date: true,
                        invoiceNo: true
                    }
                }
            },
            orderBy: {
                invoice: {
                    date: 'asc'
                }
            }
        });
        const salesReturnLines = await this.prisma.invoiceItem.findMany({
            where: {
                productId: productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                invoice: {
                    invoiceType: _client.InvoiceType.SALES_RETURN,
                    status: _client.InvoiceStatus.APPROVED,
                    deletedAt: null,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            select: {
                quantity: true,
                unitPrice: true,
                amount: true,
                vatAmount: true,
                invoice: {
                    select: {
                        date: true,
                        invoiceNo: true
                    }
                }
            },
            orderBy: {
                invoice: {
                    date: 'asc'
                }
            }
        });
        // Tüm geçmiş product hareketlerini al (onaylanmış tüm hareketler)
        // Stok hareketleri genellikle faturalardan otomatik oluşturulur,
        // ancak manuel girişler, sayımlar vb. de olabilir
        const stockMovements = await this.prisma.productMovement.findMany({
            where: {
                productId: productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                movementType: true,
                quantity: true,
                unitPrice: true,
                createdAt: true,
                notes: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        const timeline = [];
        for (const line of purchaseLines){
            const qty = Number(line.quantity);
            if (!qty || qty <= 0) continue;
            const netAmount = Number(line.amount || 0);
            const vatAmount = Number(line.vatAmount || 0);
            const totalVatIncluded = netAmount + vatAmount; // Total amount including VAT
            const unitCost = qty ? totalVatIncluded / qty : 0;
            timeline.push({
                type: 'increase',
                date: line.invoice.date,
                quantity: qty,
                unitCost
            });
        }
        for (const line of salesLines){
            const qty = Number(line.quantity);
            if (!qty || qty <= 0) continue;
            timeline.push({
                type: 'decrease',
                date: line.invoice.date,
                quantity: qty
            });
        }
        for (const line of salesReturnLines){
            const qty = Number(line.quantity);
            if (!qty || qty <= 0) continue;
            const netAmount = Number(line.amount || 0);
            const vatAmount = Number(line.vatAmount || 0);
            const totalVatIncluded = netAmount + vatAmount; // Total amount including VAT
            const unitCost = qty ? totalVatIncluded / qty : 0;
            timeline.push({
                type: 'increase',
                date: line.invoice.date,
                quantity: qty,
                unitCost
            });
        }
        // Stok hareketlerini timeline'a ekle
        // Not: Stok hareketleri genellikle faturalardan otomatik oluşturulur
        // Bu yüzden sadece faturadan bağımsız hareketleri ekliyoruz
        // (notes'da "Invoice" kelimesi geçmeyenler veya manuel girişler)
        for (const movement of stockMovements){
            const qty = Number(movement.quantity);
            if (!qty || qty <= 0) continue;
            // Eğer hareket bir faturadan kaynaklanıyorsa (notes'da "Invoice" geçiyorsa),
            // bu hareket zaten fatura itemsinde dahil edilmiştir, bu yüzden atlıyoruz
            const notes = movement.notes?.toLowerCase() || '';
            if (notes.includes('invoice') || notes.includes('fatura:')) {
                continue; // Invoice kaynaklı hareketleri atla, zaten fatura itemsinde var
            }
            const unitCost = Number(movement.unitPrice) || 0;
            const date = movement.createdAt;
            // Hareket tipine göre increase veya decrease olarak ekle
            switch(movement.movementType){
                case _client.MovementType.ENTRY:
                case _client.MovementType.RETURN:
                case _client.MovementType.COUNT_SURPLUS:
                    // Stok artışı - birim fiyatı ile birlikte maliyete dahil et
                    if (unitCost > 0) {
                        timeline.push({
                            type: 'increase',
                            date,
                            quantity: qty,
                            unitCost
                        });
                    }
                    break;
                case _client.MovementType.EXIT:
                case _client.MovementType.SALE:
                case _client.MovementType.COUNT_SHORTAGE:
                    // Stok azalışı - maliyetten çıkar
                    timeline.push({
                        type: 'decrease',
                        date,
                        quantity: qty
                    });
                    break;
                case _client.MovementType.COUNT:
                    // Sayım hareketleri genellikle quantity düzeltmesi için kullanılır
                    // Birim fiyatı varsa artış, yoksa azalış olarak değerlendirilebilir
                    // Ancak sayım hareketleri genellikle maliyet hesaplamasına dahil edilmez
                    // Bu yüzden atlıyoruz veya birim fiyatı varsa artış olarak ekliyoruz
                    if (unitCost > 0) {
                        timeline.push({
                            type: 'increase',
                            date,
                            quantity: qty,
                            unitCost
                        });
                    }
                    break;
            }
        }
        if (timeline.length === 0) {
            await this.prisma.productCostHistory.create({
                data: {
                    productId: productId,
                    tenantId: product.tenantId,
                    cost: new _client.Prisma.Decimal(0),
                    note: 'No valid purchase movement found.',
                    brand: product.brand ?? undefined,
                    mainCategory: product.mainCategory ?? undefined,
                    subCategory: product.subCategory ?? undefined
                }
            });
            return {
                productId: product.id,
                code: product.code,
                name: product.name,
                cost: 0,
                method: 'WEIGHTED_AVERAGE',
                message: 'No valid purchase movement found.'
            };
        }
        timeline.sort((a, b)=>{
            const diff = a.date.getTime() - b.date.getTime();
            if (diff !== 0) return diff;
            if (a.type === b.type) return 0;
            return a.type === 'increase' ? -1 : 1;
        });
        let qtyOnHand = 0;
        let averageCost = 0;
        for (const event of timeline){
            if (event.type === 'increase') {
                const qty = event.quantity;
                const unitCost = event.unitCost;
                if (qty <= 0 || !Number.isFinite(unitCost)) {
                    continue;
                }
                if (qtyOnHand <= 0) {
                    averageCost = unitCost;
                    qtyOnHand = qty;
                } else {
                    const totalCost = averageCost * qtyOnHand + unitCost * qty;
                    qtyOnHand += qty;
                    averageCost = totalCost / qtyOnHand;
                }
            } else {
                qtyOnHand -= event.quantity;
                if (qtyOnHand <= 0) {
                    qtyOnHand = 0;
                    averageCost = 0;
                }
            }
        }
        const roundedCost = averageCost > 0 ? Number(averageCost.toFixed(4)) : 0;
        try {
            await this.prisma.productCostHistory.create({
                data: {
                    productId: productId,
                    tenantId: product.tenantId,
                    cost: new _client.Prisma.Decimal(roundedCost),
                    brand: product.brand ?? undefined,
                    mainCategory: product.mainCategory ?? undefined,
                    subCategory: product.subCategory ?? undefined
                }
            });
        } catch (error) {
            if (error instanceof _client.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // unique constraint violation if exists; continue
            } else {
                throw error;
            }
        }
        return {
            productId: product.id,
            code: product.code,
            name: product.name,
            cost: roundedCost,
            method: 'WEIGHTED_AVERAGE'
        };
    }
    /**
   * Toplu maliyet hesaplama (rate limit aşımını önlemek için tek istekte tüm products)
   */ async calculateWeightedAverageCostBulk(productIds) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const results = [];
        for (const productId of productIds){
            try {
                const result = await this.calculateWeightedAverageCost(productId);
                results.push({
                    productId: result.productId,
                    code: result.code,
                    name: result.name,
                    cost: result.cost,
                    status: 'success'
                });
            } catch (error) {
                const product = await this.prisma.product.findFirst({
                    where: {
                        id: productId,
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    },
                    select: {
                        code: true,
                        name: true
                    }
                });
                results.push({
                    productId,
                    code: product?.code ?? '-',
                    name: product?.name ?? '-',
                    cost: 0,
                    status: 'failed',
                    message: error?.message ?? 'Unexpected error'
                });
            }
        }
        return {
            results
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
CostingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CostingService);

//# sourceMappingURL=costing.service.js.map