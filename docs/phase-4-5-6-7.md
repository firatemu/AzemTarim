# PHASE 4 — Evrak İşlemleri (Yeni, Düzenleme, Tahsilat)
# Target: Cursor / Windsurf Agent Mode
# Prerequisite: Phase 0–3 complete

---

## ROLE & OBJECTIVE

Build document CRUD operations and the collection flow.
Do NOT regenerate earlier phase files. Import from existing paths.
Do NOT ask clarifying questions. Every file must be complete.

---

## PAGE 1: `/checks/new` — Tekil Evrak Girişi

### File: `src/app/checks/new/page.tsx`

Single-page form (no wizard). Two-column layout on desktop, single-column on mobile.

#### Form sections:

**Section A — Evrak Kimliği**
- Evrak Tipi: two large toggle buttons "ÇEK" | "SENET" (not a dropdown)
- Portföy Tipi: two toggle buttons "ALACAK (Müşteriden Gelen)" | "BORÇ (Bize Verilen)"

**Section B — Tutar & Vade**
- Nominal Tutar: number input with TL suffix
- Vade Tarihi: DatePicker, required, must be future date

**Section C — Cari**
- Cari Hesap: AccountSelect, required

**Section D — Evrak Detayları** (collapsible, default open)
- Çek / Senet No: text
- Seri No: text
- Banka: text
- Şube: text
- Hesap No: text

**Section E — Ek Bilgiler**
- Notlar: textarea, 4 rows

#### Footer Actions
- "İptal" → router.back() (with ConfirmDialog if form is dirty)
- "Kaydet" → POST `/api/checks-promissory-notes` → success: router.push(`/checks/${id}`)

#### Zod Schema
```typescript
const checkBillSchema = z.object({
  type:          z.nativeEnum(CheckBillType),
  portfolioType: z.nativeEnum(PortfolioType),
  accountId:     z.string().uuid(),
  faceAmount:    z.number().positive().max(99_999_999),
  dueDate:       z.string().datetime(),
  checkNo:       z.string().optional(),
  serialNo:      z.string().optional(),
  bank:          z.string().optional(),
  branch:        z.string().optional(),
  accountNo:     z.string().optional(),
  notes:         z.string().optional(),
})
```

---

## PAGE 2: `/checks/[id]/edit` — Evrak Düzenleme

### File: `src/app/checks/[id]/edit/page.tsx`

Identical form to `/checks/new` but:
- Pre-populated from `GET /api/checks-promissory-notes/:id`
- Submit: `PUT /api/checks-promissory-notes/:id`
- Status-based field locking: if `status !== IN_PORTFOLIO`, show read-only banner:
  ```
  ⚠ Bu evrak "{STATUS_LABEL[status]}" durumunda olduğundan bazı alanlar düzenlenemez.
  ```
  Lock: faceAmount, dueDate, accountId when status is not IN_PORTFOLIO.

---

## PAGE 3: `/checks/[id]/collection` — Tahsilat Sayfası

### File: `src/app/checks/[id]/collection/page.tsx`

Full-page form (not a modal, for a dedicated flow with more space).

#### Layout:
```
[← Geri]  [PageHeader: "Tahsilat İşlemi"]
──────────────────────────────────────────
[DocumentSummaryBanner]
──────────────────────────────────────────
[CollectionForm]
```

#### DocumentSummaryBanner
Read-only card showing the document being collected:
- Evrak tipi badge, Çek No, Cari adı
- Nominal tutar (large)
- Kalan tutar (highlighted if partial)
- Progress bar: collected so far / face amount
- Vade tarihi (with overdue indicator)

#### CollectionForm fields:
- **Tahsilat Tutarı**: number input
  - Helper text: "Kalan tutar: {formatAmount(remainingAmount)}"
  - Validation: must be > 0 and ≤ remainingAmount
  - "Tamamını Tahsil Et" link button that fills in remainingAmount
- **Tarih**: DatePicker, defaults to today
- **Tahsilat Yeri**: Radio buttons
  - "Kasa" → shows CashboxSelect (required if Kasa selected)
  - "Banka" → shows BankAccountSelect (required if Banka selected)
- **Notlar**: textarea, optional

#### Submit behavior:
- POST `/api/checks-promissory-notes/action`
- Body: CollectionActionDto
- On success:
  - toast.success("Tahsilat kaydedildi")
  - router.push(`/checks/${id}`)
- On error: toast.error with message

