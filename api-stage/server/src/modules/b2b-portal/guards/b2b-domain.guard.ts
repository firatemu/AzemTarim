import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { B2B_DOMAIN_HEADER } from '../constants';

@Injectable()
export class B2bDomainGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<import('express').Request>();
    const raw = req.headers[B2B_DOMAIN_HEADER] ?? req.headers['x-b2b-domain'];
    const domain =
      typeof raw === 'string'
        ? raw.trim().toLowerCase()
        : Array.isArray(raw)
          ? raw[0]?.trim().toLowerCase()
          : '';

    if (!domain) {
      throw new BadRequestException({
        message: 'B2B domain gerekli',
        code: 'B2B_DOMAIN_REQUIRED',
      });
    }

    const row = await this.prisma.b2BDomain.findFirst({
      where: { domain },
      select: { id: true, tenantId: true, domain: true },
    });

    if (!row) {
      throw new NotFoundException('Not Found');
    }

    req.b2bTenantId = row.tenantId;
    req.b2bDomainId = row.id;
    req.b2bDomainHost = row.domain;
    return true;
  }
}
