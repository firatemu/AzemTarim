"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BPrismaService", {
    enumerable: true,
    get: function() {
        return B2BPrismaService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2BPrismaService = class B2BPrismaService {
    /**
   * Initialize the service by warming up the main client.
   */ async onModuleInit() {
        try {
            // Warm up the main/public client
            this.logger.log('Initializing B2B Prisma service...');
            this.getMainClient();
            this.logger.log('B2B Prisma service initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize B2B Prisma service', error);
            throw error;
        }
    }
    /**
   * Cleanup all client connections on shutdown.
   */ async onModuleDestroy() {
        this.logger.log('Shutting down B2B Prisma service...');
        await this.closeAll();
        this.logger.log('B2B Prisma service shut down successfully');
    }
    /**
   * Get a Prisma client for the specified schema name.
   * Returns cached client if available, otherwise creates a new one.
   *
   * @param schemaName - The schema name to connect to (e.g., 'b2b_tenant_123')
   * @returns Prisma client connected to the specified schema
   * @throws BadRequestException if schema name is invalid
   */ getClient(schemaName) {
        // Validate schema name
        this.validateSchemaName(schemaName);
        // Check cache first
        if (this.clients.has(schemaName)) {
            // Move to end of Map to mark as recently used (for LRU)
            const client = this.clients.get(schemaName);
            this.clients.delete(schemaName);
            this.clients.set(schemaName, client);
            return client;
        }
        // Create new client with schema-specific connection
        const schemaUrl = `${this.databaseUrl}?schema=${encodeURIComponent(schemaName)}`;
        const client = new _client.PrismaClient({
            datasources: {
                db: {
                    url: schemaUrl
                }
            },
            // Disable logging in production for performance
            log: process.env.NODE_ENV === 'development' ? [
                'query',
                'error',
                'warn'
            ] : [
                'error'
            ]
        });
        // Apply LRU eviction if pool is full
        if (this.clients.size >= this.MAX_POOL_SIZE) {
            const firstKey = this.clients.keys().next().value;
            const removedClient = this.clients.get(firstKey);
            if (removedClient) {
                removedClient.$disconnect().catch((err)=>{
                    this.logger.warn(`Error disconnecting client for schema ${firstKey}: ${err.message}`);
                });
                this.clients.delete(firstKey);
                this.logger.debug(`Evicted schema ${firstKey} from connection pool`);
            }
        }
        this.clients.set(schemaName, client);
        this.logPoolSize();
        return client;
    }
    /**
   * Get the main/public schema client.
   * Convenience method for getClient('public').
   */ getMainClient() {
        return this.getClient('public');
    }
    /**
   * Close all client connections and clear the pool.
   */ async closeAll() {
        const disconnectPromises = [];
        this.clients.forEach((client, schemaName)=>{
            disconnectPromises.push(client.$disconnect().catch((err)=>{
                this.logger.warn(`Error disconnecting client for schema ${schemaName}: ${err.message}`);
            }));
        });
        await Promise.all(disconnectPromises);
        this.clients.clear();
        this.logger.debug('All Prisma client connections closed');
    }
    /**
   * Get current pool statistics.
   */ getPoolStats() {
        return {
            size: this.clients.size,
            maxSize: this.MAX_POOL_SIZE,
            schemas: Array.from(this.clients.keys())
        };
    }
    /**
   * Check if a schema has an active client connection.
   */ hasClient(schemaName) {
        return this.clients.has(schemaName);
    }
    /**
   * Remove a client from the pool (disconnects it).
   * Useful for schema deprovisioning.
   */ async removeClient(schemaName) {
        const client = this.clients.get(schemaName);
        if (client) {
            await client.$disconnect();
            this.clients.delete(schemaName);
            this.logger.debug(`Removed client for schema ${schemaName}`);
        }
    }
    /**
   * Validate schema name for security.
   * @throws BadRequestException if validation fails
   */ validateSchemaName(schemaName) {
        if (!schemaName || typeof schemaName !== 'string') {
            throw new _common.BadRequestException('Schema name is required');
        }
        if (!this.SCHEMA_NAME_REGEX.test(schemaName)) {
            throw new _common.BadRequestException('Schema name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores');
        }
        if (schemaName.length > 63) {
            throw new _common.BadRequestException('Schema name cannot exceed 63 characters');
        }
    }
    /**
   * Log pool size at regular intervals for monitoring.
   */ logPoolSize() {
        this.requestCount++;
        if (this.requestCount % 100 === 0) {
            const stats = this.getPoolStats();
            this.logger.log(`Prisma client pool: ${stats.size}/${stats.maxSize} schemas | ` + `Active schemas: ${stats.schemas.slice(0, 5).join(', ')}${stats.schemas.length > 5 ? '...' : ''}`);
        }
    }
    /**
   * Execute a callback with a transaction on the specified schema.
   * Provides automatic client management and error handling.
   *
   * @param schemaName - The schema to use
   * @param callback - Function to execute within transaction context
   * @returns Result of the callback
   */ async withTransaction(schemaName, callback) {
        const prisma = this.getClient(schemaName);
        return prisma.$transaction(callback);
    }
    /**
   * Health check for all active connections.
   * Returns status of each pooled client.
   */ async healthCheck() {
        const results = await Promise.allSettled(Array.from(this.clients.entries()).map(async ([schemaName, client])=>{
            try {
                await client.$queryRaw`SELECT 1`;
                return {
                    schema: schemaName,
                    healthy: true
                };
            } catch (error) {
                return {
                    schema: schemaName,
                    healthy: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }));
        const details = results.map((result)=>result.status === 'fulfilled' ? result.value : {
                schema: 'unknown',
                healthy: false,
                error: 'Promise rejected'
            });
        const healthy = details.filter((d)=>d.healthy).length;
        const unhealthy = details.length - healthy;
        return {
            healthy,
            unhealthy,
            details
        };
    }
    constructor(config){
        this.config = config;
        this.logger = new _common.Logger(B2BPrismaService.name);
        this.clients = new Map();
        this.MAX_POOL_SIZE = 50;
        this.requestCount = 0;
        // Schema name validation - only lowercase letters, numbers, and underscores
        this.SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]*$/;
        this.databaseUrl = this.config.get('DATABASE_URL') || '';
        if (!this.databaseUrl) {
            throw new Error('DATABASE_URL is not configured');
        }
    }
};
B2BPrismaService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], B2BPrismaService);

//# sourceMappingURL=b2b-prisma.service.js.map