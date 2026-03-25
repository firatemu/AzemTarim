import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { B2bLicenseCacheService } from '../services/b2b-license-cache.service';
import { TenantResolverService } from '../services/tenant-resolver.service';
import { ConfigService } from '@nestjs/config';

/**
 * B2B Admin / portal: tenant bazlı B2BLicense (Redis önbellekli).
 * Portal isteklerinde `b2bTenantId` (B2bDomainGuard) önceliklidir.
 *
 * Lisans kontrolü:
 * - `B2B_ENABLED` env varsa -> lisans kontrolü ATLA (dev için esnek mekanizma).
 * - `B2B_ENABLED` yoksa -> lisans kontrolü zorunlu (production için güvenlik).
 */
@Injectable()
export class B2BLicenseGuard implements CanActivate {
  constructor(
    private readonly licenseCache: B2bLicenseCacheService,
    private readonly tenantResolver: TenantResolverService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Development mode'da lisans kontrolünü atla
    const isDevMode = process.env.NODE_ENV === 'development';
    if (isDevMode) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{
      b2bTenantId?: string;
    }>();
    const tenantId =
      req.b2bTenantId ?? (await this.tenantResolver.resolveForQuery());

    if (!tenantId) {
      throw new ForbiddenException('B2B module license is not active');
    }

    // Production'da lisans kontrolü zorunlu
    await this.licenseCache.assertActiveOrThrow(tenantId);

    return true;
  }
}
