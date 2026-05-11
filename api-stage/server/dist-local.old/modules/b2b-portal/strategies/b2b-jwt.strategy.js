"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bJwtStrategy", {
    enumerable: true,
    get: function() {
        return B2bJwtStrategy;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _passport = require("@nestjs/passport");
const _passportjwt = require("passport-jwt");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bJwtStrategy = class B2bJwtStrategy extends (0, _passport.PassportStrategy)(_passportjwt.Strategy, 'b2b-jwt') {
    validate(payload) {
        if (!payload?.sub || !payload?.tenantId || !payload?.b2bDomainId) {
            throw new _common.UnauthorizedException('Geçersiz B2B oturumu');
        }
        return payload;
    }
    constructor(config){
        const base = config.get('JWT_ACCESS_SECRET') || config.get('JWT_SECRET') || 'secret';
        const secret = config.get('B2B_JWT_SECRET') || `${base}-b2b-portal`;
        super({
            jwtFromRequest: _passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }
};
B2bJwtStrategy = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], B2bJwtStrategy);

//# sourceMappingURL=b2b-jwt.strategy.js.map