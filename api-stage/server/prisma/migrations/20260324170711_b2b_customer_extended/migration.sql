-- AlterTable
ALTER TABLE "b2b_customers" ADD COLUMN     "blockOrderOnRisk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canUseVirtualPos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "customerGrade" TEXT,
ADD COLUMN     "discountGroupId" TEXT,
ADD COLUMN     "district" TEXT;

-- AddForeignKey
ALTER TABLE "b2b_customers" ADD CONSTRAINT "b2b_customers_discountGroupId_fkey" FOREIGN KEY ("discountGroupId") REFERENCES "b2b_discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
