"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RolesController", {
    enumerable: true,
    get: function() {
        return RolesController;
    }
});
const _common = require("@nestjs/common");
const _rolesservice = require("./roles.service");
const _createroledto = require("./dto/create-role.dto");
const _updateroledto = require("./dto/update-role.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _requirepermissionsdecorator = require("../../common/decorators/require-permissions.decorator");
const _tenantiddecorator = require("../../common/decorators/tenant-id.decorator");
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
let RolesController = class RolesController {
    create(tenantId, createRoleDto) {
        return this.rolesService.create(tenantId, createRoleDto);
    }
    findAll(tenantId) {
        return this.rolesService.findAll(tenantId);
    }
    getAllPermissions() {
        return this.rolesService.getAllPermissions();
    }
    findOne(tenantId, id) {
        return this.rolesService.findOne(tenantId, id);
    }
    update(tenantId, id, updateRoleDto) {
        return this.rolesService.update(tenantId, id, updateRoleDto);
    }
    remove(tenantId, id) {
        return this.rolesService.remove(tenantId, id);
    }
    constructor(rolesService){
        this.rolesService = rolesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'create'
    }),
    _ts_param(0, (0, _tenantiddecorator.TenantId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createroledto.CreateRoleDto === "undefined" ? Object : _createroledto.CreateRoleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'list'
    }),
    _ts_param(0, (0, _tenantiddecorator.TenantId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('permissions'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'view'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "getAllPermissions", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'view'
    }),
    _ts_param(0, (0, _tenantiddecorator.TenantId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'update'
    }),
    _ts_param(0, (0, _tenantiddecorator.TenantId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _updateroledto.UpdateRoleDto === "undefined" ? Object : _updateroledto.UpdateRoleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'delete'
    }),
    _ts_param(0, (0, _tenantiddecorator.TenantId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RolesController.prototype, "remove", null);
RolesController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _permissionsguard.PermissionsGuard),
    (0, _common.Controller)('roles'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _rolesservice.RolesService === "undefined" ? Object : _rolesservice.RolesService
    ])
], RolesController);

//# sourceMappingURL=roles.controller.js.map