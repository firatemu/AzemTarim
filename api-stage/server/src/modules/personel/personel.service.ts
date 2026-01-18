import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { UpdatePersonelDto } from './dto/update-personel.dto';
import { CreatePersonelOdemeDto } from './dto/create-personel-odeme.dto';
import { Prisma, PersonelOdemeTip } from '@prisma/client';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class PersonelService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) {}

  async create(createDto: CreatePersonelDto, userId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    if (!tenantId && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    // TC Kimlik No kontrolü (sadece girilmişse ve tenantId varsa)
    if (createDto.tcKimlikNo && tenantId) {
      const existingTc = await this.prisma.personel.findFirst({
        where: { 
          tcKimlikNo: createDto.tcKimlikNo,
          tenantId,
        },
      });

      if (existingTc) {
        throw new BadRequestException(
          'Bu TC Kimlik No ile kayıtlı personel var',
        );
      }
    }

    // Eğer personelKodu girilmemişse otomatik üret
    if (!createDto.personelKodu) {
      try {
        createDto.personelKodu =
          await this.codeTemplateService.getNextCode('PERSONNEL');
      } catch (error) {
        throw new Error(
          'Personel kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    // Personel kodu kontrolü (tenantId varsa)
    if (tenantId) {
      const existingKod = await this.prisma.personel.findFirst({
        where: { 
          personelKodu: createDto.personelKodu,
          tenantId,
        },
      });

      if (existingKod) {
        throw new BadRequestException('Bu personel kodu kullanılıyor');
      }
    }

    // SUPER_ADMIN için dto'dan tenantId alınabilir, yoksa mevcut tenantId kullan
    const finalTenantId = (createDto as any).tenantId || tenantId;

    const data: any = {
      ...createDto,
      tenantId: finalTenantId,
      createdBy: userId,
    };

    if (createDto.dogumTarihi) {
      data.dogumTarihi = new Date(createDto.dogumTarihi);
    }
    if (createDto.iseBaslamaTarihi) {
      data.iseBaslamaTarihi = new Date(createDto.iseBaslamaTarihi);
    }
    if (createDto.istenCikisTarihi) {
      data.istenCikisTarihi = new Date(createDto.istenCikisTarihi);
    }

    return this.prisma.personel.create({
      data,
      include: {
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  async findAll(aktif?: boolean, departman?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    if (!tenantId && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: Prisma.PersonelWhereInput = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (aktif !== undefined) {
      where.aktif = aktif;
    }

    if (departman) {
      where.departman = departman;
    }

    return this.prisma.personel.findMany({
      where,
      include: {
        _count: {
          select: { odemeler: true },
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();
    if (!tenantId && !isSuperAdmin) {
      throw new BadRequestException('Tenant ID is required');
    }

    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const personel = await this.prisma.personel.findFirst({
      where,
      include: {
        odemeler: {
          include: {
            kasa: {
              select: { id: true, kasaAdi: true },
            },
            createdByUser: {
              select: { id: true, fullName: true, username: true },
            },
          },
          orderBy: { tarih: 'desc' },
          take: 50,
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    if (!personel) {
      throw new NotFoundException('Personel bulunamadı');
    }

    return personel;
  }

  async update(id: string, updateDto: UpdatePersonelDto, userId: string) {
    const existing = await this.prisma.personel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Personel bulunamadı');
    }

    const updateData: any = {
      ...updateDto,
      updatedBy: userId,
    };

    if (updateDto.dogumTarihi) {
      updateData.dogumTarihi = new Date(updateDto.dogumTarihi);
    }
    if (updateDto.iseBaslamaTarihi) {
      updateData.iseBaslamaTarihi = new Date(updateDto.iseBaslamaTarihi);
    }
    if (updateDto.istenCikisTarihi) {
      updateData.istenCikisTarihi = new Date(updateDto.istenCikisTarihi);
    }

    return this.prisma.personel.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
        updatedByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  async remove(id: string) {
    const personel = await this.prisma.personel.findUnique({
      where: { id },
      include: {
        _count: { select: { odemeler: true } },
      },
    });

    if (!personel) {
      throw new NotFoundException('Personel bulunamadı');
    }

    if (personel._count.odemeler > 0) {
      throw new BadRequestException(
        'Bu personele ait ödeme kayıtları var. Önce bunları silmeniz gerekir.',
      );
    }

    return this.prisma.personel.delete({
      where: { id },
    });
  }

  // Ödeme işlemleri
  async createOdeme(createOdemeDto: CreatePersonelOdemeDto, userId: string) {
    const personel = await this.prisma.personel.findUnique({
      where: { id: createOdemeDto.personelId },
    });

    if (!personel) {
      throw new NotFoundException('Personel bulunamadı');
    }

    if (!personel.aktif) {
      throw new BadRequestException('Pasif personele ödeme yapılamaz');
    }

    // Kasa varsa kontrol et
    if (createOdemeDto.kasaId) {
      const kasa = await this.prisma.kasa.findUnique({
        where: { id: createOdemeDto.kasaId },
      });

      if (!kasa || !kasa.aktif) {
        throw new NotFoundException('Geçerli bir kasa bulunamadı');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const tarih = createOdemeDto.tarih
        ? new Date(createOdemeDto.tarih)
        : new Date();

      // Ödeme kaydı oluştur
      const odeme = await prisma.personelOdeme.create({
        data: {
          personelId: createOdemeDto.personelId,
          tip: createOdemeDto.tip,
          tutar: createOdemeDto.tutar,
          tarih: tarih,
          donem: createOdemeDto.donem,
          aciklama: createOdemeDto.aciklama,
          kasaId: createOdemeDto.kasaId,
          createdBy: userId,
        },
        include: {
          personel: {
            select: { id: true, ad: true, soyad: true, personelKodu: true },
          },
          kasa: {
            select: { id: true, kasaAdi: true },
          },
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
        },
      });

      // Personel bakiyesini güncelle
      // Bakiye mantığı: Pozitif bakiye = Personele ödenecek, Negatif bakiye = Personelden alınacak (fazla ödeme)
      let yeniBakiye = Number(personel.bakiye);

      switch (createOdemeDto.tip) {
        case PersonelOdemeTip.HAK_EDIS:
          // Hak ediş tanımlandı -> personelin alacağı artar (bakiye artar)
          yeniBakiye += createOdemeDto.tutar;
          break;
        case PersonelOdemeTip.MAAS:
        case PersonelOdemeTip.PRIM:
        case PersonelOdemeTip.AVANS:
          // Ödeme yapıldı -> personelin alacağı azalır (bakiye azalır)
          yeniBakiye -= createOdemeDto.tutar;
          break;
        case PersonelOdemeTip.KESINTI:
          // Kesinti -> personelin alacağı artar (ödenmeyecek miktar artar)
          yeniBakiye += createOdemeDto.tutar;
          break;
        case PersonelOdemeTip.ZIMMET:
          // Zimmet -> personelin borcu artar (bakiye azalır)
          yeniBakiye -= createOdemeDto.tutar;
          break;
        case PersonelOdemeTip.ZIMMET_IADE:
          // Zimmet iadesi -> personelin borcu azalır (bakiye artar)
          yeniBakiye += createOdemeDto.tutar;
          break;
      }

      await prisma.personel.update({
        where: { id: createOdemeDto.personelId },
        data: { bakiye: yeniBakiye },
      });

      // Kasadan ödendi ise kasa bakiyesini güncelle
      if (createOdemeDto.kasaId) {
        const kasa = await prisma.kasa.findUnique({
          where: { id: createOdemeDto.kasaId },
        });

        if (kasa) {
          const yeniKasaBakiye =
            createOdemeDto.tip === PersonelOdemeTip.ZIMMET_IADE
              ? Number(kasa.bakiye) + createOdemeDto.tutar // Zimmet iadesi -> kasa artar
              : Number(kasa.bakiye) - createOdemeDto.tutar; // Ödeme -> kasa azalır

          if (
            yeniKasaBakiye < 0 &&
            createOdemeDto.tip !== PersonelOdemeTip.ZIMMET_IADE
          ) {
            throw new BadRequestException('Kasada yeterli bakiye yok');
          }

          await prisma.kasa.update({
            where: { id: createOdemeDto.kasaId },
            data: { bakiye: yeniKasaBakiye },
          });
        }
      }

      return odeme;
    });
  }

  async getOdemeler(personelId: string) {
    return this.prisma.personelOdeme.findMany({
      where: { personelId },
      include: {
        kasa: {
          select: { id: true, kasaAdi: true },
        },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
      orderBy: { tarih: 'desc' },
    });
  }

  async getStats(departman?: string, aktif?: boolean) {
    const where: Prisma.PersonelWhereInput = {};

    if (aktif !== undefined) {
      where.aktif = aktif;
    }

    if (departman) {
      where.departman = departman;
    }

    const [personeller, toplamMaas, departmanlar] = await Promise.all([
      this.prisma.personel.count({ where }),
      this.prisma.personel.aggregate({
        where,
        _sum: { maas: true, bakiye: true },
      }),
      this.prisma.personel.groupBy({
        by: ['departman'],
        where,
        _count: true,
        _sum: { maas: true },
      }),
    ]);

    return {
      toplamPersonel: personeller,
      toplamMaasBordro: toplamMaas._sum.maas || 0,
      toplamBakiye: toplamMaas._sum.bakiye || 0,
      departmanlar: departmanlar.map((d) => ({
        departman: d.departman || 'Belirtilmemiş',
        personelSayisi: d._count,
        toplamMaas: d._sum.maas || 0,
      })),
    };
  }

  async getDepartmanlar() {
    const result = await this.prisma.personel.groupBy({
      by: ['departman'],
      _count: true,
    });

    return result
      .filter((r) => r.departman)
      .map((r) => ({
        departman: r.departman,
        personelSayisi: r._count,
      }));
  }
}
