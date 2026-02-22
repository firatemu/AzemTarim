-- AlterTable
ALTER TABLE "stoklar" ADD COLUMN IF NOT EXISTS "sadeceMarkaTanimi" BOOLEAN DEFAULT false;

-- Mevcut marka placeholder kayıtlarını işaretle (malzeme listesinden kaldır)
UPDATE "stoklar"
SET "sadeceMarkaTanimi" = true
WHERE "stokAdi" LIKE '[Marka Tanımı]%';
