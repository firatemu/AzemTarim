# OtoMuhasebe Projesi Hata Çözümü ve Geliştirme AI Rehberi

Sen kıdemli bir yazılım mimarı ve full-stack geliştiricisin. Sana verilen bu projede (Next.js 16 App Router, NestJS 11, Prisma) aşağıdaki tüm hataları ve geliştirmeleri sırasıyla uygulamanı istiyorum. Bu projenin tam olarak aynı hatalarına sahip bir kopyası üzerinde çalışıyorsun.

Aşağıdaki adımları **birebir** uygulayarak projeyi stabil hale getir.

## 1. Fatura Listeleme ve Düzenleme Sayfalarının Oluşturulması (Frontend)
- `src/app/fatura/satis/page.tsx` sayfasını oluştur (eğer yoksa) ve `alis/page.tsx` sayfasındaki yapıyı satış faturalarına uyarla (Alış yerine Satış KPI ve endpointlerini kullan).
- `src/app/fatura/alis/yeni/page.tsx` dosyasını `AlisFaturaForm` bileşenini içerecek şekilde düzenle ve `faturaId` ile id üzerinden hem `GET /fatura/:id` (veriyi çekme) hem de `PUT /fatura/:id` (güncelleme) işlemlerini desteklemesini sağla. Sayfa başlıkları ve butonlarını işleme göre (Yeni Ekle/Güncelle) dinamik yap.
- `src/app/fatura/alis/duzenle/[id]/page.tsx` ve `src/app/fatura/satis/duzenle/[id]/page.tsx` rotalarını oluştur. Bu sayfalar `Suspense` ile ilgili form bileşenlerini çağırmalıdır.
- NOT: Düzenleme sayfasının yüklenmesinde `/fatura/satis/duzenle/[id]` veya `/fatura/alis/duzenle/[id]` 404 dönüyorsa route klasör yapısının Next.js App Router formatına uygun olduğundan emin ol.

## 2. Fatura Listelerinde Arama ve Filtreleme (Frontend)
- `useApi.ts` içerisindeki `useFaturalar` hook'una `search` (arama metni), `startDate`, `endDate`, `durum` parametreleri eklenebilecek (veya sadece page/limit ile yetinilmeyip query bazlı) yapıyı entegre et.
- Fatura listesi (`fatura/satis/page.tsx` ve `fatura/alis/page.tsx`) ekranlarına arama (Fatura No veya Cari Ünvan üzerinden) ve filtreleme temizleme butonu ekle.

## 3. UI Düzenlemeleri (Çift Menü ve Sekme Kapanışı) (Frontend)
- `src/app/fatura/satis/page.tsx` gibi sayfalarda eğer tablo/komponent `<MainLayout>` ile sarmalanmışsa, zaten `layout.tsx` dosyasında `MainLayout` kullanılıp kullanılmadığını kontrol et. Nested (çift) layout hatası varsa sayfadan MainLayout sarmalamasını kaldır.
- Satış ve Alış Faturası Ekle/Düzenle sayfalarında veya form bileşenlerinde işlem başarıyla bittikten (`onSuccess`) sonra, `useTabStore` (Zustand) kullanarak açılan sekmenin (Tab) otomatik kapanmasını ve kullanıcının fatura listesine yönlendirilmesini sağla.

## 4. Yazdırma Şablonlarında ₺NaN Hesaplama Hatasının Çözümü (Frontend)
- Satış ve Alış faturalarının `/print/[id]/page.tsx` sayfalarında bulunan `formatMoney(amount)` fonksiyonunu revize et. 
  Şu şekilde değiştir:
  ```typescript
  const formatMoney = (amount: any) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount) || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };
  ```
- Ayrıca tablo render edilirken `tutar + kdvTutar` işlemi sırasında değerlerin string olarak birleşmesini (örn: "100" + "20" = "10020") engellemek için kod bloklarını şu şekilde sarın: `{formatMoney(Number(kalem.tutar || 0) + Number(kalem.kdvTutar || 0))}`.

