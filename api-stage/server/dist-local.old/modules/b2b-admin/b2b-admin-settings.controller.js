"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminSettingsController", {
    enumerable: true,
    get: function() {
        return B2bAdminSettingsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _updateb2btenantsyncdto = require("./dto/update-b2b-tenant-sync.dto");
const _b2bwarehouseconfigdto = require("./dto/b2b-warehouse-config.dto");
const _b2bschemaprovisioningservice = require("./services/b2b-schema-provisioning.service");
const _testconnectiondto = require("./dto/test-connection.dto");
const _b2badapterfactory = require("../b2b-sync/adapters/b2b-adapter.factory");
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
let B2bAdminSettingsController = class B2bAdminSettingsController {
    async getSettings() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        let config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        // Auto-create config if not exists (development mode)
        if (!config && process.env.NODE_ENV === 'development') {
            console.log(`[B2B Settings] Auto-creating config for tenant: ${tenantId}`);
            config = await this.prisma.b2BTenantConfig.create({
                data: {
                    tenantId,
                    schemaName: 'b2b',
                    domain: null,
                    erpAdapterType: 'OTOMUHASEBE',
                    erpConnectionString: null,
                    syncIntervalMinutes: 60,
                    orderApprovalMode: 'AUTO',
                    isActive: true
                }
            });
            console.log(`[B2B Settings] Created config: ${config.id}`);
        }
        let [license, domains, warehouseConfigs] = await Promise.all([
            this.prisma.b2BLicense.findUnique({
                where: {
                    tenantId
                }
            }),
            this.prisma.b2BDomain.findMany({
                where: {
                    tenantId
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }),
            this.prisma.b2BWarehouseConfig.findMany({
                where: {
                    tenantId
                },
                orderBy: {
                    warehouseName: 'asc'
                }
            })
        ]);
        // Auto-create license if not exists (development mode)
        if (!license && process.env.NODE_ENV === 'development') {
            console.log(`[B2B Settings] Auto-creating license for tenant: ${tenantId}`);
            license = await this.prisma.b2BLicense.create({
                data: {
                    tenantId,
                    isActive: true,
                    maxB2BCustomers: 1000,
                    expiresAt: new Date('2030-12-31')
                }
            });
            console.log(`[B2B Settings] Created license: ${license.id}`);
        }
        if (!config) {
            throw new _common.NotFoundException('B2B tenant configuration not found');
        }
        return {
            config: {
                id: config.id,
                schemaName: config.schemaName,
                domain: config.domain,
                erpAdapterType: config.erpAdapterType,
                erpConnectionString: config.erpConnectionString,
                lastSyncedAt: config.lastSyncedAt,
                syncIntervalMinutes: config.syncIntervalMinutes,
                orderApprovalMode: config.orderApprovalMode,
                isActive: config.isActive
            },
            license: license ? {
                isActive: license.isActive,
                maxB2BCustomers: license.maxB2BCustomers,
                expiresAt: license.expiresAt
            } : null,
            domains,
            warehouseConfigs
        };
    }
    async patchSync(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        const updated = await this.prisma.b2BTenantConfig.update({
            where: {
                tenantId
            },
            data: {
                ...dto.syncIntervalMinutes != null && {
                    syncIntervalMinutes: dto.syncIntervalMinutes
                },
                ...dto.orderApprovalMode != null && {
                    orderApprovalMode: dto.orderApprovalMode
                },
                ...dto.erpAdapterType != null && {
                    erpAdapterType: dto.erpAdapterType
                }
            }
        });
        return {
            syncIntervalMinutes: updated.syncIntervalMinutes,
            orderApprovalMode: updated.orderApprovalMode,
            erpAdapterType: updated.erpAdapterType
        };
    }
    async updateErpConnection(body) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        // Save connection details as JSON string
        const connectionData = {
            server: body.server,
            port: body.port,
            database: body.database,
            user: body.user,
            password: body.password,
            logoVersion: body.logoVersion,
            companyNo: body.companyNo,
            periodNo: body.periodNo
        };
        await this.prisma.b2BTenantConfig.update({
            where: {
                tenantId
            },
            data: {
                erpConnectionString: JSON.stringify(connectionData)
            }
        });
        return {
            success: true,
            message: 'Bağlantı ayarları kaydedildi'
        };
    }
    async testConnection(body) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) {
            return {
                success: false,
                message: 'B2B konfigürasyonu bulunamadı',
                details: 'Lütfen önce B2B modülünü aktif edin'
            };
        }
        try {
            const adapter = this.adapterFactory.create(body.erpAdapterType, tenantId);
            return await adapter.testConnection(body);
        } catch (error) {
            return {
                success: false,
                message: 'Bağlantı testi başlatılamadı',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            };
        }
    }
    async listWarehouses() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        return this.prisma.b2BWarehouseConfig.findMany({
            where: {
                tenantId
            },
            orderBy: {
                warehouseName: 'asc'
            }
        });
    }
    async patchWarehouse(warehouseId, dto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        const existing = await this.prisma.b2BWarehouseConfig.findUnique({
            where: {
                tenantId_warehouseId: {
                    tenantId,
                    warehouseId
                }
            }
        });
        if (existing) {
            return this.prisma.b2BWarehouseConfig.update({
                where: {
                    id: existing.id
                },
                data: {
                    ...dto.displayMode != null && {
                        displayMode: dto.displayMode
                    },
                    ...dto.isActive != null && {
                        isActive: dto.isActive
                    }
                }
            });
        }
        const wh = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                tenantId,
                active: true
            }
        });
        if (!wh) {
            throw new _common.NotFoundException('Warehouse not found for tenant');
        }
        return this.prisma.b2BWarehouseConfig.create({
            data: {
                tenantId,
                warehouseId,
                warehouseName: wh.name,
                displayMode: dto.displayMode ?? _client.B2BWarehouseDisplayMode.INDIVIDUAL,
                isActive: dto.isActive ?? true
            }
        });
    }
    async provisionSchema(body) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        await this.schemaProvisioning.provisionSchema(body.schemaName, tenantId);
        // Update config with new schema name
        await this.prisma.b2BTenantConfig.update({
            where: {
                tenantId
            },
            data: {
                schemaName: body.schemaName
            }
        });
        return {
            success: true,
            schemaName: body.schemaName,
            message: 'Schema provisioned successfully'
        };
    }
    async deprovisionSchema(body) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        await this.schemaProvisioning.deprovisionSchema(body.schemaName);
        return {
            success: true,
            schemaName: body.schemaName,
            message: 'Schema deprovisioned successfully'
        };
    }
    async listSchemas() {
        const schemas = await this.schemaProvisioning.listB2BSchemas();
        return {
            schemas
        };
    }
    async getSchemaInfo(schemaName) {
        const info = await this.schemaProvisioning.getSchemaInfo(schemaName);
        if (!info) {
            throw new _common.NotFoundException('Schema not found');
        }
        return info;
    }
    async seedSchema(schemaName) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Tenant not resolved');
        }
        await this.schemaProvisioning.seedTenantSchema(schemaName);
        return {
            success: true,
            schemaName,
            message: 'Schema seeded successfully'
        };
    }
    constructor(prisma, tenantResolver, schemaProvisioning, adapterFactory){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.schemaProvisioning = schemaProvisioning;
        this.adapterFactory = adapterFactory;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'B2B tenant ayarları, lisans, domain ve depo görünüm konfigürasyonu'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "getSettings", null);
