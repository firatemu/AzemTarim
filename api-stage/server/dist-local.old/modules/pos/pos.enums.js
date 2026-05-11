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
    get PosInvoiceType () {
        return PosInvoiceType;
    },
    get PosSessionStatus () {
        return PosSessionStatus;
    }
});
var PosInvoiceType = /*#__PURE__*/ function(PosInvoiceType) {
    PosInvoiceType["SALE"] = "SALE";
    PosInvoiceType["RETURN"] = "RETURN";
    return PosInvoiceType;
}({});
var PosSessionStatus = /*#__PURE__*/ function(PosSessionStatus) {
    PosSessionStatus["OPEN"] = "OPEN";
    PosSessionStatus["CLOSED"] = "CLOSED";
    return PosSessionStatus;
}({});

//# sourceMappingURL=pos.enums.js.map