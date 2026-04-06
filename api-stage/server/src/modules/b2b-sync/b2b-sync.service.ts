import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  B2BErpAdapter,
  B2BSyncStatus,
  B2BSyncType,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

export const B2B_SYNC_QUEUE = 'b2b-sync';

export type B2bSyncProductsJob = {
  tenantId: string;
  erpAdapterType: B2BErpAdapter;
};

export type B2bSyncStockJob = {
  tenantId: string;
  erpAdapterType: B2BErpAdapter;
  forceFull?: boolean;
};

export type B2bSyncMovementsJob = {
  tenantId: string;
  erpAdapterType: B2BErpAdapter;
  erpAccountId: string;
};

export type B2bExportOrderJob = {
  tenantId: string;
  erpAdapterType: B2BErpAdapter;
  orderId: string;
};

@Injectable()
export class B2bSyncService {
  private readonly logger = new Logger(B2bSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(B2B_SYNC_QUEUE) private readonly queue: Queue,
  ) { }

  async manualTrigger(
    tenantId: string,
    syncType: B2BSyncType,
    extra?: { erpAccountId?: string; orderId?: string; forceFull?: boolean },
  ): Promise<{ jobId: string | undefined }> {
    const config = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException('B2B tenant config not found');
    }

    const erpAdapterType = config.erpAdapterType;
    let jobName: string;
    let payload: Record<string, unknown>;

    switch (syncType) {
      case B2BSyncType.PRODUCTS:
        jobName = 'SYNC_PRODUCTS';
        payload = { tenantId, erpAdapterType };
        break;
      case B2BSyncType.PRICES:
        jobName = 'SYNC_PRICES';
        payload = { tenantId, erpAdapterType };
        break;
      case B2BSyncType.STOCK:
        jobName = 'SYNC_STOCK';
        payload = {
          tenantId,
          erpAdapterType,
          forceFull: extra?.forceFull ?? false,
        };
        break;
      case B2BSyncType.ACCOUNT_MOVEMENTS:
        if (!extra?.erpAccountId) {
          throw new BadRequestException(
            'erpAccountId required for ACCOUNT_MOVEMENTS',
          );
        }
        jobName = 'SYNC_ACCOUNT_MOVEMENTS';
        payload = {
          tenantId,
          erpAdapterType,
          erpAccountId: extra.erpAccountId,
        };
        break;
      case B2BSyncType.FULL:
        jobName = 'SYNC_FULL';
        payload = { tenantId, erpAdapterType };
        break;
      default:
        jobName = 'SYNC_PRODUCTS';
        payload = { tenantId, erpAdapterType };
    }

    const job = await this.queue.add(jobName, payload, this.jobOpts());
    this.logger.log(
      `manualTrigger tenant=${tenantId} syncType=${syncType} job=${job.id}`,
    );
    return { jobId: job.id };
  }

  private jobOpts() {
    return {
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 5000 },
    };
  }

  async enqueueExportOrder(
    tenantId: string,
    orderId: string,
  ): Promise<{ jobId: string | undefined }> {
    const config = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });
    if (!config) {
      throw new NotFoundException('B2B tenant config not found');
    }
    const job = await this.queue.add(
      'EXPORT_ORDER_TO_ERP',
      {
        tenantId,
        erpAdapterType: config.erpAdapterType,
        orderId,
      } satisfies B2bExportOrderJob,
      this.jobOpts(),
    );
    return { jobId: job.id };
  }

  async getLastSyncInfo(tenantId: string) {
    const config = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });
    const logs = await this.prisma.b2BSyncLog.findMany({
      where: { tenantId },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });
    return {
      lastSyncedAt: config?.lastSyncedAt ?? null,
      lastSyncRequestedAt: config?.lastSyncRequestedAt ?? null,
      syncIntervalMinutes: config?.syncIntervalMinutes ?? null,
      recentLogs: logs.map((l) => ({
        id: l.id,
        syncType: l.syncType,
        status: l.status,
        startedAt: l.startedAt,
        finishedAt: l.finishedAt,
        recordsProcessed: l.recordsProcessed,
        recordsAdded: l.recordsAdded,
        recordsUpdated: l.recordsUpdated,
        errorMessage: l.errorMessage,
      })),
    };
  }

  async markSyncLog(
    tenantId: string,
    syncType: B2BSyncType,
    status: B2BSyncStatus,
    patch: {
      startedAt?: Date;
      finishedAt?: Date | null;
      recordsProcessed?: number;
      recordsAdded?: number;
      recordsUpdated?: number;
      errorMessage?: string | null;
    },
  ) {
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
        errorMessage: patch.errorMessage ?? null,
      },
    });
  }
}
