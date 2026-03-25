import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { excelOneSheetBuffer } from '../../../common/utils/excel-one-sheet.util';
import { PrismaService } from '../../../common/prisma.service';
import { DateRangeQueryDto } from '../dto/date-range-query.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import type { B2bFifoPreviewPayload } from '../types/b2b-fifo-preview.payload';

@Injectable()
export class B2bAdminReportService {
  constructor(private readonly prisma: PrismaService) {}

  private dateWhere(range?: DateRangeQueryDto): Prisma.DateTimeFilter | undefined {
    if (!range?.from && !range?.to) return undefined;
    const w: Prisma.DateTimeFilter = {};
    if (range.from) w.gte = new Date(range.from);
    if (range.to) w.lte = new Date(range.to);
    return w;
  }

  async ordersSummary(tenantId: string, range?: DateRangeQueryDto) {
    const createdAt = this.dateWhere(range);
    const where: Prisma.B2BOrderWhereInput = { tenantId };
    if (createdAt) where.createdAt = createdAt;

    const [agg, count] = await Promise.all([
      this.prisma.b2BOrder.aggregate({
        where,
        _sum: { totalFinalPrice: true },
        _avg: { totalFinalPrice: true },
      }),
      this.prisma.b2BOrder.count({ where }),
    ]);

    const revenue = Number(agg._sum.totalFinalPrice ?? 0);
    const avg = count > 0 ? revenue / count : 0;

    return {
      totalOrders: count,
      revenue,
      avgOrderValue: avg,
    };
  }

  async byCustomer(
    tenantId: string,
    range: DateRangeQueryDto | undefined,
    p: PaginationQueryDto,
  ) {
    const page = p.page ?? 1;
    const limit = p.limit ?? 25;
    const skip = (page - 1) * limit;
    const createdAt = this.dateWhere(range);

    const orderWhere: Prisma.B2BOrderWhereInput = { tenantId };
    if (createdAt) orderWhere.createdAt = createdAt;

    const grouped = await this.prisma.b2BOrder.groupBy({
      by: ['customerId'],
      where: orderWhere,
      _count: { _all: true },
      _sum: { totalFinalPrice: true },
    });

    const total = grouped.length;
    const slice = grouped.slice(skip, skip + limit);
    const customerIds = slice.map((g) => g.customerId);
    const customers = await this.prisma.b2BCustomer.findMany({
      where: { tenantId, id: { in: customerIds } },
    });
    const byId = new Map(customers.map((c) => [c.id, c]));

    const data = slice.map((g) => ({
      customerId: g.customerId,
      customerName: byId.get(g.customerId)?.name ?? g.customerId,
      orderCount: g._count._all,
      revenue: Number(g._sum.totalFinalPrice ?? 0),
    }));

    return { data, total, page, limit };
  }

  async byProduct(
    tenantId: string,
    range: DateRangeQueryDto | undefined,
    p: PaginationQueryDto,
  ) {
    const page = p.page ?? 1;
    const limit = p.limit ?? 25;
    const skip = (page - 1) * limit;
    const createdAt = this.dateWhere(range);

    const itemWhere: Prisma.B2BOrderItemWhereInput = { tenantId };
    if (createdAt) {
      itemWhere.order = { createdAt };
    }

    const items = await this.prisma.b2BOrderItem.findMany({
      where: itemWhere,
      select: {
        productId: true,
        quantity: true,
        finalPrice: true,
        stockCode: true,
        productName: true,
      },
    });

    const map = new Map<
      string,
      { productId: string; stockCode: string; productName: string; qty: number; revenue: number }
    >();
    for (const it of items) {
      const key = it.productId;
      const cur = map.get(key) ?? {
        productId: it.productId,
        stockCode: it.stockCode,
        productName: it.productName,
        qty: 0,
        revenue: 0,
      };
      cur.qty += it.quantity;
      // finalPrice: satır birim fiyatı varsayımı (satır tutarı = adet × birim)
      cur.revenue += Number(it.finalPrice) * it.quantity;
      map.set(key, cur);
    }

    const rows = [...map.values()].sort((a, b) => b.revenue - a.revenue);
    const total = rows.length;
    const data = rows.slice(skip, skip + limit);

    return { data, total, page, limit };
  }

