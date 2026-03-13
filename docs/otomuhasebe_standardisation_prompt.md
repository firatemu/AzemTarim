# OtoMuhasebe — Endpoint Standardisation & Pagination Meta Refactor
## Complete Full-Stack Prompt Guide

> **How to use:**
> Two independent change sets — run them in the order shown.
> Each session is self-contained: paste the Global Context Block + the session block
> into a fresh conversation, then paste the requested files.
> **Complete CHANGE SET A fully before starting CHANGE SET B.**
> Both change sets follow the same session structure:
>   Session 1 → Audit & build the map
>   Session 2 → Backend fix
>   Session 3 → Frontend fix
>   Session 4 → Verify

---

## GLOBAL CONTEXT BLOCK
*(Paste at the top of every session)*

```
You are a senior NestJS + Next.js TypeScript engineer performing two
standardisation refactors on the "OtoMuhasebe" project.

TECH STACK:
  - Backend  : NestJS (TypeScript), Prisma ORM, PostgreSQL
  - Frontend : Next.js (TypeScript), axios or fetch
  - Docs     : Swagger / OpenAPI (@nestjs/swagger)
  - Infra    : Docker Compose

THE TWO CHANGES BEING MADE:
  CHANGE A — Endpoint path standardisation
    All API endpoint paths must follow English REST conventions.
    Turkish slugs, mixed-language paths, and non-REST patterns must be corrected.

  CHANGE B — Pagination key rename
    The pagination wrapper key "metadata" must be renamed to "meta" everywhere:
      Backend service return objects, Pagination DTOs/interfaces,
      Swagger @ApiResponse schemas, Frontend response readers.

OUTPUT FORMAT for every fix:
  [FILE]      — relative path from project root
  [LINE]      — approximate line number
  [BEFORE]    — the current code (with 2 lines of context)
  [AFTER]     — the corrected code
  [LAYER]     — BACKEND-CONTROLLER | BACKEND-SERVICE | BACKEND-DTO |
                FRONTEND-API | FRONTEND-COMPONENT | SWAGGER | MODULE
  [RISK]      — BREAKING (must update both sides simultaneously) |
                SAFE (only one side affected)

HARD RULES:
  - Never rename a path on the backend without showing the matching frontend fix
    in the same response. A backend-only path change creates a new 404.
  - Never change "metadata" to "meta" on the backend without showing the
    matching frontend read fix. A backend-only key rename creates silent undefined values.
  - Always show both sides of every breaking change together.
  - Do not rewrite entire files. Show only changed lines with context.
  - If a path or key looks correct already, explicitly state: "No change needed."
```

---

# CHANGE SET A — Endpoint Path Standardisation

## A — PRE-SESSION: Automated Scan
*Run before Session A1. Paste output into Session A1.*

```bash
# 1. Find all controller route decorators (every endpoint definition)
grep -rn "@\(Get\|Post\|Put\|Patch\|Delete\|Controller\)(['\"]" \
  --include="*.controller.ts" \
  --exclude-dir=node_modules --exclude-dir=dist \
  ./src
# Shows every path string defined in the backend

# 2. Find all frontend API call URLs
grep -rn "axios\.\(get\|post\|put\|patch\|delete\)\|fetch(" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next \
  ./frontend/src
# Shows every URL string called from the frontend

# 3. Find Turkish slugs still in paths
grep -rn "@\(Get\|Post\|Put\|Patch\|Delete\|Controller\)(['\"].*\
\(cari\|hesap\|urun\|fatura\|stok\|depo\|kasa\|banka\|musteri\|tedarik\|siparis\
\|teklif\|irsaliye\|maliyet\|odeme\|tahsilat\|personel\|maas\|avans\|servis\|arac\)" \
  --include="*.controller.ts" \
  --exclude-dir=node_modules --exclude-dir=dist \
  ./src

# 4. Find @ApiTags with Turkish strings
grep -rn "@ApiTags\|@ApiOperation" \
  --include="*.controller.ts" \
  --exclude-dir=node_modules \
  ./src
```

---

## SESSION A1 — Build the Endpoint Translation Map

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION A1 — Build the Endpoint Translation Map
═══════════════════════════════════════════════════

GOAL: Before changing any file, produce a complete mapping table of every
endpoint path that needs updating. This table is the contract for Sessions A2 and A3.

