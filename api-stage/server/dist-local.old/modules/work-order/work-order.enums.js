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
    get PartWorkflowStatus () {
        return PartWorkflowStatus;
    },
    get VehicleWorkflowStatus () {
        return VehicleWorkflowStatus;
    },
    get WorkOrderStatus () {
        return WorkOrderStatus;
    }
});
var WorkOrderStatus = /*#__PURE__*/ function(WorkOrderStatus) {
    WorkOrderStatus["WAITING_DIAGNOSIS"] = "WAITING_DIAGNOSIS";
    WorkOrderStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    WorkOrderStatus["APPROVED_IN_PROGRESS"] = "APPROVED_IN_PROGRESS";
    WorkOrderStatus["PART_WAITING"] = "PART_WAITING";
    WorkOrderStatus["PARTS_SUPPLIED"] = "PARTS_SUPPLIED";
    WorkOrderStatus["VEHICLE_READY"] = "VEHICLE_READY";
    WorkOrderStatus["INVOICED_CLOSED"] = "INVOICED_CLOSED";
    WorkOrderStatus["CLOSED_WITHOUT_INVOICE"] = "CLOSED_WITHOUT_INVOICE";
    WorkOrderStatus["CANCELLED"] = "CANCELLED";
    return WorkOrderStatus;
}({});
var VehicleWorkflowStatus = /*#__PURE__*/ function(VehicleWorkflowStatus) {
    VehicleWorkflowStatus["WAITING"] = "WAITING";
    VehicleWorkflowStatus["IN_PROGRESS"] = "IN_PROGRESS";
    VehicleWorkflowStatus["READY"] = "READY";
    VehicleWorkflowStatus["DELIVERED"] = "DELIVERED";
    return VehicleWorkflowStatus;
}({});
var PartWorkflowStatus = /*#__PURE__*/ function(PartWorkflowStatus) {
    PartWorkflowStatus["NOT_STARTED"] = "NOT_STARTED";
    PartWorkflowStatus["PARTS_SUPPLIED_DIRECT"] = "PARTS_SUPPLIED_DIRECT";
    PartWorkflowStatus["PARTS_PENDING"] = "PARTS_PENDING";
    PartWorkflowStatus["PARTIALLY_SUPPLIED"] = "PARTIALLY_SUPPLIED";
    PartWorkflowStatus["ALL_PARTS_SUPPLIED"] = "ALL_PARTS_SUPPLIED";
    return PartWorkflowStatus;
}({});

//# sourceMappingURL=work-order.enums.js.map