  
**OtoMuhasebe**

Kapsamlı Teknik Proje Raporu

| Rapor Tarihi | 19 Mart 2026 |
| :---- | :---- |
| **Versiyon** | Backend 0.0.1 · Frontend 1.0.0 |
| **Proje Türü** | Multi-tenant ERP/SaaS Platform |
| **Sektör** | Otomotiv Yedek Parça / Genel Ticaret |
| **Ortam** | Staging (Docker Compose \+ Caddy) |

*Uzman mühendisler ve pro seviyesinde yazılım uzmanları için hazırlanmıştır.*

# **1\. Proje Genel Bilgisi**

## **1.1 Proje Tanımı**

OtoMuhasebe, otomotiv yedek parça satışı yapan bayiler, distribütörler, oto servisleri ve genel ticaret işletmeleri için geliştirilmiş, Türkçe bir Multi-tenant ERP/SaaS platformudur. Tek platformda fatura, stok, cari hesap, POS, iş emri ve bordro yönetimini birleştirmektedir.

## **1.2 Temel Özellikler**

* Multi-tenant mimari: Çoklu işletme desteği, RLS ile tam veri izolasyonu

* POS Sistemi: Hızlı satış ekranı, barkod okuma, dokunmatik optimizasyon, kasiyer session yönetimi

* Fatura Yönetimi: Satış, alış, satış iadesi, alış iadesi; e-Fatura entegrasyonu altyapısı hazır

* Stok Yönetimi: Depo yönetimi, transfer, envanter sayımı, kritik stok uyarıları, weighted average maliyet

* Cari Hesap: Borç-alacak takibi, tahsilat, çek/senet, vade analizi

* İnsan Kaynakları: Personel yönetimi, bordro planı, avans

* Servis & İş Emri: İş emri oluşturma, parça talebi, müşteri araçları, servis faturası

* Raporlama: Dashboard, finansal raporlar, kârlılık analizi, Excel export

* SaaS Altyapısı: İyzico ödeme entegrasyonu, plan/modül lisanslama sistemi

# **2\. Teknoloji Yığını**

## **2.1 Backend Stack**

| Kategori | Teknoloji | Versiyon | Açıklama |
| :---- | :---- | :---- | :---- |
| Runtime | Node.js | 20 Alpine | LTS |
| Framework | NestJS | 11.1.8 | REST API, modüler yapı |
| Dil | TypeScript | 5.9.3 | Strict mode |
| ORM | Prisma | 6.18.0 | Type-safe DB access |
| Veritabanı | PostgreSQL | 16 Alpine | Primary datastore, RLS |
| Cache / Queue | Redis | 7 Alpine | Session, JWT blacklist, BullMQ backend |
| Object Storage | MinIO | Latest | S3-compatible, dosya depolama |
| Auth | Passport \+ JWT | 11.x / 4.0.1 | Bearer token, refresh token |
| Validation | class-validator | 0.14.2 | DTO validation |
| API Docs | Swagger/OpenAPI | 11.2.6 | /api-docs endpoint |
| Rate Limit | @nestjs/throttler | 6.4.0 | 1000 req/dk, global guard |
| Queue | BullMQ | 5.41.6 | Arka plan işleri (PDF, email, export) |
| PDF | pdfmake | 0.2.20 | Fatura/rapor PDF üretimi |
| Excel | exceljs | 4.4.0 | Excel export/import |
| E-posta | nodemailer | 7.0.10 | Davet, bildirim |
| Security | helmet \+ bcrypt | 8.1.0 / 6.0.0 | HTTP headers, şifre hash |
| Compression | compression | 1.8.1 | Gzip response |

## **2.2 Frontend Stack**

