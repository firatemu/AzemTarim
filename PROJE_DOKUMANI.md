# AzemTarim Proje Dokümantasyonu

> **Hazırlanma Tarihi:** 2026-05-13
> **Proje Tipi:** ERP (Enterprise Resource Planning) - Tarım/Depo Yönetimi Sistemi
> **Durum:** Aktif Geliştirme

---

## 1. Proje Genel Bakış

AzemTarim, Türkiye pazarına yönelik kapsamlı bir ERP sistemidir. Özellikle **tarım sektörü** ve **depo/raf yönetimi** için tasarlanmıştır. Sistem, çoklu tenant mimarisi ile birden fazla firma/bayi'nin bağımsız olarak kullanmasına olanak tanır.

### 1.1 Temel Özellikler

- **Çoklu Tenant Desteği:** Her tenant (firma) kendi veritabanı ve konfigürasyonuna sahiptir
- **Modüler Yapı:** Stok, Cari, Satış, Finans, Depo Yönetimi gibi bağımsız modüller
- **E-Fatura Entegrasyonu:** Hizli Bilişim API ile e-fatura gönderimi/alımı
- **Depo Yönetimi:** Ambar transferleri, stok sayımı, raf yönetimi
- **Finansal İşlemler:** Çek/Senet, Banka, Kasa, Tahsilat/Ödeme
- **İnsan Kaynakları:** Personel, Maaş, Avans yönetimi

---

## 2. Teknik Mimarisi

### 2.1 Teknoloji Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Frontend** | Next.js (App Router) | 16.2.1 |
| **UI Framework** | MUI (Material UI) | 7.x |
| **State Management** | Zustand + React Query | - |
| **Backend** | NestJS | 10.x |
| **ORM** | Prisma | 6.18.0 |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Object Storage** | MinIO | - |
| **API Gateway** | Traefik | 3.x |

### 2.2 Proje Yapısı

```
AzemTarim/
├── api-stage/                    # Backend (NestJS)
│   ├── server/
│   │   ├── src/
│   │   │   ├── modules/         # NestJS modülleri (73 adet)
│   │   │   ├── common/          # Ortak servisler, guards, interceptors
│   │   │   ├── app.module.ts    # Ana uygulama modülü
│   │   │   └── main.ts          # Uygulama giriş noktası
│   │   └── prisma/
│   │       ├── schema.prisma    # Veritabanı şeması (5590 satır)
│   │       └── migrations/      # Prisma migration dosyaları
│   └── prisma/
│       └── schema.prisma        # Ana veritabanı şeması
│
├── panel-stage/                  # Frontend (Next.js)
│   └── client/
│       └── src/
│           ├── app/
│           │   ├── (main)/       # Ana sayfalar (dashboard, stock, accounts, vb.)
│           │   ├── api/          # Server Actions
│           │   └── login/       # Login sayfası
│           ├── components/      # React bileşenleri
│           │   ├── common/      # Ortak bileşenler (StandardPage, StandardCard)
│           │   ├── stock/        # Stok modülü bileşenleri
│           │   ├── accounts/     # Cari modülü bileşenleri
│           │   └── ...
│           ├── config/
│           │   └── menuItems.ts  # Menü yapılandırması
│           ├── lib/
│           │   ├── axios.ts       # HTTP client
│           │   ├── theme.ts      # MUI tema konfigürasyonu
│           │   └── query-keys.ts # React Query cache keys
│           └── store/           # Zustand store dosyaları
│
├── infra/                        # Altyapı
│   └── compose/
│       ├── docker-compose.base.yml    # Ana Docker Compose
│       ├── docker-compose.dev.yml     # Geliştirme
│       ├── docker-compose.staging.yml # Staging
│       └── docker-compose.prod.yml    # Production
│
└── docs/                         # Dokümantasyon
```

### 2.3 Docker İzolasyonu

AzemTarim tamamen bağımsız Docker kaynakları kullanır:

| Servis | Container Adı | Port | Volume |
|--------|--------------|------|--------|
| PostgreSQL | `azemtarim_postgres` | 5435 | `azemtarim_postgres_data` |
| Redis | `azemtarim_redis` | 6371 | `azemtarim_redis_data` |
| MinIO | `azemtarim_minio` | 9200 | `azemtarim_minio_data` |
| API | `azemtarim_api` | 3000 | - |
| Panel | `azemtarim_panel` | 3000 | - |

---

## 3. Veritabanı Şeması (Prisma)

### 3.1 Ana Modeller (150+ model)

