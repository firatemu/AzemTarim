# OtoMuhasebe — Database Professionalisation: Complete Migration Prompt Guide

> **How to use this document**
> Each Phase is a **self-contained prompt**. Copy the entire Phase block (including the
> repeated Global Context section at its top) and paste it into a **fresh** Claude or
> ChatGPT conversation.
> **Complete and verify each Phase before starting the next one.**
> Phases build on each other — skipping one will cause later phases to produce
> incorrect or conflicting output.

---

## GLOBAL CONTEXT BLOCK
*(Paste this at the top of every Phase prompt)*

```
You are a senior PostgreSQL database architect working on "OtoMuhasebe", a
multi-tenant SaaS ERP system.

TECH STACK
- Database : PostgreSQL (latest stable)
- ORM      : Prisma
- Language : TypeScript (NestJS backend)

SYSTEM FACTS — memorise before generating anything:
- 119 tables total
- Primary keys: mix of uuid() and cuid() — match the existing pattern of the table you touch
- Multi-tenant: every business table MUST have a non-nullable tenantId referencing tenants.id
- RLS is ALREADY ACTIVE on 96 tables via PostgreSQL session variable app.current_tenant_id
  RLS policy pattern in use:
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
- Soft-delete pattern: deletedAt DateTime? (do not remove, add where missing)
- Audit columns: createdBy, updatedBy, deletedBy -> FK to users.id (String?, nullable)
- Money: always Decimal, never Float
- Timestamps: DateTime, default now()
- Prisma field naming : camelCase
- SQL column/table naming : snake_case

MANDATORY OUTPUT FORMAT FOR EVERY TASK:
1. [EXPLANATION]   - What changes, and why (max 5 lines)
2. [PRISMA SCHEMA] - Complete updated model block(s) in ```prisma fences
3. [SQL MIGRATION] - Idempotent raw SQL in ```sql fences
                     Use DO $$ blocks, IF NOT EXISTS, IF EXISTS throughout
                     Include a -- DOWN MIGRATION section at the bottom of every SQL block
4. [RLS POLICIES]  - For every NEW table that stores tenant data, add SELECT/INSERT/UPDATE/DELETE policies
5. [MANUAL STEPS]  - Numbered checklist of actions the developer must perform after running SQL
6. [VERIFICATION]  - SQL SELECT queries that PROVE the migration succeeded (zero-assertion queries)

HARD RULES:
- Never drop a column in the same migration where you add its replacement. Use a two-step approach.
- Before SET NOT NULL, always backfill NULLs inside a DO $$ block.
- Never write TODO or placeholder comments. Every SQL line must be executable.
- When you must assume a business value (e.g. default tenant for orphan rows), write:
    -- ASSUMPTION: <your assumption here>
  and add it to the [MANUAL STEPS] section as something the developer must verify.
- If a table already has an RLS policy, show the DROP POLICY + CREATE POLICY pair to replace it.
```

---

## PHASE 1 — Critical Tenant Isolation Fix

**Scope:** Make `tenantId` NOT NULL on all business tables where it is nullable,
and add `tenantId` to the three tables that are missing it entirely.

**Estimated risk:** HIGH — destructive ALTER on live tables. Run in a maintenance window.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 1 — Critical Tenant Isolation Fix

BACKGROUND
The following tables have tenantId defined as nullable (String?) in Prisma,
which means a developer can accidentally omit the tenantId filter and leak
cross-tenant data. The existing RLS covers most cases but the application
layer must also be hardened.

PART A — Enforce NOT NULL on existing nullable tenantId columns
Tables: products, accounts, collections, bank_transfers, expenses,
        roles, account_movements, audit_logs

For EACH table above, produce:
1. A DO $$ block that backfills NULL tenant_id rows.
   Use this logic for the backfill:
     -- ASSUMPTION: NULL-tenantId rows are assigned to the oldest ACTIVE tenant.
     -- Developer must verify this is correct before running.
     SELECT id FROM tenants WHERE status = 'ACTIVE' ORDER BY created_at ASC LIMIT 1
2. ALTER TABLE <table> ALTER COLUMN tenant_id SET NOT NULL;
3. The updated Prisma model field: tenantId String  (remove the ?)
4. If the table already has an RLS policy, replace it with a stricter version
   that uses tenant_id directly (no IS NULL fallback).

PART B — Add tenantId to tables that have NO tenantId column at all
Tables: units, unit_sets, expense_categories

For EACH table above, produce:
1. ALTER TABLE ... ADD COLUMN tenant_id UUID NULL  (nullable first for safe migration)
2. Backfill DO $$ block (same oldest-active-tenant assumption as Part A)
3. ALTER TABLE ... ALTER COLUMN tenant_id SET NOT NULL
4. ALTER TABLE ... ADD CONSTRAINT fk_<table>_tenant
     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
5. CREATE INDEX IF NOT EXISTS idx_<table>_tenant_id ON <table>(tenant_id)
6. RLS policies (SELECT, INSERT, UPDATE, DELETE) using the standard pattern
7. Full updated Prisma model block (including the new @relation to Tenant)

