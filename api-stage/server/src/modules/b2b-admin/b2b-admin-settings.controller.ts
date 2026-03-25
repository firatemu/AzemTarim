import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BWarehouseDisplayMode, B2BErpAdapter } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { UpdateB2bTenantSyncDto } from './dto/update-b2b-tenant-sync.dto';
import { PatchB2bWarehouseConfigDto } from './dto/b2b-warehouse-config.dto';
import { B2BSchemaProvisioningService } from './services/b2b-schema-provisioning.service';
import { TestConnectionDto } from './dto/test-connection.dto';
import { B2BAdapterFactory } from '../b2b-sync/adapters/b2b-adapter.factory';

@ApiTags('B2B Admin')
@Controller('b2b-admin/settings')
@UseGuards(JwtAuthGuard, B2BLicenseGuard)
export class B2bAdminSettingsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantResolver: TenantResolverService,
    private readonly schemaProvisioning: B2BSchemaProvisioningService,
    private readonly adapterFactory: B2BAdapterFactory,
  ) { }

  @Get()
  @ApiOperation({
    summary: 'B2B tenant ayarları, lisans, domain ve depo görünüm konfigürasyonu',
  })
  async getSettings() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    let config = await this.prisma.b2BTenantConfig.findUnique({ where: { tenantId } });

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
          isActive: true,
        }
      });
      console.log(`[B2B Settings] Created config: ${config.id}`);
    }

    let [license, domains, warehouseConfigs] = await Promise.all([
      this.prisma.b2BLicense.findUnique({ where: { tenantId } }),
      this.prisma.b2BDomain.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.b2BWarehouseConfig.findMany({
        where: { tenantId },
        orderBy: { warehouseName: 'asc' },
      }),
    ]);

    // Auto-create license if not exists (development mode)
    if (!license && process.env.NODE_ENV === 'development') {
      console.log(`[B2B Settings] Auto-creating license for tenant: ${tenantId}`);
      license = await this.prisma.b2BLicense.create({
        data: {
          tenantId,
          isActive: true,
          maxB2BCustomers: 1000,
          expiresAt: new Date('2030-12-31'),
        }
      });
      console.log(`[B2B Settings] Created license: ${license.id}`);
    }

    if (!config) {
      throw new NotFoundException('B2B tenant configuration not found');
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
        isActive: config.isActive,
      },
      license: license
        ? {
          isActive: license.isActive,
          maxB2BCustomers: license.maxB2BCustomers,
          expiresAt: license.expiresAt,
        }
        : null,
      domains,
      warehouseConfigs,
    };
  }

  @Patch('sync')
  @ApiOperation({ summary: 'Senkron aralığı ve sipariş onay modunu güncelle' })
  async patchSync(@Body() dto: UpdateB2bTenantSyncDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    const updated = await this.prisma.b2BTenantConfig.update({
      where: { tenantId },
      data: {
        ...(dto.syncIntervalMinutes != null && {
          syncIntervalMinutes: dto.syncIntervalMinutes,
        }),
        ...(dto.orderApprovalMode != null && {
          orderApprovalMode: dto.orderApprovalMode,
        }),
        ...(dto.erpAdapterType != null && {
          erpAdapterType: dto.erpAdapterType,
        }),
      },
    });

    return {
      syncIntervalMinutes: updated.syncIntervalMinutes,
      orderApprovalMode: updated.orderApprovalMode,
      erpAdapterType: updated.erpAdapterType,
    };
  }

  @Patch('erp-connection')
  @ApiOperation({ summary: 'ERP bağlantı bilgilerini kaydet' })
  async updateErpConnection(@Body() body: TestConnectionDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
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
      periodNo: body.periodNo,
    };

    await this.prisma.b2BTenantConfig.update({
      where: { tenantId },
      data: {
        erpConnectionString: JSON.stringify(connectionData),
      },
    });

    return { success: true, message: 'Bağlantı ayarları kaydedildi' };
  }

  @Post('test-connection')
  @ApiOperation({
    summary: 'ERP bağlantısını test et',
    description: 'OtoMuhasebe veya Logo ERP bağlantısını test eder'
  })
  async testConnection(@Body() body: TestConnectionDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    const config = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      return {
        success: false,
        message: 'B2B konfigürasyonu bulunamadı',
        details: 'Lütfen önce B2B modülünü aktif edin',
      };
    }

    try {
      const adapter = this.adapterFactory.create(body.erpAdapterType as B2BErpAdapter, tenantId);
      return await adapter.testConnection(body);
    } catch (error) {
      return {
        success: false,
        message: 'Bağlantı testi başlatılamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'B2B depo görünüm ayarları listesi' })
  async listWarehouses() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }
    return this.prisma.b2BWarehouseConfig.findMany({
      where: { tenantId },
      orderBy: { warehouseName: 'asc' },
    });
  }

  @Patch('warehouses/:warehouseId')
  @ApiOperation({ summary: 'Depo B2B görünüm modu / aktiflik' })
  async patchWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Body() dto: PatchB2bWarehouseConfigDto,
  ) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    const existing = await this.prisma.b2BWarehouseConfig.findUnique({
      where: {
        tenantId_warehouseId: { tenantId, warehouseId },
      },
    });

    if (existing) {
      return this.prisma.b2BWarehouseConfig.update({
        where: { id: existing.id },
        data: {
          ...(dto.displayMode != null && { displayMode: dto.displayMode }),
          ...(dto.isActive != null && { isActive: dto.isActive }),
        },
      });
    }

    const wh = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, tenantId, active: true },
    });
    if (!wh) {
      throw new NotFoundException('Warehouse not found for tenant');
    }

    return this.prisma.b2BWarehouseConfig.create({
      data: {
        tenantId,
        warehouseId,
        warehouseName: wh.name,
        displayMode:
          dto.displayMode ?? B2BWarehouseDisplayMode.INDIVIDUAL,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Post('schema/provision')
  @ApiOperation({
    summary: 'Create a new B2B tenant schema',
    description: 'Provisions a new schema for the tenant. Schema name must start with lowercase letter and contain only lowercase letters, numbers, and underscores.'
  })
  async provisionSchema(@Body() body: { schemaName: string }) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    await this.schemaProvisioning.provisionSchema(body.schemaName, tenantId);

    // Update config with new schema name
    await this.prisma.b2BTenantConfig.update({
      where: { tenantId },
      data: { schemaName: body.schemaName },
    });

    return {
      success: true,
      schemaName: body.schemaName,
      message: 'Schema provisioned successfully',
    };
  }

  @Post('schema/deprovision')
  @ApiOperation({
    summary: 'Drop a B2B tenant schema',
    description: 'WARNING: This will permanently delete all data in the schema. Use with caution.'
  })
  async deprovisionSchema(@Body() body: { schemaName: string }) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    await this.schemaProvisioning.deprovisionSchema(body.schemaName);

    return {
      success: true,
      schemaName: body.schemaName,
      message: 'Schema deprovisioned successfully',
    };
  }

  @Get('schema/list')
  @ApiOperation({
    summary: 'List all B2B tenant schemas',
    description: 'Returns a list of all B2B schemas in the database'
  })
  async listSchemas() {
    const schemas = await this.schemaProvisioning.listB2BSchemas();
    return { schemas };
  }

  @Get('schema/:schemaName')
  @ApiOperation({
    summary: 'Get schema information',
    description: 'Returns detailed information about a specific schema'
  })
  async getSchemaInfo(@Param('schemaName') schemaName: string) {
    const info = await this.schemaProvisioning.getSchemaInfo(schemaName);
    if (!info) {
      throw new NotFoundException('Schema not found');
    }
    return info;
  }

  @Post('schema/:schemaName/seed')
  @ApiOperation({
    summary: 'Seed initial data for a B2B tenant schema',
    description: 'Creates default delivery methods and other initial data in the schema'
  })
  async seedSchema(@Param('schemaName') schemaName: string) {
    const tenantId = await this.tenantResolver.resolveForCreate();
    if (!tenantId) {
      throw new NotFoundException('Tenant not resolved');
    }

    await this.schemaProvisioning.seedTenantSchema(schemaName);

    return {
      success: true,
      schemaName,
      message: 'Schema seeded successfully',
    };
  }
}
