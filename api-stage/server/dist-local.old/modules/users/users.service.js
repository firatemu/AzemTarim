"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UsersService = class UsersService {
    async findAll(search, limit = 100, page = 1, role) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (search) {
            where.OR = [
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    fullName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    username: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (role) {
            where.role = role;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    fullName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.user.count({
                where
            })
        ]);
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                tenant: {
                    include: {
                        subscription: true
                    }
                }
            }
        });
        if (!user) {
            throw new _common.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!user) {
            throw new _common.NotFoundException(`User with ID ${id} not found`);
        }
        // Kullanıcıyı sil
        // Not: Prisma cascade ayarlarına göre ilgili kayıtlar otomatik silinir
        await this.prisma.user.delete({
            where: {
                id
            }
        });
    }
    async suspend(id) {
        // Kullanıcıyı kontrol et
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!user) {
            throw new _common.NotFoundException(`User with ID ${id} not found`);
        }
        // Kullanıcının aktif statusunu tersine çevir
        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                isActive: !user.isActive
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        });
        return updatedUser;
    }
    async updateRole(userId, newRole) {
        // Validate user exists
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new _common.NotFoundException(`User with ID ${userId} not found`);
        }
        // Update role
        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role: newRole
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        });
        return updatedUser;
    }
    async getStats() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const whereClause = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        // Get total counts
        const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
            this.prisma.user.count({
                where: whereClause
            }),
            this.prisma.user.count({
                where: {
                    ...whereClause,
                    isActive: true
                }
            }),
            this.prisma.user.count({
                where: {
                    ...whereClause,
                    isActive: false
                }
            })
        ]);
        // Get counts by role
        const roleStats = await this.prisma.user.groupBy({
            by: [
                'role'
            ],
            where: whereClause,
            _count: {
                id: true
            }
        });
        const byRole = roleStats.reduce((acc, stat)=>{
            acc[stat.role] = stat._count.id;
            return acc;
        }, {});
        return {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            byRole
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map