import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import {
  CreateB2bDiscountGroupDto,
  UpdateB2bDiscountGroupDto,
} from '../dto/b2b-discount-group.dto';

@Injectable()
export class B2bAdminDiscountGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.b2BDiscountGroup.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateB2bDiscountGroupDto) {
    try {
      return await this.prisma.b2BDiscountGroup.create({
        data: {
          tenantId,
          name: dto.name,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Discount group name already exists');
      }
      throw e;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateB2bDiscountGroupDto) {
    const existing = await this.prisma.b2BDiscountGroup.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Discount group not found');

    try {
      return await this.prisma.b2BDiscountGroup.update({
        where: { id },
        data: {
          ...(dto.name != null && { name: dto.name }),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Discount group name already exists');
      }
      throw e;
    }
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.b2BDiscountGroup.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Discount group not found');

    const assigned = await this.prisma.b2BCustomer.count({
      where: { tenantId, discountGroupId: id },
    });
    if (assigned > 0) {
      throw new ConflictException(
        'Cannot delete group while customers are assigned',
      );
    }

    await this.prisma.b2BDiscountGroup.delete({ where: { id } });
    return { ok: true };
  }
}
