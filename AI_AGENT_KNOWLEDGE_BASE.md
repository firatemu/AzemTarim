# OtoMuhasebe Projesi - AI Agent Bilgi Tabanı

**Son Güncelleme:** 19 Mart 2026  
**Versiyon:** 2.0 (AI Agent Optimized)  
**Hedef Kitle:** Claude AI, GPT-4, DeepSeek gibi LLM'ler için minimum hallüsinasyon ile maksimum kod yazma hızı

---

## 📋 İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Mimari Yapı](#3-mimari-yapı)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Docker & Deployment](#5-docker--deployment)
6. [Veritabanı](#6-veritabanı)
7. [Backend API](#7-backend-api)
8. [Frontend](#8-frontend)
9. [POS Sistemi](#9-pos-sistemi)
10. [Kodlama Standartları](#10-kodlama-standartları)
11. [Geliştirme Akışı](#11-geliştirme-akışı)

---

## 1. Proje Özeti

### 1.1 Genel Bilgi
- **Proje Adı:** OtoMuhasebe (Auto Accounting)
- **Tür:** Multi-tenant ERP/SaaS Platform
- **Amaç:** Türkçe olarak yazılmış, otomotiv sektörüne ve genel ticaret işletmelerine yönelik muhasebe, fatura, stok ve POS yönetimi
- **Platform:** Web tabanlı (NextJS + NestJS)
- **Deployment:** Docker Compose + Caddy (Reverse Proxy)
- **Language:** TypeScript (Backend & Frontend)
- **Package Manager:** pnpm

### 1.2 Temel Özellikler
- **Multi-tenant:** Çoklu işletme desteği
- **POS (Point of Sale):** Hızlı satış ekranı, dokunmatik ekran optimizasyonu
- **Fatura Yönetimi:** Satış, alış, iade faturaları
- **Stok Yönetimi:** Ürün hareketi, depo transferi, envanter sayımı
- **Raporlama:** Detaylı finansal raporlar
- **Ödeme Yönetemi:** Nakit, Kredi Kartı, Havale, Çek, Senet vb.
- **Müşteri/Cari Yönetimi:** Borç-alacak takibi

### 1.3 Mevcut Durumu
- **Git Status:** 4 commit ahead of origin/main
- **Yapı:** Staging ortamı (stage) üzerinde çalışma
- **Canlı URL:** http://localhost:3010 (development)
- **API:** http://localhost:3020 (backend)
- **Veri Tabanı:** PostgreSQL (port 5433)

---

## 2. Teknoloji Yığını

### 2.1 Backend Stack
```
Node.js 20 (Alpine Linux)
├── NestJS 10+ (REST API Framework)
├── TypeScript 5+
├── Prisma ORM (Database)
├── PostgreSQL 16 (Database)
├── Redis 7 (Cache & Session)
├── MinIO (S3-compatible Object Storage)
├── Class Validator (DTO Validation)
├── JWT (Authentication)
└── RLS (Row Level Security - Tenant Isolation)
```

### 2.2 Frontend Stack
```
Node.js 20
├── Next.js 16 (App Router)
├── TypeScript 5+
├── React 18+
├── Material-UI (MUI) v6
├── Zustand (State Management)
├── TanStack Query (Data Fetching)
├── Next.js Built-in CSS Modules & Inline Styles
├── DM Sans & JetBrains Mono (Fonts)
└── Tailwind CSS (Optional)
```

### 2.3 DevOps & Infrastructure
```
Docker & Docker Compose
├── Node 20 Alpine (Base images)
├── PostgreSQL 16 Alpine
├── Redis 7 Alpine
├── MinIO (Latest)
└── Caddy 2 (Reverse Proxy + SSL)

Caddy Endpoints:
├── http://localhost (Caddy Dashboard)
├── http://localhost/api/* → backend:3000
└── http://localhost:3010 → user-panel:3000
```

### 2.4 Development Tools
- **Version Control:** Git (GitHub repo)
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest (configured)
- **API Documentation:** Swagger/OpenAPI
- **Task Runner:** npm scripts, Make

---

## 3. Mimari Yapı

### 3.1 Sistem Mimarisi
```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
└────────────────────────────────────────────────────────┬─┘
                           ↓ HTTPS
┌──────────────────────────────────────────────────────────┐
│              CADDY (Reverse Proxy + SSL)                 │
├──────────────────────────────────────────────────────────┤
│  ├─ :80/:443 → UI (Next.js)                             │
│  ├─ /api/* → Backend (NestJS)                           │
│  └─ :3010 (Alias for UI)                               │
└──────────────────────────────────────────────────────────┘
         ↓ Internal Docker Network
┌──────────────────────────────────────────────────────────┐
│              BACKEND (NestJS) :3000                      │
├──────────────────────────────────────────────────────────┤
│  ├─ Controllers (API Endpoints)                         │
│  ├─ Services (Business Logic)                           │
│  ├─ Modules (Feature Grouping)                          │
│  └─ Database Layer (Prisma)                             │
└──────────────────────────────────────────────────────────┘
         ↓ TCP Connections
┌───────────────────┬──────────────────┬───────────────────┐
│  POSTGRESQL :5432 │  REDIS :6379     │  MINIO :9000      │
│  (Primary DB)     │  (Cache/Session) │  (File Storage)   │
└───────────────────┴──────────────────┴───────────────────┘
```

### 3.2 Multi-tenant Isolation
- **Row Level Security (RLS):** Veritabanında tenant-level filtering
- **Tenant Context:** Request middleware'de tenant ID belirlenir
- **RLS Policies:** Tüm tablolarda `tenantId` column'ında otomatik filtering

---

## 4. Klasör Yapısı

### 4.1 Root Level
```
otomuhasebe/
├── api-stage/              # Backend (NestJS) - PRODUCTION LOCATION
├── panel-stage/            # Frontend (Next.js) - PRODUCTION LOCATION
├── infra/                  # Docker & Infrastructure
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── envs/                   # Environment files
├── .cursor/                # Cursor IDE config
├── .mcp-servers/           # MCP (Model Context Protocol) servers
├── AGENTS.md               # AI & UI Standards
├── AI_AGENT_KNOWLEDGE_BASE.md # THIS FILE
├── docker-compose.yml      # Legacy (use infra/compose/)
└── Makefile               # Common tasks
```

### 4.2 Backend Structure (`api-stage/server/`)
```
api-stage/server/
├── src/
│   ├── common/
│   │   ├── decorators/     # Custom decorators (@Auth, @Tenant, etc)
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Response/Logging interceptors
│   │   └── middleware/     # Express middleware
│   ├── modules/            # Feature modules
│   │   ├── account/        # Cari Hesaplar (Customer Accounts)
│   │   ├── invoice/        # Faturalar
│   │   ├── product/        # Ürünler
│   │   ├── order/          # Satış Siparişleri
│   │   ├── warehouse/      # Depo Yönetimi
│   │   ├── pos/            # POS Sistem API
│   │   ├── bank/           # Banka Hesapları
│   │   ├── cashbox/        # Kasa
│   │   ├── employee/       # Personel
│   │   ├── collection/     # Tahsilat
│   │   ├── payment/        # Ödeme Yönetimi
│   │   └── [OTHER_MODULES]/
│   ├── database/           # Prisma & DB config
│   ├── app.module.ts       # Main app module
│   └── main.ts             # Bootstrap
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed-sample-data.ts # Sample data
├── package.json
└── tsconfig.json
```

### 4.3 Frontend Structure (`panel-stage/client/`)
```
panel-stage/client/
├── src/
│   ├── app/
│   │   ├── (main)/         # Main layout group
│   │   │   ├── pos/        # POS Page
│   │   │   ├── invoice/    # Invoice Pages
│   │   │   ├── product/    # Product Pages
│   │   │   ├── accounts/   # Customer Pages
│   │   │   └── [OTHER_PAGES]/
│   │   ├── (auth)/         # Auth layout group
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   │   ├── StandardPage.tsx
│   │   │   ├── StandardCard.tsx
│   │   │   └── [COMMON]/
│   │   └── [PAGE_SPECIFIC]/
│   ├── stores/             # Zustand stores
│   │   ├── posStore.ts
│   │   └── [OTHER_STORES]/
│   ├── hooks/              # React hooks
│   ├── lib/                # Utilities & helpers
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript types
│   └── constants/          # Constants
├── public/                 # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.local             # Environment (gitignored)
```

---

## 5. Docker & Deployment

### 5.1 Docker Compose Services

#### **Dosya Konumu:** `infra/compose/docker-compose.staging.yml`

```yaml
Services:
├── backend-staging (NestJS)
│   ├── Image: node:20-alpine
│   ├── Port: 3020 (external) → 3000 (internal)
│   ├── Dockerfile: api-stage/server/Dockerfile.staging.prod
│   ├── Volumes: None (copied in image)
│   ├── Env: DATABASE_URL, REDIS_URL, MINIO_URL
│   └── Health Check: /api/health endpoint
│
├── user-panel-staging (Next.js Frontend)
│   ├── Image: node:20-alpine
│   ├── Port: 3010 (external) → 3000 (internal)
│   ├── Dockerfile: panel-stage/client/Dockerfile
│   ├── Build Context: panel-stage/client/
│   ├── Command: npm run dev (Turbopack hot reload)
│   └── Health Check: GET /pos
│
├── postgres (Database)
│   ├── Image: postgres:16-alpine
│   ├── Port: 5433 (external) → 5432 (internal)
│   ├── Volume: /infra/data/postgres
│   ├── Env: POSTGRES_PASSWORD, POSTGRES_DB
│   └── Health Check: pg_isready
│
├── redis (Cache/Session)
│   ├── Image: redis:7-alpine
│   ├── Port: 127.0.0.1:6379 (internal only)
│   └── Health Check: redis-cli ping
│
├── minio (Object Storage)
│   ├── Image: minio/minio:latest
│   ├── Port: 9000 (API), 9001 (Console)
│   ├── Volume: /infra/data/minio
│   └── Command: minio server
│
└── caddy (Reverse Proxy)
    ├── Image: caddy:2
    ├── Ports: 80, 443
    ├── Config: docker/caddy/Caddyfile
    ├── Routes:
    │   ├── localhost/api/* → backend:3000
    │   └── localhost:3010 → user-panel:3000
    └── Auto SSL: false (local dev)
```

### 5.2 Dockerfile Detayları

#### **Backend: `api-stage/server/Dockerfile.staging.prod`**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
  - pnpm install
  - npm run build (tsc compilation)
  - RUN prisma generate

FROM node:20-alpine AS runner
  - COPY dist/
  - pnpm install --prod
  - CMD: npm run start:prod
  - EXPOSE: 3000
```

#### **Frontend: `panel-stage/client/Dockerfile`**
```dockerfile
FROM node:20-alpine
  - RUN npm install -g pnpm@10
  - COPY source files
  - pnpm install
  - ENV: NODE_ENV=development, SKIP_ENV_VALIDATION=true
  - CMD: npm run dev (Turbopack)
  - EXPOSE: 3000
```

### 5.3 Çalıştırma Komutları

```bash
# Start all services
cd infra/compose
docker compose -f docker-compose.staging.yml up -d

# Rebuild specific service
docker compose -f docker-compose.staging.yml up -d --build user-panel-staging

# View logs
docker logs otomuhasebe_saas_panel -f
docker logs otomuhasebe_saas_backend -f

# Execute command in container
docker exec otomuhasebe_saas_backend npm run seed

# Stop and remove
docker compose -f docker-compose.staging.yml down

# Full cleanup
docker system prune -a --volumes
```

### 5.4 Network & Communication
- **Network Name:** Docker Compose creates internal network
- **Backend Address (from frontend):** `http://backend-staging:3000`
- **Frontend Address (from browser):** `http://localhost:3010`
- **API Proxy:** Next.js proxy rules → backend (no CORS needed)

---

## 6. Veritabanı

### 6.1 Database Setup
- **Type:** PostgreSQL 16 Alpine
- **Port:** 5433 (external), 5432 (internal)
- **Data Path:** `/infra/data/postgres`
- **Backup:** Regular SQL dumps in `backups/` folder

### 6.2 Prisma ORM
- **Schema File:** `api-stage/server/prisma/schema.prisma`
- **Migrations:** `api-stage/server/prisma/migrations/`
- **Seed:** `api-stage/server/prisma/seed-sample-data.ts`

### 6.3 Core Database Models (Simplified)

```prisma
// Multi-tenant base
model Tenant {
  id String @id
  name String
  createdAt DateTime
  @@map("tenants")
}

// Entity Examples
model Account { // Cari Hesaplar
  id String @id
  tenantId String
  name String
  accountType ENUM (CUSTOMER, SUPPLIER, EMPLOYEE)
  debit Decimal
  credit Decimal
  @@unique([tenantId, id])
}

model Product {
  id String @id
  tenantId String
  name String
  barcode String
  stock Int
  price Decimal
  category String
}

model Invoice {
  id String @id
  tenantId String
  type ENUM (SALE, PURCHASE, RETURN_SALE, RETURN_PURCHASE)
  accountId String
  total Decimal
  status ENUM (DRAFT, ISSUED, CANCELLED)
  items InvoiceItem[]
  createdAt DateTime
}

model InvoiceItem {
  id String @id
  invoiceId String
  productId String
  quantity Int
  unitPrice Decimal
}

model Payment {
  id String @id
  tenantId String
  accountId String
  amount Decimal
  method ENUM (CASH, CREDIT_CARD, TRANSFER, CHEQUE)
  status ENUM (PENDING, COMPLETED, CANCELLED)
}

model PosTransaction {
  id String @id
  tenantId String
  customerId String
  total Decimal
  items PosItem[]
  payments Payment[]
  status ENUM (COMPLETED, CANCELLED)
  createdAt DateTime
}
```

### 6.4 Database Komutları

```bash
# Connect to database
docker exec -it otomuhasebe_saas_postgres psql -U postgres -d otomuhasebe

# Run migrations
docker exec otomuhasebe_saas_backend npx prisma migrate deploy

# Seed data
docker exec otomuhasebe_saas_backend npm run seed

# Backup
docker exec otomuhasebe_saas_postgres pg_dump -U postgres otomuhasebe > backup.sql

# View schema
docker exec otomuhasebe_saas_backend npx prisma studio
```

---

## 7. Backend API

### 7.1 API Base URL
```
Development: http://localhost:3020 (External via Caddy port)
Internal (Docker): http://backend-staging:3000
```

### 7.2 Authentication
- **Method:** JWT Token (Bearer token)
- **Header:** `Authorization: Bearer <token>`
- **Stored In:** Redis + HTTP-only Cookie
- **Guard:** `@UseGuards(AuthGuard)`
- **Tenant:** Extracted from JWT payload `tenantId`

### 7.3 Main API Modules & Endpoints

#### **Account Management (`/api/account`)**
```
GET    /api/account                    # List all customers
GET    /api/account/:id                # Get customer detail
POST   /api/account                    # Create customer
PUT    /api/account/:id                # Update customer
DELETE /api/account/:id                # Delete customer
GET    /api/account/:id/transactions   # Customer transaction history
```

#### **Invoice Management (`/api/invoices`)**
```
GET    /api/invoices?faturaTipi=SALE   # List invoices (filter by type)
GET    /api/invoices/:id               # Get invoice detail
POST   /api/invoices                   # Create invoice
PUT    /api/invoices/:id               # Update invoice
DELETE /api/invoices/:id               # Cancel/delete invoice
POST   /api/invoices/:id/print         # Generate PDF
```

#### **Product Management (`/api/products`)**
```
GET    /api/products                   # List products
POST   /api/products                   # Create product
PUT    /api/products/:id               # Update product
DELETE /api/products/:id               # Delete product
GET    /api/products/:id/stock         # Get stock levels
```

#### **POS System (`/api/pos`)**
```
POST   /api/pos/sales                  # Create POS transaction
GET    /api/pos/transactions           # Get POS transaction history
GET    /api/pos/dashboard              # Dashboard stats
POST   /api/pos/payment                # Process payment
```

#### **Warehouse (`/api/warehouse`)**
```
GET    /api/warehouse                  # List warehouses
GET    /api/warehouse/:id/stock        # Warehouse stock
POST   /api/warehouse-transfer         # Transfer between warehouses
```

#### **Other Modules**
```
/api/bank              # Bank account management
/api/cashbox           # Cash management
/api/employee          # Employee management
/api/order             # Purchase/Sales orders
/api/collection        # Collection management
/api/payment           # Payment processing
/api/reporting         # Reports
/api/code-template     # Code templates
```

### 7.4 Request/Response Format

```typescript
// Request
POST /api/invoices
Content-Type: application/json
Authorization: Bearer <token>

{
  "faturaTipi": "SALE",
  "accountId": "cust_123",
  "items": [
    { "productId": "prod_456", "quantity": 2, "unitPrice": 100.00 }
  ],
  "total": 200.00,
  "note": "Optional invoice note"
}

// Response (200 OK)
{
  "id": "inv_789",
  "faturaTipi": "SALE",
  "total": 200.00,
  "status": "DRAFTED",
  "createdAt": "2026-03-19T12:30:00Z",
  "items": [...],
  "message": "Invoice created successfully"
}

// Error Response (400 Bad Request)
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "accountId", "message": "Account not found" }
  ]
}
```

### 7.5 Validation & Error Handling
- **DTO Validation:** `class-validator` decorators
- **Custom Filters:** `HttpExceptionFilter` handles all errors
- **Error Format:** Consistent JSON with statusCode, message, errors
- **Logging:** All requests/responses logged via `LoggingInterceptor`

---

## 8. Frontend

### 8.1 Next.js Configuration
- **Framework:** Next.js 16 with App Router
- **Build Tool:** Turbopack (dev), Webpack (prod)
- **Package Manager:** pnpm
- **Dev Server:** `npm run dev` (Turbopack hot reload)
- **Build:** `npm run build` (production build)

### 8.2 Styling System

#### **Design Tokens (CSS Variables)**
Located in component styles, follows POS standard (from `AGENTS.md`):

```css
/* Light Mode */
--background: #f8fafc;
--foreground: #0f172a;
--card: #ffffff;
--border: rgba(15, 23, 42, 0.10);
--primary: #0f172a;
--secondary: #475569;
--muted: rgba(0, 0, 0, 0.05);
--destructive: #ef4444;

/* POS Specific (page.tsx) */
--bg: #f7fafc;
--surface: #ffffff;
--surface2: #f3f6fb;
--surface3: #e9eef7;
--accent: #4f46e5;
--text: #0f172a;
--shadow-sm: 0 1px 2px rgba(2, 6, 23, 0.06);
--shadow-md: 0 10px 20px rgba(2, 6, 23, 0.10);
--shadow-lg: 0 24px 48px rgba(2, 6, 23, 0.16);
```

#### **MUI Customization**
- **Theme:** Custom theme in layout or wrapper
- **Components:** Use `sx` prop for styling
- **Colors:** Reference CSS variables via `var(--primary)`

### 8.3 Page Structure (POS Example)

```typescript
// panel-stage/client/src/app/(main)/pos/page.tsx
export default function POSPage() {
  return (
    <Box sx={{ pb: 4 }}>
      {/* Header with POS title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography>POS Screen</Typography>
        <Button>Action</Button>
      </Box>

      {/* Main layout: Left (Products) | Right (Cart) */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        <ProductGrid />
        <CartPanel />
      </Box>

      {/* Modals for payment, receipts, etc */}
      <PaymentModal />
      <ReceiptDialog />
    </Box>
  );
}
```

### 8.4 State Management (Zustand)

```typescript
// stores/posStore.ts
import { create } from 'zustand';

interface PosStore {
  cartItems: CartItem[];
  cartTotal: number;
  payments: Payment[];
  remainingAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  addPayment: (payment: Payment) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosStore>((set) => ({
  cartItems: [],
  cartTotal: 0,
  payments: [],
  remainingAmount: 0,
  addItem: (item) => set((state) => ({
    cartItems: [...state.cartItems, item],
    cartTotal: state.cartTotal + item.total
  })),
  // ... other methods
}));

// Usage in component
function CartPanel() {
  const { cartItems, cartTotal, addPayment } = usePosStore();
  // ...
}
```

### 8.5 Data Fetching (TanStack Query)

```typescript
// hooks/useInvoices.ts
import { useQuery } from '@tanstack/react-query';
import { fetchInvoices } from '@/lib/api';

export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 2,
  });
}

// Usage
function InvoiceList() {
  const { data: invoices, isLoading, error } = useInvoices();
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  return <InvoiceTable data={invoices} />;
}
```

### 8.6 DataGrid İşlem Menüsü (Action Menu) Standardı
Next.js ve MUI DataGrid kullanılan tüm sayfalardaki satır işlem menüleri (Action Menus) `panel-stage/client/src/app/(main)/invoice/sales/page.tsx` içerisindeki "Creative Action Menu" mimarisine `%100 uygun` olmalıdır. Bu yapıdaki kurallar:
1. **Menu PaperProps**: `elevation: 8`, ok efekti veren `transform: 'translateY(-50%) rotate(45deg)'` pseudo elementi (`&:before`) ve minWdith: 280, borderRadius: 3 kullanılmalıdır.
2. **Başlık Sektörü (Header)**: Menünün en üstünde gri tonlu (`var(--muted)`) bir alanda "İşlem Adı" ve kaydın özel bir değeri (örn. cari kod veya fatura no) vurgulu font ile yer almalıdır.
3. **Kategorizasyon**: İşlemler `Hızlı İşlemler` ve `Gelişmiş İşlemler` vb. bölümlere ayrılmalı ve üstlerinde uppercase, küçük fontlu başlıklar (`Typography variant="caption"`) kullanılmalıdır.
4. **İkon ve Yönlendirmeler**: Her işlemde MUI Icon bulunmalı. Silme ve iptal işlemleri `var(--destructive)` ile renklendirilmeli, menü seçeneğine tıklanınca hem menü kapanmalı (`handleClose()`) hem de tetiklenen fonksiyon çalıştırılmalıdır.
5. **Yuvarlatılmış Seçenekler**: `MenuItem` componentleri px, py paddinglere sahip olmalı ve borderRadius: 2 ile hover yapıldığında köşe yuvarlaklıkları korunmalıdır. Disabled olanlar opacity %50 olmalıdır.

---

## 9. POS Sistemi

### 9.1 POS Sayfası Özellikleri

**Dosya:** `panel-stage/client/src/app/(main)/pos/page.tsx`

#### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│  POS Header (Warehouse Selection, Theme Toggle, Time)   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Product Grid            │    Cart Panel (Numpad, Pay) │
│  (Search, Categories)    │    - Customer Selection     │
│                          │    - Cart Items             │
│  Product Cards           │    - Discount Bar           │
│  (Name, Price, Stock)    │    - Totals                │
│                          │    - Payment Methods       │
│  Pagination              │    - Checkout Button       │
│                          │    - Receipt Preview       │
└─────────────────────────────────────────────────────────┘
```

#### **Components**
```
pos/components/
├── CartPanel.tsx           # Main cart container
├── ProductGrid.tsx         # Product display grid
├── SelectorBox.tsx         # Customer/Salesperson selector
├── GlobalDiscountBar.tsx   # Discount controls
├── CartItemRow.tsx         # Individual cart item
├── PaymentModal.tsx        # Payment input modal with numpad
├── PaymentDialog.tsx       # Alternative payment dialog
├── ReceiptDialog.tsx       # Receipt print preview
├── VariantDialog.tsx       # Product variant selection
├── ItemDiscountModal.tsx   # Per-item discount
├── VirtualNumpad.tsx       # MUI-based numpad
└── ReceiptComponent.tsx    # Receipt template
```

### 9.2 POS State Management

```typescript
// stores/posStore.ts
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface PosStore {
  // Cart
  cartItems: CartItem[];
  cartTotal: number;
  discountPercentage: number;
  
  // Selectors
  selectedCustomer: Customer | null;
  selectedSalesperson: Employee | null;
  
  // Payments
  payments: Payment[];
  remainingAmount: number;
  
  // Dialogs
  paymentDialogOpen: boolean;
  receiptDialogOpen: boolean;
  
  // Methods
  addItem(item: CartItem): void;
  removeItem(id: string): void;
  updateItem(id: string, updates: Partial<CartItem>): void;
  applyDiscount(percentage: number): void;
  addPayment(payment: Payment): void;
  completeSale(): Promise<void>;
  clearCart(): void;
}

export const usePosStore = create<PosStore>((set, get) => ({
  // State initialization
  cartItems: [],
  cartTotal: 0,
  // ... other state
  
  // Actions
  addItem: (item) => set((state) => {
    const newItems = [...state.cartItems, item];
    const newTotal = calculateTotal(newItems, state.discountPercentage);
    return { cartItems: newItems, cartTotal: newTotal };
  }),
  
  completeSale: async () => {
    const { cartItems, payments, selectedCustomer } = get();
    // Create POS transaction via API
    await api.post('/pos/sales', {
      items: cartItems,
      payments,
      customerId: selectedCustomer?.id
    });
    get().clearCart();
  },
  // ... other methods
}));
```

### 9.3 Theme Variables (POS Page Specific)

```css
/* Light Mode (in page.tsx style block) */
#pos-root {
  --bg: #f7fafc;
  --surface: #ffffff;
  --surface2: #f3f6fb;
  --surface3: #e9eef7;
  --border: rgba(15, 23, 42, 0.10);
  --text: #0f172a;
  --muted: rgba(15, 23, 42, 0.62);
  --accent: #4f46e5;
  --accent-g: rgba(79, 70, 229, 0.10);
  --green: #10b981;
  --amber: #f59e0b;
  --red: #ef4444;
  --shadow-sm: 0 1px 2px rgba(2, 6, 23, 0.06);
  --shadow-md: 0 10px 20px rgba(2, 6, 23, 0.10);
  --shadow-lg: 0 24px 48px rgba(2, 6, 23, 0.16);
}

/* Dark Mode */
.dark #pos-root {
  --bg: #0b1220;
  --surface: #0f172a;
  --text: rgba(241, 245, 249, 0.92);
  /* ... dark palette */
}
```

### 9.4 Numpad Modal

**Dosya:** `panel-stage/client/src/app/(main)/pos/components/PaymentModal.tsx`

```typescript
// Dialog with embedded CSS variables for styling
<Dialog open={open} onClose={onClose}>
  <style>{`
    .payment-modal-root {
      --surface: #ffffff;
      --text: #0f172a;
      --accent: #4f46e5;
      --border: rgba(15, 23, 42, 0.10);
      /* ... theme vars */
    }
  `}</style>
  
  <div className="payment-modal-root">
    {/* Display amount input */}
    <input value={display} readOnly style={{ background: 'var(--surface2)' }} />
    
    {/* Numpad grid (3x4) */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
      {numpadKeys.map(key => (
        <button
          key={key}
          onClick={() => handleNp(key)}
          style={{
            background: key === 'C' ? 'rgba(239, 68, 68, 0.08)' : 'var(--surface3)',
            color: key === 'C' ? 'var(--red)' : 'var(--text)',
            border: key === 'C' ? '1.5px solid var(--red)' : '1px solid var(--border)',
          }}
        >
          {key}
        </button>
      ))}
    </div>
    
    {/* Action buttons */}
    <button onClick={onClose} style={{ background: 'var(--surface3)' }}>Vazgeç</button>
    <button onClick={handleConfirm} style={{ background: 'var(--accent)' }}>Ekle</button>
  </div>
</Dialog>
```

### 9.5 Payment Processing Flow

```
User Clicks Payment Method
  ↓
PaymentModal Opens with Numpad
  ↓
User Enters/Confirms Amount
  ↓
Payment added to Payments[] array
  ↓
Remaining Amount Recalculated
  ↓
If Remaining = 0 → Show Complete Sale Button
  ↓
"Satışı Tamamla" (Complete Sale)
  ↓
API Call: POST /api/pos/sales
  ↓
Transaction Created in DB
  ↓
Receipt Dialog Shows
  ↓
Clear Cart & Reset State
```

---

## 10. Kodlama Standartları

### 10.1 TypeScript Conventions

```typescript
// File: feature.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import type { Feature, FeatureCreateDto } from './types';

@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: FeatureCreateDto): Promise<Feature> {
    // Always include tenant isolation
    const created = await this.prisma.feature.create({
      data: {
        ...data,
        tenantId, // CRITICAL: Multi-tenant isolation
      },
    });
    return created;
  }

  async findById(tenantId: string, id: string): Promise<Feature> {
    // Use AND condition for tenant + id
    return this.prisma.feature.findUniqueOrThrow({
      where: { id_tenantId: { id, tenantId } },
    });
  }
}
```

### 10.2 React/Component Patterns

```typescript
// File: MyComponent.tsx
'use client'; // Mark as client component

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { MyData } from '@/types';

interface MyComponentProps {
  id: string;
  onSuccess?: () => void;
}

export function MyComponent({ id, onSuccess }: MyComponentProps) {
  // Data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['data', id],
    queryFn: () => fetchData(id),
  });

  // Render
  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error loading data</Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{data?.title}</Typography>
      <Button onClick={onSuccess}>Action</Button>
    </Box>
  );
}
```

### 10.3 CSS/Styling Guidelines

```typescript
// Use CSS variables from design tokens
const styles = {
  container: {
    background: 'var(--background)',
    color: 'var(--foreground)',
    padding: '16px',
    borderRadius: 'var(--radius, 8px)',
    border: '1px solid var(--border)',
  },
  card: {
    background: 'var(--card)',
    boxShadow: 'var(--shadow-sm)',
    borderRadius: 'var(--radius)',
  },
  button: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    '&:hover': {
      background: 'var(--primary-dark)',
    },
  },
};

