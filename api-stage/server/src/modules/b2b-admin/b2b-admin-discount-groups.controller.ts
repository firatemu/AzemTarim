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
import {
  CreateB2bDiscountGroupDto,
  UpdateB2bDiscountGroupDto,
} from './dto/b2b-discount-group.dto';
import { B2bAdminDiscountGroupService } from './services/b2b-admin-discount-group.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/discount-groups')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminDiscountGroupsController {
  constructor(
    private readonly service: B2bAdminDiscountGroupService,
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
  @ApiOperation({ summary: 'İskonto grupları' })
  async list() {
    return this.service.list(await this.tenant());
  }

  @Post()
  @ApiOperation({ summary: 'Grup oluştur' })
  async create(@Body() dto: CreateB2bDiscountGroupDto) {
    return this.service.create(await this.tenantWrite(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Grup güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bDiscountGroupDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Grup sil (atanmış cari yoksa)' })
  async remove(@Param('id') id: string) {
    return this.service.remove(await this.tenantWrite(), id);
  }
}
