-- Drop old service-related tables if they exist (from previous schema)
-- Order matters: drop tables that reference work_orders first
DROP TABLE IF EXISTS "diagnosis_approvals" CASCADE;
DROP TABLE IF EXISTS "diagnoses" CASCADE;
DROP TABLE IF EXISTS "in_app_notifications" CASCADE;
DROP TABLE IF EXISTS "supply_requests" CASCADE;
DROP TABLE IF EXISTS "technician_time_trackings" CASCADE;
DROP TABLE IF EXISTS "manager_rejections" CASCADE;
DROP TABLE IF EXISTS "manager_approvals" CASCADE;
DROP TABLE IF EXISTS "solution_package_parts" CASCADE;
DROP TABLE IF EXISTS "solution_packages" CASCADE;
DROP TABLE IF EXISTS "diagnostic_notes" CASCADE;
DROP TABLE IF EXISTS "technical_findings" CASCADE;
DROP TABLE IF EXISTS "price_quotes" CASCADE;
DROP TABLE IF EXISTS "work_order_timeline" CASCADE;
DROP TABLE IF EXISTS "work_order_status_history" CASCADE;
DROP TABLE IF EXISTS "work_order_audit_logs" CASCADE;
DROP TABLE IF EXISTS "work_order_lines" CASCADE;

-- Drop partial vehicle module tables from failed previous runs
DROP TABLE IF EXISTS "journal_entry_lines" CASCADE;
DROP TABLE IF EXISTS "journal_entries" CASCADE;
DROP TABLE IF EXISTS "service_invoices" CASCADE;
DROP TABLE IF EXISTS "inventory_transactions" CASCADE;
DROP TABLE IF EXISTS "part_requests" CASCADE;
DROP TABLE IF EXISTS "work_order_items" CASCADE;

-- Remove workOrderId from tahsilatlar before dropping work_orders (FK reference)
ALTER TABLE "tahsilatlar" DROP COLUMN IF EXISTS "workOrderId";

DROP TABLE IF EXISTS "work_orders" CASCADE;
DROP TABLE IF EXISTS "customer_vehicles" CASCADE;

