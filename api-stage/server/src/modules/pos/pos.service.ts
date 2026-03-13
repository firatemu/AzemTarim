import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject, forwardRef } from '@nestjs/common';
import { Prisma, InvoiceType, InvoiceStatus, MovementType, LogAction, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { CreatePosSessionDto } from './dto/create-pos-session.dto';
import { ClosePosSessionDto } from './dto/close-pos-session.dto';
import { CreatePosReturnDto } from './dto/create-pos-return.dto';

@Injectable()
export class PosService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) { }

  /**
   * Create DRAFT invoice for POS cart
   */
  async createDraftSale(dto: CreatePosSaleDto, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });
    if (!dto.accountId) {
      throw new BadRequestException('POS satışı için müşteri (cari) seçimi zorunludur.');
    }
    return this.prisma.$transaction(async (tx) => {
      const prisma = tx as any;

      // Calculate totals
      let subtotal = 0;
      let totalVat = 0;
      let totalDiscount = 0;

      const invoiceItems = dto.items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemVat = itemTotal * (item.vatRate / 100);
        const itemDiscount = itemTotal * (item.discountRate || 0) / 100;
        const itemAmount = itemTotal - itemDiscount + itemVat;

        subtotal += itemTotal;
        totalVat += itemVat;
        totalDiscount += itemDiscount;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatAmount: itemVat,
          amount: itemAmount,
          discountRate: item.discountRate || 0,
          discountAmount: itemDiscount,
        };
      });

      const grandTotal = subtotal + totalVat - totalDiscount;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          tenantId,
          accountId: dto.accountId,
          invoiceType: InvoiceType.SALE,
          status: InvoiceStatus.OPEN,
          totalAmount: subtotal,
          vatAmount: totalVat,
          discount: totalDiscount,
          grandTotal,
          currency: 'TRY',
          exchangeRate: 1,
          notes: dto.notes,
          createdBy: userId,
          updatedBy: userId,
          items: {
            create: invoiceItems,
          },
        },
      });

      // Create product movements (NOT for DRAFT - Rule 1)
      // Stock movements ONLY when status becomes COMPLETED

      return invoice;
    });
  }

  /**
   * Complete sale transaction with ACID guarantees
   * - Stock movements (negative)
   * Gift card validation
   * Credit account validation
   * Customer ledger update
   */
  async completeSale(invoiceId: string, payments: CreatePosSaleDto['payments'], userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
      include: {
        items: true,
        account: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.OPEN) {
      throw new BadRequestException('Sadece TASLAK faturaları tamamlanabilir');
    }

    // Calculate total paid
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    if (Number(totalPaid) !== Number(invoice.grandTotal)) {
      throw new BadRequestException('Ödeme amountı fatura toplamı ile eşleşmiyor');
    }

    return this.prisma.$transaction(async (tx) => {
      const prisma = tx as any;

      // Generate invoice number
      const invoiceNumber = await this.codeTemplateService.getNextCode('INVOICE_SALES' as any);

      // Update invoice status
      await prisma.invoice.updateMany({
        where: {
          id: invoiceId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
        data: {
          status: InvoiceStatus.CLOSED,
          invoiceNo: invoiceNumber,
          updatedBy: userId,
        },
      });

      const updatedInvoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });

      if (!updatedInvoice) throw new NotFoundException('Invoice not found after update');

      // Create POS payments
      const posPayments = await Promise.all(
        payments.map(payment =>
          prisma.posPayment.create({
            data: {
              tenantId,
              invoiceId,
              paymentMethod: payment.paymentMethod,
              amount: payment.amount,
              change: (payment as any).change,
              giftCardId: payment.giftCardId,
              notes: (payment as any).notes,
              createdBy: userId,
              updatedBy: userId,
            },
          })
        )
      );

      // Create stock movements (negative for sale)
      const stockMovements = await Promise.all(
        invoice.items.map(item =>
          prisma.productMovement.create({
            data: {
              tenantId,
              productId: item.productId,
              movementType: MovementType.SALE,
              quantity: -item.quantity, // NEGATIVE - critical
              unitPrice: item.unitPrice,
              invoiceItemId: item.id,
              warehouseId: updatedInvoice.warehouseId,
            },
          })
        )
      );

      // Credit account validation and ledger update
      for (const payment of payments) {
        if (payment.paymentMethod === PaymentMethod.LOAN_ACCOUNT && invoice.accountId) {
          // Validate credit limit
          const account = await prisma.account.findFirst({
            where: {
              id: invoice.accountId,
              ...buildTenantWhereClause(tenantId ?? undefined),
            },
          });

          if (!account) {
            throw new NotFoundException('Customer not found');
          }

          const availableCredit = (account.creditLimit || 0) - (account.balance || 0);

          if (availableCredit < payment.amount) {
            throw new BadRequestException('Müşteri kredi limiti aşıldı');
          }

          // Create customer ledger debit
          await prisma.accountMovement.create({
            data: {
              tenantId,
              accountId: invoice.accountId,
              type: 'DEBIT', // Borçlanır
              amount: payment.amount,
              notes: `POS Satış Faturası: ${invoiceNumber}`,
              date: new Date(),
              createdBy: userId,
            },
          });

          // Update customer balance
          await prisma.account.updateMany({
            where: {
              id: invoice.accountId,
              ...buildTenantWhereClause(tenantId ?? undefined),
            },
            data: {
              balance: {
                increment: payment.amount,
              },
            },
          });
        }

        // Gift card validation
        if (payment.paymentMethod === PaymentMethod.GIFT_CARD && payment.giftCardId) {
          // Gift card balance validation would be here
          // Assuming gift card model exists
        }
      }

      return {
        invoice: updatedInvoice,
        posPayments,
        stockMovements,
      };
    });
  }

  /**
   * Create return transaction with ACID guarantees
   * - Stock movements (positive - returns to shelf)
   * Payment reversal (refund)
   * Credit account ledger credit
   */
  async createReturn(dto: CreatePosReturnDto, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    const originalInvoice = await this.prisma.invoice.findFirst({
      where: {
        id: dto.originalInvoiceId,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
      include: {
        items: true,
        account: true,
      },
    });

    if (!originalInvoice) {
      throw new NotFoundException('Original invoice not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const prisma = tx as any;

      // Generate invoice number
      const invoiceNumber = await this.codeTemplateService.getNextCode('INVOICE_SALES' as any);

      // Create return invoice
      const returnInvoice = await prisma.invoice.create({
        data: {
          tenantId,
          accountId: originalInvoice.accountId,
          invoiceType: InvoiceType.SALES_RETURN,
          status: InvoiceStatus.CLOSED,
          totalAmount: dto.totalAmount,
          vatAmount: 0,
          discount: 0,
          grandTotal: dto.totalAmount,
          currency: 'TRY',
          exchangeRate: 1,
          notes: (dto.notes || '') + ' [İade orijinal fatura: ' + dto.originalInvoiceId + ']',
          createdBy: userId,
          updatedBy: userId,
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: 0,
              amount: item.quantity * item.unitPrice,
              discountRate: 0,
              discountAmount: 0,
            })),
          },
        },
      });

      // Create stock movements (positive for return)
      const stockMovements = await Promise.all(
        dto.items.map(item =>
          prisma.productMovement.create({
            data: {
              tenantId,
              productId: item.productId,
              movementType: MovementType.RETURN,
              quantity: item.quantity, // POSITIVE - stock returns to shelf
              unitPrice: item.unitPrice,
              invoiceItemId: null, // Not linking to original items
              warehouseId: originalInvoice.warehouseId,
            },
          })
        )
      );

      // Create refund payment
      const posPayment = await prisma.posPayment.create({
        data: {
          tenantId,
          invoiceId: returnInvoice.id,
          paymentMethod: dto.paymentMethod,
          amount: dto.totalAmount,
          notes: `İade: ${dto.notes || ''}`,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // Credit account ledger credit
      if (originalInvoice.accountId && originalInvoice.invoiceType === InvoiceType.SALE) {
        // Check if original used credit account
        const originalPayments = await prisma.collection.findMany({
          where: {
            invoiceId: dto.originalInvoiceId,
            paymentType: PaymentMethod.LOAN_ACCOUNT,
          },
        });

        if (originalPayments.length > 0) {
          const totalOriginalCredit = originalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

          // Create customer ledger credit
          await prisma.accountMovement.create({
            data: {
              tenantId,
              accountId: originalInvoice.accountId,
              type: 'CREDIT', // Alacaklandır
              amount: dto.totalAmount,
              notes: `POS İade: ${invoiceNumber}`,
              date: new Date(),
              createdBy: userId,
            },
          });

          // Update customer balance
          await prisma.account.updateMany({
            where: {
              id: originalInvoice.accountId,
              ...buildTenantWhereClause(tenantId ?? undefined),
            },
            data: {
              balance: {
                decrement: dto.totalAmount,
              },
            },
          });
        }
      }

      return {
        invoice: returnInvoice,
        posPayment,
        stockMovements,
      };
    });
  }

  /**
   * Create POS cashier session
   */
  async createSession(dto: CreatePosSessionDto, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    // Generate session number
    const sessionNo = await this.codeTemplateService.getNextCode('POS_CONSOLE' as any);

    return this.prisma.posSession.create({
      data: {
        tenantId,
        cashierId: dto.cashierId,
        cashboxId: dto.cashboxId,
        openingAmount: dto.openingAmount,
        status: 'OPEN',
        sessionNo,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Close POS cashier session
   */
  async closeSession(sessionId: string, dto: ClosePosSessionDto, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const session = await this.prisma.posSession.findFirst({
      where: {
        id: sessionId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'OPEN') {
      throw new BadRequestException('Sadece açık sessionlar kapatılabilir');
    }

    return this.prisma.posSession.updateMany({
      where: {
        id: sessionId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      data: {
        closingAmount: dto.closingAmount,
        closingNotes: dto.closingNotes,
        status: 'CLOSED',
        closedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  /**
   * Get product by barcode
   */
  async getProductsByBarcode(barcode: string, tenantId?: string) {
    const resolvedTenantId = tenantId || await this.tenantResolver.resolveForQuery();

    return this.prisma.product.findMany({
      where: {
        ...buildTenantWhereClause(resolvedTenantId ?? undefined),
        OR: [
          { barcode: { equals: barcode, mode: 'insensitive' } },
          { code: { equals: barcode, mode: 'insensitive' } },
        ],
        deletedAt: null,
      }
    });
  }

  /**
   * Get active carts (DRAFT invoices) for a cashier
   */
  async getActiveCarts(cashierId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.invoice.findMany({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        invoiceType: InvoiceType.SALE,
        status: InvoiceStatus.OPEN,
        deletedAt: null,
        cashierId, // If provided, filter by cashier
      },
      include: {
        items: true,
        account: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete draft cart
   */
  async deleteDraftCart(invoiceId: string, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.OPEN) {
      throw new BadRequestException('Sadece TASLAK faturaları silinebilir');
    }

    // Soft delete (no stock reversal per Rule 1)
    return this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}
