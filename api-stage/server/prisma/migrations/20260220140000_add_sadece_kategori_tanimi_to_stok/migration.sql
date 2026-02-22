-- AlterTable
ALTER TABLE "stoklar" ADD COLUMN IF NOT EXISTS "sadeceKategoriTanimi" BOOLEAN DEFAULT false;

-- Mevcut kategori placeholder kayıtlarını işaretle (malzeme listesinden kaldır)
UPDATE "stoklar"
SET "sadeceKategoriTanimi" = true
WHERE "stokAdi" LIKE '[Kategori Tanımı]%' OR "stokAdi" LIKE '[Ana Kategori Tanımı]%';
