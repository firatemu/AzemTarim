-- Extend customer_vehicles with additional fields
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "ruhsatNo" TEXT;
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "tescilTarihi" TIMESTAMP(3);
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "ruhsatSahibi" TEXT;
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "motorGucu" INT;
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "sanziman" TEXT;
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "renk" TEXT;
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "aciklama" TEXT;
