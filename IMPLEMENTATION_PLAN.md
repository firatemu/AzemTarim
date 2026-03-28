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
