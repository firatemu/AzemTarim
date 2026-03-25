import { BadRequestException } from '@nestjs/common';
import { B2BOrderStatus } from '@prisma/client';
import { B2B_ORDER_STATUS_TRANSITIONS } from '../b2b-admin.constants';
import { assertB2bOrderStatusTransition } from '../b2b-order-status.util';

describe('assertB2bOrderStatusTransition', () => {
  it('every transition listed in B2B_ORDER_STATUS_TRANSITIONS succeeds', () => {
    for (const [from, targets] of Object.entries(B2B_ORDER_STATUS_TRANSITIONS) as [
      B2BOrderStatus,
      B2BOrderStatus[],
    ][]) {
      for (const to of targets) {
        expect(() => assertB2bOrderStatusTransition(from, to)).not.toThrow();
      }
    }
  });

  it('rejects EXPORTED_TO_ERP -> APPROVED', () => {
    expect(() =>
      assertB2bOrderStatusTransition(
        B2BOrderStatus.EXPORTED_TO_ERP,
        B2BOrderStatus.APPROVED,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects CANCELLED -> EXPORTED_TO_ERP', () => {
    expect(() =>
      assertB2bOrderStatusTransition(
        B2BOrderStatus.CANCELLED,
        B2BOrderStatus.EXPORTED_TO_ERP,
      ),
    ).toThrow(BadRequestException);
  });

  it('allows PENDING -> APPROVED', () => {
    expect(() =>
      assertB2bOrderStatusTransition(B2BOrderStatus.PENDING, B2BOrderStatus.APPROVED),
    ).not.toThrow();
  });

  it('allows APPROVED -> EXPORTED_TO_ERP', () => {
    expect(() =>
      assertB2bOrderStatusTransition(
        B2BOrderStatus.APPROVED,
        B2BOrderStatus.EXPORTED_TO_ERP,
      ),
    ).not.toThrow();
  });

  it('allows EXPORTED_TO_ERP -> CANCELLED (per B2B_ORDER_STATUS_TRANSITIONS)', () => {
    expect(() =>
      assertB2bOrderStatusTransition(
        B2BOrderStatus.EXPORTED_TO_ERP,
        B2BOrderStatus.CANCELLED,
      ),
    ).not.toThrow();
  });

  it('rejects REJECTED -> APPROVED', () => {
    expect(() =>
      assertB2bOrderStatusTransition(B2BOrderStatus.REJECTED, B2BOrderStatus.APPROVED),
    ).toThrow(BadRequestException);
  });

  it('rejects CANCELLED -> PENDING', () => {
    expect(() =>
      assertB2bOrderStatusTransition(B2BOrderStatus.CANCELLED, B2BOrderStatus.PENDING),
    ).toThrow(BadRequestException);
  });
});
