"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _jwtrefreshguard = require("../../common/guards/jwt-refresh.guard");
const _getcurrentuserdecorator = require("../../common/decorators/get-current-user.decorator");
const _publicdecorator = require("../../common/decorators/public.decorator");
const _emailservice = require("../../common/services/email.service");
const _invitationservice = require("../../common/services/invitation.service");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
let AuthController = class AuthController {
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async refreshTokens(userId, refreshToken) {
        return this.authService.refreshTokens(userId, refreshToken);
    }
    async logout(userId) {
        return this.authService.logout(userId);
    }
    async getProfile(userId) {
        return this.authService.getProfile(userId);
    }
    async changePassword(userId, dto) {
        return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }
    async acceptInvitation(body) {
        // Şifreyi hash'le
        const hashedPassword = await _bcrypt.hash(body.password, 10);
        const result = await this.invitationService.acceptInvitation(body.token, hashedPassword, body.firstName, body.lastName);
        // Kullanıcı oluşturulduktan sonra otomatik giriş yap
        // Login metodunu kullan (şifre zaten hash'lenmiş, ama login'de tekrar hash kontrolü yapılacak)
        // Bu yüzden kullanıcıyı bulup token oluşturuyoruz
        const user = await this.authService.getProfile(result.user.id);
        // Login metodunu çağırmak yerine, kullanıcı bilgilerini döndürüyoruz
        // Frontend'de kullanıcı login sayfasına yönlendirilebilir
        return {
            ...result,
            message: 'Davet başarıyla kabul edildi. Lütfen giriş yapın.',
            user
        };
    }
    async testWelcomeEmail(body) {
        try {
            await this.emailService.sendWelcomeEmail(body.email, body.firstName, body.lastName);
            return {
                success: true,
                message: `Hoş geldiniz maili gönderildi: ${body.email}`
            };
        } catch (error) {
            return {
                success: false,
                message: `Mail gönderme hatası: ${error.message}`
            };
        }
    }
    constructor(authService, emailService, invitationService){
        this.authService = authService;
        this.emailService = emailService;
        this.invitationService = invitationService;
    }
};
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('register'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.RegisterDto === "undefined" ? Object : _dto.RegisterDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('login'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.LoginDto === "undefined" ? Object : _dto.LoginDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtrefreshguard.JwtRefreshGuard),
    (0, _common.Post)('refresh'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('refreshToken')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)('logout'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Get)('profile'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Patch)('change-password'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.ChangePasswordDto === "undefined" ? Object : _dto.ChangePasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('accept-invitation'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvitation", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('test-welcome-email'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "testWelcomeEmail", null);
AuthController = _ts_decorate([
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _invitationservice.InvitationService === "undefined" ? Object : _invitationservice.InvitationService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map