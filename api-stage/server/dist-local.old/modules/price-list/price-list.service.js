"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceListService", {
    enumerable: true,
    get: function() {
        return PriceListService;
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
let PriceListService = class PriceListService {
    async create(createDto) {
        const { items, ...data } = createDto;
        return this.prisma.priceList.create({
            data: {
                name: data.ad,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive ?? true,
                ...items && items.length > 0 ? {
                    items: {
                        create: items.map((k)=>({
                                productId: k.productId,
                                price: k.price,
                                discountRate: k.discountRate ?? 0
                            }))
                    }
                } : {}
            },
            include: {
                items: true
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.priceList.findMany({
            where: {
                tenantId,
                isActive: true
            },
            include: {
                _count: {
                    select: {
                        items: true
                    }
                }
            }
        });
    }
    async findOne(id) {
        const list = await this.prisma.priceList.findUnique({
            where: {
                id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!list) throw new _common.NotFoundException('Price list not found');
        return list;
    }
    async findStokPrice(productId, accountId) {
        let priceListId = null;
        if (accountId) {
            const cari = await this.prisma.account.findUnique({
                where: {
                    id: accountId
                },
                select: {
                    priceListId: true
                }
            });
            priceListId = cari?.priceListId || null;
        }
        if (!priceListId) {
            // Cari için özel liste yoksa, genel isActive bir liste var mı bak (eğer mantık buysa)
            // Şimdilik sadece cariye bağlı listeyi kontrol ediyoruz
            return null;
        }
        const kalem = await this.prisma.priceListItem.findUnique({
            where: {
                priceListId_productId: {
                    priceListId: priceListId,
                    productId: productId
                }
            }
        });
        return kalem;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
PriceListService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PriceListService);

//# sourceMappingURL=price-list.service.js.map