"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DlqWorker", {
    enumerable: true,
    get: function() {
        return DlqWorker;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma.service");
const _tenantcontextservice = require("../services/tenant-context.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DlqWorker = class DlqWorker extends _bullmq.WorkerHost {
    async process(job) {
        const { tenantId, originalQueue, eventType, failedReason } = job.data;
        if (!tenantId) {
            this.logger.error('[DLQ] Missing tenantId in job data');
            throw new Error('Tenant ID is required for DLQ worker');
        }
        this.logger.error(`[DLQ][${tenantId}] Job kalıcı olarak başarısız: eventType=${eventType}, queue=${originalQueue}`, failedReason);
        // Tenant context set et ve RLS ile çalıştır
        return this.tenantContext.runWithTenantContext(tenantId, undefined, async ()=>{
            /*
            // OutboxEvent'i FAILED olarak işaretle
            if (job.data.outboxEventId) {
                await (this.prisma as any).outboxEvent.update({
                    where: { id: job.data.outboxEventId },
                    data: {
                        status: 'FAILED',
                        attempts: { increment: 1 },
                        errorMessage: failedReason ?? 'DLQ: Max deneme aşıldı',
                    },
                });
            }
            */ // TODO: Gerçek bildirim entegrasyonu:
            // - Slack webhook: POST https://hooks.slack.com/services/...
            // - E-posta: nodemailer ile sistem admin ve tenant admin'e
            // - PagerDuty / OpsGenie API çağrısı
            //
            // Örnek log format (monitoring araçları için parse edilebilir):
            this.logger.error(JSON.stringify({
                level: 'CRITICAL',
                type: 'DLQ_JOB',
                tenantId,
                jobId: job.id,
                eventType,
                originalQueue,
                failedReason,
                timestamp: new Date().toISOString()
            }));
            return {
                handled: true
            };
        });
    }
    onFailed(job, error) {
        // DLQ worker'ı bile başarısız olursa logla
        this.logger.error(`[DLQ] DLQ worker başarısız: ${job.id}`, error.message);
    }
    constructor(prisma, tenantContext){
        super(), this.prisma = prisma, this.tenantContext = tenantContext, this.logger = new _common.Logger(DlqWorker.name);
    }
};
_ts_decorate([
    (0, _bullmq.OnWorkerEvent)('failed'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bullmq1.Job === "undefined" ? Object : _bullmq1.Job,
        typeof Error === "undefined" ? Object : Error
    ]),
    _ts_metadata("design:returntype", void 0)
], DlqWorker.prototype, "onFailed", null);
DlqWorker = _ts_decorate([
    (0, _bullmq.Processor)('dead-letter-queue'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], DlqWorker);

//# sourceMappingURL=dlq.worker.js.map