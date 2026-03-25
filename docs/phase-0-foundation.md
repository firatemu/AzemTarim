# PHASE 0 — Foundation, Design System & AppShell
# Target: Cursor / Windsurf Agent Mode
# Stack: Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui

---

## ROLE & OBJECTIVE

You are a senior frontend engineer bootstrapping the design system and application shell
for an enterprise ERP module: Check & Bill (Çek/Senet) Management.

This is PHASE 0 of 7. Complete every task in this file before Phase 1 begins.
Do NOT ask clarifying questions. Do NOT use placeholders or TODOs.
Every file must be production-ready and complete.

---

## TECH STACK

```
Framework      : Next.js 14 (App Router, TypeScript strict mode)
Styling        : Tailwind CSS 3 + CSS variables
Component base : shadcn/ui (New York style)
State          : Zustand 4
Server state   : TanStack Query v5
Tables         : TanStack Table v8
Forms          : React Hook Form + Zod
Charts         : Recharts 2
Print          : react-to-print
Icons          : lucide-react
Fonts          : Geist Sans (body) + Instrument Serif (display/numbers)
Date           : date-fns
Formatting     : Intl API (no external lib)
```

Install command (run first):
```bash
npx create-next-app@latest check-bill-erp --typescript --tailwind --app --src-dir --import-alias "@/*"
cd check-bill-erp
npx shadcn@latest init --style new-york --base-color zinc --css-variables yes
npx shadcn@latest add button input label select dialog sheet table badge
npx shadcn@latest add dropdown-menu command popover calendar form separator tabs
npx shadcn@latest add toast sonner skeleton card scroll-area avatar
npm install zustand @tanstack/react-query @tanstack/react-table
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns lucide-react react-to-print
npm install @fontsource/geist @fontsource/instrument-serif
```

---

## DESIGN SYSTEM

### 1.1 — `src/styles/globals.css`

Replace the default globals.css with:

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Backgrounds */
    --background:        0 0% 4%;        /* #0a0a0b */
    --surface-1:         240 5% 7%;      /* #111113 */
    --surface-2:         240 4% 11%;     /* #18181b */
    --surface-3:         240 4% 15%;     /* #222226 */

    /* Borders */
    --border:            240 4% 16%;     /* #27272a */
    --border-strong:     240 4% 24%;     /* #3f3f46 */

    /* Text */
    --foreground:        0 0% 98%;       /* #fafafa */
    --muted-foreground:  240 4% 46%;     /* #71717a */
    --subtle-foreground: 240 4% 64%;     /* #a1a1aa */

    /* Accent: amber */
    --accent:            38 92% 50%;     /* #f59e0b */
    --accent-foreground: 0 0% 4%;

    /* Semantic */
    --success:           142 71% 45%;    /* #22c55e */
    --warning:           25 95% 53%;     /* #f97316 */
    --danger:            0 84% 60%;      /* #ef4444 */
    --info:              217 91% 60%;    /* #3b82f6 */

    /* Status badge fills (muted) */
    --status-portfolio:     217 91% 15%;
    --status-portfolio-fg:  217 91% 70%;
    --status-collected:     142 71% 12%;
    --status-collected-fg:  142 71% 55%;
    --status-paid:          142 71% 12%;
    --status-paid-fg:       142 71% 55%;
    --status-endorsed:      38 92% 12%;
    --status-endorsed-fg:   38 92% 65%;
    --status-bank:          217 50% 18%;
    --status-bank-fg:       217 91% 72%;
    --status-returned:      0 84% 14%;
    --status-returned-fg:   0 84% 68%;
    --status-unpaid:        0 84% 14%;
    --status-unpaid-fg:     0 84% 68%;
    --status-protested:     0 84% 10%;
    --status-protested-fg:  0 84% 58%;
    --status-partial:       25 95% 14%;
    --status-partial-fg:    25 95% 65%;
    --status-nocoverage:    300 50% 14%;
    --status-nocoverage-fg: 300 50% 68%;

    /* shadcn overrides */
    --card:              240 5% 7%;
    --card-foreground:   0 0% 98%;
    --popover:           240 5% 7%;
    --popover-foreground:0 0% 98%;
    --primary:           38 92% 50%;
    --primary-foreground:0 0% 4%;
    --secondary:         240 4% 15%;
    --secondary-foreground:0 0% 98%;
    --muted:             240 4% 15%;
    --muted-foreground:  240 4% 46%;
    --destructive:       0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --input:             240 4% 16%;
    --ring:              38 92% 50%;
    --radius:            0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Geist', 'GeistVariable', system-ui, sans-serif;
    font-feature-settings: "cv02","cv03","cv04","cv11";
  }
  .font-serif { font-family: 'Instrument Serif', Georgia, serif; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: hsl(var(--surface-1)); }
