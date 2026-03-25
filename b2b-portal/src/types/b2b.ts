/**
 * B2B Portal Type Definitions
 *
 * These types mirror the Prisma enums but are defined as string literals
 * to avoid importing @prisma/client in Next.js client components.
 */

// B2B Order Status
export type B2BOrderStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPORTED_TO_ERP'
  | 'CANCELLED';

// B2B Order Status Enum (for backwards compatibility)
export const B2BOrderStatus = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  REJECTED: 'REJECTED' as const,
  EXPORTED_TO_ERP: 'EXPORTED_TO_ERP' as const,
  CANCELLED: 'CANCELLED' as const,
};

// B2B Movement Type
export type B2BMovementTypeType =
  | 'INVOICE'
  | 'PAYMENT'
  | 'ORDER_PLACED';

export const B2BMovementType = {
  INVOICE: 'INVOICE' as const,
  PAYMENT: 'PAYMENT' as const,
  ORDER_PLACED: 'ORDER_PLACED' as const,
};

// Risk Status
export type RiskStatusType =
  | 'OK'
  | 'RISKY'
  | 'OVER_LIMIT'
  | 'OVERDUE'
  | 'BLACK_LIST'
  | 'IN_COLLECTION';

export const RiskStatus = {
  OK: 'OK' as const,
  RISKY: 'RISKY' as const,
  OVER_LIMIT: 'OVER_LIMIT' as const,
  OVERDUE: 'OVERDUE' as const,
  BLACK_LIST: 'BLACK_LIST' as const,
  IN_COLLECTION: 'IN_COLLECTION' as const,
};

// Discount Type
export type B2BDiscountTypeType =
  | 'CUSTOMER_CLASS'
  | 'BRAND'
  | 'CATEGORY'
  | 'PRODUCT_LIST';

export const B2BDiscountType = {
  CUSTOMER_CLASS: 'CUSTOMER_CLASS' as const,
  BRAND: 'BRAND' as const,
  CATEGORY: 'CATEGORY' as const,
  PRODUCT_LIST: 'PRODUCT_LIST' as const,
};

// Warehouse Display Mode
export type WarehouseDisplayModeType =
  | 'INDIVIDUAL'
  | 'COMBINED';

export const WarehouseDisplayMode = {
  INDIVIDUAL: 'INDIVIDUAL' as const,
  COMBINED: 'COMBINED' as const,
};

// ERP Adapter Type
export type ErpAdapterTypeType =
  | 'OTOMUHASEBE'
  | 'LOGO'
  | 'MIKRO';

export const ErpAdapterType = {
  OTOMUHASEBE: 'OTOMUHASEBE' as const,
  LOGO: 'LOGO' as const,
  MIKRO: 'MIKRO' as const,
};
