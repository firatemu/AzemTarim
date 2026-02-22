-- Remove advisor from work_orders
ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_advisorId_fkey";
DROP INDEX IF EXISTS "work_orders_advisorId_idx";
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "advisorId";
