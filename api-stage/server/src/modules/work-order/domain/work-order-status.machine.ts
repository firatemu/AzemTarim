import { WorkOrderStatus } from '../work-order.enums';

export const WORK_ORDER_VALID_TRANSITIONS: Record<
  WorkOrderStatus,
  WorkOrderStatus[]
> = {
  [WorkOrderStatus.WAITING_DIAGNOSIS]: [WorkOrderStatus.PENDING_APPROVAL, WorkOrderStatus.APPROVED_IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.PENDING_APPROVAL]: [WorkOrderStatus.APPROVED_IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.APPROVED_IN_PROGRESS]: [WorkOrderStatus.PART_WAITING, WorkOrderStatus.VEHICLE_READY, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.PART_WAITING]: [WorkOrderStatus.PARTS_SUPPLIED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.PARTS_SUPPLIED]: [WorkOrderStatus.VEHICLE_READY, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.VEHICLE_READY]: [WorkOrderStatus.INVOICED_CLOSED, WorkOrderStatus.CLOSED_WITHOUT_INVOICE, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.INVOICED_CLOSED]: [],
  [WorkOrderStatus.CLOSED_WITHOUT_INVOICE]: [],
  [WorkOrderStatus.CANCELLED]: [],
};

export function canTransitionWorkOrderStatus(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus,
): boolean {
  const allowed = WORK_ORDER_VALID_TRANSITIONS[currentStatus];
  return Boolean(allowed?.includes(newStatus));
}

export function validateWorkOrderStatusTransition(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus,
): void {
  if (!canTransitionWorkOrderStatus(currentStatus, newStatus)) {
    throw new Error(
      `Geçersiz status geçişi: ${currentStatus} -> ${newStatus}`,
    );
  }
}