PART C — Verification queries
Write queries that confirm:
- SELECT count(*) WHERE tenant_id IS NULL returns 0 for all 11 tables
- All FK constraints exist in information_schema.table_constraints
- All RLS policies are enabled in pg_policies
```

---

## PHASE 2 — Rename hizli_tokens & Fix Orphan Tables

**Scope:** Rename the Turkish-named table, patch four orphan tables that lack
tenant isolation or proper FK relationships.

**Estimated risk:** MEDIUM — rename breaks any hardcoded table-name references in application code.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 2 — Rename hizli_tokens & Fix Orphan Tables

ORPHAN TABLE INVENTORY

| Table              | Problem                                            | Action            |
|--------------------|----------------------------------------------------|-------------------|
| hizli_tokens       | Turkish name, no User FK, no tenantId              | Rename + add FKs  |
| einvoice_inbox     | No tenantId, no tenant relation                    | Add tenantId      |
| equivalency_groups | No tenantId — cross-tenant query risk              | Add tenantId+RLS  |
| vehicle_catalog    | CustomerVehicle has no FK to it (brand/model flat) | Add FK from customer_vehicles |

TASK 1 — Rename hizli_tokens to quick_tokens
1. ALTER TABLE hizli_tokens RENAME TO quick_tokens;
2. Verify column login_hash is already snake_case in SQL; rename if not
3. Add column: user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL
4. Add column: tenant_id UUID NULL REFERENCES tenants(id) ON DELETE SET NULL
   (nullable — some tokens are pre-authentication and have no tenant yet)
5. Add indexes: (user_id), (tenant_id), (expires_at)
6. Show full Prisma model: model QuickToken { ... @@map("quick_tokens") }
7. In [MANUAL STEPS] add:
   "Search all service and repository files for the string 'hizli_token' and 'hizliToken'
    and rename every occurrence to 'quick_token' / 'quickToken'"

TASK 2 — Fix einvoice_inbox
1. Add tenant_id UUID NULL REFERENCES tenants(id)
2. Add matched_invoice_id UUID NULL REFERENCES invoices(id) ON DELETE SET NULL
3. Add index on (tenant_id), (matched_invoice_id)
4. Show full updated Prisma model

TASK 3 — Fix equivalency_groups
1. Add tenant_id UUID NULL first
2. Backfill (oldest-active-tenant assumption — flag with ASSUMPTION comment)
3. SET NOT NULL
4. Add FK + index
5. Add RLS policies
6. Show full updated Prisma model

TASK 4 — Link customer_vehicles to vehicle_catalog
1. Add vehicle_catalog_id UUID NULL REFERENCES vehicle_catalog(id) ON DELETE SET NULL
2. Do NOT remove existing brand / model String columns — they remain as fallback display values
3. Add index on (vehicle_catalog_id)
4. In [MANUAL STEPS] add:
   "Run a one-time data-match script to populate vehicle_catalog_id by
    matching existing brand+model strings against vehicle_catalog rows"
5. Show updated Prisma model CustomerVehicle with BOTH the new FK and the old String fields

TASK 5 — Verification
- Confirm quick_tokens table exists and hizli_tokens does not exist
- Confirm all 4 new FK constraints appear in pg_constraint
- Confirm equivalency_groups has RLS enabled in pg_policies
```

---

## PHASE 3 — Normalise Product Table

**Scope:** Extract flat String fields from `products` into proper relational tables.
This is an ADDITIVE migration — old String columns are kept as deprecated fallback
until a separate data-migration script (not part of this phase) populates the new FKs.

**Estimated risk:** LOW for schema changes (additive only).

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 3 — Normalise Product Table

CURRENT STATE — flat String columns on products table to be normalised:
  brand, model            -> extract to brands table
  category, mainCategory, subCategory -> extract to categories table (hierarchical, self-referencing)
  vehicleBrand, vehicleModel, vehicleEngineSize, vehicleFuelType
                          -> extract to product_vehicle_compatibilities join table

MIGRATION STRATEGY: ADDITIVE FIRST
Step 1 (this phase) : Create new tables + add nullable FK columns on products
Step 2 (next sprint): Run data-migration script to populate FKs from existing String data
Step 3 (future)     : Remove deprecated String columns after FKs are fully populated

TASK 1 — Create brands table
Schema:
  id        String   @id @default(uuid())
  tenantId  String   (NOT NULL, FK to tenants)
  name      String
  slug      String?  (URL-safe, unique per tenant)
  logoUrl   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([tenantId, name])
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@map("brands")

Add to products table:
  brandId  String?  (nullable FK to brands.id)
  @@index([brandId])

Include RLS policy for brands.
Keep existing brand String? column on products — add a Prisma comment: // @deprecated use brandId

TASK 2 — Create categories table (hierarchical, self-referencing)
Schema:
  id        String   @id @default(uuid())
  tenantId  String   (NOT NULL, FK to tenants)
  name      String
  slug      String?
  parentId  String?  (nullable self-FK to categories.id — NULL means root category)
  level     Int      @default(0)  (0=main, 1=sub, 2=leaf)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([parentId])
  @@map("categories")

Add to products table:
  categoryId String?  (nullable FK to categories.id — points to the most specific category)
  @@index([categoryId])

Include RLS policy for categories.
Keep existing category / mainCategory / subCategory String? columns — add @deprecated comments.

TASK 3 — Create product_vehicle_compatibilities table
Schema:
  id               String   @id @default(uuid())
  tenantId         String   (NOT NULL, FK to tenants)
  productId        String   (NOT NULL, FK to products.id)
  vehicleBrand     String
  vehicleModel     String?
  vehicleEngineSize String?
  vehicleFuelType  String?
  yearFrom         Int?
  yearTo           Int?
  notes            String?
  createdAt        DateTime @default(now())
  @@index([tenantId])
  @@index([productId])
  @@index([tenantId, vehicleBrand, vehicleModel])
  @@map("product_vehicle_compatibilities")

