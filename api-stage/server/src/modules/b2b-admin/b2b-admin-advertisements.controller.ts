import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BAdType } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { UpdateB2bAdvertisementDto } from './dto/b2b-advertisement.dto';
import { B2bAdminAdvertisementService } from './services/b2b-admin-advertisement.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/advertisements')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminAdvertisementsController {
  constructor(
    private readonly service: B2bAdminAdvertisementService,
    private readonly tenantResolver: TenantResolverService,
  ) {}

  private async tenant() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return tenantId;
  }

  private async tenantWrite() {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return tenantId;
  }

  @Get()
  @ApiOperation({ summary: 'Reklam listesi' })
  async list() {
    return this.service.list(await this.tenant());
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'type'],
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { enum: Object.values(B2BAdType) },
        linkUrl: { type: 'string' },
        displayOrder: { type: 'number' },
        startsAt: { type: 'string' },
        endsAt: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Reklam oluştur (görsel zorunlu)' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') typeRaw: string,
    @Body('linkUrl') linkUrl?: string,
    @Body('displayOrder') displayOrder?: string,
    @Body('startsAt') startsAt?: string,
    @Body('endsAt') endsAt?: string,
  ) {
    if (!Object.values(B2BAdType).includes(typeRaw as B2BAdType)) {
      throw new BadRequestException('Invalid advertisement type');
    }
    const type = typeRaw as B2BAdType;
    return this.service.create(await this.tenantWrite(), file, type, {
      linkUrl,
      displayOrder: displayOrder != null ? parseInt(displayOrder, 10) : undefined,
      startsAt,
      endsAt,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Reklam güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bAdvertisementDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Post(':id/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Reklam görseli değiştir' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(await this.tenantWrite(), id, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Sil (MinIO nesnesi de silinir)' })
  async remove(@Param('id') id: string) {
    return this.service.remove(await this.tenantWrite(), id);
  }
}
