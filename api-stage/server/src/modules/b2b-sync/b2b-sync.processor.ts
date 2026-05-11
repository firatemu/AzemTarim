import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  B2BErpAdapter,
  B2BMovementType,
  B2BOrderStatus,
  B2BSyncStatus,
  B2BSyncType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { B2BAdapterFactory } from './adapters/b2b-adapter.factory';
import type { B2BOrderExportDto } from './dto/erp-types.dto';
import { B2B_SYNC_QUEUE } from './b2b-sync.service';
import type {
  B2bExportOrderJob,
  B2bSyncMovementsJob,
  B2bSyncProductsJob,
} from './b2b-sync.service';

@Processor(B2B_SYNC_QUEUE)
export class B2bSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(B2bSyncProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adapterFactory: B2BAdapterFactory,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(
      `Job failed name=${job?.name} id=${job?.id}: ${err.message}`,
      err.stack,
    );
  }

  async process(job: Job): Promise<void> {
    const started = Date.now();
    switch (job.name) {
      case 'SYNC_FULL':
        await this.handleSyncProducts(job.data as B2bSyncProductsJob, true);
        await this.handleSyncPrices(job.data as B2bSyncProductsJob, true);
        break;
      case 'SYNC_PRODUCTS':
        await this.handleSyncProducts(job.data as B2bSyncProductsJob, false);
        break;
      case 'SYNC_PRICES':
        await this.handleSyncPrices(job.data as B2bSyncProductsJob, false);
        break;
      case 'SYNC_ALL_ACCOUNT_MOVEMENTS':
        await this.handleSyncAllAccountMovements(job.data as B2bSyncProductsJob);
        break;
      case 'SYNC_ACCOUNT_MOVEMENTS':
        await this.handleSyncMovements(job.data as B2bSyncMovementsJob);
        break;
      case 'EXPORT_ORDER_TO_ERP':
        await this.handleExportOrder(job.data as B2bExportOrderJob);
        break;
      default:
        this.logger.warn(`Unknown b2b-sync job: ${job.name}`);
    }
    this.logger.log(`Job ${job.name} done in ${Date.now() - started}ms`);
  }

  private resolveAdapter(tenantId: string, type: B2BErpAdapter) {
    return this.adapterFactory.create(type, tenantId);
  }

  private async handleSyncProducts(data: B2bSyncProductsJob, isFullSync = false): Promise<void> {
    const { tenantId, erpAdapterType } = data;
    const log = await this.prisma.b2BSyncLog.create({
      data: {
        tenantId,
        syncType: B2BSyncType.PRODUCTS,
        status: B2BSyncStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const loop = await this.prisma.b2BSyncLoop.findUnique({
        where: { tenantId_syncType: { tenantId, syncType: B2BSyncType.PRODUCTS } },
      });
      const lastSyncedAt = isFullSync ? null : (loop?.lastRunAt ?? null);

      const adapter = this.resolveAdapter(tenantId, erpAdapterType);
      const products = await adapter.getProducts(lastSyncedAt);

      let added = 0;
      let updated = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const p of products) {
          const existing = await tx.b2BProduct.findUnique({
            where: {
              tenantId_stockCode: {
                tenantId,
                stockCode: p.stockCode,
              },
            },
          });

          await tx.b2BProduct.upsert({
            where: {
              tenantId_stockCode: {
                tenantId,
                stockCode: p.stockCode,
              },
            },
            create: {
              tenantId,
              erpProductId: p.erpProductId,
              stockCode: p.stockCode,
              name: p.name,
              description: p.description ?? null,
              brand: p.brand ?? null,
              category: p.category ?? null,
              oemCode: p.oemCode ?? null,
              supplierCode: p.supplierCode ?? null,
              unit: p.unit ?? null,
              erpListPrice: new Prisma.Decimal(p.listPrice),
              erpCreatedAt: p.erpCreatedAt ?? null,
              erpUpdatedAt: p.erpUpdatedAt ?? null,
            },
            update: {
              erpProductId: p.erpProductId,
              name: p.name,
              description: p.description ?? null,
              brand: p.brand ?? null,
              category: p.category ?? null,
              oemCode: p.oemCode ?? null,
              supplierCode: p.supplierCode ?? null,
              unit: p.unit ?? null,
              erpCreatedAt: p.erpCreatedAt ?? null,
              erpUpdatedAt: p.erpUpdatedAt ?? null,
            },
          });

          if (existing) updated += 1;
          else added += 1;
        }

        await tx.b2BSyncLoop.upsert({
          where: { tenantId_syncType: { tenantId, syncType: B2BSyncType.PRODUCTS } },
          create: { tenantId, syncType: B2BSyncType.PRODUCTS, lastRunAt: new Date() },
          update: { lastRunAt: new Date() },
        });

        await tx.b2BSyncLog.update({
          where: { id: log.id },
          data: {
            status: B2BSyncStatus.SUCCESS,
            finishedAt: new Date(),
            recordsProcessed: products.length,
            recordsAdded: added,
            recordsUpdated: updated,
          },
        });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.prisma.b2BSyncLog.update({
        where: { id: log.id },
        data: {
          status: B2BSyncStatus.FAILED,
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      throw e;
    }
  }

  private async handleSyncPrices(data: B2bSyncProductsJob, isFullSync = false): Promise<void> {
    const { tenantId, erpAdapterType } = data;
    const log = await this.prisma.b2BSyncLog.create({
      data: {
        tenantId,
        syncType: B2BSyncType.PRICES,
        status: B2BSyncStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const loop = await this.prisma.b2BSyncLoop.findUnique({
        where: { tenantId_syncType: { tenantId, syncType: B2BSyncType.PRICES } },
      });
      const lastSyncedAt = isFullSync ? null : (loop?.lastRunAt ?? null);

      const adapter = this.resolveAdapter(tenantId, erpAdapterType);
      const prices = await adapter.getPrices(lastSyncedAt);

      let updated = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const p of prices) {
          const result = await tx.b2BProduct.updateMany({
            where: {
              tenantId,
              erpProductId: p.erpProductId,
            },
            data: {
              erpListPrice: new Prisma.Decimal(p.listPrice),
              erpUpdatedAt: new Date(),
            },
          });
          updated += result.count;
        }

        await tx.b2BSyncLoop.upsert({
          where: { tenantId_syncType: { tenantId, syncType: B2BSyncType.PRICES } },
          create: { tenantId, syncType: B2BSyncType.PRICES, lastRunAt: new Date() },
          update: { lastRunAt: new Date() },
        });

        await tx.b2BSyncLog.update({
          where: { id: log.id },
          data: {
            status: B2BSyncStatus.SUCCESS,
            finishedAt: new Date(),
            recordsProcessed: prices.length,
            recordsUpdated: updated,
            recordsAdded: 0,
          },
        });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.prisma.b2BSyncLog.update({
        where: { id: log.id },
        data: {
          status: B2BSyncStatus.FAILED,
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      throw e;
    }
  }

  private async handleSyncMovements(data: B2bSyncMovementsJob): Promise<void> {
    const { tenantId, erpAdapterType, erpAccountId } = data;

    const customer = await this.prisma.b2BCustomer.findFirst({
      where: { tenantId, erpAccountId },
    });
    if (!customer) {
      throw new Error(`B2B customer not found for erpAccountId=${erpAccountId}`);
    }

    const log = await this.prisma.b2BSyncLog.create({
      data: {
        tenantId,
        syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
        status: B2BSyncStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const lastOk = await this.prisma.b2BSyncLog.findFirst({
        where: {
          tenantId,
          syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          status: B2BSyncStatus.SUCCESS,
          id: { not: log.id },
        },
        orderBy: { finishedAt: 'desc' },
      });
      const lastSyncedAt = lastOk?.finishedAt ?? null;

      const adapter = this.resolveAdapter(tenantId, erpAdapterType);
      const movements = await adapter.getAccountMovements(erpAccountId, lastSyncedAt);

      let inserted = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const m of movements) {
          const exists = await tx.b2BAccountMovement.findUnique({
            where: {
              tenantId_erpMovementId: {
                tenantId,
                erpMovementId: m.erpMovementId,
              },
            },
          });
          if (exists) continue;

          const dueDate =
            customer.vatDays > 0
              ? new Date(m.date.getTime() + customer.vatDays * 86400000)
              : null;

          await tx.b2BAccountMovement.create({
            data: {
              tenantId,
              erpMovementId: m.erpMovementId,
              customerId: customer.id,
              date: m.date,
              type: m.type as B2BMovementType,
              description: m.description,
              debit: new Prisma.Decimal(m.debit),
              credit: new Prisma.Decimal(m.credit),
              balance: new Prisma.Decimal(m.balance),
              erpInvoiceNo: m.erpInvoiceNo ?? null,
              dueDate,
              isPastDue: dueDate != null && dueDate < new Date() && m.debit > m.credit,
            },
          });
          inserted += 1;
        }

        await tx.b2BSyncLog.update({
          where: { id: log.id },
          data: {
            status: B2BSyncStatus.SUCCESS,
            finishedAt: new Date(),
            recordsProcessed: movements.length,
            recordsAdded: inserted,
            recordsUpdated: 0,
          },
        });
      });

      await this.prisma.b2BSyncLoop.upsert({
        where: {
          tenantId_syncType: {
            tenantId,
            syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          },
        },
        create: {
          tenantId,
          syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          lastRunAt: new Date(),
        },
        update: { lastRunAt: new Date() },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.prisma.b2BSyncLog.update({
        where: { id: log.id },
        data: {
          status: B2BSyncStatus.FAILED,
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      throw e;
    }
  }

  /** Tüm B2B müşterileri için ERP’den cari hareket çekimi (tek log kaydı). */
  private async handleSyncAllAccountMovements(
    data: B2bSyncProductsJob,
  ): Promise<void> {
    const { tenantId, erpAdapterType } = data;

    const log = await this.prisma.b2BSyncLog.create({
      data: {
        tenantId,
        syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
        status: B2BSyncStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const lastOk = await this.prisma.b2BSyncLog.findFirst({
        where: {
          tenantId,
          syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          status: B2BSyncStatus.SUCCESS,
          id: { not: log.id },
        },
        orderBy: { finishedAt: 'desc' },
      });
      const lastSyncedAt = lastOk?.finishedAt ?? null;

      const customers = await this.prisma.b2BCustomer.findMany({
        where: { tenantId },
        select: { id: true, erpAccountId: true, vatDays: true },
      });

      const adapter = this.resolveAdapter(tenantId, erpAdapterType);
      let totalProcessed = 0;
      let totalInserted = 0;

      for (const customer of customers) {
        const movements = await adapter.getAccountMovements(
          customer.erpAccountId,
          lastSyncedAt,
        );
        totalProcessed += movements.length;

        let inserted = 0;
        await this.prisma.$transaction(async (tx) => {
          for (const m of movements) {
            const exists = await tx.b2BAccountMovement.findUnique({
              where: {
                tenantId_erpMovementId: {
                  tenantId,
                  erpMovementId: m.erpMovementId,
                },
              },
            });
            if (exists) continue;

            const dueDate =
              customer.vatDays > 0
                ? new Date(m.date.getTime() + customer.vatDays * 86400000)
                : null;

            await tx.b2BAccountMovement.create({
              data: {
                tenantId,
                erpMovementId: m.erpMovementId,
                customerId: customer.id,
                date: m.date,
                type: m.type as B2BMovementType,
                description: m.description,
                debit: new Prisma.Decimal(m.debit),
                credit: new Prisma.Decimal(m.credit),
                balance: new Prisma.Decimal(m.balance),
                erpInvoiceNo: m.erpInvoiceNo ?? null,
                dueDate,
                isPastDue:
                  dueDate != null &&
                  dueDate < new Date() &&
                  Number(m.debit) > Number(m.credit),
              },
            });
            inserted += 1;
          }
        });
        totalInserted += inserted;
      }

      await this.prisma.b2BSyncLog.update({
        where: { id: log.id },
        data: {
          status: B2BSyncStatus.SUCCESS,
          finishedAt: new Date(),
          recordsProcessed: totalProcessed,
          recordsAdded: totalInserted,
          recordsUpdated: 0,
        },
      });

      await this.prisma.b2BSyncLoop.upsert({
        where: {
          tenantId_syncType: {
            tenantId,
            syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          },
        },
        create: {
          tenantId,
          syncType: B2BSyncType.ACCOUNT_MOVEMENTS,
          lastRunAt: new Date(),
        },
        update: { lastRunAt: new Date() },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.prisma.b2BSyncLog.update({
        where: { id: log.id },
        data: {
          status: B2BSyncStatus.FAILED,
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      throw e;
    }
  }

  private async handleExportOrder(data: B2bExportOrderJob): Promise<void> {
    const { tenantId, erpAdapterType, orderId } = data;

    const order = await this.prisma.b2BOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: { include: { product: { select: { erpProductId: true } } } },
        customer: true,
      },
    });
    if (!order) {
      throw new Error(`B2B order not found: ${orderId}`);
    }

    const dto: B2BOrderExportDto = {
      orderNumber: order.orderNumber,
      erpAccountId: order.customer.erpAccountId,
      items: order.items.map((i) => ({
        erpProductId: i.product.erpProductId,
        quantity: i.quantity,
        unitPrice: Number(i.listPrice),
      })),
      note: order.note ?? undefined,
      deliveryBranchId: order.deliveryBranchId ?? undefined,
    };

    const adapter = this.resolveAdapter(tenantId, erpAdapterType);
    const { erpOrderId } = await adapter.pushOrder(dto);

    await this.prisma.b2BOrder.update({
      where: { id: order.id },
      data: {
        status: B2BOrderStatus.EXPORTED_TO_ERP,
        erpOrderId,
      },
    });
  }
}
