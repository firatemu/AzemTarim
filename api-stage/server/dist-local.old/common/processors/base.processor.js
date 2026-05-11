"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseProcessor", {
    enumerable: true,
    get: function() {
        return BaseProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BaseProcessor = class BaseProcessor extends _bullmq.WorkerHost {
    async process(job) {
        const { tenantId, userId, action } = job.data;
        if (!tenantId) {
            this.logger.error(`[Job ${job.id}] Missing tenantId in job data`);
            throw new Error('Tenant ID is required for background jobs');
        }
        return this.tenantContext.runWithTenantContext(tenantId, userId, async ()=>{
            this.logger.log(`[Job ${job.id}] Processing ${action} for tenant ${tenantId}`);
            try {
                return await this.handle(job);
            } catch (error) {
                this.logger.error(`[Job ${job.id}] Failed: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
    onCompleted(job) {
        this.logger.log(`[Job ${job.id}] Completed`);
    }
    onFailed(job, error) {
        this.logger.error(`[Job ${job.id}] Failed: ${error.message}`);
    }
    constructor(tenantContext){
        super(), this.tenantContext = tenantContext;
    }
};
_ts_decorate([
    (0, _bullmq.OnWorkerEvent)('completed'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bullmq1.Job === "undefined" ? Object : _bullmq1.Job
    ]),
    _ts_metadata("design:returntype", void 0)
], BaseProcessor.prototype, "onCompleted", null);
_ts_decorate([
    (0, _bullmq.OnWorkerEvent)('failed'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bullmq1.Job === "undefined" ? Object : _bullmq1.Job,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], BaseProcessor.prototype, "onFailed", null);

//# sourceMappingURL=base.processor.js.map