#### Zod Schema
```typescript
const collectionSchema = z.object({
  checkBillId:       z.string().uuid(),
  transactionAmount: z.number().positive(),
  date:              z.string().datetime(),
  cashboxId:         z.string().uuid().optional(),
  bankAccountId:     z.string().uuid().optional(),
  notes:             z.string().optional(),
}).refine(d => d.cashboxId || d.bankAccountId, {
  message: 'Kasa veya banka hesabı seçilmelidir',
  path: ['cashboxId'],
})
```

---

## HOOKS

### `src/hooks/use-check-mutations.ts`

```typescript
export function useCreateCheck() { ... }  // POST /api/checks-promissory-notes
export function useUpdateCheck(id: string) { ... }  // PUT /api/checks-promissory-notes/:id
export function useCollectionAction() { ... }  // POST /api/checks-promissory-notes/action
```

All mutations invalidate QK.checks() and QK.check(id) on success.

---

## OUTPUT REQUIREMENTS

1. `src/hooks/use-check-mutations.ts`
2. `src/app/checks/new/page.tsx`
3. `src/app/checks/[id]/edit/page.tsx`
4. `src/app/checks/[id]/collection/page.tsx`

Every file: complete, compilable TypeScript. End with file manifest.

---
---

# PHASE 5 — Yazdırma Sayfaları (Bordro + Makbuz)
# Prerequisite: Phase 0–4 complete

---

## ROLE & OBJECTIVE

Build print-optimized pages for bordro and receipt.
These pages must look professional when printed on A4 paper.

---

## PAGE 1: `/payroll/print/[id]` — Yazdırılabilir Bordro

### File: `src/app/payroll/print/[id]/page.tsx`

This page is ONLY for printing. No AppShell. No sidebar.

#### Print Layout (A4 portrait):

```
┌────────────────────────────────────────────────────┐
│ [Company Logo]          [Şirket Adı]               │
│                         [Adres]                    │
│                         [Tel / Vergi No]           │
├────────────────────────────────────────────────────┤
│               BORDRO                               │
│         No: B-2025-001        Tarih: 15.01.2025    │
│         Tür: Müşteri Evrak Girişi                  │
│         Cari: Müşteri Adı A.Ş.                    │
├────────────────────────────────────────────────────┤
│ No │ Evrak Tipi │ Çek No │ Banka │ Vade    │ Tutar │
│ 1  │ Çek        │ 12345  │ Ziraat│ 15/02/25│ 5.000 │
│ 2  │ Senet      │ 00123  │ —     │ 20/03/25│ 3.500 │
├────────────────────────────────────────────────────┤
│                         TOPLAM: 8.500,00 TL        │
├────────────────────────────────────────────────────┤
│ Teslim Eden:              Teslim Alan:              │
│                                                    │
│ ___________________       ___________________      │
│ İmza / Kaşe               İmza / Kaşe              │
└────────────────────────────────────────────────────┘
```

Implementation:
- All layout with print-safe CSS (no Tailwind classes that break in print)
- Use `@page { size: A4; margin: 15mm; }` in a `<style>` tag
- React Query fetch inside page component
- "Yazdır" button (no-print) triggers `window.print()`
- "← Geri" button (no-print) goes back
- Font: system serif for print (Georgia, Times)
- Table: black borders, 1px solid, no colors

### `src/app/payroll/print/[id]/print.css`

Dedicated print stylesheet:
```css
@page { size: A4 portrait; margin: 15mm 20mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #000; background: #fff; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #333; padding: 4pt 6pt; font-size: 10pt; }
th { background: #f0f0f0; font-weight: bold; text-align: left; }
.no-print { display: none !important; }
.total-row { font-weight: bold; font-size: 12pt; }
h1 { font-size: 18pt; text-align: center; text-transform: uppercase; letter-spacing: 2pt; }
```

---

## PAGE 2: `/checks/[id]/receipt` — Tahsilat Makbuzu

### File: `src/app/checks/[id]/receipt/page.tsx`

Query param: `?collectionId={id}` (optional — if not provided, show latest collection)

#### Print Layout:

```
┌────────────────────────────────────────────────────┐
│ [Company Logo]          [Şirket Adı]               │
│                         TAHSİLAT MAKBUZU           │
│                         Makbuz No: TM-2025-001     │
│                         Tarih: 15.01.2025          │
├────────────────────────────────────────────────────┤
│ ÖDEME YAPAN:  Müşteri Adı A.Ş.                    │
│ EVRAK:        Çek No. 12345 — Ziraat Bankası       │
│ VADE TARİHİ:  15.02.2025                           │
│ NOMINAL TUTAR: 5.000,00 TL                         │
├────────────────────────────────────────────────────┤
│ TAHSİL EDİLEN TUTAR:                               │
│                                                    │
│           5.000,00 TL                              │
│    (Beş Bin Türk Lirası)                           │
│                                                    │
│ Tahsilat Yeri: Merkez Kasası                       │
│ Tahsilat Tarihi: 15.01.2025                        │
├────────────────────────────────────────────────────┤
│ Tahsil Eden:              Müşteri İmzası:          │
│                                                    │
│ ___________________       ___________________      │
└────────────────────────────────────────────────────┘
```

