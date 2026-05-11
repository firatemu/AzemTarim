"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JwtRefreshStrategy", {
    enumerable: true,
    get: function() {
        return JwtRefreshStrategy;
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
let JwtRefreshStrategy = class JwtRefreshStrategy extends (0, _passport.PassportStrategy)(_passportjwt.Strategy, 'jwt-refresh') {
    async validate(req, payload) {
        const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
        if (!refreshToken) {
            throw new _common.UnauthorizedException();
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        });
        if (!user || !user.isActive) {
            throw new _common.UnauthorizedException();
        }
        // Token Version kontrolü
        const tokenVersion = payload.tokenVersion ?? 0;
        if (user.tokenVersion !== tokenVersion) {
            console.log(`❌ [JWT Refresh] Token version mismatch for user ${user.id}. JWT: ${tokenVersion}, DB: ${user.tokenVersion}`);
            throw new _common.UnauthorizedException('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            refreshToken
        };
    }
    constructor(prisma, redisService){
        super({
            jwtFromRequest: _passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
            passReqToCallback: true
        }), this.prisma = prisma, this.redisService = redisService;
    }
};
JwtRefreshStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService
    ])
], JwtRefreshStrategy);

//# sourceMappingURL=jwt-refresh.strategy.js.map