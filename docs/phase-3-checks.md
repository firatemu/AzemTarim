# PHASE 3 — Çek/Senet Listesi & Detay Sayfaları
# Target: Cursor / Windsurf Agent Mode
# Prerequisite: Phase 0 + Phase 1 + Phase 2 complete

---

## ROLE & OBJECTIVE

Build the `/checks` list and `/checks/[id]` detail pages.
This is the core document management UI — the most data-dense section of the app.

Do NOT regenerate earlier phase files. Import from existing paths.
Do NOT ask clarifying questions. Every file must be complete.

---

## PAGE 1: `/checks` — Çek/Senet Listesi

### File: `src/app/checks/page.tsx`

#### Layout
```
[PageHeader: "Çek & Senet Yönetimi"]   [Yeni Evrak | Export | Bordro Oluştur]
[4 StatCards]
[PortfolioTabs]  ←  CREDIT / DEBIT
  [AdvancedFilterPanel]
  [CheckBillTable]
```

#### Stat Cards
Computed from fetched data:

| Label            | Value                           | Icon       | Variant  |
|------------------|---------------------------------|------------|----------|
| Portföyde        | count IN_PORTFOLIO              | Wallet     | info     |
| Toplam Tutar     | sum of faceAmount all active    | DollarSign | default  |
| Bu Ay Vadesi     | count dueDate in current month  | Calendar   | warning  |
| Protestolu       | count isProtested=true          | AlertTriangle | danger |

#### PortfolioTabs

Two tabs: "Alacak (CREDIT)" and "Borç (DEBIT)".
Switching tab changes `portfolioType` filter and re-fetches.
Each tab shows document count badge.