ENDPOINT NAMING STANDARD TO ENFORCE:
  Rule 1 — kebab-case English nouns only
    /accounts          ✓    /cari-hesaplar      ✗
    /price-cards       ✓    /fiyat-kartlari     ✗
    /work-orders       ✓    /is-emirleri        ✗

  Rule 2 — REST resource naming (plural nouns, no verbs in path)
    GET    /accounts           → list all
    POST   /accounts           → create one
    GET    /accounts/:id       → get one
    PUT    /accounts/:id       → full update
    PATCH  /accounts/:id       → partial update
    DELETE /accounts/:id       → delete one
    GET    /accounts/:id/movements → nested resource

    NOT:   POST /accounts/kaydet          ✗  (verb in path)
    NOT:   GET  /accounts/listele         ✗  (verb in path)
    NOT:   POST /accounts/guncelle/:id    ✗  (verb + wrong method)

  Rule 3 — Nested resources use parent/child pattern
    GET /work-orders/:id/items       ✓
    GET /invoices/:id/collections    ✓
    NOT: GET /is-emri-kalemleri/:isEmriId  ✗

  Rule 4 — Action endpoints (non-CRUD) use verb after resource
    POST /invoices/:id/cancel        ✓
    POST /invoices/:id/send-einvoice ✓
    NOT: POST /fatura-iptal          ✗

TASK 1 — Endpoint Translation Table
From the grep output pasted below, produce this table for EVERY endpoint:

  | Current Path (Turkish/Non-Standard) | Correct Path (English REST) | HTTP Method | Controller File |
  |--------------------------------------|----------------------------|-------------|-----------------|
  | /cari-hesaplar                       | /accounts                  | GET, POST   | account.controller.ts |
  | /cari-hesaplar/:id                   | /accounts/:id              | GET,PUT,DELETE | account.controller.ts |
  | /stok-karti/kaydet                   | /products                  | POST        | product.controller.ts |
  | /fiyat-kart                          | /price-cards               | GET, POST   | price-card.controller.ts |
  ... (continue for all found paths)

TASK 2 — Conflict check
  For each rename, check: does the new English path already exist as a
  different endpoint? If yes, flag as CONFLICT — requires manual resolution.

TASK 3 — Impact assessment
  For each path change, list which frontend files call that path.
  A path change with no frontend caller is SAFE.
  A path change with frontend callers is BREAKING — both must change together.

TASK 4 — @ApiTags standardisation map
  List all current @ApiTags values and their correct English replacements:

  | Current @ApiTags          | Correct @ApiTags     |
  |---------------------------|----------------------|
  | 'Cari Hesaplar'           | 'Accounts'           |
  | 'Stok Kartları'           | 'Products'           |
  | 'Fatura İşlemleri'        | 'Invoices'           |
  ... (continue for all found tags)

