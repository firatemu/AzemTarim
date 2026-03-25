# PHASE 1 — Bordro Listesi & Detay Sayfaları
# Target: Cursor / Windsurf Agent Mode
# Prerequisite: Phase 0 complete

---

## ROLE & OBJECTIVE

You are continuing the enterprise ERP frontend. Phase 0 (design system, types, shared
components, AppShell) is already complete. Build Phase 1 now: the Bordro (Journal) list
and detail pages.

Do NOT regenerate Phase 0 files. Import from existing paths.
Do NOT ask clarifying questions. Every file must be complete, production-ready.

---

## CONTEXT (from Phase 0)

- Types:     `@/types/check-bill` (CheckBillJournal, JournalType, etc.)
- API:       `@/lib/api` (api.get, api.post, api.delete)
- QK:        `@/lib/query-keys` (QK.journals, QK.journal)
- Format:    `@/lib/format` (formatAmount, formatDate, isOverdue)
- Labels:    `@/lib/labels` (JOURNAL_TYPE_LABEL, STATUS_LABEL)
- Shared UI: StatusBadge, AmountCell, StatCard, EmptyState, ConfirmDialog,
             TableSkeleton, PageHeader

---

## PAGE 1: `/payroll` — Bordro Listesi

### File: `src/app/payroll/page.tsx`

#### Layout
```
[PageHeader: "Bordro Yönetimi"]   [Yeni Bordro butonu]
[4 StatCards row]
[FilterBar]
[JournalTable]
```

#### Stat Cards (4 adet)
Fetch from `GET /api/payroll` and compute client-side:

| Label            | Value                              | Icon        | Variant  |
|------------------|------------------------------------|-------------|----------|
| Toplam Bordro    | count of all journals this month   | FileText    | default  |
| Toplam Tutar     | sum of all journal amounts         | TrendingUp  | info     |
| Bu Ay Tahsilat   | sum of COLLECTED journals          | CheckCircle | success  |
| Bekleyen Evrak   | count of IN_PORTFOLIO status docs  | Clock       | warning  |

#### FilterBar — `src/app/payroll/_components/journal-filter-bar.tsx`

Inline row of filters (no collapse needed):
- **Arama**: text input, searches journalNo and account title
- **Tür**: Select with all JournalType values + "Tümü" option
- **Tarih**: DateRangePicker (from/to), two calendar inputs side by side
- **Temizle**: ghost button, resets all filters

All filters are URL search params (useSearchParams + router.push). No client state for filters.

#### JournalTable — `src/app/payroll/_components/journal-table.tsx`

Use TanStack Table v8. Columns:

| Column         | Width | Content                                            |
|----------------|-------|----------------------------------------------------|
| Bordro No      | 130px | Monospace font, amber color, clickable → detail    |
| Tür            | 180px | JournalType badge (pill, muted bg)                 |
| Tarih          | 110px | formatDate                                         |
| Cari / Banka   | 200px | account.title or bankAccount.name, muted if null   |
| Evrak Sayısı   | 80px  | center-aligned count                               |
| Toplam Tutar   | 140px | AmountCell, right-aligned                          |
| İşlemler       | 80px  | DropdownMenu: Görüntüle, Yazdır, ─, İptal          |

Features:
- Sortable columns: Tarih, Toplam Tutar
- Pagination: 20 rows/page, page controls bottom-right
- Row hover: subtle bg-surface-2 transition
- Row click navigates to `/payroll/[id]`
- Empty state: EmptyState component with FileText icon
- Loading: TableSkeleton with 6 cols

#### Actions
- **Yeni Bordro** button → navigates to `/payroll/new`
- **Dışa Aktar** button → triggers CSV download (build a `downloadCSV(data, filename)` utility)
- Row **İptal** → ConfirmDialog → DELETE `/api/payroll/:id` → invalidate QK.journals

---

## PAGE 2: `/payroll/[id]` — Bordro Detayı

### File: `src/app/payroll/[id]/page.tsx`

Fetch: `GET /api/payroll/:id`
Response shape: `CheckBillJournal & { checkBills: CheckBill[], totalAmount: number }`

#### Layout
```
[Back button ←]  [PageHeader: "Bordro #B-2024-001"]   [Yazdır | PDF | Tahsilat Ekle]
[JournalInfoCard]
─────────────────────────────────────────────
[Evrak Listesi table]
─────────────────────────────────────────────
[CiroZinciri]  |  [ActivityTimeline]
```

#### JournalInfoCard — `src/app/payroll/[id]/_components/journal-info-card.tsx`

Two-column grid card showing:
- Left col: Bordro No, Tür (badge), Tarih, Notlar
- Right col: Cari / Banka, Toplam Tutar (large serif font), Evrak Sayısı
- Top-right corner: JournalType badge (larger, prominent)

