"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BSchemaProvisioningService", {
    enumerable: true,
    get: function() {
        return B2BSchemaProvisioningService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _child_process = require("child_process");
const _util = require("util");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const execAsync = (0, _util.promisify)(_child_process.exec);
let B2BSchemaProvisioningService = class B2BSchemaProvisioningService {
    /**
   * Provisions a new schema for a B2B tenant.
   * @param schemaName - The name of the schema to create (e.g., 'b2b_tenant_123')
   * @param tenantId - The tenant ID for logging purposes
   */ async provisionSchema(schemaName, tenantId) {
        this.validateSchemaName(schemaName);
        // Check if schema already exists
        const exists = await this.schemaExists(schemaName);
        if (exists) {
            this.logger.log(`Schema '${schemaName}' already exists for tenant ${tenantId}`);
            return;
        }
        try {
            // Create the schema
            await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            this.logger.log(`Schema '${schemaName}' created successfully for tenant ${tenantId}`);
            // Run tenant schema migrations
            await this.runTenantMigrations(schemaName);
        } catch (error) {
            this.logger.error(`Failed to create schema '${schemaName}': ${error.message}`);
            throw new _common.BadRequestException(`Failed to provision schema: ${error.message}`);
        }
    }
    /**
   * Deprovisions (drops) a schema for a B2B tenant.
   * WARNING: This will permanently delete all data in the schema.
   * @param schemaName - The name of the schema to drop
   */ async deprovisionSchema(schemaName) {
        this.validateSchemaName(schemaName);
        const exists = await this.schemaExists(schemaName);
        if (!exists) {
            this.logger.warn(`Schema '${schemaName}' does not exist, nothing to deprovision`);
            return;
        }
        try {
            // Drop schema with CASCADE to remove all dependent objects
            await this.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
            this.logger.log(`Schema '${schemaName}' dropped successfully`);
        } catch (error) {
            this.logger.error(`Failed to drop schema '${schemaName}': ${error.message}`);
            throw new _common.BadRequestException(`Failed to deprovision schema: ${error.message}`);
        }
    }
    /**
   * Checks if a schema exists in the database.
   * @param schemaName - The name of the schema to check
   * @returns true if the schema exists, false otherwise
   */ async schemaExists(schemaName) {
        this.validateSchemaName(schemaName);
        try {
            const result = await this.prisma.$queryRawUnsafe(`SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) as "exists"`, schemaName);
            return result[0]?.exists || false;
        } catch (error) {
            this.logger.error(`Failed to check schema existence: ${error.message}`);
            return false;
        }
    }
    /**
   * Lists all B2B tenant schemas in the database.
   * @returns Array of schema names matching the B2B pattern
   */ async listB2BSchemas() {
        try {
            const schemas = await this.prisma.$queryRawUnsafe(`SELECT schema_name FROM information_schema.schemata
         WHERE schema_name LIKE 'b2b_%'
         ORDER BY schema_name`);
            return schemas.map((s)=>s.schema_name);
        } catch (error) {
            this.logger.error(`Failed to list B2B schemas: ${error.message}`);
            return [];
        }
    }
    /**
   * Validates schema name against security rules.
   * @param schemaName - The schema name to validate
   * @throws BadRequestException if validation fails
   */ validateSchemaName(schemaName) {
        if (!schemaName || typeof schemaName !== 'string') {
            throw new _common.BadRequestException('Schema name is required');
        }
        if (schemaName.length > this.MAX_SCHEMA_NAME_LENGTH) {
            throw new _common.BadRequestException(`Schema name exceeds maximum length of ${this.MAX_SCHEMA_NAME_LENGTH}`);
        }
        if (!this.SCHEMA_NAME_REGEX.test(schemaName)) {
            throw new _common.BadRequestException('Schema name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores');
        }
        // Prevent SQL injection through schema name
        const dangerousKeywords = [
            'drop',
            'delete',
            'truncate',
            'alter',
            'create',
            'insert',
            'update',
            'grant',
            'revoke',
            'exec',
            'execute',
            'script'
        ];
        const lowerName = schemaName.toLowerCase();
        for (const keyword of dangerousKeywords){
            if (lowerName.includes(keyword)) {
                throw new _common.BadRequestException(`Schema name cannot contain dangerous keywords: ${keyword}`);
            }
        }
    }
    /**
   * Gets information about a specific schema.
   * @param schemaName - The name of the schema
   * @returns Schema information or null if not found
   */ async getSchemaInfo(schemaName) {
        this.validateSchemaName(schemaName);
        const exists = await this.schemaExists(schemaName);
        if (!exists) {
            return null;
        }
        try {
            const tables = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as "count" FROM information_schema.tables
         WHERE table_schema = $1 AND table_type = 'BASE TABLE'`, schemaName);
            return {
                name: schemaName,
                tableCount: Number(tables[0]?.count || 0),
                exists: true
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
   */ async runTenantMigrations(schemaName) {
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
                    DATABASE_URL: schemaUrl
                },
                cwd: process.cwd()
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
            throw new _common.BadRequestException(`Failed to run migrations for schema: ${error.message}`);
        }
    }
    /**
   * Creates initial data in the tenant schema (default delivery methods, etc.)
   *
   * @param schemaName - The name of the schema
   */ async seedTenantSchema(schemaName) {
        this.logger.log(`Seeding initial data for schema '${schemaName}'...`);
        try {
            // Get a Prisma client for the target schema
            // This would use B2BPrismaService but to avoid circular dependency,
            // we'll create a temporary client
            const { PrismaClient } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("@prisma/client")));
            const databaseUrl = process.env.DATABASE_URL;
            const schemaUrl = `${databaseUrl}?schema=${encodeURIComponent(schemaName)}`;
            const tenantPrisma = new PrismaClient({
                datasources: {
                    db: {
                        url: schemaUrl
                    }
                }
            });
            // Create default delivery methods
            const deliveryMethods = [
                {
                    name: 'Depo Teslim',
                    isActive: true,
                    displayOrder: 1
                },
                {
                    name: 'Kargo',
                    isActive: true,
                    displayOrder: 2
                },
                {
                    name: 'Ambar Teslim',
                    isActive: true,
                    displayOrder: 3
                }
            ];
            for (const method of deliveryMethods){
                await tenantPrisma.b2BDeliveryMethod.create({
                    data: method
                });
            }
            this.logger.log(`Seeded ${deliveryMethods.length} delivery methods for schema '${schemaName}'`);
            await tenantPrisma.$disconnect();
        } catch (error) {
            this.logger.error(`Failed to seed schema '${schemaName}': ${error.message}`);
            throw new _common.BadRequestException(`Failed to seed schema: ${error.message}`);
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(B2BSchemaProvisioningService.name);
        // Strict schema name validation: only lowercase letters, numbers, and underscores
        this.SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]*$/;
        this.MAX_SCHEMA_NAME_LENGTH = 63;
    }
};
B2BSchemaProvisioningService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2BSchemaProvisioningService);

//# sourceMappingURL=b2b-schema-provisioning.service.js.map