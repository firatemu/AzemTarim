"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SystemParameterService", {
    enumerable: true,
    get: function() {
        return SystemParameterService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SystemParameterService = class SystemParameterService {
    /**
   * Parametre değerini getir (varsayılan değer ile birlikte)
   */ async getParameter(key, defaultValue) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            const parameter = await this.prisma.systemParameter.findFirst({
                where: {
                    key,
                    tenantId: null
                }
            });
            if (!parameter) {
                return defaultValue;
            }
            return parameter.value;
        }
        const parameter = await this.prisma.systemParameter.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key
                }
            }
        });
        if (!parameter) {
            // Fallback to global parameter
            const globalParameter = await this.prisma.systemParameter.findFirst({
                where: {
                    key,
                    tenantId: null
                }
            });
            if (globalParameter) {
                return globalParameter.value;
            }
            return defaultValue;
        }
        return parameter.value;
    }
    /**
   * Parametre değerini boolean olarak getir
   */ async getParameterAsBoolean(key, defaultValue = false) {
        const value = await this.getParameter(key, defaultValue);
        return value === true || value === 'true' || value === 1;
    }
    /**
   * Parametre değerini ayarla (yoksa oluştur, varsa güncelle)
   */ async setParameter(key, value, description, category) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // tenantId null ise findFirst kullan, yoksa unique constraint kullan
        if (!tenantId) {
            const existing = await this.prisma.systemParameter.findFirst({
                where: {
                    key,
                    tenantId: null
                }
            });
            if (existing) {
                await this.prisma.systemParameter.update({
                    where: {
                        id: existing.id
                    },
                    data: {
                        value,
                        description,
                        category
                    }
                });
            } else {
                await this.prisma.systemParameter.create({
                    data: {
                        key,
                        value,
                        description,
                        category
                    }
                });
            }
            return;
        }
        // tenantId varsa normal upsert kullan
        await this.prisma.systemParameter.upsert({
            where: {
                tenantId_key: {
                    tenantId,
                    key
                }
            },
            update: {
                value,
                description,
                category
            },
            create: {
                tenantId,
                key,
                value,
                description,
                category
            }
        });
    }
    /**
   * Tüm parametreleri getir
   */ async getAllParameters() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // tenantId null ise tenantId null olan parametreleri getir
        if (!tenantId) {
            const parameters = await this.prisma.systemParameter.findMany({
                where: {
                    tenantId: null
                },
                orderBy: [
                    {
                        category: 'asc'
                    },
                    {
                        key: 'asc'
                    }
                ]
            });
            return parameters.map((p)=>({
                    id: p.id,
                    key: p.key,
                    value: p.value,
                    description: p.description,
                    category: p.category,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt
                }));
        }
        // tenantId varsa tenant-scoped parametreleri getir
        const parameters = await this.prisma.systemParameter.findMany({
            where: {
                tenantId
            },
            orderBy: [
                {
                    category: 'asc'
                },
                {
                    key: 'asc'
                }
            ]
        });
        return parameters.map((p)=>({
                id: p.id,
                key: p.key,
                value: p.value,
                description: p.description,
                category: p.category,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }));
    }
    /**
   * Kategoriye göre parametreleri getir
   */ async getParametersByCategory(category) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // tenantId null ise tenantId null olan parametreleri getir
        if (!tenantId) {
            const parameters = await this.prisma.systemParameter.findMany({
                where: {
                    tenantId: null,
                    category
                },
                orderBy: {
                    key: 'asc'
                }
            });
            return parameters.map((p)=>({
                    id: p.id,
                    key: p.key,
                    value: p.value,
                    description: p.description,
                    category: p.category,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt
                }));
        }
        // tenantId varsa tenant-scoped parametreleri getir
        const parameters = await this.prisma.systemParameter.findMany({
            where: {
                tenantId,
                category
            },
            orderBy: {
                key: 'asc'
            }
        });
        return parameters.map((p)=>({
                id: p.id,
                key: p.key,
                value: p.value,
                description: p.description,
                category: p.category,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }));
    }
    /**
   * Parametre oluştur
   */ async create(createParameterDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const parameter = await this.prisma.systemParameter.create({
            data: {
                ...tenantId && {
                    tenantId
                },
                key: createParameterDto.key,
                value: createParameterDto.value,
                description: createParameterDto.description,
                category: createParameterDto.category
            }
        });
        return {
            id: parameter.id,
            key: parameter.key,
            value: parameter.value,
            description: parameter.description,
            category: parameter.category,
            createdAt: parameter.createdAt,
            updatedAt: parameter.updatedAt
        };
    }
    /**
   * Parametre güncelle
   */ async update(key, updateParameterDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // tenantId null ise findFirst kullan, yoksa unique constraint kullan
        if (!tenantId) {
            const existing = await this.prisma.systemParameter.findFirst({
                where: {
                    key,
                    tenantId: null
                }
            });
            if (existing) {
                const updated = await this.prisma.systemParameter.update({
                    where: {
                        id: existing.id
                    },
                    data: {
                        ...updateParameterDto.value !== undefined ? {
                            value: updateParameterDto.value
                        } : {},
                        ...updateParameterDto.description !== undefined ? {
                            description: updateParameterDto.description
                        } : {},
                        ...updateParameterDto.category !== undefined ? {
                            category: updateParameterDto.category
                        } : {}
                    }
                });
                return {
                    id: updated.id,
                    key: updated.key,
                    value: updated.value,
                    description: updated.description,
                    category: updated.category,
                    createdAt: updated.createdAt,
                    updatedAt: updated.updatedAt
                };
            } else {
                const created = await this.prisma.systemParameter.create({
                    data: {
                        key,
                        value: updateParameterDto.value ?? false,
                        description: updateParameterDto.description,
                        category: updateParameterDto.category
                    }
                });
                return {
                    id: created.id,
                    key: created.key,
                    value: created.value,
                    description: created.description,
                    category: created.category,
                    createdAt: created.createdAt,
                    updatedAt: created.updatedAt
                };
            }
        }
        // tenantId varsa normal upsert kullan
        const updated = await this.prisma.systemParameter.upsert({
            where: {
                tenantId_key: {
                    tenantId,
                    key
                }
            },
            update: {
                ...updateParameterDto.value !== undefined ? {
                    value: updateParameterDto.value
                } : {},
                ...updateParameterDto.description !== undefined ? {
                    description: updateParameterDto.description
                } : {},
                ...updateParameterDto.category !== undefined ? {
                    category: updateParameterDto.category
                } : {}
            },
            create: {
                tenantId,
                key,
                value: updateParameterDto.value ?? false,
                description: updateParameterDto.description,
                category: updateParameterDto.category
            }
        });
        return {
            id: updated.id,
            key: updated.key,
            value: updated.value,
            description: updated.description,
            category: updated.category,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        };
    }
    /**
   * Parametre sil
   */ async remove(key) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // tenantId null ise findFirst kullan, yoksa unique constraint kullan
        if (!tenantId) {
            const parameter = await this.prisma.systemParameter.findFirst({
                where: {
                    key,
                    tenantId: null
                }
            });
            if (!parameter) {
                throw new _common.NotFoundException(`Parameter not found: ${key}`);
            }
            await this.prisma.systemParameter.delete({
                where: {
                    id: parameter.id
                }
            });
            return;
        }
        // tenantId varsa normal findUnique kullan
        const parameter = await this.prisma.systemParameter.findUnique({
            where: {
                tenantId_key: {
                    tenantId,
                    key
                }
            }
        });
        if (!parameter) {
            throw new _common.NotFoundException(`Parameter not found: ${key}`);
        }
        await this.prisma.systemParameter.delete({
            where: {
                id: parameter.id
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SystemParameterService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SystemParameterService);

//# sourceMappingURL=system-parameter.service.js.map