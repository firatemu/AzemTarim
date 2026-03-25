import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Service for provisioning and deprovisioning B2B tenant schemas.
 * Handles dynamic schema creation and migration execution.
 */
@Injectable()
export class B2BSchemaProvisioningService {
  private readonly logger = new Logger(B2BSchemaProvisioningService.name);

  // Strict schema name validation: only lowercase letters, numbers, and underscores
  private readonly SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]*$/;
  private readonly MAX_SCHEMA_NAME_LENGTH = 63;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Provisions a new schema for a B2B tenant.
   * @param schemaName - The name of the schema to create (e.g., 'b2b_tenant_123')
   * @param tenantId - The tenant ID for logging purposes
   */
  async provisionSchema(schemaName: string, tenantId: string): Promise<void> {
    this.validateSchemaName(schemaName);

    // Check if schema already exists
    const exists = await this.schemaExists(schemaName);
    if (exists) {
      this.logger.log(`Schema '${schemaName}' already exists for tenant ${tenantId}`);
      return;
    }

    try {
      // Create the schema
      await this.prisma.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
      );
      this.logger.log(`Schema '${schemaName}' created successfully for tenant ${tenantId}`);

      // Run tenant schema migrations
      await this.runTenantMigrations(schemaName);

    } catch (error) {
      this.logger.error(`Failed to create schema '${schemaName}': ${error.message}`);
      throw new BadRequestException(
        `Failed to provision schema: ${error.message}`
      );
    }
  }

  /**
   * Deprovisions (drops) a schema for a B2B tenant.
   * WARNING: This will permanently delete all data in the schema.
   * @param schemaName - The name of the schema to drop
   */
  async deprovisionSchema(schemaName: string): Promise<void> {
    this.validateSchemaName(schemaName);

    const exists = await this.schemaExists(schemaName);
    if (!exists) {
      this.logger.warn(`Schema '${schemaName}' does not exist, nothing to deprovision`);
      return;
    }

    try {
      // Drop schema with CASCADE to remove all dependent objects
      await this.prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`
      );
      this.logger.log(`Schema '${schemaName}' dropped successfully`);
    } catch (error) {
      this.logger.error(`Failed to drop schema '${schemaName}': ${error.message}`);
      throw new BadRequestException(
        `Failed to deprovision schema: ${error.message}`
      );
    }
  }

  /**
   * Checks if a schema exists in the database.
   * @param schemaName - The name of the schema to check
   * @returns true if the schema exists, false otherwise
   */
  async schemaExists(schemaName: string): Promise<boolean> {
    this.validateSchemaName(schemaName);

    try {
      const result = await this.prisma.$queryRawUnsafe<{ exists: boolean }[]>(
        `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) as "exists"`,
        schemaName
      );
      return result[0]?.exists || false;
    } catch (error) {
      this.logger.error(`Failed to check schema existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Lists all B2B tenant schemas in the database.
   * @returns Array of schema names matching the B2B pattern
   */
  async listB2BSchemas(): Promise<string[]> {
    try {
      const schemas = await this.prisma.$queryRawUnsafe<{ schema_name: string }[]>(
        `SELECT schema_name FROM information_schema.schemata
         WHERE schema_name LIKE 'b2b_%'
         ORDER BY schema_name`
      );
      return schemas.map(s => s.schema_name);
    } catch (error) {
      this.logger.error(`Failed to list B2B schemas: ${error.message}`);
      return [];
    }
  }

  /**
   * Validates schema name against security rules.
   * @param schemaName - The schema name to validate
   * @throws BadRequestException if validation fails
   */
  private validateSchemaName(schemaName: string): void {
    if (!schemaName || typeof schemaName !== 'string') {
      throw new BadRequestException('Schema name is required');
    }

    if (schemaName.length > this.MAX_SCHEMA_NAME_LENGTH) {
      throw new BadRequestException(
        `Schema name exceeds maximum length of ${this.MAX_SCHEMA_NAME_LENGTH}`
      );
    }

    if (!this.SCHEMA_NAME_REGEX.test(schemaName)) {
      throw new BadRequestException(
        'Schema name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores'
      );
    }

    // Prevent SQL injection through schema name
    const dangerousKeywords = [
      'drop', 'delete', 'truncate', 'alter', 'create', 'insert',
      'update', 'grant', 'revoke', 'exec', 'execute', 'script'
    ];
    const lowerName = schemaName.toLowerCase();
    for (const keyword of dangerousKeywords) {
      if (lowerName.includes(keyword)) {
        throw new BadRequestException(
          `Schema name cannot contain dangerous keywords: ${keyword}`
        );
      }
    }
  }

  /**
   * Gets information about a specific schema.
   * @param schemaName - The name of the schema
   * @returns Schema information or null if not found
   */
  async getSchemaInfo(schemaName: string): Promise<{
    name: string;
    tableCount: number;
    exists: boolean;
  } | null> {
    this.validateSchemaName(schemaName);

    const exists = await this.schemaExists(schemaName);
    if (!exists) {
      return null;
    }

    try {
      const tables = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*) as "count" FROM information_schema.tables
         WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
        schemaName
      );

      return {
        name: schemaName,
        tableCount: Number(tables[0]?.count || 0),
        exists: true,
      };
    } catch (error) {
      this.logger.error(`Failed to get schema info: ${error.message}`);
      return null;
    }
  }

  /**
   * Runs Prisma migrations for the tenant schema.
   * Uses the tenant-specific schema file to create tables in the new schema.
   *
   * @param schemaName - The name of the schema to migrate
   */
  private async runTenantMigrations(schemaName: string): Promise<void> {
    this.logger.log(`Running migrations for schema '${schemaName}'...`);

    try {
      // Get the database URL and modify it for the target schema
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      const schemaUrl = `${databaseUrl}?schema=${encodeURIComponent(schemaName)}`;

      // Run Prisma migrate deploy using the tenant schema
      const schemaPath = './prisma/schema-tenant-b2b.prisma';
      const migrationsPath = './prisma/migrations-tenant';
      const command = `npx prisma migrate deploy --schema=${schemaPath} --migrations-path=${migrationsPath}`;

      this.logger.debug(`Running migration command: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        env: {
          ...process.env,
          DATABASE_URL: schemaUrl,
        },
        cwd: process.cwd(),
      });

      if (stdout) {
        this.logger.debug(`Migration stdout: ${stdout}`);
      }
      if (stderr) {
        this.logger.warn(`Migration stderr: ${stderr}`);
      }

      this.logger.log(`Migrations completed for schema '${schemaName}'`);
    } catch (error) {
      this.logger.error(`Failed to run migrations for schema '${schemaName}': ${error.message}`);

      // On migration failure, drop the schema to leave no trace
      try {
        await this.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
        this.logger.warn(`Cleaned up failed schema '${schemaName}'`);
      } catch (cleanupError) {
        this.logger.error(`Failed to cleanup schema after migration failure: ${cleanupError.message}`);
      }

      throw new BadRequestException(
        `Failed to run migrations for schema: ${error.message}`
      );
    }
  }

  /**
   * Creates initial data in the tenant schema (default delivery methods, etc.)
   *
   * @param schemaName - The name of the schema
   */
  async seedTenantSchema(schemaName: string): Promise<void> {
    this.logger.log(`Seeding initial data for schema '${schemaName}'...`);

    try {
      // Get a Prisma client for the target schema
      // This would use B2BPrismaService but to avoid circular dependency,
      // we'll create a temporary client
      const { PrismaClient } = await import('@prisma/client');
      const databaseUrl = process.env.DATABASE_URL;
      const schemaUrl = `${databaseUrl}?schema=${encodeURIComponent(schemaName)}`;

      const tenantPrisma = new PrismaClient({
        datasources: { db: { url: schemaUrl } },
      });

      // Create default delivery methods
      const deliveryMethods = [
        { name: 'Depo Teslim', isActive: true, displayOrder: 1 },
        { name: 'Kargo', isActive: true, displayOrder: 2 },
        { name: 'Ambar Teslim', isActive: true, displayOrder: 3 },
      ];

      for (const method of deliveryMethods) {
        await tenantPrisma.b2BDeliveryMethod.create({
          data: method,
        });
      }

      this.logger.log(`Seeded ${deliveryMethods.length} delivery methods for schema '${schemaName}'`);

      await tenantPrisma.$disconnect();
    } catch (error) {
      this.logger.error(`Failed to seed schema '${schemaName}': ${error.message}`);
      throw new BadRequestException(`Failed to seed schema: ${error.message}`);
    }
  }
}
