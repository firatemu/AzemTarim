"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bSyncController", {
    enumerable: true,
    get: function() {
        return B2bSyncController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bsyncservice = require("./b2b-sync.service");
const _triggerb2bsyncdto = require("./dto/trigger-b2b-sync.dto");
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
let B2bSyncController = class B2bSyncController {
    async status() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID not found');
        }
        return this.b2bSyncService.getLastSyncInfo(tenantId);
    }
    async trigger(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID not found');
        }
        return this.b2bSyncService.manualTrigger(tenantId, dto.syncType, {
            erpAccountId: dto.erpAccountId
        });
    }
    async exportOrder(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.BadRequestException('Tenant ID not found');
        }
        return this.b2bSyncService.enqueueExportOrder(tenantId, dto.orderId);
    }
    constructor(b2bSyncService, tenantResolver){
        this.b2bSyncService = b2bSyncService;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('status'),
    (0, _swagger.ApiOperation)({
        summary: 'Son B2B senkron logları ve tenant config özeti'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bSyncController.prototype, "status", null);
_ts_decorate([
    (0, _common.Post)('trigger'),
    (0, _swagger.ApiOperation)({
        summary: 'Manuel B2B senkron kuyruğa ekle'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _triggerb2bsyncdto.TriggerB2bSyncDto === "undefined" ? Object : _triggerb2bsyncdto.TriggerB2bSyncDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bSyncController.prototype, "trigger", null);
_ts_decorate([
    (0, _common.Post)('export-order'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B siparişini ERP’ye aktar (SalesOrder)'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _triggerb2bsyncdto.ExportB2bOrderDto === "undefined" ? Object : _triggerb2bsyncdto.ExportB2bOrderDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bSyncController.prototype, "exportOrder", null);
B2bSyncController = _ts_decorate([
    (0, _swagger.ApiTags)('b2b-sync'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('b2b/sync'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bsyncservice.B2bSyncService === "undefined" ? Object : _b2bsyncservice.B2bSyncService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bSyncController);

//# sourceMappingURL=b2b-sync.controller.js.map