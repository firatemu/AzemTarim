import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import {
  CreateB2bDeliveryMethodDto,
  UpdateB2bDeliveryMethodDto,
} from '../dto/b2b-delivery.dto';

@Injectable()
export class B2bAdminDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.b2BDeliveryMethod.findMany({
      where: { tenantId },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async create(tenantId: string, dto: CreateB2bDeliveryMethodDto) {
    return this.prisma.b2BDeliveryMethod.create({
      data: {
        tenantId,
        name: dto.name,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateB2bDeliveryMethodDto) {
    const existing = await this.prisma.b2BDeliveryMethod.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Delivery method not found');

    return this.prisma.b2BDeliveryMethod.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.displayOrder != null && { displayOrder: dto.displayOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
      },
    });
  }

  async softDelete(tenantId: string, id: string) {
    const existing = await this.prisma.b2BDeliveryMethod.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Delivery method not found');

    return this.prisma.b2BDeliveryMethod.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
