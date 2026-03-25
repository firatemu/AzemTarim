import { B2BMovementType, Prisma } from '@prisma/client';
import { B2BFifoService } from '../../b2b-portal/services/b2b-fifo.service';
import { B2bAdminCustomerService } from '../services/b2b-admin-customer.service';

describe('B2bAdminCustomerService.getFifoPreview', () => {
  it('returns fifo summary for customer movements', async () => {
    const fifo = new B2BFifoService();
    const mockPrisma = {
      b2BCustomer: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'c1',
          name: 'Test',
          email: 't@x.com',
          vatDays: 0,
        }),
      },
      b2BAccountMovement: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'm1',
            date: new Date('2024-01-01'),
            type: B2BMovementType.INVOICE,
            debit: new Prisma.Decimal(50),
            credit: new Prisma.Decimal(0),
          },
        ]),
      },
    };
    const mockFactory = {} as any;
    const mockSync = {} as any;
    const service = new B2bAdminCustomerService(
      mockPrisma as any,
      mockFactory,
      mockSync,
      fifo,
    );

    const r = await service.getFifoPreview('t1', 'c1', new Date('2026-01-01'));

    expect(r.customer.id).toBe('c1');
    expect(r.summary.balance).toBe('50');
    expect(r.movements).toHaveLength(1);
    expect(r.movements[0].debit).toBe('50');
  });
});
