import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class B2bNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async unreadCount(tenantId: string, customerId: string) {
    const count = await this.prisma.b2BNotification.count({
      where: { tenantId, customerId, isRead: false },
    });
    return { count };
  }

  async list(
    tenantId: string,
    customerId: string,
    page = 1,
    pageSize = 25,
  ) {
    const where = { tenantId, customerId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.b2BNotification.count({ where }),
      this.prisma.b2BNotification.findMany({
        where,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      data,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  async markRead(
    tenantId: string,
    customerId: string,
    notificationId: string,
  ) {
    const row = await this.prisma.b2BNotification.findFirst({
      where: { id: notificationId, tenantId, customerId },
    });
    if (!row) {
      throw new NotFoundException('Bildirim bulunamadi');
    }
    return this.prisma.b2BNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(tenantId: string, customerId: string) {
    await this.prisma.b2BNotification.updateMany({
      where: { tenantId, customerId, isRead: false },
      data: { isRead: true },
    });
    return { updated: true };
  }
}
