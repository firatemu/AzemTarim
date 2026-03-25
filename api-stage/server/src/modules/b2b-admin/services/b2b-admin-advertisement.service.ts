import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { B2BAdType } from '@prisma/client';
import { extname } from 'path';
import { PrismaService } from '../../../common/prisma.service';
import type { IStorageService } from '../../storage/interfaces/storage-service.interface';
import {
  CreateB2bAdvertisementDto,
  UpdateB2bAdvertisementDto,
} from '../dto/b2b-advertisement.dto';

@Injectable()
export class B2bAdminAdvertisementService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('STORAGE_SERVICE') private readonly storage: IStorageService,
  ) {}

  async list(tenantId: string) {
    return this.prisma.b2BAdvertisement.findMany({
      where: { tenantId },
      orderBy: [{ type: 'asc' }, { displayOrder: 'asc' }],
    });
  }

  private async adsFolder(tenantId: string) {
    const cfg = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });
    if (!cfg) throw new NotFoundException('B2B tenant configuration not found');
    return `b2b/${cfg.schemaName}/ads`;
  }

  async create(
    tenantId: string,
    file: Express.Multer.File,
    type: B2BAdType,
    dto: Partial<CreateB2bAdvertisementDto>,
  ) {
    if (!file?.buffer) throw new BadRequestException('Image file required');

    const folder = await this.adsFolder(tenantId);
    const ext = extname(file.originalname) || '.jpg';
    const renamed: Express.Multer.File = {
      ...file,
      originalname: `ad-${type.toLowerCase()}-${Date.now()}${ext}`,
    };
    const key = await this.storage.uploadFile({
      tenantId,
      file: renamed,
      folder,
    });

    return this.prisma.b2BAdvertisement.create({
      data: {
        tenantId,
        type,
        imageUrl: key,
        linkUrl: dto.linkUrl ?? null,
        displayOrder: dto.displayOrder ?? 0,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateB2bAdvertisementDto) {
    const existing = await this.prisma.b2BAdvertisement.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Advertisement not found');

    return this.prisma.b2BAdvertisement.update({
      where: { id },
      data: {
        ...(dto.type != null && { type: dto.type }),
        ...(dto.linkUrl !== undefined && { linkUrl: dto.linkUrl }),
        ...(dto.displayOrder != null && { displayOrder: dto.displayOrder }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
        ...(dto.startsAt !== undefined && {
          startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        }),
        ...(dto.endsAt !== undefined && {
          endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        }),
      },
    });
  }

  async uploadImage(tenantId: string, id: string, file: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('File required');
    const ad = await this.prisma.b2BAdvertisement.findFirst({
      where: { id, tenantId },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    const folder = await this.adsFolder(tenantId);
    const ext = extname(file.originalname) || '.jpg';
    const renamed: Express.Multer.File = {
      ...file,
      originalname: `ad-${id}${ext}`,
    };

    if (ad.imageUrl) {
      try {
        await this.storage.deleteFile({ tenantId, key: ad.imageUrl });
      } catch {
        /* ignore */
      }
    }

    const key = await this.storage.uploadFile({
      tenantId,
      file: renamed,
      folder,
    });

    return this.prisma.b2BAdvertisement.update({
      where: { id },
      data: { imageUrl: key },
    });
  }

  async remove(tenantId: string, id: string) {
    const ad = await this.prisma.b2BAdvertisement.findFirst({
      where: { id, tenantId },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    if (ad.imageUrl) {
      try {
        await this.storage.deleteFile({ tenantId, key: ad.imageUrl });
      } catch {
        /* ignore */
      }
    }

    await this.prisma.b2BAdvertisement.delete({ where: { id } });
    return { ok: true };
  }
}
