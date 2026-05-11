"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceEffectsProcessor", {
    enumerable: true,
    get: function() {
        return InvoiceEffectsProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _costingservice = require("../../costing/costing.service");
const _reconciliationservice = require("../services/reconciliation.service");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let InvoiceEffectsProcessor = class InvoiceEffectsProcessor extends _bullmq.WorkerHost {
    async process(job) {
        const { invoiceId, tenantId } = job.data;
        switch(job.name){
            case 'COSTING_RECALCULATE':
                return this.handleCostingRecalculate(invoiceId, tenantId);
            case 'RECONCILIATION_CHECK':
                return this.handleReconciliationCheck(invoiceId, tenantId);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
                return null;
        }
    }
    async handleCostingRecalculate(invoiceId, tenantId) {
        this.logger.log(`Processing costing recalculation for invoice: ${invoiceId}`);
        // Fatura kalemlerindeki benzersiz ürünleri bul
        const items = await this.prisma.invoiceItem.findMany({
            where: {
                invoiceId,
                tenantId
            },
            select: {
                productId: true
            },
            distinct: [
                'productId'
            ]
        });
        for (const item of items){
            try {
                await this.costingService.calculateWeightedAverageCost(item.productId);
                this.logger.log(`Costing updated for product: ${item.productId}`);
            } catch (error) {
                this.logger.error(`Costing failed for product ${item.productId}: ${error.message}`);
            }
        }
    }
    async handleReconciliationCheck(invoiceId, tenantId) {
        this.logger.log(`Processing reconciliation check for invoice: ${invoiceId}`);
        try {
            const report = await this.reconciliationService.verifyInvoiceConsistency(invoiceId, tenantId);
            if (!report.isConsistent) {
                this.logger.warn(`Inconsistency detected in invoice ${invoiceId}: ${report.errors.join(', ')}`);
            // Eğer cari tutarı tutarsızsa, opsiyonel olarak bakiye onarımı tetiklenebilir
            // Şimdilik sadece logluyoruz.
            } else {
                this.logger.log(`Invoice ${invoiceId} is consistent.`);
            }
            return report;
        } catch (error) {
            this.logger.error(`Reconciliation check failed for invoice ${invoiceId}: ${error.message}`);
            throw error;
        }
    }
    constructor(costingService, reconciliationService, prisma){
        super(), this.costingService = costingService, this.reconciliationService = reconciliationService, this.prisma = prisma, this.logger = new _common.Logger(InvoiceEffectsProcessor.name);
        console.log('--- INVOICE EFFECTS PROCESSOR INITIALIZED (v2 - Path Fixed) ---');
    }
};
InvoiceEffectsProcessor = _ts_decorate([
    (0, _bullmq.Processor)('invoice-effects'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _costingservice.CostingService === "undefined" ? Object : _costingservice.CostingService,
        typeof _reconciliationservice.ReconciliationService === "undefined" ? Object : _reconciliationservice.ReconciliationService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], InvoiceEffectsProcessor);

//# sourceMappingURL=invoice-effects.processor.js.map