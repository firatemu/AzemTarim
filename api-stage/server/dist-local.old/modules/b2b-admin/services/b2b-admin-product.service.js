"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminProductService", {
    enumerable: true,
    get: function() {
        return B2bAdminProductService;
    }
});
const _common = require("@nestjs/common");
const _path = require("path");
const _client = require("@prisma/client");
const _erpproductlivemetricsservice = require("../../../common/services/erp-product-live-metrics.service");
const _prismaservice = require("../../../common/prisma.service");
const _b2bsyncservice = require("../../b2b-sync/b2b-sync.service");
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
let B2bAdminProductService = class B2bAdminProductService {
    paginate(data, total, page, limit) {
        return {
            data,
            total,
            page,
            limit
        };
    }
    async list(tenantId, q) {
        const page = q.page ?? 1;
        const limit = q.limit ?? 25;
        const skip = (page - 1) * limit;
        const where = {
            tenantId
        };
        if (q.isVisibleInB2B !== undefined) {
            where.isVisibleInB2B = q.isVisibleInB2B;
        }
        if (q.brand?.trim()) {
            where.brand = {
                contains: q.brand.trim(),
                mode: 'insensitive'
            };
        }
        if (q.category?.trim()) {
            where.category = {
                contains: q.category.trim(),
                mode: 'insensitive'
            };
        }
        if (q.search?.trim()) {
            const s = q.search.trim();
            where.OR = [
                {
                    product: {
                        name: {
                            contains: s,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    product: {
                        code: {
                            contains: s,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    oemCode: {
                        contains: s,
                        mode: 'insensitive'
                    }
                },
                {
                    supplierCode: {
                        contains: s,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        const [total, data] = await Promise.all([
            this.prisma.b2BProduct.count({
                where
            }),
            this.prisma.b2BProduct.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    product: {
                        name: 'asc'
                    }
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            })
        ]);
        const erpIds = data.map((r)=>r.erpProductId);
        const [qtyMap, priceMap, defaultWh] = await Promise.all([
            this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, erpIds),
            this.liveMetrics.getListUnitPricesByProductIds(tenantId, erpIds),
            this.liveMetrics.getDefaultWarehouse(tenantId)
        ]);
        const enriched = data.map((row)=>{
            const { product: erp, ...rest } = row;
            const erpId = row.erpProductId;
            const netQty = qtyMap.get(erpId) ?? 0;
            const livePrice = priceMap.get(erpId);
            const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
            return {
                ...rest,
                stockCode: erp?.code ?? row.stockCode,
                name: erp?.name ?? row.name,
                erpListPrice: livePrice ?? Number(row.erpListPrice),
                stocks
            };
        });
        return this.paginate(enriched, total, page, limit);
    }
    async getOne(tenantId, id) {
        const p = await this.prisma.b2BProduct.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            }
        });
        if (!p) throw new _common.NotFoundException('B2B product not found');
        const erpId = p.erpProductId;
        const [qtyMap, priceMap, defaultWh] = await Promise.all([
            this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, [
                erpId
            ]),
            this.liveMetrics.getListUnitPricesByProductIds(tenantId, [
                erpId
            ]),
            this.liveMetrics.getDefaultWarehouse(tenantId)
        ]);
        const netQty = qtyMap.get(erpId) ?? 0;
        const livePrice = priceMap.get(erpId);
        const { product: erp, ...rest } = p;
        return {
            ...rest,
            stockCode: erp?.code ?? p.stockCode,
            name: erp?.name ?? p.name,
            erpListPrice: livePrice ?? Number(p.erpListPrice),
            stocks: this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh)
        };
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BProduct.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('B2B product not found');
        return this.prisma.b2BProduct.update({
            where: {
                id
            },
            data: {
                ...dto.isVisibleInB2B != null && {
                    isVisibleInB2B: dto.isVisibleInB2B
                },
                ...dto.minOrderQuantity != null && {
                    minOrderQuantity: dto.minOrderQuantity
                },
                ...dto.description !== undefined && {
                    description: dto.description
                }
            }
        });
    }
    async b2bFolder(tenantId) {
        const cfg = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!cfg) throw new _common.NotFoundException('B2B tenant configuration not found');
        return `b2b/${cfg.schemaName}/products`;
    }
    async uploadImage(tenantId, id, file) {
        if (!file?.buffer) {
            throw new _common.BadRequestException('File required');
        }
        const product = await this.prisma.b2BProduct.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!product) throw new _common.NotFoundException('B2B product not found');
        const folder = await this.b2bFolder(tenantId);
        const safeCode = product.stockCode.replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = (0, _path.extname)(file.originalname) || '.jpg';
        const renamed = {
            ...file,
            originalname: `${safeCode}${ext}`
        };
        if (product.imageUrl) {
            try {
                await this.storage.deleteFile({
                    tenantId,
                    key: product.imageUrl
                });
            } catch  {
            /* ignore */ }
        }
        const key = await this.storage.uploadFile({
            tenantId,
            file: renamed,
            folder
        });
        return this.prisma.b2BProduct.update({
            where: {
                id
            },
            data: {
                imageUrl: key
            }
        });
    }
    async deleteImage(tenantId, id) {
        const product = await this.prisma.b2BProduct.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!product) throw new _common.NotFoundException('B2B product not found');
        if (!product.imageUrl) return {
            ok: true
        };
        try {
            await this.storage.deleteFile({
                tenantId,
                key: product.imageUrl
            });
        } catch  {
        /* ignore */ }
        await this.prisma.b2BProduct.update({
            where: {
                id
            },
            data: {
                imageUrl: null
            }
        });
        return {
            ok: true
        };
    }
    async triggerSync(tenantId, type = 'FULL', _userId) {
        const now = new Date();
        await this.prisma.b2BTenantConfig.updateMany({
            where: {
                tenantId
            },
            data: {
                lastSyncRequestedAt: now
            }
        });
        let syncTypeEnum = _client.B2BSyncType.FULL;
        if (type === 'PRODUCTS') syncTypeEnum = _client.B2BSyncType.PRODUCTS;
        else if (type === 'PRICES') syncTypeEnum = _client.B2BSyncType.PRICES;
        return this.b2bSync.manualTrigger(tenantId, syncTypeEnum);
    }
    async getSyncLoops(tenantId) {
        return this.prisma.b2BSyncLoop.findMany({
            where: {
                tenantId
            },
            include: {
                lastUser: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                syncType: 'asc'
            }
        });
    }
    async getAvailableErpProducts(tenantId, q) {
        const limit = typeof q?.limit === 'string' ? parseInt(q.limit, 10) : q?.limit ?? 50;
        const where = {
            tenantId,
            isCategoryOnly: {
                not: true
            },
            isBrandOnly: {
                not: true
            }
        };
        if (q.search?.trim()) {
            const s = q.search.trim();
            where.OR = [
                {
                    name: {
                        contains: s,
                        mode: 'insensitive'
                    }
                },
                {
                    code: {
                        contains: s,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        const erpProducts = await this.prisma.product.findMany({
            where,
            take: limit,
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                code: true,
                name: true,
                brand: true,
                category: true,
                mainCategory: true,
                subCategory: true,
                unit: true
            }
        });
        // Zaten B2B'de olan ürünleri çıkar
        const b2bCodes = await this.prisma.b2BProduct.findMany({
            where: {
                tenantId
            },
            select: {
                stockCode: true
            }
        });
        const b2bCodeSet = new Set(b2bCodes.map((b)=>b.stockCode));
        return erpProducts.filter((p)=>!b2bCodeSet.has(p.code));
    }
    async addFromErp(tenantId, erpProductId) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: erpProductId,
                tenantId
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found in ERP');
        }
        // Fiyatı bul
        const priceCard = await this.prisma.priceCard.findFirst({
            where: {
                tenantId,
                productId: erpProductId,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return this.prisma.b2BProduct.create({
            data: {
                tenantId,
                erpProductId: product.id,
                stockCode: product.code,
                name: product.name,
                description: product.description ?? null,
                brand: product.brand ?? null,
                category: product.category ?? product.mainCategory ?? null,
                oemCode: product.oem ?? null,
                supplierCode: product.supplierCode ?? null,
                unit: product.unit ?? null,
                erpListPrice: priceCard ? new _client.Prisma.Decimal(priceCard.price) : new _client.Prisma.Decimal(0),
                isVisibleInB2B: true,
                minOrderQuantity: 1
            }
        });
    }
    async addBatchFromErp(tenantId, erpProductIds) {
        let added = 0;
        let skipped = 0;
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: erpProductIds
                },
                tenantId
            }
        });
        // Zaten B2B'de olanları bul
        const existing = await this.prisma.b2BProduct.findMany({
            where: {
                tenantId
            },
            select: {
                erpProductId: true
            }
        });
        const existingErpIds = new Set(existing.map((e)=>e.erpProductId));
        for (const product of products){
            if (existingErpIds.has(product.id)) {
                skipped++;
                continue;
            }
            // Fiyatı bul
            const priceCard = await this.prisma.priceCard.findFirst({
                where: {
                    tenantId,
                    productId: product.id,
                    isActive: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            await this.prisma.b2BProduct.create({
                data: {
                    tenantId,
                    erpProductId: product.id,
                    stockCode: product.code,
                    name: product.name,
                    description: product.description ?? null,
                    brand: product.brand ?? null,
                    category: product.category ?? product.mainCategory ?? null,
                    oemCode: product.oem ?? null,
                    supplierCode: product.supplierCode ?? null,
                    unit: product.unit ?? null,
                    erpListPrice: priceCard ? new _client.Prisma.Decimal(priceCard.price) : new _client.Prisma.Decimal(0),
                    isVisibleInB2B: true,
                    minOrderQuantity: 1
                }
            });
            added++;
        }
        return {
            added,
            skipped,
            total: erpProductIds.length
        };
    }
    syncStatus(tenantId) {
        return this.b2bSync.getLastSyncInfo(tenantId);
    }
    constructor(prisma, b2bSync, liveMetrics, storage){
        this.prisma = prisma;
        this.b2bSync = b2bSync;
        this.liveMetrics = liveMetrics;
        this.storage = storage;
    }
};
B2bAdminProductService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(3, (0, _common.Inject)('STORAGE_SERVICE')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bsyncservice.B2bSyncService === "undefined" ? Object : _b2bsyncservice.B2bSyncService,
        typeof _erpproductlivemetricsservice.ErpProductLiveMetricsService === "undefined" ? Object : _erpproductlivemetricsservice.ErpProductLiveMetricsService,
        typeof IStorageService === "undefined" ? Object : IStorageService
    ])
], B2bAdminProductService);

//# sourceMappingURL=b2b-admin-product.service.js.map