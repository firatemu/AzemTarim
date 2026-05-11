"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PermissionsService", {
    enumerable: true,
    get: function() {
        return PermissionsService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _redisservice = require("../../common/services/redis.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PermissionsService = class PermissionsService {
    /**
     * Checks if a user has a specific permission.
     * Caches the result in Redis.
     */ async hasPermission(userId, permissionModule, permissionAction) {
        // 1. Check Cache
        const cachedPermsStr = await this.redis.getForTenant('user_perms', userId);
        if (cachedPermsStr) {
            const cachedPerms = JSON.parse(cachedPermsStr);
            if (cachedPerms.includes('ALL')) return true; // SuperAdmin bypass
            return cachedPerms.includes(`${permissionModule}.${permissionAction}`);
        }
        // 2. Fetch from DB if not in cache
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                roleRelation: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) return false;
        // 3. Process Permissions
        let permissions = [];
        // SuperAdmin Bypass (Legacy check + New Role check)
        if (user.role === 'SUPER_ADMIN' || user.roleRelation?.isSystemRole && user.roleRelation?.name === 'Yönetici') {
            permissions = [
                'ALL'
            ];
        } else if (user.roleRelation) {
            permissions = user.roleRelation.permissions.map((rp)=>`${rp.permission.module}.${rp.permission.action}`);
        }
        // 4. Cache Results
        await this.redis.setForTenant('user_perms', JSON.stringify(permissions), this.CACHE_TTL_SECONDS, userId);
        // 5. Return Check Result
        if (permissions.includes('ALL')) return true;
        return permissions.includes(`${permissionModule}.${permissionAction}`);
    }
    /**
     * Invalidates the permission cache for a specific user.
     */ async invalidateUserCache(userId) {
        await this.redis.delForTenant('user_perms', userId);
        this.logger.log(`Permission cache invalidated for user ${userId}`);
    }
    /**
     * Invalidates cache for all users with a specific role.
     * Use this when updating a role's permissions.
     */ async invalidateRoleCache(roleId) {
        const users = await this.prisma.user.findMany({
            where: {
                roleId
            },
            select: {
                id: true
            }
        });
        for (const user of users){
            await this.invalidateUserCache(user.id);
        }
        this.logger.log(`Permission cache invalidated for role ${roleId} (${users.length} users)`);
    }
    constructor(prisma, redis, tenantResolver){
        this.prisma = prisma;
        this.redis = redis;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(PermissionsService.name);
        this.CACHE_TTL_SECONDS = 900; // 15 minutes
    }
};
PermissionsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PermissionsService);

//# sourceMappingURL=permissions.service.js.map