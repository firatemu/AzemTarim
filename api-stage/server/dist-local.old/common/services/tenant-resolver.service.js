"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantResolverService", {
    enumerable: true,
    get: function() {
        return TenantResolverService;
    }
});
const _common = require("@nestjs/common");
const _tenantcontextservice = require("./tenant-context.service");
const _prismaservice = require("../prisma.service");
const _stagingutil = require("../utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TenantResolverService = class TenantResolverService {
    /**
   * Create / FK kullanımı için tenant ID çözümle (kasa, cari, fatura, vb.)
   */ async resolveForCreate(options) {
        return this.resolve({
            userId: options?.userId,
            allowNull: options?.allowNull ?? false
        });
    }
    /**
   * Liste/filtre sorguları için tenant ID çözümle (findAll, findFirst, vb.)
   */ async resolveForQuery(options) {
        return this.resolve({
            userId: options?.userId,
            allowNull: true
        });
    }
    /**
   * Staging default tenant ID'yi veritabanından al (cache'li)
   */ async getStagingDefaultTenantId() {
        // Cache kontrolü
        if (this.cachedStagingDefaultTenantId !== undefined) {
            return this.cachedStagingDefaultTenantId;
        }
        try {
            // Veritabanından oku
            const parameter = await this.prisma.systemParameter.findFirst({
                where: {
                    key: 'STAGING_DEFAULT_TENANT_ID',
                    tenantId: null
                }
            });
            if (parameter && parameter.value != null) {
                const v = parameter.value;
                const id = typeof v === 'string' ? v : v?.id ?? v?.value;
                if (typeof id === 'string' && id.length > 0) {
                    this.cachedStagingDefaultTenantId = id;
                    return id;
                }
            }
        } catch (error) {
            console.warn('[TenantResolverService] SystemParameter okuma hatası, fallback kullanılıyor:', error);
        }
        // Fallback: .env
        let fallbackId = process.env.STAGING_DEFAULT_TENANT_ID || null;
        if (fallbackId) {
            this.cachedStagingDefaultTenantId = fallbackId;
            return fallbackId;
        }
        // Fallback: veritabanında tek tenant varsa onu kullan (staging için)
        try {
            const first = await this.prisma.tenant.findFirst({
                where: {
                    status: 'ACTIVE'
                },
                select: {
                    id: true
                }
            });
            if (first?.id) {
                this.cachedStagingDefaultTenantId = first.id;
                return first.id;
            }
        } catch (_) {}
        this.cachedStagingDefaultTenantId = null;
        return null;
    }
    async resolve(options) {
        let tenantId = this.tenantContext.getTenantId() ?? null;
        const effectiveUserId = options.userId || this.tenantContext.getUserId();
        // 2. Yoksa ve userId verilmişse: User.tenantId al; varsa context'e set et
        // Staging ortamında, frontend'den gelen hatalı header'ların (default tenant) 
        // faturanın bulunamamasına (404) yol açmaması için kullanıcı tenant'ını önceliklendiriyoruz.
        if (effectiveUserId && (!tenantId || (0, _stagingutil.isStagingEnvironment)())) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: effectiveUserId
                },
                select: {
                    tenantId: true
                }
            });
            if (user?.tenantId) {
                tenantId = user.tenantId;
                this.tenantContext.setTenant(tenantId, effectiveUserId);
            }
        }
        // 3. Hâlâ yoksa ve staging/dev: STAGING_DEFAULT_TENANT_ID (sadece DB'de varsa)
        if (!tenantId && (0, _stagingutil.isStagingEnvironment)()) {
            const defaultId = await this.getStagingDefaultTenantId();
            if (defaultId) {
                const exists = await this.prisma.tenant.findUnique({
                    where: {
                        id: defaultId
                    },
                    select: {
                        id: true
                    }
                });
                if (exists) {
                    tenantId = defaultId;
                    this.tenantContext.setTenant(defaultId, options.userId || 'tenant-resolver-default');
                }
            }
        }
        // 4. Elde edilen tenantId null değilse DB'de varlık kontrolü
        if (tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: {
                    id: tenantId
                },
                select: {
                    id: true
                }
            });
            if (!tenant) {
                tenantId = null;
            }
        }
        // 5.–6. allowNull false ve tenant yoksa throw; allowNull true ise null dön
        if (!tenantId && !options.allowNull) {
            throw new _common.BadRequestException('Tenant bulunamadı. Lütfen tekrar giriş yapın veya yöneticinizle iletişime geçin.');
        }
        return tenantId;
    }
    constructor(tenantContext, prisma){
        this.tenantContext = tenantContext;
        this.prisma = prisma;
        // Cache for staging default tenant ID
        this.cachedStagingDefaultTenantId = undefined;
    }
};
TenantResolverService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], TenantResolverService);

//# sourceMappingURL=tenant-resolver.service.js.map