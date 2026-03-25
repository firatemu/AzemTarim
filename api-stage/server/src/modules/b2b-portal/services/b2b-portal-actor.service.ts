import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../common/prisma.service';
import { B2B_ACTING_CUSTOMER_HEADER } from '../constants';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';

@Injectable()
export class B2bPortalActorService {
  constructor(private readonly prisma: PrismaService) {}

  async assertSalespersonCanAccess(
    salespersonId: string,
    customerId: string,
    tenantId: string,
  ): Promise<void> {
    const sp = await this.prisma.b2BSalesperson.findFirst({
      where: { id: salespersonId, tenantId, isActive: true },
      select: { id: true, canViewAllCustomers: true },
    });
    if (!sp) {
      throw new ForbiddenException('Gecersiz temsilci');
    }
    if (sp.canViewAllCustomers) {
      const c = await this.prisma.b2BCustomer.findFirst({
        where: { id: customerId, tenantId, isActive: true },
        select: { id: true },
      });
      if (!c) {
        throw new BadRequestException('Musteri bulunamadi');
      }
      return;
    }
    const link = await this.prisma.b2BSalespersonCustomer.findUnique({
      where: {
        salespersonId_customerId: { salespersonId, customerId },
      },
    });
    if (!link) {
      throw new ForbiddenException('Bu musteri icin yetkiniz yok');
    }
  }

  /**
   * JWT + (istege bagli) acting header ile efektif B2B musteri id.
   */
  async resolveEffectiveCustomerId(
    req: Request,
    user: B2bJwtPayload,
  ): Promise<string> {
    if (user.userType === 'CUSTOMER') {
      return user.sub;
    }
    const raw =
      req.headers[B2B_ACTING_CUSTOMER_HEADER] ??
      req.headers['x-b2b-acting-customer-id'];
    const acting =
      typeof raw === 'string'
        ? raw.trim()
        : Array.isArray(raw)
          ? raw[0]?.trim()
          : '';
    if (!acting) {
      throw new BadRequestException({
        message: 'Temsilci oturumu icin x-b2b-acting-customer-id gerekli',
        code: 'B2B_ACTING_CUSTOMER_REQUIRED',
      });
    }
    await this.assertSalespersonCanAccess(user.sub, acting, user.tenantId);
    return acting;
  }
}
