"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get resolveAccountMovementDirection () {
        return resolveAccountMovementDirection;
    },
    get resolveStockMovementType () {
        return resolveStockMovementType;
    }
});
const _client = require("@prisma/client");
const _invoiceenums = require("../invoice.enums");
const _invoiceorchestratortypes = require("../types/invoice-orchestrator.types");
function resolveStockMovementType(invoiceType, operationType) {
    if (operationType === 'APPROVE') {
        switch(invoiceType){
            case _invoiceenums.InvoiceType.SALE:
                return _client.MovementType.SALE;
            case _invoiceenums.InvoiceType.PURCHASE:
                return _client.MovementType.ENTRY;
            case _invoiceenums.InvoiceType.SALES_RETURN:
                return _client.MovementType.RETURN;
            case _invoiceenums.InvoiceType.PURCHASE_RETURN:
                return _client.MovementType.EXIT;
            default:
                throw new Error(`Unknown invoice type: ${invoiceType}`);
        }
    }
    if (operationType === 'CANCEL') {
        switch(invoiceType){
            case _invoiceenums.InvoiceType.SALE:
            case _invoiceenums.InvoiceType.PURCHASE:
                // SATIS ve ALIS fatura iptallerinde stok kaydı oluşmaz (iş kuralı).
                return null;
            case _invoiceenums.InvoiceType.SALES_RETURN:
                // SATIS_IADE iptali stoktan çıkış (iptal çıkışı) gerektirir.
                return _client.MovementType.CANCELLATION_EXIT;
            case _invoiceenums.InvoiceType.PURCHASE_RETURN:
                // ALIS_IADE iptali stoka giriş (iptal girişi) gerektirir.
                return _client.MovementType.CANCELLATION_ENTRY;
            default:
                throw new Error(`Unknown invoice type: ${invoiceType}`);
        }
    }
    throw new Error(`Unknown operation type: ${operationType}`);
}
function resolveAccountMovementDirection(invoiceType, operationType) {
    if (operationType === 'APPROVE') {
        switch(invoiceType){
            case _invoiceenums.InvoiceType.SALE:
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.DEBIT,
                    balanceOp: 'increment'
                };
            case _invoiceenums.InvoiceType.PURCHASE:
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.CREDIT,
                    balanceOp: 'decrement'
                };
            case _invoiceenums.InvoiceType.SALES_RETURN:
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.CREDIT,
                    balanceOp: 'decrement'
                };
            case _invoiceenums.InvoiceType.PURCHASE_RETURN:
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.DEBIT,
                    balanceOp: 'increment'
                };
            default:
                throw new Error(`Unknown invoice type: ${invoiceType}`);
        }
    }
    if (operationType === 'CANCEL') {
        switch(invoiceType){
            case _invoiceenums.InvoiceType.SALE:
                // Satış iptali -> Borcu azalt (Alacak yaz)
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.CREDIT,
                    balanceOp: 'decrement'
                };
            case _invoiceenums.InvoiceType.PURCHASE:
                // Alış iptali -> Borcu arttır (Borç yaz) veya ödemeyi azalt
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.DEBIT,
                    balanceOp: 'increment'
                };
            case _invoiceenums.InvoiceType.SALES_RETURN:
                // Satış iade iptali -> Borcu arttır (Borç yaz)
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.DEBIT,
                    balanceOp: 'increment'
                };
            case _invoiceenums.InvoiceType.PURCHASE_RETURN:
                // Alış iade iptali -> Alacak yaz (Bakiyeyi azalt)
                return {
                    direction: _invoiceorchestratortypes.AccountMovementDirection.CREDIT,
                    balanceOp: 'decrement'
                };
            default:
                throw new Error(`Unknown invoice type: ${invoiceType}`);
        }
    }
    throw new Error(`Unknown operation type: ${operationType}`);
}

//# sourceMappingURL=movement-type.helper.js.map