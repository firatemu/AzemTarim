import {
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/services/redis.service';

/**
 * Caddy on_demand_tls `ask` endpoint: kayitli domain icin 200, degilse 404.
 *
 * Uses Redis cache with 10-minute TTL to avoid database queries on every TLS handshake.
 * Cache key: "b2b_tls_ask:{domain}"
 */
@ApiTags('Internal')
@Controller('internal')
export class InternalTlsAskController {
  private readonly CACHE_PREFIX = 'b2b_tls_ask:';
  private readonly CACHE_TTL = 600; // 10 minutes in seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('tls-ask')
  @Throttle({ default: { limit: 200, ttl: 60_000 } })
  @ApiOperation({ summary: 'TLS on-demand: domain B2B kayitli mi?' })
  async tlsAsk(@Query('domain') domain: string) {
    const d = (domain ?? '').trim().toLowerCase();
    if (!d) {
      throw new NotFoundException();
    }

    const cacheKey = `${this.CACHE_PREFIX}${d}`;

    try {
      // Check Redis cache first
      const cached = await this.redis.get(cacheKey);
      if (cached === '1') {
        return { ok: true, cached: true };
      }

      // Query database if not in cache
      const row = await this.prisma.b2BDomain.findFirst({
        where: { domain: d },
        select: { id: true },
      });

      if (!row) {
        // Cache negative result for 1 minute to prevent repeated queries
        await this.redis.set(cacheKey, '0', 60);
        throw new NotFoundException();
      }

      // Cache positive result for 10 minutes
      await this.redis.set(cacheKey, '1', this.CACHE_TTL);

      return { ok: true, cached: false };
    } catch (error) {
      // If Redis fails, fall back to database query only
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Redis error - query database directly
      const row = await this.prisma.b2BDomain.findFirst({
        where: { domain: d },
        select: { id: true },
      });

      if (!row) {
        throw new NotFoundException();
      }

      return { ok: true, cached: false };
    }
  }
}
