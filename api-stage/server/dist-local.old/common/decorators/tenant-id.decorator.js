"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantId", {
    enumerable: true,
    get: function() {
        return TenantId;
    }
});
const _common = require("@nestjs/common");
const TenantId = (0, _common.createParamDecorator)((data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.user?.tenantId;
    if (!tenantId) {
        // Ideally this should be handled by a global guard or middleware, but safe to check here
        // For SuperAdmin context without specific tenant, this might be undefined.
        // But RolesService requires tenantId.
        throw new _common.BadRequestException('Tenant Context Required');
    }
    return tenantId;
});

//# sourceMappingURL=tenant-id.decorator.js.map