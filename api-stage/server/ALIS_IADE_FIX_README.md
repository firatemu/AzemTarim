# ALIS_IADE Stok Hareketi Düzeltmesi - Uygulama Talimatları

Plan: fix_alis_iade_stock_movements_257b5308

## Yapılan Kod Değişiklikleri

1. **hareketTipi düzeltmesi** (fatura.service.ts satır 3110)
   - ALIS_IADE için `hareketTipi: 'SATIS'` → `'CIKIS'` olarak değiştirildi
   - Semantik olarak doğru: tedarikçiye iade = genel çıkış (CIKIS)

## Sunucuda Yapılacaklar

### 1. Rebuild ve Restart (ZORUNLU)

**Sunucuda** (Node.js ve PM2 kurulu olan ortamda) çalıştırın:

```bash
cd /var/www/api-stage/server   # veya proje dizininiz
./ALIS_IADE_FIX_REBUILD.sh
```

Veya manuel:

```bash
cd /var/www/api-stage/server
npx nest build && pm2 restart api-stage
```

### 2. AIF-2026-006 Hatalı Veriyi Düzelt

**Seçenek A (Önerilen):** API ile faturayı sil, formdan yeniden oluştur

1. Panelden giriş yapın, JWT token alın (tarayıcı DevTools → Application → Local Storage)
2. Faturayı silin:
```bash
curl -X DELETE "https://staging-api.otomuhasebe.com/api/fatura/56f5700f-b012-4b23-8004-185865139f2d" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
3. Satınalma İade Faturası formundan aynı faturayı yeniden oluşturup onaylayın

**Seçenek B:** Veritabanında manuel düzelt

`ALIS_IADE_FIX_DATA.sql` dosyasındaki SQL'i çalıştırın. Sonra faturayı "Beklemede" yapıp tekrar "Onaylandı" yaparak `processInvoiceMovements` tetikleyin.

### 3. Doğrulama

1. Yeni bir ALIS_IADE faturası oluşturun
2. Sunucu loglarında `[processInvoiceMovements] Başladı:` kontrol edin
3. `stok_hareketleri` tablosunda yeni kayıt oluştuğunu doğrulayın
4. Malzeme listesinde stok miktarının düştüğünü kontrol edin
