"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminCustomerClassesController", {
    enumerable: true,
    get: function() {
        return B2bAdminCustomerClassesController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bcustomerclassdto = require("./dto/b2b-customer-class.dto");
const _b2badmincustomerclassservice = require("./services/b2b-admin-customer-class.service");
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
let B2bAdminCustomerClassesController = class B2bAdminCustomerClassesController {
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
        summary: 'Müşteri sınıfları'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomerClassesController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sınıf oluştur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bcustomerclassdto.CreateB2bCustomerClassDto === "undefined" ? Object : _b2bcustomerclassdto.CreateB2bCustomerClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomerClassesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Sınıf güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bcustomerclassdto.UpdateB2bCustomerClassDto === "undefined" ? Object : _b2bcustomerclassdto.UpdateB2bCustomerClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomerClassesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Sınıf sil (atanmış cari yoksa)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomerClassesController.prototype, "remove", null);
B2bAdminCustomerClassesController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/customer-classes'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badmincustomerclassservice.B2bAdminCustomerClassService === "undefined" ? Object : _b2badmincustomerclassservice.B2bAdminCustomerClassService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminCustomerClassesController);

//# sourceMappingURL=b2b-admin-customer-classes.controller.js.map