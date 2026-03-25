import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import {
  B2bOrderListQueryDto,
  PatchB2bOrderStatusDto,
  RejectB2bOrderDto,
} from './dto/b2b-order.dto';
import { B2bAdminOrderService } from './services/b2b-admin-order.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/orders')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminOrdersController {
  constructor(
    private readonly service: B2bAdminOrderService,
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

  @Get('export')
  @ApiOperation({ summary: 'Filtreli siparişleri Excel indir' })
  async export(@Query() q: B2bOrderListQueryDto, @Res() res: Response) {
    const buf = await this.service.exportExcel(await this.tenant(), q);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=b2b-orders.xlsx`,
      'Content-Length': buf.length,
    });
    res.end(buf);
  }

  @Get()
  @ApiOperation({ summary: 'Sipariş listesi' })
  async list(@Query() q: B2bOrderListQueryDto) {
    return this.service.list(await this.tenant(), q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sipariş detayı' })
  async getOne(@Param('id') id: string) {
    return this.service.getOne(await this.tenant(), id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Onayla ve ERP export kuyruğuna al' })
  async approve(@Param('id') id: string) {
    return this.service.approve(await this.tenantWrite(), id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reddet (not düşer)' })
  async reject(@Param('id') id: string, @Body() dto: RejectB2bOrderDto) {
    return this.service.reject(await this.tenantWrite(), id, dto.reason);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Durum geçişi (VALID_TRANSITIONS)' })
  async patchStatus(
    @Param('id') id: string,
    @Body() dto: PatchB2bOrderStatusDto,
  ) {
    return this.service.patchStatus(await this.tenantWrite(), id, dto);
  }
}
