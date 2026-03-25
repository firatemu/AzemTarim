# PHASE 2 — Yeni Bordro Sihirbazı
# Target: Cursor / Windsurf Agent Mode
# Prerequisite: Phase 0 + Phase 1 complete

---

## ROLE & OBJECTIVE

Build the 4-step "Yeni Bordro" wizard at `/payroll/new`.
This is the most complex form in the application — take extra care with state,
validation, and conditional rendering per JournalType.

Do NOT regenerate Phase 0/1 files. Import from existing paths.
Do NOT ask clarifying questions. Every file must be complete.

---

## ROUTE: `/payroll/new`

### File: `src/app/payroll/new/page.tsx`

Wrapper page that renders the `<JournalWizard />` component.
No layout changes — uses the same AppShell.

---

## WIZARD ARCHITECTURE

### `src/app/payroll/new/_components/journal-wizard.tsx`

State manager for the 4-step wizard.
Use a single `useReducer` (NOT useState per field) for wizard state.

#### Wizard State shape:

```typescript
interface WizardState {
  step: 1 | 2 | 3 | 4
  // Step 1
  journalType: JournalType | null
  // Step 2
  journalNo: string
  date: string          // ISO 8601
  accountId: string
  bankAccountId: string
  cashboxId: string
  notes: string
  // Step 3
  newDocuments: NewDocumentForm[]       // for CREDIT/DEBIT ENTRY types
  selectedDocumentIds: string[]         // for EXIT/ENDORSEMENT types
  transactionAmount: number             // for COLLECTION type
  // Derived
  isDirty: boolean
}

interface NewDocumentForm {
  _id: string           // client-side temp ID (uuid())
  type: CheckBillType
  accountId: string
  faceAmount: number
  dueDate: string
  bank: string
  branch: string
  accountNo: string
  checkNo: string
  serialNo: string
  notes: string
}
```

#### Step routing by JournalType:

```typescript
// Which fields are shown in Step 2?
const REQUIRES_ACCOUNT = [
  'CUSTOMER_DOCUMENT_ENTRY', 'CUSTOMER_DOCUMENT_EXIT',
  'OWN_DOCUMENT_ENTRY', 'OWN_DOCUMENT_EXIT',
  'ACCOUNT_DOCUMENT_ENDORSEMENT', 'RETURN_PAYROLL',
]
const REQUIRES_BANK = [
  'BANK_COLLECTION_ENDORSEMENT', 'BANK_GUARANTEE_ENDORSEMENT',
]

// Step 3 mode
type Step3Mode = 'new-documents' | 'select-documents' | 'collection'

function getStep3Mode(type: JournalType): Step3Mode {
  if (['CUSTOMER_DOCUMENT_ENTRY', 'OWN_DOCUMENT_ENTRY'].includes(type)) return 'new-documents'
  if (['BANK_COLLECTION_ENDORSEMENT', 'BANK_GUARANTEE_ENDORSEMENT',
       'CUSTOMER_DOCUMENT_EXIT', 'ACCOUNT_DOCUMENT_ENDORSEMENT',
       'DEBIT_DOCUMENT_EXIT', 'RETURN_PAYROLL'].includes(type)) return 'select-documents'
  return 'select-documents'
}
```

#### Progress indicator at top:
```
Step ① Bordro Tipi  →  ② Bilgiler  →  ③ Evraklar  →  ④ Önizleme
```
Each step shown as numbered circle: filled amber = current, filled muted = done, outlined = future.
Connectors between steps as thin horizontal lines.

#### Navigation:
- "İleri" button advances step (validates current step first)
- "Geri" button goes back (no validation)
- "İptal" button → ConfirmDialog ("Çıkmak istediğinize emin misiniz?") → router.back()
- Step 4 "Oluştur" button → POST `/api/payroll` → success: router.push(`/payroll/${response.id}`)

---

## STEP 1: Bordro Tipi Seçimi

### File: `src/app/payroll/new/_components/step-1-type.tsx`

Display all JournalType values as a 2-column grid of selection cards.

Each card:
- Large icon (pick contextually meaningful Lucide icon per type)
- Type label (from JOURNAL_TYPE_LABEL)
- Description (from JOURNAL_TYPE_DESCRIPTION)
- Selected state: amber border + amber bg tint + checkmark icon top-right