Do NOT touch vehicleBrand/vehicleModel/vehicleEngineSize/vehicleFuelType columns
on products in this phase — they stay as deprecated fallback.
Include RLS policy.

TASK 4 — Verification
- Confirm brands, categories, product_vehicle_compatibilities tables exist
- Confirm products.brand_id FK references brands(id)
- Confirm products.category_id FK references categories(id)
- Confirm product_vehicle_compatibilities.product_id FK references products(id)
- Confirm RLS enabled on all 3 new tables
```

---

## PHASE 4 — Inventory & Warehouse Improvements

**Scope:** Warehouse-level min/max stock thresholds, multi-method costing support,
lot/serial number tracking, fix Warehouse.manager flat String.

**Estimated risk:** MEDIUM — new tables + one enum type change on product_cost_history.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 4 — Inventory & Warehouse Improvements

TASK 1 — WarehouseStockThreshold table
Currently criticalQty is a single integer on products (global, not per-warehouse).
Create a table for per-warehouse thresholds:

Schema:
  id          String   @id @default(uuid())
  tenantId    String   (NOT NULL)
  warehouseId String   (NOT NULL, FK to warehouses.id)
  productId   String   (NOT NULL, FK to products.id)
  minQty      Int      @default(0)
  maxQty      Int?
  reorderQty  Int?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([tenantId, warehouseId, productId])
  @@index([tenantId])
  @@index([warehouseId])
  @@index([productId])
  @@map("warehouse_stock_thresholds")

Include RLS policy.
Note in [MANUAL STEPS]: "Seed this table from existing products.critical_qty values
using a one-time migration script."

TASK 2 — Costing method support
New Prisma enum:
  enum CostingMethod {
    WEIGHTED_AVERAGE
    FIFO
    LIFO
    FEFO
    STANDARD_COST
  }

Create ProductCostingConfig table:
  id            String        @id @default(uuid())
  tenantId      String        (NOT NULL)
  productId     String        @unique (FK to products.id — one config per product)
  method        CostingMethod @default(WEIGHTED_AVERAGE)
  standardCost  Decimal?      (used only when method = STANDARD_COST)
  effectiveFrom DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  @@index([tenantId])
  @@map("product_costing_configs")

Also change product_cost_history.method column from VARCHAR/String to the CostingMethod enum.
Show the ALTER TABLE ... USING cast and the Prisma schema change.
Include RLS policy for product_costing_configs.

TASK 3 — ProductLot table (lot / serial number tracking)
Schema:
  id               String   @id @default(uuid())
  tenantId         String   (NOT NULL)
  productId        String   (NOT NULL, FK to products.id)
  warehouseId      String?  (FK to warehouses.id)
  lotNumber        String
  serialNumber     String?
  expiryDate       DateTime?
  manufacturedDate DateTime?
  quantity         Decimal  @default(0)
  notes            String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@unique([tenantId, lotNumber, productId])
  @@index([tenantId])
  @@index([productId])
  @@index([warehouseId])
  @@index([expiryDate])
  @@map("product_lots")

Add optional FK to existing tables:
  invoice_items.lot_id    UUID NULL REFERENCES product_lots(id) ON DELETE SET NULL
  product_movements.lot_id UUID NULL REFERENCES product_lots(id) ON DELETE SET NULL

Include RLS policy for product_lots.

TASK 4 — Fix Warehouse.manager flat String
Add: manager_id UUID NULL REFERENCES users(id) ON DELETE SET NULL
Add index on (manager_id)
Keep the existing manager String? column as deprecated fallback — do NOT drop it yet.
Show both Prisma and SQL changes.

TASK 5 — Verification
- Confirm 3 new tables exist with correct columns
- Confirm unique constraint on warehouse_stock_thresholds and product_costing_configs
- Confirm lot_id FK on invoice_items and product_movements exists in pg_constraint
- Confirm CostingMethod enum exists in pg_type
```

---

## PHASE 5 — New SaaS Infrastructure Tables

**Scope:** Create the seven new SaaS-layer tables identified in the analysis report.

**Estimated risk:** LOW — all new tables, no existing schema modified.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 5 — New SaaS Infrastructure Tables

Create all 7 tables below. For each table provide the full Prisma model,
idempotent SQL CREATE TABLE, indexes, RLS policy (where applicable),
and a verification query.

TABLE 1 — TenantUsageMetric
Tracks API calls, storage usage, active users per tenant per day.
  id           String   @id @default(cuid())
  tenantId     String   (NOT NULL)
  metricDate   DateTime (store as DATE in PostgreSQL)
  apiCallCount Int      @default(0)
  storageBytes BigInt   @default(0)
  activeUsers  Int      @default(0)
  invoiceCount Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([tenantId, metricDate])
  @@index([tenantId])
  @@index([metricDate])
  @@map("tenant_usage_metrics")
RLS: tenant-scoped.

TABLE 2 — FeatureFlag
Tenant-level feature toggle system.
  id         String   @id @default(cuid())
  tenantId   String   (NOT NULL)
  flagKey    String   (e.g. "ENABLE_EARSIV", "ENABLE_POS_V2")
  isEnabled  Boolean  @default(false)
  payload    Json?    (optional config data for the flag)
  enabledAt  DateTime?
  disabledAt DateTime?
  enabledBy  String?  (FK to users.id)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([tenantId, flagKey])
  @@index([tenantId])
  @@map("feature_flags")
RLS: tenant-scoped.

