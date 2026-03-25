import {
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from './redis.service';

const CACHE_TTL_SEC = 300;

@Injectable()
export class B2bLicenseCacheService {
  private readonly log = new Logger(B2bLicenseCacheService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private key(tenantId: string): string {
    return `b2b:license:active:${tenantId}`;
  }

  async invalidate(tenantId: string): Promise<void> {
    await this.redis.del(this.key(tenantId));
    this.log.debug(`B2B license cache invalidated tenant=${tenantId}`);
  }

  /**
   * Aktif B2B lisansı yoksa ForbiddenException fırlatır.
   */
  async assertActiveOrThrow(tenantId: string): Promise<void> {
    const k = this.key(tenantId);
    const cached = await this.redis.get(k);
    if (cached === '1') {
      return;
    }
    if (cached === '0') {
      throw new ForbiddenException(
        'B2B module license is inactive or expired',
      );
    }

    const license = await this.prisma.b2BLicense.findUnique({
      where: { tenantId },
    });

    const ok =
      !!license?.isActive &&
      (license.expiresAt == null || license.expiresAt >= new Date());

    await this.redis.set(k, ok ? '1' : '0', CACHE_TTL_SEC);

    if (!ok) {
      throw new ForbiddenException(
        'B2B module license is inactive or expired',
      );
    }
  }
}
