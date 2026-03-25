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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import {
  AssignB2bCustomersDto,
  CreateB2bSalespersonDto,
  UpdateB2bSalespersonDto,
} from './dto/b2b-salesperson.dto';
import { B2bAdminSalespersonService } from './services/b2b-admin-salesperson.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/salespersons')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminSalespersonsController {
  constructor(
    private readonly service: B2bAdminSalespersonService,
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
  @ApiOperation({ summary: 'Plasiyer listesi' })
  async list() {
    return this.service.list(await this.tenant());
  }

  @Get(':id/customers')
  @ApiOperation({ summary: 'Atanmış cariler' })
  async customers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listCustomers(
      await this.tenant(),
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 25,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Plasiyer oluştur' })
  async create(@Body() dto: CreateB2bSalespersonDto) {
    return this.service.create(await this.tenantWrite(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Plasiyer güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bSalespersonDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Post(':id/assign-customers')
  @ApiOperation({ summary: 'Cari ata' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignB2bCustomersDto,
  ) {
    return this.service.assignCustomers(await this.tenantWrite(), id, dto);
  }

  @Delete(':id/customers/:customerId')
  @ApiOperation({ summary: 'Cari atamasını kaldır' })
  async unassign(
    @Param('id') id: string,
    @Param('customerId') customerId: string,
  ) {
    return this.service.removeCustomer(await this.tenantWrite(), id, customerId);
  }
}
