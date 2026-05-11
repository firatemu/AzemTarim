"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceOrchestratorController", {
    enumerable: true,
    get: function() {
        return InvoiceOrchestratorController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../../common/guards/jwt-auth.guard");
const _invoiceorchestratorservice = require("../services/invoice-orchestrator.service");
const _reconciliationservice = require("../services/reconciliation.service");
const _orchestratordto = require("../dto/orchestrator.dto");
const _invoiceorchestratortypes = require("../types/invoice-orchestrator.types");
const _tenantresolverservice = require("../../../common/services/tenant-resolver.service");
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
let InvoiceOrchestratorController = class InvoiceOrchestratorController {
    async approve(id, dto, req) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        const userId = req.user.id;
        await this.orchestratorService.approveInvoice(id, {
            invoiceId: id,
            tenantId,
            userId,
            operationType: _invoiceorchestratortypes.InvoiceOperationType.APPROVE
        });
        return {
            message: 'Invoice approved and effects applied successfully'
        };
    }
    async cancel(id, dto, req) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        const userId = req.user.id;
        await this.orchestratorService.cancelInvoice(id, {
            invoiceId: id,
            tenantId,
            userId,
            operationType: _invoiceorchestratortypes.InvoiceOperationType.CANCEL
        }, dto.reason);
        return {
            message: 'Invoice cancelled and effects reversed successfully'
        };
    }
    async syncEffects(id, req) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        const userId = req.user.id;
        await this.orchestratorService.updateInvoiceItems(id, {
            invoiceId: id,
            tenantId,
            userId,
            operationType: _invoiceorchestratortypes.InvoiceOperationType.UPDATE
        });
        return {
            message: 'Invoice effects synchronized successfully'
        };
    }
    async getReconciliation(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        return this.reconciliationService.verifyInvoiceConsistency(id, tenantId);
    }
    async runFullReconciliation() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        return this.reconciliationService.runFullTenantReconciliation(tenantId);
    }
    async repairBalance(accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant context not found');
        return this.reconciliationService.repairAccountBalance(accountId, tenantId);
    }
    constructor(orchestratorService, reconciliationService, tenantResolver){
        this.orchestratorService = orchestratorService;
        this.reconciliationService = reconciliationService;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(InvoiceOrchestratorController.name);
    }
};
_ts_decorate([
    (0, _common.Post)(':id/approve'),
    (0, _swagger.ApiOperation)({
        summary: 'Faturayı onaylar ve stok/cari etkilerini uygular'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _orchestratordto.ApproveInvoiceDto === "undefined" ? Object : _orchestratordto.ApproveInvoiceDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "approve", null);
_ts_decorate([
    (0, _common.Post)(':id/cancel'),
    (0, _swagger.ApiOperation)({
        summary: 'Faturayı iptal eder ve etkileri tersine çevirir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _orchestratordto.CancelInvoiceDto === "undefined" ? Object : _orchestratordto.CancelInvoiceDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Patch)(':id/sync-effects'),
    (0, _swagger.ApiOperation)({
        summary: 'Fatura kalemleri değişikliği sonrası etkileri senkronize eder'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "syncEffects", null);
_ts_decorate([
    (0, _common.Get)(':id/reconciliation'),
    (0, _swagger.ApiOperation)({
        summary: 'Fatura tutarlılık (mutabakat) raporunu getirir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "getReconciliation", null);
_ts_decorate([
    (0, _common.Get)('reconciliation/run-all'),
    (0, _swagger.ApiOperation)({
        summary: 'Tüm onaylı faturalar için mutabakat taraması başlatır'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "runFullReconciliation", null);
_ts_decorate([
    (0, _common.Post)('accounts/:accountId/repair-balance'),
    (0, _swagger.ApiOperation)({
        summary: 'Hatalı cari bakiyesini hareket kayıtlarından yola çıkarak onarır'
    }),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceOrchestratorController.prototype, "repairBalance", null);
InvoiceOrchestratorController = _ts_decorate([
    (0, _swagger.ApiTags)('Invoice Orchestrator'),
    (0, _common.Controller)('invoice-orchestrator'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _invoiceorchestratorservice.InvoiceOrchestratorService === "undefined" ? Object : _invoiceorchestratorservice.InvoiceOrchestratorService,
        typeof _reconciliationservice.ReconciliationService === "undefined" ? Object : _reconciliationservice.ReconciliationService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], InvoiceOrchestratorController);

//# sourceMappingURL=invoice-orchestrator.controller.js.map