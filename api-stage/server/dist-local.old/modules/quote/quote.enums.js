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
    get QuoteStatus () {
        return QuoteStatus;
    },
    get QuoteType () {
        return QuoteType;
    }
});
var QuoteType = /*#__PURE__*/ function(QuoteType) {
    QuoteType["SALE"] = "SALE";
    QuoteType["PURCHASE"] = "PURCHASE";
    return QuoteType;
}({});
var QuoteStatus = /*#__PURE__*/ function(QuoteStatus) {
    QuoteStatus["OFFERED"] = "OFFERED";
    QuoteStatus["APPROVED"] = "APPROVED";
    QuoteStatus["REJECTED"] = "REJECTED";
    QuoteStatus["CONVERTED_TO_ORDER"] = "CONVERTED_TO_ORDER";
    return QuoteStatus;
}({});

//# sourceMappingURL=quote.enums.js.map