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
    get DeliveryNoteSourceType () {
        return DeliveryNoteSourceType;
    },
    get DeliveryNoteStatus () {
        return DeliveryNoteStatus;
    }
});
var DeliveryNoteSourceType = /*#__PURE__*/ function(DeliveryNoteSourceType) {
    DeliveryNoteSourceType["ORDER"] = "ORDER";
    DeliveryNoteSourceType["DIRECT"] = "DIRECT";
    DeliveryNoteSourceType["INVOICE_AUTOMATIC"] = "INVOICE_AUTOMATIC";
    return DeliveryNoteSourceType;
}({});
var DeliveryNoteStatus = /*#__PURE__*/ function(DeliveryNoteStatus) {
    DeliveryNoteStatus["NOT_INVOICED"] = "NOT_INVOICED";
    DeliveryNoteStatus["INVOICED"] = "INVOICED";
    DeliveryNoteStatus["TESLIM_EDILDI"] = "TESLIM_EDILDI";
    DeliveryNoteStatus["BEKLEMEDE"] = "BEKLEMEDE";
    DeliveryNoteStatus["FATURAYA_BAGLANDI"] = "FATURAYA_BAGLANDI";
    DeliveryNoteStatus["IPTAL"] = "IPTAL";
    return DeliveryNoteStatus;
}({});

//# sourceMappingURL=sales-waybill.enums.js.map