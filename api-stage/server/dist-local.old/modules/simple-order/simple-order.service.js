"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SimpleOrderService", {
    enumerable: true,
    get: function() {
        return SimpleOrderService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _createsimpleorderdto = require("./dto/create-simple-order.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SimpleOrderService = class SimpleOrderService {
    /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak AWAITING_APPROVAL olarak ayarlanır
   */ async create(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate({});
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID is required');
        }
        const [firma, urun] = await Promise.all([
            this.prisma.account.findFirst({
                where: {
                    id: dto.companyId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId)
                }
            }),
            this.prisma.product.findFirst({
                where: {
                    id: dto.productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId)
                }
            })
        ]);
        if (!firma) {
            throw new _common.NotFoundException('Company not found');
        }
        if (!urun) {
            throw new _common.NotFoundException('Product not found');
        }
        const order = await this.prisma.simpleOrder.create({
            data: {
                companyId: dto.companyId,
                productId: dto.productId,
                tenantId,
                quantity: dto.quantity,
                status: _createsimpleorderdto.SimpleOrderDurum.AWAITING_APPROVAL,
                suppliedQuantity: 0
            },
            include: {
                company: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        unit: true,
                        priceCards: {
                            where: {
                                type: 'PURCHASE',
                                isActive: true
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        return {
            ...order,
            // Backward-compatible aliases
            firma: order.company ? {
                id: order.company.id,
                code: order.company.code,
                title: order.company.title
            } : null,
            urun: order.product ? {
                id: order.product.id,
                code: order.product.code,
                name: order.product.name,
                birim: order.product.unit,
                alisFiyati: order.product.priceCards?.[0]?.price ?? 0
            } : null
        };
    }
    async findAll(page = 1, limit = 50, status) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (status) where.status = status;
        const [salesOrders, total] = await Promise.all([
            this.prisma.simpleOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            code: true,
                            title: true
                        }
                    },
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            unit: true,
                            priceCards: {
                                where: {
                                    type: 'PURCHASE',
                                    isActive: true
                                },
                                take: 1
                            }
                        }
                    }
                }
            }),
            this.prisma.simpleOrder.count({
                where
            })
        ]);
        return {
            data: salesOrders.map((s)=>({
                    ...s,
                    firma: s.company ? {
                        id: s.company.id,
                        code: s.company.code,
                        title: s.company.title
                    } : null,
                    urun: s.product ? {
                        id: s.product.id,
                        code: s.product.code,
                        name: s.product.name,
                        birim: s.product.unit,
                        alisFiyati: s.product.priceCards?.[0]?.price ?? 0
                    } : null
                })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const order = await this.prisma.simpleOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                company: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        phone: true,
                        email: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        unit: true,
                        priceCards: {
                            where: {
                                type: 'PURCHASE',
                                isActive: true
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        if (!order) {
            throw new _common.NotFoundException('Order not found');
        }
        return {
            ...order,
            firma: order.company ? {
                id: order.company.id,
                code: order.company.code,
                title: order.company.title,
                telefon: order.company.phone,
                email: order.company.email
            } : null,
            urun: order.product ? {
                id: order.product.id,
                code: order.product.code,
                name: order.product.name,
                birim: order.product.unit,
                alisFiyati: order.product.priceCards?.[0]?.price ?? 0,
                vatRate: order.product.priceCards?.[0]?.vatRate ?? 20
            } : null
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SimpleOrderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SimpleOrderService);

//# sourceMappingURL=simple-order.service.js.map