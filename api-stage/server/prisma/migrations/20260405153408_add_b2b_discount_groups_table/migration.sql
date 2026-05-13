/*
  Warnings:

  - You are about to drop the column `discountRate` on the `b2b_customer_classes` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "CheckBillStatus" ADD VALUE 'GIVEN_TO_CUSTOMER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'PARTIALLY_INVOICED';
ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'TESLIM_EDILDI';
ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'BEKLEMEDE';
ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'FATURAYA_BAGLANDI';
ALTER TYPE "DeliveryNoteStatus" ADD VALUE 'IPTAL';

-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PENDING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PurchaseOrderLocalStatus" ADD VALUE 'PARTIAL';
ALTER TYPE "PurchaseOrderLocalStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "SalesOrderStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "b2b_customers" DROP CONSTRAINT "b2b_customers_discountGroupId_fkey";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "block_on_risk" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "b2b_customer_classes" DROP COLUMN "discountRate";

-- AlterTable
ALTER TABLE "check_bill_collections" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "company_vehicles" ADD COLUMN     "insurance_date" TIMESTAMP(3),
ADD COLUMN     "last_inspection_date" TIMESTAMP(3),
ADD COLUMN     "registration_serial_no" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "delivery_note_no_ref" TEXT;

-- AlterTable
ALTER TABLE "purchase_order_local_items" ADD COLUMN     "discount_amount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "discount_rate" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "discount_type" TEXT DEFAULT 'pct',
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "sales_delivery_notes" ADD COLUMN     "invoiceNos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "order_no_ref" TEXT;

-- AlterTable
ALTER TABLE "sales_order_items" ADD COLUMN     "discount_amount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "discount_rate" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "discount_type" TEXT DEFAULT 'pct',
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "b2b_discount_groups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_discount_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "b2b_discount_groups_tenantId_idx" ON "b2b_discount_groups"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_discount_groups_tenantId_name_key" ON "b2b_discount_groups"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "b2b_discount_groups" ADD CONSTRAINT "b2b_discount_groups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_customers" ADD CONSTRAINT "b2b_customers_discountGroupId_fkey" FOREIGN KEY ("discountGroupId") REFERENCES "b2b_discount_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
