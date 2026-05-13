-- CreateEnum
CREATE TYPE "B2BOrderApprovalMode" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "B2BErpAdapter" AS ENUM ('OTOMUHASEBE', 'LOGO', 'MIKRO');

-- CreateEnum
CREATE TYPE "B2BOrderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPORTED_TO_ERP', 'CANCELLED');

-- CreateEnum
CREATE TYPE "B2BOrderPlacedBy" AS ENUM ('CUSTOMER', 'SALESPERSON');

-- CreateEnum
CREATE TYPE "B2BNotificationType" AS ENUM ('ORDER_RECEIVED', 'ORDER_APPROVED', 'ORDER_REJECTED');

-- CreateEnum
CREATE TYPE "B2BAdType" AS ENUM ('HOMEPAGE_BANNER', 'LOGIN_POPUP');

-- CreateEnum
CREATE TYPE "B2BMovementType" AS ENUM ('INVOICE', 'PAYMENT', 'RETURN', 'OTHER');

-- CreateEnum
CREATE TYPE "B2BSyncType" AS ENUM ('PRODUCTS', 'STOCK', 'ACCOUNT_MOVEMENTS', 'FULL');

-- CreateEnum
CREATE TYPE "B2BSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "B2BWarehouseDisplayMode" AS ENUM ('INDIVIDUAL', 'COMBINED');

-- CreateEnum
CREATE TYPE "B2BDiscountType" AS ENUM ('CUSTOMER_CLASS', 'BRAND', 'CATEGORY', 'PRODUCT_LIST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModuleType" ADD VALUE 'CHECK_BILL_JOURNAL';
ALTER TYPE "ModuleType" ADD VALUE 'CHECK_BILL_DOCUMENT';

-- AlterTable
ALTER TABLE "account_movements" ADD COLUMN     "check_bill_id" TEXT;

-- AlterTable
ALTER TABLE "check_bill_journals" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "b2b_licenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxB2BCustomers" INTEGER NOT NULL DEFAULT -1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_tenant_configs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL,
    "domain" TEXT,
    "erpAdapterType" "B2BErpAdapter" NOT NULL,
    "erpConnectionString" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "syncIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "orderApprovalMode" "B2BOrderApprovalMode" NOT NULL DEFAULT 'MANUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_tenant_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "erpProductId" TEXT NOT NULL,
    "stockCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "oemCode" TEXT,
    "supplierCode" TEXT,
    "unit" TEXT,
    "erpListPrice" DECIMAL(12,2) NOT NULL,
    "erpCreatedAt" TIMESTAMP(3),
    "erpUpdatedAt" TIMESTAMP(3),
    "isVisibleInB2B" BOOLEAN NOT NULL DEFAULT true,
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_stocks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_warehouse_configs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "displayMode" "B2BWarehouseDisplayMode" NOT NULL DEFAULT 'INDIVIDUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_warehouse_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_customer_classes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_customer_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "erpAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customerClassId" TEXT,
    "vatDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "b2b_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_salespersons" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canViewAllCustomers" BOOLEAN NOT NULL DEFAULT false,
    "canViewAllReports" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_salespersons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_salesperson_customers" (
    "salespersonId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_salesperson_customers_pkey" PRIMARY KEY ("salespersonId","customerId")
);

-- CreateTable
CREATE TABLE "b2b_discounts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "B2BDiscountType" NOT NULL,
    "targetValue" TEXT NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_carts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_cart_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_delivery_methods" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_delivery_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salespersonId" TEXT,
    "placedBy" "B2BOrderPlacedBy" NOT NULL,
    "placedByLabel" TEXT,
    "status" "B2BOrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryBranchId" TEXT,
    "deliveryBranchName" TEXT,
    "deliveryMethodId" TEXT NOT NULL,
    "note" TEXT,
    "totalListPrice" DECIMAL(14,2) NOT NULL,
    "totalDiscountAmount" DECIMAL(14,2) NOT NULL,
    "totalFinalPrice" DECIMAL(14,2) NOT NULL,
    "erpOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_order_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stockCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "listPrice" DECIMAL(12,2) NOT NULL,
    "customerClassDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "campaignDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "B2BNotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_advertisements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "B2BAdType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_account_movements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "erpMovementId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "B2BMovementType" NOT NULL,
    "description" TEXT,
    "debit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL,
    "erpInvoiceNo" TEXT,
    "dueDate" TIMESTAMP(3),
    "isPastDue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_account_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_sync_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "syncType" "B2BSyncType" NOT NULL,
    "status" "B2BSyncStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsAdded" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "b2b_licenses_tenantId_key" ON "b2b_licenses"("tenantId");

-- CreateIndex
CREATE INDEX "b2b_licenses_tenantId_isActive_idx" ON "b2b_licenses"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_tenant_configs_tenantId_key" ON "b2b_tenant_configs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_tenant_configs_schemaName_key" ON "b2b_tenant_configs"("schemaName");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_tenant_configs_domain_key" ON "b2b_tenant_configs"("domain");

-- CreateIndex
CREATE INDEX "b2b_tenant_configs_tenantId_isActive_idx" ON "b2b_tenant_configs"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_domains_domain_key" ON "b2b_domains"("domain");

-- CreateIndex
CREATE INDEX "b2b_domains_tenantId_idx" ON "b2b_domains"("tenantId");

