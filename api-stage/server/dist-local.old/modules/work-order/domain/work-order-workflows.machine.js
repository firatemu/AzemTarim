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
    get PART_WORKFLOW_VALID_TRANSITIONS () {
        return PART_WORKFLOW_VALID_TRANSITIONS;
    },
    get VEHICLE_WORKFLOW_VALID_TRANSITIONS () {
        return VEHICLE_WORKFLOW_VALID_TRANSITIONS;
    },
    get canTransitionVehicleWorkflow () {
        return canTransitionVehicleWorkflow;
    }
});
const _workorderenums = require("../work-order.enums");
const PART_WORKFLOW_VALID_TRANSITIONS = {
    [_workorderenums.PartWorkflowStatus.NOT_STARTED]: [
        _workorderenums.PartWorkflowStatus.PARTS_SUPPLIED_DIRECT,
        _workorderenums.PartWorkflowStatus.PARTS_PENDING
    ],
    [_workorderenums.PartWorkflowStatus.PARTS_SUPPLIED_DIRECT]: [],
    [_workorderenums.PartWorkflowStatus.PARTS_PENDING]: [
        _workorderenums.PartWorkflowStatus.PARTIALLY_SUPPLIED,
        _workorderenums.PartWorkflowStatus.ALL_PARTS_SUPPLIED
    ],
    [_workorderenums.PartWorkflowStatus.PARTIALLY_SUPPLIED]: [
        _workorderenums.PartWorkflowStatus.PARTIALLY_SUPPLIED,
        _workorderenums.PartWorkflowStatus.ALL_PARTS_SUPPLIED
    ],
    [_workorderenums.PartWorkflowStatus.ALL_PARTS_SUPPLIED]: []
};
const VEHICLE_WORKFLOW_VALID_TRANSITIONS = {
    [_workorderenums.VehicleWorkflowStatus.WAITING]: [
        _workorderenums.VehicleWorkflowStatus.IN_PROGRESS,
        _workorderenums.VehicleWorkflowStatus.DELIVERED
    ],
    [_workorderenums.VehicleWorkflowStatus.IN_PROGRESS]: [
        _workorderenums.VehicleWorkflowStatus.READY,
        _workorderenums.VehicleWorkflowStatus.DELIVERED
    ],
    [_workorderenums.VehicleWorkflowStatus.READY]: [
        _workorderenums.VehicleWorkflowStatus.DELIVERED
    ],
    [_workorderenums.VehicleWorkflowStatus.DELIVERED]: []
};
function canTransitionVehicleWorkflow(current, next) {
    return VEHICLE_WORKFLOW_VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

//# sourceMappingURL=work-order-workflows.machine.js.map