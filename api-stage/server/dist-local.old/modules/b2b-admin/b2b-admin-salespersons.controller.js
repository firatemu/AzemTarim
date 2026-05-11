"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminSalespersonsController", {
    enumerable: true,
    get: function() {
        return B2bAdminSalespersonsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bsalespersondto = require("./dto/b2b-salesperson.dto");
const _b2badminsalespersonservice = require("./services/b2b-admin-salesperson.service");
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
let B2bAdminSalespersonsController = class B2bAdminSalespersonsController {
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
    async customers(id, page, limit) {
        return this.service.listCustomers(await this.tenant(), id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 25);
    }
    async create(dto) {
        return this.service.create(await this.tenantWrite(), dto);
    }
    async update(id, dto) {
        return this.service.update(await this.tenantWrite(), id, dto);
    }
    async assign(id, dto) {
        return this.service.assignCustomers(await this.tenantWrite(), id, dto);
    }
    async unassign(id, customerId) {
        return this.service.removeCustomer(await this.tenantWrite(), id, customerId);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Plasiyer listesi'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id/customers'),
    (0, _swagger.ApiOperation)({
        summary: 'Atanmış cariler'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('page')),
    _ts_param(2, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "customers", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Plasiyer oluştur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bsalespersondto.CreateB2bSalespersonDto === "undefined" ? Object : _b2bsalespersondto.CreateB2bSalespersonDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Plasiyer güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bsalespersondto.UpdateB2bSalespersonDto === "undefined" ? Object : _b2bsalespersondto.UpdateB2bSalespersonDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)(':id/assign-customers'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari ata'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bsalespersondto.AssignB2bCustomersDto === "undefined" ? Object : _b2bsalespersondto.AssignB2bCustomersDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "assign", null);
_ts_decorate([
    (0, _common.Delete)(':id/customers/:customerId'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari atamasını kaldır'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Param)('customerId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSalespersonsController.prototype, "unassign", null);
B2bAdminSalespersonsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/salespersons'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badminsalespersonservice.B2bAdminSalespersonService === "undefined" ? Object : _b2badminsalespersonservice.B2bAdminSalespersonService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminSalespersonsController);

//# sourceMappingURL=b2b-admin-salespersons.controller.js.map