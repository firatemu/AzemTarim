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
    get OrderType () {
        return OrderType;
    },
    get SalesOrderStatus () {
        return SalesOrderStatus;
    }
});
var OrderType = /*#__PURE__*/ function(OrderType) {
    OrderType["SALE"] = "SALE";
    OrderType["PURCHASE"] = "PURCHASE";
    return OrderType;
}({});
var SalesOrderStatus = /*#__PURE__*/ function(SalesOrderStatus) {
    SalesOrderStatus["PENDING"] = "PENDING";
    SalesOrderStatus["PREPARING"] = "PREPARING";
    SalesOrderStatus["PREPARED"] = "PREPARED";
    SalesOrderStatus["SHIPPED"] = "SHIPPED";
    SalesOrderStatus["COMPLETED"] = "COMPLETED";
    SalesOrderStatus["PARTIALLY_SHIPPED"] = "PARTIALLY_SHIPPED";
    SalesOrderStatus["INVOICED"] = "INVOICED";
    SalesOrderStatus["CANCELLED"] = "CANCELLED";
    return SalesOrderStatus;
}({});

//# sourceMappingURL=order.enums.js.map