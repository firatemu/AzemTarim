import { B2BOrderStatus } from '@prisma/client';

/** Manuel durum geçişleri (PATCH /orders/:id/status) */
export const B2B_ORDER_STATUS_TRANSITIONS: Record<
  B2BOrderStatus,
  B2BOrderStatus[]
> = {
  [B2BOrderStatus.PENDING]: [
    B2BOrderStatus.APPROVED,
    B2BOrderStatus.REJECTED,
    B2BOrderStatus.CANCELLED,
  ],
  [B2BOrderStatus.APPROVED]: [
    B2BOrderStatus.EXPORTED_TO_ERP,
    B2BOrderStatus.CANCELLED,
  ],
  [B2BOrderStatus.REJECTED]: [],
  [B2BOrderStatus.EXPORTED_TO_ERP]: [B2BOrderStatus.CANCELLED],
  [B2BOrderStatus.CANCELLED]: [],
};
