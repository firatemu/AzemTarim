import { Injectable, NotImplementedException, Logger } from '@nestjs/common';
import type { IErpAdapter } from './i-erp-adapter.interface';
import type {
  B2BOrderExportDto,
  ErpAccount,
  ErpAccountMovement,
  ErpAccountRisk,
  ErpProduct,
  ErpSalesperson,
  ErpStockItem,
  ErpWarehouse,
} from '../dto/erp-types.dto';

@Injectable()
export class MikroErpAdapter implements IErpAdapter {
  private readonly logger = new Logger(MikroErpAdapter.name);

  async testConnection(_config?: any): Promise<{
    success: boolean;
    message: string;
    details?: string;
  }> {
    try {
      // TODO: Implement actual Mikro connection test using firebird package
      // For now, return a placeholder response
      // The actual implementation would:
      // 1. Parse connection string (Firebird DB path, username, password)
      // 2. Connect to Mikro Firebird database
      // 3. Run a simple query like SELECT FIRST 1 * FROM ITEMS
      // 4. Return success/failure with 5 second timeout

      this.logger.warn('Mikro ERP connection test not fully implemented');
      return {
        success: false,
        message: 'Mikro ERP bağlantısı yapılandırılamadı.',
        details: 'Firebird sürücüsü ve bağlantı dizesi gereklidir.',
      };
    } catch (error) {
      this.logger.error(`Mikro connection test failed: ${error}`);
      return {
        success: false,
        message: 'Bağlantı başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }

  getProducts(): Promise<ErpProduct[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getStock(): Promise<ErpStockItem[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getAccount(): Promise<ErpAccount> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getAccounts(lastSyncedAt: Date | null): Promise<ErpAccount[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getPrices(_lastSyncedAt: Date | null): Promise<{ erpProductId: string; listPrice: number }[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getSalespersons(): Promise<ErpSalesperson[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getAccountMovements(_erpAccountId: string, _lastSyncedAt: Date | null): Promise<ErpAccountMovement[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getWarehouses(): Promise<ErpWarehouse[]> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  pushOrder(_order: B2BOrderExportDto): Promise<{ erpOrderId: string }> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
  getAccountRisk(_erpAccountId: string): Promise<ErpAccountRisk> {
    throw new NotImplementedException('Mikro ERP adapter is not implemented yet');
  }
}
