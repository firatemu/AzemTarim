import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, RiskStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class B2bRiskCheckService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sipariş öncesi: cari limit / risk durumu.
   */
  async assertOrderAllowed(
    tenantId: string,
    customerId: string,
    orderTotal: Prisma.Decimal,
  ): Promise<void> {
    const customer = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId },
      select: { erpAccountId: true },
    });
    if (!customer) {
      throw new BadRequestException('Müşteri bulunamadı');
    }

    const account = await this.prisma.account.findFirst({
      where: {
        id: customer.erpAccountId,
        tenantId,
        deletedAt: null,
      },
      select: {
        balance: true,
        creditLimit: true,
        creditStatus: true,
      },
    });

    if (!account) {
      throw new BadRequestException('ERP cari kaydı bulunamadı');
    }

    if (
      account.creditStatus === RiskStatus.BLACK_LIST ||
      account.creditStatus === RiskStatus.IN_COLLECTION
    ) {
      throw new BadRequestException({
        message: 'Cari risk durumu nedeniyle sipariş verilemez',
        code: 'B2B_RISK_BLOCKED',
      });
    }

    const limit = account.creditLimit;
    if (limit != null) {
      const bal = new Prisma.Decimal(account.balance);
      const lim = new Prisma.Decimal(limit);
      const exposure = bal.add(orderTotal);
      if (exposure.gt(lim)) {
        throw new BadRequestException({
          message: 'Kredi limiti aşılıyor',
          code: 'B2B_CREDIT_LIMIT',
        });
      }
    }
  }
}
