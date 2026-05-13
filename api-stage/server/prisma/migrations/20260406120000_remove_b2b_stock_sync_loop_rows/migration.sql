-- Stok senkronu kuyrukta kullanılmıyor; eski STOCK döngü satırlarını temizle.
DELETE FROM "b2b_sync_loops" WHERE "syncType" = 'STOCK';