## 5. Fatura Güncellemedeki Stok İptal Yığılması ve Tenant İlişkisi Sorunu (Backend - FaturaService)
- `fatura.service.ts` içindeki `update` metodunu bul. Eğer durum `ONAYLANDI` ise işlem yapıldığı bloklarda eski stok hareketlerini **Ters (İade) Miktarı** olarak girmek yerine **direkt sil (deleteMany)** ve yerlerine taze miktarlar ile yeniden yeni `StokHareket` kayıtları oluştur. 
- **Çok Önemli:** Yeni `StokHareket` oluştururken mutlaka `tenantId: updated.tenantId`, `warehouseId: updated.warehouseId` ve `faturaKalemiId: kalem.id` alanlarını `data` objesine ekle. Eklenmezse ön yüzde "Malzeme Hareketleri" tablosundaki filtreye takılır ve görünmez. 
  Örnek Silme Bloğu:
  ```typescript
      const eskiHareketler = await tx.stokHareket.findMany({
        where: {
          OR: [
            { aciklama: `Satış Faturası: ${fatura.faturaNo}` },
            { aciklama: `Alış Faturası: ${fatura.faturaNo}` },
            { aciklama: `Satış Faturası Güncelleme: ${fatura.faturaNo}` },
            { aciklama: `Alış Faturası Güncelleme: ${fatura.faturaNo}` },
            // ... eski "İade" vs metinleriniz
          ]
        }
      });
      if (eskiHareketler.length > 0) {
        await tx.stokHareket.deleteMany({
          where: { id: { in: eskiHareketler.map(h => h.id) } }
        });
      }
  ```
  Örnek Oluşturma Bloğu:
  ```typescript
            await tx.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'SATIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Satış Faturası: ${updated.faturaNo}`,
                faturaKalemiId: kalem.id,
                tenantId: updated.tenantId,
                warehouseId: updated.warehouseId,
              },
            });
  ```

## 6. Cari Yürüyen Bakiyelerinin Yeniden Hesaplanması (Backend)
- `fatura.service.ts` içindeki değişikliklerden sonra (create, update, iptal durumlarında) Cari'nin bakiyesinin ve hareketlerinin yanlış sırayla birikmemesi için bir `recalculateCariBakiyeler(cariId, tx)` (Eğer sistemde yoksa yazılmalı) fonsiyonunu tetikle.
- Bu fonksiyon girilen `cariId`'ye göre cari tablosundaki bakiye işlemini kronolojik (tarihe ve createdAt'a göre) baştan sona doğru okumalı ve yürüyen bakiyeyi anlık olarak güncel değerlerine eşitlemelidir.

## 7. Veri Tabanındaki Eski Hatalı Verileri Onarmak İçin Senkronizasyon Scriptleri (Opsiyonel ama Tavsiye Edilir)
Eldeki mevcut hatalı bakiyeleri ve eksik ID'li stok hareketlerini onarmak için Prisma üzerinden şu iki script'i yaz ve çalıştır:
1. **recalculate-cari-bakiyeler.ts:** Sistemdeki tüm (veya aktif) Carilerin döngüyle ID'lerini alıp, bakiye/hareket listesini baştan sona döngüde `ALACAK/BORÇ` toplayarak `Cari` tablosunu ve `CariHareket.bakiye` kolonlarını satır satır update et.
2. **sync-stok-hareket.ts:** Öncesinde faturaya bağlı kopuk (`faturaKalemiId == null`) veya açıklaması bozuk tüm `StokHareket` kayıtlarını sil. Sonra `ONAYLANDI` durumundaki tüm faturaları kalemleriyle çekerek; her bir kalem için kendi miktarı, `stokId`, `faturaKalemiId`, `tenantId`, ve `warehouseId` değerleriyle sıfırdan `StokHareket` insert yap. Böylece Malzeme Hareketleri listesi tamamen gerçek veriyle senkronize edilsin.

Lütfen bu direktifleri sırasıyla, eksiksiz ve proje yapısını (soft delete, uuid, typescript type kuralları) gözeterek entegre et.
> [!IMPORTANT]
> Ajan, projede kodları değiştirirken daima mevcut Prisma schema'na bakmalı, enum değerleriyle kurgunun birebir örtüştüğünden (örneğin hareketTipi 'GIRIS'/'SATIS') emin olmalıdır.
