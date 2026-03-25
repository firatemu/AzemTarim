import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { B2BOrderStatus, Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../../common/prisma.service';
import { B2bSyncService } from '../../b2b-sync/b2b-sync.service';
import { assertB2bOrderStatusTransition } from '../b2b-order-status.util';
import {
  B2bOrderListQueryDto,
  PatchB2bOrderStatusDto,
} from '../dto/b2b-order.dto';

@Injectable()
export class B2bAdminOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly b2bSync: B2bSyncService,
  ) {}

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit };
  }

  async list(tenantId: string, q: B2bOrderListQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.B2BOrderWhereInput = { tenantId };
    if (q.status) where.status = q.status;
    if (q.customerId) where.customerId = q.customerId;
    if (q.salespersonId) where.salespersonId = q.salespersonId;
    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }

    const [total, data] = await Promise.all([
      this.prisma.b2BOrder.count({ where }),
      this.prisma.b2BOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          deliveryMethod: { select: { name: true } },
          salesperson: { select: { id: true, name: true } },
        },
      }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  async getOne(tenantId: string, id: string) {
    const order = await this.prisma.b2BOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: true } },
        customer: { include: { customerClass: true } },
        deliveryMethod: true,
        salesperson: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async approve(tenantId: string, id: string) {
    const order = await this.prisma.b2BOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === B2BOrderStatus.PENDING) {
      await this.prisma.b2BOrder.update({
        where: { id },
        data: { status: B2BOrderStatus.APPROVED },
      });
    } else if (order.status !== B2BOrderStatus.APPROVED) {
      throw new BadRequestException('Only PENDING or APPROVED orders can be exported');
    }

    return this.b2bSync.enqueueExportOrder(tenantId, id);
  }

  async reject(tenantId: string, id: string, reason: string) {
    const order = await this.prisma.b2BOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== B2BOrderStatus.PENDING) {
      throw new BadRequestException('Only PENDING orders can be rejected');
    }

    const note = order.note
      ? `${order.note}\n[REJECT] ${reason}`
      : `[REJECT] ${reason}`;

    await this.prisma.b2BOrder.update({
      where: { id },
      data: { status: B2BOrderStatus.REJECTED, note },
    });
    return { ok: true };
  }

  async patchStatus(tenantId: string, id: string, dto: PatchB2bOrderStatusDto) {
    const order = await this.prisma.b2BOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    assertB2bOrderStatusTransition(order.status, dto.status);

    return this.prisma.b2BOrder.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async exportExcel(tenantId: string, q: B2bOrderListQueryDto): Promise<Buffer> {
    const page = 1;
    const limit = 10_000;
    const { data } = await this.list(tenantId, { ...q, page, limit });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('B2B Orders');
    sheet.columns = [
      { header: 'Order No', key: 'orderNumber', width: 18 },
      { header: 'Customer', key: 'customer', width: 28 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Created', key: 'createdAt', width: 22 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Delivery', key: 'delivery', width: 20 },
    ];

    for (const row of data as any[]) {
      sheet.addRow({
        orderNumber: row.orderNumber,
        customer: row.customer?.name,
        status: row.status,
        createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
        total: Number(row.totalFinalPrice),
        delivery: row.deliveryMethod?.name,
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
