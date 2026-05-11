"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantMiddleware", {
    enumerable: true,
    get: function() {
        return TenantMiddleware;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _prismaservice = require("../prisma.service");
const _tenantcontextservice = require("../services/tenant-context.service");
const _clsservice = require("../services/cls.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TenantMiddleware = class TenantMiddleware {
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
            console.warn('[TenantMiddleware] SystemParameter okuma hatası, fallback kullanılıyor:', error);
        }
        // Fallback: .env
        const fallbackId = process.env.STAGING_DEFAULT_TENANT_ID || null;
        if (fallbackId) {
            this.cachedStagingDefaultTenantId = fallbackId;
            return fallbackId;
        }
        // Fallback: veritabanında tek/ilk aktif tenant (staging için)
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
    async use(req, res, next) {
        // Giriş işlemi için tenant ID set etme (global kullanıcılar için)
        // req.path sadece '/' döndürüyor, originalUrl kullanmalıyız
        if (req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/register') {
            return next();
        }
        // B2B Portal: tenant ERP JWT + staging fallback ile belirlenmez; domain + B2B JWT guard kullanılır
        // B2B Admin için normal tenant akışını kullan (admin normal ERP tenant'ı kullanır)
        if (req.originalUrl?.startsWith('/api/b2b/portal')) {
            return next();
        }
        // CLS context başlat ve middleware mantığını içine al
        _clsservice.ClsService.run(async ()=>{
            try {
                await this.handleRequest(req);
                // Tenant ID'yi CLS'e kaydet
                if (req.tenantId) {
                    _clsservice.ClsService.setTenantId(req.tenantId);
                }
                next();
            } catch (error) {
                console.error('[TenantMiddleware] Error:', error);
                next(error);
            }
        });
    }
    async handleRequest(req) {
        // 1. Header'dan Tenant ID oku
        let tenantIdFromHeader = req.headers['x-tenant-id'];
        if (!tenantIdFromHeader) {
            tenantIdFromHeader = req.headers['X-Tenant-Id'] || req.headers['tenant-id'] || req.headers['Tenant-Id'];
        }
        const nodeEnv = process.env.NODE_ENV;
        const isStaging = nodeEnv === 'staging' || nodeEnv === 'development' || process.env.STAGING_DISABLE_TENANT === 'true';
        const stagingDefaultTenantId = await this.getStagingDefaultTenantId();
        // 2. Authorization header'dan token'ı çıkar
        const authHeader = req.headers.authorization;
        let jwtPayload;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                jwtPayload = this.jwtService.verify(token, {
                    secret: process.env.JWT_ACCESS_SECRET || 'secret'
                });
                req.userId = jwtPayload.sub;
                req.tenantId = jwtPayload.tenantId;
                req.jwtPayload = jwtPayload;
                req.user = jwtPayload;
            } catch (error) {
            // Token geçersizse misafir olarak devam et
            }
        }
        // 2.5. Staging'de tenantId doğrulaması (JWT'den gelen ID veritabanında yoksa fallback için temizle)
        if (req.tenantId && isStaging) {
            const tenantExists = await this.prisma.tenant.findUnique({
                where: {
                    id: req.tenantId
                },
                select: {
                    id: true
                }
            });
            if (!tenantExists) {
                console.warn(`[TenantMiddleware] Invalid tenantId in JWT/Header: ${req.tenantId}, clearing for fallback.`);
                req.tenantId = undefined;
            }
        }
        // 3. User bazlı kontroller (Token varsa)
        if (jwtPayload?.sub) {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: jwtPayload.sub
                },
                include: {
                    tenant: true
                }
            });
            if (user) {
                const userRole = user.role?.toString() || user.role;
                const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin' || userRole.toLowerCase() === 'super_admin';
                this.tenantContext.setUserRole(userRole);
                if (isSuperAdmin) {
                    this.tenantContext.setUserRole('SUPER_ADMIN');
                    // Super admin için header'dan gelirse zaten aşağıda set edilecek.
                    // Ancak user.tenantId varsa, varsayılan olarak onu set edelim.
                    if (user.tenantId) {
                        req.tenantId = user.tenantId;
                        this.tenantContext.setTenant(user.tenantId, user.id);
                    } else {
                        req.tenantId = undefined;
                    }
                } else if (user.tenantId) {
                    req.tenantId = user.tenantId;
                    this.tenantContext.setTenant(user.tenantId, user.id);
                }
                req.jwtPayload = {
                    ...jwtPayload,
                    user
                };
                req.user = {
                    ...jwtPayload,
                    user
                };
            }
        }
        // 4. Header veya Staging Default (Super admin olsa bile header'dan geleni kabul et)
        const isSuperAdminNow = this.tenantContext.isSuperAdmin();
        if (tenantIdFromHeader) {
            req.tenantId = tenantIdFromHeader;
            this.tenantContext.setTenant(tenantIdFromHeader, req.userId || 'header-user');
        } else if (!req.tenantId && !isSuperAdminNow && isStaging && stagingDefaultTenantId) {
            req.tenantId = stagingDefaultTenantId;
            this.tenantContext.setTenant(stagingDefaultTenantId, req.userId || 'staging-default');
        }
    }
    constructor(jwtService, prisma, tenantContext){
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.tenantContext = tenantContext;
        // Cache for staging default tenant ID
        this.cachedStagingDefaultTenantId = undefined;
    }
};
TenantMiddleware = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], TenantMiddleware);

//# sourceMappingURL=tenant.middleware.js.map