// POS-specific
const posStyles = {
  button: {
    background: 'var(--accent)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all .15s',
  },
};
```

### 10.4 Naming Conventions

```
Files:
  ✓ feature.service.ts
  ✓ feature.controller.ts
  ✓ feature.module.ts
  ✓ MyComponent.tsx
  ✗ myComponent.tsx (use PascalCase for components)
  ✗ feature-service.ts (use dot notation)

Variables:
  ✓ const invoiceTotal = 1000;
  ✓ const isLoading = true;
  ✓ const FIXED_CONSTANT = 'value';
  ✗ const InvoiceTotal = 1000; (not for variables)
  ✗ const invoice_total = 1000; (use camelCase)

Types:
  ✓ interface InvoiceData { }
  ✓ type InvoiceStatus = 'draft' | 'published';
  ✗ interface invoice_data { }
```

### 10.5 Errors & Logging

```typescript
// Backend: NestJS Error Handling
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Post()
async create(data: CreateDto) {
  if (!data.name) {
    throw new BadRequestException('Name is required');
  }
  
  const exists = await this.db.findUnique(data.id);
  if (exists) {
    throw new BadRequestException('Record already exists');
  }
  
  return this.db.create(data);
}

// Frontend: Error Boundaries & Toast
try {
  await api.post('/items', data);
  toast.success('Item created');
} catch (error) {
  toast.error(error.response?.data?.message || 'Error creating item');
  console.error('Create item error:', error);
}
```

---

## 11. Geliştirme Akışı

### 11.1 Local Development Setup

```bash
# 1. Clone & Install
git clone https://github.com/[repo]/otomuhasebe.git
cd otomuhasebe

