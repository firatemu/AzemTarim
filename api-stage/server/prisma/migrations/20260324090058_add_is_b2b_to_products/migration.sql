-- AlterTable
ALTER TABLE "products" ADD COLUMN "is_b2b" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex for performant filtering
CREATE INDEX "products_tenantId_isB2B_idx" ON "products"("tenantId", "is_b2b");
