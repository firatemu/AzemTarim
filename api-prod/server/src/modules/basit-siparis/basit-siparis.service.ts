import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateBasitSiparisDto } from './dto';
import { BasitSiparisDurum } from '@prisma/client';

@Injectable()
export class BasitSiparisService {
  constructor(
    private readonly prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak ONAY_BEKLIYOR olarak ayarlanır
   */
  async create(dto: CreateBasitSiparisDto) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Firma ve ürün kontrolü
    const [firma, urun] = await Promise.all([
      this.prisma.cari.findFirst({ where: { id: dto.firmaId, tenantId } }),
      this.prisma.stok.findFirst({ where: { id: dto.urunId, tenantId } }),
    ]);

    if (!firma) {
      throw new NotFoundException('Firma bulunamadı');
    }

    if (!urun) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const siparis = await this.prisma.basitSiparis.create({
      data: {
        firmaId: dto.firmaId,
        urunId: dto.urunId,
        tenantId,
        miktar: dto.miktar,
        durum: BasitSiparisDurum.ONAY_BEKLIYOR,
        tedarikEdilenMiktar: 0,
      },
      include: {
        firma: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        urun: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            birim: true,
            alisFiyati: true,
          },
        },
      },
    });

    return siparis;
  }

  /**
   * Tüm siparişleri listele
   */
  async findAll(page = 1, limit = 50, durum?: BasitSiparisDurum) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };
    if (durum) {
      where.durum = durum;
    }

    const [siparisler, total] = await Promise.all([
      this.prisma.basitSiparis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          firma: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          urun: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
              birim: true,
              alisFiyati: true,
            },
          },
        },
      }),
      this.prisma.basitSiparis.count({ where }),
    ]);

    return {
      data: siparisler,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tek sipariş getir
   */
  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const siparis = await this.prisma.basitSiparis.findFirst({
      where: { 
        id,
        tenantId,
      },
      include: {
        firma: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            email: true,
          },
        },
        urun: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            birim: true,
            alisFiyati: true,
            kdvOrani: true,
          },
        },
      },
    });

    if (!siparis) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return siparis;
  }
}
