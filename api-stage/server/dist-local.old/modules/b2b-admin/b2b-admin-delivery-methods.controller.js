"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminDeliveryMethodsController", {
    enumerable: true,
    get: function() {
        return B2bAdminDeliveryMethodsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bdeliverydto = require("./dto/b2b-delivery.dto");
const _b2badmindeliveryservice = require("./services/b2b-admin-delivery.service");
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
let B2bAdminDeliveryMethodsController = class B2bAdminDeliveryMethodsController {
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
        return this.service.softDelete(await this.tenantWrite(), id);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Teslimat yöntemleri'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDeliveryMethodsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Teslimat yöntemi oluştur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bdeliverydto.CreateB2bDeliveryMethodDto === "undefined" ? Object : _b2bdeliverydto.CreateB2bDeliveryMethodDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDeliveryMethodsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bdeliverydto.UpdateB2bDeliveryMethodDto === "undefined" ? Object : _b2bdeliverydto.UpdateB2bDeliveryMethodDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDeliveryMethodsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Pasifleştir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminDeliveryMethodsController.prototype, "remove", null);
B2bAdminDeliveryMethodsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/delivery-methods'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badmindeliveryservice.B2bAdminDeliveryService === "undefined" ? Object : _b2badmindeliveryservice.B2bAdminDeliveryService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminDeliveryMethodsController);

//# sourceMappingURL=b2b-admin-delivery-methods.controller.js.map