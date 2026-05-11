"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BLicenseGuard", {
    enumerable: true,
    get: function() {
        return B2BLicenseGuard;
    }
});
const _common = require("@nestjs/common");
const _b2blicensecacheservice = require("../services/b2b-license-cache.service");
const _tenantresolverservice = require("../services/tenant-resolver.service");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2BLicenseGuard = class B2BLicenseGuard {
    async canActivate(context) {
        // Development mode'da lisans kontrolünü atla
        const isDevMode = process.env.NODE_ENV === 'development';
        if (isDevMode) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const tenantId = req.b2bTenantId ?? await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new _common.ForbiddenException('B2B module license is not active');
        }
        // Production'da lisans kontrolü zorunlu
        await this.licenseCache.assertActiveOrThrow(tenantId);
        return true;
    }
    constructor(licenseCache, tenantResolver, config){
        this.licenseCache = licenseCache;
        this.tenantResolver = tenantResolver;
        this.config = config;
    }
};
B2BLicenseGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2blicensecacheservice.B2bLicenseCacheService === "undefined" ? Object : _b2blicensecacheservice.B2bLicenseCacheService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], B2BLicenseGuard);

//# sourceMappingURL=b2b-license.guard.js.map