TABLE 3 — ApiKey
External API access keys for tenant integrations.
  id          String    @id @default(cuid())
  tenantId    String    (NOT NULL)
  name        String    (human label, e.g. "Accounting Integration")
  keyHash     String    @unique  (store only SHA-256 hash, never plaintext)
  keyPrefix   String    (first 8 chars for display, e.g. "sk_live_")
  scopes      String[]  (array of permission strings)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  revokedAt   DateTime?
  revokedBy   String?   (FK to users.id)
  createdBy   String?   (FK to users.id)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([tenantId])
  @@index([keyPrefix])
  @@map("api_keys")
RLS: tenant-scoped.

TABLE 4 — WebhookEndpoint
Tenant-defined webhook receivers for system events.
  id            String   @id @default(cuid())
  tenantId      String   (NOT NULL)
  url           String
  events        String[] (e.g. ["invoice.created", "payment.received"])
  secret        String   (HMAC signing secret — store encrypted)
  isActive      Boolean  @default(true)
  failureCount  Int      @default(0)
  lastTriggered DateTime?
  createdBy     String?  (FK to users.id)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([tenantId])
  @@map("webhook_endpoints")
RLS: tenant-scoped.

TABLE 5 — Coupon
Discount coupon definitions created by SUPER_ADMIN.
  id              String             @id @default(cuid())
  code            String             @unique
  description     String?
  discountType    CouponDiscountType  (new enum: PERCENTAGE | FIXED_AMOUNT)
  discountValue   Decimal
  currency        String?            @default("TRY")
  maxUses         Int?               (null = unlimited)
  usedCount       Int                @default(0)
  validFrom       DateTime?
  validUntil      DateTime?
  applicablePlans String[]           (plan IDs; empty array = all plans)
  isActive        Boolean            @default(true)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  @@index([code])
  @@index([isActive])
  @@map("coupons")
Note: Global table — no tenantId, no RLS. Access controlled at application layer by SUPER_ADMIN role.

TABLE 6 — CouponRedemption
Records each time a tenant redeems a coupon.
  id              String   @id @default(cuid())
  couponId        String   (NOT NULL, FK to coupons.id)
  tenantId        String   (NOT NULL)
  subscriptionId  String?  (FK to subscriptions.id)
  redeemedAt      DateTime @default(now())
  discountApplied Decimal
  @@unique([couponId, tenantId])
  @@index([tenantId])
  @@index([couponId])
  @@map("coupon_redemptions")
RLS: tenant-scoped.

TABLE 7 — TenantOnboarding
Tracks onboarding wizard step completion per tenant.
  id          String   @id @default(cuid())
  tenantId    String   @unique (NOT NULL — one record per tenant)
  steps       Json     @default("{}")
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("tenant_onboardings")
RLS: tenant-scoped.

Also generate the CouponDiscountType enum in both Prisma and SQL (CREATE TYPE).

VERIFICATION for all 7 tables:
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('tenant_usage_metrics','feature_flags','api_keys',
                       'webhook_endpoints','coupons','coupon_redemptions','tenant_onboardings');
  -- Expected: 7 rows
```

---

## PHASE 6 — E-Invoice (E-Arsiv / E-Fatura) Table Structure

**Scope:** Build a complete e-invoice send/receive tracking structure conforming
to Turkish GIB UBL-TR format requirements.

**Estimated risk:** MEDIUM — new tables + minor additive changes to invoices and einvoice_inbox.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 6 — E-Invoice (E-Arsiv / E-Fatura) Structure

BACKGROUND
Current state:
- einvoice_inbox exists (receive side) but has no tenantId or FK to invoices
- EInvoiceStatus enum is on the Invoice model (PENDING, SENT, ERROR, DRAFT)
- No outbound e-invoice send tracking table exists

GIB UBL-TR mandatory fields currently missing from the invoices table:
  ettn, scenario (TICARIFATURA|TEMELFATURA), profileId (TR1.2),
  senderAlias, receiverAlias, receiverVkn, xmlContent, sentAt,
  responseCode, responseDescription

TASK 1 — Create EInvoiceSend table (outbound tracking)
Schema:
  id                  String          @id @default(cuid())
  tenantId            String          (NOT NULL)
  invoiceId           String          @unique  (FK to invoices.id)
  ettn                String          @unique  (GIB UUID)
  scenario            EInvoiceScenario (new enum: TICARIFATURA | TEMELFATURA | IHRACAT)
  profileId           String          @default("TR1.2")
  senderAlias         String
  receiverAlias       String?
  receiverVkn         String
  xmlContent          String?         (TEXT type in SQL — UBL-TR XML content)
  status              EInvoiceStatus  @default(DRAFT)
  sentAt              DateTime?
  responseCode        String?
  responseDescription String?
  responseXml         String?
  retryCount          Int             @default(0)
  lastRetryAt         DateTime?
  errorDetail         String?
  createdBy           String?         (FK to users.id)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  @@index([tenantId])
  @@index([ettn])
  @@index([status])
  @@index([sentAt])
  @@map("einvoice_sends")

New enum EInvoiceScenario: TICARIFATURA | TEMELFATURA | IHRACAT
Include RLS policy.

TASK 2 — Patch einvoice_inbox (additive columns only)
Add to the existing einvoice_inbox table:
  tenant_id          UUID NULL REFERENCES tenants(id)
  matched_invoice_id UUID NULL REFERENCES invoices(id) ON DELETE SET NULL
  scenario           VARCHAR(50) NULL
  receiver_vkn       VARCHAR(11) NULL
  status             VARCHAR(20) NOT NULL DEFAULT 'UNPROCESSED'
                     (allowed values: UNPROCESSED | MATCHED | REJECTED | DUPLICATE)
  processed_at       TIMESTAMP NULL
  processed_by       UUID NULL REFERENCES users(id)
Add indexes on (tenant_id), (status), (sender_vkn).
Show updated Prisma model for EInvoiceInbox.

TASK 3 — Add FK to invoices table
Add to invoices table:
  einvoice_send_id UUID NULL REFERENCES einvoice_sends(id) ON DELETE SET NULL
  @@index([einvoiceSendId])
Show Prisma model change (additive only — one nullable FK field).

TASK 4 — Create EInvoiceTenantConfig table
  id              String   @id @default(cuid())
  tenantId        String   @unique  (one config per tenant)
  isEInvoiceUser  Boolean  @default(false)
  isEArsivUser    Boolean  @default(false)
  integrationVkn  String?
  senderAlias     String?
  apiUsername     String?
  apiPasswordHash String?  (store encrypted)
  testMode        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@map("einvoice_tenant_configs")
RLS: tenant-scoped.

TASK 5 — Verification
- Confirm einvoice_sends exists with unique constraint on invoice_id
- Confirm einvoice_tenant_configs unique constraint on tenant_id
- Confirm FK einvoice_sends.invoice_id -> invoices.id in pg_constraint
- Confirm new columns on einvoice_inbox in information_schema.columns
- Confirm EInvoiceScenario enum exists in pg_type
```

