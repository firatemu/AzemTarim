import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { extname } from 'path';
import { B2BSyncType, Prisma } from '@prisma/client';
import { ErpProductLiveMetricsService } from '../../../common/services/erp-product-live-metrics.service';
import { PrismaService } from '../../../common/prisma.service';
import type { IStorageService } from '../../storage/interfaces/storage-service.interface';
import { B2bSyncService } from '../../b2b-sync/b2b-sync.service';
import {
  B2bProductListQueryDto,
  UpdateB2bProductDto,
} from '../dto/b2b-product.dto';

@Injectable()
export class B2bAdminProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly b2bSync: B2bSyncService,
    private readonly liveMetrics: ErpProductLiveMetricsService,
    @Inject('STORAGE_SERVICE') private readonly storage: IStorageService,
  ) { }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit };
  }

  async list(tenantId: string, q: B2bProductListQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.B2BProductWhereInput = { tenantId };
    if (q.isVisibleInB2B !== undefined) {
      where.isVisibleInB2B = q.isVisibleInB2B;
    }
    if (q.brand?.trim()) {
      where.brand = { contains: q.brand.trim(), mode: 'insensitive' };
    }
    if (q.category?.trim()) {
      where.category = { contains: q.category.trim(), mode: 'insensitive' };
    }
    if (q.search?.trim()) {
      const s = q.search.trim();
      where.OR = [
        { product: { name: { contains: s, mode: 'insensitive' } } },
        { product: { code: { contains: s, mode: 'insensitive' } } },
        { oemCode: { contains: s, mode: 'insensitive' } },
        { supplierCode: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.b2BProduct.count({ where }),
      this.prisma.b2BProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { product: { name: 'asc' } },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const erpIds = data.map((r) => r.erpProductId);
    const [qtyMap, priceMap, defaultWh] = await Promise.all([
      this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, erpIds),
      this.liveMetrics.getListUnitPricesByProductIds(tenantId, erpIds),
      this.liveMetrics.getDefaultWarehouse(tenantId),
    ]);

    const enriched = data.map((row) => {
      const { product: erp, ...rest } = row;
      const erpId = row.erpProductId;
      const netQty = qtyMap.get(erpId) ?? 0;
      const livePrice = priceMap.get(erpId);
      const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
      return {
        ...rest,
        stockCode: erp?.code ?? row.stockCode,
        name: erp?.name ?? row.name,
        erpListPrice: livePrice ?? Number(row.erpListPrice),
        stocks,
      };
    });

    return this.paginate(enriched, total, page, limit);
  }

  async getOne(tenantId: string, id: string) {
    const p = await this.prisma.b2BProduct.findFirst({
      where: { id, tenantId },
      include: {
        product: {
          select: { id: true, code: true, name: true },
        },
      },
    });
    if (!p) throw new NotFoundException('B2B product not found');

    const erpId = p.erpProductId;
    const [qtyMap, priceMap, defaultWh] = await Promise.all([
      this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, [erpId]),
      this.liveMetrics.getListUnitPricesByProductIds(tenantId, [erpId]),
      this.liveMetrics.getDefaultWarehouse(tenantId),
    ]);
    const netQty = qtyMap.get(erpId) ?? 0;
    const livePrice = priceMap.get(erpId);
    const { product: erp, ...rest } = p;
    return {
      ...rest,
      stockCode: erp?.code ?? p.stockCode,
      name: erp?.name ?? p.name,
      erpListPrice: livePrice ?? Number(p.erpListPrice),
      stocks: this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateB2bProductDto) {
    const existing = await this.prisma.b2BProduct.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('B2B product not found');

    return this.prisma.b2BProduct.update({
      where: { id },
      data: {
        ...(dto.isVisibleInB2B != null && { isVisibleInB2B: dto.isVisibleInB2B }),
        ...(dto.minOrderQuantity != null && {
          minOrderQuantity: dto.minOrderQuantity,
        }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  private async b2bFolder(tenantId: string) {
    const cfg = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });
    if (!cfg) throw new NotFoundException('B2B tenant configuration not found');
    return `b2b/${cfg.schemaName}/products`;
  }

  async uploadImage(tenantId: string, id: string, file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('File required');
    }
    const product = await this.prisma.b2BProduct.findFirst({
      where: { id, tenantId },
    });
    if (!product) throw new NotFoundException('B2B product not found');

    const folder = await this.b2bFolder(tenantId);
    const safeCode = product.stockCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = extname(file.originalname) || '.jpg';
    const renamed: Express.Multer.File = {
      ...file,
      originalname: `${safeCode}${ext}`,
    };

    if (product.imageUrl) {
      try {
        await this.storage.deleteFile({ tenantId, key: product.imageUrl });
      } catch {
        /* ignore */
      }
    }

    const key = await this.storage.uploadFile({
      tenantId,
      file: renamed,
      folder,
    });

    return this.prisma.b2BProduct.update({
      where: { id },
      data: { imageUrl: key },
    });
  }

  async deleteImage(tenantId: string, id: string) {
    const product = await this.prisma.b2BProduct.findFirst({
      where: { id, tenantId },
    });
    if (!product) throw new NotFoundException('B2B product not found');
    if (!product.imageUrl) return { ok: true };

    try {
      await this.storage.deleteFile({ tenantId, key: product.imageUrl });
    } catch {
      /* ignore */
    }

    await this.prisma.b2BProduct.update({
      where: { id },
      data: { imageUrl: null },
    });
    return { ok: true };
  }

  async triggerSync(
    tenantId: string,
    type: 'PRODUCTS' | 'PRICES' | 'FULL' = 'FULL',
    _userId?: string,
  ): Promise<{ jobId?: string }> {
    const now = new Date();

    await this.prisma.b2BTenantConfig.updateMany({
      where: { tenantId },
      data: { lastSyncRequestedAt: now },
    });

    let syncTypeEnum: B2BSyncType = B2BSyncType.FULL;
    if (type === 'PRODUCTS') syncTypeEnum = B2BSyncType.PRODUCTS;
    else if (type === 'PRICES') syncTypeEnum = B2BSyncType.PRICES;

    return this.b2bSync.manualTrigger(tenantId, syncTypeEnum);
  }

  async getSyncLoops(tenantId: string) {
    return this.prisma.b2BSyncLoop.findMany({
      where: { tenantId },
      include: {
        lastUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { syncType: 'asc' },
    });
  }

  async getAvailableErpProducts(tenantId: string, q: { search?: string; limit?: number | string }) {
    const limit = typeof q?.limit === 'string' ? parseInt(q.limit, 10) : (q?.limit ?? 50);
    const where: Prisma.ProductWhereInput = {
      tenantId,
      isCategoryOnly: { not: true },
      isBrandOnly: { not: true },
    };

    if (q.search?.trim()) {
      const s = q.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { code: { contains: s, mode: 'insensitive' } },
      ];
    }

    const erpProducts = await this.prisma.product.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        category: true,
        mainCategory: true,
        subCategory: true,
        unit: true,
      },
    });

    // Zaten B2B'de olan ürünleri çıkar
    const b2bCodes = await this.prisma.b2BProduct.findMany({
      where: { tenantId },
      select: { stockCode: true },
    });
    const b2bCodeSet = new Set(b2bCodes.map((b) => b.stockCode));

    return erpProducts.filter((p) => !b2bCodeSet.has(p.code));
  }

  async addFromErp(tenantId: string, erpProductId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: erpProductId, tenantId },
    });
    if (!product) {
      throw new NotFoundException('Product not found in ERP');
    }

    // Fiyatı bul
    const priceCard = await this.prisma.priceCard.findFirst({
      where: {
        tenantId,
        productId: erpProductId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.prisma.b2BProduct.create({
      data: {
        tenantId,
        erpProductId: product.id,
        stockCode: product.code,
        name: product.name,
        description: product.description ?? null,
        brand: product.brand ?? null,
        category: product.category ?? product.mainCategory ?? null,
        oemCode: product.oem ?? null,
        supplierCode: product.supplierCode ?? null,
        unit: product.unit ?? null,
        erpListPrice: priceCard ? new Prisma.Decimal(priceCard.price) : new Prisma.Decimal(0),
        isVisibleInB2B: true,
        minOrderQuantity: 1,
      },
    });
  }

  async addBatchFromErp(tenantId: string, erpProductIds: string[]) {
    let added = 0;
    let skipped = 0;

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: erpProductIds },
        tenantId,
      },
    });

    // Zaten B2B'de olanları bul
    const existing = await this.prisma.b2BProduct.findMany({
      where: { tenantId },
      select: { erpProductId: true },
    });
    const existingErpIds = new Set(existing.map((e) => e.erpProductId));

    for (const product of products) {
      if (existingErpIds.has(product.id)) {
        skipped++;
        continue;
      }

      // Fiyatı bul
      const priceCard = await this.prisma.priceCard.findFirst({
        where: {
          tenantId,
          productId: product.id,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      await this.prisma.b2BProduct.create({
        data: {
          tenantId,
          erpProductId: product.id,
          stockCode: product.code,
          name: product.name,
          description: product.description ?? null,
          brand: product.brand ?? null,
          category: product.category ?? product.mainCategory ?? null,
          oemCode: product.oem ?? null,
          supplierCode: product.supplierCode ?? null,
          unit: product.unit ?? null,
          erpListPrice: priceCard ? new Prisma.Decimal(priceCard.price) : new Prisma.Decimal(0),
          isVisibleInB2B: true,
          minOrderQuantity: 1,
        },
      });
      added++;
    }

    return {
      added,
      skipped,
      total: erpProductIds.length,
    };
  }

  syncStatus(tenantId: string) {
    return this.b2bSync.getLastSyncInfo(tenantId);
  }
}
