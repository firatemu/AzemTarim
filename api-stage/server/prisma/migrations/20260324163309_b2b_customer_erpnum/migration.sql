-- DropIndex
DROP INDEX "products_tenantId_isB2B_idx";

-- AlterTable
ALTER TABLE "b2b_customers" ADD COLUMN     "erpNum" INTEGER;
