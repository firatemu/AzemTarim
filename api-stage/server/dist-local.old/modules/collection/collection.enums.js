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
    get CollectionType () {
        return CollectionType;
    },
    get PaymentMethod () {
        return PaymentMethod;
    }
});
var CollectionType = /*#__PURE__*/ function(CollectionType) {
    CollectionType["COLLECTION"] = "COLLECTION";
    CollectionType["PAYMENT"] = "PAYMENT";
    return CollectionType;
}({});
var PaymentMethod = /*#__PURE__*/ function(PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["PROMISSORY_NOTE"] = "PROMISSORY_NOTE";
    PaymentMethod["GIFT_CARD"] = "GIFT_CARD";
    PaymentMethod["LOAN_ACCOUNT"] = "LOAN_ACCOUNT";
    return PaymentMethod;
}({});

//# sourceMappingURL=collection.enums.js.map