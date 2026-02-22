-- Add diagnosisNotes to work_orders for technician diagnosis and additional work
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "diagnosisNotes" TEXT;
