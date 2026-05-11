"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminDiscountGroupsController", {
    enumerable: true,
    get: function() {
        return B2bAdminDiscountGroupsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bdiscountgroupdto = require("./dto/b2b-discount-group.dto");
const _b2badmindiscountgroupservice = require("./services/b2b-admin-discount-group.service");
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
let B2bAdminDiscountGroupsController = class B2bAdminDiscountGroupsController {
    async tenant() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async tenantWrite() {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async list() {
        return this.service.list(await this.tenant());
    }
    async create(dto) {
        return this.service.create(await this.tenantWrite(), dto);
    }
    async update(id, dto) {
        return this.service.update(await this.tenantWrite(), id, dto);
    }
    async remove(id) {
        return this.service.remove(await this.tenantWrite(), id);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'İskonto grupları'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDiscountGroupsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Grup oluştur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bdiscountgroupdto.CreateB2bDiscountGroupDto === "undefined" ? Object : _b2bdiscountgroupdto.CreateB2bDiscountGroupDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDiscountGroupsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Grup güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bdiscountgroupdto.UpdateB2bDiscountGroupDto === "undefined" ? Object : _b2bdiscountgroupdto.UpdateB2bDiscountGroupDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDiscountGroupsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Grup sil (atanmış cari yoksa)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDiscountGroupsController.prototype, "remove", null);
B2bAdminDiscountGroupsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/discount-groups'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badmindiscountgroupservice.B2bAdminDiscountGroupService === "undefined" ? Object : _b2badmindiscountgroupservice.B2bAdminDiscountGroupService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminDiscountGroupsController);

//# sourceMappingURL=b2b-admin-discount-groups.controller.js.map