-- Drop old WorkOrderStatus enum if it exists (from previous schema)
DO $$ BEGIN
  DROP TYPE IF EXISTS "WorkOrderStatus" CASCADE;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- CreateEnum (idempotent: skip if type exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkOrderStatus') THEN
    CREATE TYPE "WorkOrderStatus" AS ENUM ('WAITING_DIAGNOSIS', 'PENDING_APPROVAL', 'APPROVED_IN_PROGRESS', 'INVOICED_CLOSED', 'CANCELLED');
  END IF;
END $$;

-- CreateEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PartRequestStatus') THEN
    CREATE TYPE "PartRequestStatus" AS ENUM ('REQUESTED', 'SUPPLIED', 'USED', 'CANCELLED');
  END IF;
END $$;

-- CreateEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkOrderItemType') THEN
    CREATE TYPE "WorkOrderItemType" AS ENUM ('LABOR', 'PART');
  END IF;
END $$;

-- CreateEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryTransactionType') THEN
    CREATE TYPE "InventoryTransactionType" AS ENUM ('DEDUCTION', 'RETURN');
  END IF;
END $$;

-- AlterEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ModuleType' AND e.enumlabel = 'WORK_ORDER') THEN
    ALTER TYPE "ModuleType" ADD VALUE 'WORK_ORDER';
  END IF;
END $$;

-- AlterEnum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ModuleType' AND e.enumlabel = 'SERVICE_INVOICE') THEN
    ALTER TYPE "ModuleType" ADD VALUE 'SERVICE_INVOICE';
  END IF;
END $$;

-- CreateTable
CREATE TABLE "customer_vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "plaka" TEXT NOT NULL,
    "saseno" TEXT,
    "yil" INTEGER,
    "km" INTEGER,
    "aracMarka" TEXT NOT NULL,
    "aracModel" TEXT NOT NULL,
    "aracMotorHacmi" TEXT,
    "aracYakitTipi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "workOrderNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'WAITING_DIAGNOSIS',
    "customerVehicleId" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "advisorId" TEXT,
    "technicianId" TEXT,
    "description" TEXT,
    "estimatedCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "totalLaborCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPartsCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_items" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "type" "WorkOrderItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "stokId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxRate" INTEGER NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "workOrderId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stokId" TEXT,
    "requestedQty" INTEGER NOT NULL DEFAULT 1,
    "suppliedQty" INTEGER,
    "status" "PartRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "suppliedBy" TEXT,
    "suppliedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "part_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "partRequestId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "quantity" INTEGER NOT NULL,
    "transactionType" "InventoryTransactionType" NOT NULL DEFAULT 'DEDUCTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "invoiceNo" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "dovizCinsi" TEXT NOT NULL DEFAULT 'TRY',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "serviceInvoiceId" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entry_lines" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "debit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_vehicles_plaka_tenantId_key" ON "customer_vehicles"("plaka", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_vehicles_saseno_tenantId_key" ON "customer_vehicles"("saseno", "tenantId");

-- CreateIndex
CREATE INDEX "customer_vehicles_tenantId_idx" ON "customer_vehicles"("tenantId");

-- CreateIndex
CREATE INDEX "customer_vehicles_tenantId_cariId_idx" ON "customer_vehicles"("tenantId", "cariId");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_workOrderNo_tenantId_key" ON "work_orders"("workOrderNo", "tenantId");

-- CreateIndex
CREATE INDEX "work_orders_tenantId_idx" ON "work_orders"("tenantId");

-- CreateIndex
CREATE INDEX "work_orders_tenantId_status_idx" ON "work_orders"("tenantId", "status");

-- CreateIndex
CREATE INDEX "work_orders_tenantId_createdAt_idx" ON "work_orders"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "work_orders_cariId_idx" ON "work_orders"("cariId");

-- CreateIndex
CREATE INDEX "work_orders_advisorId_idx" ON "work_orders"("advisorId");

-- CreateIndex
CREATE INDEX "work_orders_technicianId_idx" ON "work_orders"("technicianId");

-- CreateIndex
CREATE INDEX "work_order_items_workOrderId_idx" ON "work_order_items"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_items_stokId_idx" ON "work_order_items"("stokId");

-- CreateIndex
CREATE INDEX "part_requests_tenantId_idx" ON "part_requests"("tenantId");

-- CreateIndex
CREATE INDEX "part_requests_tenantId_workOrderId_idx" ON "part_requests"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "part_requests_workOrderId_idx" ON "part_requests"("workOrderId");

-- CreateIndex
CREATE INDEX "part_requests_status_idx" ON "part_requests"("status");

-- CreateIndex
CREATE INDEX "inventory_transactions_tenantId_idx" ON "inventory_transactions"("tenantId");

-- CreateIndex
CREATE INDEX "inventory_transactions_partRequestId_idx" ON "inventory_transactions"("partRequestId");

-- CreateIndex
CREATE INDEX "inventory_transactions_stokId_idx" ON "inventory_transactions"("stokId");

-- CreateIndex
CREATE INDEX "inventory_transactions_tenantId_createdAt_idx" ON "inventory_transactions"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "service_invoices_workOrderId_key" ON "service_invoices"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "service_invoices_invoiceNo_tenantId_key" ON "service_invoices"("invoiceNo", "tenantId");

-- CreateIndex
CREATE INDEX "service_invoices_tenantId_idx" ON "service_invoices"("tenantId");

-- CreateIndex
CREATE INDEX "service_invoices_tenantId_issueDate_idx" ON "service_invoices"("tenantId", "issueDate");

-- CreateIndex
CREATE INDEX "service_invoices_cariId_idx" ON "service_invoices"("cariId");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_serviceInvoiceId_key" ON "journal_entries"("serviceInvoiceId");

-- CreateIndex
CREATE INDEX "journal_entries_tenantId_idx" ON "journal_entries"("tenantId");

-- CreateIndex
CREATE INDEX "journal_entries_tenantId_referenceType_referenceId_idx" ON "journal_entries"("tenantId", "referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "journal_entries_entryDate_idx" ON "journal_entries"("entryDate");

-- CreateIndex
CREATE INDEX "journal_entry_lines_journalEntryId_idx" ON "journal_entry_lines"("journalEntryId");

-- AddForeignKey
ALTER TABLE "customer_vehicles" ADD CONSTRAINT "customer_vehicles_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_vehicles" ADD CONSTRAINT "customer_vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customerVehicleId_fkey" FOREIGN KEY ("customerVehicleId") REFERENCES "customer_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_requests" ADD CONSTRAINT "part_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_requests" ADD CONSTRAINT "part_requests_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_requests" ADD CONSTRAINT "part_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_requests" ADD CONSTRAINT "part_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_partRequestId_fkey" FOREIGN KEY ("partRequestId") REFERENCES "part_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_invoices" ADD CONSTRAINT "service_invoices_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_serviceInvoiceId_fkey" FOREIGN KEY ("serviceInvoiceId") REFERENCES "service_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
