import type {
  B2BOrderExportDto,
  ErpAccount,
  ErpAccountMovement,
  ErpAccountRisk,
  ErpProduct,
  ErpStockItem,
  ErpWarehouse,
} from '../dto/erp-types.dto';

export interface IErpAdapter {
  getProducts(lastSyncedAt: Date | null): Promise<ErpProduct[]>;
  getStock(productIds: string[]): Promise<ErpStockItem[]>;
  getAccount(erpAccountId: string): Promise<ErpAccount>;
  getAccounts(lastSyncedAt: Date | null): Promise<ErpAccount[]>;
  getAccountMovements(
    erpAccountId: string,
    lastSyncedAt: Date | null,
  ): Promise<ErpAccountMovement[]>;
  getWarehouses(): Promise<ErpWarehouse[]>;
  pushOrder(order: B2BOrderExportDto): Promise<{ erpOrderId: string }>;
  getAccountRisk(erpAccountId: string): Promise<ErpAccountRisk>;
  testConnection(config?: any): Promise<{
    success: boolean;
    message: string;
    details?: string;
  }>;
}
