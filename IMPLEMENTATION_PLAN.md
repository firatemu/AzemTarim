# GitHub Push Uygulama Planı

Bu plan, mevcut projenin bütün olarak belirtilen yeni GitHub deposuna pushlanmasını kapsar.

## Önemli Notlar
> [!IMPORTANT]
> Mevcut `origin` remote adresi `https://github.com/firatemu/azemyazilim_otomuhasebe` olarak güncellenecektir.
> Tüm yerel değişiklikler (varsa) yeni depoya gönderilecektir.

## Yapılacak Değişiklikler

### Git Yapılandırması
- **`origin` Remote Güncelleme**: Mevcut `git@github.com:firatemu/otomuhasebe.git` adresi yerine `https://github.com/firatemu/azemyazilim_otomuhasebe` adresi tanımlanacaktır.
- **Dosya Hazırlığı**: Tüm dosyalar `git add .` ile sahneye (stage) alınacaktır.
- **Commit**: Uygun bir mesajla commit oluşturulacaktır.

### Push İşlemi
- **`git push -u origin main`**: Ana dal (main) yeni remote adresine gönderilecektir.

## Doğrulama Planı

### Manuel Doğrulama
- Uzak deponun URL'inin doğru güncellendiği `git remote -v` ile kontrol edilecektir.
- Push işlemi sonrası hata mesajı dönüp dönmediği terminalden takip edilecektir.
- GitHub web arayüzünden dosyaların yüklenip yüklenmediği teyit edilmelidir.

---

## UI Standardizasyonu: Fatura/İrsaliye/Sipariş Kalem Tablosu

### Amaç
- Fatura, irsaliye ve sipariş “kalem giriş” ekranlarında kolon genişlikleri ve boşlukların **tutarlı** olması.

### Yaklaşım
- Tek kaynak olarak `panel-stage/client/src/components/Form/DocumentItemTable.tsx` üzerinden kolon genişlikleri/padding ayarlanır.
- Bu bileşeni kullanan tüm “yeni/düzenle” ekranları otomatik olarak aynı görünümü alır.

### Kapsam
- Satış/Alış faturaları, iade faturaları, satış/alım irsaliyeleri ve sipariş oluşturma ekranları (kalem girişi).

### Doğrulama
- `/invoice/sales/yeni`, `/invoice/purchase/yeni`, `/sales-delivery-note/yeni`, `/purchase-delivery-note/yeni`, `/orders/sales/yeni` ekranlarında kolon genişlikleri kontrol edilir.