| Kategori | Teknoloji | Versiyon | Açıklama |
| :---- | :---- | :---- | :---- |
| Framework | Next.js | 16.0.1 | App Router, Turbopack dev |
| UI Runtime | React | 19.2.0 | Latest |
| Component Library | Material-UI (MUI) | 7.3.7 | Material Design 3 |
| Data Grid | @mui/x-data-grid | 8.16.0 | Tablo, sayfalama, filtre |
| State | Zustand | 5.0.8 | Client state yönetimi |
| Data Fetching | TanStack Query | 5.90.6 | Server state, cache |
| Forms | react-hook-form | 7.65.0 | Form yönetimi |
| Validation | Zod | 4.1.12 | Schema validation |
| Charts | Recharts | 3.3.0 | Dashboard grafikleri |
| Barkod | @zxing/browser | 0.1.5 | Kamera ile barkod okuma |
| PWA | next-pwa | 5.6.0 | Offline cache (production aktif) |
| Toast | notistack \+ react-hot-toast | 3.0.2 / 2.6.0 | Bildirim sistemi |
| Styling | Emotion \+ Tailwind | 11.14.x / 3.4.19 | CSS-in-JS \+ utility classes |

## **2.3 DevOps & Altyapı**

| Teknoloji | Açıklama | Detay |
| :---- | :---- | :---- |
| Docker | Container | Multi-stage build, node:20-alpine |
| Docker Compose | Orchestration | Base \+ Staging compose dosyaları |
| Caddy 2 | Reverse Proxy | SSL termination, routing |
| pnpm 10.20.0 | Package Manager | Frontend için |
| SWC | Build | NestJS fast compilation |
| ESLint 9.38.0 | Linter |  |
| Prettier 3.6.2 | Formatter |  |
| Husky | Git Hooks | Pre-commit hooks |

# **3\. Sistem Mimarisi**

## **3.1 Katmanlı Mimari**

| Katman 1 — Kullanıcı: Browser (Web / PWA) Katman 2 — Reverse Proxy: Caddy 2 → SSL termination, HTTP routing Katman 3 — Uygulama: Next.js 16 (Frontend) \+ NestJS 11 (Backend API) Katman 4 — Veri: PostgreSQL 16 \+ Redis 7 \+ MinIO |
| :---- |

## **3.2 Request Akışı**

1. İstek Caddy'ye ulaşır (port 80/443)

2. Caddy path'e göre yönlendirir: /api/\* → backend:3000, / → user-panel:3000

3. Backend: TenantMiddleware → JwtAuthGuard → Controller → Service → Prisma

4. Prisma her sorguda tenantId filtresi uygular (RLS)

5. Response istemciye döner

## **3.3 Multi-Tenant Mimarisi**

Veri izolasyonu üç katmanda sağlanmaktadır:

* Uygulama katmanı: Her Prisma sorgusunda where: { tenantId } zorunlu

* Middleware: TenantMiddleware her request'te x-tenant-id header'ından veya JWT payload'dan tenantId çıkarır

* Veritabanı: PostgreSQL Row Level Security (RLS) policies — ek güvenlik katmanı

* TenantContextModule: Request-scoped tenant bilgisi, servisler arası tutarlılık

## **3.4 Servisler & Portlar**

| Servis | Container | Port | Açıklama |
| :---- | :---- | :---- | :---- |
| Frontend (Next.js) | otomuhasebe\_saas\_panel | 3010 → 3000 | Turbopack dev, PWA prod |
| Backend (NestJS) | otomuhasebe\_saas\_backend | 3020 → 3000 | REST API, Swagger /api-docs |
| PostgreSQL 16 | otomuhasebe\_saas\_postgres | 5433 → 5432 | Primary DB |
| Redis 7 | otomuhasebe\_saas\_redis | 6379 (internal) | Session, JWT blacklist, BullMQ |
| MinIO | otomuhasebe\_saas\_minio | 9000 (API), 9001 (UI) | S3-compatible storage |
| Caddy 2 | — | 80, 443 | Reverse proxy \+ SSL |

# **4\. Backend Detayları**

## **4.1 Proje Yapısı**

