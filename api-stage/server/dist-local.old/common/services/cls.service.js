"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClsService", {
    enumerable: true,
    get: function() {
        return ClsService;
    }
});
const _async_hooks = require("async_hooks");
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ClsService = class ClsService {
    static run(fn) {
        return this.storage.run(new Map(), fn);
    }
    static get(key) {
        const store = this.storage.getStore();
        return store?.get(key);
    }
    static set(key, value) {
        const store = this.storage.getStore();
        store?.set(key, value);
    }
    static getTenantId() {
        return this.get('tenantId');
    }
    static setTenantId(tenantId) {
        this.set('tenantId', tenantId);
    }
};
ClsService.storage = new _async_hooks.AsyncLocalStorage();
ClsService = _ts_decorate([
    (0, _common.Injectable)()
], ClsService);

//# sourceMappingURL=cls.service.js.map