_ts_decorate([
    (0, _common.Patch)('sync'),
    (0, _swagger.ApiOperation)({
        summary: 'Senkron aralığı ve sipariş onay modunu güncelle'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _updateb2btenantsyncdto.UpdateB2bTenantSyncDto === "undefined" ? Object : _updateb2btenantsyncdto.UpdateB2bTenantSyncDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "patchSync", null);
_ts_decorate([
    (0, _common.Patch)('erp-connection'),
    (0, _swagger.ApiOperation)({
        summary: 'ERP bağlantı bilgilerini kaydet'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _testconnectiondto.TestConnectionDto === "undefined" ? Object : _testconnectiondto.TestConnectionDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "updateErpConnection", null);
_ts_decorate([
    (0, _common.Post)('test-connection'),
    (0, _swagger.ApiOperation)({
        summary: 'ERP bağlantısını test et',
        description: 'OtoMuhasebe veya Logo ERP bağlantısını test eder'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _testconnectiondto.TestConnectionDto === "undefined" ? Object : _testconnectiondto.TestConnectionDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "testConnection", null);
_ts_decorate([
    (0, _common.Get)('warehouses'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B depo görünüm ayarları listesi'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "listWarehouses", null);
_ts_decorate([
    (0, _common.Patch)('warehouses/:warehouseId'),
    (0, _swagger.ApiOperation)({
        summary: 'Depo B2B görünüm modu / aktiflik'
    }),
    _ts_param(0, (0, _common.Param)('warehouseId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bwarehouseconfigdto.PatchB2bWarehouseConfigDto === "undefined" ? Object : _b2bwarehouseconfigdto.PatchB2bWarehouseConfigDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "patchWarehouse", null);
_ts_decorate([
    (0, _common.Post)('schema/provision'),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new B2B tenant schema',
        description: 'Provisions a new schema for the tenant. Schema name must start with lowercase letter and contain only lowercase letters, numbers, and underscores.'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "provisionSchema", null);
_ts_decorate([
    (0, _common.Post)('schema/deprovision'),
    (0, _swagger.ApiOperation)({
        summary: 'Drop a B2B tenant schema',
        description: 'WARNING: This will permanently delete all data in the schema. Use with caution.'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "deprovisionSchema", null);
_ts_decorate([
    (0, _common.Get)('schema/list'),
    (0, _swagger.ApiOperation)({
        summary: 'List all B2B tenant schemas',
        description: 'Returns a list of all B2B schemas in the database'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "listSchemas", null);
_ts_decorate([
    (0, _common.Get)('schema/:schemaName'),
    (0, _swagger.ApiOperation)({
        summary: 'Get schema information',
        description: 'Returns detailed information about a specific schema'
    }),
    _ts_param(0, (0, _common.Param)('schemaName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "getSchemaInfo", null);
_ts_decorate([
    (0, _common.Post)('schema/:schemaName/seed'),
    (0, _swagger.ApiOperation)({
        summary: 'Seed initial data for a B2B tenant schema',
        description: 'Creates default delivery methods and other initial data in the schema'
    }),
    _ts_param(0, (0, _common.Param)('schemaName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminSettingsController.prototype, "seedSchema", null);
B2bAdminSettingsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/settings'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _b2bschemaprovisioningservice.B2BSchemaProvisioningService === "undefined" ? Object : _b2bschemaprovisioningservice.B2BSchemaProvisioningService,
        typeof _b2badapterfactory.B2BAdapterFactory === "undefined" ? Object : _b2badapterfactory.B2BAdapterFactory
    ])
], B2bAdminSettingsController);

//# sourceMappingURL=b2b-admin-settings.controller.js.map