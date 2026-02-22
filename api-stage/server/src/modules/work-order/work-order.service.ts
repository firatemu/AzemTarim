import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CodeTemplateService } from '../code-template/code-template.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateWorkOrderDto, UpdateWorkOrderDto, SendForApprovalDto, ChangeVehicleWorkflowDto } from './dto';
import { WorkOrderStatus, PartRequestStatus, VehicleServiceStatus, VehicleWorkflowStatus } from '@prisma/client';
import { validateWorkOrderStatusTransition } from './domain/work-order-status.machine';
import { canTransitionVehicleWorkflow } from './domain/work-order-workflows.machine';

@Injectable()
export class WorkOrderService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
  ) {}

  private validateTransition(
    currentStatus: WorkOrderStatus,
    newStatus: WorkOrderStatus,
  ): void {
    try {
      validateWorkOrderStatusTransition(currentStatus, newStatus);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Geçersiz durum geçişi',
      );
    }
  }

  async getStats() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    const [byStatus, partRequestCount, monthlyRevenue] = await Promise.all([
      this.prisma.workOrder.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.partRequest.count({
        where: {
          ...where,
          status: { in: [PartRequestStatus.REQUESTED, PartRequestStatus.SUPPLIED] },
        },
      }),
      this.prisma.serviceInvoice.aggregate({
        where: {
          ...buildTenantWhereClause(tenantId ?? undefined),
          issueDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, s) => {
        acc[s.status] = s._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      workOrders: {
        total: byStatus.reduce((sum, s) => sum + s._count.id, 0),
        byStatus: statusCounts,
        waitingDiagnosis: statusCounts.WAITING_DIAGNOSIS ?? 0,
        pendingApproval: statusCounts.PENDING_APPROVAL ?? 0,
        inProgress: statusCounts.APPROVED_IN_PROGRESS ?? 0,
        partWaiting: statusCounts.PART_WAITING ?? 0,
        partsSupplied: statusCounts.PARTS_SUPPLIED ?? 0,
        vehicleReady: statusCounts.VEHICLE_READY ?? 0,
        invoiced: statusCounts.INVOICED_CLOSED ?? 0,
        closedWithoutInvoice: statusCounts.CLOSED_WITHOUT_INVOICE ?? 0,
      },
      partRequests: {
        pending: partRequestCount,
      },
      revenue: {
        thisMonth: Number(monthlyRevenue._sum.grandTotal ?? 0),
        invoiceCount: monthlyRevenue._count.id,
      },
    };
  }

  async getAssignmentUsers() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = buildTenantWhereClause(tenantId ?? undefined);
    where.isActive = true;
    where.role = {
      in: [
        'TECHNICIAN',
        'ADMIN',
        'SUPER_ADMIN',
        'WORKSHOP_MANAGER',
        'SERVICE_MANAGER',
        'RECEPTION',
      ],
    };
    return this.prisma.user.findMany({
      where,
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async create(dto: CreateWorkOrderDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    const workOrderNo = await this.codeTemplateService.getNextCode('WORK_ORDER');

    const customerVehicle = await this.prisma.customerVehicle.findFirst({
      where: {
        id: dto.customerVehicleId,
        ...buildTenantWhereClause(finalTenantId),
      },
    });
    if (!customerVehicle) {
      throw new BadRequestException('Müşteri aracı bulunamadı');
    }

    const cari = await this.prisma.cari.findFirst({
      where: { id: dto.cariId, ...buildTenantWhereClause(finalTenantId) },
    });
    if (!cari) {
      throw new BadRequestException('Cari bulunamadı');
    }

    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderNo,
        tenantId: finalTenantId,
        status: WorkOrderStatus.WAITING_DIAGNOSIS,
        vehicleWorkflowStatus: VehicleWorkflowStatus.WAITING,
        customerVehicleId: dto.customerVehicleId,
        cariId: dto.cariId,
        technicianId: dto.technicianId || null,
        description: dto.description || null,
        estimatedCompletionDate: dto.estimatedCompletionDate
          ? new Date(dto.estimatedCompletionDate)
          : null,
      },
      include: {
        customerVehicle: {
          include: { cari: { select: { id: true, cariKodu: true, unvan: true } } },
        },
        cari: { select: { id: true, cariKodu: true, unvan: true } },
        technician: { select: { id: true, fullName: true, email: true } },
      },
    });

    await this.prisma.customerVehicle.update({
      where: { id: dto.customerVehicleId },
      data: { servisDurum: VehicleServiceStatus.BEKLEMEDE },
    });

    return workOrder;
  }

  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    status?: WorkOrderStatus,
    cariId?: string,
    createdAtFrom?: string,
    createdAtTo?: string,
    customerVehicleId?: string,
    readyForInvoice?: boolean,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (readyForInvoice) {
      where.vehicleWorkflowStatus = VehicleWorkflowStatus.READY;
      where.serviceInvoice = { is: null };
    }

    if (search) {
      where.OR = [
        { workOrderNo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          customerVehicle: {
            OR: [
              { plaka: { contains: search, mode: 'insensitive' } },
              { saseno: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status && !readyForInvoice) where.status = status;
    if (cariId) where.cariId = cariId;
    if (customerVehicleId) where.customerVehicleId = customerVehicleId;
    if (createdAtFrom || createdAtTo) {
      where.createdAt = {};
      if (createdAtFrom) where.createdAt.gte = new Date(createdAtFrom);
      if (createdAtTo) where.createdAt.lte = new Date(createdAtTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customerVehicle: {
            include: { cari: { select: { id: true, cariKodu: true, unvan: true } } },
          },
          cari: { select: { id: true, cariKodu: true, unvan: true } },
          technician: { select: { id: true, fullName: true } },
          _count: { select: { items: true, partRequests: true } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findForPartsManagement(
    page = 1,
    limit = 50,
    search?: string,
    partWorkflowStatus?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    where.status = { notIn: [WorkOrderStatus.CANCELLED, WorkOrderStatus.INVOICED_CLOSED, WorkOrderStatus.CLOSED_WITHOUT_INVOICE] };
    where.vehicleWorkflowStatus = { not: VehicleWorkflowStatus.DELIVERED };

    if (search) {
      where.OR = [
        { workOrderNo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          customerVehicle: {
            OR: [
              { plaka: { contains: search, mode: 'insensitive' } },
              { saseno: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (partWorkflowStatus) {
      where.partWorkflowStatus = partWorkflowStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customerVehicle: {
            include: { cari: { select: { id: true, cariKodu: true, unvan: true } } },
          },
          cari: { select: { id: true, cariKodu: true, unvan: true } },
          technician: { select: { id: true, fullName: true } },
          items: {
            where: { type: 'PART' },
            include: { stok: { select: { id: true, stokKodu: true, stokAdi: true } } },
          },
          partRequests: {
            include: {
              stok: { select: { id: true, stokKodu: true, stokAdi: true } },
              requestedByUser: { select: { id: true, fullName: true } },
            },
          },
        },
      }),
      this.prisma.workOrder.count({ where }),
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
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        customerVehicle: {
          include: { cari: { select: { id: true, cariKodu: true, unvan: true } } },
        },
        cari: { select: { id: true, cariKodu: true, unvan: true } },
        technician: { select: { id: true, fullName: true, email: true } },
        items: { include: { stok: { select: { id: true, stokKodu: true, stokAdi: true } } } },
        partRequests: {
          include: {
            stok: { select: { id: true, stokKodu: true, stokAdi: true } },
            requestedByUser: { select: { id: true, fullName: true } },
          },
        },
        serviceInvoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException(`İş emri bulunamadı: ${id}`);
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto, userId?: string) {
    const workOrder = await this.findOne(id);

    if (workOrder.status === WorkOrderStatus.INVOICED_CLOSED) {
      throw new BadRequestException('Faturalanmış iş emri güncellenemez');
    }

    if (workOrder.status === WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
      throw new BadRequestException('Kapatılmış iş emri güncellenemez');
    }

    if (workOrder.status === WorkOrderStatus.CANCELLED) {
      throw new BadRequestException('İptal edilmiş iş emri güncellenemez');
    }

    const updateData: Record<string, unknown> = {};
    const allowedKeys = ['customerVehicleId', 'cariId', 'technicianId', 'description', 'diagnosisNotes', 'supplyResponseNotes', 'estimatedCompletionDate'] as const;
    for (const key of allowedKeys) {
      const value = dto[key];
      if (value !== undefined) {
        if (key === 'estimatedCompletionDate') {
          updateData[key] = new Date(value as string);
        } else {
          updateData[key] = value;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Güncellenecek alan belirtilmedi');
    }

    let updated;
    try {
      updated = await this.prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          customerVehicle: {
            include: { cari: { select: { id: true, cariKodu: true, unvan: true } } },
          },
          cari: { select: { id: true, cariKodu: true, unvan: true } },
          technician: { select: { id: true, fullName: true } },
        },
      });
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      console.error('[WorkOrderService] update failed', err);
      throw new BadRequestException(
        err instanceof Error ? err.message : 'İş emri güncellenirken bir hata oluştu',
      );
    }

    if (dto.technicianId !== undefined && dto.technicianId !== workOrder.technicianId) {
      await this.prisma.workOrderActivity.create({
        data: {
          workOrderId: id,
          action: 'TECHNICIAN_ASSIGNED',
          userId: userId ?? null,
          metadata: {
            technicianId: dto.technicianId,
            technicianName: updated.technician?.fullName,
          },
        },
      });
    }

    return updated;
  }

  async changeStatus(id: string, newStatus: WorkOrderStatus, userId?: string) {
    const workOrder = await this.findOne(id);

    this.validateTransition(workOrder.status, newStatus);

    const updateData: any = { status: newStatus };
    if (newStatus === WorkOrderStatus.INVOICED_CLOSED || newStatus === WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
      updateData.actualCompletionDate = new Date();
      updateData.vehicleWorkflowStatus = VehicleWorkflowStatus.DELIVERED;
    } else if (newStatus === WorkOrderStatus.APPROVED_IN_PROGRESS) {
      updateData.vehicleWorkflowStatus = VehicleWorkflowStatus.IN_PROGRESS;
    } else if (newStatus === WorkOrderStatus.VEHICLE_READY) {
      updateData.vehicleWorkflowStatus = VehicleWorkflowStatus.READY;
      updateData.actualCompletionDate = new Date();
    }

    const updated = await this.prisma.workOrder.updateMany({
      where: { id, version: workOrder.version },
      data: {
        ...updateData,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'İş emri güncellenemedi (optimistic lock hatası - lütfen tekrar deneyin)',
      );
    }

    // Araç servis durumunu güncelle
    const vehicleId = workOrder.customerVehicleId;
    if (newStatus === WorkOrderStatus.APPROVED_IN_PROGRESS) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.YAPIM_ASAMASINDA },
      });
    } else if (newStatus === WorkOrderStatus.PART_WAITING) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.PARCA_BEKLIYOR },
      });
    } else if (newStatus === WorkOrderStatus.PARTS_SUPPLIED) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.PARCALAR_TEDARIK_EDILDI },
      });
    } else if (newStatus === WorkOrderStatus.VEHICLE_READY) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.ARAC_HAZIR },
      });
    } else if (
      newStatus === WorkOrderStatus.INVOICED_CLOSED ||
      newStatus === WorkOrderStatus.CLOSED_WITHOUT_INVOICE ||
      newStatus === WorkOrderStatus.CANCELLED
    ) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.TAMAMLANDI },
      });
    }

    await this.prisma.workOrderActivity.create({
      data: {
        workOrderId: id,
        action: 'STATUS_CHANGED',
        userId: userId ?? null,
        metadata: {
          oldStatus: workOrder.status,
          newStatus,
        },
      },
    });

    return this.findOne(id);
  }

  async changeVehicleWorkflowStatus(
    id: string,
    dto: ChangeVehicleWorkflowDto,
    userId?: string,
  ) {
    const workOrder = await this.findOne(id);

    if (workOrder.vehicleWorkflowStatus === VehicleWorkflowStatus.DELIVERED) {
      throw new BadRequestException('Teslim edilmiş iş emri güncellenemez');
    }

    if (!canTransitionVehicleWorkflow(workOrder.vehicleWorkflowStatus, dto.vehicleWorkflowStatus)) {
      throw new BadRequestException(
        `Geçersiz araç iş akışı geçişi: ${workOrder.vehicleWorkflowStatus} -> ${dto.vehicleWorkflowStatus}`,
      );
    }

    if (dto.vehicleWorkflowStatus === VehicleWorkflowStatus.DELIVERED) {
      throw new BadRequestException(
        'Teslim edildi durumu muhasebe tarafından fatura veya iş emri kapatma ile yapılır',
      );
    }

    const updateData: any = {
      vehicleWorkflowStatus: dto.vehicleWorkflowStatus,
      version: { increment: 1 },
    };
    if (dto.vehicleWorkflowStatus === VehicleWorkflowStatus.READY) {
      updateData.actualCompletionDate = new Date();
    }

    const statusMap: Record<VehicleWorkflowStatus, WorkOrderStatus> = {
      [VehicleWorkflowStatus.WAITING]: WorkOrderStatus.WAITING_DIAGNOSIS,
      [VehicleWorkflowStatus.IN_PROGRESS]: WorkOrderStatus.APPROVED_IN_PROGRESS,
      [VehicleWorkflowStatus.READY]: WorkOrderStatus.VEHICLE_READY,
      [VehicleWorkflowStatus.DELIVERED]: WorkOrderStatus.INVOICED_CLOSED,
    };
    updateData.status = statusMap[dto.vehicleWorkflowStatus];

    await this.prisma.workOrder.update({
      where: { id },
      data: updateData,
    });

    const vehicleId = workOrder.customerVehicleId;
    if (dto.vehicleWorkflowStatus === VehicleWorkflowStatus.IN_PROGRESS) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.YAPIM_ASAMASINDA },
      });
    } else if (dto.vehicleWorkflowStatus === VehicleWorkflowStatus.READY) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: { servisDurum: VehicleServiceStatus.ARAC_HAZIR },
      });
    }

    await this.prisma.workOrderActivity.create({
      data: {
        workOrderId: id,
        action: 'VEHICLE_WORKFLOW_CHANGED',
        userId: userId ?? null,
        metadata: {
          oldStatus: workOrder.vehicleWorkflowStatus,
          newStatus: dto.vehicleWorkflowStatus,
        },
      },
    });

    return this.findOne(id);
  }

  async sendForApproval(id: string, dto: SendForApprovalDto, userId?: string) {
    const workOrder = await this.findOne(id);

    if (workOrder.status !== WorkOrderStatus.WAITING_DIAGNOSIS) {
      throw new BadRequestException(
        'Sadece teşhis bekleyen iş emirleri onaya gönderilebilir',
      );
    }

    const updated = await this.prisma.workOrder.updateMany({
      where: { id, version: workOrder.version },
      data: {
        diagnosisNotes: dto.diagnosisNotes,
        status: WorkOrderStatus.PENDING_APPROVAL,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'İş emri güncellenemedi (optimistic lock hatası - lütfen tekrar deneyin)',
      );
    }

    await this.prisma.customerVehicle.update({
      where: { id: workOrder.customerVehicleId },
      data: { servisDurum: VehicleServiceStatus.MUSTERI_ONAYI_BEKLIYOR },
    });

    await this.prisma.workOrderActivity.create({
      data: {
        workOrderId: id,
        action: 'STATUS_CHANGED',
        userId: userId ?? null,
        metadata: {
          oldStatus: WorkOrderStatus.WAITING_DIAGNOSIS,
          newStatus: WorkOrderStatus.PENDING_APPROVAL,
          diagnosisNotes: dto.diagnosisNotes,
        },
      },
    });

    return this.findOne(id);
  }

  async getActivities(workOrderId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        items: { include: { stok: { select: { stokKodu: true, stokAdi: true } } } },
        partRequests: {
          include: {
            stok: { select: { stokKodu: true, stokAdi: true } },
            requestedByUser: { select: { fullName: true } },
          },
        },
        activities: {
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('İş emri bulunamadı');
    }

    const events: Array<{
      id: string;
      action: string;
      label: string;
      createdAt: string;
      user?: string;
      metadata?: Record<string, unknown>;
    }> = [];

    const statusLabels: Record<string, string> = {
      WAITING_DIAGNOSIS: 'Beklemede',
      PENDING_APPROVAL: 'Müşteri onayı bekliyor',
      APPROVED_IN_PROGRESS: 'Yapım aşamasında',
      PART_WAITING: 'Parça bekliyor',
      PARTS_SUPPLIED: 'Parçalar tedarik edildi',
      VEHICLE_READY: 'Araç hazır',
      INVOICED_CLOSED: 'Faturalandı - Kapatıldı',
      CLOSED_WITHOUT_INVOICE: 'Faturasız kapandı',
      CANCELLED: 'İptal edildi',
    };

    events.push({
      id: `created-${workOrder.id}`,
      action: 'CREATED',
      label: 'İş emri oluşturuldu',
      createdAt: workOrder.createdAt.toISOString(),
    });

    for (const act of workOrder.activities) {
      if (act.action === 'STATUS_CHANGED') {
        const meta = act.metadata as { oldStatus?: string; newStatus?: string } | null;
        const newStatus = meta?.newStatus ?? '';
        events.push({
          id: act.id,
          action: 'STATUS_CHANGED',
          label: `Durum: ${statusLabels[newStatus] ?? newStatus}`,
          createdAt: act.createdAt.toISOString(),
          user: act.user?.fullName ?? undefined,
          metadata: meta ?? undefined,
        });
      } else if (act.action === 'TECHNICIAN_ASSIGNED') {
        events.push({
          id: act.id,
          action: 'TECHNICIAN_ASSIGNED',
          label: 'Teknisyen atandı',
          createdAt: act.createdAt.toISOString(),
          user: act.user?.fullName ?? undefined,
          metadata: act.metadata as Record<string, unknown> | undefined,
        });
      } else {
        events.push({
          id: act.id,
          action: act.action,
          label: act.action,
          createdAt: act.createdAt.toISOString(),
          user: act.user?.fullName ?? undefined,
          metadata: act.metadata as Record<string, unknown> | undefined,
        });
      }
    }

    for (const item of workOrder.items) {
      const stokInfo = item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '';
      events.push({
        id: `item-${item.id}`,
        action: 'ITEM_ADDED',
        label: `Fatura kalemi eklendi: ${item.description}${stokInfo ? ` (${stokInfo})` : ''}`,
        createdAt: item.createdAt.toISOString(),
      });
    }

    for (const pr of workOrder.partRequests) {
      const stokInfo = pr.stok ? `${pr.stok.stokKodu} - ${pr.stok.stokAdi}` : pr.description;
      events.push({
        id: `pr-created-${pr.id}`,
        action: 'PART_REQUESTED',
        label: `Parça talebi: ${stokInfo}`,
        createdAt: pr.createdAt.toISOString(),
        user: pr.requestedByUser?.fullName,
      });
      if (pr.suppliedAt) {
        events.push({
          id: `pr-supplied-${pr.id}`,
          action: 'PART_SUPPLIED',
          label: `Parça tedarik edildi: ${stokInfo}`,
          createdAt: pr.suppliedAt.toISOString(),
        });
      }
      if (pr.usedAt) {
        events.push({
          id: `pr-used-${pr.id}`,
          action: 'PART_USED',
          label: `Parça kullanıldı: ${stokInfo}`,
          createdAt: pr.usedAt.toISOString(),
        });
      }
    }

    events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { data: events };
  }

  async remove(id: string) {
    const workOrder = await this.findOne(id);

    if (workOrder.status !== WorkOrderStatus.WAITING_DIAGNOSIS) {
      throw new BadRequestException(
        'Sadece teşhis bekleyen iş emirleri silinebilir',
      );
    }

    return this.prisma.workOrder.delete({
      where: { id },
    });
  }
}
