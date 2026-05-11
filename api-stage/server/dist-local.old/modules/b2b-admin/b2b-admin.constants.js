"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2B_ORDER_STATUS_TRANSITIONS", {
    enumerable: true,
    get: function() {
        return B2B_ORDER_STATUS_TRANSITIONS;
    }
});
const _client = require("@prisma/client");
const B2B_ORDER_STATUS_TRANSITIONS = {
    [_client.B2BOrderStatus.PENDING]: [
        _client.B2BOrderStatus.APPROVED,
        _client.B2BOrderStatus.REJECTED,
        _client.B2BOrderStatus.CANCELLED
    ],
    [_client.B2BOrderStatus.APPROVED]: [
        _client.B2BOrderStatus.EXPORTED_TO_ERP,
        _client.B2BOrderStatus.CANCELLED
    ],
    [_client.B2BOrderStatus.REJECTED]: [],
    [_client.B2BOrderStatus.EXPORTED_TO_ERP]: [
        _client.B2BOrderStatus.CANCELLED
    ],
    [_client.B2BOrderStatus.CANCELLED]: []
};

//# sourceMappingURL=b2b-admin.constants.js.map