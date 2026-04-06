import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DebitCredit,
  DocumentType,
  OrderType,
  PriceCardType,
  Prisma,
  SalesOrderStatus,
} from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import type { IErpAdapter } from './i-erp-adapter.interface';
import type {
  B2BOrderExportDto,
  ErpAccount,
  ErpAccountMovement,
  ErpAccountRisk,
  ErpAddress,
  ErpMovementType,
  ErpProduct,
  ErpSalesperson,
  ErpStockItem,
  ErpWarehouse,
} from '../dto/erp-types.dto';

@Injectable()
export class OtomuhasebeErpAdapter implements IErpAdapter {
  private readonly logger = new Logger(OtomuhasebeErpAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantId: string,
  ) { }

  async getProducts(lastSyncedAt: Date | null): Promise<ErpProduct[]> {
    const started = Date.now();
    const where: Prisma.ProductWhereInput = {
      tenantId: this.tenantId,
      // Kategori veya marka placeholder'ları hariç tut
      isCategoryOnly: { not: true },
      isBrandOnly: { not: true },
    };
    if (lastSyncedAt) {
      where.OR = [
        { updatedAt: { gt: lastSyncedAt } },
        { createdAt: { gt: lastSyncedAt } },
        { priceCards: { some: { updatedAt: { gt: lastSyncedAt } } } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'asc' },
    });

    const productIds = products.map((p) => p.id);
    const priceByProduct = await this.loadListPrices(productIds);

    const result = products.map((p) => ({
      erpProductId: p.id,
      stockCode: p.code,
      name: p.name,
      description: p.description ?? undefined,
      brand: p.brand ?? undefined,
      category: p.category ?? p.mainCategory ?? undefined,
      oemCode: p.oem ?? undefined,
      supplierCode: p.supplierCode ?? undefined,
      unit: p.unit ?? undefined,
      listPrice: priceByProduct.get(p.id) ?? 0,
      erpCreatedAt: p.createdAt,
      erpUpdatedAt: p.updatedAt,
    }));

    this.logger.log(
      `getProducts tenant=${this.tenantId} count=${result.length} ms=${Date.now() - started}`,
    );
    return result;
  }