Icon mapping (implement this exactly):
```typescript
const JOURNAL_TYPE_ICON: Record<JournalType, LucideIcon> = {
  ENTRY_PAYROLL:                ArrowDownToLine,
  EXIT_PAYROLL:                 ArrowUpFromLine,
  CUSTOMER_DOCUMENT_ENTRY:      UserPlus,
  CUSTOMER_DOCUMENT_EXIT:       UserMinus,
  OWN_DOCUMENT_ENTRY:           FilePlus,
  OWN_DOCUMENT_EXIT:            FileMinus,
  BANK_COLLECTION_ENDORSEMENT:  Landmark,
  BANK_GUARANTEE_ENDORSEMENT:   ShieldCheck,
  ACCOUNT_DOCUMENT_ENDORSEMENT: ArrowRightLeft,
  DEBIT_DOCUMENT_EXIT:          ArrowUpRight,
  RETURN_PAYROLL:               RotateCcw,
}
```

Validation: must select a type to proceed to Step 2.

---

## STEP 2: Bordro Bilgileri

### File: `src/app/payroll/new/_components/step-2-header.tsx`

Form fields (conditionally shown based on selected JournalType):

#### Always shown:
- **Bordro No**: text input with prefix suggestion (e.g. "B-2025-")
  - Auto-suggest next number via `GET /api/payroll/next-number?type={type}`
  - Loading spinner inside input while fetching
- **Tarih**: DatePicker (calendar popover), defaults to today

#### Shown when REQUIRES_ACCOUNT:
- **Cari Hesap**: AccountSelect (searchable combobox)
  - Fetches `GET /api/accounts?search={query}` with 300ms debounce
  - Shows account code + title in dropdown
  - Required field

#### Shown when REQUIRES_BANK:
- **Banka Hesabı**: BankAccountSelect (searchable combobox)
  - Fetches `GET /api/bank-accounts`
  - Shows bankName + last 4 of IBAN

#### Shown for COLLECTION types:
- **Kasa**: CashboxSelect
- **Banka**: BankAccountSelect

#### Always shown:
- **Notlar**: textarea, optional, 3 rows

Validation (Zod schema, per type):
```typescript
// journalNo: required, min 3 chars
// date: required, valid date, not future by more than 1 year
// accountId: required if REQUIRES_ACCOUNT type
// bankAccountId: required if REQUIRES_BANK type
```

---

## STEP 3: Evrak Ekleme

### File: `src/app/payroll/new/_components/step-3-documents.tsx`

Renders conditionally based on `step3Mode`:

---

### Mode A: `new-documents` — Yeni Evrak Girişi

For CUSTOMER_DOCUMENT_ENTRY and OWN_DOCUMENT_ENTRY.

Layout:
```
[Evrak Ekle + butonu]
─────────────────────
[DocumentFormRow] × N
─────────────────────
[Toplam: X TL, N adet]
```

#### DocumentFormRow — `_components/document-form-row.tsx`

Inline form row (not a modal). Collapsible: collapsed shows summary, expanded shows all fields.

Fields:
| Field      | Type           | Notes                           |
|------------|----------------|---------------------------------|
| Evrak Tipi | Toggle         | ÇEK / SENET                     |
| Tutar      | number input   | required, positive              |
| Vade       | DatePicker     | required, must be future        |
| Çek/Senet No| text          | optional                        |
| Banka      | text           | optional                        |
| Şube       | text           | optional                        |
| Hesap No   | text           | optional                        |
| Seri No    | text           | optional                        |
| Notlar     | text           | optional                        |
| [Sil]      | icon button    | removes row                     |

"Evrak Ekle +" button appends a new blank `NewDocumentForm` to `state.newDocuments`.
Each row gets a unique `_id` (use `crypto.randomUUID()`).

Bottom summary bar: "Toplam {N} evrak — {formatAmount(sum)}"

Validation: at least 1 document required; each document must have tutar + vade.

---

### Mode B: `select-documents` — Evrak Seçici

For EXIT, ENDORSEMENT, RETURN types.

