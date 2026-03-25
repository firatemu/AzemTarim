import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { B2BPrismaService } from '../../../common/services/b2b-prisma.service';

/**
 * Phase 5 Implementation: Dynamic schema isolation for B2B tenants.
 *
 * When a tenant has a declared schemaName in B2BTenantConfig:
 * - All B2B queries use a dedicated PrismaClient for that schema
 * - Schema isolation achieved at PostgreSQL level
 * - Connection pooling managed by B2BPrismaService
 *
 * When no schemaName is declared (legacy mode):
 * - Falls back to main PrismaService with tenantId filtering
 */
@Injectable()
export class B2bTenantSchemaBridgeService {
  private readonly log = new Logger(B2bTenantSchemaBridgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly b2bPrisma: B2BPrismaService,
  ) {}

  /**
   * Get the declared schema name for a tenant.
   * Returns null if tenant is not using schema isolation.
   */
  async getDeclaredSchemaName(tenantId: string): Promise<string | null> {
    const cfg = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
      select: { schemaName: true, isActive: true },
    });
    if (!cfg?.isActive) {
      return null;
    }
    return cfg.schemaName || null;
  }

  /**
   * Get the appropriate Prisma client for a tenant.
   * Returns dynamic schema client if schemaName is declared, otherwise main client.
   */
  async getClient(tenantId: string): Promise<PrismaClient> {
    const schemaName = await this.getDeclaredSchemaName(tenantId);

    if (schemaName) {
      // Use dynamic schema client for isolated tenant
      this.log.debug(`Using dynamic schema '${schemaName}' for tenant ${tenantId}`);
      return this.b2bPrisma.getClient(schemaName);
    }

    // Fall back to main PrismaService (legacy mode)
    this.log.debug(`Using main PrismaService for tenant ${tenantId}`);
    return this.prisma;
  }

  /**
   * Execute a callback with the tenant's appropriate Prisma client.
   * Provides automatic client selection and error handling.
   */
  async withClient<T>(
    tenantId: string,
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const prisma = await this.getClient(tenantId);
    return callback(prisma);
  }

  /**
   * Log schema usage for debugging.
   */
  logSchemaHint(tenantId: string, schemaName: string | null): void {
    if (schemaName) {
      this.log.verbose(
        `B2B tenant ${tenantId} using isolated schema '${schemaName}'`,
      );
    } else {
      this.log.verbose(
        `B2B tenant ${tenantId} using main schema (legacy mode)`,
      );
    }
  }

  /**
   * Check if a tenant is using schema isolation.
   */
  async isIsolated(tenantId: string): Promise<boolean> {
    const schemaName = await this.getDeclaredSchemaName(tenantId);
    return !!schemaName;
  }
}
