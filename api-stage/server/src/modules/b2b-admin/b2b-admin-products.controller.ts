import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { B2bProductListQueryDto, UpdateB2bProductDto } from './dto/b2b-product.dto';
import { B2bAdminProductService } from './services/b2b-admin-product.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/products')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminProductsController {
  constructor(
    private readonly service: B2bAdminProductService,
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

  @Get('sync/status')
  @ApiOperation({ summary: 'Son senkron logları' })
  async syncStatus() {
    return this.service.syncStatus(await this.tenant());
  }

  @Post('sync')
  @ApiOperation({ summary: 'Ürün + stok tam senkron (FULL) kuyruğu' })
  async triggerSync() {
    return this.service.triggerSync(await this.tenantWrite());
  }

  @Get()
  @ApiOperation({ summary: 'B2B ürün listesi' })
  async list(@Query() q: B2bProductListQueryDto) {
    return this.service.list(await this.tenant(), q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detayı' })
  async getOne(@Param('id') id: string) {
    return this.service.getOne(await this.tenant(), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'B2B alanları (görünürlük, min adet, açıklama)' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bProductDto) {
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
  @ApiOperation({ summary: 'Ürün görseli yükle (MinIO)' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(await this.tenantWrite(), id, file);
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Ürün görselini kaldır' })
  async deleteImage(@Param('id') id: string) {
    return this.service.deleteImage(await this.tenantWrite(), id);
  }
}
