"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LicenseService", {
    enumerable: true,
    get: function() {
        return LicenseService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma.service");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LicenseService = class LicenseService {
    /**
   * Kullanıcının ana paket lisansına sahip olup olmadığını kontrol eder
   */ async hasBasePlanLicense(userId) {
        const license = await this.prisma.userLicense.findFirst({
            where: {
                userId,
                licenseType: _client.LicenseType.BASE_PLAN,
                revokedAt: null
            }
        });
        return !!license;
    }
    /**
   * Kullanıcının belirli bir modül lisansına sahip olup olmadığını kontrol eder
   */ async hasModuleLicense(userId, moduleSlug) {
        const module = await this.prisma.module.findUnique({
            where: {
                slug: moduleSlug
            }
        });
        if (!module) {
            return false;
        }
        const license = await this.prisma.userLicense.findFirst({
            where: {
                userId,
                licenseType: _client.LicenseType.MODULE,
                moduleId: module.id,
                revokedAt: null
            }
        });
        return !!license;
    }
    /**
   * Tenant'ın toplam kullanıcı limitini hesaplar (ana paket + ek kullanıcılar)
   */ async getTotalUserLimit(tenantId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            },
            include: {
                plan: true
            }
        });
        if (!subscription) {
            return 0;
        }
        const baseLimit = subscription.plan.baseUserLimit || 0;
        const additionalUsers = subscription.additionalUsers || 0;
        return baseLimit + additionalUsers;
    }
    /**
   * Tenant'ta aktif lisanslı kullanıcı sayısını hesaplar
   */ async getActiveLicensedUserCount(tenantId) {
        return await this.prisma.userLicense.count({
            where: {
                user: {
                    tenantId
                },
                licenseType: _client.LicenseType.BASE_PLAN,
                revokedAt: null
            }
        });
    }
    /**
   * Tenant'ın kullanıcı limitini aşıp aşmadığını kontrol eder
   */ async canAddUser(tenantId) {
        const totalLimit = await this.getTotalUserLimit(tenantId);
        const activeCount = await this.getActiveLicensedUserCount(tenantId);
        return activeCount < totalLimit;
    }
    /**
   * Modül için satın alınan lisans sayısını döndürür
   */ async getModuleLicenseCount(tenantId, moduleSlug) {
        const module = await this.prisma.module.findUnique({
            where: {
                slug: moduleSlug
            }
        });
        if (!module) {
            return 0;
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: {
                tenantId
            },
            include: {
                moduleLicenses: {
                    where: {
                        moduleId: module.id
                    }
                }
            }
        });
        if (!subscription) {
            return 0;
        }
        return subscription.moduleLicenses.reduce((sum, ml)=>sum + ml.quantity, 0);
    }
    /**
   * Modül için atanmış lisans sayısını döndürür
   */ async getAssignedModuleLicenseCount(tenantId, moduleSlug) {
        const module = await this.prisma.module.findUnique({
            where: {
                slug: moduleSlug
            }
        });
        if (!module) {
            return 0;
        }
        return await this.prisma.userLicense.count({
            where: {
                user: {
                    tenantId
                },
                licenseType: _client.LicenseType.MODULE,
                moduleId: module.id,
                revokedAt: null
            }
        });
    }
    /**
   * Modül için yeni lisans atanabilir mi kontrol eder
   */ async canAssignModuleLicense(tenantId, moduleSlug) {
        const purchased = await this.getModuleLicenseCount(tenantId, moduleSlug);
        const assigned = await this.getAssignedModuleLicenseCount(tenantId, moduleSlug);
        return assigned < purchased;
    }
    /**
   * Kullanıcıya ana paket lisansı atar
   */ async assignBasePlanLicense(userId, assignedBy) {
        // Zaten lisansı var mı kontrol et
        const existing = await this.prisma.userLicense.findFirst({
            where: {
                userId,
                licenseType: _client.LicenseType.BASE_PLAN,
                revokedAt: null
            }
        });
        if (existing) {
            throw new _common.BadRequestException('Kullanıcının zaten ana paket lisansı var');
        }
        await this.prisma.userLicense.create({
            data: {
                userId,
                licenseType: _client.LicenseType.BASE_PLAN,
                assignedBy
            }
        });
    }
    /**
   * Kullanıcıya modül lisansı atar
   */ async assignModuleLicense(userId, moduleSlug, assignedBy) {
        const module = await this.prisma.module.findUnique({
            where: {
                slug: moduleSlug
            }
        });
        if (!module) {
            throw new _common.BadRequestException(`Modül bulunamadı: ${moduleSlug}`);
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user || !user.tenantId) {
            throw new _common.BadRequestException('Kullanıcı bulunamadı veya tenant\'a ait değil');
        }
        // Lisans atanabilir mi kontrol et
        const canAssign = await this.canAssignModuleLicense(user.tenantId, moduleSlug);
        if (!canAssign) {
            throw new _common.ForbiddenException('Bu modül için yeterli lisans yok');
        }
        // Zaten lisansı var mı kontrol et
        const existing = await this.prisma.userLicense.findFirst({
            where: {
                userId,
                licenseType: _client.LicenseType.MODULE,
                moduleId: module.id,
                revokedAt: null
            }
        });
        if (existing) {
            throw new _common.BadRequestException('Kullanıcının zaten bu modül lisansı var');
        }
        await this.prisma.userLicense.create({
            data: {
                userId,
                licenseType: _client.LicenseType.MODULE,
                moduleId: module.id,
                assignedBy
            }
        });
    }
    /**
   * Kullanıcıdan lisansı iptal eder
   */ async revokeLicense(licenseId, revokedBy) {
        const license = await this.prisma.userLicense.findUnique({
            where: {
                id: licenseId
            }
        });
        if (!license) {
            throw new _common.BadRequestException('Lisans bulunamadı');
        }
        if (license.revokedAt) {
            throw new _common.BadRequestException('Lisans zaten iptal edilmiş');
        }
        await this.prisma.userLicense.update({
            where: {
                id: licenseId
            },
            data: {
                revokedAt: new Date(),
                revokedBy
            }
        });
    }
    /**
   * Kullanıcının tüm aktif lisanslarını döndürür
   */ async getUserLicenses(userId) {
        return await this.prisma.userLicense.findMany({
            where: {
                userId,
                revokedAt: null
            },
            include: {
                module: true
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
LicenseService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], LicenseService);

//# sourceMappingURL=license.service.js.map