═══════════════════════════════════════════════════
PASTE GREP OUTPUT BELOW:
═══════════════════════════════════════════════════
[PASTE HERE]
```

---

## SESSION A2 — Backend: Controller & Module Path Fix

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION A2 — Backend Controller & Module Path Fix
═══════════════════════════════════════════════════

USE THE TRANSLATION TABLE FROM SESSION A1.
For each controller file pasted, apply all checks below.

CHECK 1 — @Controller() base path
  The string inside @Controller('...') is the resource base path.
  It must be an English kebab-case plural noun.

  Broken:
    @Controller('cari-hesaplar')     // Turkish
    @Controller('stokKarti')         // camelCase, Turkish
    @Controller('fatura_islemleri')  // snake_case, Turkish
  Fixed:
    @Controller('accounts')
    @Controller('products')
    @Controller('invoices')

CHECK 2 — Method-level route paths (@Get, @Post, @Put, @Patch, @Delete)
  Verb-based sub-paths must be converted to REST conventions.
  No Turkish words anywhere in the path string.

  Broken:
    @Post('kaydet')              // verb + Turkish
    @Get('listele')              // verb + Turkish
    @Put('guncelle/:id')         // verb + Turkish
    @Delete('sil/:id')           // verb + Turkish
    @Post('iptal-et/:id')        // Turkish verb
    @Get('detay/:id')            // Turkish noun
  Fixed:
    @Post()                      // POST /accounts (create)
    @Get()                       // GET  /accounts (list)
    @Put(':id')                  // PUT  /accounts/:id (update)
    @Delete(':id')               // DELETE /accounts/:id
    @Post(':id/cancel')          // POST /accounts/:id/cancel
    @Get(':id')                  // GET  /accounts/:id

CHECK 3 — @Param() names after path rename
  If a path param was renamed (e.g. :cariId → :id), update @Param() too.

  Broken:
    @Get(':cariId')
    findOne(@Param('cariId') cariId: string)
  Fixed:
    @Get(':id')
    findOne(@Param('id') id: string)

  Also update every usage of the old param variable name inside the method body.

CHECK 4 — @ApiTags decorator
  Replace every Turkish or mixed-language @ApiTags string with the English version
  from the translation table built in Session A1.

  Broken:
    @ApiTags('Cari Hesaplar')
    @ApiTags('Stok Yönetimi')
  Fixed:
    @ApiTags('Accounts')
    @ApiTags('Inventory')

CHECK 5 — @ApiOperation decorator
  summary and description strings should be English.

  Broken:
    @ApiOperation({ summary: 'Cari hesap oluştur', description: 'Yeni cari hesap kaydeder' })
  Fixed:
    @ApiOperation({ summary: 'Create account', description: 'Creates a new account record' })

CHECK 6 — Module forRoutes() or path-based guards
  If any module, guard, or middleware uses path strings to match routes, update those too.

  Broken:
    .forRoutes({ path: 'cari-hesaplar', method: RequestMethod.ALL })
  Fixed:
    .forRoutes({ path: 'accounts', method: RequestMethod.ALL })

FOR EACH FILE — OUTPUT:
  All changed lines with [BEFORE] / [AFTER] blocks.
  A summary: "This file has N path changes."
  The matching frontend paths that must be updated in Session A3.

═══════════════════════════════════════════════════
PASTE CONTROLLER FILES BELOW (one per section):
═══════════════════════════════════════════════════

--- accounts.controller.ts ---
[PASTE HERE]

--- products.controller.ts ---
[PASTE HERE]

--- price-cards.controller.ts ---
[PASTE HERE]

--- invoices.controller.ts ---
[PASTE HERE]

--- work-orders.controller.ts ---
[PASTE HERE]

--- app.module.ts (or router file) ---
[PASTE HERE]

--- [any other controller with broken paths] ---
[PASTE HERE]
```

---

## SESSION A3 — Frontend: API URL Fix

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION A3 — Frontend API URL Fix
═══════════════════════════════════════════════════

USE THE TRANSLATION TABLE FROM SESSION A1.
Every frontend URL must match the new English backend paths fixed in Session A2.

IMPORTANT: Never change a frontend URL without confirming the backend path
was already updated in Session A2. If you change only the frontend, the
request will hit a non-existent route and return 404.

CHECK 1 — API service function URLs (axios/fetch calls)
  Every URL string in API service files must use the new English path.

  Broken:
    const response = await axios.get('/api/cari-hesaplar');
    const response = await axios.post('/api/stok-karti/kaydet', data);
    const response = await axios.delete(`/api/cari-hesaplar/sil/${id}`);
  Fixed:
    const response = await axios.get('/api/accounts');
    const response = await axios.post('/api/products', data);
    const response = await axios.delete(`/api/accounts/${id}`);

CHECK 2 — Dynamic URL builders
  If the project has a helper that builds URLs (e.g. buildUrl(), apiRoutes object),
  update the path strings inside those helpers.

  Broken:
    export const API_ROUTES = {
      accounts: {
        list:   '/api/cari-hesaplar',
        create: '/api/cari-hesaplar/kaydet',
        byId:   (id: string) => `/api/cari-hesaplar/${id}`,
      }
    }
  Fixed:
    export const API_ROUTES = {
      accounts: {
        list:   '/api/accounts',
        create: '/api/accounts',
        byId:   (id: string) => `/api/accounts/${id}`,
      }
    }

CHECK 3 — Next.js API route files (if using Next.js API proxy)
  If the project uses Next.js /pages/api/ or /app/api/ as a proxy layer,
  the proxy route file names and internal fetch URLs must both be updated.

  Broken directory:
    pages/api/cari-hesaplar/index.ts    → rename to pages/api/accounts/index.ts
    pages/api/cari-hesaplar/[id].ts     → rename to pages/api/accounts/[id].ts

  Inside the proxy file, the internal fetch to the NestJS backend must also use
  the new English path.

