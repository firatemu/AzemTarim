"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ModuleAccessGuard", {
    enumerable: true,
    get: function() {
        return ModuleAccessGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _licenseservice = require("../services/license.service");
const _requiremoduledecorator = require("../decorators/require-module.decorator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ModuleAccessGuard = class ModuleAccessGuard {
    async canActivate(context) {
        const moduleSlug = this.reflector.get(_requiremoduledecorator.MODULE_KEY, context.getHandler());
        if (!moduleSlug) {
            // Modül gereksinimi yoksa geç
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.userId) {
            throw new _common.ForbiddenException('Kullanıcı bilgisi bulunamadı');
        }
        // SUPER_ADMIN ve TENANT_ADMIN için modül kontrolü yapma
        const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
        if (isAdmin) {
            return true;
        }
        // Modül lisansı kontrolü
        const hasLicense = await this.licenseService.hasModuleLicense(user.userId, moduleSlug);
        if (!hasLicense) {
            throw new _common.ForbiddenException(`Bu modüle erişim için lisans gereklidir: ${moduleSlug}`);
        }
        return true;
    }
    constructor(reflector, licenseService){
        this.reflector = reflector;
        this.licenseService = licenseService;
    }
};
ModuleAccessGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector,
        typeof _licenseservice.LicenseService === "undefined" ? Object : _licenseservice.LicenseService
    ])
], ModuleAccessGuard);

//# sourceMappingURL=module-access.guard.js.map