---

## PHASE 7 — HR Module: Leave, Overtime & Asset Assignment

**Scope:** Add leave request management, overtime tracking, department entity,
and asset assignment tables to the HR module.

**Estimated risk:** LOW — all new tables.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 7 — HR Module: Leave, Overtime & Asset Tracking

TASK 1 — LeaveType table (configurable per tenant)
Schema:
  id          String   @id @default(uuid())
  tenantId    String   (NOT NULL)
  name        String   (e.g. "Annual Leave", "Sick Leave", "Unpaid Leave")
  code        String   (short code, e.g. "AL", "SL", "UL")
  isPaid      Boolean  @default(true)
  defaultDays Int?     (default annual entitlement; null = unlimited)
  carryOver   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("leave_types")
RLS: tenant-scoped.

TASK 2 — LeaveRequest table
Schema:
  id             String      @id @default(uuid())
  tenantId       String      (NOT NULL)
  employeeId     String      (NOT NULL, FK to employees.id)
  leaveTypeId    String      (NOT NULL, FK to leave_types.id)
  startDate      DateTime
  endDate        DateTime
  totalDays      Decimal
  reason         String?
  status         LeaveStatus @default(PENDING)
  approvedById   String?     (FK to users.id)
  approvedAt     DateTime?
  rejectedById   String?     (FK to users.id)
  rejectedAt     DateTime?
  rejectionNote  String?
  createdBy      String?     (FK to users.id)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  @@index([tenantId])
  @@index([employeeId])
  @@index([status])
  @@index([startDate, endDate])
  @@map("leave_requests")

New enum LeaveStatus: PENDING | APPROVED | REJECTED | CANCELLED
RLS: tenant-scoped.

TASK 3 — OvertimeRecord table
Schema:
  id             String         @id @default(uuid())
  tenantId       String         (NOT NULL)
  employeeId     String         (NOT NULL, FK to employees.id)
  date           DateTime
  hours          Decimal
  overtimeType   OvertimeType   (new enum: WEEKDAY | WEEKEND | PUBLIC_HOLIDAY)
  rate           Decimal        @default(1.5)  (pay multiplier)
  amount         Decimal?       (calculated: hours x hourlyRate x rate)
  status         OvertimeStatus @default(PENDING)
  approvedById   String?        (FK to users.id)
  approvedAt     DateTime?
  notes          String?
  createdBy      String?        (FK to users.id)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  @@index([tenantId])
  @@index([employeeId])
  @@index([date])
  @@map("overtime_records")

New enums:
  OvertimeType  : WEEKDAY | WEEKEND | PUBLIC_HOLIDAY
  OvertimeStatus: PENDING | APPROVED | REJECTED | PAID

RLS: tenant-scoped.

TASK 4 — Department table (replaces flat String on employees)
Schema:
  id         String   @id @default(uuid())
  tenantId   String   (NOT NULL)
  name       String
  code       String?
  managerId  String?  (FK to users.id)
  parentId   String?  (self-FK for hierarchy)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([tenantId, name])
  @@index([tenantId])
  @@map("departments")

Add to employees table:
  department_id UUID NULL REFERENCES departments(id) ON DELETE SET NULL

Keep the existing department String? column as deprecated fallback — do NOT drop it.
Show both changes in the Prisma Employee model.

TASK 5 — AssetAssignment table (zimmet / demirbase)
Schema:
  id             String         @id @default(uuid())
  tenantId       String         (NOT NULL)
  employeeId     String         (NOT NULL, FK to employees.id)
  assetName      String
  assetCode      String?
  serialNumber   String?
  description    String?
  assignedAt     DateTime       @default(now())
  returnedAt     DateTime?
  condition      AssetCondition @default(GOOD)
  notes          String?
  assignedBy     String?        (FK to users.id)
  returnedBy     String?        (FK to users.id)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  @@index([tenantId])
  @@index([employeeId])
  @@map("asset_assignments")

New enum AssetCondition: GOOD | DAMAGED | LOST | RETURNED
RLS: tenant-scoped.

