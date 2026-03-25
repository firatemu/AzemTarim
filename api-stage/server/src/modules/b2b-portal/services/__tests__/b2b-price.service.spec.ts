import { B2BDiscountType, Prisma } from '@prisma/client';
import { B2bPriceService } from '../b2b-price.service';

describe('B2bPriceService', () => {
  let service: B2bPriceService;
  let mockPrisma: {
    b2BProduct: { findFirst: jest.Mock };
    b2BCustomer: { findFirst: jest.Mock };
    b2BDiscount: { findMany: jest.Mock };
  };

  beforeEach(() => {
    mockPrisma = {
      b2BProduct: { findFirst: jest.fn() },
      b2BCustomer: { findFirst: jest.fn() },
      b2BDiscount: { findMany: jest.fn() },
    };
    service = new B2bPriceService(mockPrisma as any);
  });

  it('no discounts: final equals list', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: null,
      category: null,
      erpListPrice: new Prisma.Decimal(250),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.listUnit.toString()).toBe('250');
    expect(r.customerClassDiscountUnit.toString()).toBe('0');
    expect(r.campaignDiscountUnit.toString()).toBe('0');
    expect(r.finalUnit.toString()).toBe('250');
  });

  it('class discount only: list 100, class 5% -> final 95', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'Acme',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: 'cl1',
      customerClass: { discountRate: new Prisma.Decimal(5) },
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');

    expect(r.listUnit.toString()).toBe('100');
    expect(r.customerClassDiscountUnit.toString()).toBe('5');
    expect(r.campaignDiscountUnit.toString()).toBe('0');
    expect(r.finalUnit.toString()).toBe('95');
  });

  it('brand campaign 10% on list 100 (no class) -> final 90', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'Acme',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.BRAND,
        targetValue: 'Acme',
        discountRate: new Prisma.Decimal(10),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');

    expect(r.customerClassDiscountUnit.toString()).toBe('0');
    expect(r.campaignDiscountUnit.toString()).toBe('10');
    expect(r.finalUnit.toString()).toBe('90');
  });

  it('wrong brand: no campaign discount', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'Acme',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.BRAND,
        targetValue: 'OtherBrand',
        discountRate: new Prisma.Decimal(20),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.campaignDiscountUnit.toString()).toBe('0');
    expect(r.finalUnit.toString()).toBe('100');
  });

  it('category campaign applies when category matches', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: null,
      category: 'Fren',
      erpListPrice: new Prisma.Decimal(200),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.CATEGORY,
        targetValue: 'Fren',
        discountRate: new Prisma.Decimal(15),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.campaignDiscountUnit.toString()).toBe('30');
    expect(r.finalUnit.toString()).toBe('170');
  });

  it('PRODUCT_LIST: picks highest rate among matching ids', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p2',
      stockCode: 'Y',
      name: 'Urun2',
      brand: null,
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.PRODUCT_LIST,
        targetValue: ' p1 , p2 ',
        discountRate: new Prisma.Decimal(5),
      },
      {
        type: B2BDiscountType.PRODUCT_LIST,
        targetValue: 'p2,p3',
        discountRate: new Prisma.Decimal(12),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p2');
    expect(r.campaignDiscountUnit.toString()).toBe('12');
    expect(r.finalUnit.toString()).toBe('88');
  });

  it('stacked: class 5% then campaign 10% on reduced (100 -> 95 -> 85.5)', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'Bosch',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: 'cl1',
      customerClass: { discountRate: new Prisma.Decimal(5) },
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.BRAND,
        targetValue: 'Bosch',
        discountRate: new Prisma.Decimal(10),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.customerClassDiscountUnit.toString()).toBe('5');
    expect(r.campaignDiscountUnit.toString()).toBe('9.5');
    expect(r.finalUnit.toString()).toBe('85.5');
  });

  it('final unit does not go below zero', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'X',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: 'cl1',
      customerClass: { discountRate: new Prisma.Decimal(50) },
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([
      {
        type: B2BDiscountType.BRAND,
        targetValue: 'X',
        discountRate: new Prisma.Decimal(100),
      },
    ]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.finalUnit.toString()).toBe('0');
  });

  it('discount findMany uses referenceDate for active window', async () => {
    const ref = new Date('2025-06-15T10:00:00.000Z');
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: null,
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);

    await service.getUnitPriceBreakdown('t1', 'c1', 'p1', ref);

    expect(mockPrisma.b2BDiscount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 't1',
          isActive: true,
          AND: [
            {
              OR: [{ startsAt: null }, { startsAt: { lte: ref } }],
            },
            {
              OR: [{ endsAt: null }, { endsAt: { gte: ref } }],
            },
          ],
        }),
      }),
    );
  });

  it('expired/future campaigns not returned by DB → not applied', async () => {
    mockPrisma.b2BProduct.findFirst.mockResolvedValue({
      id: 'p1',
      stockCode: 'X',
      name: 'Urun',
      brand: 'Acme',
      category: null,
      erpListPrice: new Prisma.Decimal(100),
      minOrderQuantity: 1,
    });
    mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
      id: 'c1',
      customerClassId: null,
      customerClass: null,
    });
    mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);

    const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
    expect(r.campaignDiscountUnit.toString()).toBe('0');
    expect(r.finalUnit.toString()).toBe('100');
  });
});
