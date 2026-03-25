import { B2BMovementType, Prisma } from '@prisma/client';
import { B2bAccountService } from '../b2b-account.service';
import { B2BFifoService } from '../b2b-fifo.service';
import { B2bCartOrderService } from '../b2b-cart-order.service';
import { B2bRiskCheckService } from '../b2b-risk-check.service';

describe('B2bAccountService', () => {
  let service: B2bAccountService;
  let mockPrisma: {
    b2BCustomer: { findFirst: jest.Mock };
    account: { findFirst: jest.Mock };
    b2BAccountMovement: {
      aggregate: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    b2BOrder: { count: jest.Mock };
    $transaction: jest.Mock;
  };
  let mockRisk: { assertOrderAllowed: jest.Mock };
  let mockCart: { getCartSummary: jest.Mock };
  let fifo: B2BFifoService;

  beforeEach(() => {
    fifo = new B2BFifoService();
    mockRisk = { assertOrderAllowed: jest.fn().mockResolvedValue(undefined) };
    mockCart = {
      getCartSummary: jest.fn().mockResolvedValue({
        items: [],
        totals: { totalFinalPrice: new Prisma.Decimal(0) },
      }),
    };
    mockPrisma = {
      b2BCustomer: { findFirst: jest.fn() },
      account: { findFirst: jest.fn() },
      b2BAccountMovement: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      b2BOrder: { count: jest.fn() },
      $transaction: jest.fn(),
    };
    service = new B2bAccountService(
      mockPrisma as any,
      mockRisk as unknown as B2bRiskCheckService,
      mockCart as unknown as B2bCartOrderService,
      fifo,
    );
  });

  describe('getSummary', () => {
    it('includes fifo summary from movements and vatDays', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
        id: 'c1',
        name: 'A',
        email: 'a@x.com',
        vatDays: 0,
        erpAccountId: 'erp1',
      });
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: new Prisma.Decimal(0),
        creditLimit: null,
        creditStatus: null,
        title: 'Cari',
      });
      mockPrisma.b2BAccountMovement.aggregate.mockResolvedValue({
        _count: 0,
        _sum: { debit: null, credit: null },
      });
      mockPrisma.b2BAccountMovement.findMany.mockResolvedValue([
        {
          id: 'm1',
          date: new Date('2025-01-01'),
          type: B2BMovementType.INVOICE,
          debit: new Prisma.Decimal(100),
          credit: new Prisma.Decimal(0),
        },
      ]);
      mockPrisma.b2BOrder.count.mockResolvedValue(0);

      const r = await service.getSummary('t1', 'c1');

      expect(r.fifo.balance).toBe('100');
      expect(r.fifo.pastDueMovementCount).toBe(1);
      expect(mockPrisma.b2BAccountMovement.findMany).toHaveBeenCalled();
    });
  });

  describe('exportMovementsXlsx', () => {
    it('builds xlsx buffer with fifo columns', async () => {
      const fifo = new B2BFifoService();
      mockPrisma.b2BAccountMovement.findMany
        .mockResolvedValueOnce([
          {
            id: 'm1',
            date: new Date('2025-01-01'),
            type: B2BMovementType.INVOICE,
            description: null,
            debit: new Prisma.Decimal(10),
            credit: new Prisma.Decimal(0),
            balance: new Prisma.Decimal(10),
            erpMovementId: 'e1',
            tenantId: 't1',
            customerId: 'c1',
            erpInvoiceNo: null,
            dueDate: null,
            isPastDue: false,
            createdAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'm1',
            date: new Date('2025-01-01'),
            type: B2BMovementType.INVOICE,
            debit: new Prisma.Decimal(10),
            credit: new Prisma.Decimal(0),
          },
        ]);
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue({ vatDays: 0 });

      const buf = await service.exportMovementsXlsx('t1', 'c1', {
        maxRows: 100,
      });
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.length).toBeGreaterThan(100);
      expect(mockPrisma.b2BAccountMovement.findMany).toHaveBeenCalled();
    });
  });

  describe('listMovements', () => {
    it('with includeFifo merges fifo fields', async () => {
      mockPrisma.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
        Promise.all(ops),
      );
      mockPrisma.b2BAccountMovement.count.mockResolvedValue(1);
      const fullRow = {
        id: 'm1',
        date: new Date('2025-01-01'),
        type: B2BMovementType.INVOICE,
        debit: new Prisma.Decimal(100),
        credit: new Prisma.Decimal(0),
        balance: new Prisma.Decimal(100),
        erpMovementId: 'e1',
        tenantId: 't1',
        customerId: 'c1',
        description: null,
        erpInvoiceNo: null,
        dueDate: null,
        isPastDue: false,
        createdAt: new Date(),
      };
      mockPrisma.b2BAccountMovement.findMany
        .mockResolvedValueOnce([fullRow])
        .mockResolvedValueOnce([
          {
            id: 'm1',
            date: new Date('2025-01-01'),
            type: B2BMovementType.INVOICE,
            debit: new Prisma.Decimal(100),
            credit: new Prisma.Decimal(0),
          },
        ]);

      mockPrisma.b2BCustomer.findFirst.mockResolvedValue({ vatDays: 0 });

      const r = await service.listMovements('t1', 'c1', {
        page: 1,
        pageSize: 25,
        includeFifo: true,
      });

      const row = r.data[0] as Record<string, unknown>;
      expect(row).toMatchObject({
        id: 'm1',
        fifoIsPastDue: true,
        fifoRemainingDebit: '100',
      });
    });
  });
});
