import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreatePartRequestDto, SupplyPartRequestDto } from './dto';
import { PartRequestStatus, PartWorkflowStatus } from '@prisma/client';
import {
  canTransitionPartRequestStatus,
} from './domain/part-request-status.machine';

@Injectable()
export class PartRequestService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private systemParameterService: SystemParameterService,
  ) {}

  async create(dto: CreatePartRequestDto, requestedBy: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        id: dto.workOrderId,
        ...buildTenantWhereClause(finalTenantId),
      },
    });

    if (!workOrder) {
      throw new NotFoundException('İş emri bulunamadı');
    }

    if (workOrder.status === 'INVOICED_CLOSED' || workOrder.status === 'CANCELLED') {
      throw new BadRequestException('Bu iş emrine parça talebi eklenemez');
    }

    const partRequest = await this.prisma.partRequest.create({
      data: {
        tenantId: finalTenantId,
        workOrderId: dto.workOrderId,
        requestedBy,
        description: dto.description,
        stokId: dto.stokId || null,
        requestedQty: dto.requestedQty,
        status: PartRequestStatus.REQUESTED,
      },
      include: {
        stok: { select: { id: true, stokKodu: true, stokAdi: true } },
        requestedByUser: { select: { id: true, fullName: true } },
        workOrder: { select: { id: true, workOrderNo: true } },
      },
    });

    await this.prisma.workOrder.update({
      where: { id: dto.workOrderId },
      data: { partWorkflowStatus: PartWorkflowStatus.PARTS_PENDING },
    });

    await this.prisma.workOrderActivity.create({
      data: {
        workOrderId: dto.workOrderId,
        action: 'PART_WORKFLOW_CHANGED',
        userId: requestedBy,
        metadata: {
          partWorkflowStatus: PartWorkflowStatus.PARTS_PENDING,
          trigger: 'PART_REQUEST_CREATED',
        },
      },
    });

    return partRequest;
  }

  async findAll(
    workOrderId?: string,
    status?: PartRequestStatus,
    page = 1,
    limit = 50,
    workOrderNo?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (workOrderId) where.workOrderId = workOrderId;
    if (workOrderNo) {
      where.workOrder = {
        workOrderNo: { contains: workOrderNo, mode: 'insensitive' },
      };
    }
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.partRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stok: { select: { id: true, stokKodu: true, stokAdi: true } },
          requestedByUser: { select: { id: true, fullName: true } },
          workOrder: { select: { id: true, workOrderNo: true, status: true } },
        },
      }),
      this.prisma.partRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const partRequest = await this.prisma.partRequest.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        stok: { select: { id: true, stokKodu: true, stokAdi: true } },
        requestedByUser: { select: { id: true, fullName: true } },
        workOrder: { select: { id: true, workOrderNo: true, status: true } },
      },
    });

    if (!partRequest) {
      throw new NotFoundException(`Parça talebi bulunamadı: ${id}`);
    }

    return partRequest;
  }

  async supply(id: string, dto: SupplyPartRequestDto, suppliedBy: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const partRequest = await tx.partRequest.findFirst({
        where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      });

      if (!partRequest) {
        throw new NotFoundException('Parça talebi bulunamadı');
      }

      if (
        !canTransitionPartRequestStatus(
          partRequest.status,
          PartRequestStatus.SUPPLIED,
        )
      ) {
        throw new BadRequestException(
          'Sadece talep edilmiş parçalar tedarik edilebilir',
        );
      }

      const stok = await tx.stok.findFirst({
        where: {
          id: dto.stokId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!stok) {
        throw new NotFoundException('Stok bulunamadı');
      }

      // Stok miktarı kontrolü - sadece "Negatif stok kontrolü" açıksa uygula
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false,
      );
      if (negativeStockControlEnabled) {
        const warehouseIds = await tx.warehouse.findMany({
          where: buildTenantWhereClause(tenantId ?? undefined),
          select: { id: true },
        });
        if (warehouseIds.length > 0) {
          const stockResult = await tx.productLocationStock.aggregate({
            where: {
              productId: dto.stokId,
              warehouseId: { in: warehouseIds.map((w) => w.id) },
            },
            _sum: { qtyOnHand: true },
          });
          const availableQty = Number(stockResult._sum?.qtyOnHand ?? 0);
          if (availableQty < dto.suppliedQty) {
            throw new BadRequestException(
              `Yeterli stok yok. Mevcut: ${availableQty}, Tedarik edilecek: ${dto.suppliedQty}`,
            );
          }
        }
      }

      const updated = await tx.partRequest.update({
        where: { id },
        data: {
          stokId: dto.stokId,
          suppliedQty: dto.suppliedQty,
          status: PartRequestStatus.SUPPLIED,
          suppliedBy,
          suppliedAt: new Date(),
          version: { increment: 1 },
        },
        include: {
          stok: { select: { id: true, stokKodu: true, stokAdi: true } },
          requestedByUser: { select: { id: true, fullName: true } },
          workOrder: { select: { id: true, workOrderNo: true, status: true, customerVehicleId: true } },
        },
      });

      const pendingCount = await tx.partRequest.count({
        where: {
          workOrderId: updated.workOrder.id,
          status: PartRequestStatus.REQUESTED,
        },
      });
      const newPartStatus =
        pendingCount === 0 ? PartWorkflowStatus.ALL_PARTS_SUPPLIED : PartWorkflowStatus.PARTIALLY_SUPPLIED;
      await tx.workOrder.update({
        where: { id: updated.workOrder.id },
        data: { partWorkflowStatus: newPartStatus },
      });
      await tx.workOrderActivity.create({
        data: {
          workOrderId: updated.workOrder.id,
          action: 'PART_WORKFLOW_CHANGED',
          metadata: {
            partWorkflowStatus: newPartStatus,
            trigger: 'PART_SUPPLY',
          },
        },
      });

      return updated;
    });
  }

  /**
   * Step 5: Atomik stok düşümü - Tekniker "Kullanıldı" işaretlediğinde
   * Transaction içinde: PartRequest SUPPLIED -> USED, InventoryTransaction (-qty)
   */
  async markAsUsed(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const pr = await tx.partRequest.findFirst({
        where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      });

      if (!pr) {
        throw new NotFoundException('Parça talebi bulunamadı');
      }

      if (
        !canTransitionPartRequestStatus(pr.status, PartRequestStatus.USED)
      ) {
        throw new ConflictException(
          'Sadece tedarik edilmiş parçalar kullanıldı olarak işaretlenebilir',
        );
      }

      if (!pr.stokId || pr.suppliedQty == null) {
        throw new BadRequestException('Parça talebi stok ve miktar bilgisi eksik');
      }

      const updated = await tx.partRequest.updateMany({
        where: { id, version: pr.version },
        data: {
          status: PartRequestStatus.USED,
          usedAt: new Date(),
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Parça talebi güncellenemedi (optimistic lock hatası - lütfen tekrar deneyin)',
        );
      }

      await tx.inventoryTransaction.create({
        data: {
          tenantId: pr.tenantId,
          partRequestId: pr.id,
          stokId: pr.stokId,
          quantity: -pr.suppliedQty,
          transactionType: 'DEDUCTION',
        },
      });

      return tx.partRequest.findUniqueOrThrow({
        where: { id },
        include: {
          stok: { select: { id: true, stokKodu: true, stokAdi: true } },
          workOrder: { select: { id: true, workOrderNo: true } },
        },
      });
    });
  }

  async cancel(id: string) {
    const partRequest = await this.findOne(id);

    if (
      !canTransitionPartRequestStatus(
        partRequest.status,
        PartRequestStatus.CANCELLED,
      )
    ) {
      throw new BadRequestException(
        'Sadece talep edilmiş parçalar iptal edilebilir',
      );
    }

    const updated = await this.prisma.partRequest.update({
      where: { id },
      data: { status: PartRequestStatus.CANCELLED },
      include: {
        stok: { select: { id: true, stokKodu: true, stokAdi: true } },
        workOrder: true,
      },
    });

    if (updated.workOrder.partWorkflowStatus === PartWorkflowStatus.PARTS_PENDING ||
        updated.workOrder.partWorkflowStatus === PartWorkflowStatus.PARTIALLY_SUPPLIED) {
      const pendingCount = await this.prisma.partRequest.count({
        where: {
          workOrderId: updated.workOrder.id,
          status: PartRequestStatus.REQUESTED,
        },
      });
      const newPartStatus =
        pendingCount === 0 ? PartWorkflowStatus.ALL_PARTS_SUPPLIED : PartWorkflowStatus.PARTIALLY_SUPPLIED;
      await this.prisma.workOrder.update({
        where: { id: updated.workOrder.id },
        data: { partWorkflowStatus: newPartStatus },
      });
    }

    return updated;
  }
}