```typescript
// Tabs implementation
<Tabs value={portfolioType} onValueChange={setPortfolioType}>
  <TabsList>
    <TabsTrigger value="CREDIT">
      Alacak <Badge>{creditCount}</Badge>
    </TabsTrigger>
    <TabsTrigger value="DEBIT">
      Borç <Badge>{debitCount}</Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

#### AdvancedFilterPanel — `src/app/checks/_components/advanced-filter-panel.tsx`

Collapsible (default collapsed). Toggle button shows active filter count badge.

When expanded, shows grid of filters:

| Filter        | Component           | API param     |
|---------------|---------------------|---------------|
| Arama         | text input          | search        |
| Evrak Tipi    | Select (Çek/Senet)  | type          |
| Durum         | Multi-select badges | status[]      |
| Cari          | AccountSelect       | accountId     |
| Vade Başlangıç| DatePicker          | dueDateFrom   |
| Vade Bitiş    | DatePicker          | dueDateTo     |
| Banka         | text input          | bank          |
| Protestolu    | Switch              | isProtested   |

All filters are URL search params. "Filtreleri Temizle" button resets all.

Status multi-select: render all CheckBillStatus values as clickable badge pills.
Selected = filled amber, unselected = muted outline. Can select multiple.

#### CheckBillTable — `src/app/checks/_components/check-bill-table.tsx`

TanStack Table v8. Columns:

| Column      | Width | Content                                             |
|-------------|-------|-----------------------------------------------------|
| ☐           | 40px  | Checkbox (for bulk actions)                         |
| Evrak       | 90px  | Çek/Senet icon + "ÇEK" or "SENET" micro-label       |
| Çek No      | 120px | mono font, truncated                                |
| Cari        | 180px | account.title, link style                           |
| Banka/Şube  | 160px | "{bank} / {branch}" or "—"                        |
| Vade        | 110px | date + overdue pill if past due                     |
| Tutar       | 130px | AmountCell (faceAmount + remainingAmount secondary) |
| Durum       | 140px | StatusBadge                                         |
| İşlemler    | 60px  | DropdownMenu                                        |

DropdownMenu per row:
- Görüntüle → `/checks/[id]`
- Tahsilat Ekle → opens CollectionDialog (if eligible)
- Düzenle → `/checks/[id]/edit`
- Makbuz Yazdır → `/checks/[id]/receipt`
- ─ (separator)
- Sil → ConfirmDialog → soft delete

Bulk actions bar (appears when ≥1 row selected):
```
[{N} evrak seçildi]  [Bordro Oluştur]  [Dışa Aktar]  [×]
```
"Bordro Oluştur" with selected IDs → navigates to `/payroll/new?ids={...}&type=BANK_COLLECTION_ENDORSEMENT`

Overdue indicator: if `isOverdue(dueDate)` and status is IN_PORTFOLIO → show red dot + "Vadesi Geçti" tooltip on vade cell.

Pagination: 25 rows/page. Server-side pagination using `page` and `limit` URL params.

---

## PAGE 2: `/checks/[id]` — Evrak Detayı

### File: `src/app/checks/[id]/page.tsx`

Fetch: `GET /api/checks-promissory-notes/:id`

#### Layout
```
[← Geri]  [PageHeader]  [Durum Badge - large]  [Actions]
───────────────────────────────────────────────────────────
[DocumentInfoCard]           [StatusFlowCard]
───────────────────────────────────────────────────────────
[EndorsementChainCard]
───────────────────────────────────────────────────────────
[CollectionHistoryCard]      [ActivityLogCard]
```

#### DocumentInfoCard — `_components/document-info-card.tsx`

Two-column info grid. All fields from CheckBill model:

Left column:
- Evrak Tipi (Çek / Senet icon + label)
- Portföy Tipi (Alacak / Borç badge)
- Cari Hesap (linked)
- Çek / Senet No
- Seri No

Right column:
- Nominal Tutar (large serif)
- Kalan Tutar (muted, smaller)
- Vade Tarihi (+ overdue indicator if past)
- Banka / Şube / Hesap No
- Son Bordro (linked to journal)

Bottom: Notlar (if any), full width.
Protestolu: if `isProtested`, show prominent red "PROTESTOLU" banner across top of card.

#### StatusFlowCard — `_components/status-flow-card.tsx`

Visual state machine showing current status and available transitions.

Implementation:
- Render all CheckBillStatus values as small nodes
- Current status: large, filled amber
- Past statuses (from logs): filled muted green
- Future possible statuses: outlined, muted
- Arrows between legal transitions (hardcode the legal transition map from the backend spec)

Layout: horizontal flow, wrap on overflow.

This is a VISUAL component — use SVG or pure CSS flex/grid. No library needed.

#### EndorsementChainCard — `_components/endorsement-chain-card.tsx`

Fetch: `GET /api/checks-promissory-notes/endorsements/:id`

If no endorsements: show `EmptyState` with "Henüz ciro işlemi yok".

If endorsements exist:
```
[Orijinal Sahip]──→[Ciro 1: Banka X, 15 Oca]──→[Ciro 2: Cari B, 3 Şub]──→[Güncel Sahip]
```

Each node:
- Icon: User or Building depending on type
- Name (account title)
- Date below (small muted)
- Current holder node: amber outline

Scrollable horizontally on small screens.

#### CollectionHistoryCard — `_components/collection-history-card.tsx`

Fetch: `GET /api/checks-promissory-notes/collections/:id`

Table columns:
| Tarih | Tutar | Kasa / Banka | Bordro |
|-------|-------|--------------|--------|

Footer: "Toplam Tahsil: {sum} / Nominal: {faceAmount}"
Progress bar: `collectedTotal / faceAmount * 100` → amber fill.

#### ActivityLogCard — `_components/activity-log-card.tsx`

Vertical timeline from `checkBill.logs[]`.
Identical implementation to the one in Phase 1 but scoped to this document.

#### Header Actions (conditional by status)

```typescript
// Show actions based on current status
const ACTIONS: Record<CheckBillStatus, ActionConfig[]> = {
  IN_PORTFOLIO: [
    { label: 'Tahsilat Ekle', icon: DollarSign, href: '/checks/[id]/collection' },
    { label: 'Düzenle', icon: Pencil, href: '/checks/[id]/edit' },
  ],
  PARTIAL_PAID: [
    { label: 'Tahsilat Ekle', icon: DollarSign, href: '/checks/[id]/collection' },
  ],
  COLLECTED: [
    { label: 'Makbuz Yazdır', icon: Receipt, href: '/checks/[id]/receipt' },
  ],
  // ... other statuses with relevant actions
}
```

Always show: "Makbuz Yazdır" and "Yazdır".

---

## HOOKS

### `src/hooks/use-checks.ts`

```typescript
export function useChecks(filters?: CheckBillFilters) { ... }
export function useCheck(id: string) { ... }
export function useCheckEndorsements(id: string) { ... }
export function useCheckCollections(id: string) { ... }
export function useDeleteCheck() { ... }
```

Pattern same as `use-journals.ts` from Phase 1.
Fetch endpoints:
- `GET /api/checks-promissory-notes`
- `GET /api/checks-promissory-notes/:id`
- `GET /api/checks-promissory-notes/endorsements/:id`
- `GET /api/checks-promissory-notes/collections/:id`
- `DELETE /api/checks-promissory-notes/:id`

---

## OUTPUT REQUIREMENTS

Produce in order:
1. `src/hooks/use-checks.ts`
2. `src/app/checks/page.tsx`
3. `src/app/checks/_components/advanced-filter-panel.tsx`
4. `src/app/checks/_components/check-bill-table.tsx`
5. `src/app/checks/[id]/page.tsx`
6. `src/app/checks/[id]/_components/document-info-card.tsx`
7. `src/app/checks/[id]/_components/status-flow-card.tsx`
8. `src/app/checks/[id]/_components/endorsement-chain-card.tsx`
9. `src/app/checks/[id]/_components/collection-history-card.tsx`
10. `src/app/checks/[id]/_components/activity-log-card.tsx`

Every file: complete, compilable TypeScript, correct imports. End with file manifest.