Number-to-words: implement `amountToWords(amount: number): string` in Turkish:
```typescript
// "5000" → "Beş Bin Türk Lirası"
// Must handle: 0-999999999
// Use a lookup table approach, not a library
```

---

## OUTPUT REQUIREMENTS

1. `src/lib/amount-to-words.ts` (Turkish number-to-words)
2. `src/app/payroll/print/[id]/print.css`
3. `src/app/payroll/print/[id]/page.tsx`
4. `src/app/checks/[id]/receipt/page.tsx`

Every file: complete, print-ready. End with file manifest.

---
---

# PHASE 6 — Raporlar
# Prerequisite: Phase 0–5 complete

---

## ROLE & OBJECTIVE

Build 6 report sub-pages under `/reports/*`.
Each report is a standalone page with charts and data tables.
All charts use Recharts. All data via React Query.

---

## SHARED REPORT LAYOUT

### `src/app/reports/layout.tsx`

Shared layout for all report pages:
- Horizontal tab navigation: Portföy | Vade Analizi | Cari Özet | Banka | Tahsilat | Vadesi Geçmiş
- Date range filter (global, applies to all reports): "Bu Ay" | "Bu Çeyrek" | "Bu Yıl" | "Özel Aralık"
- Export button (PDF download for that report)

---

## PAGE 1: `/reports/portfolio` — Portföy Durumu

Fetch: `GET /api/checks-promissory-notes?` grouped by status

Layout:
- Left: DonutChart (Recharts PieChart) — status dağılımı
  - Each slice: status color, label, amount
  - Center: total amount (serif font)
- Right: Table
  | Durum | Evrak Sayısı | Toplam Tutar | Oran |
  |-------|-------------|--------------|------|
  With StatusBadge in Durum column and mini progress bar in Oran column.

---

## PAGE 2: `/reports/maturity` — Vade Analizi

Fetch: `GET /api/checks-promissory-notes?status=IN_PORTFOLIO`

Layout:
- BarChart (Recharts): X = time buckets, Y = amount
  Buckets: "Vadesi Geçmiş" | "0–7 gün" | "8–30 gün" | "31–60 gün" | "61–90 gün" | "90+ gün"
  Two bars per bucket: CREDIT (blue) and DEBIT (amber)
- Below: Maturity schedule table
  | Vade Aralığı | Çek Sayısı | CREDIT Tutar | DEBIT Tutar | Net |
- Overdue section: highlighted red, shows each overdue document

---

## PAGE 3: `/reports/account` — Cari Özet

Fetch: `GET /api/checks-promissory-notes` grouped by accountId

Layout:
- Search/filter by account name
- Table:
  | Cari | Portföyde | Tahsil Edilen | Vadesi Geçmiş | Net Bakiye |
  Each row expandable to show document list (accordion)
- BarChart: top 10 accounts by outstanding amount

---

## PAGE 4: `/reports/bank` — Banka Dağılım

Fetch: `GET /api/checks-promissory-notes` grouped by bank

Layout:
- HorizontalBarChart: bank → amount
- Table:
  | Banka | Evrak Sayısı | Toplam Tutar | Bankada Tahsilde | Teminatta |

---

## PAGE 5: `/reports/collection` — Tahsilat Performansı

Fetch: `GET /api/checks-promissory-notes/collections` (monthly grouped)

Layout:
- LineChart: monthly collection amounts (CREDIT vs DEBIT)
- KPI cards: Ort. Tahsilat Süresi, Tahsilat Oranı %, Kısmi Tahsilat Sayısı
- Table: monthly breakdown

---

## PAGE 6: `/reports/overdue` — Vadesi Geçmiş

Fetch: `GET /api/checks-promissory-notes?status=IN_PORTFOLIO,UNPAID&dueDateTo={today}`

Layout:
- Alert banner: "X evrakın vadesi geçti, toplam {Y} TL"
- Filter: CREDIT / DEBIT toggle
- Table (sorted by overdue days DESC):
  | Çek No | Cari | Vade | Gecikme | Tutar | Durum | İşlem |
  Gecikme column: red badge showing "+X gün"
- "Tümünü Dışa Aktar" CSV button

---

## CHART THEME