| Schema: 4.453 satır, 144 Prisma model, 60+ enum Modül sayısı: 70+ feature modülü Test dosyaları: 5 spec dosyası (invoice orchestrator, reconciliation, account-effect, movement-helper, health) Global prefix: /api — tüm endpoint'ler /api altında Swagger: http://localhost:3020/api-docs |
| :---- |

## **4.2 Modül Kategorileri**

### **Finans & Muhasebe**

* invoice, invoice-orchestrator, quick-invoice, journal-entry

* cashbox, bank, bank-account, bank-transfer

* collection, check-bill, payment, expense

### **Stok & Depo**

* product, product-movement, product-barcode

* warehouse, warehouse-transfer, warehouse-critical-stock

* inventory-count, stock-move

### **Satış & Sipariş**

* pos, order, purchase-orders, simple-order

* sales-waybill, purchase-waybill, price-card, price-list

### **Servis & İş Emri**

* work-order, work-order-item, part-request

* service-invoice, customer-vehicle, company-vehicles, vehicle-expenses

### **İnsan Kaynakları**

* employee, salary-plan, salary-payment, advance

### **Platform & Yönetim**

* auth, tenants, users, roles, permissions, rls, admin

* storage (MinIO), reporting, dashboard, system-parameter

* code-template, e-invoice (GİB hazırlık), iyzico subscription

## **4.3 Global Konfigürasyon (main.ts)**

* Global prefix: /api

* CORS: localhost:3000, 3010, 3020, 3021 \+ staging domain'leri

* Validation: class-validator (whitelist, transform, forbidNonWhitelisted)

* Security: Helmet (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options)

* Compression: Gzip (compression middleware)

* Throttle: 1000 request/dakika (global ThrottlerGuard)

* Static: /api/uploads → uploads klasörü

## **4.4 Exception Handling Zinciri**

6. HttpExceptionFilter — 4xx/5xx HTTP hataları

7. PrismaExceptionFilter — Prisma ORM hataları (unique constraint, not found vb.)

8. AllExceptionsFilter — Catch-all, beklenmedik hatalar

9. TenantSecurityExceptionFilter — Tenant güvenlik ihlalleri

# **5\. Veritabanı Yapısı**

## **5.1 Özet**

| Özellik | Değer |
| :---- | :---- |
| Veritabanı | PostgreSQL 16 Alpine |
| Prisma Model Sayısı | 144 |
| Schema Satır Sayısı | 4.453 |
| Enum Sayısı | 60+ |
| Maliyet Yöntemi | Weighted Average (ağırlıklı ortalama) |
| Index Stratejisi | tenantId, unique constraints, composite index (tenantId \+ code) |
| RLS | PostgreSQL Row Level Security policies aktif |

## **5.2 Kritik Enum'lar**

| Enum | Değerler |
| :---- | :---- |
| InvoiceType | SALE, PURCHASE, RETURN\_SALE, RETURN\_PURCHASE |
| InvoiceStatus | DRAFT, OPEN, APPROVED, PARTIALLY\_PAID, CLOSED, CANCELLED |
| AccountType | CUSTOMER, SUPPLIER, EMPLOYEE |
| PaymentMethod | CASH, CREDIT\_CARD, TRANSFER, CHEQUE, PROMISSORY\_NOTE |
| MovementType | IN, OUT, ADJUSTMENT, TRANSFER |
| UserRole | SUPER\_ADMIN, ADMIN, USER, VIEWER |
| WorkOrderStatus | WAITING\_DIAGNOSIS, PENDING\_APPROVAL, APPROVED\_IN\_PROGRESS, PART\_WAITING, PARTS\_SUPPLIED, VEHICLE\_READY, INVOICED\_CLOSED, CLOSED\_WITHOUT\_INVOICE, CANCELLED |

# **6\. Güvenlik & Kimlik Doğrulama**

## **6.1 Authentication**

