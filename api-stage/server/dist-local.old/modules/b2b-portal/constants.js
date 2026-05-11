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
    get B2B_ACTING_CUSTOMER_HEADER () {
        return B2B_ACTING_CUSTOMER_HEADER;
    },
    get B2B_DOMAIN_HEADER () {
        return B2B_DOMAIN_HEADER;
    },
    get B2B_JWT_PAYLOAD () {
        return B2B_JWT_PAYLOAD;
    }
});
const B2B_DOMAIN_HEADER = 'x-b2b-domain';
const B2B_JWT_PAYLOAD = 'b2bJwtPayload';
const B2B_ACTING_CUSTOMER_HEADER = 'x-b2b-acting-customer-id';

//# sourceMappingURL=constants.js.map