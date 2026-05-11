"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bCartOrderService", {
    enumerable: true,
    get: function() {
        return B2bCartOrderService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _crypto = require("crypto");
const _prismaservice = require("../../../common/prisma.service");
const _b2bportalactorservice = require("./b2b-portal-actor.service");
const _b2bpriceservice = require("./b2b-price.service");
const _b2briskcheckservice = require("./b2b-risk-check.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bCartOrderService = class B2bCartOrderService {
    async assertCustomerAccess(tenantId, customerId, user) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId,
                isActive: true
            },
            select: {
                id: true
            }
        });
        if (!c) {
            throw new _common.NotFoundException('Müşteri bulunamadı');
        }
        if (user.userType === 'CUSTOMER') {
            if (user.sub !== customerId) {
                throw new _common.ForbiddenException();
            }
            return;
        }
        await this.actor.assertSalespersonCanAccess(user.sub, customerId, tenantId);
    }
    async getOrCreateCart(tenantId, customerId) {
        let cart = await this.prisma.b2BCart.findUnique({
            where: {
                tenantId_customerId: {
                    tenantId,
                    customerId
                }
            }
        });
        if (!cart) {
            cart = await this.prisma.b2BCart.create({
                data: {
                    tenantId,
                    customerId
                }
            });
        }
        return cart;
    }
    async getCartSummary(tenantId, customerId) {
        const cart = await this.getOrCreateCart(tenantId, customerId);
        const items = await this.prisma.b2BCartItem.findMany({
            where: {
                cartId: cart.id,
                tenantId
            },
            include: {
                product: true
            },
            orderBy: {
                addedAt: 'asc'
            }
        });
        let totalList = new _client.Prisma.Decimal(0);
        let totalDiscount = new _client.Prisma.Decimal(0);
        let totalFinal = new _client.Prisma.Decimal(0);
        const lines = await Promise.all(items.map(async (row)=>{
            const br = await this.priceService.getUnitPriceBreakdown(tenantId, customerId, row.productId);
            const qty = row.quantity;
            const lineList = br.listUnit.mul(qty);
            const lineClass = br.customerClassDiscountUnit.mul(qty);
            const lineCamp = br.campaignDiscountUnit.mul(qty);
            const lineFinal = br.finalUnit.mul(qty);
            totalList = totalList.add(lineList);
            totalDiscount = totalDiscount.add(lineClass).add(lineCamp);
            totalFinal = totalFinal.add(lineFinal);
            return {
                id: row.id,
                productId: row.productId,
                quantity: qty,
                stockCode: br.product.stockCode,
                productName: br.product.name,
                minOrderQuantity: br.product.minOrderQuantity,
                listUnit: br.listUnit,
                customerClassDiscountUnit: br.customerClassDiscountUnit,
                campaignDiscountUnit: br.campaignDiscountUnit,
                finalUnit: br.finalUnit,
                lineListPrice: lineList,
                lineCustomerClassDiscount: lineClass,
                lineCampaignDiscount: lineCamp,
                lineFinalPrice: lineFinal
            };
        }));
        return {
            cartId: cart.id,
            items: lines,
            totals: {
                totalListPrice: totalList,
                totalDiscountAmount: totalDiscount,
                totalFinalPrice: totalFinal
            }
        };
    }
    async addItem(tenantId, customerId, productId, quantity) {
        await this.priceService.getUnitPriceBreakdown(tenantId, customerId, productId);
        const cart = await this.getOrCreateCart(tenantId, customerId);
        const product = await this.prisma.b2BProduct.findFirst({
            where: {
                id: productId,
                tenantId,
                isVisibleInB2B: true
            },
            select: {
                minOrderQuantity: true
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Ürün bulunamadı');
        }
        if (quantity < product.minOrderQuantity) {
            throw new _common.BadRequestException(`Minimum sipariş miktarı: ${product.minOrderQuantity}`);
        }
        const existing = await this.prisma.b2BCartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });
        if (existing) {
            const nextQty = existing.quantity + quantity;
            if (nextQty < product.minOrderQuantity) {
                throw new _common.BadRequestException(`Minimum sipariş miktarı: ${product.minOrderQuantity}`);
            }
            await this.prisma.b2BCartItem.update({
                where: {
                    id: existing.id
                },
                data: {
                    quantity: nextQty
                }
            });
        } else {
            await this.prisma.b2BCartItem.create({
                data: {
                    tenantId,
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }
        return this.getCartSummary(tenantId, customerId);
    }
    async updateItemQty(tenantId, customerId, itemId, quantity) {
        const cart = await this.getOrCreateCart(tenantId, customerId);
        const row = await this.prisma.b2BCartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
                tenantId
            },
            include: {
                product: true
            }
        });
        if (!row) {
            throw new _common.NotFoundException('Sepet satırı bulunamadı');
        }
        if (quantity < row.product.minOrderQuantity) {
            throw new _common.BadRequestException(`Minimum sipariş miktarı: ${row.product.minOrderQuantity}`);
        }
        await this.prisma.b2BCartItem.update({
            where: {
                id: row.id
            },
            data: {
                quantity
            }
        });
        return this.getCartSummary(tenantId, customerId);
    }
    async removeItem(tenantId, customerId, itemId) {
        const cart = await this.getOrCreateCart(tenantId, customerId);
        const row = await this.prisma.b2BCartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
                tenantId
            }
        });
        if (!row) {
            throw new _common.NotFoundException('Sepet satırı bulunamadı');
        }
        await this.prisma.b2BCartItem.delete({
            where: {
                id: row.id
            }
        });
        return this.getCartSummary(tenantId, customerId);
    }
    async clearCart(tenantId, customerId) {
        const cart = await this.prisma.b2BCart.findUnique({
            where: {
                tenantId_customerId: {
                    tenantId,
                    customerId
                }
            }
        });
        if (cart) {
            await this.prisma.b2BCartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    tenantId
                }
            });
        }
        return this.getCartSummary(tenantId, customerId);
    }
    async placeOrder(tenantId, user, customerId, dto) {
        await this.assertCustomerAccess(tenantId, customerId, user);
        const dm = await this.prisma.b2BDeliveryMethod.findFirst({
            where: {
                id: dto.deliveryMethodId,
                tenantId,
                isActive: true
            }
        });
        if (!dm) {
            throw new _common.BadRequestException('Geçersiz teslimat yöntemi');
        }
        const summary = await this.getCartSummary(tenantId, customerId);
        if (summary.items.length === 0) {
            throw new _common.BadRequestException('Sepet boş');
        }
        await this.riskService.assertOrderAllowed(tenantId, customerId, summary.totals.totalFinalPrice);
        const orderNumber = `B2B-${Date.now().toString(36)}-${(0, _crypto.randomBytes)(3).toString('hex').toUpperCase()}`;
        let placedBy = _client.B2BOrderPlacedBy.CUSTOMER;
        let salespersonId = null;
        let placedByLabel = null;
        if (user.userType === 'SALESPERSON') {
            placedBy = _client.B2BOrderPlacedBy.SALESPERSON;
            salespersonId = user.sub;
            const sp = await this.prisma.b2BSalesperson.findFirst({
                where: {
                    id: user.sub,
                    tenantId
                },
                select: {
                    name: true
                }
            });
            placedByLabel = sp?.name ? `P:${sp.name}` : 'P:?';
        }
        const order = await this.prisma.$transaction(async (tx)=>{
            const created = await tx.b2BOrder.create({
                data: {
                    tenantId,
                    orderNumber,
                    customerId,
                    salespersonId,
                    placedBy,
                    placedByLabel,
                    deliveryMethodId: dto.deliveryMethodId,
                    deliveryBranchId: dto.deliveryBranchId ?? null,
                    deliveryBranchName: dto.deliveryBranchName ?? null,
                    note: dto.note ?? null,
                    totalListPrice: summary.totals.totalListPrice,
                    totalDiscountAmount: summary.totals.totalDiscountAmount,
                    totalFinalPrice: summary.totals.totalFinalPrice,
                    items: {
                        create: summary.items.map((line)=>({
                                tenantId,
                                productId: line.productId,
                                stockCode: line.stockCode,
                                productName: line.productName,
                                quantity: line.quantity,
                                listPrice: line.listUnit,
                                customerClassDiscount: line.customerClassDiscountUnit.mul(line.quantity),
                                campaignDiscount: line.campaignDiscountUnit.mul(line.quantity),
                                finalPrice: line.finalUnit.mul(line.quantity)
                            }))
                    }
                },
                include: {
                    items: true
                }
            });
            await tx.b2BCartItem.deleteMany({
                where: {
                    cartId: summary.cartId,
                    tenantId
                }
            });
            await tx.b2BNotification.create({
                data: {
                    tenantId,
                    customerId,
                    type: _client.B2BNotificationType.ORDER_RECEIVED,
                    message: `Siparişiniz alındı: ${orderNumber}`,
                    orderId: created.id
                }
            });
            return created;
        });
        return order;
    }
    async listOrders(tenantId, customerId, query) {
        const page = query?.page ?? 1;
        const pageSize = query?.pageSize ?? 25;
        const where = {
            tenantId,
            customerId,
            ...query?.status ? {
                status: query.status
            } : {}
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.b2BOrder.count({
                where
            }),
            this.prisma.b2BOrder.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    deliveryMethod: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    items: true
                }
            })
        ]);
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
    async getOrder(tenantId, customerId, orderId) {
        const o = await this.prisma.b2BOrder.findFirst({
            where: {
                id: orderId,
                tenantId,
                customerId
            },
            include: {
                deliveryMethod: true,
                items: true,
                salesperson: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!o) {
            throw new _common.NotFoundException('Sipariş bulunamadı');
        }
        const statusTimeline = this.buildOrderTimeline(o);
        return {
            ...o,
            statusTimeline
        };
    }
    async listSalespersonOrders(tenantId, salespersonId, query) {
        const page = query?.page ?? 1;
        const pageSize = query?.pageSize ?? 25;
        const where = {
            tenantId,
            salespersonId,
            ...query?.status ? {
                status: query.status
            } : {}
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.b2BOrder.count({
                where
            }),
            this.prisma.b2BOrder.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    deliveryMethod: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    items: true
                }
            })
        ]);
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
    buildOrderTimeline(o) {
        const steps = [
            {
                key: 'RECEIVED',
                label: 'Siparis alindi',
                at: o.createdAt
            }
        ];
        switch(o.status){
            case _client.B2BOrderStatus.APPROVED:
            case _client.B2BOrderStatus.EXPORTED_TO_ERP:
                steps.push({
                    key: 'APPROVED',
                    label: 'Onaylandi',
                    at: o.updatedAt
                });
                break;
            case _client.B2BOrderStatus.REJECTED:
                steps.push({
                    key: 'REJECTED',
                    label: 'Reddedildi',
                    at: o.updatedAt
                });
                break;
            case _client.B2BOrderStatus.CANCELLED:
                steps.push({
                    key: 'CANCELLED',
                    label: 'Iptal',
                    at: o.updatedAt
                });
                break;
            default:
                break;
        }
        return steps;
    }
    constructor(prisma, priceService, riskService, actor){
        this.prisma = prisma;
        this.priceService = priceService;
        this.riskService = riskService;
        this.actor = actor;
    }
};
B2bCartOrderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bpriceservice.B2bPriceService === "undefined" ? Object : _b2bpriceservice.B2bPriceService,
        typeof _b2briskcheckservice.B2bRiskCheckService === "undefined" ? Object : _b2briskcheckservice.B2bRiskCheckService,
        typeof _b2bportalactorservice.B2bPortalActorService === "undefined" ? Object : _b2bportalactorservice.B2bPortalActorService
    ])
], B2bCartOrderService);

//# sourceMappingURL=b2b-cart-order.service.js.map