"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RolesService", {
    enumerable: true,
    get: function() {
        return RolesService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _permissionsservice = require("../permissions/permissions.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RolesService = class RolesService {
    async create(tenantId, dto) {
        // Check if role name exists in tenant
        const existing = await this.prisma.role.findUnique({
            where: {
                tenantId_name: {
                    tenantId,
                    name: dto.name
                }
            }
        });
        if (existing) {
            throw new _common.BadRequestException('Role with this name already exists in tenant');
        }
        // Prepare role permissions
        const permissionsData = dto.permissions?.map((permId)=>({
                permissionId: permId
            })) || [];
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                tenantId,
                permissions: {
                    create: permissionsData
                }
            },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                },
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.role.findMany({
            where: {
                tenantId
            },
            include: {
                _count: {
                    select: {
                        users: true
                    }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    async findOne(tenantId, id) {
        const role = await this.prisma.role.findUnique({
            where: {
                id
            },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        if (!role || role.tenantId !== tenantId) {
            throw new _common.NotFoundException('Role not found');
        }
        return role;
    }
    // Use standard UpdateRoleDto
    async update(tenantId, id, dto) {
        const role = await this.findOne(tenantId, id);
        if (role.isSystemRole) {
            // Allow updating description maybe? But strict enterprise rule says no.
            // Architecture says System Roles are immutable.
            throw new _common.BadRequestException('Cannot modify system roles');
        }
        // Transaction to update role and permissions
        const updatedRole = await this.prisma.$transaction(async (tx)=>{
            // 1. Update basic fields
            const updated = await tx.role.update({
                where: {
                    id
                },
                data: {
                    name: dto.name,
                    description: dto.description
                }
            });
            // 2. Update permissions if provided
            if (dto.permissions) {
                // Delete existing
                await tx.rolePermission.deleteMany({
                    where: {
                        roleId: id
                    }
                });
                // Create new
                if (dto.permissions.length > 0) {
                    await tx.rolePermission.createMany({
                        data: dto.permissions.map((permId)=>({
                                roleId: id,
                                permissionId: permId
                            }))
                    });
                }
            }
            return updated;
        });
        // 3. Invalidate Cache
        await this.permissionsService.invalidateRoleCache(id);
        return this.findOne(tenantId, id);
    }
    async remove(tenantId, id) {
        const role = await this.findOne(tenantId, id); // Checks existence and tenant
        if (role.isSystemRole) {
            throw new _common.BadRequestException('Cannot delete system roles');
        }
        const userCount = await this.prisma.user.count({
            where: {
                roleId: id
            }
        });
        if (userCount > 0) {
            throw new _common.BadRequestException(`Cannot delete role assigned to ${userCount} users`);
        }
        await this.prisma.role.delete({
            where: {
                id
            }
        });
        return {
            success: true
        };
    }
    async getAllPermissions() {
        return this.prisma.permission.findMany({
            orderBy: [
                {
                    module: 'asc'
                },
                {
                    action: 'asc'
                }
            ]
        });
    }
    constructor(prisma, permissionsService, tenantResolver){
        this.prisma = prisma;
        this.permissionsService = permissionsService;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(RolesService.name);
    }
};
RolesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _permissionsservice.PermissionsService === "undefined" ? Object : _permissionsservice.PermissionsService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], RolesService);

//# sourceMappingURL=roles.service.js.map