# 2. Environment Files
cp envs/.env.example envs/.env.local
# Edit envs/.env.local with local values

# 3. Start Docker Compose
cd infra/compose
docker compose -f docker-compose.staging.yml up -d

# 4. Initialize Database
docker exec otomuhasebe_saas_backend npm run seed

# 5. Access
# Frontend: http://localhost:3010
# Backend: http://localhost:3020/api
# Postgres: localhost:5433 (psql credentials in .env)
# MinIO: http://localhost:9000

# 6. Backend Development
cd api-stage/server
pnpm dev

# 7. Frontend Development
cd panel-stage/client
pnpm dev
```

### 11.2 Making Changes

#### **Backend Change Example**
```bash
# 1. Create feature branch
git checkout -b feature/new-invoice-type

# 2. Update Prisma schema
# Edit: api-stage/server/prisma/schema.prisma
# Add new field to Invoice model

# 3. Create migration
cd api-stage/server
npx prisma migrate dev --name add_invoice_type

# 4. Update service
# Edit: api-stage/server/src/modules/invoice/invoice.service.ts
# Add method to handle new type

# 5. Update controller
# Edit: api-stage/server/src/modules/invoice/invoice.controller.ts
# Add endpoint or update logic

# 6. Test
npm run test

# 7. Commit
git add .
git commit -m "feat: add new invoice type"
git push origin feature/new-invoice-type
```

#### **Frontend Change Example**
```bash
# 1. Create feature branch
git checkout -b feature/pos-ui-improvements

