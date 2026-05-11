"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantPurgeService", {
    enumerable: true,
    get: function() {
        return TenantPurgeService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let TenantPurgeService = class TenantPurgeService {
    async purgeTenantData(params) {
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: params.tenantId
            }
        });
        if (!tenant) {
            throw new Error('Tenant not found');
        }
        if (tenant.status === 'ACTIVE' || tenant.status === 'TRIAL') {
            throw new _common.ForbiddenException('Cannot purge active tenant. Cancel subscription first.');
        }
        if (tenant.status === 'PURGED') {
            throw new _common.ForbiddenException('Tenant already purged');
        }
        this.logger.warn(`⚠️ Starting tenant purge: ${params.tenantId} by ${params.adminEmail}`);
        // 1. Delete all files from storage
        const result = await this.storage.purgeTenantData(params.tenantId);
        // 2. Update tenant status
        await this.prisma.tenant.update({
            where: {
                id: params.tenantId
            },
            data: {
                status: 'PURGED',
                purgedAt: new Date()
            }
        });
        // 3. Create audit log
        await this.prisma.tenantPurgeAudit.create({
            data: {
                tenantId: params.tenantId,
                adminId: params.adminId,
                adminEmail: params.adminEmail,
                ipAddress: params.ipAddress,
                deletedFiles: result.deletedCount,
                errors: result.errors.length > 0 ? result.errors : undefined
            }
        });
        this.logger.warn(`💥 Tenant ${params.tenantId} purged: ${result.deletedCount} files deleted`);
        if (result.errors.length > 0) {
            this.logger.error(`Errors during purge: ${JSON.stringify(result.errors)}`);
        }
    }
    async listPurgeableTenants() {
        return this.prisma.tenant.findMany({
            where: {
                status: {
                    in: [
                        'CANCELLED',
                        'SUSPENDED',
                        'EXPIRED'
                    ]
                }
            },
            select: {
                id: true,
                uuid: true,
                name: true,
                subdomain: true,
                status: true,
                cancelledAt: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                cancelledAt: 'asc'
            }
        });
    }
    async getPurgeAuditLog(tenantId) {
        return this.prisma.tenantPurgeAudit.findMany({
            where: tenantId ? {
                tenantId
            } : undefined,
            include: {
                tenant: {
                    select: {
                        name: true,
                        subdomain: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });
    }
    constructor(prisma, storage, tenantResolver){
        this.prisma = prisma;
        this.storage = storage;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(TenantPurgeService.name);
    }
};
TenantPurgeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _common.Inject)('STORAGE_SERVICE')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof IStorageService === "undefined" ? Object : IStorageService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], TenantPurgeService);

//# sourceMappingURL=tenant-purge.service.js.map