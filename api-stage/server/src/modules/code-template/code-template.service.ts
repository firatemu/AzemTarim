import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateCodeTemplateDto } from './dto/create-code-template.dto';
import { UpdateCodeTemplateDto } from './dto/update-code-template.dto';
import { ModuleType } from '@prisma/client';

@Injectable()
export class CodeTemplateService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async create(createDto: CreateCodeTemplateDto) {
    // Check if template already exists for this module
    const existing = await this.prisma.codeTemplate.findFirst({
      where: { module: createDto.module },
    });

    if (existing) {
      throw new ConflictException(
        `Bu modül için zaten bir şablon mevcut: ${createDto.module}`,
      );
    }

    return this.prisma.codeTemplate.create({
      data: {
        module: createDto.module,
        name: createDto.name,
        prefix: createDto.prefix,
        digitCount: createDto.digitCount,
        currentValue: createDto.currentValue || 0,
        includeYear: createDto.includeYear !== undefined ? createDto.includeYear : false,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });
  }

  async findAll() {
    return this.prisma.codeTemplate.findMany({
      orderBy: { module: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.codeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Şablon bulunamadı: ${id}`);
    }

    return template;
  }

  async findByModule(module: ModuleType) {
    const template = await this.prisma.codeTemplate.findUnique({
      where: { module },
    });

    if (!template) {
      throw new NotFoundException(`Bu modül için şablon bulunamadı: ${module}`);
    }

    return template;
  }

  async update(id: string, updateDto: UpdateCodeTemplateDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.codeTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.codeTemplate.delete({
      where: { id },
    });
  }

  /**
   * Verilen modül için bir sonraki kodu üretir ve sayacı artırır
   * Örnek: module=WAREHOUSE, prefix="D", digitCount=3, currentValue=5 → "D006"
   */
  async getNextCode(module: ModuleType): Promise<string> {
    try {
      const template = await this.prisma.codeTemplate.findUnique({
        where: { module },
      });

      if (!template) {
        throw new NotFoundException(
          `Bu modül için şablon tanımlanmamış: ${module}`,
        );
      }

      if (!template.isActive) {
        throw new BadRequestException(
          `Bu modül için şablon aktif değil: ${module}`,
        );
      }

      // Sayacı artır (transaction ile)
      const updated = await this.prisma.codeTemplate.update({
        where: { id: template.id },
        data: { currentValue: template.currentValue + 1 },
      });

      // Kodu oluştur
      const nextNumber = updated.currentValue;
      const paddedNumber = String(nextNumber).padStart(template.digitCount, '0');

      let nextCode: string;
      if (template.includeYear) {
        // Format: PREFIX + YIL + PADDED_NUMBER
        // Örnek: AZM2025000000001
        const currentYear = new Date().getFullYear();
        nextCode = `${template.prefix}${currentYear}${paddedNumber}`;
      } else {
        // Format: PREFIX + PADDED_NUMBER (eski format)
        // Örnek: D001, K002
        nextCode = `${template.prefix}${paddedNumber}`;
      }

      return nextCode;
    } catch (error: any) {
      console.error('❌ [CodeTemplate Service] getNextCode hatası:', error);
      console.error('❌ [CodeTemplate Service] Hata detayları:', {
        message: error?.message,
        code: error?.code,
        module,
        stack: error?.stack,
      });
      // Eğer NotFoundException veya BadRequestException ise olduğu gibi fırlat
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || `Kod üretilirken hata oluştu: ${module}`
      );
    }
  }

  /**
   * Verilen modül için sayacı sıfırlar (veya belirtilen değere ayarlar)
   */
  async resetCounter(module: ModuleType, newValue: number = 0) {
    const template = await this.findByModule(module);

    return this.prisma.codeTemplate.update({
      where: { id: template.id },
      data: { currentValue: newValue },
    });
  }

  /**
   * Kod var mı kontrol eder (herhangi bir modül için)
   * Örneğin warehouse create'te kullanıcı kod girerse, önce bu metotla kontrol edilir
   */
  async isCodeUnique(module: ModuleType, code: string): Promise<boolean> {
    const tenantId = this.tenantContext.getTenantId();
    const isSuperAdmin = this.tenantContext.isSuperAdmin();

    // SUPER_ADMIN veya tenant yoksa (seed script gibi durumlarda) true döndür
    if (!tenantId && !isSuperAdmin) {
      return true;
    }

    // SUPER_ADMIN için tenant kontrolünü atla - kod uniqueness kontrolü
    const whereClause: any = {};
    if (tenantId) {
      // SUPER_ADMIN için tenantId filtresi ekleme (tenantId varsa ekle)
      switch (module) {
        case 'WAREHOUSE':
          whereClause.code = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const warehouse = await this.prisma.warehouse.findFirst({
            where: whereClause,
          });
          return !warehouse;

        case 'CASHBOX':
          whereClause.kasaKodu = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const cashbox = await this.prisma.kasa.findFirst({
            where: whereClause,
          });
          return !cashbox;

        case 'PERSONNEL':
          whereClause.personelKodu = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const personnel = await this.prisma.personel.findFirst({
            where: whereClause,
          });
          return !personnel;

        case 'PRODUCT':
          whereClause.stokKodu = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const product = await this.prisma.stok.findFirst({
            where: whereClause,
          });
          return !product;

        case 'CUSTOMER':
          whereClause.cariKodu = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const customer = await this.prisma.cari.findFirst({
            where: whereClause,
          });
          return !customer;

        case 'INVOICE_SALES':
        case 'INVOICE_PURCHASE':
          whereClause.faturaNo = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const invoice = await this.prisma.fatura.findFirst({
            where: whereClause,
          });
          return !invoice;

        case 'ORDER_SALES':
        case 'ORDER_PURCHASE':
          whereClause.siparisNo = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const order = await this.prisma.siparis.findFirst({
            where: whereClause,
          });
          return !order;

        case 'INVENTORY_COUNT':
          whereClause.sayimNo = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const sayim = await this.prisma.sayim.findFirst({
            where: whereClause,
          });
          return !sayim;

        case 'TEKLIF':
          whereClause.teklifNo = code;
          if (tenantId) whereClause.tenantId = tenantId;
          const teklif = await this.prisma.teklif.findFirst({
            where: whereClause,
          });
          return !teklif;

        default:
          return true; // Diğer modüller için şimdilik true döndür
      }
    } else {
      // SUPER_ADMIN için tenant olmadan kontrol et
      switch (module) {
        case 'WAREHOUSE':
          const warehouse = await this.prisma.warehouse.findFirst({
            where: { code },
          });
          return !warehouse;

        case 'CASHBOX':
          const cashbox = await this.prisma.kasa.findFirst({
            where: { kasaKodu: code },
          });
          return !cashbox;

        case 'PERSONNEL':
          const personnel = await this.prisma.personel.findFirst({
            where: { personelKodu: code },
          });
          return !personnel;

        case 'PRODUCT':
          const product = await this.prisma.stok.findFirst({
            where: { stokKodu: code },
          });
          return !product;

        case 'CUSTOMER':
          const customer = await this.prisma.cari.findFirst({
            where: { cariKodu: code },
          });
          return !customer;

        case 'INVOICE_SALES':
        case 'INVOICE_PURCHASE':
          const invoice = await this.prisma.fatura.findFirst({
            where: { faturaNo: code },
          });
          return !invoice;

        case 'ORDER_SALES':
        case 'ORDER_PURCHASE':
          const order = await this.prisma.siparis.findFirst({
            where: { siparisNo: code },
          });
          return !order;

        case 'INVENTORY_COUNT':
          const sayim = await this.prisma.sayim.findFirst({
            where: { sayimNo: code },
          });
          return !sayim;

        case 'TEKLIF':
          const teklif = await this.prisma.teklif.findFirst({
            where: { teklifNo: code },
          });
          return !teklif;

        default:
          return true; // Diğer modüller için şimdilik true döndür
      }
    }
  }
}