* JWT Access Token (Bearer) \+ Refresh Token

* Refresh token Redis'te saklanır; logout'ta JWT blacklist'e alınır

* Session tablosu ile aktif oturum takibi

* bcrypt ile şifre hashleme (bcrypt 6.0.0)

## **6.2 Authorization**

* JwtAuthGuard: Global guard — tüm route'lar varsayılan korumalı

* @Public() decorator: Açık endpoint'ler için

* Rol sistemi: SUPER\_ADMIN, ADMIN, USER, VIEWER

* RolesModule \+ PermissionsModule ile granüler yetkilendirme

## **6.3 Security Headers (Helmet)**

* Content-Security-Policy

* HSTS (HTTP Strict Transport Security)

* X-Frame-Options: DENY

* X-Content-Type-Options: nosniff

* Referrer-Policy: strict-origin-when-cross-origin

## **6.4 Tenant Güvenliği**

* TenantMiddleware: Her request'te tenantId doğrulaması

* TenantSecurityExceptionFilter: Cross-tenant erişim girişimlerini engeller

* Prisma sorgularında tenantId zorunlu

* PostgreSQL RLS: Veritabanı seviyesinde ek izolasyon katmanı

# **7\. Transaction Yönetimi & State Machine**

## **7.1 Prisma $transaction Kullanımı**

Projede Prisma interactive transaction (async (tx) \=\> {...}) 20'den fazla kritik noktada kullanılmaktadır. Tüm kullanımlar interactive modda olup nested transaction bulunmamaktadır; tx parametresi alt servislere geçirilmektedir.

| Modül | Dosya | Kullanım | Amaç |
| :---- | :---- | :---- | :---- |
| invoice | invoice.service.ts | 8 | Fatura CRUD, stok/cari atomik yürütme |
| invoice-orchestrator | invoice-orchestrator.service.ts | 3 | Approve, Cancel, Revert |
| pos | pos.service.ts | 3 | Satış tamamlama, iade, taslak fatura |
| work-order | work-order.service.ts | 8+ | Oluşturma, durum değişikliği, fatura |
| collection | collection.service.ts | 3 | Cross payment, hesap güncelleme |
| bank | bank.service.ts | 4 | Hareket, kredi, taksit ödeme |
| order | order.service.ts | 4 | Create, delete, ship items |
| sales-waybill | sales-waybill.service.ts | 3 | Create, update, soft delete |
| cashbox | cashbox.service.ts | 2 | Tahsilat, ödeme hareketleri |
| product | product.service.ts | 2 | Create, update |
| \+ diğerleri | purchase-orders, stock-move, part-request, price-card, employee, service-invoice | \~10 | Çeşitli atomik operasyonlar |

### **Kritik Transaction Senaryoları**

* Fatura onaylama: Stok hareketleri \+ cari hareketleri \+ fatura status — hepsi atomik

* Fatura iptal: Cari etkisi geri alma \+ stok etkisi \+ status CANCELLED — tek transaction

* POS satış: Fatura oluşturma \+ kalemler \+ stok/cari etkileri — tek transaction

* Cross payment (tahsilat): İki hesap hareketi \+ bakiye güncellemeleri — tek transaction

### **Bilinen Kör Nokta**

| Konu: getNextCode() transaction dışında çağrılıyor Etki: POS ve invoice create'de sıra numarası üretimi atomik değil Risk: Düşük — ancak yüksek eşzamanlı işlem hacminde race condition oluşabilir Öneri: getNextCode'u $transaction içine al veya PostgreSQL SEQUENCE kullan |
| :---- |

## **7.2 State Machine Geçiş Kuralları**

