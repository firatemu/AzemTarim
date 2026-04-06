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

export interface IErpAdapter {
  getProducts(lastSyncedAt: Date | null): Promise<ErpProduct[]>;
  getPrices(lastSyncedAt: Date | null): Promise<{ erpProductId: string, listPrice: number }[]>;
  getStock(productIds: string[], lastSyncedAt?: Date | null): Promise<ErpStockItem[]>;
  getAccount(erpAccountId: string): Promise<ErpAccount>;
  getAccounts(lastSyncedAt: Date | null): Promise<ErpAccount[]>;
  getAccountMovements(
    erpAccountId: string,
    lastSyncedAt: Date | null,
  ): Promise<ErpAccountMovement[]>;
  getSalespersons(): Promise<ErpSalesperson[]>;
  getWarehouses(): Promise<ErpWarehouse[]>;
  pushOrder(order: B2BOrderExportDto): Promise<{ erpOrderId: string }>;
  getAccountRisk(erpAccountId: string): Promise<ErpAccountRisk>;
  testConnection(config?: any): Promise<{
    success: boolean;
    message: string;
    details?: string;
  }>;
}
