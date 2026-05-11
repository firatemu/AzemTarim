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
    get WORK_ORDER_VALID_TRANSITIONS () {
        return WORK_ORDER_VALID_TRANSITIONS;
    },
    get canTransitionWorkOrderStatus () {
        return canTransitionWorkOrderStatus;
    },
    get validateWorkOrderStatusTransition () {
        return validateWorkOrderStatusTransition;
    }
});
const _workorderenums = require("../work-order.enums");
const WORK_ORDER_VALID_TRANSITIONS = {
    [_workorderenums.WorkOrderStatus.WAITING_DIAGNOSIS]: [
        _workorderenums.WorkOrderStatus.PENDING_APPROVAL,
        _workorderenums.WorkOrderStatus.APPROVED_IN_PROGRESS,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.PENDING_APPROVAL]: [
        _workorderenums.WorkOrderStatus.APPROVED_IN_PROGRESS,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.APPROVED_IN_PROGRESS]: [
        _workorderenums.WorkOrderStatus.PART_WAITING,
        _workorderenums.WorkOrderStatus.VEHICLE_READY,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.PART_WAITING]: [
        _workorderenums.WorkOrderStatus.PARTS_SUPPLIED,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.PARTS_SUPPLIED]: [
        _workorderenums.WorkOrderStatus.VEHICLE_READY,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.VEHICLE_READY]: [
        _workorderenums.WorkOrderStatus.INVOICED_CLOSED,
        _workorderenums.WorkOrderStatus.CLOSED_WITHOUT_INVOICE,
        _workorderenums.WorkOrderStatus.CANCELLED
    ],
    [_workorderenums.WorkOrderStatus.INVOICED_CLOSED]: [],
    [_workorderenums.WorkOrderStatus.CLOSED_WITHOUT_INVOICE]: [],
    [_workorderenums.WorkOrderStatus.CANCELLED]: []
};
function canTransitionWorkOrderStatus(currentStatus, newStatus) {
    const allowed = WORK_ORDER_VALID_TRANSITIONS[currentStatus];
    return Boolean(allowed?.includes(newStatus));
}
function validateWorkOrderStatusTransition(currentStatus, newStatus) {
    if (!canTransitionWorkOrderStatus(currentStatus, newStatus)) {
        throw new Error(`Geçersiz status geçişi: ${currentStatus} -> ${newStatus}`);
    }
}

//# sourceMappingURL=work-order-status.machine.js.map