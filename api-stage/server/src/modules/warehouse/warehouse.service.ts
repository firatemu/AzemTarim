import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class WarehouseService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async findAll(active?: boolean) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (active !== undefined) where.active = active;

    return this.prisma.warehouse.findMany({
      where,
      include: {
        _count: {
          select: {
            locations: true,
            stockMoves: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        locations: {
          where: { active: true },
          orderBy: { code: 'asc' },
        },
        _count: {
          select: {
            locations: true,
            productLocationStocks: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    return warehouse;
  }

  async findByCode(code: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        code,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        locations: {
          where: { active: true },
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    return warehouse;
  }

  async create(createDto: CreateWarehouseDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    let code = createDto.code;
    if (!code || code.trim() === '') {
      try {
        code = await this.codeTemplateService.getNextCode('WAREHOUSE');
      } catch (error) {
        throw new BadRequestException(
          'Otomatik kod oluşturulamadı. Lütfen manuel kod girin veya "Numara Şablonları" ayarlarını kontrol edin.',
        );
      }
    }

    const existing = await this.prisma.warehouse.findFirst({
      where: {
        code,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
    });
    if (existing) {
      throw new BadRequestException('Bu depo kodu zaten kullanılıyor');
    }

    return this.prisma.warehouse.create({
      data: {
        code,
        ...(tenantId != null && { tenantId }),
        name: createDto.name,
        active: createDto.active ?? true,
        address: createDto.address,
        phone: createDto.phone,
        manager: createDto.manager,
      },
    });
  }

  async update(id: string, updateDto: UpdateWarehouseDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
    });
    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    if (updateDto.code && updateDto.code !== warehouse.code) {
      const existing = await this.prisma.warehouse.findFirst({
        where: {
          code: updateDto.code,
          ...(tenantId != null ? { tenantId } : { tenantId: null }),
        },
      });
      if (existing) {
        throw new BadRequestException('Bu depo kodu zaten kullanılıyor');
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
      include: {
        _count: {
          select: {
            locations: true,
            productLocationStocks: true,
            stockMoves: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    if (warehouse._count.locations > 0) {
      throw new BadRequestException(
        'Bu depoda raflar bulunuyor. Önce rafları silin.',
      );
    }

    if (warehouse._count.productLocationStocks > 0) {
      throw new BadRequestException(
        'Bu depoda stok kayıtları bulunuyor. Önce stok kayıtlarını temizleyin.',
      );
    }

    return this.prisma.warehouse.delete({
      where: { id },
    });
  }
}
