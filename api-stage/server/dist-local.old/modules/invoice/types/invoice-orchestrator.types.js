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
    get AccountMovementDirection () {
        return AccountMovementDirection;
    },
    get InvoiceOperationType () {
        return InvoiceOperationType;
    },
    get StockMovementDirection () {
        return StockMovementDirection;
    }
});
var InvoiceOperationType = /*#__PURE__*/ function(InvoiceOperationType) {
    InvoiceOperationType["CREATE"] = "CREATE";
    InvoiceOperationType["UPDATE"] = "UPDATE";
    InvoiceOperationType["APPROVE"] = "APPROVE";
    InvoiceOperationType["CANCEL"] = "CANCEL";
    return InvoiceOperationType;
}({});
var StockMovementDirection = /*#__PURE__*/ function(StockMovementDirection) {
    StockMovementDirection["IN"] = "IN";
    StockMovementDirection["OUT"] = "OUT";
    return StockMovementDirection;
}({});
var AccountMovementDirection = /*#__PURE__*/ function(AccountMovementDirection) {
    AccountMovementDirection["DEBIT"] = "DEBIT";
    AccountMovementDirection["CREDIT"] = "CREDIT";
    return AccountMovementDirection;
}({});

//# sourceMappingURL=invoice-orchestrator.types.js.map