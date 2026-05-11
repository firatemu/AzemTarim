"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminTenantController", {
    enumerable: true,
    get: function() {
        return AdminTenantController;
    }
});
const _common = require("@nestjs/common");
const _tenantpurgeservice = require("./tenant-purge.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _userroleenum = require("../../common/enums/user-role.enum");
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
let AdminTenantController = class AdminTenantController {
    /**
     * List all tenants eligible for purging
     * Only SUPER_ADMIN can access
     */ async listPurgeable(request) {
        if (request.user.role !== _userroleenum.UserRole.SUPER_ADMIN) {
            throw new _common.ForbiddenException('Only super admins can access this endpoint');
        }
        return this.purgeService.listPurgeableTenants();
    }
    /**
     * Manually purge a tenant's data (IRREVERSIBLE)
     * Only SUPER_ADMIN can access
     * Requires tenant to be in CANCELLED/SUSPENDED/EXPIRED status
     */ async purgeTenant(tenantId, request) {
        if (request.user.role !== _userroleenum.UserRole.SUPER_ADMIN) {
            throw new _common.ForbiddenException('Only super admins can purge tenants');
        }
        const admin = request.user;
        const ipAddress = request.ip || request.connection.remoteAddress;
        await this.purgeService.purgeTenantData({
            tenantId,
            adminId: admin.id,
            adminEmail: admin.email,
            ipAddress
        });
        return {
            success: true,
            message: 'Tenant data purged successfully'
        };
    }
    /**
     * Get purge audit log
     * Only SUPER_ADMIN can access
     */ async getPurgeAudit(tenantId, request) {
        if (request.user.role !== _userroleenum.UserRole.SUPER_ADMIN) {
            throw new _common.ForbiddenException('Only super admins can view audit logs');
        }
        return this.purgeService.getPurgeAuditLog(tenantId);
    }
    constructor(purgeService){
        this.purgeService = purgeService;
    }
};
_ts_decorate([
    (0, _common.Get)('purgeable'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminTenantController.prototype, "listPurgeable", null);
_ts_decorate([
    (0, _common.Post)('purge'),
    _ts_param(0, (0, _common.Body)('tenantId')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminTenantController.prototype, "purgeTenant", null);
_ts_decorate([
    (0, _common.Get)('purge-audit'),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminTenantController.prototype, "getPurgeAudit", null);
AdminTenantController = _ts_decorate([
    (0, _common.Controller)('admin/tenants'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantpurgeservice.TenantPurgeService === "undefined" ? Object : _tenantpurgeservice.TenantPurgeService
    ])
], AdminTenantController);

//# sourceMappingURL=admin-tenant.controller.js.map