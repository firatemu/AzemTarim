import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import {
  AssignB2bCustomersDto,
  CreateB2bSalespersonDto,
  UpdateB2bSalespersonDto,
} from '../dto/b2b-salesperson.dto';

@Injectable()
export class B2bAdminSalespersonService {
  constructor(private readonly prisma: PrismaService) {}

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit };
  }

  async list(tenantId: string) {
    // Kendi ERP'miz kullanılırken satış elemanlarını Employee tablosundan çek
    const employees = await this.prisma.employee.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Employee verilerini B2BSalesperson formatına dönüştür
    return employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`.trim(),
      email: emp.email,
      employeeCode: emp.employeeCode,
      phone: emp.phone,
      isActive: true,
      canViewAllCustomers: false,
      canViewAllReports: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId,
    }));
  }

  async create(tenantId: string, dto: CreateB2bSalespersonDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.b2BSalesperson.create({
        data: {
          tenantId,
          name: dto.name,
          email: dto.email,
          passwordHash,
          canViewAllCustomers: dto.canViewAllCustomers ?? false,
          canViewAllReports: dto.canViewAllReports ?? false,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Salesperson email already exists');
      }
      throw e;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateB2bSalespersonDto) {
    const existing = await this.prisma.b2BSalesperson.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Salesperson not found');

    const data: Prisma.B2BSalespersonUpdateInput = {
      ...(dto.name != null && { name: dto.name }),
      ...(dto.email != null && { email: dto.email }),
      ...(dto.isActive != null && { isActive: dto.isActive }),
      ...(dto.canViewAllCustomers != null && {
        canViewAllCustomers: dto.canViewAllCustomers,
      }),
      ...(dto.canViewAllReports != null && {
        canViewAllReports: dto.canViewAllReports,
      }),
    };

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    try {
      return await this.prisma.b2BSalesperson.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Salesperson email already exists');
      }
      throw e;
    }
  }

  async assignCustomers(
    tenantId: string,
    salespersonId: string,
    dto: AssignB2bCustomersDto,
  ) {
    const sp = await this.prisma.b2BSalesperson.findFirst({
      where: { id: salespersonId, tenantId },
    });
    if (!sp) throw new NotFoundException('Salesperson not found');

    await this.prisma.$transaction(async (tx) => {
      for (const customerId of dto.customerIds) {
        const c = await tx.b2BCustomer.findFirst({
          where: { id: customerId, tenantId },
        });
        if (!c) {
          throw new NotFoundException(`Customer ${customerId} not found`);
        }
      }
      await tx.b2BSalespersonCustomer.createMany({
        data: dto.customerIds.map((customerId) => ({
          salespersonId,
          customerId,
        })),
        skipDuplicates: true,
      });
    });

    return { ok: true, assigned: dto.customerIds.length };
  }

  async removeCustomer(
    tenantId: string,
    salespersonId: string,
    customerId: string,
  ) {
    const sp = await this.prisma.b2BSalesperson.findFirst({
      where: { id: salespersonId, tenantId },
    });
    if (!sp) throw new NotFoundException('Salesperson not found');

    await this.prisma.b2BSalespersonCustomer.deleteMany({
      where: { salespersonId, customerId },
    });
    return { ok: true };
  }

  async listCustomers(tenantId: string, salespersonId: string, page: number, limit: number) {
    const sp = await this.prisma.b2BSalesperson.findFirst({
      where: { id: salespersonId, tenantId },
    });
    if (!sp) throw new NotFoundException('Salesperson not found');

    const skip = (page - 1) * limit;
    const where = { salespersonId };
    const [total, links] = await Promise.all([
      this.prisma.b2BSalespersonCustomer.count({ where }),
      this.prisma.b2BSalespersonCustomer.findMany({
        where,
        skip,
        take: limit,
        include: { customer: { include: { customerClass: true } } },
        orderBy: { assignedAt: 'desc' },
      }),
    ]);

    return this.paginate(
      links.map((l) => l.customer),
      total,
      page,
      limit,
    );
  }
}
