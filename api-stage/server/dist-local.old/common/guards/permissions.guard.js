"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PermissionsGuard", {
    enumerable: true,
    get: function() {
        return PermissionsGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _permissionsservice = require("../../modules/permissions/permissions.service");
const _requirepermissionsdecorator = require("../decorators/require-permissions.decorator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PermissionsGuard = class PermissionsGuard {
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(_requirepermissionsdecorator.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming JwtAuthGuard adds user to request
        if (!user || !user.id) {
            // Should have been caught by AuthGuard, but safety first
            return false;
        }
        // Check all required permissions
        for (const permission of requiredPermissions){
            const hasPermission = await this.permissionsService.hasPermission(user.id, permission.module, permission.action);
            if (!hasPermission) {
                throw new _common.ForbiddenException(`Missing permission: ${permission.module}.${permission.action}`);
            }
        }
        return true;
    }
    constructor(reflector, permissionsService){
        this.reflector = reflector;
        this.permissionsService = permissionsService;
    }
};
PermissionsGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector,
        typeof _permissionsservice.PermissionsService === "undefined" ? Object : _permissionsservice.PermissionsService
    ])
], PermissionsGuard);

//# sourceMappingURL=permissions.guard.js.map