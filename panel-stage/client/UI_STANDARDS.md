# OtoMuhasebe UI Standartları (POS hariç)

Bu doküman, `panel-stage/client` içinde oluşturulacak **yeni sayfa ve bileşenlerin** renk bütünlüğü, layout bütünlüğü ve component kullanım bütünlüğünü korumak için hazırlanmıştır.

## Kapsam

- **Kapsam dahil:** `panel-stage/client/src/app/(main)/**` içinde POS dışındaki tüm sayfalar.
- **Kapsam hariç (istisna):** `panel-stage/client/src/app/(main)/pos/**` (dokunmatik ekran için ayrı tasarım dili).

## 1) Renk Bütünlüğü

Proje genelinde tasarım dili şu global token seti üzerinden çalışır:

- Token dosyası: `panel-stage/client/src/styles/design-system.css`
- Theme sağlayıcı: `panel-stage/client/src/app/ClientProviders.tsx` (MUI `ThemeProvider`)
- Kural: Yeni kodda **hard-coded hex/rgb** değer yerine token kullan.

### 1.1 Kullanılacak ana tokenlar

- Arka plan: `var(--background)`
- Metin: `var(--foreground)`
- Kart/Container: `var(--card)`, `var(--card-foreground)`
- Bölücü/çerçeve: `var(--border)`
- Birincil aksiyon: `var(--primary)`, `var(--primary-hover)`, `var(--primary-foreground)`
- İkincil vurgu: `var(--secondary)`, `var(--secondary-hover)`, `var(--secondary-light)`, `var(--secondary-foreground)`
- Muted: `var(--muted)`, `var(--muted-foreground)`
- Uyarı/tehlike: `var(--destructive)`, `var(--destructive-foreground)`
- Grafikler: `var(--chart-1)` ... `var(--chart-5)`
- Radius/shadow: `var(--radius)`, `var(--shadow-sm)` (ve ilgili shadow tokenları)

Not: `design-system.css` içinde `.dark` sınıfı ile aynı tokenlar otomatik değişir. Bu yüzden hard-code renkler yerine token kullanmak dark mode uyumluluğunu garanti eder.

### 1.2 Yasaklar

- `:root { ... }` veya `.dark { ... }` gibi global override eklemeyin. (POS hariç diğer yerler için)
- Token dışı renk üretmeyin (ör: `background: '#fff'`, `color: '#0a0c10'` gibi).
- MUI dark mode ile çakışabilecek özel sınıf/inline renk üretmeyin.

## 2) Layout Bütünlüğü

Yeni sayfalar, mümkünse ortak bir iskelet üzerinden ilerlemeli.

### 2.1 Standart wrapper

- Sayfa düzeyinde: `panel-stage/client/src/components/common/StandardPage.tsx`
- Kapsayıcı içerik: mevcut örnek (referans) `panel-stage/client/src/components/common/PageContainer.tsx`

Standart wrapper kullanıldığında:

- arka plan `var(--background)` olur,
- padding responsive şekilde yönetilir,
- kart/section görsel dili aynı kalır.

### 2.2 Sticky / overflow

Yeni sayfalarda:

- `overflowX` ihtiyacı yoksa açıkça ayarlanmasın.
- İç scroll gereken bölgelerde `overflowY: 'auto'` kullanılır.
- Sticky elemanlar varsa `zIndex` değerleri çakışmayacak şekilde düşünülmelidir (ör: app bar/tab bar ile).

## 3) Component Bütünlüğü

### 3.1 Form kontrolleri

`design-system.css` içinde bulunan mevcut sınıfları kullanın:

- Select wrapper: `className="form-control-select"`
- TextField wrapper: `className="form-control-textfield"`

Bu sınıflar MUI dark/light uyumunu ve outline/border davranışlarını standardize eder.

### 3.2 Kart/Surface yüzeyleri

Kart/section yüzeyi için `StandardCard` kullanın:

- `panel-stage/client/src/components/common/StandardCard.tsx`

Böylece:

- `var(--card)` zemin,
- `var(--border)` border,
- `var(--radius)` radius,
- `var(--shadow-sm)` shadow dili sabit kalır.

