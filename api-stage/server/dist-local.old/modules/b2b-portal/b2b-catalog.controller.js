"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bCatalogController", {
    enumerable: true,
    get: function() {
        return B2bCatalogController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _erpproductlivemetricsservice = require("../../common/services/erp-product-live-metrics.service");
const _prismaservice = require("../../common/prisma.service");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2beffectivecustomerguard = require("./guards/b2b-effective-customer.guard");
const _b2bpaginationdto = require("./dto/b2b-pagination.dto");
const _b2bpriceservice = require("./services/b2b-price.service");
const _b2btenantschemabridgeservice = require("./services/b2b-tenant-schema-bridge.service");
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
let B2bCatalogController = class B2bCatalogController {
    parsePricingAt(iso) {
        if (!iso?.trim()) {
            return new Date();
        }
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) {
            throw new _common.BadRequestException('pricingAt gecersiz ISO tarih');
        }
        return d;
    }
    async listProducts(req, q) {
        const user = req.user;
        const customerId = req.effectiveB2bCustomerId;
        const tenantId = user.tenantId;
        const schemaName = await this.schemaBridge.getDeclaredSchemaName(tenantId);
        this.schemaBridge.logSchemaHint(tenantId, schemaName);
        const pricingRef = this.parsePricingAt(q.pricingAt);
        const page = q.page ?? 1;
        const pageSize = q.pageSize ?? 20;
        const search = (q.search ?? '').trim();
        const brand = (q.brand ?? '').trim();
        const category = (q.category ?? '').trim();
        const whConfigs = await this.prisma.b2BWarehouseConfig.findMany({
            where: {
                tenantId,
                isActive: true
            }
        });
        const collapseWarehouses = whConfigs.length > 0 && whConfigs.every((c)=>c.displayMode === _client.B2BWarehouseDisplayMode.COMBINED);
        const where = {
            tenantId,
            isVisibleInB2B: true,
            ...brand ? {
                brand
            } : {},
            ...category ? {
                category
            } : {},
            ...search ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        stockCode: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        brand: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        oemCode: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        supplierCode: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                ]
            } : {}
        };
        const [total, rows] = await this.prisma.$transaction([
            this.prisma.b2BProduct.count({
                where
            }),
            this.prisma.b2BProduct.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    erpProductId: true,
                    stockCode: true,
                    name: true,
                    description: true,
                    brand: true,
                    category: true,
                    unit: true,
                    erpListPrice: true,
                    minOrderQuantity: true,
                    imageUrl: true,
                    oemCode: true,
                    supplierCode: true,
                    product: {
                        select: {
                            code: true,
                            name: true
                        }
                    }
                }
            })
        ]);
        const erpIds = rows.map((r)=>r.erpProductId);
        const [qtyMap, priceMap, defaultWh] = await Promise.all([
            this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, erpIds),
            this.liveMetrics.getListUnitPricesByProductIds(tenantId, erpIds),
            this.liveMetrics.getDefaultWarehouse(tenantId)
        ]);
        const data = await Promise.all(rows.map(async (p)=>{
            const { product: erpRow, ...pRest } = p;
            const erpId = p.erpProductId;
            const netQty = qtyMap.get(erpId) ?? 0;
            const liveList = priceMap.get(erpId) ?? Number(p.erpListPrice);
            const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
            const stocksDto = stocks.map((s)=>({
                    warehouseId: s.warehouseId,
                    warehouseName: s.warehouseName,
                    isAvailable: s.isAvailable,
                    quantity: s.quantity
                }));
            const inStock = netQty > 0;
            const warehouses = collapseWarehouses ? [] : stocksDto;
            const pricing = await this.price.getUnitPriceBreakdown(tenantId, customerId, p.id, pricingRef);
            return {
                ...pRest,
                stockCode: erpRow?.code ?? p.stockCode,
                name: erpRow?.name ?? p.name,
                erpListPrice: liveList,
                pricing: {
                    listUnit: pricing.listUnit,
                    customerClassDiscountUnit: pricing.customerClassDiscountUnit,
                    campaignDiscountUnit: pricing.campaignDiscountUnit,
                    finalUnit: pricing.finalUnit
                },
                stockPresentation: collapseWarehouses ? 'COMBINED' : 'INDIVIDUAL',
                inStock,
                warehouses
            };
        }));
        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize)
            }
        };
    }
    async productDetail(req, productId, pricingAt) {
        const user = req.user;
        const customerId = req.effectiveB2bCustomerId;
        const tenantId = user.tenantId;
        const pricingRef = this.parsePricingAt(pricingAt);
        const whConfigs = await this.prisma.b2BWarehouseConfig.findMany({
            where: {
                tenantId,
                isActive: true
            }
        });
        const collapseWarehouses = whConfigs.length > 0 && whConfigs.every((c)=>c.displayMode === _client.B2BWarehouseDisplayMode.COMBINED);
        const product = await this.prisma.b2BProduct.findFirst({
            where: {
                id: productId,
                tenantId,
                isVisibleInB2B: true
            },
            include: {
                product: {
                    select: {
                        code: true,
                        name: true
                    }
                }
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Urun bulunamadi');
        }
        const [qtyMap, priceMap, defaultWh] = await Promise.all([
            this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, [
                product.erpProductId
            ]),
            this.liveMetrics.getListUnitPricesByProductIds(tenantId, [
                product.erpProductId
            ]),
            this.liveMetrics.getDefaultWarehouse(tenantId)
        ]);
        const netQty = qtyMap.get(product.erpProductId) ?? 0;
        const liveList = priceMap.get(product.erpProductId) ?? Number(product.erpListPrice);
        const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
        const stocksDto = stocks.map((s)=>({
                warehouseId: s.warehouseId,
                warehouseName: s.warehouseName,
                isAvailable: s.isAvailable,
                quantity: s.quantity
            }));
        const pricing = await this.price.getUnitPriceBreakdown(tenantId, customerId, productId, pricingRef);
        const presentation = collapseWarehouses ? 'COMBINED' : 'INDIVIDUAL';
        const warehouses = collapseWarehouses ? [] : stocksDto;
        const { product: erp, ...rest } = product;
        return {
            product: {
                ...rest,
                stockCode: erp?.code ?? product.stockCode,
                name: erp?.name ?? product.name,
                erpListPrice: liveList,
                stocks: collapseWarehouses ? [] : stocksDto
            },
            pricing,
            stockPresentation: presentation,
            inStock: netQty > 0,
            warehouses
        };
    }
    async brands(req) {
        const user = req.user;
        const rows = await this.prisma.b2BProduct.findMany({
            where: {
                tenantId: user.tenantId,
                isVisibleInB2B: true,
                brand: {
                    not: null
                }
            },
            distinct: [
                'brand'
            ],
            select: {
                brand: true
            },
            orderBy: {
                brand: 'asc'
            }
        });
        return {
            data: rows.map((r)=>r.brand).filter((b)=>!!b && b.length > 0)
        };
    }
    async categories(req) {
        const user = req.user;
        const rows = await this.prisma.b2BProduct.findMany({
            where: {
                tenantId: user.tenantId,
                isVisibleInB2B: true,
                category: {
                    not: null
                }
            },
            distinct: [
                'category'
            ],
            select: {
                category: true
            },
            orderBy: {
                category: 'asc'
            }
        });
        return {
            data: rows.map((r)=>r.category).filter((c)=>!!c && c.length > 0)
        };
    }
    async deliveryMethods(req) {
        const user = req.user;
        return this.prisma.b2BDeliveryMethod.findMany({
            where: {
                tenantId: user.tenantId,
                isActive: true
            },
            orderBy: [
                {
                    displayOrder: 'asc'
                },
                {
                    name: 'asc'
                }
            ],
            select: {
                id: true,
                name: true,
                displayOrder: true
            }
        });
    }
    constructor(prisma, price, schemaBridge, liveMetrics){
        this.prisma = prisma;
        this.price = price;
        this.schemaBridge = schemaBridge;
        this.liveMetrics = liveMetrics;
    }
};
_ts_decorate([
    (0, _common.Get)('products'),
    (0, _common.UseGuards)(_b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiOperation)({
        summary: 'B2B katalog ürün listesi',
        description: 'Satır fiyatı: erpListPrice − müşteri sınıfı iskontosu; kampanya oranı bu tutar üzerinden uygulanır. ' + 'Aktif kampanyalar `pricingAt` (query, ISO 8601) veya anlık zaman ile B2BDiscount aralığına göre seçilir.'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2bpaginationdto.B2bPaginationQueryDto === "undefined" ? Object : _b2bpaginationdto.B2bPaginationQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bCatalogController.prototype, "listProducts", null);
_ts_decorate([
    (0, _common.Get)('products/:productId'),
    (0, _common.UseGuards)(_b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün detay ve müşteri fiyat kırılımı',
        description: 'Bileşik iskonto: sınıf sonrası birim üzerinden kampanya. `pricingAt` ile kampanya penceresi simüle edilir.'
    }),
    (0, _swagger.ApiQuery)({
        name: 'pricingAt',
        required: false,
        description: 'Kampanya aktiflik referansı (ISO 8601), varsayılan şimdi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('productId')),
    _ts_param(2, (0, _common.Query)('pricingAt')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bCatalogController.prototype, "productDetail", null);
_ts_decorate([
    (0, _common.Get)('brands'),
    (0, _swagger.ApiOperation)({
        summary: 'Filtre icin marka listesi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bCatalogController.prototype, "brands", null);
_ts_decorate([
    (0, _common.Get)('categories'),
    (0, _swagger.ApiOperation)({
        summary: 'Filtre icin kategori listesi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bCatalogController.prototype, "categories", null);
_ts_decorate([
    (0, _common.Get)('delivery-methods'),
    (0, _swagger.ApiOperation)({
        summary: 'Aktif teslimat yöntemleri'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bCatalogController.prototype, "deliveryMethods", null);
B2bCatalogController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/catalog'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bpriceservice.B2bPriceService === "undefined" ? Object : _b2bpriceservice.B2bPriceService,
        typeof _b2btenantschemabridgeservice.B2bTenantSchemaBridgeService === "undefined" ? Object : _b2btenantschemabridgeservice.B2bTenantSchemaBridgeService,
        typeof _erpproductlivemetricsservice.ErpProductLiveMetricsService === "undefined" ? Object : _erpproductlivemetricsservice.ErpProductLiveMetricsService
    ])
], B2bCatalogController);

//# sourceMappingURL=b2b-catalog.controller.js.map