-- CreateIndex
CREATE INDEX "b2b_products_tenantId_isVisibleInB2B_idx" ON "b2b_products"("tenantId", "isVisibleInB2B");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_products_tenantId_erpProductId_key" ON "b2b_products"("tenantId", "erpProductId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_products_tenantId_stockCode_key" ON "b2b_products"("tenantId", "stockCode");

-- CreateIndex
CREATE INDEX "b2b_stocks_tenantId_productId_idx" ON "b2b_stocks"("tenantId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_stocks_tenantId_productId_warehouseId_key" ON "b2b_stocks"("tenantId", "productId", "warehouseId");

-- CreateIndex
CREATE INDEX "b2b_warehouse_configs_tenantId_idx" ON "b2b_warehouse_configs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_warehouse_configs_tenantId_warehouseId_key" ON "b2b_warehouse_configs"("tenantId", "warehouseId");

-- CreateIndex
CREATE INDEX "b2b_customer_classes_tenantId_idx" ON "b2b_customer_classes"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_customer_classes_tenantId_name_key" ON "b2b_customer_classes"("tenantId", "name");

-- CreateIndex
CREATE INDEX "b2b_customers_tenantId_isActive_idx" ON "b2b_customers"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_customers_tenantId_email_key" ON "b2b_customers"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_customers_tenantId_erpAccountId_key" ON "b2b_customers"("tenantId", "erpAccountId");

-- CreateIndex
CREATE INDEX "b2b_salespersons_tenantId_isActive_idx" ON "b2b_salespersons"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_salespersons_tenantId_email_key" ON "b2b_salespersons"("tenantId", "email");

-- CreateIndex
CREATE INDEX "b2b_discounts_tenantId_isActive_idx" ON "b2b_discounts"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "b2b_carts_tenantId_idx" ON "b2b_carts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_carts_tenantId_customerId_key" ON "b2b_carts"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "b2b_cart_items_tenantId_idx" ON "b2b_cart_items"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_cart_items_cartId_productId_key" ON "b2b_cart_items"("cartId", "productId");

-- CreateIndex
CREATE INDEX "b2b_delivery_methods_tenantId_isActive_idx" ON "b2b_delivery_methods"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "b2b_orders_tenantId_customerId_idx" ON "b2b_orders"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "b2b_orders_tenantId_status_idx" ON "b2b_orders"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_orders_tenantId_orderNumber_key" ON "b2b_orders"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "b2b_order_items_tenantId_orderId_idx" ON "b2b_order_items"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "b2b_notifications_tenantId_customerId_idx" ON "b2b_notifications"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "b2b_advertisements_tenantId_isActive_displayOrder_idx" ON "b2b_advertisements"("tenantId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "b2b_account_movements_tenantId_customerId_idx" ON "b2b_account_movements"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "b2b_account_movements_tenantId_date_idx" ON "b2b_account_movements"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_account_movements_tenantId_erpMovementId_key" ON "b2b_account_movements"("tenantId", "erpMovementId");

-- CreateIndex
CREATE INDEX "b2b_sync_logs_tenantId_syncType_status_startedAt_idx" ON "b2b_sync_logs"("tenantId", "syncType", "status", "startedAt");

-- AddForeignKey
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_check_bill_id_fkey" FOREIGN KEY ("check_bill_id") REFERENCES "checks_bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_licenses" ADD CONSTRAINT "b2b_licenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_tenant_configs" ADD CONSTRAINT "b2b_tenant_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_domains" ADD CONSTRAINT "b2b_domains_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_products" ADD CONSTRAINT "b2b_products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_stocks" ADD CONSTRAINT "b2b_stocks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_stocks" ADD CONSTRAINT "b2b_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_warehouse_configs" ADD CONSTRAINT "b2b_warehouse_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_customer_classes" ADD CONSTRAINT "b2b_customer_classes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_customers" ADD CONSTRAINT "b2b_customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_customers" ADD CONSTRAINT "b2b_customers_customerClassId_fkey" FOREIGN KEY ("customerClassId") REFERENCES "b2b_customer_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_salespersons" ADD CONSTRAINT "b2b_salespersons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_salesperson_customers" ADD CONSTRAINT "b2b_salesperson_customers_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "b2b_salespersons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_salesperson_customers" ADD CONSTRAINT "b2b_salesperson_customers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_discounts" ADD CONSTRAINT "b2b_discounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_carts" ADD CONSTRAINT "b2b_carts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_carts" ADD CONSTRAINT "b2b_carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_cart_items" ADD CONSTRAINT "b2b_cart_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_cart_items" ADD CONSTRAINT "b2b_cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "b2b_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_cart_items" ADD CONSTRAINT "b2b_cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_delivery_methods" ADD CONSTRAINT "b2b_delivery_methods_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "b2b_salespersons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "b2b_delivery_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_order_items" ADD CONSTRAINT "b2b_order_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_order_items" ADD CONSTRAINT "b2b_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "b2b_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_order_items" ADD CONSTRAINT "b2b_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_notifications" ADD CONSTRAINT "b2b_notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_notifications" ADD CONSTRAINT "b2b_notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_notifications" ADD CONSTRAINT "b2b_notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "b2b_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_advertisements" ADD CONSTRAINT "b2b_advertisements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_account_movements" ADD CONSTRAINT "b2b_account_movements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_account_movements" ADD CONSTRAINT "b2b_account_movements_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_sync_logs" ADD CONSTRAINT "b2b_sync_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
