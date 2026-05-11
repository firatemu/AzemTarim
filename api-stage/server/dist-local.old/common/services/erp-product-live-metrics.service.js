"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ErpProductLiveMetricsService", {
    enumerable: true,
    get: function() {
        return ErpProductLiveMetricsService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ErpProductLiveMetricsService = class ErpProductLiveMetricsService {
    /**
   * Malzeme listesi (`ProductService.findAll`) ile aynı hareket mantığı.
   */ async computeNetQuantitiesFromMovements(tenantId, productIds) {
        const qtyByProduct = new Map();
        if (productIds.length === 0) return qtyByProduct;
        const CHUNK = 400;
        for(let i = 0; i < productIds.length; i += CHUNK){
            const chunk = productIds.slice(i, i + CHUNK);
            const movements = await this.prisma.productMovement.findMany({
                where: {
                    productId: {
                        in: chunk
                    },
                    product: {
                        tenantId
                    }
                },
                include: {
                    invoiceItem: {
                        include: {
                            invoice: {
                                select: {
                                    status: true
                                }
                            }
                        }
                    }
                }
            });
            for (const hareket of movements){
                if (hareket.invoiceItem?.invoice?.status === 'CANCELLED') {
                    continue;
                }
                const pid = hareket.productId;
                let delta = 0;
                if (hareket.movementType === _client.MovementType.ENTRY || hareket.movementType === _client.MovementType.COUNT_SURPLUS || hareket.movementType === _client.MovementType.RETURN || hareket.movementType === _client.MovementType.CANCELLATION_ENTRY) {
                    delta = hareket.quantity;
                } else if (hareket.movementType === _client.MovementType.EXIT || hareket.movementType === _client.MovementType.SALE || hareket.movementType === _client.MovementType.COUNT_SHORTAGE || hareket.movementType === _client.MovementType.CANCELLATION_EXIT) {
                    delta = -hareket.quantity;
                } else {
                    continue;
                }
                qtyByProduct.set(pid, (qtyByProduct.get(pid) ?? 0) + delta);
            }
        }
        return qtyByProduct;
    }
    /**
   * Aktif LIST / SALE fiyat kartından ürün başına liste birim fiyatı (en güncel).
   */ async getListUnitPricesByProductIds(tenantId, productIds) {
        const map = new Map();
        if (productIds.length === 0) return map;
        const cards = await this.prisma.priceCard.findMany({
            where: {
                tenantId,
                productId: {
                    in: productIds
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
        for (const c of cards){
            if (!map.has(c.productId)) {
                map.set(c.productId, Number(c.price));
            }
        }
        return map;
    }
    async getDefaultWarehouse(tenantId) {
        return this.prisma.warehouse.findFirst({
            where: {
                tenantId,
                active: true
            },
            orderBy: [
                {
                    isDefault: 'desc'
                },
                {
                    code: 'asc'
                }
            ],
            select: {
                id: true,
                name: true
            }
        });
    }
    buildLiveStockSnapshot(netQty, warehouse) {
        const qty = new _client.Prisma.Decimal(netQty);
        const w = warehouse;
        return [
            {
                warehouseId: w?.id ?? 'live-aggregate',
                warehouseName: w?.name ?? 'Toplam',
                quantity: qty,
                isAvailable: netQty > 0,
                displayOrder: 0
            }
        ];
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ErpProductLiveMetricsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ErpProductLiveMetricsService);

//# sourceMappingURL=erp-product-live-metrics.service.js.map