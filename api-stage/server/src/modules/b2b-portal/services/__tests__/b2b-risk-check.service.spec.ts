import { BadRequestException } from '@nestjs/common';
import { Prisma, RiskStatus } from '@prisma/client';
import { B2bRiskCheckService } from '../b2b-risk-check.service';

describe('B2bRiskCheckService', () => {
  let service: B2bRiskCheckService;
  let mockPrisma: {
    b2BCustomer: { findFirst: jest.Mock };
    account: { findFirst: jest.Mock };
  };

  beforeEach(() => {
    mockPrisma = {
      b2BCustomer: { findFirst: jest.fn() },
      account: { findFirst: jest.fn() },
    };
    service = new B2bRiskCheckService(mockPrisma as any);
  });

  describe('assertOrderAllowed', () => {
    const defaultCustomer = {
      erpAccountId: 'acc1',
    };

    const defaultAccount = {
      balance: '1000',
      creditLimit: '5000',
      creditStatus: RiskStatus.OK,
    };

    it('allows order when no risk issues and within credit limit', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue(defaultAccount);

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('500'))
      ).resolves.not.toThrow();
    });

    it('throws when customer not found', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(null);

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('100'))
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when ERP account not found', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('100'))
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when account is BLACK_LISTED', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        ...defaultAccount,
        creditStatus: RiskStatus.BLACK_LIST,
      });

      const error = await service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('100'))
        .catch(e => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as any).response).toEqual({
        message: 'Cari risk durumu nedeniyle sipariş verilemez',
        code: 'B2B_RISK_BLOCKED',
      });
    });

    it('throws when account is IN_COLLECTION', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        ...defaultAccount,
        creditStatus: RiskStatus.IN_COLLECTION,
      });

      const error = await service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('100'))
        .catch(e => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as any).response).toEqual({
        message: 'Cari risk durumu nedeniyle sipariş verilemez',
        code: 'B2B_RISK_BLOCKED',
      });
    });

    it('allows order when creditStatus is RISKY but within limit', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        ...defaultAccount,
        creditStatus: RiskStatus.RISKY,
      });

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('500'))
      ).resolves.not.toThrow();
    });

    it('throws when order would exceed credit limit', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: '4500',
        creditLimit: '5000',
        creditStatus: RiskStatus.OK,
      });

      const error = await service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('600'))
        .catch(e => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as any).response).toEqual({
        message: 'Kredi limiti aşılıyor',
        code: 'B2B_CREDIT_LIMIT',
      });
    });

    it('allows order when at exactly credit limit', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: '4500',
        creditLimit: '5000',
        creditStatus: RiskStatus.OK,
      });

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('500'))
      ).resolves.not.toThrow();
    });

    it('allows any order when creditLimit is null (no limit)', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: '999999',
        creditLimit: null,
        creditStatus: RiskStatus.OK,
      });

      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('100000'))
      ).resolves.not.toThrow();
    });

    it('handles negative balance (credit) correctly', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: '-500', // Customer has credit
        creditLimit: '2000',
        creditStatus: RiskStatus.OK,
      });

      // Should allow: -500 + 1000 = 500, which is less than 2000 limit
      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('1000'))
      ).resolves.not.toThrow();
    });

    it('uses Prisma.Decimal for precise calculations', async () => {
      mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
      mockPrisma.account.findFirst.mockResolvedValue({
        balance: '1000.55',
        creditLimit: '2000.99',
        creditStatus: RiskStatus.OK,
      });

      // Should allow: 1000.55 + 999.99 = 2000.54, which is less than 2000.99
      await expect(
        service.assertOrderAllowed('t1', 'c1', new Prisma.Decimal('999.99'))
      ).resolves.not.toThrow();
    });
  });
});
