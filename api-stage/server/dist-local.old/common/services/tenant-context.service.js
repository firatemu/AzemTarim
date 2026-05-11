"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantContextService", {
    enumerable: true,
    get: function() {
        return TenantContextService;
    }
});
const _common = require("@nestjs/common");
const _clsservice = require("./cls.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TenantContextService = class TenantContextService {
    /**
   * Validates if the current execution context has a valid tenant or system privilege.
   * Creates a 'Fail-Fast' mechanism.
   */ validateContext() {
        if (this.isSystem()) return;
        if (this.isSuperAdmin()) return;
        const tenantId = this.getTenantId();
        if (!tenantId) {
            this.logger.error('Security Alert: Tenant context missing in protected operation.');
            throw new _common.BadRequestException('Tenant context missing. Operation aborted.');
        }
    }
    getTenantId() {
        return _clsservice.ClsService.getTenantId();
    }
    getUserId() {
        return _clsservice.ClsService.get('userId');
    }
    setTenant(tenantId, userId) {
        if (!tenantId) throw new Error('Cannot set empty tenantId');
        _clsservice.ClsService.setTenantId(tenantId);
        _clsservice.ClsService.set('userId', userId);
    }
    setUserRole(role) {
        _clsservice.ClsService.set('userRole', role);
    }
    isSuperAdmin() {
        const role = _clsservice.ClsService.get('userRole');
        return role === 'SUPER_ADMIN' || role === 'SuperAdmin' || role === 'super_admin' || role === 'SUPERADMIN';
    }
    isSystem() {
        return _clsservice.ClsService.get('isSystem') === true;
    }
    /**
   * Run a callback with system privileges (bypassing tenant checks)
   * Use with CAUTION.
   * usage: await this.tenantContext.runAsSystem(async () => { ... });
   */ async runAsSystem(callback) {
        return _clsservice.ClsService.run(async ()=>{
            _clsservice.ClsService.set('isSystem', true);
            return callback();
        });
    }
    /**
   * Run a callback within a specific tenant context
   * Useful for background jobs (BullMQ) where HTTP request context is missing.
   * usage: await this.tenantContext.runWithTenantContext(tenantId, userId, async () => { ... });
   */ async runWithTenantContext(tenantId, userId, callback) {
        if (!tenantId) throw new Error('Tenant ID required for context hydration');
        return _clsservice.ClsService.run(async ()=>{
            _clsservice.ClsService.setTenantId(tenantId);
            if (userId) _clsservice.ClsService.set('userId', userId);
            return callback();
        });
    }
    constructor(){
        this.logger = new _common.Logger(TenantContextService.name);
    }
};
TenantContextService = _ts_decorate([
    (0, _common.Injectable)()
], TenantContextService);

//# sourceMappingURL=tenant-context.service.js.map