TASK 6 — PerformanceReview table
Schema:
  id              String                @id @default(uuid())
  tenantId        String                (NOT NULL)
  employeeId      String                (NOT NULL, FK to employees.id)
  reviewerId      String                (NOT NULL, FK to users.id)
  periodStart     DateTime
  periodEnd       DateTime
  overallScore    Decimal?              (e.g. 1.0 to 5.0)
  goals           Json?                 (array of {goal, achieved, score})
  strengths       String?
  improvements    String?
  managerNotes    String?
  status          PerformanceStatus     @default(DRAFT)
  submittedAt     DateTime?
  acknowledgedAt  DateTime?
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  @@index([tenantId])
  @@index([employeeId])
  @@index([periodStart, periodEnd])
  @@map("performance_reviews")

New enum PerformanceStatus: DRAFT | SUBMITTED | ACKNOWLEDGED | CLOSED
RLS: tenant-scoped.

TASK 7 — Verification
- Confirm 6 new tables created
- Confirm department_id FK on employees in pg_constraint
- Confirm all new enums (LeaveStatus, OvertimeType, OvertimeStatus, AssetCondition, PerformanceStatus) in pg_type
- Confirm unique constraint on leave_types(tenant_id, code)
```

---

## PHASE 8 — Service Module: Warranties, Maintenance & Technician KPIs

**Scope:** Warranty tracking for work orders, preventive maintenance scheduling,
technician KPI snapshots, and service templates.

**Estimated risk:** LOW — new tables + one nullable FK addition to work_orders.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 8 — Service Module Enhancements

TASK 1 — ServiceTemplate table
Schema:
  id             String   @id @default(uuid())
  tenantId       String   (NOT NULL)
  name           String
  description    String?
  estimatedHours Decimal?
  laborCost      Decimal?
  isActive       Boolean  @default(true)
  items          Json?    (default line items: [{description, type, quantity, unitPrice}])
  createdBy      String?  (FK to users.id)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([tenantId])
  @@map("service_templates")

Add to work_orders table:
  service_template_id UUID NULL REFERENCES service_templates(id) ON DELETE SET NULL

RLS: tenant-scoped.

TASK 2 — WorkOrderWarranty table
Schema:
  id             String   @id @default(uuid())
  tenantId       String   (NOT NULL)
  workOrderId    String   @unique  (FK to work_orders.id)
  warrantyMonths Int
  startDate      DateTime @default(now())
  endDate        DateTime (must be computed as: startDate + warrantyMonths months — show trigger or app note)
  description    String?
  isVoid         Boolean  @default(false)
  voidReason     String?
  voidedAt       DateTime?
  voidedBy       String?  (FK to users.id)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([tenantId])
  @@index([workOrderId])
  @@index([endDate])
  @@map("work_order_warranties")
RLS: tenant-scoped.

TASK 3 — PreventiveMaintenance table
Schema:
  id                String          @id @default(uuid())
  tenantId          String          (NOT NULL)
  customerVehicleId String          (NOT NULL, FK to customer_vehicles.id)
  maintenanceType   MaintenanceType (new enum: OIL_CHANGE | BRAKE_CHECK | TYRE_ROTATION | PERIODIC | CUSTOM)
  intervalKm        Int?
  intervalMonths    Int?
  lastServiceKm     Int?
  lastServiceDate   DateTime?
  nextDueKm         Int?
  nextDueDate       DateTime?
  notes             String?
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  @@index([tenantId])
  @@index([customerVehicleId])
  @@index([nextDueDate])
  @@map("preventive_maintenances")

New enum MaintenanceType: OIL_CHANGE | BRAKE_CHECK | TYRE_ROTATION | PERIODIC | CUSTOM
RLS: tenant-scoped.

TASK 4 — TechnicianMetric table (daily KPI snapshot)
Schema:
  id                String   @id @default(uuid())
  tenantId          String   (NOT NULL)
  technicianId      String   (NOT NULL, FK to users.id)
  metricDate        DateTime (DATE in SQL — one row per technician per day)
  completedOrders   Int      @default(0)
  totalLaborHours   Decimal  @default(0)
  totalRevenue      Decimal  @default(0)
  avgCompletionTime Decimal? (hours — average per completed work order)
  customerRating    Decimal? (average rating if feedback collected)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  @@unique([tenantId, technicianId, metricDate])
  @@index([tenantId])
  @@index([technicianId])
  @@index([metricDate])
  @@map("technician_metrics")
RLS: tenant-scoped.

TASK 5 — Verification
- Confirm 4 new tables created
- Confirm service_template_id FK on work_orders in pg_constraint
- Confirm unique constraint on work_order_warranties(work_order_id)
- Confirm unique constraint on technician_metrics(tenant_id, technician_id, metric_date)
- Confirm MaintenanceType enum exists in pg_type
```

---

## PHASE 9 — Materialized Views for Reporting

**Scope:** Create five materialized views for the reporting layer. No existing tables
are modified — this phase is purely additive.

**Estimated risk:** LOW — read-only structures. Refresh operations are non-blocking
with CONCURRENTLY option.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 9 — Materialized Views for Reporting

RULES FOR ALL VIEWS IN THIS PHASE:
1. Every view MUST include tenant_id as the first column
2. Every view MUST have a UNIQUE index on (tenant_id, <grain>) to enable CONCURRENTLY refresh
3. Provide the full CREATE UNIQUE INDEX statement for each view
4. Provide the REFRESH MATERIALIZED VIEW CONCURRENTLY command for each view
5. Write a single stored procedure refresh_all_materialized_views() that refreshes
   all 5 views CONCURRENTLY in sequence