| Entity | Durum | Açıklama |
| :---- | :---- | :---- |
| WorkOrder | **TAM** | VALID\_STATUS\_TRANSITIONS explicit tanımlı, assertValidTransition her geçişte çalışıyor |
| Invoice | **RİSKLİ** | Sadece oldStatus \!== newStatus kontrolü — herhangi durumdan herhangi duruma geçiş mümkün |
| SalesOrder | **KISMİ** | Sadece INVOICED → değişiklik yasak; ara geçişler serbest |
| Quote | **KISMİ** | CONVERTED\_TO\_ORDER → değişiklik yasak; ara geçişler serbest |
| CheckBill / Stocktake | **YOK** | Geçiş kuralları service'de explicit tanımlı değil |

### **WorkOrder — Referans Pattern (Diğer Entity'lere Uygulanmalı)**

| İmmutable statuses: INVOICED\_CLOSED, CANCELLED, CLOSED\_WITHOUT\_INVOICE → değişiklik yasak Geçiş kontrolü: assertValidTransition(current, new) her updateStatus çağrısında Öneri: Bu pattern Invoice, CheckBill ve Stocktake için de implement edilmeli |
| :---- |

# **8\. Test Coverage**

## **8.1 Mevcut Durum**

| Backend test framework: Jest (NestJS default) Test script: package.json'da 'test' komutu TANIMLI DEĞİL Mevcut spec dosyaları: 5 adet Frontend test: Vitest / React Testing Library kurulumu YOK E2E test: Yapı görünmüyor |
| :---- |

## **8.2 Mevcut Spec Dosyaları**

| Dosya | Kapsam |
| :---- | :---- |
| invoice-orchestrator.service.spec.ts | approve, cancel, revert senaryoları |
| reconciliation.service.spec.ts | Cari tutarlılık kontrolü |
| account-effect.service.spec.ts | Cari etkisi servisi |
| movement-type.helper.spec.ts | Movement type helper |
| health.spec.ts | Health endpoint |

## **8.3 Eksikler & Önerilen Adımlar**

10. package.json'a test scriptleri ekle: "test", "test:watch", "test:cov"

11. jest.config.ts oluştur — @nestjs/testing \+ ts-jest konfigürasyonu

12. Mevcut 5 spec dosyasını çalıştır, baseline coverage ölç

13. Öncelikli modüller için test yaz: invoice, pos, collection, work-order

14. Coverage hedefi: Kritik modüllerde minimum %60

15. Invoice state machine netleştirilince geçiş kurallarını unit test ile doğrula

# **9\. Değerlendirme & Öncelik Listesi**

## **9.1 Genel Değerlendirme**

OtoMuhasebe, staging ortamında aktif, multi-tenant izolasyonu doğru kurulmuş, 70+ modülle gerçek enterprise ölçeğine ulaşmış bir projedir. $transaction kullanımı, BullMQ entegrasyonu, İyzico SaaS altyapısı ve kapsamlı güvenlik konfigürasyonu projenin olgunluğunu göstermektedir.

## **9.2 Güçlü Yönler**

* $transaction: 20+ kritik noktada doğru pattern ile kullanılmış — en büyük risk kapatılmış

* Multi-tenant: tenantId \+ Middleware \+ RLS üç katmanlı izolasyon — doğru mimari

* WorkOrder state machine: VALID\_STATUS\_TRANSITIONS \+ assertValidTransition referans kalitesinde

* Güvenlik stack'i: Helmet, bcrypt, JWT blacklist, rate limiting, CORS — eksiksiz

* Redis: Session \+ JWT blacklist \+ BullMQ — üç farklı amaçla doğru kullanım

* Stok maliyet yöntemi: Weighted average — yedek parça sektörü için doğru seçim

* SaaS altyapısı: İyzico entegrasyonu \+ plan/modül lisanslama sistemi hazır

## **9.3 Öncelikli Aksiyon Listesi**

