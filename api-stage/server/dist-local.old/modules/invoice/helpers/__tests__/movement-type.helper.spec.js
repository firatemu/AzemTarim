"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _invoiceenums = require("../../invoice.enums");
const _movementtypehelper = require("../movement-type.helper");
const _invoiceorchestratortypes = require("../../types/invoice-orchestrator.types");
describe('MovementTypeHelper', ()=>{
    describe('resolveStockMovementType', ()=>{
        it('should return SALE for SALE APPROVE', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.SALE, 'APPROVE')).toBe(_client.MovementType.SALE);
        });
        it('should return null for SALE CANCEL (Business Rule)', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.SALE, 'CANCEL')).toBeNull();
        });
        it('should return RETURN for SALES_RETURN APPROVE', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.SALES_RETURN, 'APPROVE')).toBe(_client.MovementType.RETURN);
        });
        it('should return CANCELLATION_EXIT for SALES_RETURN CANCEL', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.SALES_RETURN, 'CANCEL')).toBe(_client.MovementType.CANCELLATION_EXIT);
        });
        it('should return ENTRY for PURCHASE APPROVE', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.PURCHASE, 'APPROVE')).toBe(_client.MovementType.ENTRY);
        });
        it('should return EXIT for PURCHASE_RETURN APPROVE', ()=>{
            expect((0, _movementtypehelper.resolveStockMovementType)(_invoiceenums.InvoiceType.PURCHASE_RETURN, 'APPROVE')).toBe(_client.MovementType.EXIT);
        });
    });
    describe('resolveAccountMovementDirection', ()=>{
        it('should return DEBIT/increment for SALE APPROVE', ()=>{
            const result = (0, _movementtypehelper.resolveAccountMovementDirection)(_invoiceenums.InvoiceType.SALE, 'APPROVE');
            expect(result.direction).toBe(_invoiceorchestratortypes.AccountMovementDirection.DEBIT);
            expect(result.balanceOp).toBe('increment');
        });
        it('should return CREDIT/decrement for PURCHASE APPROVE', ()=>{
            const result = (0, _movementtypehelper.resolveAccountMovementDirection)(_invoiceenums.InvoiceType.PURCHASE, 'APPROVE');
            expect(result.direction).toBe(_invoiceorchestratortypes.AccountMovementDirection.CREDIT);
            expect(result.balanceOp).toBe('decrement');
        });
        it('should return CREDIT/decrement for SALE CANCEL', ()=>{
            const result = (0, _movementtypehelper.resolveAccountMovementDirection)(_invoiceenums.InvoiceType.SALE, 'CANCEL');
            expect(result.direction).toBe(_invoiceorchestratortypes.AccountMovementDirection.CREDIT);
            expect(result.balanceOp).toBe('decrement');
        });
        it('should return DEBIT/increment for SALES_RETURN CANCEL', ()=>{
            const result = (0, _movementtypehelper.resolveAccountMovementDirection)(_invoiceenums.InvoiceType.SALES_RETURN, 'CANCEL');
            expect(result.direction).toBe(_invoiceorchestratortypes.AccountMovementDirection.DEBIT);
            expect(result.balanceOp).toBe('increment');
        });
    });
});

//# sourceMappingURL=movement-type.helper.spec.js.map