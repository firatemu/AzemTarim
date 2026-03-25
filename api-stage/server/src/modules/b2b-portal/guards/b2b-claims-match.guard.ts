import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';

/**
 * JWT içindeki tenant/domain, x-b2b-domain ile çözülen kayıtla aynı olmalı.
 */
@Injectable()
export class B2bClaimsMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<import('express').Request>();
    const user = req.user as B2bJwtPayload | undefined;
    if (!user?.tenantId || !user?.b2bDomainId) {
      throw new ForbiddenException('B2B oturumu geçersiz');
    }
    if (
      req.b2bTenantId !== user.tenantId ||
      req.b2bDomainId !== user.b2bDomainId
    ) {
      throw new ForbiddenException('Domain ile oturum eşleşmiyor');
    }
    return true;
  }
}