6. In [MANUAL STEPS] note: "Schedule pg_cron or application cron to call
   refresh_all_materialized_views() on the intervals shown below"

VIEW 1 — mv_tenant_balance
Refresh interval: every 15 minutes
Purpose: Current outstanding balance per account per tenant.

SELECT
  a.tenant_id,
  a.id                                                    AS account_id,
  a.title                                                 AS account_title,
  a.type                                                  AS account_type,
  a.balance                                               AS ledger_balance,
  COUNT(i.id)                                             AS open_invoice_count,
  COALESCE(SUM(
    CASE WHEN i.status NOT IN ('CLOSED','CANCELLED')
    THEN i.grand_total - COALESCE(i.paid_amount, 0) ELSE 0 END
  ), 0)                                                   AS outstanding_amount,
  MAX(i.due_date)                                         AS latest_due_date
FROM accounts a
LEFT JOIN invoices i
       ON i.account_id = a.id AND i.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.tenant_id, a.id, a.title, a.type, a.balance;

Unique index: (tenant_id, account_id)

VIEW 2 — mv_product_stock
Refresh interval: every 10 minutes
Purpose: On-hand quantity per product per warehouse per tenant.

SELECT
  pm.tenant_id,
  pm.product_id,
  pm.warehouse_id,
  p.code                                                  AS product_code,
  p.name                                                  AS product_name,
  p.brand                                                 AS brand,
  SUM(CASE
    WHEN pm.movement_type IN ('ENTRY','COUNT_SURPLUS','RETURN')      THEN  pm.quantity
    WHEN pm.movement_type IN ('EXIT','SALE','COUNT_SHORTAGE',
                               'CANCELLATION_EXIT')                   THEN -pm.quantity
    ELSE 0
  END)                                                    AS on_hand_qty,
  p.critical_qty,
  MAX(pm.created_at)                                      AS last_movement_at
FROM product_movements pm
JOIN products p ON p.id = pm.product_id
GROUP BY pm.tenant_id, pm.product_id, pm.warehouse_id,
         p.code, p.name, p.brand, p.critical_qty;

Unique index: (tenant_id, product_id, warehouse_id)

VIEW 3 — mv_monthly_revenue
Refresh interval: every 1 hour
Purpose: Monthly gross revenue summary per tenant.

SELECT
  tenant_id,
  DATE_TRUNC('month', invoice_date)                       AS month,
  COUNT(*)                                                AS invoice_count,
  SUM(grand_total)                                        AS gross_revenue,
  SUM(vat_amount)                                         AS total_vat,
  SUM(grand_total - vat_amount)                           AS net_revenue,
  COALESCE(SUM(paid_amount), 0)                           AS collected_amount,
  SUM(grand_total - COALESCE(paid_amount, 0))             AS outstanding_amount
FROM invoices
WHERE invoice_type = 'SALE'
  AND deleted_at IS NULL
  AND status != 'CANCELLED'
GROUP BY tenant_id, DATE_TRUNC('month', invoice_date);

Unique index: (tenant_id, month)

VIEW 4 — mv_overdue_invoices
Refresh interval: every 1 hour
Purpose: All overdue unpaid invoices with days-overdue.

SELECT
  i.tenant_id,
  i.id                                                    AS invoice_id,
  i.invoice_no,
  i.account_id,
  a.title                                                 AS account_title,
  i.grand_total,
  COALESCE(i.paid_amount, 0)                              AS paid_amount,
  i.grand_total - COALESCE(i.paid_amount, 0)              AS remaining_amount,
  i.due_date,
  (CURRENT_DATE - i.due_date::date)                       AS days_overdue,
  i.status
FROM invoices i
JOIN accounts a ON a.id = i.account_id
WHERE i.due_date < CURRENT_DATE
  AND i.status NOT IN ('CLOSED','CANCELLED')
  AND i.deleted_at IS NULL
  AND (i.grand_total - COALESCE(i.paid_amount, 0)) > 0;

Unique index: (tenant_id, invoice_id)

VIEW 5 — mv_technician_kpi
Refresh interval: every 30 minutes
Purpose: Rolling 30-day KPI per technician per tenant.

SELECT
  wo.tenant_id,
  wo.technician_id,
  u.full_name                                             AS technician_name,
  COUNT(wo.id)                                            AS total_orders,
  COUNT(CASE WHEN wo.status = 'INVOICED_CLOSED' THEN 1 END) AS completed_orders,
  ROUND(AVG(
    EXTRACT(EPOCH FROM (wo.actual_completion_date - wo.created_at)) / 3600
  )::numeric, 2)                                          AS avg_completion_hours,
  SUM(wo.total_labor_cost)                                AS total_labor_revenue,
  SUM(wo.total_parts_cost)                                AS total_parts_revenue,
  SUM(wo.grand_total)                                     AS total_revenue
FROM work_orders wo
JOIN users u ON u.id = wo.technician_id
WHERE wo.created_at >= NOW() - INTERVAL '30 days'
  AND wo.deleted_at IS NULL
  AND wo.technician_id IS NOT NULL
GROUP BY wo.tenant_id, wo.technician_id, u.full_name;

Unique index: (tenant_id, technician_id)

VERIFICATION:
- SELECT matviewname FROM pg_matviews WHERE matviewname LIKE 'mv_%' ORDER BY matviewname;
  Expected: 5 rows