Veritabanı şeması `/api-stage/server/prisma/schema.prisma` dosyasında tanımlıdır (5590 satır).

**Temel Modeller:**

#### Finans & Muhasebe
- `Account` - Cari hesaplar
- `AccountMovement` - Cari hareketleri
- `AccountTransaction` - Hesap işlemleri
- `Bank` - Banka tanımları
- `BankAccount` - Banka hesapları
- `BankAccountMovement` - Banka hareketleri
- `BankTransfer` - Banka transferleri
- `Cashbox` - Kasa tanımları
- `CashboxMovement` - Kasa hareketleri
- `Collection` - Tahsilat/Ödeme
- `Payment` - Ödemeler
- `Invoice` - Faturalar
- `InvoiceItem` - Fatura kalemleri
- `InvoiceCollection` - Fatura tahsilatları

#### Stok Yönetimi
- `Product` - Ürün/Stok kartları
- `Category` - Kategoriler
- `Brand` - Markalar
- `Unit` - Birimler
- `UnitSet` - Birim setleri
- `ProductBarcode` - Barkodlar
- `ProductMovement` - Stok hareketleri
- `ProductLocationStock` - Lokasyon bazlı stok
- `PriceCard` - Fiyat kartları
- `PriceList` - Fiyat listeleri
- `PriceListItem` - Fiyat listesi kalemleri

#### Depo & Raf Yönetimi
- `Warehouse` - Depo tanımları
- `Location` - Depo lokasyonları (raf/slot)
- `Shelf` - Raf tanımları
- `WarehouseTransfer` - Depo transferleri
- `WarehouseTransferItem` - Transfer kalemleri
- `StockMove` - Stok hareketleri (PUT_AWAY, TRANSFER, PICKING, vb.)
- `WarehouseStockThreshold` - Kritik stok seviyeleri
- `WarehouseCriticalStock` - Kritik stok uyarıları

#### Satış Yönetimi
- `SalesOrder` - Satış siparişleri
- `SalesOrderItem` - Sipariş kalemleri
- `SalesDeliveryNote` - Satış irsaliyeleri
- `SalesDeliveryNoteItem` - İrsaliye kalemleri
- `PurchaseOrder` - Satın alma siparişleri
- `PurchaseOrderItem` - Satın alma kalemleri
- `PurchaseDeliveryNote` - Alış irsaliyeleri
- `Quote` - Teklifler
- `QuoteItem` - Teklif kalemleri

#### Çek & Senet
- `CheckBill` - Çek/Senet kayıtları
- `CheckBillJournal` - Bordro numaralandırma
- `CheckBillApprovalWorkflow` - Onay workflow
- `CheckBillBankSubmission` - Banka gönderimi
- `CheckBillCollection` - Tahsilat
- `CheckBillEndorsement` - Ciro
- `CheckBillProtestTracking` - Protesto takibi

#### İnsan Kaynakları
- `Employee` - Personel
- `SalaryPlan` - Maaş planları
- `SalaryPayment` - Maaş ödemeleri
- `Advance` - Avans
- `AdvanceSettlement` - Avans mahsubu

#### Sistem & Yönetim
- `Tenant` - Firma/tenant tanımları
- `User` - Kullanıcılar
- `Role` - Roller
- `Permission` - İzinler
- `SystemParameter` - Sistem parametreleri
- `CodeTemplate` - Numara şablonları

### 3.2 Ortak Alanlar

Tüm modellerde standart olarak bulunan alanlar:

```prisma
model ModelName {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime?  @map("deleted_at") // Soft delete
  tenantId  String    @map("tenant_id")  // Tenant izolasyonu

  @@index([tenantId])
  @@index([deletedAt])
}
```

### 3.3 Enum Tipleri

```prisma
enum StockMoveType {
  PUT_AWAY    // Rafe yerleştirme
  TRANSFER    // Transfer
  PICKING     // Sipariş hazırlama
  ADJUSTMENT  // Düzeltme
  SALE        // Satış
  RETURN      // İade
  DAMAGE      // Hasar
}

enum InvoiceType {
  SALES        // Satış faturası
  PURCHASE     // Alış faturası
  RETURN_SALES // Satış iade
  RETURN_PURCHASE // Alış iade
}

enum CheckBillStatus {
  PENDING
  IN_PORTFOLIO
  AT_BANK
  COLLECTED
  RETURNED
  PROTESTED
  CANCELED
}
```

---

## 4. Frontend Sayfaları

### 4.1 Menü Yapısı (menuItems.ts)

Frontend `/panel-stage/client/src/config/menuItems.ts` dosyasında tanımlı menü yapısı:

