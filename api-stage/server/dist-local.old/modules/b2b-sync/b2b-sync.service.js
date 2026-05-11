"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get B2B_SYNC_QUEUE () {
        return B2B_SYNC_QUEUE;
    },
    get B2bSyncService () {
        return B2bSyncService;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _client = require("@prisma/client");
const _prismaservice = require("../../common/prisma.service");
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
const B2B_SYNC_QUEUE = 'b2b-sync';
let B2bSyncService = class B2bSyncService {
    async manualTrigger(tenantId, syncType, extra) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) {
            throw new _common.NotFoundException('B2B tenant config not found');
        }
        const erpAdapterType = config.erpAdapterType;
        let jobName;
        let payload;
        switch(syncType){
            case _client.B2BSyncType.PRODUCTS:
                jobName = 'SYNC_PRODUCTS';
                payload = {
                    tenantId,
                    erpAdapterType
                };
                break;
            case _client.B2BSyncType.PRICES:
                jobName = 'SYNC_PRICES';
                payload = {
                    tenantId,
                    erpAdapterType
                };
                break;
            case _client.B2BSyncType.STOCK:
                throw new _common.BadRequestException('Stok senkronu kuyrukta kullanılmıyor; B2B stok ve fiyatlar ERP’den anlık okunur.');
            case _client.B2BSyncType.ACCOUNT_MOVEMENTS:
                if (!extra?.erpAccountId) {
                    throw new _common.BadRequestException('erpAccountId required for ACCOUNT_MOVEMENTS');
                }
                jobName = 'SYNC_ACCOUNT_MOVEMENTS';
                payload = {
                    tenantId,
                    erpAdapterType,
                    erpAccountId: extra.erpAccountId
                };
                break;
            case _client.B2BSyncType.FULL:
                jobName = 'SYNC_FULL';
                payload = {
                    tenantId,
                    erpAdapterType
                };
                break;
            default:
                jobName = 'SYNC_PRODUCTS';
                payload = {
                    tenantId,
                    erpAdapterType
                };
        }
        const job = await this.queue.add(jobName, payload, this.jobOpts());
        this.logger.log(`manualTrigger tenant=${tenantId} syncType=${syncType} job=${job.id}`);
        return {
            jobId: job.id
        };
    }
    jobOpts() {
        return {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        };
    }
    /** Tüm B2B carileri için ERP cari hareketlerini tek kuyruk işinde çeker (bakiye listesi için). */ async enqueueSyncAllAccountMovements(tenantId) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) {
            throw new _common.NotFoundException('B2B tenant config not found');
        }
        const job = await this.queue.add('SYNC_ALL_ACCOUNT_MOVEMENTS', {
            tenantId,
            erpAdapterType: config.erpAdapterType
        }, this.jobOpts());
        this.logger.log(`enqueueSyncAllAccountMovements tenant=${tenantId} job=${job.id}`);
        return {
            jobId: job.id
        };
    }
    async enqueueExportOrder(tenantId, orderId) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) {
            throw new _common.NotFoundException('B2B tenant config not found');
        }
        const job = await this.queue.add('EXPORT_ORDER_TO_ERP', {
            tenantId,
            erpAdapterType: config.erpAdapterType,
            orderId
        }, this.jobOpts());
        return {
            jobId: job.id
        };
    }
    async getLastSyncInfo(tenantId) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        const logs = await this.prisma.b2BSyncLog.findMany({
            where: {
                tenantId
            },
            orderBy: {
                startedAt: 'desc'
            },
            take: 10
        });
        return {
            lastSyncedAt: config?.lastSyncedAt ?? null,
            lastSyncRequestedAt: config?.lastSyncRequestedAt ?? null,
            syncIntervalMinutes: config?.syncIntervalMinutes ?? null,
            recentLogs: logs.map((l)=>({
                    id: l.id,
                    syncType: l.syncType,
                    status: l.status,
                    startedAt: l.startedAt,
                    finishedAt: l.finishedAt,
                    recordsProcessed: l.recordsProcessed,
                    recordsAdded: l.recordsAdded,
                    recordsUpdated: l.recordsUpdated,
                    errorMessage: l.errorMessage
                }))
        };
    }
    async markSyncLog(tenantId, syncType, status, patch) {
        return this.prisma.b2BSyncLog.create({
            data: {
                tenantId,
                syncType,
                status,
                startedAt: patch.startedAt ?? new Date(),
                finishedAt: patch.finishedAt ?? null,
                recordsProcessed: patch.recordsProcessed ?? 0,
                recordsAdded: patch.recordsAdded ?? 0,
                recordsUpdated: patch.recordsUpdated ?? 0,
                errorMessage: patch.errorMessage ?? null
            }
        });
    }
    constructor(prisma, queue){
        this.prisma = prisma;
        this.queue = queue;
        this.logger = new _common.Logger(B2bSyncService.name);
    }
};
B2bSyncService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _bullmq.InjectQueue)(B2B_SYNC_QUEUE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], B2bSyncService);

//# sourceMappingURL=b2b-sync.service.js.map