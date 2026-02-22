import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateCustomerVehicleDto, UpdateCustomerVehicleDto } from './dto';

@Injectable()
export class CustomerVehicleService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async create(dto: CreateCustomerVehicleDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    const existingWhere: any = { plaka: dto.plaka };
    if (finalTenantId) existingWhere.tenantId = finalTenantId;
    const existingPlaka = await this.prisma.customerVehicle.findFirst({
      where: existingWhere,
    });
    if (existingPlaka) {
      throw new BadRequestException('Bu plaka zaten kayıtlı');
    }

    if (dto.saseno) {
      const existingSasenoWhere: any = { saseno: dto.saseno };
      if (finalTenantId) existingSasenoWhere.tenantId = finalTenantId;
      const existingSaseno = await this.prisma.customerVehicle.findFirst({
        where: existingSasenoWhere,
      });
      if (existingSaseno) {
        throw new BadRequestException('Bu şase no zaten kayıtlı');
      }
    }

    const cari = await this.prisma.cari.findFirst({
      where: { id: dto.cariId, ...buildTenantWhereClause(finalTenantId) },
    });
    if (!cari) {
      throw new BadRequestException('Cari bulunamadı');
    }

    const data: any = { ...dto, tenantId: finalTenantId };
    if (dto.tescilTarihi) {
      data.tescilTarihi = new Date(dto.tescilTarihi);
    }
    return this.prisma.customerVehicle.create({
      data,
      include: {
        cari: { select: { id: true, cariKodu: true, unvan: true } },
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    cariId?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (search) {
      where.OR = [
        { plaka: { contains: search, mode: 'insensitive' } },
        { saseno: { contains: search, mode: 'insensitive' } },
        { aracMarka: { contains: search, mode: 'insensitive' } },
        { aracModel: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cariId) {
      where.cariId = cariId;
    }

    const [data, total] = await Promise.all([
      this.prisma.customerVehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cari: { select: { id: true, cariKodu: true, unvan: true } },
        },
      }),
      this.prisma.customerVehicle.count({ where }),
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
    const vehicle = await this.prisma.customerVehicle.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        cari: { select: { id: true, cariKodu: true, unvan: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Müşteri aracı bulunamadı: ${id}`);
    }

    return vehicle;
  }

  async update(id: string, dto: UpdateCustomerVehicleDto) {
    await this.findOne(id);
    const tenantId = await this.tenantResolver.resolveForQuery();

    if (dto.plaka) {
      const existingPlaka = await this.prisma.customerVehicle.findFirst({
        where: {
          plaka: dto.plaka,
          id: { not: id },
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (existingPlaka) {
        throw new BadRequestException('Bu plaka zaten kayıtlı');
      }
    }

    if (dto.saseno) {
      const existingSaseno = await this.prisma.customerVehicle.findFirst({
        where: {
          saseno: dto.saseno,
          id: { not: id },
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (existingSaseno) {
        throw new BadRequestException('Bu şase no zaten kayıtlı');
      }
    }

    const updateData: any = { ...dto };
    if (dto.tescilTarihi !== undefined) {
      updateData.tescilTarihi = dto.tescilTarihi ? new Date(dto.tescilTarihi) : null;
    }
    return this.prisma.customerVehicle.update({
      where: { id },
      data: updateData,
      include: {
        cari: { select: { id: true, cariKodu: true, unvan: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customerVehicle.delete({
      where: { id },
    });
  }
}