  private async loadListPrices(
    productIds: string[],
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (productIds.length === 0) return map;

    const cards = await this.prisma.priceCard.findMany({
      where: {
        tenantId: this.tenantId,
        productId: { in: productIds },
        isActive: true,
        type: { in: [PriceCardType.LIST, PriceCardType.SALE] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    for (const c of cards) {
      if (!map.has(c.productId)) {
        map.set(c.productId, Number(c.price));
      }
    }
    return map;
  }

  async getPrices(lastSyncedAt: Date | null): Promise<{ erpProductId: string, listPrice: number }[]> {
    const started = Date.now();

    // 1. Fiyat kartı veya Ürün kartı (Stok kartı) değişenleri saptıyoruz
    const wherePrice: Prisma.PriceCardWhereInput = {
      tenantId: this.tenantId,
      isActive: true,
      type: { in: [PriceCardType.LIST, PriceCardType.SALE] },
    };

    const whereProduct: Prisma.ProductWhereInput = {
      tenantId: this.tenantId,
    };

    if (lastSyncedAt) {
      wherePrice.updatedAt = { gt: lastSyncedAt };
      whereProduct.updatedAt = { gt: lastSyncedAt };
    }

    // Değişen ürünlerin ID'lerini bulalım
    const [cardsByPriceUpdate, productsByUpdate] = await Promise.all([
      this.prisma.priceCard.findMany({
        where: wherePrice,
        select: { productId: true },
      }),
      this.prisma.product.findMany({
        where: whereProduct,
        select: { id: true },
      }),
    ]);

    const affectedProductIds = new Set([
      ...cardsByPriceUpdate.map((c) => c.productId),
      ...productsByUpdate.map((p) => p.id),
    ]);

    if (affectedProductIds.size === 0) return [];

    // Etkilenen tüm ürünlerin GÜNCEL (en son) fiyatlarını çekiyoruz
    const latestCards = await this.prisma.priceCard.findMany({
      where: {
        tenantId: this.tenantId,
        productId: { in: Array.from(affectedProductIds) },
        isActive: true,
        type: { in: [PriceCardType.LIST, PriceCardType.SALE] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const distinctMap = new Map<string, number>();
    for (const c of latestCards) {
      if (!distinctMap.has(c.productId)) {
        distinctMap.set(c.productId, Number(c.price));
      }
    }

    const result = Array.from(distinctMap.entries()).map(([erpProductId, listPrice]) => ({
      erpProductId,
      listPrice,
    }));

    this.logger.log(
      `getPrices tenant=${this.tenantId} affected=${affectedProductIds.size} result=${result.length} ms=${Date.now() - started}`,
    );
    return result;
  }

  async getStock(productIds: string[], lastSyncedAt?: Date | null): Promise<ErpStockItem[]> {
    const started = Date.now();
    if (productIds.length === 0) return [];

    // Hareket bazlı filtreleme:
    // lastSyncedAt verilmişse, ProductLocationStock.updatedAt > lastSyncedAt olan
    // (yani son senkronizasyondan sonra stok miktarı değişmiş) ürünleri bul.
    // Bu yaklaşım hem yeni kayıt eklemeleri hem de fatura güncellemelerini kapsar,
    // çünkü ProductLocationStock Prisma @updatedAt ile otomatik güncellenir.
    let filteredIds = productIds;

    if (lastSyncedAt) {
      const changedStocks = await this.prisma.productLocationStock.findMany({
        where: {
          tenantId: this.tenantId,
          productId: { in: productIds },
          updatedAt: { gt: lastSyncedAt },
        },
        select: { productId: true },
        distinct: ['productId'],
      });

      // Eğer hiçbir stok değişmemişse erken çık
      if (changedStocks.length === 0) {
        this.logger.log(
          `getStock tenant=${this.tenantId} no changes since ${lastSyncedAt.toISOString()} — skipped`,
        );
        return [];
      }

      filteredIds = changedStocks.map((s) => s.productId);
      this.logger.log(
        `getStock tenant=${this.tenantId} incremental: ${filteredIds.length}/${productIds.length} products affected`,
      );
    }

    const rows = await this.prisma.productLocationStock.findMany({
      where: {
        tenantId: this.tenantId,
        productId: { in: filteredIds },
      },
      include: { warehouse: true },
    });

    const agg = new Map<string, ErpStockItem>();
    for (const r of rows) {
      const key = `${r.productId}:${r.warehouseId}`;
      const qty = Number(r.qtyOnHand);
      const existing = agg.get(key);
      if (existing) {
        existing.quantity += qty;
      } else {
        agg.set(key, {
          erpProductId: r.productId,
          warehouseId: r.warehouseId,
          warehouseName: r.warehouse.name,
          quantity: qty,
        });
      }
    }

    const result = [...agg.values()];
    this.logger.log(
      `getStock tenant=${this.tenantId} rows=${result.length} ms=${Date.now() - started}`,
    );
    return result;
  }

  async getAccount(erpAccountId: string): Promise<ErpAccount> {
    const account = await this.prisma.account.findFirst({
      where: {
        id: erpAccountId,
        tenantId: this.tenantId,
        deletedAt: null,
      },
      include: { addresses: true },
    });

    if (!account) {
      throw new NotFoundException(`Account not found: ${erpAccountId}`);
    }

    const addresses: ErpAddress[] = account.addresses.map((a) => ({
      id: a.id,
      label: a.title,
      fullAddress: [a.address, a.city, a.district, a.postalCode]
        .filter(Boolean)
        .join(', '),
      isDefault: a.isDefault,
    }));

    return {
      erpAccountId: account.id,
      name: account.title,
      email: account.email ?? undefined,
      phone: account.phone ?? undefined,
      addresses,
    };
  }

  async getAccounts(lastSyncedAt: Date | null): Promise<ErpAccount[]> {
    const rows = await this.prisma.account.findMany({
      where: {
        tenantId: this.tenantId,
        deletedAt: null,
      },
    });
    return rows.map((a) => ({
      erpNum: a.code, // code alanını erpNum olarak kullan
      erpAccountId: a.id,
      name: a.title,
      email: a.email ?? undefined,
      phone: a.phone ?? undefined,
      addresses: [],
      salespersonId: a.salesAgentId ?? undefined,
    }));
  }

  async getSalespersons(): Promise<ErpSalesperson[]> {
    const rows = await this.prisma.salesAgent.findMany({
      where: {
        OR: [
          { tenantId: this.tenantId },
          { tenantId: null }, // TenantId null olan eski kayıtları da al
        ],
        isActive: true,
      },
    });
    return rows.map((s) => ({
      erpSalespersonId: s.id,
      name: s.fullName,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
      isActive: s.isActive,
    }));
  }

  async getAccountMovements(
    erpAccountId: string,
    lastSyncedAt: Date | null,
  ): Promise<ErpAccountMovement[]> {
    const where: Prisma.AccountMovementWhereInput = {
      tenantId: this.tenantId,
      accountId: erpAccountId,
      deletedAt: null,
    };
    if (lastSyncedAt) {
      where.createdAt = { gt: lastSyncedAt };
    }

    const rows = await this.prisma.accountMovement.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return rows.map((m) => this.mapAccountMovement(m));
  }

  private mapAccountMovement(m: {
    id: string;
    date: Date;
    type: DebitCredit;
    amount: Prisma.Decimal;
    balance: Prisma.Decimal;
    documentType: DocumentType | null;
    documentNo: string | null;
    notes: string;
  }): ErpAccountMovement {
    const amount = Number(m.amount);
    let debit = 0;
    let credit = 0;
    if (m.type === DebitCredit.DEBIT) debit = amount;
    else if (m.type === DebitCredit.CREDIT) credit = amount;
    else {
      debit = amount >= 0 ? amount : 0;
      credit = amount < 0 ? -amount : 0;
    }

    return {
      erpMovementId: m.id,
      date: m.date,
      type: this.mapMovementType(m.documentType),
      description: m.notes || m.documentNo || '',
      debit,
      credit,
      balance: Number(m.balance),
      erpInvoiceNo: m.documentNo ?? undefined,
    };
  }

  private mapMovementType(dt: DocumentType | null): ErpMovementType {
    switch (dt) {
      case DocumentType.INVOICE:
        return 'INVOICE';
      case DocumentType.COLLECTION:
      case DocumentType.PAYMENT:
        return 'PAYMENT';
      case DocumentType.CHECK_PROMISSORY:
        return 'OTHER';
      default:
        return 'OTHER';
    }
  }

  async getWarehouses(): Promise<ErpWarehouse[]> {
    const list = await this.prisma.warehouse.findMany({
      where: { tenantId: this.tenantId, active: true },
      orderBy: { name: 'asc' },
    });
    return list.map((w) => ({
      warehouseId: w.id,
      warehouseName: w.name,
    }));
  }

  async pushOrder(order: B2BOrderExportDto): Promise<{ erpOrderId: string }> {
    const account = await this.prisma.account.findFirst({
      where: {
        id: order.erpAccountId,
        tenantId: this.tenantId,
        deletedAt: null,
      },
    });
    if (!account) {
      throw new NotFoundException(`Account not found: ${order.erpAccountId}`);
    }

    const productIds = order.items.map((i) => i.erpProductId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId: this.tenantId },
    });
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found for tenant');
    }

    let totalAmount = new Prisma.Decimal(0);
    let vatAmount = new Prisma.Decimal(0);

    const itemsWithCalculations = order.items.map((item) => {
      const product = products.find((p) => p.id === item.erpProductId)!;
      const lineTotal = new Prisma.Decimal(item.quantity).mul(item.unitPrice);
      const lineVat = lineTotal.mul(product.vatRate).div(100);
      totalAmount = totalAmount.add(lineTotal);
      vatAmount = vatAmount.add(lineVat);
      return {
        productId: item.erpProductId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        vatRate: product.vatRate,
        vatAmount: lineVat,
        totalAmount: lineTotal.add(lineVat),
      };
    });

    const discount = new Prisma.Decimal(0);
    const grandTotal = totalAmount.add(vatAmount).sub(discount);

    const created = await this.prisma.$transaction(async (tx) => {
      return tx.salesOrder.create({
        data: {
          orderNo: order.orderNumber,
          type: OrderType.SALE,
          date: new Date(),
          accountId: order.erpAccountId,
          tenantId: this.tenantId,
          totalAmount,
          vatAmount,
          grandTotal,
          discount,
          notes: order.note ?? null,
          status: SalesOrderStatus.PENDING,
          items: { create: itemsWithCalculations },
        },
      });
    });

    this.logger.log(
      `pushOrder tenant=${this.tenantId} erpOrderId=${created.id} orderNo=${order.orderNumber}`,
    );
    return { erpOrderId: created.id };
  }

  async getAccountRisk(erpAccountId: string): Promise<ErpAccountRisk> {
    const account = await this.prisma.account.findFirst({
      where: {
        id: erpAccountId,
        tenantId: this.tenantId,
        deletedAt: null,
      },
    });

    if (!account) {
      return {
        creditLimit: 0,
        currentBalance: 0,
        isOverCreditLimit: false,
        hasOverdueInvoices: false,
      };
    }

    const creditLimit = account.creditLimit
      ? Number(account.creditLimit)
      : 0;
    const currentBalance = Number(account.balance);

    const isOverCreditLimit =
      creditLimit > 0 ? currentBalance > creditLimit : false;

    // Gecikmiş fatura tespiti: sonraki fazda reconciliation / vade ile genişletilecek
    const hasOverdueInvoices = false;

    return {
      creditLimit,
      currentBalance,
      isOverCreditLimit,
      hasOverdueInvoices,
    };
  }

  async testConnection(_config?: any): Promise<{
    success: boolean;
    message: string;
    details?: string;
  }> {
    try {
      // Simple query to test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        message: 'OtoMuhasebe ERP bağlantısı başarılı.',
        details: 'Veritabanı erişilebilir durumda.',
      };
    } catch (error) {
      this.logger.error(`Connection test failed: ${error}`);
      return {
        success: false,
        message: 'Bağlantı başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }
}
