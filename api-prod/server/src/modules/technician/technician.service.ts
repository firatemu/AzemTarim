import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { isStagingEnvironment } from '../../common/utils/staging.util';
import { Prisma } from '@prisma/client';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto';

@Injectable()
export class TechnicianService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  private getTenantIdOrThrow(): string | undefined {
    const tenantId = this.tenantContext.getTenantId();

    // Staging ortamında tenant ID opsiyonel
    if (isStagingEnvironment()) {
      return tenantId; // undefined olabilir
    }

    // Production'da tenant ID zorunlu
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return tenantId;
  }

  async create(dto: CreateTechnicianDto) {
    const tenantId = this.getTenantIdOrThrow();

    // Kod benzersizlik kontrolü - staging'de tenantId opsiyonel
    const existingWhere: any = { code: dto.code };
    if (tenantId) {
      existingWhere.tenantId = tenantId;
    }

    const existing = await this.prisma.technician.findFirst({
      where: existingWhere,
    });
    if (existing) {
      throw new ConflictException('Bu teknisyen kodu zaten kullanılıyor');
    }

    // Staging'de tenantId opsiyonel
    const createData: any = {
      ...dto,
      isActive: dto.isActive ?? true,
    };
    if (tenantId) {
      createData.tenantId = tenantId;
    }

    return this.prisma.technician.create({
      data: createData,
    });
  }

  async update(id: string, dto: UpdateTechnicianDto) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const technician = await this.prisma.technician.findFirst({
      where,
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    // Kod benzersizlik kontrolü - staging'de tenantId opsiyonel
    if (dto.code && dto.code !== technician.code) {
      const existingWhere: any = { code: dto.code, NOT: { id } };
      if (tenantId) {
        existingWhere.tenantId = tenantId;
      }

      const existing = await this.prisma.technician.findFirst({
        where: existingWhere,
      });
      if (existing) {
        throw new ConflictException('Bu teknisyen kodu zaten kullanılıyor');
      }
    }

    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const technician = await this.prisma.technician.findFirst({
      where,
      include: { workOrders: { take: 1 } },
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    if (technician.workOrders.length > 0) {
      throw new BadRequestException(
        'Bu teknisyenin atandığı iş emirleri var. Silmek yerine pasif yapın.',
      );
    }

    return this.prisma.technician.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const technician = await this.prisma.technician.findFirst({
      where,
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    return technician;
  }

  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    isActive?: boolean,
  ) {
    const tenantId = this.getTenantIdOrThrow();
    const skip = (page - 1) * limit;

    // Staging'de tenantId opsiyonel
    const where: Prisma.TechnicianWhereInput = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { workOrders: true },
          },
        },
      }),
      this.prisma.technician.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Teknisyenin iş yükünü getir
   */
  async getWorkload(id: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const technician = await this.prisma.technician.findFirst({
      where,
    });
    if (!technician) {
      throw new NotFoundException('Teknisyen bulunamadı');
    }

    // Aktif iş emirleri (CLOSED ve CANCELLED hariç) - staging'de tenantId opsiyonel
    const workOrderWhere: any = {
      technicianId: id,
      status: {
        notIn: ['CLOSED', 'CANCELLED'],
      },
    };
    if (tenantId) {
      workOrderWhere.tenantId = tenantId;
    }

    const activeWorkOrders = await this.prisma.workOrder.findMany({
      where: workOrderWhere,
      orderBy: { acceptedAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
          },
        },
        customer: {
          select: {
            id: true,
            unvan: true,
          },
        },
      },
    });

    // İstatistikler - staging'de tenantId opsiyonel
    const statsWhere: any = { technicianId: id };
    if (tenantId) {
      statsWhere.tenantId = tenantId;
    }

    const stats = await this.prisma.workOrder.groupBy({
      by: ['status'],
      where: statsWhere,
      _count: true,
    });

    return {
      technician: {
        id: technician.id,
        code: technician.code,
        firstName: technician.firstName,
        lastName: technician.lastName,
        specialization: technician.specialization,
      },
      activeWorkOrders,
      stats: stats.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

