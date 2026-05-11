"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminOrdersController", {
    enumerable: true,
    get: function() {
        return B2bAdminOrdersController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2borderdto = require("./dto/b2b-order.dto");
const _b2badminorderservice = require("./services/b2b-admin-order.service");
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
let B2bAdminOrdersController = class B2bAdminOrdersController {
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
    async export(q, res) {
        const buf = await this.service.exportExcel(await this.tenant(), q);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=b2b-orders.xlsx`,
            'Content-Length': buf.length
        });
        res.end(buf);
    }
    async list(q) {
        return this.service.list(await this.tenant(), q);
    }
    async getOne(id) {
        return this.service.getOne(await this.tenant(), id);
    }
    async approve(id) {
        return this.service.approve(await this.tenantWrite(), id);
    }
    async reject(id, dto) {
        return this.service.reject(await this.tenantWrite(), id, dto.reason);
    }
    async patchStatus(id, dto) {
        return this.service.patchStatus(await this.tenantWrite(), id, dto);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('export'),
    (0, _swagger.ApiOperation)({
        summary: 'Filtreli siparişleri Excel indir'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2borderdto.B2bOrderListQueryDto === "undefined" ? Object : _b2borderdto.B2bOrderListQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "export", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sipariş listesi'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2borderdto.B2bOrderListQueryDto === "undefined" ? Object : _b2borderdto.B2bOrderListQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Sipariş detayı'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "getOne", null);
_ts_decorate([
    (0, _common.Post)(':id/approve'),
    (0, _swagger.ApiOperation)({
        summary: 'Onayla ve ERP export kuyruğuna al'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "approve", null);
_ts_decorate([
    (0, _common.Post)(':id/reject'),
    (0, _swagger.ApiOperation)({
        summary: 'Reddet (not düşer)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2borderdto.RejectB2bOrderDto === "undefined" ? Object : _b2borderdto.RejectB2bOrderDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "reject", null);
_ts_decorate([
    (0, _common.Patch)(':id/status'),
    (0, _swagger.ApiOperation)({
        summary: 'Durum geçişi (VALID_TRANSITIONS)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2borderdto.PatchB2bOrderStatusDto === "undefined" ? Object : _b2borderdto.PatchB2bOrderStatusDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminOrdersController.prototype, "patchStatus", null);
B2bAdminOrdersController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/orders'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badminorderservice.B2bAdminOrderService === "undefined" ? Object : _b2badminorderservice.B2bAdminOrderService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminOrdersController);

//# sourceMappingURL=b2b-admin-orders.controller.js.map