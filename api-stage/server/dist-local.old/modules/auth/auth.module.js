"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _authservice = require("./auth.service");
const _authcontroller = require("./auth.controller");
const _jwtstrategy = require("./strategies/jwt.strategy");
const _jwtrefreshstrategy = require("./strategies/jwt-refresh.strategy");
const _prismamodule = require("../../common/prisma.module");
const _emailservice = require("../../common/services/email.service");
const _redismodule = require("../../common/services/redis.module");
const _licensemodule = require("../../common/services/license.module");
const _invitationservice = require("../../common/services/invitation.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _passport.PassportModule,
            _jwt.JwtModule.register({}),
            _prismamodule.PrismaModule,
            _redismodule.RedisModule,
            _licensemodule.LicenseModule
        ],
        controllers: [
            _authcontroller.AuthController
        ],
        providers: [
            _authservice.AuthService,
            _emailservice.EmailService,
            _invitationservice.InvitationService,
            _jwtstrategy.JwtStrategy,
            _jwtrefreshstrategy.JwtRefreshStrategy
        ],
        exports: [
            _authservice.AuthService
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map