- Confirm all 5 unique indexes exist in pg_indexes
- Confirm refresh_all_materialized_views() function exists in pg_proc
```

---

## PHASE 10 — Design Consistency Fixes

**Scope:** Fill `deletedAt` pattern gaps, add missing `updatedBy` columns,
fix the Collection dual-FK with a CHECK constraint.

**Estimated risk:** LOW — additive columns + one CHECK constraint addition.

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

PHASE 10 — Design Consistency Fixes

TASK 1 — Add missing soft-delete columns
The following transactional tables are missing the soft-delete pattern
(deletedAt DateTime?, deletedBy String?):
  accounts, account_movements, product_movements,
  bank_account_movements, cashbox_movements, salary_plans, salary_payments

For EACH table:
1. ALTER TABLE ... ADD COLUMN deleted_at TIMESTAMP NULL
2. ALTER TABLE ... ADD COLUMN deleted_by UUID NULL REFERENCES users(id) ON DELETE SET NULL
3. CREATE INDEX IF NOT EXISTS idx_<table>_deleted_at ON <table>(deleted_at)
4. Update Prisma model to add:
     deletedAt     DateTime?
     deletedBy     String?
     deletedByUser User? @relation(fields: [deletedBy], references: [id])
5. Show the updated RLS USING clause with AND deleted_at IS NULL appended

TASK 2 — Add missing updatedBy to critical tables
Tables missing updatedBy: invoices, accounts, work_orders

For EACH table:
1. ALTER TABLE ... ADD COLUMN updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL
2. Update Prisma model to add:
     updatedBy     String?
     updatedByUser User? @relation(fields: [updatedBy], references: [id])

TASK 3 — Fix Collection dual-FK with CHECK constraint
Current problem: collections has both invoice_id and service_invoice_id as nullable FKs.
At most one should be non-null at any time.

Add constraint:
  ALTER TABLE collections
    ADD CONSTRAINT chk_collection_single_invoice_source
    CHECK (
      (invoice_id IS NULL AND service_invoice_id IS NULL)
      OR (invoice_id IS NOT NULL AND service_invoice_id IS NULL)
      OR (invoice_id IS NULL AND service_invoice_id IS NOT NULL)
    );

Show:
1. The raw SQL statement
2. A Prisma comment on the Collection model explaining this constraint
   (Prisma cannot express CHECK constraints natively)
3. A test query that attempts to INSERT a row with both FKs non-null,
   confirms it raises an error, and then rolls back

TASK 4 — Verification
- Confirm deleted_at and deleted_by exist on all 7 tables in pg_columns
- Confirm updated_by exists on invoices, accounts, work_orders
- Confirm CHECK constraint chk_collection_single_invoice_source in pg_constraint
```

---

## FINAL VERIFICATION SUITE

After all 10 phases are complete, run this script in one query block:

```sql
-- ============================================================
-- FINAL VERIFICATION — OtoMuhasebe Database Migration Check
-- ============================================================

-- 1. Zero NULL tenantId on all critical tables
SELECT tbl, null_count FROM (
  SELECT 'products'          AS tbl, COUNT(*) AS null_count FROM products         WHERE tenant_id IS NULL UNION ALL
  SELECT 'accounts',                 COUNT(*)               FROM accounts         WHERE tenant_id IS NULL UNION ALL
  SELECT 'collections',              COUNT(*)               FROM collections      WHERE tenant_id IS NULL UNION ALL
  SELECT 'bank_transfers',           COUNT(*)               FROM bank_transfers   WHERE tenant_id IS NULL UNION ALL
  SELECT 'expenses',                 COUNT(*)               FROM expenses         WHERE tenant_id IS NULL UNION ALL
  SELECT 'roles',                    COUNT(*)               FROM roles            WHERE tenant_id IS NULL UNION ALL
  SELECT 'account_movements',        COUNT(*)               FROM account_movements WHERE tenant_id IS NULL UNION ALL
  SELECT 'audit_logs',               COUNT(*)               FROM audit_logs       WHERE tenant_id IS NULL UNION ALL
  SELECT 'units',                    COUNT(*)               FROM units            WHERE tenant_id IS NULL UNION ALL
  SELECT 'unit_sets',                COUNT(*)               FROM unit_sets        WHERE tenant_id IS NULL UNION ALL
  SELECT 'expense_categories',       COUNT(*)               FROM expense_categories WHERE tenant_id IS NULL
) t WHERE null_count > 0;
-- Expected: 0 rows

-- 2. All new tables present (25 expected)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'quick_tokens','brands','categories','product_vehicle_compatibilities',
    'warehouse_stock_thresholds','product_costing_configs','product_lots',
    'tenant_usage_metrics','feature_flags','api_keys','webhook_endpoints',
    'coupons','coupon_redemptions','tenant_onboardings',
    'einvoice_sends','einvoice_tenant_configs',
    'leave_types','leave_requests','overtime_records','departments',
    'asset_assignments','performance_reviews',
    'service_templates','work_order_warranties','preventive_maintenances','technician_metrics'
  )
ORDER BY table_name;
-- Expected: 26 rows

-- 3. All 5 materialized views present
SELECT matviewname FROM pg_matviews WHERE matviewname LIKE 'mv_%' ORDER BY matviewname;
-- Expected: 5 rows

-- 4. hizli_tokens no longer exists
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'hizli_tokens';
-- Expected: 0

-- 5. RLS enabled on all business tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT IN ('coupons','vehicle_catalog','postal_codes','modules','plans','permissions');
-- Expected: 0 rows
```

---

*OtoMuhasebe — Database Migration Prompt Guide v1.0*
*Prepared: March 2026 | 10 Phases | 26 New Tables | 5 Materialized Views*