All Recharts charts must use this theme:
```typescript
const CHART_COLORS = {
  credit:  '#3b82f6',  // blue
  debit:   '#f59e0b',  // amber
  success: '#22c55e',
  danger:  '#ef4444',
  muted:   '#3f3f46',
}

const CHART_DEFAULTS = {
  // Tooltip
  tooltipStyle: {
    background: '#111113',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#fafafa',
  },
  // Grid
  cartesianGrid: { stroke: '#27272a', strokeDasharray: '3 3' },
  // Axis
  axisStyle: { fill: '#71717a', fontSize: 12 },
}
```

---

## OUTPUT REQUIREMENTS

1. `src/app/reports/layout.tsx`
2. `src/app/reports/portfolio/page.tsx`
3. `src/app/reports/maturity/page.tsx`
4. `src/app/reports/account/page.tsx`
5. `src/app/reports/bank/page.tsx`
6. `src/app/reports/collection/page.tsx`
7. `src/app/reports/overdue/page.tsx`

Every file: complete, compilable TypeScript. End with file manifest.

---
---

# PHASE 7 — Ayarlar & Polish
# Prerequisite: Phase 0–6 complete

---

## ROLE & OBJECTIVE

Build the settings page and apply final polish across the app.
This is the finishing pass — animations, transitions, edge cases.

---

## PAGE 1: Çek/Senet ayarları — `Sistem Parametreleri`

**Route:** `/settings/parameters` (bölüm anchor: `#cek-senet`)

**Bileşen:** `panel-stage/client/src/components/settings/CheckBillSettingsSection.tsx`  
(Aynı bölüm `Sistem Parametreleri` sayfasına gömülü; ayrı `/settings/check-bill` rotası yok — eski URL `next.config` ile `/settings/parameters` adresine yönlendirilir.)

**Bordro numaralandırma (ön ek, hane, sayaç):** `/settings/number-templates` — modül **Bordro Numaralandırma** (`CHECK_BILL_JOURNAL`). Sistem parametresi `CHECK_BILL_SETTINGS` içinde tutulmaz.

**Section A — Otomatik Durum Geçişleri**
- Vadesi geçince otomatik UNPAID yap: Switch
  - Helper: "Her gece 01:00'de çalışır"
- Hatırlatma gönder: Switch
  - Kaç gün önce: Select (1 / 3 / 7 / 15 gün)

**Section B — Varsayılan Değerler**
- Varsayılan Banka Hesabı: BankAccountSelect
- Varsayılan Kasa: CashboxSelect

Her bölümde ayrı "Kaydet"; kalıcı veri `PUT /system-parameters/CHECK_BILL_SETTINGS` ile saklanır.

---

## POLISH TASKS

Apply these improvements across all pages built in Phase 1–6:

### P1 — Page Transitions
In `src/app/layout.tsx`, wrap `{children}` with:
```typescript
<div className="animate-fade-in">
  {children}
</div>
```

### P2 — Loading States
Ensure every page that fetches data shows the appropriate skeleton BEFORE data arrives.
Check: journal list, check list, all detail pages, all report pages.

### P3 — Error Boundaries
Create `src/app/error.tsx` (Next.js error boundary):
```typescript
// Shows a friendly error card with "Tekrar Dene" button
// Logs error to console
// Never shows raw error stack to user
```

### P4 — Not Found
Create `src/app/not-found.tsx`:
```typescript
// Clean "404 - Sayfa Bulunamadı" page
// With link back to dashboard
```

### P5 — Mobile Responsiveness
The sidebar should become a drawer on mobile (< 768px):
- Hidden by default on mobile
- Hamburger button in Topbar opens it as a Sheet
- Closes on navigation

### P6 — Keyboard Navigation
- All tables: arrow keys to navigate rows, Enter to open detail
- All forms: Tab order must be logical
- All modals/sheets: Escape to close

### P7 — Toast Notifications
Ensure every mutation (create, update, delete, collect) shows:
- Success: green toast with action performed
- Error: red toast with error message
- Loading: neutral toast while pending (for slow operations >1s)

---

## OUTPUT REQUIREMENTS

1. `src/components/settings/CheckBillSettingsSection.tsx` (ve `src/app/(main)/settings/parameters/page.tsx` içinde kullanımı)
2. `src/app/error.tsx`
3. `src/app/not-found.tsx`
4. `src/components/layout/mobile-sidebar.tsx`
5. Updated `src/components/layout/sidebar.tsx` (with mobile support)
6. Updated `src/components/layout/topbar.tsx` (with hamburger)
7. Final polish notes (as inline comments in code, not a separate file)

Every file: complete, compilable TypeScript. End with final file manifest covering ALL phases.
