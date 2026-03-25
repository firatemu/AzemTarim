import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateB2bDiscountDto, UpdateB2bDiscountDto } from './dto/b2b-discount.dto';
import { B2bAdminDiscountService } from './services/b2b-admin-discount.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/discounts')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminDiscountsController {
  constructor(
    private readonly service: B2bAdminDiscountService,
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
  @ApiOperation({ summary: 'İndirim kuralları' })
  async list() {
    return this.service.list(await this.tenant());
  }

  @Post()
  @ApiOperation({ summary: 'İndirim oluştur' })
  async create(@Body() dto: CreateB2bDiscountDto) {
    return this.service.create(await this.tenantWrite(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'İndirim güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bDiscountDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'İndirimi pasifleştir' })
  async remove(@Param('id') id: string) {
    return this.service.softDelete(await this.tenantWrite(), id);
  }
}
