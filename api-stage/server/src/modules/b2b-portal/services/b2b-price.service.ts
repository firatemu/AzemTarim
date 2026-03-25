import { Injectable, NotFoundException } from '@nestjs/common';
import { B2BDiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';

export interface B2bUnitPriceBreakdown {
  listUnit: Prisma.Decimal;
  customerClassDiscountUnit: Prisma.Decimal;
  campaignDiscountUnit: Prisma.Decimal;
  finalUnit: Prisma.Decimal;
}

@Injectable()
export class B2bPriceService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadActiveDiscounts(tenantId: string, now: Date) {
    return this.prisma.b2BDiscount.findMany({
      where: {
        tenantId,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    });
  }

  private bestCampaignRate(
    discounts: { type: B2BDiscountType; targetValue: string; discountRate: Prisma.Decimal }[],
    product: {
      id: string;
      brand: string | null;
      category: string | null;
    },
    _customerClassId: string | null,
  ): Prisma.Decimal {
    let best = new Prisma.Decimal(0);
    for (const d of discounts) {
      let ok = false;
      const tv = (d.targetValue || '').trim();
      switch (d.type) {
        // Sınıf iskontosu B2BCustomerClass üzerinden; burada çifte iskonto olmaması için atlanır
        case B2BDiscountType.CUSTOMER_CLASS:
          ok = false;
          break;
        case B2BDiscountType.BRAND:
          ok = !!product.brand && tv === product.brand.trim();
          break;
        case B2BDiscountType.CATEGORY:
          ok = !!product.category && tv === product.category.trim();
          break;
        case B2BDiscountType.PRODUCT_LIST: {
          const ids = tv.split(',').map((s) => s.trim()).filter(Boolean);
          ok = ids.includes(product.id);
          break;
        }
        default:
          ok = false;
      }
      if (ok && d.discountRate.gt(best)) {
        best = d.discountRate;
      }
    }
    return best;
  }

  /**
   * Birim fiyat kırılımı (KDV hariç liste üzerinden iskonto).
   * @param referenceDate Kampanya başlangıç/bitiş filtresi ve testler için (varsayılan: şimdi)
   */
  async getUnitPriceBreakdown(
    tenantId: string,
    customerId: string,
    productId: string,
    referenceDate: Date = new Date(),
  ): Promise<
    B2bUnitPriceBreakdown & {
      product: {
        id: string;
        stockCode: string;
        name: string;
        minOrderQuantity: number;
      };
    }
  > {
    const now = referenceDate;
    const [product, customer, discounts] = await Promise.all([
      this.prisma.b2BProduct.findFirst({
        where: { id: productId, tenantId, isVisibleInB2B: true },
        select: {
          id: true,
          stockCode: true,
          name: true,
          brand: true,
          category: true,
          erpListPrice: true,
          minOrderQuantity: true,
        },
      }),
      this.prisma.b2BCustomer.findFirst({
        where: { id: customerId, tenantId },
        select: { id: true, customerClassId: true, customerClass: { select: { discountRate: true } } },
      }),
      this.loadActiveDiscounts(tenantId, now),
    ]);

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı veya B2B’de görünür değil');
    }
    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const listUnit = new Prisma.Decimal(product.erpListPrice);
    const classRate = customer.customerClass?.discountRate
      ? new Prisma.Decimal(customer.customerClass.discountRate)
      : new Prisma.Decimal(0);
    const classAmt = listUnit.mul(classRate).div(100);

    const afterClassUnit = listUnit.sub(classAmt);

    const campRate = this.bestCampaignRate(
      discounts,
      {
        id: product.id,
        brand: product.brand,
        category: product.category,
      },
      customer.customerClassId,
    );
    /** Kampanya oranı sınıf iskontosu sonrası birim fiyat üzerinden (bileşik iskonto) */
    const campAmt = afterClassUnit.mul(campRate).div(100);

    const rawFinal = afterClassUnit.sub(campAmt);
    const finalUnit = rawFinal.lt(0) ? new Prisma.Decimal(0) : rawFinal;

    return {
      product: {
        id: product.id,
        stockCode: product.stockCode,
        name: product.name,
        minOrderQuantity: product.minOrderQuantity,
      },
      listUnit,
      customerClassDiscountUnit: classAmt,
      campaignDiscountUnit: campAmt,
      finalUnit,
    };
  }
}
