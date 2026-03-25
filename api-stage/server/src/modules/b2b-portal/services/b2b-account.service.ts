import { Injectable, NotFoundException } from '@nestjs/common';
import { B2BOrderStatus, Prisma, RiskStatus } from '@prisma/client';
import { excelOneSheetBuffer } from '../../../common/utils/excel-one-sheet.util';
import { PrismaService } from '../../../common/prisma.service';
import { B2bCartOrderService } from './b2b-cart-order.service';
import { B2BFifoService, type B2BFifoMovementInput } from './b2b-fifo.service';
import { B2bRiskCheckService } from './b2b-risk-check.service';

@Injectable()
export class B2bAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly risk: B2bRiskCheckService,
    private readonly cartOrder: B2bCartOrderService,
    private readonly fifo: B2BFifoService,
  ) {}

  /** Tüm hareketler — FIFO tahsılata göre doğru sıra için tarih + id ile sıralı */
  private async fetchMovementsForFifo(
    tenantId: string,
    customerId: string,
  ): Promise<B2BFifoMovementInput[]> {
    return this.prisma.b2BAccountMovement.findMany({
      where: { tenantId, customerId },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        date: true,
        type: true,
        debit: true,
        credit: true,
      },
    });
  }

  async getSummary(tenantId: string, customerId: string) {
    const customer = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        vatDays: true,
        erpAccountId: true,
      },
    });
    if (!customer) {
      throw new NotFoundException('Musteri bulunamadi');
    }

    const account = await this.prisma.account.findFirst({
      where: {
        id: customer.erpAccountId,
        tenantId,
        deletedAt: null,
      },
      select: {
        balance: true,
        creditLimit: true,
        creditStatus: true,
        title: true,
      },
    });

    const overdueAgg = await this.prisma.b2BAccountMovement.aggregate({
      where: { tenantId, customerId, isPastDue: true },
      _sum: {
        debit: true,
        credit: true,
      },
      _count: true,
    });

    const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
    const fifoResult = this.fifo.calculateFifo(
      fifoInputs,
      customer.vatDays ?? 30,
    );
    const fifoPastDueCount = fifoResult.movements.filter((m) => m.isPastDue)
      .length;

    const openOrders = await this.prisma.b2BOrder.count({
      where: {
        tenantId,
        customerId,
        status: {
          in: [B2BOrderStatus.PENDING, B2BOrderStatus.APPROVED],
        },
      },
    });

    let cartPreviewBlocked = false;
    let cartPreviewReason: string | null = null;
    try {
      const cart = await this.cartOrder.getCartSummary(tenantId, customerId);
      if (cart.items.length > 0) {
        await this.risk.assertOrderAllowed(
          tenantId,
          customerId,
          cart.totals.totalFinalPrice,
        );
      }
    } catch (e: unknown) {
      cartPreviewBlocked = true;
      cartPreviewReason =
        e instanceof Error ? e.message : 'Risk kontrolu basarisiz';
    }

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        vatDays: customer.vatDays,
      },
      erpAccount: account
        ? {
            title: account.title,
            balance: new Prisma.Decimal(account.balance).toString(),
            creditLimit:
              account.creditLimit != null
                ? new Prisma.Decimal(account.creditLimit).toString()
                : null,
            creditStatus: account.creditStatus,
          }
        : null,
      overdue: {
        pastDueLineCount: overdueAgg._count,
        sumDebit: (overdueAgg._sum.debit ?? new Prisma.Decimal(0)).toString(),
        sumCredit: (overdueAgg._sum.credit ?? new Prisma.Decimal(0)).toString(),
      },
      fifo: {
        totalDebit: fifoResult.summary.totalDebit.toString(),
        totalCredit: fifoResult.summary.totalCredit.toString(),
        balance: fifoResult.summary.balance.toString(),
        overdueAmount: fifoResult.summary.overdueAmount.toString(),
        oldestOverdueDate:
          fifoResult.summary.oldestOverdueDate?.toISOString() ?? null,
        pastDueMovementCount: fifoPastDueCount,
      },
      openOrdersCount: openOrders,
      placeOrderWithCurrentCart: {
        blocked: cartPreviewBlocked,
        reason: cartPreviewReason,
      },
    };
  }

  async listMovements(
    tenantId: string,
    customerId: string,
    query: {
      page?: number;
      pageSize?: number;
      dateFrom?: string;
      dateTo?: string;
      includeFifo?: boolean;
    },
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where: Prisma.B2BAccountMovementWhereInput = {
      tenantId,
      customerId,
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.b2BAccountMovement.count({ where }),
      this.prisma.b2BAccountMovement.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    let rows: typeof data = data;
    if (query.includeFifo) {
      const cust = await this.prisma.b2BCustomer.findFirst({
        where: { id: customerId, tenantId },
        select: { vatDays: true },
      });
      const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
      const fr = this.fifo.calculateFifo(fifoInputs, cust?.vatDays ?? 30);
      const byId = new Map(fr.movements.map((m) => [m.id, m]));
      rows = data.map((row) => {
        const f = byId.get(row.id);
        if (!f) {
          return row;
        }
        return {
          ...row,
          fifoDueDate: f.dueDate ?? null,
          fifoRemainingDebit:
            f.remainingInvoiceDebit != null
              ? f.remainingInvoiceDebit.toString()
              : null,
          fifoIsPastDue: f.isPastDue,
        };
      });
    }

    return {
      data: rows,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  /** Portal: FIFO sütunlarıyla cari hareket Excel (en yeni önce, maxRows sınırlı) */
  async exportMovementsXlsx(
    tenantId: string,
    customerId: string,
    query: { dateFrom?: string; dateTo?: string; maxRows?: number },
  ): Promise<Buffer> {
    const maxRows = Math.min(query.maxRows ?? 5000, 10000);
    const where: Prisma.B2BAccountMovementWhereInput = {
      tenantId,
      customerId,
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const data = await this.prisma.b2BAccountMovement.findMany({
      where,
      orderBy: { date: 'desc' },
      take: maxRows,
    });

    const cust = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId },
      select: { vatDays: true },
    });
    const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
    const fr = this.fifo.calculateFifo(fifoInputs, cust?.vatDays ?? 30);
    const byId = new Map(fr.movements.map((m) => [m.id, m]));

    const headers = [
      'Tarih',
      'Tip',
      'Aciklama',
      'Borc',
      'Alacak',
      'Bakiye',
      'FaturaNo',
      'FIFO vade',
      'FIFO kalan borc',
      'FIFO gecikme',
    ];

    const rows = data.map((row) => {
      const f = byId.get(row.id);
      return [
        row.date.toISOString(),
        row.type,
        row.description ?? '',
        row.debit.toString(),
        row.credit.toString(),
        row.balance.toString(),
        row.erpInvoiceNo ?? '',
        f?.dueDate ? f.dueDate.toISOString() : '',
        f?.remainingInvoiceDebit != null
          ? f.remainingInvoiceDebit.toString()
          : '',
        f?.isPastDue ? 'Evet' : 'Hayir',
      ];
    });

    return excelOneSheetBuffer('B2B Hareketler', headers, rows);
  }

  /** Dashboard / sepet oncesi: limit ve risk durumu */
  async getRiskSnapshot(tenantId: string, customerId: string) {
    const customer = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId },
      select: { erpAccountId: true, vatDays: true },
    });
    if (!customer) {
      throw new NotFoundException('Musteri bulunamadi');
    }

    const account = await this.prisma.account.findFirst({
      where: {
        id: customer.erpAccountId,
        tenantId,
        deletedAt: null,
      },
      select: {
        balance: true,
        creditLimit: true,
        creditStatus: true,
      },
    });

    const fifoInputs = await this.fetchMovementsForFifo(tenantId, customerId);
    const fifoResult = this.fifo.calculateFifo(
      fifoInputs,
      customer.vatDays ?? 30,
    );
    const overdueMovementCount = fifoResult.movements.filter((m) => m.isPastDue)
      .length;

    const blockedStatuses: RiskStatus[] = [
      RiskStatus.BLACK_LIST,
      RiskStatus.IN_COLLECTION,
    ];
    const creditBlocked =
      !!account?.creditStatus && blockedStatuses.includes(account.creditStatus);

    let overCreditAfterCart = false;
    try {
      const cart = await this.cartOrder.getCartSummary(tenantId, customerId);
      if (
        cart.items.length > 0 &&
        account?.creditLimit != null
      ) {
        const bal = new Prisma.Decimal(account.balance);
        const lim = new Prisma.Decimal(account.creditLimit);
        const exp = bal.add(cart.totals.totalFinalPrice);
        overCreditAfterCart = exp.gt(lim);
      }
    } catch {
      overCreditAfterCart = true;
    }

    return {
      creditStatus: account?.creditStatus ?? null,
      balance:
        account?.balance != null
          ? new Prisma.Decimal(account.balance).toString()
          : null,
      creditLimit:
        account?.creditLimit != null
          ? new Prisma.Decimal(account.creditLimit).toString()
          : null,
      overdueMovementCount,
      fifoOverdueAmount: fifoResult.summary.overdueAmount.toString(),
      blocked:
        creditBlocked || overdueMovementCount > 0 || overCreditAfterCart,
      reasons: {
        creditStatusBlocked: creditBlocked,
        hasOverdueMovements: overdueMovementCount > 0,
        wouldExceedCreditWithCart: overCreditAfterCart,
      },
    };
  }
}
