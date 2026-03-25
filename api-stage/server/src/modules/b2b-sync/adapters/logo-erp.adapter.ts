import { NotImplementedException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../../../common/prisma.service';
import type { IErpAdapter } from './i-erp-adapter.interface';
import type {
  B2BOrderExportDto,
  ErpAccount,
  ErpAccountMovement,
  ErpAccountRisk,
  ErpProduct,
  ErpStockItem,
  ErpWarehouse,
} from '../dto/erp-types.dto';

export class LogoErpAdapter implements IErpAdapter {
  private readonly logger = new Logger(LogoErpAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantId: string,
  ) { }

  private async getConfig() {
    const config = await this.prisma.b2BTenantConfig.findUnique({
      where: { tenantId: this.tenantId },
    });
    if (!config?.erpConnectionString) {
      throw new Error('Logo ERP ayarları bulunamadı.');
    }
    return JSON.parse(config.erpConnectionString);
  }

  private getCompanyStr(companyNo: string | number): string {
    return String(companyNo).padStart(3, '0');
  }

  private getPeriodStr(periodNo: string | number): string {
    return String(periodNo).padStart(2, '0');
  }

  private async getSqlConfig(config: any): Promise<sql.config> {
    return {
      user: config.user,
      password: config.password,
      server: config.server,
      port: config.port || 1433,
      database: config.database,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 10000,
      requestTimeout: 10000,
    };
  }

  async testConnection(config?: any): Promise<{ success: boolean; message: string; details?: string }> {
    if (!config || !config.server || !config.database || !config.user) {
      return {
        success: false,
        message: 'Eksik bağlantı bilgileri',
        details: 'Sunucu, veritabanı ve kullanıcı bilgileri gereklidir.',
      };
    }

    try {
      const sqlConfig = await this.getSqlConfig(config);
      this.logger.log(`Testing Logo connection to ${config.server}:${config.port || 1433}/${config.database}`);

      const pool = await sql.connect(sqlConfig);
      await pool.request().query('SELECT 1 as test');
      await pool.close();

      return {
        success: true,
        message: 'Logo (MSSQL) bağlantısı başarılı.',
        details: 'SQL Server üzerinden veritabanına erişim sağlandı.',
      };
    } catch (error) {
      this.logger.error(`Logo connection test failed: ${error}`);
      return {
        success: false,
        message: 'Bağlantı başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen SQL hatası',
      };
    }
  }

  async getProducts(lastSyncedAt: Date | null): Promise<ErpProduct[]> {
    const config = await this.getConfig();
    if (!config.companyNo) {
      throw new Error('Firma Numarası (companyNo) ayarlanmamış. Lütfen ayarlar sayfasından Firma Numarası girin.');
    }

    const tableName = `LG_${this.getCompanyStr(config.companyNo)}_ITEMS`;

    this.logger.log(`Fetching products from ${tableName}`);
    const sqlConfig = await this.getSqlConfig(config);
    const pool = await sql.connect(sqlConfig);

    try {
      const result = await pool.request().query(`
        SELECT TOP 10 LOGICALREF, CODE, NAME 
        FROM ${tableName}
        WHERE CARDTYPE = 1
      `);

      return result.recordset.map(row => ({
        erpProductId: String(row.LOGICALREF || row.CODE),
        stockCode: row.CODE,
        name: row.NAME || 'Bilinmeyen Ürün',
        listPrice: 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch products from ${tableName}:`, error);
      throw new Error(`Ürünler ERP'den alınamadı: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await pool.close();
    }
  }

  getStock(): Promise<ErpStockItem[]> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }
  getAccount(): Promise<ErpAccount> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }

  async getAccounts(lastSyncedAt: Date | null): Promise<ErpAccount[]> {
    const config = await this.getConfig();
    if (!config.companyNo) {
      throw new Error('Firma Numarası (companyNo) ayarlanmamış. Lütfen ayarlar sayfasından Firma Numarası girin.');
    }

    const tableName = `LG_${this.getCompanyStr(config.companyNo)}_CLCARD`;

    this.logger.log(`Fetching accounts from ${tableName}`);
    const sqlConfig = await this.getSqlConfig(config);
    const pool = await sql.connect(sqlConfig);

    try {
      // CARDTYPE <> 4 usually excludes 4=Grup Şirketi, but let's just fetch all or where it's a Customer (Alıcı/Satıcı: 1, 2, 3)
      // Logo'da 1: Alıcı, 2: Satıcı, 3: Alıcı+Satıcı, 4: Grup Şirketi
      const result = await pool.request().query(`
        SELECT LOGICALREF, CODE, DEFINITION_ 
        FROM ${tableName}
        WHERE CARDTYPE IN (1, 2, 3)
      `);

      return result.recordset.map(row => ({
        erpNum: Number(row.LOGICALREF),
        erpAccountId: String(row.CODE),
        name: row.DEFINITION_ || 'Bilinmeyen Cari',
        addresses: [],
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch accounts from ${tableName}:`, error);
      throw new Error(`Cariler ERP'den alınamadı: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await pool.close();
    }
  }
  getAccountMovements(): Promise<ErpAccountMovement[]> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }
  getWarehouses(): Promise<ErpWarehouse[]> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }
  pushOrder(_order: B2BOrderExportDto): Promise<{ erpOrderId: string }> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }
  getAccountRisk(): Promise<ErpAccountRisk> {
    throw new NotImplementedException('Logo ERP adapter is not implemented yet');
  }
}

