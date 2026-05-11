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
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import {
  B2bCustomerListQueryDto,
  B2bCustomerMovementsQueryDto,
  B2bFifoPreviewQueryDto,
  CreateB2bCustomerDto,
  UpdateB2bCustomerDto,
} from './dto/b2b-customer.dto';
import { B2bAdminCustomerService } from './services/b2b-admin-customer.service';
import { B2bAdminReportService } from './services/b2b-admin-report.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/customers')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminCustomersController {
  constructor(
    private readonly service: B2bAdminCustomerService,
    private readonly reports: B2bAdminReportService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

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
  @ApiOperation({ summary: 'B2B cari listesi' })
  async list(@Query() q: B2bCustomerListQueryDto) {
    return this.service.list(await this.tenant(), q);
  }

  @Post('sync-account-movements-all')
  @ApiOperation({
    summary: 'Tüm B2B cariler için ERP cari hareket senkronu (tek kuyruk işi)',
  })
  async syncAllAccountMovements() {
    return this.service.queueSyncAllAccountMovements(await this.tenantWrite());
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Cari sipariş geçmişi' })
  async orders(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listOrders(
      await this.tenant(),
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 25,
    );
  }

  @Get(':id/account-movements')
  @ApiOperation({ summary: 'Senkron B2B cari hareketleri' })
  async movements(
    @Param('id') id: string,
    @Query() q: B2bCustomerMovementsQueryDto,
  ) {
    return this.service.listMovements(await this.tenant(), id, q);
  }

  @Get(':id/risk')
  @ApiOperation({ summary: 'Canlı risk (ERP adapter)' })
  async risk(@Param('id') id: string) {
    return this.service.getRisk(await this.tenant(), id);
  }

  @Get(':id/fifo-preview')
  @ApiOperation({
    summary: 'FIFO vade özeti (senkron B2B hareketleri)',
    description:
      'Ödemeler en eski açık faturadan başlayarak kapatılır. format=json (varsayılan), xlsx veya pdf.',
  })
  @ApiProduces(
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
  )
  async fifoPreview(
    @Param('id') id: string,
    @Query() q: B2bFifoPreviewQueryDto,
    @Res() res: Response,
  ) {
    const tenantId = await this.tenant();
    let asOf: Date | undefined;
    if (q.asOf?.trim()) {
      asOf = new Date(q.asOf);
      if (Number.isNaN(asOf.getTime())) {
        throw new BadRequestException('asOf gecersiz ISO tarih');
      }
    }
    const preview = await this.service.getFifoPreview(tenantId, id, asOf);
    const format = q.format ?? 'json';
    if (format === 'json') {
      return res.json(preview);
    }
    if (format === 'xlsx') {
      const buf = await this.reports.excelBuffer(
        'FIFO',
        [
          'id',
          'date',
          'type',
          'debit',
          'credit',
          'dueDate',
          'remaining',
          'pastDue',
        ],
        preview.movements.map((m) => [
          m.id,
          m.date,
          m.type,
          m.debit,
          m.credit,
          m.dueDate ?? '',
          m.remainingInvoiceDebit ?? '',
          m.isPastDue ? 'yes' : 'no',
        ]),
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=b2b-fifo-${id}.xlsx`,
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    const pdfBuf = await this.reports.fifoPreviewPdfBuffer(preview);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=b2b-fifo-${id}.pdf`,
      'Content-Length': pdfBuf.length,
    });
    return res.end(pdfBuf);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Geçici şifre üret' })
  async resetPassword(@Param('id') id: string) {
    return this.service.resetPassword(await this.tenantWrite(), id);
  }

  @Post(':id/sync-movements')
  @ApiOperation({ summary: 'Cari hareket senkron kuyruğu' })
  async syncMovements(@Param('id') id: string) {
    return this.service.syncMovements(await this.tenantWrite(), id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Cari detay + özet istatistik' })
  async getOne(@Param('id') id: string) {
    return this.service.getOne(await this.tenant(), id);
  }

  @Post()
  @ApiOperation({ summary: 'B2B cari oluştur (ERP cari bağla)' })
  async create(@Body() dto: CreateB2bCustomerDto) {
    return this.service.create(await this.tenantWrite(), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'B2B cari güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateB2bCustomerDto) {
    return this.service.update(await this.tenantWrite(), id, dto);
  }

  @Post('import-erp')
  @ApiOperation({ summary: "ERP'den cari hesapları B2B müşterisi olarak aktar" })
  async importFromErp() {
    return this.service.importFromErp(await this.tenantWrite());
  }

  @Post('sync-existing-from-erp')
  @ApiOperation({ summary: "Mevcut B2B müşterilerini ERP'den güncelle" })
  async syncExistingFromErp() {
    return this.service.syncExistingFromErp(await this.tenantWrite());
  }
}
