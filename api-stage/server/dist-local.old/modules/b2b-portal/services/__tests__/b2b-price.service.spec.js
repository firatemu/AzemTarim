"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _b2bpriceservice = require("../b2b-price.service");
describe('B2bPriceService', ()=>{
    let service;
    let mockPrisma;
    beforeEach(()=>{
        mockPrisma = {
            b2BProduct: {
                findFirst: jest.fn()
            },
            b2BCustomer: {
                findFirst: jest.fn()
            },
            b2BDiscount: {
                findMany: jest.fn()
            }
        };
        service = new _b2bpriceservice.B2bPriceService(mockPrisma);
    });
    it('no discounts: final equals list', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: null,
            category: null,
            erpListPrice: new _client.Prisma.Decimal(250),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.listUnit.toString()).toBe('250');
        expect(r.customerClassDiscountUnit.toString()).toBe('0');
        expect(r.campaignDiscountUnit.toString()).toBe('0');
        expect(r.finalUnit.toString()).toBe('250');
    });
    it('class discount only: list 100, class 5% -> final 95', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'Acme',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: 'cl1',
            customerClass: {
                discountRate: new _client.Prisma.Decimal(5)
            }
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.listUnit.toString()).toBe('100');
        expect(r.customerClassDiscountUnit.toString()).toBe('5');
        expect(r.campaignDiscountUnit.toString()).toBe('0');
        expect(r.finalUnit.toString()).toBe('95');
    });
    it('brand campaign 10% on list 100 (no class) -> final 90', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'Acme',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.BRAND,
                targetValue: 'Acme',
                discountRate: new _client.Prisma.Decimal(10)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.customerClassDiscountUnit.toString()).toBe('0');
        expect(r.campaignDiscountUnit.toString()).toBe('10');
        expect(r.finalUnit.toString()).toBe('90');
    });
    it('wrong brand: no campaign discount', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'Acme',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.BRAND,
                targetValue: 'OtherBrand',
                discountRate: new _client.Prisma.Decimal(20)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.campaignDiscountUnit.toString()).toBe('0');
        expect(r.finalUnit.toString()).toBe('100');
    });
    it('category campaign applies when category matches', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: null,
            category: 'Fren',
            erpListPrice: new _client.Prisma.Decimal(200),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.CATEGORY,
                targetValue: 'Fren',
                discountRate: new _client.Prisma.Decimal(15)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.campaignDiscountUnit.toString()).toBe('30');
        expect(r.finalUnit.toString()).toBe('170');
    });
    it('PRODUCT_LIST: picks highest rate among matching ids', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p2',
            stockCode: 'Y',
            name: 'Urun2',
            brand: null,
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.PRODUCT_LIST,
                targetValue: ' p1 , p2 ',
                discountRate: new _client.Prisma.Decimal(5)
            },
            {
                type: _client.B2BDiscountType.PRODUCT_LIST,
                targetValue: 'p2,p3',
                discountRate: new _client.Prisma.Decimal(12)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p2');
        expect(r.campaignDiscountUnit.toString()).toBe('12');
        expect(r.finalUnit.toString()).toBe('88');
    });
    it('stacked: class 5% then campaign 10% on reduced (100 -> 95 -> 85.5)', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'Bosch',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: 'cl1',
            customerClass: {
                discountRate: new _client.Prisma.Decimal(5)
            }
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.BRAND,
                targetValue: 'Bosch',
                discountRate: new _client.Prisma.Decimal(10)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.customerClassDiscountUnit.toString()).toBe('5');
        expect(r.campaignDiscountUnit.toString()).toBe('9.5');
        expect(r.finalUnit.toString()).toBe('85.5');
    });
    it('final unit does not go below zero', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'X',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: 'cl1',
            customerClass: {
                discountRate: new _client.Prisma.Decimal(50)
            }
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([
            {
                type: _client.B2BDiscountType.BRAND,
                targetValue: 'X',
                discountRate: new _client.Prisma.Decimal(100)
            }
        ]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.finalUnit.toString()).toBe('0');
    });
    it('discount findMany uses referenceDate for active window', async ()=>{
        const ref = new Date('2025-06-15T10:00:00.000Z');
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: null,
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);
        await service.getUnitPriceBreakdown('t1', 'c1', 'p1', ref);
        expect(mockPrisma.b2BDiscount.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                tenantId: 't1',
                isActive: true,
                AND: [
                    {
                        OR: [
                            {
                                startsAt: null
                            },
                            {
                                startsAt: {
                                    lte: ref
                                }
                            }
                        ]
                    },
                    {
                        OR: [
                            {
                                endsAt: null
                            },
                            {
                                endsAt: {
                                    gte: ref
                                }
                            }
                        ]
                    }
                ]
            })
        }));
    });
    it('expired/future campaigns not returned by DB → not applied', async ()=>{
        mockPrisma.b2BProduct.findFirst.mockResolvedValue({
            id: 'p1',
            stockCode: 'X',
            name: 'Urun',
            brand: 'Acme',
            category: null,
            erpListPrice: new _client.Prisma.Decimal(100),
            minOrderQuantity: 1
        });
        mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
            id: 'c1',
            customerClassId: null,
            customerClass: null
        });
        mockPrisma.b2BDiscount.findMany.mockResolvedValue([]);
        const r = await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
        expect(r.campaignDiscountUnit.toString()).toBe('0');
        expect(r.finalUnit.toString()).toBe('100');
    });
});

//# sourceMappingURL=b2b-price.service.spec.js.map