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
  CreateB2bCustomerClassDto,
  UpdateB2bCustomerClassDto,
} from './dto/b2b-customer-class.dto';
import { B2bAdminCustomerClassService } from './services/b2b-admin-customer-class.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/customer-classes')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminCustomerClassesController {
  constructor(
    private readonly service: B2bAdminCustomerClassService,
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
  @ApiOperation({ summary: 'Müşteri sınıfları' })
  async list() {
    return this.service.list(await this.tenant());
  }

  @Post()
  @ApiOperation({ summary: 'Sınıf oluştur' })
  async create(@Body() dto: CreateB2bCustomerClassDto) {
    return this.service.create(await this.tenantWrite(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sınıf güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bCustomerClassDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Sınıf sil (atanmış cari yoksa)' })
  async remove(@Param('id') id: string) {
    return this.service.remove(await this.tenantWrite(), id);
  }
}