## 4) Responsive Bütünlük (Telefon/Tablet Tam Uyum)

- POS dışındaki her sayfa `xs` ve `sm` dahil olmak üzere responsive olmalı; telefon/tablet tam uyum için elemanlar `flex`, `grid`, `wrap`, `fullWidth` ve MUI responsive props ile yönetilmeli.
- Sabit `width`/`height` ile “kırılacak” layoutlardan kaçın:
  - Tablolarda kolonlar için mümkünse `flex` + `minWidth` kullan.
  - Modallar/dialoglar `fullWidth` olmalı; çok küçük ekranlarda `maxWidth="sm"` yaklaşımı tercih edilmeli.
- `xs`’te kritik farklı bir yerleşim gerekiyorsa ayrı tasarım yapılmalı:
  - `Stack` yönünü `xs` için `column`, daha büyük kırılımlarda `row` yap.
  - Filtreleri `Collapse`/accordion mantığıyla (tıklanabilir) göster.

## 5) Tablo Standartları (Tablo Ekleme Standardı)

Her yeni tablo/`DataGrid` eklenirken aşağıdaki standartlar uygulanmalı:

- Arama var mı? (Search input + state)
- Hızlı filtreler var mı? (`Bugün`, `Bu Hafta`, `Bu Ay` çipleri)
- Yenileme butonu var mı?
- Excel ile indirme action’ı var mı?
- Kolon sıralama (A-Z / Z-A) destekleniyor mu?
- Boyutlar otomatik uyumlu mu? (kolonlarda `flex` + `minWidth`)
- Sayısal kolonlar için tablo altı “footer sum” (toplam/özet) var mı? (örn. `Tutar`)
- Pagination default `25` + seçenek `{25,50,100}` var mı?
- Dark/Light uyumu tokenlar üzerinden doğru mu?
- Tablo ile ilişkili 3-4 KPI/özet kart sayfa üstünde var mı? (aynı filtre parametreleriyle güncellenmeli)

## 6) Popup / Modal Sayfalar (Minimal Header + Scroll’suz Tasarım)

Popup olarak açılan ekranlar (Dialog/Modal/Drawer içinde açılan “mini sayfalar”) şu kurala uyar:

- Header **minimalist** olmalı:
  - Tek satır başlık + sağda kapat (`X`) + (opsiyonel) tek bir birincil aksiyon
  - Büyük ikonlar, gradient header, kalabalık buton grupları kullanılmaz
- İçerik “tek ekranda” görünecek şekilde tasarlanmalı:
  - Amaç: kullanıcı **scroll yapmadan** tüm kritik alanları görebilmeli
  - Gerekirse alanları 2 sütun yerine tek sütuna düşür (`xs` için)
  - Zorunlu durumlarda (çok kalemli tablolar gibi) scroll sadece “kalem listesi” gibi tek bir bölgeye verilir; header/footer sabit kalır
- Dialog ölçüleri:
  - `fullWidth` + uygun `maxWidth` kullan
  - Mobilde taşma yapmayacak şekilde `xs`/`sm` yerleşim düşün

## 7) POS İstisnası

- `panel-stage/client/src/app/(main)/pos/**` bu standartların dışındadır.
- POS sayfası dokunmatik ekran performansı/ergonomisi için kendi renk ve layout variable’larını kullanır.

## 8) Kısa “Yeni Sayfa” Kontrol Listesi

- [ ] Renkler token ile (var(--...)) üretildi mi?
- [ ] Sayfa wrapper’ı `StandardPage` (veya `PageContainer`) ile mi kuruldu?
- [ ] Kart/section yüzeyleri `StandardCard` ile mi?
- [ ] Form alanları `form-control-select` / `form-control-textfield` sınıfları ile mi?
- [ ] Global `:root`/`.dark` override eklenmiş mi? (POS değilse hayır)
- [ ] Sayfa `xs`/`sm` responsive davranıyor mu?
- [ ] Sayfada tablo varsa: arama + Bugün/Hafta/Ay + yenileme + excel + sort + pagination(25/50/100) + tablo altı sum/özet var mı?

