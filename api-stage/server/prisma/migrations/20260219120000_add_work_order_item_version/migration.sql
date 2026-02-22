-- AlterTable
ALTER TABLE "work_order_items" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
