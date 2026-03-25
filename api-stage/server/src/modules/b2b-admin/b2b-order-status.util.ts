import { BadRequestException } from '@nestjs/common';
import { B2BOrderStatus } from '@prisma/client';
import { B2B_ORDER_STATUS_TRANSITIONS } from './b2b-admin.constants';

/**
 * Admin PATCH / baska yerlerde ortak gecis kontrolu.
 */
export function assertB2bOrderStatusTransition(
  from: B2BOrderStatus,
  to: B2BOrderStatus,
): void {
  const allowed = B2B_ORDER_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid status transition from ${from} to ${to}`,
    );
  }
}