#### Ana Menüler

| Menu | Açıklama | Alt Sayfalar |
|------|----------|--------------|
| **Dashboard** | Ana panel | - |
| **Stok Yönetimi** | Ürün/stok yönetimi | Malzeme Listesi, Fiyat Kartları, Malzeme Hareketleri, Kategori Yönetimi, Marka Yönetimi, Birim Setleri, Satış Fiyatları, Satın Alma Fiyatları, Toplu Satış Fiyat Güncelleme, Maliyetlendirme, Kritik Stok |
| **Cari Yönetimi** | Müşteri tedarikçi | Cari Listesi, Fatura Kapatma & Ekstre, Borç Alacak Durumu, Vade Analizi |
| **Satış Yönetimi** | Satış süreçleri | Faturalar (Satış, Alış, İade, Arşiv, E-Fatura), İrsaliyeler, Siparişler, Teklifler |
| **Finans** | Para işlemleri | Tahsilat & Ödeme, Banka İşlemleri, Çek & Senet, Ödemeler, Kasa |
| **İnsan Kaynakları** | Personel | Personel Listesi, Maaş Yönetimi, Avans Yönetimi |
| **Depo & Raf Yönetimi** | Ambar | Depo Yönetimi, Ambar Transfer Fişi, Transfer İşlemi, Stok Sayım, Ambar Stok Raporu, Depo Raporları |
| **Raporlama** | Raporlar | Genel Özet, Portföy Raporu, Satış Elemanı Performansı, Cari Risk Limitleri |
| **Ayarlar** | Sistem ayarları | Çek/Senet, Hızlı Menü, Satış Elemanları, Numara Şablonları, Parametreler, Sistem İzleme, Firma Ayarları |
| **Yetkilendirme** | Kullanıcı yönetimi | Kullanıcılar, Roller & İzinler |

### 4.2 Sayfa Listesi (panel-stage/client/src/app/(main)/)

```
accounts/                    # Cari Yönetimi
  page.tsx                   # Cari listesi
  [id]/page.tsx            # Cari detay
  invoice-closing/         # Fatura kapatma
  reports/borc-alacak/     # Borç alacak raporu

authorization/              # Yetkilendirme
  page.tsx                 # Kullanıcı listesi
  roller/page.tsx          # Rol yönetimi

bank/                       # Banka
  page.tsx                 # Banka hesapları
  credit-operations/       # Kredi işlemleri

bank-transfer/              # Havale
  gelen/                   # Gelen havale
  giden/                   # Giden havale
  silinen/                 # Silinen kayıtlar

cash/                       # Kasa
  page.tsx
  [id]/page.tsx

checks/                     # Çek/Senet
  page.tsx                 # Liste
  new/page.tsx            # Yeni evrak
  reports/                # Raporlar

collection/                 # Tahsilat/Ödeme
  page.tsx
  [id]/page.tsx
  print/[id]/page.tsx     # Yazdırma

dashboard/                  # Dashboard
  page.tsx

data-import/                # Veri Aktarımı
  cari-hesap-aktarim/
  malzeme-aktarim/
  satis-fiyat-aktarim/
  satin-alma-fiyat-aktarim/

e-invoice/                  # E-Fatura
  incoming/               # Gelen e-faturalar

expense/                    # Masraf
  page.tsx

hr/                         # İK
  personel/page.tsx
  salary-management/page.tsx
  advances/page.tsx

inventory-count/            # Stok Sayım
  page.tsx
  liste/page.tsx
  raf-bazli/page.tsx

invoice/                    # Faturalar
  sales/                  # Satış faturaları
  purchase/               # Alış faturaları
  return/sales/           # Satış iade
  return/purchase/         # Alış iade
  profitability/          # Karlılık
  archive/                # Arşiv

menu/                       # Menü
  page.tsx

orders/                     # Siparişler
  sales/                  # Satış siparişleri
  preparation-list/       # Sipariş hazırlama

payments/                   # Ödemeler
  page.tsx

payroll/                    # Bordro
  page.tsx
  new/page.tsx
  [id]/page.tsx

purchase-delivery-note/     # Alış irsaliyesi
  page.tsx

purchase-orders/            # Satın alma siparişleri
  page.tsx

quotes/                     # Teklifler
  sales/
  purchase/

reporting/                  # Raporlama
  page.tsx
  satis-elemani/

reports/                    # Raporlar
  portfolio/              # Portföy raporu
  cari-risk-limitleri/

sales-delivery-note/        # Satış irsaliyesi
  page.tsx

settings/                   # Ayarlar
  page.tsx
  company-settings/
  parameters/
  quick-menu/
  sales-staff/
  number-templates/
  logs/

stock/                      # Stok
  page.tsx
  material-list/
  price-cards/
  material-movements/
  category-management/
  brand-management/
  unit-sets/
  sales-prices/
  purchase-prices/
  bulk-sales-price-update/
  costing/
  critical-stock-management/

warehouse/                   # Depo
  page.tsx
  warehouses/
  transfer-note/
  operations/transfer/
  stock-report/
  reports/
```

