import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { B2bSyncService } from './b2b-sync.service';
import { ExportB2bOrderDto, TriggerB2bSyncDto } from './dto/trigger-b2b-sync.dto';

@ApiTags('b2b-sync')
@UseGuards(JwtAuthGuard)
@Controller('b2b/sync')
export class B2bSyncController {
  constructor(
    private readonly b2bSyncService: B2bSyncService,
    private readonly tenantResolver: TenantResolverService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Son B2B senkron logları ve tenant config özeti' })
  async status() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.b2bSyncService.getLastSyncInfo(tenantId);
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Manuel B2B senkron kuyruğa ekle' })
  async trigger(@Body() dto: TriggerB2bSyncDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.b2bSyncService.manualTrigger(tenantId, dto.syncType, {
      erpAccountId: dto.erpAccountId,
    });
  }

  @Post('export-order')
  @ApiOperation({ summary: 'B2B siparişini ERP’ye aktar (SalesOrder)' })
  async exportOrder(@Body() dto: ExportB2bOrderDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.b2bSyncService.enqueueExportOrder(tenantId, dto.orderId);
  }
}