| Öncelik | Aksiyon | Efor | Neden |
| :---- | :---- | :---- | :---- |
| **P1** | Invoice state machine — VALID\_STATUS\_TRANSITIONS ekle | 1-2 saat | CANCELLED → APPROVED şu an mümkün, veri bütünlüğü riski |
| **P1** | MinIO /tmp/minio-data → kalıcı volume'a taşı | 5 dakika | Container restart'ta dosya kaybı riski (logolar, ekler) |
| **P1** | next.config.ts: ignoreBuildErrors → false (production) | 1 dakika | TypeScript hataları sessizce production'a gidebilir |
| **P2** | Test altyapısını kur — package.json \+ jest.config.ts | 2-4 saat | Mevcut 5 spec bile çalıştırılamıyor |
| **P2** | getNextCode'u $transaction içine al | 30 dakika | POS/Invoice race condition — yüksek hacimde sorun çıkarır |
| **P2** | BullMQ job retry \+ dead letter queue konfigürasyonu | 3-5 saat | Redis düşerse kuyruk işleri (PDF, email) kaybolur |
| **P3** | CheckBill / Stocktake state machine tamamla | 3-6 saat | WorkOrder pattern uygulanmalı |
| **P3** | Invoice / POS / collection modülleri için unit test yaz | 1-2 hafta | Kritik modüllerde min %60 coverage hedefi |

## **9.4 ChatGPT Değerlendirmesiyle Karşılaştırma**

Önceki AI değerlendirmesi eksik bilgi tabanıyla yapılmış olup aşağıdaki önemli yanılgıları içeriyordu:

| ChatGPT'nin İddiası | Gerçek Durum | Not |
| :---- | :---- | :---- |
| $transaction yok | VAR (20+ yerde) | En büyük yanılgı |
| Rate limiting yok | VAR (@nestjs/throttler 6.4.0) | Global guard aktif |
| Form abstraction yok | VAR (react-hook-form \+ Zod) | Tam stack kurulu |
| Stok maliyet belirsiz | Weighted average uygulanmış | Yedek parça için doğru |
| CQRS/Kafka önerisi acil | Gereksiz erken optimizasyon | Şu an EventEmitter yeterli |
| Double-entry accounting şart | KOBİ ERP'lerde zorunlu değil | Cari bakiye otomatik güncellenirse yeterli |

# **10\. Entegrasyonlar & Deployment**

## **10.1 Mevcut Entegrasyonlar**

* E-Fatura (GİB): EInvoiceInbox, EInvoiceSend modelleri hazır — GİB API bağlantısı planlanıyor

* İyzico: Ödeme sağlayıcı, Subscription \+ Plan \+ ModuleLicense sistemi aktif

* SOAP/XML: strong-soap \+ xml2js — hızlı entegrasyon altyapısı

* MinIO: S3-uyumlu dosya depolama — logolar, ekler, raporlar

* BullMQ: PDF üretimi, email, Excel export arka plan işleri

## **10.2 Production Deployment Checklist**

16. ignoreBuildErrors: false — next.config.ts

17. MinIO volume: /tmp/minio-data → ./infra/data/minio

18. Rate limit değerleri production için sıkılaştır (1000 req/dk → daha kısıtlı)

19. Caddy SSL konfigürasyonu \+ domain yapılandırması

20. Environment değişkenleri: DATABASE\_URL, JWT\_SECRET, MINIO\_\*, REDIS\_URL, IYZICO\_\*

21. Prisma migrate deploy (migrate dev değil)

22. BullMQ retry \+ dead letter konfigürasyonu

23. Health check endpoint doğrulaması: /api/health

## **10.3 Önemli URL'ler**

| Servis | URL |
| :---- | :---- |
| Frontend | http://localhost:3010 |
| Backend API | http://localhost:3020/api |
| Swagger UI | http://localhost:3020/api-docs |
| MinIO Console | http://localhost:9001 |

# **11\. AI Agent için Profesyonel Prompt**

