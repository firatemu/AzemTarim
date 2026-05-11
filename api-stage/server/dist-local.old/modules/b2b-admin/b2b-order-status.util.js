"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assertB2bOrderStatusTransition", {
    enumerable: true,
    get: function() {
        return assertB2bOrderStatusTransition;
    }
});
const _common = require("@nestjs/common");
const _b2badminconstants = require("./b2b-admin.constants");
function assertB2bOrderStatusTransition(from, to) {
    const allowed = _b2badminconstants.B2B_ORDER_STATUS_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
        throw new _common.BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
}

//# sourceMappingURL=b2b-order-status.util.js.map