"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubscriptionsService", {
    enumerable: true,
    get: function() {
        return SubscriptionsService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _client = require("@prisma/client");
const _uuid = require("uuid");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SubscriptionsService = class SubscriptionsService {
    async create(createSubscriptionDto) {
        const { tenantId, planId, planName, startDate, endDate, billingType, paymentMethod = 'credit_card' } = createSubscriptionDto;
        // Check if tenant exists
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: tenantId
            }
        });
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        // Check if subscription already exists
        const existing = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            }
        });
        if (existing) {
            throw new _common.BadRequestException('Tenant already has a subscription');
        }
        // Eğer planName verilmişse, planId'yi bul
        let finalPlanId = planId;
        if (planName && !planId) {
            const planSlug = planName.toLowerCase();
            const plan = await this.prisma.plan.findFirst({
                where: {
                    slug: planSlug
                }
            });
            if (!plan) {
                throw new _common.NotFoundException(`Plan 'planName' not found`);
            }
            finalPlanId = plan.id;
        }
        if (!finalPlanId) {
            throw new _common.BadRequestException('Plan ID veya Plan Name gerekli');
        }
        // Calculate dates - yıllık abonelik için 1 yıl
        const now = new Date();
        const subscriptionStartDate = startDate ? new Date(startDate) : now;
        let subscriptionEndDate;
        if (endDate) {
            subscriptionEndDate = new Date(endDate);
        } else if (billingType === 'annual' || billingType === 'yearly') {
            subscriptionEndDate = new Date(now);
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 yıl
        } else {
            subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
        }
        // Banka havalesi seçildiyse PENDING, kredi kartı ise ACTIVE
        const subscriptionStatus = paymentMethod === 'bank_transfer' ? _client.SubscriptionStatus.PENDING : _client.SubscriptionStatus.ACTIVE;
        const subscription = await this.prisma.subscription.create({
            data: {
                id: require('uuid').v4(),
                tenantId,
                planId: finalPlanId,
                status: subscriptionStatus,
                startDate: subscriptionStartDate,
                endDate: subscriptionEndDate,
                trialEndsAt: null,
                autoRenew: paymentMethod === 'credit_card',
                nextBillingDate: subscriptionEndDate
            },
            include: {
                plan: true,
                tenant: true
            }
        });
        // Payment kaydı oluştur (banka havalesi için)
        if (paymentMethod === 'bank_transfer') {
            const plan = await this.prisma.plan.findUnique({
                where: {
                    id: finalPlanId
                }
            });
            if (plan) {
                await this.prisma.payment.create({
                    data: {
                        subscriptionId: subscription.id,
                        amount: plan.price,
                        currency: plan.currency || 'TRY',
                        status: 'PENDING',
                        paymentMethod: 'bank_transfer'
                    }
                });
            }
        }
        return subscription;
    }
    async findAll() {
        return this.prisma.subscription.findMany({
            include: {
                tenant: {
                    include: {
                        users: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                id
            },
            include: {
                tenant: {
                    include: {
                        users: true
                    }
                }
            }
        });
        if (!subscription) {
            throw new _common.NotFoundException(`Subscription with ID ${id} not found`);
        }
        return subscription;
    }
    async findByTenantId(tenantId) {
        return this.prisma.subscription.findUnique({
            where: {
                tenantId
            },
            include: {
                tenant: true
            }
        });
    }
    async update(id, updateSubscriptionDto) {
        return this.prisma.subscription.update({
            where: {
                id
            },
            data: updateSubscriptionDto,
            include: {
                tenant: true
            }
        });
    }
    async cancel(id) {
        return this.prisma.subscription.update({
            where: {
                id
            },
            data: {
                autoRenew: false,
                canceledAt: new Date(),
                status: _client.SubscriptionStatus.CANCELED
            }
        });
    }
    async reactivate(id) {
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                id
            },
            include: {
                plan: true
            }
        });
        if (!subscription) {
            throw new _common.NotFoundException('Subscription not found');
        }
        if (subscription.status !== _client.SubscriptionStatus.CANCELED) {
            throw new _common.BadRequestException('Sadece iptal edilmiş abonelikler tekrar aktif edilebilir');
        }
        const now = new Date();
        // Eğer endDate geçmişteyse, yeni bir endDate hesapla (1 yıl sonra)
        let endDate = subscription.endDate;
        if (endDate < now) {
            endDate = new Date(now);
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        // Aboneliği tekrar aktif et
        const updatedSubscription = await this.prisma.subscription.update({
            where: {
                id
            },
            data: {
                status: _client.SubscriptionStatus.ACTIVE,
                autoRenew: true,
                canceledAt: null,
                startDate: now,
                endDate: endDate,
                nextBillingDate: endDate
            },
            include: {
                plan: true,
                tenant: true
            }
        });
        // Tenant'ı da aktif et (eğer varsa)
        if (subscription.tenantId) {
            await this.prisma.tenant.update({
                where: {
                    id: subscription.tenantId
                },
                data: {
                    status: _client.TenantStatus.ACTIVE
                }
            });
        }
        return updatedSubscription;
    }
    async remove(id) {
        return this.prisma.subscription.delete({
            where: {
                id
            }
        });
    }
    async startTrial(userId) {
        if (!userId) {
            throw new _common.BadRequestException('User ID is required');
        }
        // Kullanıcıyı bul
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                tenant: true
            }
        });
        if (!user) {
            throw new _common.NotFoundException('User not found');
        }
        // Tenant yoksa oluştur
        let tenant = user.tenant;
        if (!tenant) {
            tenant = await this.prisma.tenant.create({
                data: {
                    name: user.fullName || user.email,
                    status: _client.TenantStatus.TRIAL
                }
            });
            // User'ın tenantId'sini güncelle
            await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    tenantId: tenant.id
                }
            });
        }
        // Mevcut abonelik var mı kontrol et
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId: tenant.id
            }
        });
        if (existingSubscription) {
            // Eğer deneme aboneliği varsa, hata ver
            if (existingSubscription.status === _client.SubscriptionStatus.TRIAL) {
                throw new _common.BadRequestException('Zaten bir deneme aboneliğiniz var');
            }
            // Eğer aktif abonelik varsa, hata ver
            if (existingSubscription.status === _client.SubscriptionStatus.ACTIVE) {
                throw new _common.BadRequestException('Zaten aktif bir aboneliğiniz var');
            }
        }
        // Deneme paketini bul (slug: 'trial')
        const trialPlan = await this.prisma.plan.findFirst({
            where: {
                slug: 'trial'
            }
        });
        if (!trialPlan) {
            throw new _common.NotFoundException('Trial package not found');
        }
        // Deneme aboneliği oluştur
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 gün
        const subscription = await this.prisma.subscription.create({
            data: {
                id: (0, _uuid.v4)(),
                tenantId: tenant.id,
                planId: trialPlan.id,
                status: _client.SubscriptionStatus.TRIAL,
                startDate: now,
                endDate: trialEnd,
                trialEndsAt: trialEnd,
                autoRenew: false
            },
            include: {
                plan: true,
                tenant: true
            }
        });
        // Tenant status'unu güncelle
        await this.prisma.tenant.update({
            where: {
                id: tenant.id
            },
            data: {
                status: _client.TenantStatus.TRIAL
            }
        });
        return subscription;
    }
    async upgradeFromTrial(userId, planName) {
        // Kullanıcıyı bul
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                tenant: {
                    include: {
                        subscription: {
                            include: {
                                plan: true
                            }
                        }
                    }
                }
            }
        });
        if (!user || !user.tenant) {
            throw new _common.NotFoundException('User or tenant not found');
        }
        const tenant = user.tenant;
        const existingSubscription = tenant.subscription;
        // Eğer abonelik yoksa veya deneme değilse hata ver
        if (!existingSubscription) {
            throw new _common.BadRequestException('Trial subscription not found');
        }
        if (existingSubscription.status !== _client.SubscriptionStatus.TRIAL) {
            throw new _common.BadRequestException('Sadece deneme aboneliği yükseltilebilir');
        }
        // Plan adını slug'a çevir
        const planSlug = planName.toLowerCase();
        const plan = await this.prisma.plan.findFirst({
            where: {
                slug: planSlug
            }
        });
        if (!plan) {
            throw new _common.NotFoundException(`Plan 'planName' not found`);
        }
        // Yıllık abonelik için tarihleri hesapla
        const now = new Date();
        const endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 yıl
        // Mevcut aboneliği güncelle
        const updatedSubscription = await this.prisma.subscription.update({
            where: {
                id: existingSubscription.id
            },
            data: {
                planId: plan.id,
                status: _client.SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate: endDate,
                trialEndsAt: null,
                autoRenew: true,
                nextBillingDate: endDate
            },
            include: {
                plan: true,
                tenant: true
            }
        });
        // Tenant status'unu güncelle
        await this.prisma.tenant.update({
            where: {
                id: tenant.id
            },
            data: {
                status: _client.TenantStatus.ACTIVE
            }
        });
        return updatedSubscription;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SubscriptionsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SubscriptionsService);

//# sourceMappingURL=subscriptions.service.js.map