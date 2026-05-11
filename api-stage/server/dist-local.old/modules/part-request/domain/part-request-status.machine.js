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
    get PART_REQUEST_VALID_TRANSITIONS () {
        return PART_REQUEST_VALID_TRANSITIONS;
    },
    get canTransitionPartRequestStatus () {
        return canTransitionPartRequestStatus;
    },
    get validatePartRequestStatusTransition () {
        return validatePartRequestStatusTransition;
    }
});
const PART_REQUEST_VALID_TRANSITIONS = {
    REQUESTED: [
        'SUPPLIED',
        'CANCELLED'
    ],
    SUPPLIED: [
        'USED'
    ],
    USED: [],
    CANCELLED: []
};
function canTransitionPartRequestStatus(currentStatus, newStatus) {
    const allowed = PART_REQUEST_VALID_TRANSITIONS[currentStatus];
    return Boolean(allowed?.includes(newStatus));
}
function validatePartRequestStatusTransition(currentStatus, newStatus) {
    if (!canTransitionPartRequestStatus(currentStatus, newStatus)) {
        throw new Error(`Geçersiz parça talebi status geçişi: ${currentStatus} -> ${newStatus}`);
    }
}

//# sourceMappingURL=part-request-status.machine.js.map