import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateB2bDiscountDto, UpdateB2bDiscountDto } from '../dto/b2b-discount.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class B2bAdminDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.b2BDiscount.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, dto: CreateB2bDiscountDto) {
    return this.prisma.b2BDiscount.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        targetValue: dto.targetValue,
        discountRate: dto.discountRate,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateB2bDiscountDto) {
    const existing = await this.prisma.b2BDiscount.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Discount not found');

    const data: Prisma.B2BDiscountUpdateInput = {
      ...(dto.name != null && { name: dto.name }),
      ...(dto.type != null && { type: dto.type }),
      ...(dto.targetValue != null && { targetValue: dto.targetValue }),
      ...(dto.discountRate != null && { discountRate: dto.discountRate }),
      ...(dto.isActive != null && { isActive: dto.isActive }),
    };
    if (dto.startsAt !== undefined) {
      data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }

    return this.prisma.b2BDiscount.update({ where: { id }, data });
  }

  async softDelete(tenantId: string, id: string) {
    const existing = await this.prisma.b2BDiscount.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Discount not found');

    return this.prisma.b2BDiscount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
