-- Migration: init
-- Create all B2B tenant tables
-- This migration creates the initial schema for isolated B2B tenant schemas

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "pg_catalog"."uuid-ossp";

-- ========================================
-- PRODUCTS & STOCK
-- ========================================

CREATE TABLE "b2b_products" (
    "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "b2b_products_erpProductId_key" ON "b2b_products"("erpProductId");
CREATE UNIQUE INDEX "b2b_products_stockCode_key" ON "b2b_products"("stockCode");
CREATE INDEX "b2b_products_isVisibleInB2B_idx" ON "b2b_products"("isVisibleInB2B");

CREATE TABLE "b2b_stocks" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_stocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_stocks_productId_warehouseId_key" ON "b2b_stocks"("productId", "warehouseId");
CREATE INDEX "b2b_stocks_productId_idx" ON "b2b_stocks"("productId");

-- ========================================
-- CUSTOMERS
// ========================================

CREATE TABLE "b2b_customer_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_customer_classes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_customer_classes_name_key" ON "b2b_customer_classes"("name");

CREATE TABLE "b2b_customers" (
    "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "b2b_customers_email_key" ON "b2b_customers"("email");
CREATE UNIQUE INDEX "b2b_customers_erpAccountId_key" ON "b2b_customers"("erpAccountId");
CREATE INDEX "b2b_customers_isActive_idx" ON "b2b_customers"("isActive");

-- ========================================
-- SALESPERSONS
-- ========================================

CREATE TABLE "b2b_salespersons" (
    "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "b2b_salespersons_email_key" ON "b2b_salespersons"("email");
CREATE INDEX "b2b_salespersons_isActive_idx" ON "b2b_salespersons"("isActive");

CREATE TABLE "b2b_salesperson_customers" (
    "salespersonId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_salesperson_customers_pkey" PRIMARY KEY ("salespersonId", "customerId")
);

-- ========================================
-- DISCOUNTS
-- ========================================

CREATE TABLE "b2b_discounts" (
    "id" TEXT NOT NULL,
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

CREATE INDEX "b2b_discounts_isActive_idx" ON "b2b_discounts"("isActive");

-- ========================================
-- CART
-- ========================================

CREATE TABLE "b2b_carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_carts_customerId_key" ON "b2b_carts"("customerId");

CREATE TABLE "b2b_cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_cart_items_cartId_productId_key" ON "b2b_cart_items"("cartId", "productId");

-- ========================================
-- DELIVERY METHODS
-- ========================================

CREATE TABLE "b2b_delivery_methods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_delivery_methods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "b2b_delivery_methods_isActive_idx" ON "b2b_delivery_methods"("isActive");

-- ========================================
-- ORDERS
-- ========================================

CREATE TABLE "b2b_orders" (
    "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "b2b_orders_orderNumber_key" ON "b2b_orders"("orderNumber");
CREATE INDEX "b2b_orders_customerId_idx" ON "b2b_orders"("customerId");
CREATE INDEX "b2b_orders_status_idx" ON "b2b_orders"("status");

CREATE TABLE "b2b_order_items" (
    "id" TEXT NOT NULL,
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

CREATE INDEX "b2b_order_items_orderId_idx" ON "b2b_order_items"("orderId");

-- ========================================
-- NOTIFICATIONS
-- ========================================

CREATE TABLE "b2b_notifications" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "B2BNotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "b2b_notifications_customerId_idx" ON "b2b_notifications"("customerId");

-- ========================================
-- ADVERTISEMENTS
-- ========================================

CREATE TABLE "b2b_advertisements" (
    "id" TEXT NOT NULL,
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

CREATE INDEX "b2b_advertisements_isActive_displayOrder_idx" ON "b2b_advertisements"("isActive", "displayOrder");

-- ========================================
-- ACCOUNT MOVEMENTS
-- ========================================

CREATE TABLE "b2b_account_movements" (
    "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "b2b_account_movements_erpMovementId_key" ON "b2b_account_movements"("erpMovementId");
CREATE INDEX "b2b_account_movements_customerId_idx" ON "b2b_account_movements"("customerId");
CREATE INDEX "b2b_account_movements_date_idx" ON "b2b_account_movements"("date");

-- ========================================
-- FOREIGN KEYS
-- ========================================

ALTER TABLE "b2b_stocks" ADD CONSTRAINT "b2b_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "b2b_customers" ADD CONSTRAINT "b2b_customers_customerClassId_fkey" FOREIGN KEY ("customerClassId") REFERENCES "b2b_customer_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "b2b_salesperson_customers" ADD CONSTRAINT "b2b_salesperson_customers_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "b2b_salespersons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "b2b_salesperson_customers" ADD CONSTRAINT "b2b_salesperson_customers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "b2b_carts" ADD CONSTRAINT "b2b_carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "b2b_cart_items" ADD CONSTRAINT "b2b_cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "b2b_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "b2b_cart_items" ADD CONSTRAINT "b2b_cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "b2b_salespersons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "b2b_orders" ADD CONSTRAINT "b2b_orders_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "b2b_delivery_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "b2b_order_items" ADD CONSTRAINT "b2b_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "b2b_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "b2b_order_items" ADD CONSTRAINT "b2b_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "b2b_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "b2b_notifications" ADD CONSTRAINT "b2b_notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "b2b_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "b2b_notifications" ADD CONSTRAINT "b2b_notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "b2b_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE "B2BOrderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPORTED_TO_ERP', 'CANCELLED');
CREATE TYPE "B2BOrderPlacedBy" AS ENUM ('CUSTOMER', 'SALESPERSON');
CREATE TYPE "B2BNotificationType" AS ENUM ('ORDER_RECEIVED', 'ORDER_APPROVED', 'ORDER_REJECTED');
CREATE TYPE "B2BAdType" AS ENUM ('HOMEPAGE_BANNER', 'LOGIN_POPUP');
CREATE TYPE "B2BMovementType" AS ENUM ('INVOICE', 'PAYMENT', 'RETURN', 'OTHER');
CREATE TYPE "B2BDiscountType" AS ENUM ('CUSTOMER_CLASS', 'BRAND', 'CATEGORY', 'PRODUCT_LIST');