CHECK 4 — SWR / React Query keys
  If the project uses SWR or React Query, the cache key strings often contain
  the URL path. Update them to match the new paths.

  Broken:
    const { data } = useSWR('/api/cari-hesaplar', fetcher);
    useQuery(['cari-hesaplar', id], () => fetchAccount(id));
  Fixed:
    const { data } = useSWR('/api/accounts', fetcher);
    useQuery(['accounts', id], () => fetchAccount(id));

CHECK 5 — TypeScript constants and enums for route paths
  If route paths are stored in constants files, update those too.

  Broken:
    export const ROUTES = {
      ACCOUNT_LIST: '/cari-hesaplar',
      PRODUCT_CREATE: '/stok-karti/yeni',
    }
  Fixed:
    export const ROUTES = {
      ACCOUNT_LIST: '/accounts',
      PRODUCT_CREATE: '/products/new',
    }

═══════════════════════════════════════════════════
PASTE FRONTEND FILES BELOW:
═══════════════════════════════════════════════════

--- api/accounts.ts (or services/accountService.ts) ---
[PASTE HERE]

--- api/products.ts ---
[PASTE HERE]

--- api/price-cards.ts ---
[PASTE HERE]

--- constants/routes.ts or apiRoutes.ts (if exists) ---
[PASTE HERE]

--- [any component that calls the API directly] ---
[PASTE HERE]
```

---

## SESSION A4 — Change Set A Verification

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION A4 — Endpoint Standardisation Verification
═══════════════════════════════════════════════════

TASK 1 — Run the scan again (should return empty)
  Re-run the pre-session grep commands. All Turkish slugs should now return 0 results.

  Expected: zero lines output for the Turkish path grep.

TASK 2 — Swagger UI check
  After rebuilding, open http://localhost:3010/api/docs (or your Swagger URL).
  Confirm:
    - All @ApiTags show English group names
    - All endpoint paths show English kebab-case
    - No Turkish strings visible anywhere in the Swagger UI

TASK 3 — Endpoint smoke test
  Run these requests and confirm each returns the expected HTTP status:

    GET    /api/accounts           → 200
    POST   /api/accounts           → 201 (with valid body)
    GET    /api/accounts/:id       → 200
    PUT    /api/accounts/:id       → 200
    DELETE /api/accounts/:id       → 200

    GET    /api/products           → 200
    POST   /api/products           → 201

    GET    /api/price-cards        → 200
    POST   /api/price-cards        → 201

    GET    /api/invoices           → 200
    GET    /api/work-orders        → 200

  Confirm: zero 404 errors (path not found)
  Confirm: zero 500 errors caused by routing

TASK 4 — Old path 404 check
  Confirm the old Turkish paths now correctly return 404 (not accidentally still working):
    GET /api/cari-hesaplar         → 404  ✓
    POST /api/stok-karti/kaydet    → 404  ✓
```

---
---

# CHANGE SET B — Pagination `metadata` → `meta` Standardisation

## B — PRE-SESSION: Automated Scan
*Run before Session B1. Paste output into Session B1.*

```bash
# 1. Find all backend usages of "metadata" as pagination key
grep -rn "metadata:" \
  --include="*.service.ts" --include="*.controller.ts" \
  --include="*.dto.ts" --include="*.interface.ts" \
  --exclude-dir=node_modules --exclude-dir=dist \
  ./src

# 2. Find all Swagger @ApiProperty with metadata
grep -rn "metadata" \
  --include="*.dto.ts" --include="*.swagger.ts" \
  --exclude-dir=node_modules \
  ./src

# 3. Find all frontend reads of .metadata
grep -rn "\.metadata\b\|response\.metadata\|\[.metadata.\]" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next \
  ./frontend/src

# 4. Find all TypeScript interface/type definitions with metadata
grep -rn "metadata[?]?:" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  ./frontend/src
```

---

## SESSION B1 — Build the Pagination Impact Map

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION B1 — Build the Pagination Impact Map
═══════════════════════════════════════════════════

GOAL: Map every location where the key "metadata" is used as a pagination
wrapper, so the rename to "meta" can be applied consistently.

