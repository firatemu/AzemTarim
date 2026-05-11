"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _reconciliationservice = require("../reconciliation.service");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
describe('ReconciliationService', ()=>{
    let service;
    let mockPrisma;
    beforeEach(()=>{
        mockPrisma = {
            invoice: {
                findUnique: jest.fn(),
                findMany: jest.fn()
            },
            productMovement: {
                findMany: jest.fn()
            },
            reconciliationLog: {
                create: jest.fn()
            }
        };
        service = new _reconciliationservice.ReconciliationService(mockPrisma);
    });
    describe('verifyInvoiceConsistency', ()=>{
        it('should return consistent: true when amounts and quantities match', async ()=>{
            const mockInvoice = {
                id: 'inv-1',
                status: _client.InvoiceStatus.APPROVED,
                grandTotal: new _library.Decimal(100),
                items: [
                    {
                        id: 'item-1',
                        productId: 'p1',
                        quantity: 10
                    }
                ],
                accountMovements: [
                    {
                        amount: new _library.Decimal(100),
                        isReversed: false
                    }
                ]
            };
            mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice);
            mockPrisma.productMovement.findMany.mockResolvedValue([
                {
                    quantity: -10
                }
            ]); // Sale direction is negative in DB
            const result = await service.verifyInvoiceConsistency('inv-1', 't1');
            expect(result.isConsistent).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should return consistent: false when cari total is mismatch', async ()=>{
            const mockInvoice = {
                id: 'inv-1',
                status: _client.InvoiceStatus.APPROVED,
                grandTotal: new _library.Decimal(100),
                items: [],
                accountMovements: [
                    {
                        amount: new _library.Decimal(90),
                        isReversed: false
                    }
                ]
            };
            mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice);
            const result = await service.verifyInvoiceConsistency('inv-1', 't1');
            expect(result.isConsistent).toBe(false);
            expect(result.errors.some((e)=>typeof e === 'string' && e.includes('Cari tutar tutarsız'))).toBe(true);
        });
    });
});

//# sourceMappingURL=reconciliation.service.spec.js.map