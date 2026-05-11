"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OutboxRelayService", {
    enumerable: true,
    get: function() {
        return OutboxRelayService;
    }
});
const _common = require("@nestjs/common");
const _schedule = require("@nestjs/schedule");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _prismaservice = require("../prisma.service");
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
let OutboxRelayService = class OutboxRelayService {
    /**
     * Her 5 saniyede PENDING event'leri BullMQ'ya relay et.
     * @nestjs/schedule ScheduleModule.forRoot() gerektirir (app.module.ts'de mevcut).
     */ async relayPendingEvents() {
        // Aynı anda iki relay çalışmasını önle
        if (this.isRunning) return;
        this.isRunning = true;
        try {
            const events = await this.prisma.outboxEvent?.findMany({
                where: {
                    status: 'PENDING',
                    attempts: {
                        lt: 5
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                },
                take: 100
            });
            if (events.length === 0) return;
            this.logger.debug(`${events.length} PENDING outbox event relay ediliyor...`);
            for (const event of events){
                await this.relayEvent(event);
            }
        } catch (err) {
            this.logger.error('OutboxRelayService genel hata:', err);
        } finally{
            this.isRunning = false;
        }
    }
    async relayEvent(event) {
        try {
            // BullMQ'ya job ekle
            // jobId = idempotencyKey → Aynı event iki kez queue'ya giremez
            await this.workOrderQueue.add(event.eventType, {
                outboxEventId: event.id,
                idempotencyKey: event.idempotencyKey,
                ...event.payload
            }, {
                jobId: event.idempotencyKey
            });
            // Başarıyla publish edildi
            await this.prisma.outboxEvent?.update({
                where: {
                    id: event.id
                },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: new Date()
                }
            });
            this.logger.log(`[${event.payload?.tenantId}] ${event.eventType} publish edildi (aggId: ${event.payload?.workOrderId ?? event.id})`);
        } catch (err) {
            const newAttempts = event.attempts + 1;
            const isFinalFailure = newAttempts >= 5;
            await this.prisma.outboxEvent?.update({
                where: {
                    id: event.id
                },
                data: {
                    attempts: {
                        increment: 1
                    },
                    status: isFinalFailure ? 'FAILED' : 'PENDING',
                    errorMessage: err?.message ?? 'Bilinmeyen hata'
                }
            });
            this.logger.error(`Outbox relay başarısız (attempt ${newAttempts}/5): ${event.eventType} [${event.id}]`, err?.message);
        }
    }
    constructor(prisma, workOrderQueue){
        this.prisma = prisma;
        this.workOrderQueue = workOrderQueue;
        this.logger = new _common.Logger(OutboxRelayService.name);
        this.isRunning = false; // Concurrent execution guard
    }
};
_ts_decorate([
    (0, _schedule.Cron)(_schedule.CronExpression.EVERY_5_SECONDS),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], OutboxRelayService.prototype, "relayPendingEvents", null);
OutboxRelayService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _bullmq.InjectQueue)('work-order-events')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], OutboxRelayService);

//# sourceMappingURL=outbox-relay.service.js.map