THE STANDARD PAGINATION RESPONSE SHAPE (after this change):
  {
    "data": [...],
    "meta": {               ← was "metadata"
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }

TASK 1 — Classify every "metadata" occurrence found by grep

  TYPE 1 — Backend service return object
    return { data: results, metadata: { total, page, ... } };
    → Must change to: return { data: results, meta: { total, page, ... } };

  TYPE 2 — Backend pagination DTO / interface class
    class PaginationMetaDto { ... }
    export interface PaginatedResponse<T> { data: T[]; metadata: PaginationMeta; }
    → Must change: rename class/interface and the key

  TYPE 3 — Swagger @ApiProperty on response DTO
    @ApiProperty({ type: PaginationMetaDto })
    metadata: PaginationMetaDto;
    → Must change: property name and referenced class name

  TYPE 4 — Frontend response reader
    const { data, metadata } = response.data;
    setTotal(metadata.total);
    → Must change: destructuring key and all usages

  TYPE 5 — Frontend TypeScript interface
    interface PaginatedResponse<T> { data: T[]; metadata: PaginationMeta; }
    → Must change: key name

TASK 2 — Impact table
  Produce a table for every file that contains "metadata" as a pagination key:

  | File | Line | Type | Risk |
  |------|------|------|------|
  | src/common/dto/paginated-response.dto.ts | 12 | TYPE 2 | BREAKING |
  | src/accounts/accounts.service.ts | 87 | TYPE 1 | BREAKING |
  | frontend/src/api/accounts.ts | 34 | TYPE 4 | BREAKING |
  | frontend/src/types/pagination.ts | 5 | TYPE 5 | BREAKING |
  ... (all occurrences)

TASK 3 — Shared pagination class identification
  Identify if the project has a single shared pagination DTO/class that all
  services reuse (e.g. PaginatedResponseDto, PaginationMeta).
  If yes: fixing the shared class fixes all services at once — flag this as
  HIGH LEVERAGE, fix it first.

═══════════════════════════════════════════════════
PASTE GREP OUTPUT BELOW:
═══════════════════════════════════════════════════
[PASTE HERE]
```

---

## SESSION B2 — Backend: Service, DTO & Swagger Fix

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION B2 — Backend Pagination Key Fix
═══════════════════════════════════════════════════

THE RENAME RULE:
  Every occurrence of the string "metadata" used as a pagination wrapper key
  must become "meta". This applies to:
    - Object property keys in return statements
    - DTO/interface property names
    - Swagger @ApiProperty property names
    - Class names that include "Metadata" in a pagination context

  Do NOT rename "metadata" if it refers to:
    - General record metadata (e.g. AuditLog.metadata: Json — this is NOT pagination)
    - Prisma model metadata fields
    - HTTP response metadata (headers, etc.)
  Only rename "metadata" when it is the pagination wrapper key.

CHECK 1 — Shared pagination DTO / interface (fix first — highest leverage)
  Find the shared class such as:
    PaginatedResponseDto
    PaginationMetaDto
    PaginatedResponse<T>
    PageMetaDto

  For each such class:

  Broken:
    export class PaginatedResponseDto<T> {
      @ApiProperty()
      data: T[];

      @ApiProperty({ type: PaginationMetaDto })
      metadata: PaginationMetaDto;     // ← rename to 'meta'
    }

    export class PaginationMetaDto {
      @ApiProperty() total: number;
      @ApiProperty() page: number;
      @ApiProperty() limit: number;
      @ApiProperty() totalPages: number;
      @ApiProperty() hasNextPage: boolean;
      @ApiProperty() hasPreviousPage: boolean;
    }

  Fixed:
    export class PaginatedResponseDto<T> {
      @ApiProperty()
      data: T[];

      @ApiProperty({ type: PaginationMetaDto })
      meta: PaginationMetaDto;         // ← renamed
    }

    // PaginationMetaDto class name stays the same (it's a class name, not the key)
    // Only the PROPERTY NAME changes: metadata → meta

CHECK 2 — Service return statements
  Every return statement that builds a paginated response must use the new key.

  Broken:
    return {
      data: accounts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };

  Fixed:
    return {
      data: accounts,
      meta: {                    // ← renamed
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };

CHECK 3 — Controller @ApiResponse schemas
  If any controller uses an inline response schema that includes "metadata":

  Broken:
    @ApiResponse({
      schema: {
        properties: {
          data: { type: 'array' },
          metadata: { $ref: getSchemaPath(PaginationMetaDto) }  // ← rename
        }
      }
    })
  Fixed:
    @ApiResponse({
      schema: {
        properties: {
          data: { type: 'array' },
          meta: { $ref: getSchemaPath(PaginationMetaDto) }      // ← renamed
        }
      }
    })

CHECK 4 — Helper / utility functions that build pagination objects
  If the project has a createPaginatedResponse() or buildMeta() utility function,
  update the returned object key.

  Broken:
    export function paginate<T>(data: T[], total: number, page: number, limit: number) {
      return {
        data,
        metadata: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };
    }
  Fixed:
    export function paginate<T>(data: T[], total: number, page: number, limit: number) {
      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };
    }

═══════════════════════════════════════════════════
PASTE FILES BELOW (fix shared pagination DTO first):
═══════════════════════════════════════════════════

--- src/common/dto/paginated-response.dto.ts (or equivalent) ---
[PASTE HERE]

--- src/common/helpers/pagination.helper.ts (if exists) ---
[PASTE HERE]

--- accounts.service.ts ---
[PASTE HERE]

--- products.service.ts ---
[PASTE HERE]

--- invoices.service.ts ---
[PASTE HERE]

--- [any other service that returns paginated data] ---
[PASTE HERE]
```

---

## SESSION B3 — Frontend: Response Reader & Type Fix

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION B3 — Frontend Pagination Key Fix
═══════════════════════════════════════════════════

THE RENAME RULE (frontend mirror of Session B2):
  Every place the frontend reads ".metadata" from an API response must
  be updated to ".meta".
  Every TypeScript interface/type that declares "metadata" as a pagination
  key must be updated to "meta".

CHECK 1 — TypeScript interface / type definitions
  Find the shared frontend type for paginated responses and update it first
  (highest leverage — fixes all usages that derive from this type).

  Broken:
    // types/pagination.ts
    export interface PaginatedResponse<T> {
      data: T[];
      metadata: {           // ← rename to 'meta'
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }
  Fixed:
    export interface PaginatedResponse<T> {
      data: T[];
      meta: {               // ← renamed
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }

CHECK 2 — API service function response destructuring
  Every function that receives a paginated response and destructures it.

  Broken:
    const response = await axios.get<PaginatedResponse<Account>>('/api/accounts');
    const { data, metadata } = response.data;    // ← rename metadata
    setAccounts(data);
    setTotal(metadata.total);                    // ← rename
    setTotalPages(metadata.totalPages);          // ← rename
  Fixed:
    const response = await axios.get<PaginatedResponse<Account>>('/api/accounts');
    const { data, meta } = response.data;        // ← renamed
    setAccounts(data);
    setTotal(meta.total);                        // ← renamed
    setTotalPages(meta.totalPages);              // ← renamed

CHECK 3 — Component-level response handling
  Any React component that calls an API directly and reads the pagination data.

  Broken:
    const result = await fetchAccounts(page, limit);
    setPagination({
      total: result.metadata.total,              // ← rename
      currentPage: result.metadata.page,         // ← rename
      totalPages: result.metadata.totalPages,    // ← rename
    });
  Fixed:
    const result = await fetchAccounts(page, limit);
    setPagination({
      total: result.meta.total,                  // ← renamed
      currentPage: result.meta.page,             // ← renamed
      totalPages: result.meta.totalPages,        // ← renamed
    });

CHECK 4 — SWR / React Query selectors
  If useSWR or useQuery has a select/transform function that reads metadata:

  Broken:
    useQuery({
      queryFn: () => fetchAccounts(),
      select: (res) => ({
        accounts: res.data,
        total: res.metadata.total,      // ← rename
      })
    });
  Fixed:
    useQuery({
      queryFn: () => fetchAccounts(),
      select: (res) => ({
        accounts: res.data,
        total: res.meta.total,          // ← renamed
      })
    });

CHECK 5 — Pagination UI components
  Any reusable <Pagination /> component that receives metadata as a prop.

  Broken:
    <Pagination
      total={response.metadata.total}
      page={response.metadata.page}
      pageSize={response.metadata.limit}
    />
  Fixed:
    <Pagination
      total={response.meta.total}
      page={response.meta.page}
      pageSize={response.meta.limit}
    />

  Also check the Pagination component's own props interface:
  Broken:
    interface PaginationProps {
      metadata: { total: number; page: number; limit: number; }
    }
  Fixed:
    interface PaginationProps {
      meta: { total: number; page: number; limit: number; }
    }

═══════════════════════════════════════════════════
PASTE FILES BELOW (fix shared type/interface first):
═══════════════════════════════════════════════════

--- frontend/src/types/pagination.ts (or equivalent) ---
[PASTE HERE]

--- frontend/src/api/accounts.ts ---
[PASTE HERE]

--- frontend/src/api/products.ts ---
[PASTE HERE]

--- frontend/src/components/Pagination.tsx (if exists) ---
[PASTE HERE]

--- [any list page component that reads pagination data] ---
[PASTE HERE]
```

---

## SESSION B4 — Change Set B Verification

```
[PASTE GLOBAL CONTEXT BLOCK HERE]

═══════════════════════════════════════════════════
SESSION B4 — Pagination Rename Verification
═══════════════════════════════════════════════════

TASK 1 — Re-run the scan (should return zero pagination-context results)
  Re-run this grep — output should be empty for pagination usages:

    grep -rn '"metadata"\|\.metadata\b' \
      --include="*.ts" --include="*.tsx" \
      --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
      .

  Acceptable remaining hits: non-pagination "metadata" fields
  (e.g. AuditLog.metadata Json field in Prisma — this should NOT be renamed).
  For each remaining hit, confirm it is NOT a pagination key.

TASK 2 — API response shape test
  Call any list endpoint and confirm the response shape:

    GET /api/accounts?page=1&limit=20

  Expected response:
    {
      "data": [...],
      "meta": {            ← must be "meta", not "metadata"
        "total": ...,
        "page": 1,
        "limit": 20,
        "totalPages": ...,
        "hasNextPage": ...,
        "hasPreviousPage": ...
      }
    }

  Confirm: response.meta exists and is not undefined
  Confirm: response.metadata does not exist (undefined)

TASK 3 — Swagger UI check
  Open Swagger UI and expand any GET list endpoint.
  In the Response Schema section, confirm the pagination wrapper key shows as "meta".

TASK 4 — Frontend pagination UI smoke test
  Open any list page (accounts list, products list, invoices list).
  Confirm:
    - Total count number renders correctly (not NaN or undefined)
    - Page navigation works
    - "Showing X of Y" type displays work correctly
  These break silently when the key rename is incomplete on the frontend.
```

---

## MASTER EXECUTION SEQUENCE

```
═══════════════════════════════════════════════════════════════
COMPLETE EXECUTION ORDER — run in this exact sequence
═══════════════════════════════════════════════════════════════

── CHANGE SET A: Endpoint Paths ──────────────────────────────

[ ] Run Pre-Session A grep commands
[ ] SESSION A1: Build translation map
[ ] SESSION A2: Fix all controller paths + @ApiTags
    → docker compose exec backend npx tsc --noEmit  (check for TS errors)
[ ] SESSION A3: Fix all frontend API URLs
[ ] SESSION A4: Verify — run smoke tests

── Rebuild after Change Set A ────────────────────────────────
[ ] docker compose down
[ ] docker compose build --no-cache backend frontend
[ ] docker compose up -d
[ ] Confirm: all endpoints return expected status codes

── CHANGE SET B: Pagination meta ─────────────────────────────

[ ] Run Pre-Session B grep commands
[ ] SESSION B1: Build impact map
[ ] SESSION B2: Fix backend shared DTO first, then services
    → docker compose exec backend npx tsc --noEmit
[ ] SESSION B3: Fix frontend shared type first, then consumers
[ ] SESSION B4: Verify — check response shape + UI rendering

── Rebuild after Change Set B ────────────────────────────────
[ ] docker compose build --no-cache backend frontend
[ ] docker compose up -d
[ ] GET /api/accounts?page=1&limit=20 → confirm "meta" key in response
[ ] Open any list page → confirm pagination numbers render correctly

── Final global scan ─────────────────────────────────────────
[ ] Re-run all grep commands — expect zero hits for:
    - Turkish path slugs in controllers
    - Turkish path slugs in frontend API calls
    - "metadata" as pagination key (backend + frontend)
```

---

## QUICK REFERENCE — What Each Change Breaks if Done Incompletely

| Change | If only backend updated | If only frontend updated |
|---|---|---|
| Path rename | Frontend gets 404 | Backend route never reached |
| `metadata → meta` (backend) | Frontend reads `undefined` for all pagination — silent UI break | No effect |
| `metadata → meta` (frontend) | Frontend reads `undefined` — silent UI break | No effect |
| `@ApiTags` update | Swagger shows wrong groups | No runtime effect |

**Rule:** Always update both sides of every breaking change in the same session.
Never deploy a half-done rename.

---

*OtoMuhasebe — Endpoint & Pagination Standardisation Prompt v1.0*
*Change Sets: 2 | Sessions: 8 | Stack: NestJS + Prisma + Next.js + Docker*
*March 2026*
