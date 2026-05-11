"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bTenantSchemaBridgeService", {
    enumerable: true,
    get: function() {
        return B2bTenantSchemaBridgeService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _b2bprismaservice = require("../../../common/services/b2b-prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bTenantSchemaBridgeService = class B2bTenantSchemaBridgeService {
    /**
   * Get the declared schema name for a tenant.
   * Returns null if tenant is not using schema isolation.
   */ async getDeclaredSchemaName(tenantId) {
        const cfg = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            },
            select: {
                schemaName: true,
                isActive: true
            }
        });
        if (!cfg?.isActive) {
            return null;
        }
        return cfg.schemaName || null;
    }
    /**
   * Get the appropriate Prisma client for a tenant.
   * Returns dynamic schema client if schemaName is declared, otherwise main client.
   */ async getClient(tenantId) {
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
   */ async withClient(tenantId, callback) {
        const prisma = await this.getClient(tenantId);
        return callback(prisma);
    }
    /**
   * Log schema usage for debugging.
   */ logSchemaHint(tenantId, schemaName) {
        if (schemaName) {
            this.log.verbose(`B2B tenant ${tenantId} using isolated schema '${schemaName}'`);
        } else {
            this.log.verbose(`B2B tenant ${tenantId} using main schema (legacy mode)`);
        }
    }
    /**
   * Check if a tenant is using schema isolation.
   */ async isIsolated(tenantId) {
        const schemaName = await this.getDeclaredSchemaName(tenantId);
        return !!schemaName;
    }
    constructor(prisma, b2bPrisma){
        this.prisma = prisma;
        this.b2bPrisma = b2bPrisma;
        this.log = new _common.Logger(B2bTenantSchemaBridgeService.name);
    }
};
B2bTenantSchemaBridgeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bprismaservice.B2BPrismaService === "undefined" ? Object : _b2bprismaservice.B2BPrismaService
    ])
], B2bTenantSchemaBridgeService);

//# sourceMappingURL=b2b-tenant-schema-bridge.service.js.map