"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsService", {
    enumerable: true,
    get: function() {
        return PaymentsService;
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
let PaymentsService = class PaymentsService {
    async create(createPaymentDto) {
        // Check if subscription exists
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                id: createPaymentDto.subscriptionId
            }
        });
        if (!subscription) {
            throw new _common.NotFoundException(`Subscription with ID ${createPaymentDto.subscriptionId} not found`);
        }
        return this.prisma.payment.create({
            data: {
                subscriptionId: createPaymentDto.subscriptionId,
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency || 'TRY',
                status: createPaymentDto.status || 'PENDING',
                ...createPaymentDto.iyzicoPaymentId && {
                    iyzicoPaymentId: createPaymentDto.iyzicoPaymentId
                },
                ...createPaymentDto.iyzicoToken && {
                    iyzicoToken: createPaymentDto.iyzicoToken
                },
                ...createPaymentDto.conversationId && {
                    conversationId: createPaymentDto.conversationId
                }
            },
            include: {
                subscription: {
                    include: {
                        tenant: true
                    }
                }
            }
        });
    }
    async findAll() {
        return this.prisma.payment.findMany({
            include: {
                subscription: {
                    include: {
                        tenant: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
            where: {
                id
            },
            include: {
                subscription: {
                    include: {
                        tenant: true
                    }
                }
            }
        });
        if (!payment) {
            throw new _common.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async findBySubscriptionId(subscriptionId) {
        return this.prisma.payment.findMany({
            where: {
                subscriptionId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async update(id, updatePaymentDto) {
        const updateData = {};
        if (updatePaymentDto.status) updateData.status = updatePaymentDto.status;
        if (updatePaymentDto.iyzicoPaymentId) updateData.iyzicoPaymentId = updatePaymentDto.iyzicoPaymentId;
        if (updatePaymentDto.iyzicoToken) updateData.iyzicoToken = updatePaymentDto.iyzicoToken;
        if (updatePaymentDto.conversationId) updateData.conversationId = updatePaymentDto.conversationId;
        if (updatePaymentDto.invoiceNumber) updateData.invoiceNumber = updatePaymentDto.invoiceNumber;
        if (updatePaymentDto.invoiceUrl) updateData.invoiceUrl = updatePaymentDto.invoiceUrl;
        if (updatePaymentDto.paidAt) updateData.paidAt = updatePaymentDto.paidAt;
        if (updatePaymentDto.failedAt) updateData.failedAt = updatePaymentDto.failedAt;
        if (updatePaymentDto.refundedAt) updateData.refundedAt = updatePaymentDto.refundedAt;
        if (updatePaymentDto.errorCode) updateData.errorCode = updatePaymentDto.errorCode;
        if (updatePaymentDto.errorMessage) updateData.errorMessage = updatePaymentDto.errorMessage;
        if (updatePaymentDto.paymentMethod) updateData.paymentMethod = updatePaymentDto.paymentMethod;
        return this.prisma.payment.update({
            where: {
                id
            },
            data: updateData,
            include: {
                subscription: true
            }
        });
    }
    async remove(id) {
        return this.prisma.payment.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
PaymentsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PaymentsService);

//# sourceMappingURL=payments.service.js.map