"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LicensesService", {
    enumerable: true,
    get: function() {
        return LicensesService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _licenseservice = require("../../common/services/license.service");
const _invitationservice = require("../../common/services/invitation.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LicensesService = class LicensesService {
    /**
   * Tenant'ın lisans statusunu getir
   */ async getTenantLicenseStatus(tenantId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            },
            include: {
                plan: true,
                moduleLicenses: {
                    include: {
                        module: true
                    }
                }
            }
        });
        if (!subscription) {
            throw new _common.BadRequestException('Subscription not found');
        }
        const totalLimit = await this.licenseService.getTotalUserLimit(tenantId);
        const activeCount = await this.licenseService.getActiveLicensedUserCount(tenantId);
        // Modül lisans statusları
        const moduleStatuses = await Promise.all(subscription.moduleLicenses.map(async (ml)=>{
            const assigned = await this.licenseService.getAssignedModuleLicenseCount(tenantId, ml.module.slug);
            return {
                module: ml.module,
                purchased: ml.quantity,
                assigned,
                available: ml.quantity - assigned
            };
        }));
        return {
            subscription,
            userLimits: {
                total: totalLimit,
                active: activeCount,
                available: totalLimit - activeCount
            },
            modules: moduleStatuses
        };
    }
    /**
   * Kullanıcıya ana paket lisansı ata
   */ async assignBasePlanLicense(userId, assignedBy) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user || !user.tenantId) {
            throw new _common.BadRequestException('User not found');
        }
        // Kullanıcı limiti kontrolü
        const canAdd = await this.licenseService.canAddUser(user.tenantId);
        if (!canAdd) {
            throw new _common.ForbiddenException('User limit exceeded. You need to purchase additional users.');
        }
        await this.licenseService.assignBasePlanLicense(userId, assignedBy);
    }
    /**
   * Kullanıcıya modül lisansı ata
   */ async assignModuleLicense(userId, moduleSlug, assignedBy) {
        await this.licenseService.assignModuleLicense(userId, moduleSlug, assignedBy);
    }
    /**
   * Kullanıcıdan lisansı iptal et
   */ async revokeLicense(licenseId, revokedBy) {
        await this.licenseService.revokeLicense(licenseId, revokedBy);
    }
    /**
   * Kullanıcının lisanslarını getir
   */ async getUserLicenses(userId) {
        return await this.licenseService.getUserLicenses(userId);
    }
    /**
   * Tenant'ın tüm lisanslı kullanıcılarını getir
   */ async getTenantLicensedUsers(tenantId) {
        const users = await this.prisma.user.findMany({
            where: {
                tenantId,
                licenses: {
                    some: {
                        licenseType: 'BASE_PLAN',
                        revokedAt: null
                    }
                }
            },
            include: {
                licenses: {
                    where: {
                        revokedAt: null
                    },
                    include: {
                        module: true
                    }
                }
            }
        });
        return users;
    }
    /**
   * Tenant'ın tüm kullanıcılarını getir (lisanslı ve lisanssız)
   */ async getAllTenantUsers(tenantId) {
        const users = await this.prisma.user.findMany({
            where: {
                tenantId
            },
            include: {
                licenses: {
                    where: {
                        revokedAt: null
                    },
                    include: {
                        module: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users;
    }
    /**
   * Ek kullanıcı satın al
   */ async purchaseAdditionalUsers(tenantId, quantity) {
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            }
        });
        if (!subscription) {
            throw new _common.BadRequestException('Subscription not found');
        }
        await this.prisma.subscription.update({
            where: {
                tenantId
            },
            data: {
                additionalUsers: {
                    increment: quantity
                }
            }
        });
        return {
            message: `${quantity} additional users successfully added`,
            newTotal: subscription.additionalUsers + quantity
        };
    }
    /**
   * Modül lisansı satın al
   */ async purchaseModuleLicense(tenantId, moduleSlug, quantity) {
        const module = await this.prisma.module.findUnique({
            where: {
                slug: moduleSlug
            }
        });
        if (!module) {
            throw new _common.BadRequestException(`Module not found: ${moduleSlug}`);
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            }
        });
        if (!subscription) {
            throw new _common.BadRequestException('Subscription not found');
        }
        // Mevcut lisans var mı kontrol et
        const existing = await this.prisma.moduleLicense.findFirst({
            where: {
                subscriptionId: subscription.id,
                moduleId: module.id
            }
        });
        if (existing) {
            // Mevcut lisansı güncelle
            await this.prisma.moduleLicense.update({
                where: {
                    id: existing.id
                },
                data: {
                    quantity: {
                        increment: quantity
                    }
                }
            });
        } else {
            // Yeni lisans oluştur
            await this.prisma.moduleLicense.create({
                data: {
                    subscriptionId: subscription.id,
                    moduleId: module.id,
                    quantity
                }
            });
        }
        return {
            message: `${quantity} licenses for module ${module.name} successfully added`
        };
    }
    constructor(prisma, licenseService, invitationService, tenantResolver){
        this.prisma = prisma;
        this.licenseService = licenseService;
        this.invitationService = invitationService;
        this.tenantResolver = tenantResolver;
    }
};
LicensesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _licenseservice.LicenseService === "undefined" ? Object : _licenseservice.LicenseService,
        typeof _invitationservice.InvitationService === "undefined" ? Object : _invitationservice.InvitationService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], LicensesService);

//# sourceMappingURL=licenses.service.js.map