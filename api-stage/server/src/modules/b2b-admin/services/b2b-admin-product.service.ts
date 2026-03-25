import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { extname } from 'path';
import { B2BSyncType, Prisma } from '@prisma/client';
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
    @Inject('STORAGE_SERVICE') private readonly storage: IStorageService,
  ) {}

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
        { name: { contains: s, mode: 'insensitive' } },
        { stockCode: { contains: s, mode: 'insensitive' } },
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
        orderBy: { name: 'asc' },
      }),
    ]);

    return this.paginate(data, total, page, limit);
  }

  async getOne(tenantId: string, id: string) {
    const p = await this.prisma.b2BProduct.findFirst({
      where: { id, tenantId },
      include: { stocks: true },
    });
    if (!p) throw new NotFoundException('B2B product not found');
    return p;
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

  async triggerSync(tenantId: string) {
    return this.b2bSync.manualTrigger(tenantId, B2BSyncType.FULL);
  }

  syncStatus(tenantId: string) {
    return this.b2bSync.getLastSyncInfo(tenantId);
  }
}
