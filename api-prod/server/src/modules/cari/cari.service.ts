import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateCariDto, UpdateCariDto } from './dto';
import { CodeTemplateService } from '../code-template/code-template.service';
import { isStagingEnvironment } from '../../common/utils/staging.util';

@Injectable()
export class CariService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async create(dto: CreateCariDto) {
    console.log('[CariService.create] Received dto:', dto);
    console.log('[CariService.create] dto.tip type:', typeof dto.tip);
    console.log('[CariService.create] dto.tip value:', dto.tip);
    console.log('[CariService.create] dto.unvan:', dto.unvan);
    
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const isStaging = isStagingEnvironment();

    // Staging'de veya SUPER_ADMIN için tenant kontrolünü atla
    if (!tenantId && !isSuperAdmin && !isStaging) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Eğer cariKodu girilmemişse veya boşsa otomatik üret
    let cariKodu = dto.cariKodu?.trim();
    if (!cariKodu || cariKodu.length === 0) {
      try {
        cariKodu = await this.codeTemplateService.getNextCode('CUSTOMER');
      } catch (error) {
        throw new BadRequestException(
          'Cari kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    // unvan kontrolü (frontend'de de kontrol ediliyor ama backend'de de kontrol et)
    if (!dto.unvan || !dto.unvan.trim()) {
      throw new BadRequestException('Ünvan boş olamaz');
    }

    // tip verilmezse varsayılan olarak MUSTERI atanır
    const tip = dto.tip || 'MUSTERI';
    
    console.log('[CariService.create] Final tip value:', tip);
    console.log('[CariService.create] Valid CariTip values:', ['MUSTERI', 'TEDARIKCI', 'HER_IKISI']);
    console.log('[CariService.create] Is tip valid?', ['MUSTERI', 'TEDARIKCI', 'HER_IKISI'].includes(tip));

    // Check uniqueness within tenant (SUPER_ADMIN için tenant kontrolünü atla)
    if (tenantId) {
      const existing = await this.prisma.cari.findFirst({
        where: {
          cariKodu,
          tenantId,
        },
      });

      if (existing) {
        throw new BadRequestException('Bu cari kodu zaten kullanılıyor');
      }
    } else if (isSuperAdmin) {
      // SUPER_ADMIN için tenant olmadan kontrol et
      const existing = await this.prisma.cari.findFirst({
        where: {
          cariKodu,
        },
      });

      if (existing) {
        throw new BadRequestException('Bu cari kodu zaten kullanılıyor');
      }
    }

    // SUPER_ADMIN için dto'dan tenantId alınabilir, yoksa mevcut tenantId kullan
    const finalTenantId = (dto as any).tenantId || tenantId || undefined;

    return this.prisma.cari.create({
      data: {
        ...dto,
        cariKodu,
        tip,
        tenantId: finalTenantId,
      },
    });
  }

  async findAll(page = 1, limit = 50, search?: string, tip?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    const isStaging = isStagingEnvironment();

    // Staging'de veya SUPER_ADMIN için tenant kontrolünü atla
    if (!tenantId && !isSuperAdmin && !isStaging) {
      throw new BadRequestException('Tenant ID is required');
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    // SUPER_ADMIN için tenantId filtresi ekleme
    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (search) {
      where.OR = [
        { cariKodu: { contains: search, mode: 'insensitive' } },
        { unvan: { contains: search, mode: 'insensitive' } },
        { vergiNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tip) {
      where.tip = tip;
    }

    const [cariler, total] = await Promise.all([
      this.prisma.cari.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              cariHareketler: true,
            },
          },
        },
      }),
      this.prisma.cari.count({ where }),
    ]);

    // Add hareketSayisi field for frontend
    const data = cariler.map((cari) => ({
      ...cari,
      hareketSayisi: cari._count.cariHareketler,
      _count: undefined, // Remove _count from response
    }));

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

  async findOne(id: string) {
    const cari = await this.prisma.cari.findUnique({
      where: { id },
      include: {
        faturalar: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tahsilatlar: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        cariHareketler: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    return cari;
  }

  async update(id: string, dto: UpdateCariDto) {
    await this.findOne(id);

    return this.prisma.cari.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const cari = await this.findOne(id);

    // Hareket kaydı kontrolü
    const hareketSayisi = await this.prisma.cariHareket.count({
      where: { cariId: id },
    });

    if (hareketSayisi > 0) {
      throw new BadRequestException(
        'Bu cari hesap hareket görmüştür ve silinemez. Lütfen "Kullanım Dışı" olarak işaretleyin.',
      );
    }

    return this.prisma.cari.delete({
      where: { id },
    });
  }

  async getHareketler(cariId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cariHareket.findMany({
        where: { cariId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cariHareket.count({ where: { cariId } }),
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
}
