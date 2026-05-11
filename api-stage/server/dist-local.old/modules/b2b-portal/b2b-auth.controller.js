"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAuthController", {
    enumerable: true,
    get: function() {
        return B2bAuthController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _b2blogindto = require("./dto/b2b-login.dto");
const _b2bauthservice = require("./services/b2b-auth.service");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let B2bAuthController = class B2bAuthController {
    login(dto) {
        return this.auth.login(dto.domain, dto.email, dto.password);
    }
    forgotPassword() {
        return {
            statusCode: 501,
            message: 'B2B sifre sifirlama admin uzerinden yapilir'
        };
    }
    refresh() {
        return {
            statusCode: 501,
            message: 'B2B refresh token henuz desteklenmiyor'
        };
    }
    async me(req) {
        const user = req.user;
        return this.auth.getMe(user);
    }
    constructor(auth){
        this.auth = auth;
    }
};
_ts_decorate([
    (0, _common.Post)('login'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B müşteri girişi (domain + email + şifre)'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2blogindto.B2bLoginDto === "undefined" ? Object : _b2blogindto.B2bLoginDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bAuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.Post)('forgot-password'),
    (0, _common.HttpCode)(_common.HttpStatus.NOT_IMPLEMENTED),
    (0, _swagger.ApiOperation)({
        summary: 'Sifre sifirlama (henuz yok)'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], B2bAuthController.prototype, "forgotPassword", null);
_ts_decorate([
    (0, _common.Post)('refresh'),
    (0, _common.HttpCode)(_common.HttpStatus.NOT_IMPLEMENTED),
    (0, _swagger.ApiOperation)({
        summary: 'Refresh token (henuz yok)'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], B2bAuthController.prototype, "refresh", null);
_ts_decorate([
    (0, _common.Get)('me'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard),
    (0, _swagger.ApiBearerAuth)(),
    (0, _swagger.ApiOperation)({
        summary: 'Oturum: musteri veya satis temsilcisi profili'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof ExpressRequest === "undefined" ? Object : ExpressRequest
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAuthController.prototype, "me", null);
B2bAuthController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bauthservice.B2bAuthService === "undefined" ? Object : _b2bauthservice.B2bAuthService
    ])
], B2bAuthController);

//# sourceMappingURL=b2b-auth.controller.js.map