-- ============= FATURA KARLILIK MODÜLÜ MİGRATİON =============

-- InvoiceProfit tablosunu oluştur
CREATE TABLE "invoice_profit" (
    "id" TEXT NOT NULL,
    "fatura_id" TEXT NOT NULL,
    "fatura_kalemi_id" TEXT,
    "stok_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "miktar" INTEGER NOT NULL,
    "birim_fiyat" DECIMAL(10,2) NOT NULL,
    "birim_maliyet" DECIMAL(12,4) NOT NULL,
    "toplam_satis_tutari" DECIMAL(12,2) NOT NULL,
    "toplam_maliyet" DECIMAL(12,2) NOT NULL,
    "kar" DECIMAL(12,2) NOT NULL,
    "kar_orani" DECIMAL(10,2) NOT NULL,
    "hesaplama_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme_tarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_profit_pkey" PRIMARY KEY ("id")
);

-- Foreign key constraint'leri ekle
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_fatura_id_fkey" FOREIGN KEY ("fatura_id") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_fatura_kalemi_id_fkey" FOREIGN KEY ("fatura_kalemi_id") REFERENCES "fatura_kalemleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_stok_id_fkey" FOREIGN KEY ("stok_id") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoice_profit" ADD CONSTRAINT "invoice_profit_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index'leri oluştur
CREATE INDEX "invoice_profit_fatura_id_idx" ON "invoice_profit"("fatura_id");
CREATE INDEX "invoice_profit_stok_id_idx" ON "invoice_profit"("stok_id");
CREATE INDEX "invoice_profit_tenant_id_fatura_id_idx" ON "invoice_profit"("tenant_id", "fatura_id");
CREATE INDEX "invoice_profit_fatura_kalemi_id_idx" ON "invoice_profit"("fatura_kalemi_id");