# 2. Update component
# Edit: panel-stage/client/src/app/(main)/pos/components/CartPanel.tsx
# Follow AGENTS.md styling standards

# 3. Update store if needed
# Edit: panel-stage/client/src/stores/posStore.ts

# 4. Test in browser
# Navigate to http://localhost:3010/pos
# Hot reload automatically updates

# 5. Hard refresh if needed
# Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 6. Commit
git add .
git commit -m "feat: improve POS cart UI"
git push origin feature/pos-ui-improvements
```

### 11.3 Common Commands

```bash
# Database
npx prisma studio                    # Web UI for database
npx prisma migrate reset             # Reset DB to initial state
npx prisma db seed                   # Seed sample data
pg_dump -U postgres otomuhasebe > backup.sql

# Docker
docker compose logs -f service_name  # View live logs
docker exec container_name bash      # Shell into container
docker restart container_name        # Restart service
docker compose ps                    # List running services

# pnpm
pnpm install                         # Install dependencies
pnpm add package_name                # Add package
pnpm dev                             # Development server
pnpm build                           # Production build
pnpm test                            # Run tests

# Git
git status                           # Current changes
git diff                             # See what changed
git log --oneline                    # Commit history
git rebase -i HEAD~3                 # Interactive rebase
```

### 11.4 Deployment to Production

```bash
# 1. Tag release
git tag v2.0.0
git push origin v2.0.0