#### Embedded Evrak Listesi

Not navigable — inline read-only table inside the detail page.

Columns:
| Column       | Content                                   |
|--------------|-------------------------------------------|
| Evrak Tipi   | Çek / Senet icon + label                  |
| Portföy      | Alacak / Borç badge                       |
| Çek No       | mono font                                 |
| Banka/Şube   | "{bank} / {branch}" or "—"               |
| Vade Tarihi  | date + overdue indicator (red dot)        |
| Tutar        | AmountCell with remainingAmount secondary |
| Durum        | StatusBadge                               |
| →            | Link icon → `/checks/[id]`               |

Footer: total row with sum of all amounts.

#### CiroZinciri — `src/app/payroll/[id]/_components/endorsement-chain.tsx`

Render only if any `checkBill.endorsements` exist.
Visual: horizontal chain of nodes connected by arrows:

```
[Cari A] ──→ [Banka X] ──→ [Cari B]
  giriş        ciro          son sahip
```

Each node: rounded rect with account name + date below.
Arrow: thin line with chevron.
Implemented as a flex row of nodes + SVG arrows between them.

#### ActivityTimeline — `src/app/payroll/[id]/_components/activity-timeline.tsx`

Vertical timeline from `checkBill.logs[]` (flattened across all docs in journal):

Each entry:
- Left: colored dot (color matches status)
- Center: "{fromStatus} → {toStatus}" in status badge format
- Right: date + performer name
- Optional: notes in muted text below

Sort: newest first.
Show max 20 entries; "Tümünü Göster" button expands.

#### Header Actions
- **Yazdır**: `window.print()` with `@media print` styles that show only the printable layout
- **PDF**: navigates to `/payroll/print/[id]` in new tab
- **Tahsilat Ekle**: opens `CollectionSheet` (shadcn Sheet from right side)

#### CollectionSheet — `src/app/payroll/[id]/_components/collection-sheet.tsx`

Sheet from right (width 480px):
- Title: "Tahsilat Ekle"
- Select evrak: searchable list of the journal's checkBills with status IN_PORTFOLIO or PARTIAL_PAID
- Tahsilat tutarı: number input, shows `Kalan: {remainingAmount}` below
- Tarih: date picker
- Tahsilat yeri: Radio → "Kasa" | "Banka"
  - If Kasa: CashboxSelect
  - If Banka: BankAccountSelect
- Notlar: textarea
- Submit: POST `/api/checks-promissory-notes/action`
  Body: `CollectionActionDto`
- On success: toast + invalidate QK.journal(id) + close sheet

---

## HOOKS

### `src/hooks/use-journals.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { CheckBillJournal, JournalFilters } from '@/types/check-bill'

export function useJournals(filters?: JournalFilters) {
  return useQuery({
    queryKey: QK.journals(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as Record<string, string>)
      return api.get<CheckBillJournal[]>(`/payroll?${params}`)
    },
  })
}

export function useJournal(id: string) {
  return useQuery({
    queryKey: QK.journal(id),
    queryFn: () => api.get<CheckBillJournal>(`/payroll/${id}`),
    enabled: !!id,
  })
}

export function useDeleteJournal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payroll/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.journals() }),
  })
}
```

### `src/hooks/use-collection-action.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/query-keys'

export function useCollectionAction(journalId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CollectionActionDto) =>
      api.post('/checks-promissory-notes/action', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.journals() })
      if (journalId) qc.invalidateQueries({ queryKey: QK.journal(journalId) })
      qc.invalidateQueries({ queryKey: QK.checks() })
    },
  })
}
```

---

## UTILITIES

### `src/lib/export.ts`

```typescript
export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const v = String(row[h] ?? '')
        return v.includes(',') ? `"${v}"` : v
      }).join(',')
    ),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
```

---

## OUTPUT REQUIREMENTS

Produce in order:
1. `src/hooks/use-journals.ts`
2. `src/hooks/use-collection-action.ts`
3. `src/lib/export.ts`
4. `src/app/payroll/page.tsx`
5. `src/app/payroll/_components/journal-filter-bar.tsx`
6. `src/app/payroll/_components/journal-table.tsx`
7. `src/app/payroll/[id]/page.tsx`
8. `src/app/payroll/[id]/_components/journal-info-card.tsx`
9. `src/app/payroll/[id]/_components/endorsement-chain.tsx`
10. `src/app/payroll/[id]/_components/activity-timeline.tsx`
11. `src/app/payroll/[id]/_components/collection-sheet.tsx`

Every file: complete, no placeholders, compilable TypeScript. End with file manifest.