---

## 5. Backend Modülleri

Backend `/api-stage/server/src/modules/` dizininde 73 adet NestJS modülü bulunur:

### 5.1 Modül Listesi

```
modules/
├── account/           # Cari hesaplar
├── account-balance/   # Hesap bakiyesi
├── account-movement/  # Hesap hareketleri
├── admin/            # Yönetici işlemleri
├── advance/          # Avans
├── analytics/       # Analitik
├── auth/             # Kimlik doğrulama
├── bank/             # Banka
├── bank-account/     # Banka hesapları
├── bank-transfer/    # Havale
├── brand/            # Marka
├── cashbox/          # Kasa
├── category/         # Kategori
├── check-bill/       # Çek/Senet
├── code-template/    # Numara şablonu
├── collection/       # Tahsilat
├── company-credit-card/
├── company-vehicles/
├── costing/          # Maliyetlendirme
├── customer-vehicle/
├── dashboard/
├── employee/
├── expense/
├── internal/
├── inventory-count/
├── invoice/
├── invoice-profit/
├── journal-entry/
├── licenses/
├── location/
├── notifications/
├── order/
├── part-request/
├── payments/
├── permissions/
├── plans/
├── postal-code/
├── price-card/
├── price-list/
├── product/
├── product-barcode/
├── product-movement/
├── purchase-orders/
├── purchase-waybill/
├── quick-invoice/
├── quote/
├── reporting/
├── roles/
├── salary-payment/
├── salary-plan/
├── sales-agent/
├── sales-waybill/
├── service-invoice/
├── shared/
├── simple-order/
├── stock-move/
├── storage/
├── subscriptions/
├── system-parameter/
├── technicians/
├── tenants/
├── unit-set/
├── users/
├── vehicle-brand/
├── vehicle-expenses/
├── warehouse/
├── warehouse-critical-stock/
└── warehouse-transfer/
```

### 5.2 API Yapısı

API endpoint'leri `/api/` prefix'i altında sunulur:

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/health` | Sağlık kontrolü |
| `POST /api/auth/login` | Giriş |
| `GET /api/products` | Ürün listesi |
| `POST /api/invoices` | Fatura oluşturma |
| `PATCH /api/invoice/:id` | Fatura güncelleme |
| `GET /api/tenants` | Tenant listesi |
| `GET /api/system-parameters/:key` | Sistem parametreleri |

---

## 6. Konfigürasyon Dosyaları

### 6.1 Frontend Konfigürasyonları

| Dosya | Açıklama |
|-------|----------|
| `panel-stage/client/src/config/menuItems.ts` | Menü yapılandırması |
| `panel-stage/client/src/lib/axios.ts` | Axios instance (baseURL, interceptors) |
| `panel-stage/client/src/lib/theme.ts` | MUI tema (dark/light mode) |
| `panel-stage/client/next.config.ts` | Next.js konfigürasyonu |
| `panel-stage/client/src/app/layout.tsx` | Root layout |

### 6.2 Backend Konfigürasyonları

| Dosya | Açıklama |
|-------|----------|
| `api-stage/server/src/main.ts` | NestJS bootstrap |
| `api-stage/server/src/app.module.ts` | Ana modül |
| `api-stage/server/src/common/` | Guard, Interceptor, Pipe |
| `api-stage/server/prisma/schema.prisma` | Veritabanı şeması |

### 6.3 Docker/Infra Konfigürasyonları

| Dosya | Açıklama |
|-------|----------|
| `infra/compose/docker-compose.base.yml` | Ana Docker Compose |
| `infra/compose/.env.staging` | Environment değişkenleri |
| `infra/data/postgres/` | PostgreSQL veri dizini |

---

## 7. Ortak Bileşenler ve Yardımcı Dosyalar

### 7.1 Frontend Ortak Bileşenleri

| Dosya | Açıklama |
|-------|----------|
| `components/common/StandardPage.tsx` | Sayfa iskeleti |
| `components/common/StandardCard.tsx` | Kart iskeleti |
| `lib/theme.ts` | MUI tema konfigürasyonu |
| `lib/axios.ts` | HTTP client |
| `lib/query-keys.ts` | React Query cache keys |

### 7.2 Backend Ortak Servisleri

| Dosya | Açıklama |
|-------|----------|
| `common/prisma.service.ts` | Prisma client singleton |
| `common/tenant.service.ts` | Tenant resolver |
| `common/email.service.ts` | E-posta gönderimi |

---

## 8. Çalışma Kuralları (Agent Guidelines)

### 8.1 Kodlama Standartları

1. **Tenant İzolasyonu:** Tüm veritabanı sorguları `tenantId` filter içermeli
2. **Soft Delete:** Silinen kayıtlar `deletedAt` ile işaretlenmeli, fiziksel silinmemeli
3. **UUID Kullanımı:** Tüm primary key'ler `uuid()` olmalı
4. **Token Kullanımı:** Renk değerleri için CSS variable kullanılmalı (hex/rgb yasak)

### 8.2 Dosya Düzeni

```
src/
├── app/(main)/           # Sayfa bileşenleri (route)
├── components/           # Paylaşılan bileşenler
├── lib/                  # Yardımcı fonksiyonlar
├── store/               # Zustand store
└── types/               # TypeScript tipleri
```

### 8.3 API Geliştirme

1. **DTO:** Her endpoint için class-validator DTO
2. **Swagger:** @ApiProperty ile dokümantasyon
3. **Transaction:** Çoklu işlemler için Prisma $transaction

---

## 9. Önemli URL'ler ve Portlar

| Servis | URL | Port |
|--------|-----|------|
| **Frontend** | http://azemtarim.localhost | 3000 (iç) |
| **Backend API** | http://azemtarim.localhost/api | 3000 (iç) |
| **PostgreSQL** | - | 5435 |
| **Redis** | - | 6371 |
| **MinIO Console** | - | 9200 |
| **MinIO API** | - | 9000 |

---

## 10. Test ve Deployment

### 10.1 Geliştirme

```bash
# Backend
cd api-stage/server && pnpm dev

