import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class WarehouseService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async findAll(active?: boolean) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    if (!hasTenant && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = {};
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (active !== undefined) {
      where.active = active;
    }

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
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    if (!hasTenant && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = { id };
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where,
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
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    if (!hasTenant && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = { code };
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where,
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
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    // create işleminde tenantId optional olabilir (staging için)
    // Eğer tenantId yoksa null olarak kaydedilir

    let code = createDto.code;

    // Eğer kod girilmemişse, otomatik kod üret
    if (!code || code.trim() === '') {
      try {
        code = await this.codeTemplateService.getNextCode('WAREHOUSE');
      } catch (error) {
        throw new BadRequestException(
          'Otomatik kod oluşturulamadı. Lütfen manuel kod girin veya "Numara Şablonları" ayarlarını kontrol edin.',
        );
      }
    }

    // Kod benzersizliği kontrolü (tenant içinde veya global)
    const existingWhere: any = { code };
    if (tenantId) {
      existingWhere.tenantId = tenantId;
    } else {
      // Tenant ID yoksa, tenantId null olan kayıtları kontrol et
      existingWhere.tenantId = null;
    }
    
    const existing = await this.prisma.warehouse.findFirst({
      where: existingWhere,
    });

    if (existing) {
      throw new BadRequestException('Bu depo kodu zaten kullanılıyor');
    }

    return this.prisma.warehouse.create({
      data: {
        code,
        ...(tenantId && { tenantId }), // tenantId varsa ekle, yoksa ekleme
        name: createDto.name,
        active: createDto.active ?? true,
        address: createDto.address,
        phone: createDto.phone,
        manager: createDto.manager,
      },
    });
  }

  async update(id: string, updateDto: UpdateWarehouseDto) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    if (!hasTenant && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = { id };
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    } else {
      where.tenantId = null; // Tenant ID yoksa null olan kayıtları kontrol et
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where,
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    // Kod değiştiriliyorsa benzersizlik kontrolü (tenant içinde veya global)
    if (updateDto.code && updateDto.code !== warehouse.code) {
      const existingWhere: any = { code: updateDto.code };
      if (tenantId) {
        existingWhere.tenantId = tenantId;
      } else {
        existingWhere.tenantId = null;
      }
      
      const existing = await this.prisma.warehouse.findFirst({
        where: existingWhere,
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
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const hasTenant = this.tenantContext.hasTenant();
    
    // SUPER_ADMIN ve staging için tenant kontrolünü atla
    if (!hasTenant && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = { id };
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    } else {
      where.tenantId = null;
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where,
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