  async bySalesperson(
    tenantId: string,
    range: DateRangeQueryDto | undefined,
    p: PaginationQueryDto,
  ) {
    const page = p.page ?? 1;
    const limit = p.limit ?? 25;
    const skip = (page - 1) * limit;
    const createdAt = this.dateWhere(range);

    const orderWhere: Prisma.B2BOrderWhereInput = {
      tenantId,
      salespersonId: { not: null },
    };
    if (createdAt) orderWhere.createdAt = createdAt;

    const grouped = await this.prisma.b2BOrder.groupBy({
      by: ['salespersonId'],
      where: orderWhere,
      _count: { _all: true },
      _sum: { totalFinalPrice: true },
    });

    const withSp = grouped.filter((g) => g.salespersonId != null);
    const total = withSp.length;
    const slice = withSp.slice(skip, skip + limit);
    const ids = slice.map((g) => g.salespersonId as string);

    const sps = await this.prisma.b2BSalesperson.findMany({
      where: { tenantId, id: { in: ids } },
    });
    const byId = new Map(sps.map((s) => [s.id, s]));

    const customerCounts = await Promise.all(
      ids.map((id) =>
        this.prisma.b2BSalespersonCustomer.count({
          where: { salespersonId: id },
        }),
      ),
    );
    const ccMap = new Map(ids.map((id, i) => [id, customerCounts[i]]));

    const data = slice.map((g) => {
      const spId = g.salespersonId as string;
      return {
        salespersonId: spId,
        name: byId.get(spId)?.name ?? spId,
        orderCount: g._count._all,
        revenue: Number(g._sum.totalFinalPrice ?? 0),
        assignedCustomerCount: ccMap.get(spId) ?? 0,
      };
    });

    return { data, total, page, limit };
  }

  async collections(
    tenantId: string,
    range: DateRangeQueryDto | undefined,
    p: PaginationQueryDto,
  ) {
    const page = p.page ?? 1;
    const limit = p.limit ?? 25;
    const skip = (page - 1) * limit;
    const dateF = this.dateWhere(range);

    const customers = await this.prisma.b2BCustomer.findMany({
      where: { tenantId },
      select: { id: true, name: true, erpAccountId: true },
      orderBy: { name: 'asc' },
    });

    const rows: {
      customerId: string;
      name: string;
      totalDebit: number;
      totalCredit: number;
      latestBalance: number | null;
    }[] = [];

    for (const c of customers) {
      const mWhere: Prisma.B2BAccountMovementWhereInput = {
        tenantId,
        customerId: c.id,
      };
      if (dateF) mWhere.date = dateF;

      const [sums, last] = await Promise.all([
        this.prisma.b2BAccountMovement.aggregate({
          where: mWhere,
          _sum: { debit: true, credit: true },
        }),
        this.prisma.b2BAccountMovement.findFirst({
          where: mWhere,
          orderBy: { date: 'desc' },
        }),
      ]);

      rows.push({
        customerId: c.id,
        name: c.name,
        totalDebit: Number(sums._sum.debit ?? 0),
        totalCredit: Number(sums._sum.credit ?? 0),
        latestBalance: last ? Number(last.balance) : null,
      });
    }

    const total = rows.length;
    const data = rows.slice(skip, skip + limit);
    return { data, total, page, limit };
  }

  async excelBuffer(
    sheetName: string,
    headers: string[],
    rows: (string | number | null)[][],
  ): Promise<Buffer> {
    return excelOneSheetBuffer(sheetName, headers, rows);
  }

  /** B2B admin — FIFO cari önizleme PDF (basit tablo) */
  async fifoPreviewPdfBuffer(payload: B2bFifoPreviewPayload): Promise<Buffer> {
    const vfs = require('pdfmake/build/vfs_fonts.js') as Record<
      string,
      string
    >;
    const fonts = {
      Roboto: {
        normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(
          vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'],
          'base64',
        ),
      },
    };
    const printer = new PdfPrinter(fonts);

    const headerRow = [
      { text: 'Tarih', style: 'th' },
      { text: 'Tip', style: 'th' },
      { text: 'Borç', style: 'th', alignment: 'right' as const },
      { text: 'Alacak', style: 'th', alignment: 'right' as const },
      { text: 'Vade', style: 'th' },
      { text: 'Kalan', style: 'th', alignment: 'right' as const },
      { text: 'Gecikme', style: 'th' },
    ];

    const body: unknown[][] = [headerRow];
    for (const m of payload.movements) {
      body.push([
        m.date.slice(0, 10),
        m.type,
        m.debit,
        m.credit,
        m.dueDate ? m.dueDate.slice(0, 10) : '—',
        m.remainingInvoiceDebit ?? '—',
        m.isPastDue ? 'Evet' : 'Hayır',
      ]);
    }

    const doc: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      defaultStyle: { font: 'Roboto', fontSize: 8 },
      styles: {
        th: { bold: true },
        title: { fontSize: 14, bold: true },
      },
      content: [
        { text: 'B2B FIFO — Cari önizleme', style: 'title' },
        {
          text: `${payload.customer.name} (${payload.customer.email})`,
          margin: [0, 4, 0, 2],
        },
        {
          text: `Referans: ${payload.asOf}  |  Vade günü: ${payload.vatDays}`,
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            `Borç: ${payload.summary.totalDebit}  `,
            `Alacak: ${payload.summary.totalCredit}  `,
            `Bakiye: ${payload.summary.balance}  `,
            `Gecikmiş: ${payload.summary.overdueAmount}  `,
            `(Satır: ${payload.summary.pastDueMovementCount})`,
          ].join(''),
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body,
          },
        },
      ],
    };

    return await new Promise((resolve, reject) => {
      const pdf = printer.createPdfKitDocument(doc);
      const chunks: Buffer[] = [];
      pdf.on('data', (c: Buffer) => chunks.push(c));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);
      pdf.end();
    });
  }
}
