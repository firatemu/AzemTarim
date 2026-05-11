"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsService", {
    enumerable: true,
    get: function() {
        return TenantsService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _cipherservice = require("../../common/services/cipher.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TenantsService = class TenantsService {
    async create(createTenantDto) {
        return this.prisma.tenant.create({
            data: createTenantDto
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            include: {
                users: true,
                subscription: true
            }
        });
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id
            },
            include: {
                users: true,
                subscription: true
            }
        });
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        return this.prisma.tenant.update({
            where: {
                id
            },
            data: updateTenantDto
        });
    }
    async remove(id) {
        return this.prisma.tenant.delete({
            where: {
                id
            }
        });
    }
    async getCurrent(id) {
        if (!id) return null;
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id
            },
            include: {
                settings: true
            }
        });
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
    async approveTrial(tenantId) {
        // Önce tenant'ı plan olmadan çek (Prisma null plan hatası vermesin)
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: tenantId
            },
            include: {
                subscription: true
            }
        });
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        // Sadece PENDING veya TRIAL statusundaki deneme paketlerini onayla
        if (tenant.status !== 'PENDING' && tenant.status !== 'TRIAL') {
            throw new _common.BadRequestException('Tenant zaten onaylanmış veya farklı bir statusda');
        }
        if (!tenant.subscription) {
            throw new _common.BadRequestException('Subscription not found for tenant');
        }
        // Plan'ı ayrı bir sorgu ile çek (null olabilir)
        const plan = tenant.subscription.planId ? await this.prisma.plan.findUnique({
            where: {
                id: tenant.subscription.planId
            }
        }) : null;
        // Eğer plan varsa, deneme paketi kontrolü yap
        if (plan) {
            const isTrialPlan = plan.slug === 'trial' || Number(plan.price) === 0;
            if (!isTrialPlan) {
                throw new _common.BadRequestException('Bu tenant deneme paketi değil, ödeme bekliyor');
            }
        } else {
            // Plan yoksa, sadece subscription status'ü PENDING ise onayla (geçmiş veri uyumluluğu için)
            if (tenant.subscription.status !== 'PENDING' && tenant.subscription.status !== 'TRIAL') {
                throw new _common.BadRequestException('Subscription statusu onaylamaya uygun değil');
            }
        }
        // Tenant ve subscription'ı aktif yap
        // Plan'ı include etmeyelim (null olabilir, Prisma hatası verir)
        const updatedTenant = await this.prisma.tenant.update({
            where: {
                id: tenantId
            },
            data: {
                status: 'ACTIVE',
                subscription: {
                    update: {
                        status: 'ACTIVE'
                    }
                }
            },
            include: {
                subscription: true,
                users: true
            }
        });
        // Plan'ı ayrı çekip ekleyelim (eğer varsa)
        if (updatedTenant.subscription?.planId) {
            const updatedPlan = await this.prisma.plan.findUnique({
                where: {
                    id: updatedTenant.subscription.planId
                }
            });
            if (updatedPlan && updatedTenant.subscription) {
                updatedTenant.subscription.plan = updatedPlan;
            }
        }
        return updatedTenant;
    }
    async getSettings(tenantId) {
        if (!tenantId) {
            return null;
        }
        let settings = await this.prisma.tenantSettings.findUnique({
            where: {
                tenantId
            }
        });
        // Eğer settings yoksa, boş bir kayıt oluştur
        if (!settings) {
            settings = await this.prisma.tenantSettings.create({
                data: {
                    tenantId
                }
            });
        }
        return settings;
    }
    async updateSettings(tenantId, updateSettingsDto) {
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID not found');
        }
        // Encrypt sensitive fields if present
        const data = {
            ...updateSettingsDto
        };
        const sensitiveFields = [
            'smtpPassword',
            'iyzicoSecretKey',
            'gibPassword'
        ];
        for (const field of sensitiveFields){
            if (data[field]) {
                data[field] = await this.cipherService.encrypt(data[field]);
            }
        }
        // Önce mevcut settings'i kontrol et
        let settings = await this.prisma.tenantSettings.findUnique({
            where: {
                tenantId
            }
        });
        // Eğer yoksa oluştur
        if (!settings) {
            settings = await this.prisma.tenantSettings.create({
                data: {
                    tenantId,
                    ...data
                }
            });
        } else {
            // Varsa güncelle
            settings = await this.prisma.tenantSettings.update({
                where: {
                    tenantId
                },
                data: data
            });
        }
        return settings;
    }
    async updateLogo(tenantId, logoUrl) {
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID not found');
        }
        // Settings var mı kontrol et
        let settings = await this.prisma.tenantSettings.findUnique({
            where: {
                tenantId
            }
        });
        if (!settings) {
            settings = await this.prisma.tenantSettings.create({
                data: {
                    tenantId,
                    logoUrl
                }
            });
        } else {
            settings = await this.prisma.tenantSettings.update({
                where: {
                    tenantId
                },
                data: {
                    logoUrl
                }
            });
        }
        return settings;
    }
    constructor(prisma, cipherService, tenantResolver){
        this.prisma = prisma;
        this.cipherService = cipherService;
        this.tenantResolver = tenantResolver;
    }
};
TenantsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _cipherservice.CipherService === "undefined" ? Object : _cipherservice.CipherService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], TenantsService);

//# sourceMappingURL=tenants.service.js.map