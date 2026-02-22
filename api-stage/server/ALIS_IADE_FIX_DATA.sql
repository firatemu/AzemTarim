-- AIF-2026-006 Hatalı Veri Düzeltmesi (Seçenek B - Manuel DB)
-- Plan: fix_alis_iade_stock_movements_257b5308
-- 
-- UYARI: Bu script yanlış cari hareketi siler. Cari bakiye düzeltmesi
-- için faturayı yeniden onaylamak veya API ile silip yeniden oluşturmak
-- (Seçenek A) tercih edilir.
--
-- Seçenek A (Önerilen): API ile faturayı sil, formdan yeniden oluştur
--   curl -X DELETE "https://staging-api.otomuhasebe.com/api/fatura/56f5700f-b012-4b23-8004-185865139f2d" \
--        -H "Authorization: Bearer YOUR_JWT_TOKEN"
--
-- Seçenek B: Aşağıdaki SQL ile yanlış cari hareketi sil
--   Sonra faturayı "Beklemede" yapıp tekrar "Onaylandı" yaparak processInvoiceMovements tetikleyin.

-- Yanlış cari hareketi sil (ALACAK + "Alış Faturası" yerine BORC + "Alış İade Faturası" olmalıydı)
DELETE FROM cari_hareketler 
WHERE "belgeNo" = 'AIF-2026-006';

-- Not: Cari bakiye otomatik güncellenmeyebilir. Faturayı API üzerinden
-- "Beklemede" yapıp tekrar "Onaylandı" yaparak doğru hareketlerin
-- oluşmasını sağlayın (sunucu rebuild edildikten sonra).