Aşağıdaki prompt, bu proje üzerinde çalışacak herhangi bir AI'a (Claude, GPT-4 vb.) gönderilmek üzere hazırlanmıştır. Proje bağlamını, mimariyi, mevcut eksikleri ve kodlama standartlarını içermektedir. Son satırdaki \[DESCRIBE YOUR SPECIFIC TASK HERE\] kısmı her görev için özelleştirilmelidir.

| You are an expert senior software engineer working on a production-grade Multi-tenant ERP/SaaS platform called OtoMuhasebe, built for the Turkish automotive spare parts industry. The project uses the following stack: STACK: \- Backend: NestJS 11, TypeScript 5.9 (strict), Prisma 6.18, PostgreSQL 16, Redis 7, MinIO, BullMQ, Passport/JWT, @nestjs/throttler, pdfmake, exceljs, nodemailer \- Frontend: Next.js 16 (App Router), React 19, MUI v7, Zustand 5, TanStack Query 5, react-hook-form 7 \+ Zod 4, Recharts, next-pwa, @zxing/browser \- Infrastructure: Docker Compose, Caddy 2 (reverse proxy), pnpm ARCHITECTURE: \- Multi-tenant: Every DB query includes tenantId. TenantMiddleware extracts tenantId from JWT or x-tenant-id header. PostgreSQL RLS provides additional isolation. \- Backend modules: 70+ NestJS feature modules, 144 Prisma models, 4453-line schema, 60+ enums \- Prisma $transaction: Used in 20+ critical services (invoice, pos, work-order, bank, collection, etc.) always in interactive mode — async (tx) \=\> {}. The tx parameter is passed to sub-services; no nested transactions. \- State machines: WorkOrder has explicit VALID\_STATUS\_TRANSITIONS with assertValidTransition(). Invoice only checks oldStatus \!== newStatus — no valid transition table defined (this is a known gap). \- Exception chain: HttpExceptionFilter → PrismaExceptionFilter → AllExceptionsFilter → TenantSecurityExceptionFilter \- Auth: JWT access \+ refresh token. Refresh token stored in Redis. JWT blacklist on logout. \- BullMQ: PDF generation, email, Excel export as background jobs. Redis is the queue backend. KNOWN GAPS (do not ignore these): 1\. Invoice state machine: No VALID\_STATUS\_TRANSITIONS table. CANCELLED → APPROVED is currently possible. Fix by copying the WorkOrder pattern. 2\. getNextCode() is called outside $transaction in POS and invoice create — low but real race condition risk. 3\. Test infrastructure missing: No "test" script in package.json, no jest.config.ts. 5 spec files exist (invoice-orchestrator, reconciliation, account-effect, movement-type helper, health) but cannot be run. 4\. MinIO volume mounted at /tmp/minio-data — files lost on container restart. Should be ./infra/data/minio. 5\. ignoreBuildErrors: true in next.config.ts — must be false for production. 6\. BullMQ has no retry or dead letter queue configuration. CODING STANDARDS: \- Always include tenantId in every Prisma query \- Use CSS var(--\*) tokens for all colors — never hardcode hex values \- Use $transaction for any operation touching more than one table \- NestJS error handling: throw BadRequestException / NotFoundException — never return raw errors \- Frontend errors: try/catch with toast.error(error.response?.data?.message) \- File naming: feature.service.ts, feature.controller.ts, MyComponent.tsx (PascalCase for components) \- Never use console.log in production code — use NestJS Logger \- Follow WorkOrder state machine pattern for any new entity with status transitions Your task: \[DESCRIBE YOUR SPECIFIC TASK HERE\] Constraints: \- Do not introduce CQRS, Event Sourcing, Kafka, or DDD patterns — these are premature for the current scale \- Do not use NestJS EventEmitter for tasks already handled by BullMQ \- Always write TypeScript with strict typing — no 'any' \- If touching invoice or POS flows, wrap all DB operations in a single $transaction \- If creating a new entity with status, define VALID\_STATUS\_TRANSITIONS and assertValidTransition upfront |
| :---- |

