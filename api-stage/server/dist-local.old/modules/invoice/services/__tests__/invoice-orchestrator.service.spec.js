"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _invoiceorchestratorservice = require("../invoice-orchestrator.service");
const _client = require("@prisma/client");
const _invoiceenums = require("../../invoice.enums");
describe('InvoiceOrchestratorService', ()=>{
    let service;
    let mockPrisma;
    let mockStockEffect;
    let mockAccountEffect;
    let mockQueue;
    beforeEach(()=>{
        mockPrisma = {
            invoice: {
                findUnique: jest.fn(),
                update: jest.fn()
            },
            invoiceLog: {
                create: jest.fn()
            },
            $transaction: jest.fn().mockImplementation((cb)=>cb(mockPrisma))
        };
        mockStockEffect = {
            applyStockEffects: jest.fn(),
            reverseStockEffects: jest.fn()
        };
        mockAccountEffect = {
            applyAccountEffect: jest.fn(),
            reverseAccountEffect: jest.fn()
        };
        mockQueue = {
            add: jest.fn()
        };
        service = new _invoiceorchestratorservice.InvoiceOrchestratorService(mockPrisma, mockStockEffect, mockAccountEffect, mockQueue);
    });
    describe('approveInvoice', ()=>{
        it('should call stock and account effects and update status to APPROVED', async ()=>{
            const mockInvoice = {
                id: 'inv-1',
                status: _client.InvoiceStatus.OPEN,
                tenantId: 't1',
                items: [],
                invoiceType: _invoiceenums.InvoiceType.SALE
            };
            mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice);
            await service.approveInvoice('inv-1', {
                invoiceId: 'inv-1',
                tenantId: 't1',
                userId: 'u1',
                operationType: 'APPROVE'
            });
            expect(mockStockEffect.applyStockEffects).toHaveBeenCalled();
            expect(mockAccountEffect.applyAccountEffect).toHaveBeenCalled();
            expect(mockQueue.add).toHaveBeenCalledWith('COSTING_RECALCULATE', expect.any(Object), expect.any(Object));
        });
    });
});

//# sourceMappingURL=invoice-orchestrator.service.spec.js.map