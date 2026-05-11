"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bEffectiveCustomerGuard", {
    enumerable: true,
    get: function() {
        return B2bEffectiveCustomerGuard;
    }
});
const _common = require("@nestjs/common");
const _b2bportalactorservice = require("../services/b2b-portal-actor.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bEffectiveCustomerGuard = class B2bEffectiveCustomerGuard {
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        req.effectiveB2bCustomerId = await this.actor.resolveEffectiveCustomerId(req, user);
        return true;
    }
    constructor(actor){
        this.actor = actor;
    }
};
B2bEffectiveCustomerGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bportalactorservice.B2bPortalActorService === "undefined" ? Object : _b2bportalactorservice.B2bPortalActorService
    ])
], B2bEffectiveCustomerGuard);

//# sourceMappingURL=b2b-effective-customer.guard.js.map