::-webkit-scrollbar-thumb { background: hsl(var(--border-strong)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }

/* Print reset */
@media print {
  nav, aside, .no-print { display: none !important; }
  body { background: white; color: black; }
}
```

### 1.2 — `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        border:      'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        accent:      'hsl(var(--accent))',
        muted:       { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        success:     'hsl(var(--success))',
        warning:     'hsl(var(--warning))',
        danger:      'hsl(var(--danger))',
        info:        'hsl(var(--info))',
        card:        { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary:     { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        popover:     { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans:  ['Geist', 'GeistVariable', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono:  ['GeistMono', 'Menlo', 'monospace'],
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' }},
        'slide-in-r': { from: { opacity: '0', transform: 'translateX(8px)' }, to: { opacity: '1', transform: 'translateX(0)' }},
        'scale-in':   { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' }},
        shimmer:      { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' }},
      },
      animation: {
        'fade-in':    'fade-in 0.2s ease-out',
        'slide-in-r': 'slide-in-r 0.2s ease-out',
        'scale-in':   'scale-in 0.15s ease-out',
        shimmer:      'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

---

## TYPES

### 2.1 — `src/types/check-bill.ts`

Define ALL enums and interfaces mirroring the Prisma schema exactly:

```typescript
// Enums
export enum CheckBillType {
  CHECK = 'CHECK',
  PROMISSORY = 'PROMISSORY',
}

export enum PortfolioType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum CheckBillStatus {
  IN_PORTFOLIO         = 'IN_PORTFOLIO',
  UNPAID               = 'UNPAID',
  GIVEN_TO_BANK        = 'GIVEN_TO_BANK',
  COLLECTED            = 'COLLECTED',
  PAID                 = 'PAID',
  ENDORSED             = 'ENDORSED',
  RETURNED             = 'RETURNED',
  WITHOUT_COVERAGE     = 'WITHOUT_COVERAGE',
  IN_BANK_COLLECTION   = 'IN_BANK_COLLECTION',
  IN_BANK_GUARANTEE    = 'IN_BANK_GUARANTEE',
  PARTIAL_PAID         = 'PARTIAL_PAID',
  PROTESTED            = 'PROTESTED',
}

export enum JournalType {
  ENTRY_PAYROLL                = 'ENTRY_PAYROLL',
  EXIT_PAYROLL                 = 'EXIT_PAYROLL',
  CUSTOMER_DOCUMENT_ENTRY      = 'CUSTOMER_DOCUMENT_ENTRY',
  CUSTOMER_DOCUMENT_EXIT       = 'CUSTOMER_DOCUMENT_EXIT',
  OWN_DOCUMENT_ENTRY           = 'OWN_DOCUMENT_ENTRY',
  OWN_DOCUMENT_EXIT            = 'OWN_DOCUMENT_EXIT',
  BANK_COLLECTION_ENDORSEMENT  = 'BANK_COLLECTION_ENDORSEMENT',
  BANK_GUARANTEE_ENDORSEMENT   = 'BANK_GUARANTEE_ENDORSEMENT',
  ACCOUNT_DOCUMENT_ENDORSEMENT = 'ACCOUNT_DOCUMENT_ENDORSEMENT',
  DEBIT_DOCUMENT_EXIT          = 'DEBIT_DOCUMENT_EXIT',
  RETURN_PAYROLL               = 'RETURN_PAYROLL',
}

// Core interfaces
export interface Account {
  id: string
  title: string
  code?: string
}

export interface BankAccount {
  id: string
  name: string
  bankName: string
  iban?: string
}

export interface Cashbox {
  id: string
  name: string
}

export interface CheckBill {
  id: string
  tenantId: string
  type: CheckBillType
  portfolioType: PortfolioType
  accountId: string
  account: Account
  faceAmount: number
  remainingAmount: number
  dueDate: string           // ISO 8601
  bank?: string
  branch?: string
  accountNo?: string
  checkNo?: string
  serialNo?: string
  status: CheckBillStatus
  currentHolderId?: string
  currentHolder?: Account
  isProtested: boolean
  protestedAt?: string
  isEndorsed: boolean
  endorsementDate?: string
  endorsedTo?: string
  collectionDate?: string
  notes?: string
  lastJournalId?: string
  createdAt: string
  updatedAt: string
  endorsements?: CheckBillEndorsement[]
  collections?: CheckBillCollection[]
  logs?: CheckBillLog[]
}

export interface CheckBillEndorsement {
  id: string
  checkBillId: string
  sequence: number
  fromAccountId: string
  fromAccount: Account
  toAccountId: string
  toAccount: Account
  endorsedAt: string
  journalId: string
}

export interface CheckBillCollection {
  id: string
  checkBillId: string
  collectedAmount: number
  collectionDate: string
  cashboxId?: string
  cashbox?: Cashbox
  bankAccountId?: string
  bankAccount?: BankAccount
  journalId: string
  createdAt: string
}

export interface CheckBillLog {
  id: string
  checkBillId: string
  fromStatus?: CheckBillStatus
  toStatus: CheckBillStatus
  journalId?: string
  performedById?: string
  notes?: string
  createdAt: string
}

export interface CheckBillJournal {
  id: string
  journalNo: string
  type: JournalType
  date: string
  accountId?: string
  account?: Account
  bankAccountId?: string
  bankAccount?: BankAccount
  cashboxId?: string
  cashbox?: Cashbox
  notes?: string
  totalAmount?: number
  documentCount?: number
  checkBills?: CheckBill[]
  createdAt: string
}

// API filter params
export interface CheckBillFilters {
  type?: CheckBillType
  portfolioType?: PortfolioType
  status?: CheckBillStatus
  accountId?: string
  dueDateFrom?: string
  dueDateTo?: string
  isProtested?: boolean
  search?: string
}

export interface JournalFilters {
  type?: JournalType
  dateFrom?: string
  dateTo?: string
  accountId?: string
  search?: string
}
```

---

## API LAYER

### 3.1 — `src/lib/api.ts`

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // JWT token injected from cookie/localStorage in real app
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

export const api = {
  get:    <T>(path: string)                   => request<T>(path),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)    => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => request<T>(path, { method: 'DELETE' }),
}
```

### 3.2 — `src/lib/query-keys.ts`

```typescript
export const QK = {
  journals:          (filters?: object)     => ['journals', filters] as const,
  journal:           (id: string)           => ['journal', id] as const,
  checks:            (filters?: object)     => ['checks', filters] as const,
  check:             (id: string)           => ['check', id] as const,
  checkEndorsements: (id: string)           => ['check-endorsements', id] as const,
  checkCollections:  (id: string)           => ['check-collections', id] as const,
  accounts:          (search?: string)      => ['accounts', search] as const,
  bankAccounts:      ()                     => ['bank-accounts'] as const,
  cashboxes:         ()                     => ['cashboxes'] as const,
  reportPortfolio:   ()                     => ['report-portfolio'] as const,
  reportMaturity:    ()                     => ['report-maturity'] as const,
  reportAccount:     ()                     => ['report-account'] as const,
  reportCollection:  ()                     => ['report-collection'] as const,
}
```

### 3.3 — `src/lib/format.ts`

```typescript
export function formatAmount(value: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...opts,
  }).format(new Date(value))
}

export function formatDateShort(value: string | Date): string {
  return formatDate(value, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}

export function daysUntilDue(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}
```

---

## LABEL MAPS

### 4.1 — `src/lib/labels.ts`

```typescript
import { CheckBillStatus, CheckBillType, JournalType, PortfolioType } from '@/types/check-bill'

export const STATUS_LABEL: Record<CheckBillStatus, string> = {
  IN_PORTFOLIO:       'Portföyde',
  UNPAID:             'Ödenmedi',
  GIVEN_TO_BANK:      'Bankaya Verildi',
  COLLECTED:          'Tahsil Edildi',
  PAID:               'Ödendi',
  ENDORSED:           'Ciro Edildi',
  RETURNED:           'İade Edildi',
  WITHOUT_COVERAGE:   'Karşılıksız',
  IN_BANK_COLLECTION: 'Bankada Tahsilde',
  IN_BANK_GUARANTEE:  'Bankada Teminatta',
  PARTIAL_PAID:       'Kısmi Ödendi',
  PROTESTED:          'Protesto Edildi',
}

export const STATUS_VARIANT: Record<CheckBillStatus, string> = {
  IN_PORTFOLIO:       'bg-[hsl(var(--status-portfolio))] text-[hsl(var(--status-portfolio-fg))]',
  UNPAID:             'bg-[hsl(var(--status-unpaid))] text-[hsl(var(--status-unpaid-fg))]',
  GIVEN_TO_BANK:      'bg-[hsl(var(--status-bank))] text-[hsl(var(--status-bank-fg))]',
  COLLECTED:          'bg-[hsl(var(--status-collected))] text-[hsl(var(--status-collected-fg))]',
  PAID:               'bg-[hsl(var(--status-paid))] text-[hsl(var(--status-paid-fg))]',
  ENDORSED:           'bg-[hsl(var(--status-endorsed))] text-[hsl(var(--status-endorsed-fg))]',
  RETURNED:           'bg-[hsl(var(--status-returned))] text-[hsl(var(--status-returned-fg))]',
  WITHOUT_COVERAGE:   'bg-[hsl(var(--status-nocoverage))] text-[hsl(var(--status-nocoverage-fg))]',
  IN_BANK_COLLECTION: 'bg-[hsl(var(--status-bank))] text-[hsl(var(--status-bank-fg))]',
  IN_BANK_GUARANTEE:  'bg-[hsl(var(--status-bank))] text-[hsl(var(--status-bank-fg))]',
  PARTIAL_PAID:       'bg-[hsl(var(--status-partial))] text-[hsl(var(--status-partial-fg))]',
  PROTESTED:          'bg-[hsl(var(--status-protested))] text-[hsl(var(--status-protested-fg))]',
}

export const TYPE_LABEL: Record<CheckBillType, string> = {
  CHECK:      'Çek',
  PROMISSORY: 'Senet',
}

export const PORTFOLIO_LABEL: Record<PortfolioType, string> = {
  CREDIT: 'Alacak',
  DEBIT:  'Borç',
}

export const JOURNAL_TYPE_LABEL: Record<JournalType, string> = {
  ENTRY_PAYROLL:                'Giriş Bordrosu',
  EXIT_PAYROLL:                 'Çıkış Bordrosu',
  CUSTOMER_DOCUMENT_ENTRY:      'Müşteri Evrak Girişi',
  CUSTOMER_DOCUMENT_EXIT:       'Müşteri Evrak Çıkışı',
  OWN_DOCUMENT_ENTRY:           'Kendi Evrak Girişi',
  OWN_DOCUMENT_EXIT:            'Borç Evrak Çıkışı',
  BANK_COLLECTION_ENDORSEMENT:  'Bankaya Tahsil Cirosu',
  BANK_GUARANTEE_ENDORSEMENT:   'Bankaya Teminat Cirosu',
  ACCOUNT_DOCUMENT_ENDORSEMENT: 'Cariye Evrak Cirosu',
  DEBIT_DOCUMENT_EXIT:          'Borç Evrak Çıkışı',
  RETURN_PAYROLL:               'İade Bordrosu',
}

export const JOURNAL_TYPE_DESCRIPTION: Record<JournalType, string> = {
  ENTRY_PAYROLL:                'Portföye yeni evrak girişi',
  EXIT_PAYROLL:                 'Portföyden evrak çıkışı',
  CUSTOMER_DOCUMENT_ENTRY:      'Müşteriden alınan çek/senet kaydı',
  CUSTOMER_DOCUMENT_EXIT:       'Müşteriye iade edilen evrak',
  OWN_DOCUMENT_ENTRY:           'Firmamız tarafından verilen çek/senet',
  OWN_DOCUMENT_EXIT:            'Borcumuza karşılık evrak çıkışı',
  BANK_COLLECTION_ENDORSEMENT:  'Tahsil için bankaya ciro',
  BANK_GUARANTEE_ENDORSEMENT:   'Teminat olarak bankaya ciro',
  ACCOUNT_DOCUMENT_ENDORSEMENT: 'Cariye ciro edildi',
  DEBIT_DOCUMENT_EXIT:          'Borç evrak çıkışı işlemi',
  RETURN_PAYROLL:               'İade bordrosu işlemi',
}
```

---

## SHARED COMPONENTS

### 5.1 — `src/components/ui/status-badge.tsx`

```typescript
import { cn } from '@/lib/utils'
import { CheckBillStatus } from '@/types/check-bill'
import { STATUS_LABEL, STATUS_VARIANT } from '@/lib/labels'

interface StatusBadgeProps {
  status: CheckBillStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-white/5',
      STATUS_VARIANT[status],
      className
    )}>
      {STATUS_LABEL[status]}
    </span>
  )
}
```

### 5.2 — `src/components/ui/amount-cell.tsx`

```typescript
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/format'

interface AmountCellProps {
  value: number
  secondary?: number   // e.g. remainingAmount shown muted below
  className?: string
  danger?: boolean     // red if true (overdue amounts)
}

export function AmountCell({ value, secondary, className, danger }: AmountCellProps) {
  return (
    <div className={cn('text-right tabular-nums', className)}>
      <div className={cn(
        'font-serif text-sm font-medium',
        danger ? 'text-danger' : 'text-foreground'
      )}>
        {formatAmount(value)}
      </div>
      {secondary !== undefined && secondary !== value && (
        <div className="text-xs text-muted-foreground">
          Kalan: {formatAmount(secondary)}
        </div>
      )}
    </div>
  )
}
```

### 5.3 — `src/components/ui/stat-card.tsx`

```typescript
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { formatAmount } from '@/lib/format'

interface StatCardProps {
  label: string
  value: number
  count?: number
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  isCurrency?: boolean
  className?: string
}

const VARIANT_ICON_COLOR = {
  default: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  info:    'text-info',
}

export function StatCard({ label, value, count, icon: Icon, trend, variant = 'default', isCurrency = true, className }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-border bg-surface-1 p-5 transition-all hover:border-border-strong hover:bg-surface-2',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn('mt-2 font-serif text-2xl font-medium tracking-tight', VARIANT_ICON_COLOR[variant] === 'text-muted-foreground' ? 'text-foreground' : VARIANT_ICON_COLOR[variant])}>
            {isCurrency ? formatAmount(value) : value.toLocaleString('tr-TR')}
          </p>
          {count !== undefined && (
            <p className="mt-0.5 text-xs text-muted-foreground">{count} adet</p>
          )}
          {trend && (
            <p className={cn('mt-1 text-xs', trend.value >= 0 ? 'text-success' : 'text-danger')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg bg-surface-3 p-2.5', VARIANT_ICON_COLOR[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
```

### 5.4 — `src/components/ui/empty-state.tsx`

```typescript
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <div className="rounded-full border border-border bg-surface-2 p-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
```

### 5.5 — `src/components/ui/confirm-dialog.tsx`

```typescript
'use client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
  destructive?: boolean
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, loading, destructive }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-surface-1">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? 'bg-danger hover:bg-danger/90' : ''}
          >
            {loading ? 'İşleniyor...' : 'Onayla'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 5.6 — `src/components/ui/loading-skeleton.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border border-border bg-surface-1 px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1 animate-shimmer bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%]" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-5">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-1 h-3 w-16" />
    </div>
  )
}
```

### 5.7 — `src/components/ui/page-header.tsx`

```typescript
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  back?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-6', className)}>
      <div className="min-w-0">
        {back && <div className="mb-2">{back}</div>}
        <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
```

---

## APP SHELL

### 6.1 — `src/components/layout/sidebar.tsx`

Complete sidebar with navigation, active state, and collapsible behavior:

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, CreditCard, BarChart3,
  Settings, ChevronRight, Building2, TrendingUp,
  AlertCircle, Receipt, Landmark
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Ana Menü',
    items: [
      { href: '/',          label: 'Dashboard',      icon: LayoutDashboard },
      { href: '/payroll',   label: 'Bordro',         icon: FileText },
      { href: '/checks',    label: 'Çek / Senet',    icon: CreditCard },
    ],
  },
  {
    label: 'Raporlar',
    items: [
      { href: '/reports/portfolio',  label: 'Portföy',        icon: TrendingUp },
      { href: '/reports/maturity',   label: 'Vade Analizi',   icon: BarChart3 },
      { href: '/reports/account',    label: 'Cari Özet',      icon: Building2 },
      { href: '/reports/overdue',    label: 'Vadesi Geçmiş',  icon: AlertCircle },
      { href: '/reports/collection', label: 'Tahsilat',       icon: Receipt },
      { href: '/reports/bank',       label: 'Banka Dağılım',  icon: Landmark },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { href: '/settings/check-bill', label: 'Ayarlar', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface-1">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
          <CreditCard className="h-4 w-4 text-background" />
        </div>
        <span className="font-serif text-lg font-medium tracking-tight text-foreground">FinanceERP</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all',
                        active
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted-foreground hover:bg-surface-3 hover:text-foreground'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : '')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-foreground">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">Admin</p>
            <p className="truncate text-[10px] text-muted-foreground">Şirket Hesabı</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

### 6.2 — `src/components/layout/topbar.tsx`

```typescript
'use client'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        {title && <h2 className="text-sm font-medium text-foreground">{title}</h2>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Hızlı arama..."
            className="h-8 w-56 border-border bg-surface-2 pl-8 text-xs placeholder:text-muted-foreground focus-visible:ring-accent"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
```

### 6.3 — `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'FinanceERP', template: '%s | FinanceERP' },
  description: 'Çek & Senet Yönetim Sistemi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body>
        <Providers>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

### 6.4 — `src/components/providers.tsx`

```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## DASHBOARD PAGE

### 7.1 — `src/app/page.tsx`

Build a real dashboard with:
- 4 stat cards: Portföyde, Vadesi Bu Ay, Tahsil Edilen (bu ay), Vadesi Geçmiş
- Recent journals table (last 10)
- Quick action buttons: Yeni Müşteri Evrak Girişi, Yeni Borç Evrakı, Tahsilat Ekle
- Overdue alerts list (top 5 overdue documents)
- All data fetched via React Query from `/api/payroll` and `/api/checks-promissory-notes`
- Loading states with StatCardSkeleton and TableSkeleton
- Error states with retry button

---

## OUTPUT REQUIREMENTS

Produce files in this order:
1. `package.json` (with all deps listed)
2. `tailwind.config.ts`
3. `src/styles/globals.css`
4. `src/types/check-bill.ts`
5. `src/lib/api.ts`
6. `src/lib/query-keys.ts`
7. `src/lib/format.ts`
8. `src/lib/labels.ts`
9. All `src/components/ui/*.tsx` files listed above
10. `src/components/layout/sidebar.tsx`
11. `src/components/layout/topbar.tsx`
12. `src/components/providers.tsx`
13. `src/app/layout.tsx`
14. `src/app/page.tsx`

Every file: complete, no placeholders, no TODOs, no ellipsis shortcuts.
End with a file manifest table.
