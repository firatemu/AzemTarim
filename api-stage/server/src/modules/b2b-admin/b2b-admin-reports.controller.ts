import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { B2bReportQueryDto } from './dto/b2b-report-query.dto';
import { B2bAdminReportService } from './services/b2b-admin-report.service';

@ApiTags('B2B Admin')
@Controller('b2b-admin/reports')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminReportsController {
  constructor(
    private readonly service: B2bAdminReportService,
    private readonly tenantResolver: TenantResolverService,
  ) {}

  private async tenant() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return tenantId;
  }

  @Get('orders-summary')
  @ApiOperation({ summary: 'Sipariş özeti (tarih aralığı)' })
  async ordersSummary(@Query() q: B2bReportQueryDto, @Res() res: Response) {
    const tenantId = await this.tenant();
    const { format, ...range } = q;
    const summary = await this.service.ordersSummary(tenantId, range);
    if (format === 'xlsx') {
      const buf = await this.service.excelBuffer(
        'Orders Summary',
        ['metric', 'value'],
        [
          ['totalOrders', summary.totalOrders],
          ['revenue', summary.revenue],
          ['avgOrderValue', summary.avgOrderValue],
        ],
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=b2b-orders-summary.xlsx',
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    return res.json(summary);
  }

  @Get('by-customer')
  @ApiOperation({ summary: 'Cari bazlı sipariş / ciro' })
  async byCustomer(@Query() q: B2bReportQueryDto, @Res() res: Response) {
    const tenantId = await this.tenant();
    const { format, ...rest } = q;
    const result = await this.service.byCustomer(tenantId, rest, rest);
    if (format === 'xlsx') {
      const buf = await this.service.excelBuffer(
        'By Customer',
        ['customerId', 'customerName', 'orderCount', 'revenue'],
        result.data.map((r) => [
          r.customerId,
          r.customerName,
          r.orderCount,
          r.revenue,
        ]),
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=b2b-by-customer.xlsx',
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    return res.json(result);
  }

  @Get('by-product')
  @ApiOperation({ summary: 'Ürün bazlı satış' })
  async byProduct(@Query() q: B2bReportQueryDto, @Res() res: Response) {
    const tenantId = await this.tenant();
    const { format, ...rest } = q;
    const result = await this.service.byProduct(tenantId, rest, rest);
    if (format === 'xlsx') {
      const buf = await this.service.excelBuffer(
        'By Product',
        ['productId', 'stockCode', 'productName', 'qty', 'revenue'],
        result.data.map((r) => [
          r.productId,
          r.stockCode,
          r.productName,
          r.qty,
          r.revenue,
        ]),
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=b2b-by-product.xlsx',
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    return res.json(result);
  }

  @Get('by-salesperson')
  @ApiOperation({ summary: 'Plasiyer bazlı' })
  async bySalesperson(@Query() q: B2bReportQueryDto, @Res() res: Response) {
    const tenantId = await this.tenant();
    const { format, ...rest } = q;
    const result = await this.service.bySalesperson(tenantId, rest, rest);
    if (format === 'xlsx') {
      const buf = await this.service.excelBuffer(
        'By Salesperson',
        [
          'salespersonId',
          'name',
          'orderCount',
          'revenue',
          'assignedCustomerCount',
        ],
        result.data.map((r) => [
          r.salespersonId,
          r.name,
          r.orderCount,
          r.revenue,
          r.assignedCustomerCount,
        ]),
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=b2b-by-salesperson.xlsx',
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    return res.json(result);
  }

  @Get('collections')
  @ApiOperation({ summary: 'Cari hareket özeti (senkron veri)' })
  async collections(@Query() q: B2bReportQueryDto, @Res() res: Response) {
    const tenantId = await this.tenant();
    const { format, ...rest } = q;
    const result = await this.service.collections(tenantId, rest, rest);
    if (format === 'xlsx') {
      const buf = await this.service.excelBuffer(
        'Collections',
        ['customerId', 'name', 'totalDebit', 'totalCredit', 'latestBalance'],
        result.data.map((r) => [
          r.customerId,
          r.name,
          r.totalDebit,
          r.totalCredit,
          r.latestBalance,
        ]),
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=b2b-collections.xlsx',
        'Content-Length': buf.length,
      });
      return res.end(buf);
    }
    return res.json(result);
  }
}
