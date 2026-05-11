"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bClaimsMatchGuard", {
    enumerable: true,
    get: function() {
        return B2bClaimsMatchGuard;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2bClaimsMatchGuard = class B2bClaimsMatchGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user?.tenantId || !user?.b2bDomainId) {
            throw new _common.ForbiddenException('B2B oturumu geçersiz');
        }
        if (req.b2bTenantId !== user.tenantId || req.b2bDomainId !== user.b2bDomainId) {
            throw new _common.ForbiddenException('Domain ile oturum eşleşmiyor');
        }
        return true;
    }
};
B2bClaimsMatchGuard = _ts_decorate([
    (0, _common.Injectable)()
], B2bClaimsMatchGuard);

//# sourceMappingURL=b2b-claims-match.guard.js.map