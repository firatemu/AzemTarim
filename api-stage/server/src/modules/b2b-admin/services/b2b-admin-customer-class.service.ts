import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import {
  CreateB2bCustomerClassDto,
  UpdateB2bCustomerClassDto,
} from '../dto/b2b-customer-class.dto';

@Injectable()
export class B2bAdminCustomerClassService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.b2BCustomerClass.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateB2bCustomerClassDto) {
    try {
      return await this.prisma.b2BCustomerClass.create({
        data: {
          tenantId,
          name: dto.name,
          discountRate: dto.discountRate ?? 0,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Customer class name already exists');
      }
      throw e;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateB2bCustomerClassDto) {
    const existing = await this.prisma.b2BCustomerClass.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Customer class not found');

    try {
      return await this.prisma.b2BCustomerClass.update({
        where: { id },
        data: {
          ...(dto.name != null && { name: dto.name }),
          ...(dto.discountRate != null && { discountRate: dto.discountRate }),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Customer class name already exists');
      }
      throw e;
    }
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.b2BCustomerClass.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Customer class not found');

    const assigned = await this.prisma.b2BCustomer.count({
      where: { tenantId, customerClassId: id },
    });
    if (assigned > 0) {
      throw new ConflictException(
        'Cannot delete class while customers are assigned',
      );
    }

    await this.prisma.b2BCustomerClass.delete({ where: { id } });
    return { ok: true };
  }
}
