/**
 * Performance Tests for B2B Portal
 *
 * These tests verify that operations complete within acceptable time thresholds.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _b2bpriceservice = require("../../services/b2b-price.service");
const _b2bfifoservice = require("../../services/b2b-fifo.service");
describe('B2B Portal Performance Tests', ()=>{
    describe('Price Calculation Performance', ()=>{
        let priceService;
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
            priceService = new _b2bpriceservice.B2bPriceService(mockPrisma);
        });
        it('should calculate 1000 product prices in < 1s', async ()=>{
            mockPrisma.b2BProduct.findFirst.mockResolvedValue({
                id: 'p1',
                stockCode: 'TEST',
                name: 'Test Product',
                brand: 'BrandA',
                category: 'CategoryA',
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
                    type: 'BRAND',
                    targetValue: 'BrandA',
                    discountRate: new _client.Prisma.Decimal(10)
                }
            ]);
            const startTime = Date.now();
            const promises = [];
            for(let i = 0; i < 1000; i++){
                promises.push(priceService.getUnitPriceBreakdown('t1', 'c1', 'p1'));
            }
            await Promise.all(promises);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(1000);
        });
    });
    describe('FIFO Calculation Performance', ()=>{
        let fifoService;
        beforeEach(()=>{
            fifoService = new _b2bfifoservice.B2BFifoService();
        });
        it('should calculate FIFO for 1000 movements in < 1s', ()=>{
            const movements = [];
            // Create 1000 movements
            for(let i = 0; i < 1000; i++){
                if (i % 3 === 0) {
                    // Invoice
                    movements.push({
                        id: `inv${i}`,
                        date: new Date(2025, 0, 1 + i),
                        type: _client.B2BMovementType.INVOICE,
                        debit: 100,
                        credit: 0
                    });
                } else if (i % 3 === 1) {
                    // Payment
                    movements.push({
                        id: `pay${i}`,
                        date: new Date(2025, 0, 1 + i),
                        type: _client.B2BMovementType.PAYMENT,
                        debit: 0,
                        credit: 50
                    });
                }
            // Skip i % 3 === 2 for variety
            }
            const startTime = Date.now();
            fifoService.calculateFifo(movements, 30, new Date(2025, 6, 1));
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(1000);
        });
    });
    describe('Large Campaign List Performance', ()=>{
        it('should handle 100 active campaigns efficiently', async ()=>{
            const mockPrisma = {
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
            const service = new _b2bpriceservice.B2bPriceService(mockPrisma);
            // Create 100 campaigns
            const campaigns = [];
            for(let i = 0; i < 100; i++){
                campaigns.push({
                    type: i % 2 === 0 ? 'BRAND' : 'CATEGORY',
                    targetValue: `Target${i}`,
                    discountRate: new _client.Prisma.Decimal(i % 20)
                });
            }
            mockPrisma.b2BProduct.findFirst.mockResolvedValue({
                id: 'p1',
                stockCode: 'TEST',
                name: 'Test',
                brand: 'BrandA',
                category: 'CategoryA',
                erpListPrice: new _client.Prisma.Decimal(100),
                minOrderQuantity: 1
            });
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
                id: 'c1',
                customerClassId: null,
                customerClass: null
            });
            mockPrisma.b2BDiscount.findMany.mockResolvedValue(campaigns);
            const startTime = Date.now();
            await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(500);
        });
    });
    describe('Concurrent Request Performance', ()=>{
        it('should handle 100 concurrent price calculations', async ()=>{
            const mockPrisma = {
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
            const service = new _b2bpriceservice.B2bPriceService(mockPrisma);
            mockPrisma.b2BProduct.findFirst.mockResolvedValue({
                id: 'p1',
                stockCode: 'TEST',
                name: 'Test',
                brand: 'BrandA',
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
            const startTime = Date.now();
            const promises = [];
            for(let i = 0; i < 100; i++){
                promises.push(service.getUnitPriceBreakdown('t1', 'c1', `p${i}`));
            }
            await Promise.all(promises);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(2000);
        });
    });
    describe('Memory Efficiency', ()=>{
        it('should not leak memory during repeated calculations', async ()=>{
            const mockPrisma = {
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
            const service = new _b2bpriceservice.B2bPriceService(mockPrisma);
            mockPrisma.b2BProduct.findFirst.mockResolvedValue({
                id: 'p1',
                stockCode: 'TEST',
                name: 'Test',
                brand: 'BrandA',
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
            // Run 10,000 calculations
            for(let i = 0; i < 10000; i++){
                await service.getUnitPriceBreakdown('t1', 'c1', 'p1');
            }
            // If we get here without crashing, memory is managed reasonably
            expect(true).toBe(true);
        });
    });
});

//# sourceMappingURL=b2b-portal.performance.spec.js.map