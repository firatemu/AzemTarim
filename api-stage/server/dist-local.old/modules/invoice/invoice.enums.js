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
    get InvoiceStatus () {
        return InvoiceStatus;
    },
    get InvoiceType () {
        return InvoiceType;
    }
});
var InvoiceType = /*#__PURE__*/ function(InvoiceType) {
    InvoiceType["PURCHASE"] = "PURCHASE";
    InvoiceType["SALE"] = "SALE";
    InvoiceType["SALES_RETURN"] = "SALES_RETURN";
    InvoiceType["PURCHASE_RETURN"] = "PURCHASE_RETURN";
    return InvoiceType;
}({});
var InvoiceStatus = /*#__PURE__*/ function(InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["OPEN"] = "OPEN";
    InvoiceStatus["CLOSED"] = "CLOSED";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["APPROVED"] = "APPROVED";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
    return InvoiceStatus;
}({});

//# sourceMappingURL=invoice.enums.js.map