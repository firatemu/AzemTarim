"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OtomuhasebeErpAdapter", {
    enumerable: true,
    get: function() {
        return OtomuhasebeErpAdapter;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _erpproductlivemetricsservice = require("../../../common/services/erp-product-live-metrics.service");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let OtomuhasebeErpAdapter = class OtomuhasebeErpAdapter {
    async getProducts(lastSyncedAt) {
        const started = Date.now();
        const where = {
            tenantId: this.tenantId,
            // Kategori veya marka placeholder'ları hariç tut
            isCategoryOnly: {
                not: true
            },
            isBrandOnly: {
                not: true
            }
        };
        if (lastSyncedAt) {
            where.OR = [
                {
                    updatedAt: {
                        gt: lastSyncedAt
                    }
                },
                {
                    createdAt: {
                        gt: lastSyncedAt
                    }
                },
                {
                    priceCards: {
                        some: {
                            updatedAt: {
                                gt: lastSyncedAt
                            }
                        }
                    }
                }
            ];
        }
        const products = await this.prisma.product.findMany({
            where,
            orderBy: {
                updatedAt: 'asc'
            }
        });
        const productIds = products.map((p)=>p.id);
        const priceByProduct = await this.liveMetrics.getListUnitPricesByProductIds(this.tenantId, productIds);
        const result = products.map((p)=>({
                erpProductId: p.id,
                stockCode: p.code,
                name: p.name,
                description: p.description ?? undefined,
                brand: p.brand ?? undefined,
                category: p.category ?? p.mainCategory ?? undefined,
                oemCode: p.oem ?? undefined,
                supplierCode: p.supplierCode ?? undefined,
                unit: p.unit ?? undefined,
                listPrice: priceByProduct.get(p.id) ?? 0,
                erpCreatedAt: p.createdAt,
                erpUpdatedAt: p.updatedAt
            }));
        this.logger.log(`getProducts tenant=${this.tenantId} count=${result.length} ms=${Date.now() - started}`);
        return result;
    }
    async getPrices(lastSyncedAt) {
        const started = Date.now();
        // 1. Fiyat kartı veya Ürün kartı (Stok kartı) değişenleri saptıyoruz
        const wherePrice = {
            tenantId: this.tenantId,
            isActive: true,
            type: {
                in: [
                    _client.PriceCardType.LIST,
                    _client.PriceCardType.SALE
                ]
            }
        };
        const whereProduct = {
            tenantId: this.tenantId
        };
        if (lastSyncedAt) {
            wherePrice.updatedAt = {
                gt: lastSyncedAt
            };
            whereProduct.updatedAt = {
                gt: lastSyncedAt
            };
        }
        // Değişen ürünlerin ID'lerini bulalım
        const [cardsByPriceUpdate, productsByUpdate] = await Promise.all([
            this.prisma.priceCard.findMany({
                where: wherePrice,
                select: {
                    productId: true
                }
            }),
            this.prisma.product.findMany({
                where: whereProduct,
                select: {
                    id: true
                }
            })
        ]);
        const affectedProductIds = new Set([
            ...cardsByPriceUpdate.map((c)=>c.productId),
            ...productsByUpdate.map((p)=>p.id)
        ]);
        if (affectedProductIds.size === 0) return [];
        // Etkilenen tüm ürünlerin GÜNCEL (en son) fiyatlarını çekiyoruz
        const latestCards = await this.prisma.priceCard.findMany({
            where: {
                tenantId: this.tenantId,
                productId: {
                    in: Array.from(affectedProductIds)
                },
                isActive: true,
                type: {
                    in: [
                        _client.PriceCardType.LIST,
                        _client.PriceCardType.SALE
                    ]
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        const distinctMap = new Map();
        for (const c of latestCards){
            if (!distinctMap.has(c.productId)) {
                distinctMap.set(c.productId, Number(c.price));
            }
        }
        const result = Array.from(distinctMap.entries()).map(([erpProductId, listPrice])=>({
                erpProductId,
                listPrice
            }));
        this.logger.log(`getPrices tenant=${this.tenantId} affected=${affectedProductIds.size} result=${result.length} ms=${Date.now() - started}`);
        return result;
    }
    /**
   * Depo kırılımlı stok: sadece qtyOnHand (fallback).
   */ async getStockFromProductLocationStock(productIds) {
        const started = Date.now();
        const CHUNK = 400;
        const rows = [];
        const fetchPl = async (strictPlTenant)=>{
            rows.length = 0;
            for(let j = 0; j < productIds.length; j += CHUNK){
                const chunk = productIds.slice(j, j + CHUNK);
                const part = await this.prisma.productLocationStock.findMany({
                    where: strictPlTenant ? {
                        AND: [
                            {
                                productId: {
                                    in: chunk
                                }
                            },
                            {
                                product: {
                                    tenantId: this.tenantId
                                }
                            },
                            {
                                OR: [
                                    {
                                        tenantId: this.tenantId
                                    },
                                    {
                                        tenantId: null
                                    }
                                ]
                            }
                        ]
                    } : {
                        productId: {
                            in: chunk
                        },
                        product: {
                            tenantId: this.tenantId
                        }
                    },
                    include: {
                        warehouse: true
                    }
                });
                rows.push(...part);
            }
        };
        await fetchPl(true);
        if (rows.length === 0 && productIds.length > 0) {
            this.logger.warn(`getStockFromProductLocationStock tenant=${this.tenantId}: katı PL tenant filtresi 0 satır; ürün kiracısı ile yeniden deneniyor`);
            await fetchPl(false);
        }
        const agg = new Map();
        for (const r of rows){
            const key = `${r.productId}:${r.warehouseId}`;
            const qty = Number(r.qtyOnHand);
            const existing = agg.get(key);
            if (existing) {
                existing.quantity += qty;
            } else {
                agg.set(key, {
                    erpProductId: r.productId,
                    warehouseId: r.warehouseId,
                    warehouseName: r.warehouse?.name ?? 'Depo',
                    quantity: qty
                });
            }
        }
        const result = [
            ...agg.values()
        ];
        this.logger.log(`getStockFromProductLocationStock tenant=${this.tenantId} rows=${result.length} ms=${Date.now() - started}`);
        return result;
    }
    async getStock(productIds) {
        const started = Date.now();
        if (productIds.length === 0) return [];
        const defaultWarehouse = await this.liveMetrics.getDefaultWarehouse(this.tenantId);
        if (!defaultWarehouse) {
            this.logger.warn(`getStock tenant=${this.tenantId}: tanımlı depo yok; ProductLocationStock kullanılıyor`);
            return this.getStockFromProductLocationStock(productIds);
        }
        const qtyByProduct = await this.liveMetrics.computeNetQuantitiesFromMovements(this.tenantId, productIds);
        const result = productIds.map((pid)=>({
                erpProductId: pid,
                warehouseId: defaultWarehouse.id,
                warehouseName: defaultWarehouse.name,
                quantity: qtyByProduct.get(pid) ?? 0
            }));
        this.logger.log(`getStock tenant=${this.tenantId} movementNet rows=${result.length} (malzeme listesi ile uyumlu) ms=${Date.now() - started}`);
        return result;
    }
    /**
   * Tüm ERP stok kartları için malzeme listesiyle aynı hareket bazlı net miktar.
   */ async getStockAll() {
        const products = await this.prisma.product.findMany({
            where: {
                tenantId: this.tenantId,
                isCategoryOnly: {
                    not: true
                },
                isBrandOnly: {
                    not: true
                }
            },
            select: {
                id: true
            }
        });
        return this.getStock(products.map((p)=>p.id));
    }
    async getAccount(erpAccountId) {
        const account = await this.prisma.account.findFirst({
            where: {
                id: erpAccountId,
                tenantId: this.tenantId,
                deletedAt: null
            },
            include: {
                addresses: true
            }
        });
        if (!account) {
            throw new _common.NotFoundException(`Account not found: ${erpAccountId}`);
        }
        const addresses = account.addresses.map((a)=>({
                id: a.id,
                label: a.title,
                fullAddress: [
                    a.address,
                    a.city,
                    a.district,
                    a.postalCode
                ].filter(Boolean).join(', '),
                isDefault: a.isDefault
            }));
        return {
            erpAccountId: account.id,
            name: account.title,
            email: account.email ?? undefined,
            phone: account.phone ?? undefined,
            addresses
        };
    }
    async getAccounts(lastSyncedAt) {
        const rows = await this.prisma.account.findMany({
            where: {
                tenantId: this.tenantId,
                deletedAt: null
            }
        });
        return rows.map((a)=>({
                erpNum: a.code,
                erpAccountId: a.id,
                name: a.title,
                email: a.email ?? undefined,
                phone: a.phone ?? undefined,
                addresses: [],
                salespersonId: a.salesAgentId ?? undefined
            }));
    }
    async getSalespersons() {
        const rows = await this.prisma.salesAgent.findMany({
            where: {
                OR: [
                    {
                        tenantId: this.tenantId
                    },
                    {
                        tenantId: null
                    }
                ],
                isActive: true
            }
        });
        return rows.map((s)=>({
                erpSalespersonId: s.id,
                name: s.fullName,
                email: s.email ?? undefined,
                phone: s.phone ?? undefined,
                isActive: s.isActive
            }));
    }
    async getAccountMovements(erpAccountId, lastSyncedAt) {
        const where = {
            tenantId: this.tenantId,
            accountId: erpAccountId,
            deletedAt: null
        };
        if (lastSyncedAt) {
            where.createdAt = {
                gt: lastSyncedAt
            };
        }
        const rows = await this.prisma.accountMovement.findMany({
            where,
            orderBy: {
                date: 'asc'
            }
        });
        return rows.map((m)=>this.mapAccountMovement(m));
    }
    mapAccountMovement(m) {
        const amount = Number(m.amount);
        let debit = 0;
        let credit = 0;
        if (m.type === _client.DebitCredit.DEBIT) debit = amount;
        else if (m.type === _client.DebitCredit.CREDIT) credit = amount;
        else {
            debit = amount >= 0 ? amount : 0;
            credit = amount < 0 ? -amount : 0;
        }
        return {
            erpMovementId: m.id,
            date: m.date,
            type: this.mapMovementType(m.documentType),
            description: m.notes || m.documentNo || '',
            debit,
            credit,
            balance: Number(m.balance),
            erpInvoiceNo: m.documentNo ?? undefined
        };
    }
    mapMovementType(dt) {
        switch(dt){
            case _client.DocumentType.INVOICE:
                return 'INVOICE';
            case _client.DocumentType.COLLECTION:
            case _client.DocumentType.PAYMENT:
                return 'PAYMENT';
            case _client.DocumentType.CHECK_PROMISSORY:
                return 'OTHER';
            default:
                return 'OTHER';
        }
    }
    async getWarehouses() {
        const list = await this.prisma.warehouse.findMany({
            where: {
                tenantId: this.tenantId,
                active: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return list.map((w)=>({
                warehouseId: w.id,
                warehouseName: w.name
            }));
    }
    async pushOrder(order) {
        const account = await this.prisma.account.findFirst({
            where: {
                id: order.erpAccountId,
                tenantId: this.tenantId,
                deletedAt: null
            }
        });
        if (!account) {
            throw new _common.NotFoundException(`Account not found: ${order.erpAccountId}`);
        }
        const productIds = order.items.map((i)=>i.erpProductId);
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds
                },
                tenantId: this.tenantId
            }
        });
        if (products.length !== productIds.length) {
            throw new _common.NotFoundException('One or more products not found for tenant');
        }
        let totalAmount = new _client.Prisma.Decimal(0);
        let vatAmount = new _client.Prisma.Decimal(0);
        const itemsWithCalculations = order.items.map((item)=>{
            const product = products.find((p)=>p.id === item.erpProductId);
            const lineTotal = new _client.Prisma.Decimal(item.quantity).mul(item.unitPrice);
            const lineVat = lineTotal.mul(product.vatRate).div(100);
            totalAmount = totalAmount.add(lineTotal);
            vatAmount = vatAmount.add(lineVat);
            return {
                productId: item.erpProductId,
                quantity: item.quantity,
                unitPrice: new _client.Prisma.Decimal(item.unitPrice),
                vatRate: product.vatRate,
                vatAmount: lineVat,
                totalAmount: lineTotal.add(lineVat)
            };
        });
        const discount = new _client.Prisma.Decimal(0);
        const grandTotal = totalAmount.add(vatAmount).sub(discount);
        const created = await this.prisma.$transaction(async (tx)=>{
            return tx.salesOrder.create({
                data: {
                    orderNo: order.orderNumber,
                    type: _client.OrderType.SALE,
                    date: new Date(),
                    accountId: order.erpAccountId,
                    tenantId: this.tenantId,
                    totalAmount,
                    vatAmount,
                    grandTotal,
                    discount,
                    notes: order.note ?? null,
                    status: _client.SalesOrderStatus.PENDING,
                    items: {
                        create: itemsWithCalculations
                    }
                }
            });
        });
        this.logger.log(`pushOrder tenant=${this.tenantId} erpOrderId=${created.id} orderNo=${order.orderNumber}`);
        return {
            erpOrderId: created.id
        };
    }
    async getAccountRisk(erpAccountId) {
        const account = await this.prisma.account.findFirst({
            where: {
                id: erpAccountId,
                tenantId: this.tenantId,
                deletedAt: null
            }
        });
        if (!account) {
            return {
                creditLimit: 0,
                currentBalance: 0,
                isOverCreditLimit: false,
                hasOverdueInvoices: false
            };
        }
        const creditLimit = account.creditLimit ? Number(account.creditLimit) : 0;
        const currentBalance = Number(account.balance);
        const isOverCreditLimit = creditLimit > 0 ? currentBalance > creditLimit : false;
        // Gecikmiş fatura tespiti: sonraki fazda reconciliation / vade ile genişletilecek
        const hasOverdueInvoices = false;
        return {
            creditLimit,
            currentBalance,
            isOverCreditLimit,
            hasOverdueInvoices
        };
    }
    async testConnection(_config) {
        try {
            // Simple query to test database connection
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                success: true,
                message: 'OtoMuhasebe ERP bağlantısı başarılı.',
                details: 'Veritabanı erişilebilir durumda.'
            };
        } catch (error) {
            this.logger.error(`Connection test failed: ${error}`);
            return {
                success: false,
                message: 'Bağlantı başarısız',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            };
        }
    }
    constructor(prisma, tenantId, liveMetrics){
        this.prisma = prisma;
        this.tenantId = tenantId;
        this.liveMetrics = liveMetrics;
        this.logger = new _common.Logger(OtomuhasebeErpAdapter.name);
    }
};
OtomuhasebeErpAdapter = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        String,
        typeof _erpproductlivemetricsservice.ErpProductLiveMetricsService === "undefined" ? Object : _erpproductlivemetricsservice.ErpProductLiveMetricsService
    ])
], OtomuhasebeErpAdapter);

//# sourceMappingURL=otomuhasebe-erp.adapter.js.map