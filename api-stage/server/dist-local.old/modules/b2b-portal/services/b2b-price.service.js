"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bPriceService", {
    enumerable: true,
    get: function() {
        return B2bPriceService;
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
let B2bPriceService = class B2bPriceService {
    async loadActiveDiscounts(tenantId, now) {
        return this.prisma.b2BDiscount.findMany({
            where: {
                tenantId,
                isActive: true,
                AND: [
                    {
                        OR: [
                            {
                                startsAt: null
                            },
                            {
                                startsAt: {
                                    lte: now
                                }
                            }
                        ]
                    },
                    {
                        OR: [
                            {
                                endsAt: null
                            },
                            {
                                endsAt: {
                                    gte: now
                                }
                            }
                        ]
                    }
                ]
            }
        });
    }
    bestCampaignRate(discounts, product, _customerClassId) {
        let best = new _client.Prisma.Decimal(0);
        for (const d of discounts){
            let ok = false;
            const tv = (d.targetValue || '').trim();
            switch(d.type){
                // Sınıf iskontosu B2BCustomerClass üzerinden; burada çifte iskonto olmaması için atlanır
                case _client.B2BDiscountType.CUSTOMER_CLASS:
                    ok = false;
                    break;
                case _client.B2BDiscountType.BRAND:
                    ok = !!product.brand && tv === product.brand.trim();
                    break;
                case _client.B2BDiscountType.CATEGORY:
                    ok = !!product.category && tv === product.category.trim();
                    break;
                case _client.B2BDiscountType.PRODUCT_LIST:
                    {
                        const ids = tv.split(',').map((s)=>s.trim()).filter(Boolean);
                        ok = ids.includes(product.id);
                        break;
                    }
                default:
                    ok = false;
            }
            if (ok && d.discountRate.gt(best)) {
                best = d.discountRate;
            }
        }
        return best;
    }
    /**
   * Birim fiyat kırılımı (KDV hariç liste üzerinden iskonto).
   * @param referenceDate Kampanya başlangıç/bitiş filtresi ve testler için (varsayılan: şimdi)
   */ async getUnitPriceBreakdown(tenantId, customerId, productId, referenceDate = new Date()) {
        const now = referenceDate;
        const [product, customer, discounts] = await Promise.all([
            this.prisma.b2BProduct.findFirst({
                where: {
                    id: productId,
                    tenantId,
                    isVisibleInB2B: true
                },
                select: {
                    id: true,
                    stockCode: true,
                    name: true,
                    brand: true,
                    category: true,
                    erpProductId: true,
                    erpListPrice: true,
                    minOrderQuantity: true,
                    product: {
                        select: {
                            code: true,
                            name: true
                        }
                    }
                }
            }),
            this.prisma.b2BCustomer.findFirst({
                where: {
                    id: customerId,
                    tenantId
                },
                select: {
                    id: true,
                    customerClassId: true,
                    customerClass: {
                        select: {
                            discountRate: true
                        }
                    }
                }
            }),
            this.loadActiveDiscounts(tenantId, now)
        ]);
        if (!product) {
            throw new _common.NotFoundException('Ürün bulunamadı veya B2B’de görünür değil');
        }
        if (!customer) {
            throw new _common.NotFoundException('Müşteri bulunamadı');
        }
        const liveMap = await this.liveMetrics.getListUnitPricesByProductIds(tenantId, [
            product.erpProductId
        ]);
        const liveList = liveMap.get(product.erpProductId);
        const listUnit = new _client.Prisma.Decimal(liveList ?? product.erpListPrice);
        const classRate = customer.customerClass?.discountRate ? new _client.Prisma.Decimal(customer.customerClass.discountRate) : new _client.Prisma.Decimal(0);
        const classAmt = listUnit.mul(classRate).div(100);
        const afterClassUnit = listUnit.sub(classAmt);
        const campRate = this.bestCampaignRate(discounts, {
            id: product.id,
            brand: product.brand,
            category: product.category
        }, customer.customerClassId);
        /** Kampanya oranı sınıf iskontosu sonrası birim fiyat üzerinden (bileşik iskonto) */ const campAmt = afterClassUnit.mul(campRate).div(100);
        const rawFinal = afterClassUnit.sub(campAmt);
        const finalUnit = rawFinal.lt(0) ? new _client.Prisma.Decimal(0) : rawFinal;
        return {
            product: {
                id: product.id,
                stockCode: product.product?.code ?? product.stockCode,
                name: product.product?.name ?? product.name,
                minOrderQuantity: product.minOrderQuantity
            },
            listUnit,
            customerClassDiscountUnit: classAmt,
            campaignDiscountUnit: campAmt,
            finalUnit
        };
    }
    constructor(prisma, liveMetrics){
        this.prisma = prisma;
        this.liveMetrics = liveMetrics;
    }
};
B2bPriceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _erpproductlivemetricsservice.ErpProductLiveMetricsService === "undefined" ? Object : _erpproductlivemetricsservice.ErpProductLiveMetricsService
    ])
], B2bPriceService);

//# sourceMappingURL=b2b-price.service.js.map