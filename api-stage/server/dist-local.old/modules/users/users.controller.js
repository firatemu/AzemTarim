"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersController", {
    enumerable: true,
    get: function() {
        return UsersController;
    }
});
const _common = require("@nestjs/common");
const _usersservice = require("./users.service");
const _updateuserroledto = require("./dto/update-user-role.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _rolesguard = require("../../common/guards/roles.guard");
const _permissionsguard = require("../../common/guards/permissions.guard");
const _requirepermissionsdecorator = require("../../common/decorators/require-permissions.decorator");
const _client = require("@prisma/client");
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
let UsersController = class UsersController {
    findAll(search, limit, page, role) {
        return this.usersService.findAll(search, limit ? parseInt(limit) : 100, page ? parseInt(page) : 1, role);
    }
    async getStats() {
        return this.usersService.getStats();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    async suspend(id) {
        return this.usersService.suspend(id);
    }
    async updateRole(id, dto) {
        return this.usersService.updateRole(id, dto.role);
    }
    async remove(id) {
        await this.usersService.remove(id);
    }
    constructor(usersService){
        this.usersService = usersService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('search')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('role')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('stats/summary'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'users',
        action: 'view'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'users',
        action: 'view'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(':id/suspend'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'users',
        action: 'update'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "suspend", null);
_ts_decorate([
    (0, _common.Put)(':id/role'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_client.UserRole.SUPER_ADMIN, _client.UserRole.TENANT_ADMIN),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'roles',
        action: 'update'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateuserroledto.UpdateUserRoleDto === "undefined" ? Object : _updateuserroledto.UpdateUserRoleDto
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _requirepermissionsdecorator.RequirePermissions)({
        module: 'users',
        action: 'delete'
    }),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
UsersController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _permissionsguard.PermissionsGuard),
    (0, _common.Controller)('users'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], UsersController);

//# sourceMappingURL=users.controller.js.map