Layout:
```
[SearchInput]  [Durum filtresi]  [Portföy filtresi]
───────────────────────────────────────────────────
[Selectable document list]
───────────────────────────────────────────────────
[{N} evrak seçildi — Toplam: {X} TL]
```

Fetch: `GET /api/checks-promissory-notes` with filters based on JournalType:
- For EXIT types: filter `status=IN_PORTFOLIO,ENDORSED`
- For RETURN: filter `status=COLLECTED,IN_BANK_COLLECTION`

Each row in the selectable list:
- Checkbox left
- Çek/Senet icon
- Çek No + Banka/Şube
- Cari adı
- Vade tarihi (with overdue indicator)
- Tutar (right-aligned)
- Status badge

Multi-select. Selected rows highlighted with amber-tinted bg.
Validation: at least 1 document must be selected.

---

## STEP 4: Önizleme & Onay

### File: `src/app/payroll/new/_components/step-4-preview.tsx`

Read-only summary of everything before submission.

Layout:
```
┌─────────────────────────────────────────────────┐
│  Bordro Özeti                                    │
│  ─────────────                                   │
│  Tür:     [JournalType badge]                   │
│  No:      B-2025-001                             │
│  Tarih:   15 Ocak 2025                           │
│  Cari:    Müşteri Adı                            │
│  Notlar:  …                                      │
├─────────────────────────────────────────────────┤
│  Evraklar ({N} adet)                             │
│  ─────────────────                               │
│  [mini table of documents]                       │
│  Toplam: {X} TL                                 │
└─────────────────────────────────────────────────┘
[← Geri]                    [Oluştur →]
```

"Oluştur" button:
- Shows spinner while loading
- Disabled if mutation is pending
- On success: `toast.success("Bordro oluşturuldu")` + `router.push("/payroll/" + id)`
- On error: `toast.error(error.message)`

POST body construction:
```typescript
function buildCreateDto(state: WizardState): CreateCheckBillJournalDto {
  return {
    type:               state.journalType!,
    journalNo:          state.journalNo,
    date:               state.date,
    accountId:          state.accountId || undefined,
    bankAccountId:      state.bankAccountId || undefined,
    cashboxId:          state.cashboxId || undefined,
    notes:              state.notes || undefined,
    newDocuments:       state.newDocuments.length ? state.newDocuments.map(cleanDocumentForm) : undefined,
    selectedDocumentIds:state.selectedDocumentIds.length ? state.selectedDocumentIds : undefined,
  }
}
```

---

## SHARED FORM SELECTS

### `src/components/selects/account-select.tsx`

```typescript
// Searchable combobox for Account
// - Debounced search via GET /api/accounts?search=
// - Shows: [code] Title
// - Value: accountId string
// Props: value, onChange, placeholder?, disabled?
```

### `src/components/selects/bank-account-select.tsx`

```typescript
// Select for BankAccount (no search needed — usually <20 records)
// - Fetches GET /api/bank-accounts on mount
// - Shows: bankName — last 4 IBAN
// - Value: bankAccountId string
```

### `src/components/selects/cashbox-select.tsx`

```typescript
// Select for Cashbox
// - Fetches GET /api/cashboxes on mount
// - Shows: name
// - Value: cashboxId string
```

All three selects must:
- Show skeleton loader while fetching
- Show error state with retry on fetch failure
- Be keyboard-navigable (use shadcn Command/Popover pattern)

---

## OUTPUT REQUIREMENTS

Produce in order:
1. `src/components/selects/account-select.tsx`
2. `src/components/selects/bank-account-select.tsx`
3. `src/components/selects/cashbox-select.tsx`
4. `src/app/payroll/new/page.tsx`
5. `src/app/payroll/new/_components/wizard-progress.tsx`
6. `src/app/payroll/new/_components/journal-wizard.tsx`
7. `src/app/payroll/new/_components/step-1-type.tsx`
8. `src/app/payroll/new/_components/step-2-header.tsx`
9. `src/app/payroll/new/_components/step-3-documents.tsx`
10. `src/app/payroll/new/_components/document-form-row.tsx`
11. `src/app/payroll/new/_components/step-4-preview.tsx`

Every file: complete, compilable TypeScript, correct imports. End with file manifest.
