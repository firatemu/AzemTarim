-- AlterTable
ALTER TABLE "stok_hareketleri" ADD COLUMN IF NOT EXISTS "faturaKalemiId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stok_hareketleri_faturaKalemiId_idx" ON "stok_hareketleri"("faturaKalemiId");

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_faturaKalemiId_fkey" FOREIGN KEY ("faturaKalemiId") REFERENCES "fatura_kalemleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
