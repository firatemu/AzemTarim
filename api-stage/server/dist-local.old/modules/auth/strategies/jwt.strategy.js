"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JwtStrategy", {
    enumerable: true,
    get: function() {
        return JwtStrategy;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _passportjwt = require("passport-jwt");
const _prismaservice = require("../../../common/prisma.service");
const _redisservice = require("../../../common/services/redis.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let JwtStrategy = class JwtStrategy extends (0, _passport.PassportStrategy)(_passportjwt.Strategy, 'jwt') {
    async validate(req, payload) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            },
            include: {
                tenant: {
                    include: {
                        subscription: true
                    }
                }
            }
        });
        if (!user || !user.isActive) {
            throw new _common.UnauthorizedException('User not found or not active');
        }
        // Token Version kontrolü - JWT'deki version ile DB'deki version karşılaştır
        const tokenVersion = payload.tokenVersion ?? 0;
        if (user.tokenVersion !== tokenVersion) {
            console.log(`❌ [JWT] Token version mismatch for user ${user.id}. JWT: ${tokenVersion}, DB: ${user.tokenVersion}`);
            throw new _common.UnauthorizedException('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
        }
        // Redis ile aktif oturum kontrolü - Çoklu sekme desteği için gevşetildi
        // JWT ve TokenVersion kontrolü güvenlik için yeterlidir.
        // SUPER_ADMIN için tenant kontrolünü atla
        const userRole = user.role?.toString() || user.role;
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin' || userRole === 'super_admin';
        const isStaging = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'development';
        console.log('🔍 [JwtStrategy] Tenant validation:', {
            isStaging,
            userRole,
            isSuperAdmin,
            hasTenantId: !!user.tenantId,
            hasTenant: !!user.tenant
        });
        // Tenant kontrolü (SUPER_ADMIN hariç ve staging hariç)
        if (user.tenantId && !isSuperAdmin && !isStaging) {
            if (!user.tenant) {
                throw new _common.UnauthorizedException('Tenant not found');
            }
            // Tenant statusu kontrolü
            if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
                throw new _common.UnauthorizedException('Tenant aktif değil');
            }
            // Abonelik kontrolü
            if (user.tenant.subscription) {
                const subscription = user.tenant.subscription;
                const now = new Date();
                // İptal edilmiş abonelik kontrolü
                if (subscription.status === 'CANCELED') {
                    throw new _common.UnauthorizedException('Aboneliğiniz iptal edilmiştir. Sisteme giriş yapabilmek için aboneliğinizin aktif olması gerekmektedir.');
                }
                if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIAL') {
                    throw new _common.UnauthorizedException('Abonelik aktif değil');
                }
                if (subscription.endDate < now) {
                    throw new _common.UnauthorizedException('Abonelik süresi dolmuş');
                }
            }
        }
        // Son giriş artık sadece login işleminde güncelleniyor
        return {
            id: payload.sub,
            userId: payload.sub,
            email: payload.email,
            tenantId: user.tenantId || payload.tenantId,
            role: payload.role,
            permissions: payload.permissions || [],
            user
        };
    }
    constructor(prisma, redisService){
        super({
            jwtFromRequest: _passportjwt.ExtractJwt.fromExtractors([
                _passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req)=>{
                    // SSE (EventSource) query parameter üzerinden token gönderebilir
                    return req?.query?.token || null;
                }
            ]),
            secretOrKey: process.env.JWT_ACCESS_SECRET || 'secret',
            passReqToCallback: true
        }), this.prisma = prisma, this.redisService = redisService;
    }
};
JwtStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService
    ])
], JwtStrategy);

//# sourceMappingURL=jwt.strategy.js.map