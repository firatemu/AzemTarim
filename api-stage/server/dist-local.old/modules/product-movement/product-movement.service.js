"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductMovementService", {
    enumerable: true,
    get: function() {
        return ProductMovementService;
    }
});
const _stagingutil = require("../../common/utils/staging.util");
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
let ProductMovementService = class ProductMovementService {
    async findAll(page = 1, limit = 100, productId, movementType, tenantId) {
        const skip = (page - 1) * limit;
        const resolvedTenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId || resolvedTenantId || undefined)
        };
        if (productId) {
            where.productId = productId;
        }
        if (movementType) {
            where.movementType = movementType;
        }
        const [data, total] = await Promise.all([
            this.prisma.productMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            brand: true,
                            unit: true
                        }
                    },
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    },
                    invoiceItem: {
                        select: {
                            id: true,
                            unitPrice: true,
                            discountRate: true,
                            discountAmount: true,
                            amount: true,
                            invoice: {
                                select: {
                                    invoiceNo: true,
                                    invoiceType: true,
                                    status: true,
                                    account: {
                                        select: {
                                            title: true,
                                            code: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.productMovement.count({
                where
            })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
ProductMovementService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ProductMovementService);

//# sourceMappingURL=product-movement.service.js.map