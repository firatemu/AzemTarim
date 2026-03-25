import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/prisma.service';
import { B2bLicenseCacheService } from '../../../common/services/b2b-license-cache.service';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';

@Injectable()
export class B2bAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly licenseCache: B2bLicenseCacheService,
  ) {}

  private async issueToken(payload: B2bJwtPayload) {
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      expiresIn: 12 * 3600,
      tokenType: 'Bearer' as const,
    };
  }

  async login(domain: string, email: string, password: string) {
    const d = domain.trim().toLowerCase();
    const b2bDomain = await this.prisma.b2BDomain.findFirst({
      where: { domain: d },
      select: { id: true, tenantId: true },
    });
    if (!b2bDomain) {
      throw new UnauthorizedException('Domain veya giriş bilgileri hatalı');
    }

    await this.licenseCache.assertActiveOrThrow(b2bDomain.tenantId);

    const tenantId = b2bDomain.tenantId;
    const emailNorm = email.trim().toLowerCase();

    const customer = await this.prisma.b2BCustomer.findFirst({
      where: {
        tenantId,
        email: emailNorm,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (customer?.isActive && customer.passwordHash) {
      const ok = await bcrypt.compare(password, customer.passwordHash);
      if (ok) {
        const payload: B2bJwtPayload = {
          sub: customer.id,
          tenantId: b2bDomain.tenantId,
          b2bDomainId: b2bDomain.id,
          userType: 'CUSTOMER',
          email: customer.email ?? undefined,
        };
        const tok = await this.issueToken(payload);
        await this.prisma.b2BCustomer.update({
          where: { id: customer.id },
          data: { lastLoginAt: new Date() },
        });
        return {
          ...tok,
          userType: 'CUSTOMER' as const,
          customerId: customer.id,
        };
      }
    }

    const salesperson = await this.prisma.b2BSalesperson.findFirst({
      where: { tenantId, email: emailNorm, isActive: true },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
      },
    });

    if (!salesperson?.passwordHash) {
      throw new UnauthorizedException('Domain veya giriş bilgileri hatalı');
    }

    const okSp = await bcrypt.compare(password, salesperson.passwordHash);
    if (!okSp) {
      throw new UnauthorizedException('Domain veya giriş bilgileri hatalı');
    }

    const payloadSp: B2bJwtPayload = {
      sub: salesperson.id,
      tenantId: b2bDomain.tenantId,
      b2bDomainId: b2bDomain.id,
      userType: 'SALESPERSON',
      email: salesperson.email ?? undefined,
    };
    const tokSp = await this.issueToken(payloadSp);

    return {
      ...tokSp,
      userType: 'SALESPERSON' as const,
      salespersonId: salesperson.id,
      salespersonName: salesperson.name,
    };
  }

  async getProfile(tenantId: string, customerId: string) {
    const row = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        vatDays: true,
        customerClass: { select: { id: true, name: true, discountRate: true } },
      },
    });
    if (!row) {
      throw new UnauthorizedException('Müşteri bulunamadı');
    }
    return row;
  }

  async getSalespersonProfile(tenantId: string, salespersonId: string) {
    const row = await this.prisma.b2BSalesperson.findFirst({
      where: { id: salespersonId, tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        canViewAllCustomers: true,
        canViewAllReports: true,
      },
    });
    if (!row) {
      throw new UnauthorizedException('Temsilci bulunamadı');
    }
    return row;
  }

  async getMe(user: B2bJwtPayload) {
    if (user.userType === 'CUSTOMER') {
      const profile = await this.getProfile(user.tenantId, user.sub);
      return { userType: 'CUSTOMER' as const, profile };
    }
    const profile = await this.getSalespersonProfile(user.tenantId, user.sub);
    return { userType: 'SALESPERSON' as const, profile };
  }
}