# Frontend
cd panel-stage/client && pnpm dev

# Docker Compose (tüm servisler)
cd infra/compose && docker compose -f docker-compose.base.yml up -d
```

### 10.2 Rebuild Panel (kod değişikliklerinde)

```bash
cd infra/compose
docker compose -f docker-compose.base.yml build --no-cache panel
docker compose -p azemtarim -f docker-compose.base.yml up -d panel
```

### 10.3 Rebuild API

```bash
cd infra/compose
docker compose -f docker-compose.base.yml build --no-cache api
docker compose -p azemtarim -f docker-compose.base.yml up -d api
```

---

## 11. Mevcut Bilinen Durumlar

### 11.1 Kaldırılan Modüller (Tamamen Silindi)

Aşağıdaki modüller projeden tamamen kaldırılmıştır:
- **Put-Away İşlemi** - Raf yerleştirme işlemi
- **Sipariş Hazırlama** - Sipariş hazırlama listesi
- **İş Emri (WORK_ORDER)** - Work order modülü ve tüm bağımlılıkları
- **Servis Faturası (SERVICE_INVOICE)** - Service invoice modülü
- **Teknisyen (TECHNICIAN)** - Technician modülü
- **POS Console (POS_CONSOLE)** - POS console modülü

### 11.2 Aktif Modüller

Numara Şablonları sayfasında şu modüller desteklenir:
- PRODUCT, CUSTOMER
- INVOICE_SALES, INVOICE_PURCHASE
- ORDER_SALES, ORDER_PURCHASE
- DELIVERY_NOTE_SALES, DELIVERY_NOTE_PURCHASE
- QUOTE, WAREHOUSE, WAREHOUSE_TRANSFER, INVENTORY_COUNT
- CASHBOX, CHECK_BILL_JOURNAL, CHECK_BILL_DOCUMENT
- PERSONNEL

---

## 12. Hızlı Başlangıç Komutları

```bash
# Proje dizinine git
cd /home/azem/projects/AzemTarim

# Docker servislerini başlat
cd infra/compose && docker compose -p azemtarim -f docker-compose.base.yml up -d

# Frontend'i yeniden build et
docker compose -f docker-compose.base.yml build --no-cache panel

# API'yi yeniden build et
docker compose -f docker-compose.base.yml build --no-cache api
```

---

> **Not:** Bu dokümantasyon 2026-05-13 tarihinde oluşturulmuştur. Güncellemeler için projeyi yeniden incelemeniz önerilir.