# 2. Build Docker images
docker compose -f docker-compose.staging.yml build

# 3. Push to registry (if using remote registry)
docker tag compose-backend-staging:latest registry.example.com/otomuhasebe:v2.0.0
docker push registry.example.com/otomuhasebe:v2.0.0

# 4. Deploy (on production server)
ssh production-server
cd /app/otomuhasebe
git pull origin main
docker compose -f docker-compose.staging.yml pull
docker compose -f docker-compose.staging.yml up -d

# 5. Verify
curl https://app.otomuhasebe.com/api/health
```

---

## 🔧 Troubleshooting Guide

### Issue: Frontend shows 500 error after changes
**Solution:** 
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear Next.js cache: `docker exec user-panel-staging rm -rf .next`
3. Rebuild container: `docker compose up -d --build user-panel-staging`

### Issue: Backend API not responding from frontend
**Solution:**
1. Check container is running: `docker ps | grep backend`
2. Check logs: `docker logs otomuhasebe_saas_backend`
3. Verify network: `docker network ls`
4. Restart services: `docker compose restart`

### Issue: Database migrations fail
**Solution:**
1. Check migration files: `ls api-stage/server/prisma/migrations`
2. Reset DB: `npx prisma migrate reset`
3. Manual: `docker exec otomuhasebe_saas_postgres psql -U postgres -d otomuhasebe -f script.sql`

### Issue: Port already in use
**Solution:**
```bash
# Find process on port
lsof -i :3010
# Kill process
kill -9 PID
# Or change port in docker-compose.yml
```

---

## 📚 Useful Resources

- **Frontend Standards:** `panel-stage/client/UI_STANDARDS.md` or project root `AGENTS.md`
- **POS Frontend Code:** `POS_FRONTEND_KODLARI.md`
- **Previous Analysis:** `PROJE_RAPORU.md`
- **Database Schema:** Run `npx prisma studio`
- **API Docs:** Swagger endpoint (if configured)

---

## ⚡ Critical Rules for AI Agents

### DO:
✅ Always include `tenantId` in database queries (multi-tenant isolation)  
✅ Use CSS `var(--*)` tokens instead of hard-coded colors  
✅ Check `AGENTS.md` for UI/styling guidelines before creating components  
✅ Test changes locally in Docker before committing  
✅ Use TypeScript for type safety  
✅ Reference this knowledge base first before asking for context  

### DON'T:
❌ Hard-code colors, sizes, or breakpoints  
❌ Forget tenant isolation in queries  
❌ Create components without checking UI standards  
❌ Use `console.log` in production code (use proper logging)  
❌ Commit without testing in Docker environment  
❌ Modify `.env.local` and commit it  

---

**Generated:** 2026-03-19  
**Intended For:** Claude, GPT-4, DeepSeek, and other LLM-based AI agents  
**Confidence Level:** High (based on actual codebase analysis)  
**Update Frequency:** As project evolves (manual update needed)
