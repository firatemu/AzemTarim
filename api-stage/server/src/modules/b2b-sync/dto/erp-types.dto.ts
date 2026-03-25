/**
 * B2B ↔ ERP senkron ve export için paylaşılan tipler (Prisma enum'larından bağımsız).
 */
export interface ErpProduct {
  erpProductId: string;
  stockCode: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  oemCode?: string;
  supplierCode?: string;
  unit?: string;
  listPrice: number;
  erpCreatedAt?: Date;
  erpUpdatedAt?: Date;
}

export interface ErpStockItem {
  erpProductId: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface ErpAccount {
  erpNum?: number;
  erpAccountId: string;
  name: string;
  email?: string;
  phone?: string;
  addresses: ErpAddress[];
}

export interface ErpAddress {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface ErpWarehouse {
  warehouseId: string;
  warehouseName: string;
}

export type ErpMovementType = 'INVOICE' | 'PAYMENT' | 'RETURN' | 'OTHER';

export interface ErpAccountMovement {
  erpMovementId: string;
  date: Date;
  type: ErpMovementType;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  erpInvoiceNo?: string;
}

export interface ErpAccountRisk {
  creditLimit: number;
  currentBalance: number;
  isOverCreditLimit: boolean;
  hasOverdueInvoices: boolean;
}

export interface B2BOrderExportDto {
  orderNumber: string;
  erpAccountId: string;
  items: { erpProductId: string; quantity: number; unitPrice: number }[];
  note?: string;
  deliveryBranchId?: string;
}
