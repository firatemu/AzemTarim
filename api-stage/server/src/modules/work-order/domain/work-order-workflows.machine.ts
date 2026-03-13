import { PartWorkflowStatus, VehicleWorkflowStatus } from '../work-order.enums';

// Parça İş Akışı Geçişleri
export const PART_WORKFLOW_VALID_TRANSITIONS: Record<
  PartWorkflowStatus,
  PartWorkflowStatus[]
> = {
  [PartWorkflowStatus.NOT_STARTED]: [PartWorkflowStatus.PARTS_SUPPLIED_DIRECT, PartWorkflowStatus.PARTS_PENDING],
  [PartWorkflowStatus.PARTS_SUPPLIED_DIRECT]: [],
  [PartWorkflowStatus.PARTS_PENDING]: [PartWorkflowStatus.PARTIALLY_SUPPLIED, PartWorkflowStatus.ALL_PARTS_SUPPLIED],
  [PartWorkflowStatus.PARTIALLY_SUPPLIED]: [PartWorkflowStatus.PARTIALLY_SUPPLIED, PartWorkflowStatus.ALL_PARTS_SUPPLIED],
  [PartWorkflowStatus.ALL_PARTS_SUPPLIED]: [],
};

// Araç İş Akışı Geçişleri
export const VEHICLE_WORKFLOW_VALID_TRANSITIONS: Record<
  VehicleWorkflowStatus,
  VehicleWorkflowStatus[]
> = {
  [VehicleWorkflowStatus.WAITING]: [VehicleWorkflowStatus.IN_PROGRESS, VehicleWorkflowStatus.DELIVERED],
  [VehicleWorkflowStatus.IN_PROGRESS]: [VehicleWorkflowStatus.READY, VehicleWorkflowStatus.DELIVERED],
  [VehicleWorkflowStatus.READY]: [VehicleWorkflowStatus.DELIVERED],
  [VehicleWorkflowStatus.DELIVERED]: [],
};

export function canTransitionVehicleWorkflow(
  current: VehicleWorkflowStatus,
  next: VehicleWorkflowStatus,
): boolean {
  return VEHICLE_WORKFLOW_VALID_TRANSITIONS[current]?.includes(next) ?? false;
}
