# Bordro (Payroll) Modülü — Backend Mimari Dokümantasyonu

> **Güncelleme:** 2026-03-21  
> **İlgili Frontend Sayfaları:** `/payroll`, `/payroll/[id]`, `/payroll/print/[id]`  
> **Backend Modül Dizini:** `api-stage/server/src/modules/check-bill/`

---

## 1. Genel Bakış

Bordro modülü, sistemin çek/senet portföy yönetiminin çekirdeğini oluşturan `CheckBillJournal` (Bordro) ile `CheckBill` (Çek/Senet Evrakı) modellerini yönetir. Frontend'deki `/payroll` sayfası doğrudan `CheckBillJournal` kaydını listeler. Her bordro, bir veya daha fazla çek/senet evrakını (`CheckBill`) içerir.

---

## 2. Modül Yapısı

```
check-bill/
├── check-bill.module.ts            # NestJS modül tanımı
├── check-bill.controller.ts        # Çek/Senet CRUD endpoint'leri  (/checks-promissory-notes)
├── check-bill.service.ts           # Çek/Senet iş mantığı
├── check-bill-journal.controller.ts # Bordro endpoint'leri (/payroll)
├── check-bill-journal.service.ts   # Bordro iş mantığı
├── reminder-task.service.ts        # Vade hatırlatıcı görevler
└── dto/
    ├── create-check-bill.dto.ts
    ├── update-check-bill.dto.ts
    ├── create-check-bill-journal.dto.ts
    └── check-bill-transaction.dto.ts
```

---

## 3. Prisma Şema Modelleri

### 3.1 `CheckBillJournal` — Bordro Kaydı

> **Veritabanı Tablosu:** `check_bill_journals`

```prisma
model CheckBillJournal {
  id            String      @id @default(uuid())
  journalNo     String      @map("journal_no")       // Bordro numarası (ör: B-2024-001)
  type          JournalType @map("type")              // Bordro tipi (Enum)
  date          DateTime    @default(now()) @map("date")
  accountId     String?     @map("account_id")       // İlişkili cari hesap
  bankAccountId String?     @map("bank_account_id")  // İlişkili banka hesabı
  notes         String?     @map("notes")
  tenantId      String?                               // Multi-tenant izolasyonu
  createdById   String?     @map("created_by_id")    // Oluşturan kullanıcı
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // İlişkiler
  bankAccount BankAccount?           @relation(...)
  account     Account?               @relation(...)
  createdBy   User?                  @relation("CheckBillJournalCreatedBy", ...)
  tenant      Tenant?                @relation(...)
  checkBills  CheckBill[]            @relation("CheckBillLastJournal")
  items       CheckBillJournalItem[]

  @@map("check_bill_journals")
}
```

**Alan Açıklamaları:**

| Alan | Tür | Açıklama |
|------|-----|----------|
| `journalNo` | String | Sistem tarafından veya kullanıcı tarafından oluşturulan bordro numarası |
| `type` | JournalType (Enum) | Bordronun işlem tipi (bkz. Enum Tanımları) |
| `date` | DateTime | İşlem tarihi |
| `accountId` | String? | Cariye Evrak Cirosu gibi işlemlerde hedef cari |
| `bankAccountId` | String? | Bankaya Tahsil/Teminat işlemlerinde hedef banka hesabı |
| `tenantId` | String? | **Zorunlu — Kural 1 (Multi-Tenant) gereksinimi** |

---

### 3.2 `CheckBillJournalItem` — Bordro Kalem Bağlantısı

> **Veritabanı Tablosu:** `check_bill_journal_items`

```prisma
model CheckBillJournalItem {
  id          String   @id @default(uuid())
  journalId   String   @map("journal_id")    // Bağlı bordro
  checkBillId String   @map("check_bill_id") // Bağlı çek/senet
  tenantId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  journal   CheckBillJournal @relation(...)
  checkBill CheckBill        @relation(...)
  tenant    Tenant?          @relation(...)

  @@index([journalId])
  @@index([checkBillId])
  @@index([tenantId])
  @@map("check_bill_journal_items")
}
```

---

### 3.3 `CheckBill` — Çek/Senet Evrakı

> **Veritabanı Tablosu:** `checks_bills`

```prisma
model CheckBill {
  id                  String           @id @default(uuid())
  tenantId            String?
  type                CheckBillType    @map("type")            // CHECK | PROMISSORY
  portfolioType       PortfolioType    @map("portfolio_type")  // CREDIT | DEBIT
  accountId           String           @map("account_id")
  amount              Decimal          @map("amount") @db.Decimal(15, 2)
  remainingAmount     Decimal          @default(0) @map("remaining_amount") @db.Decimal(15, 2)
  dueDate             DateTime         @map("due_date")
  bank                String?          @map("bank")
  branch              String?          @map("branch")
  accountNo           String?          @map("account_no")
  checkNo             String?          @map("check_no")       // Çek / Senet numarası
  serialNo            String?          @map("serial_no")
  status              CheckBillStatus? @map("status")         // Evrak durumu (Enum)
  collectionDate      DateTime?        @map("collection_date")
  collectionCashboxId String?          @map("collection_cashbox_id")
  isEndorsed          Boolean          @default(false) @map("is_endorsed")
  endorsementDate     DateTime?        @map("endorsement_date")
  endorsedTo          String?          @map("endorsed_to")
  notes               String?          @map("notes")
  createdBy           String?          @map("created_by")
  updatedBy           String?          @map("updated_by")
  deletedAt           DateTime?        @map("deleted_at")     // Soft delete alanı
  deletedBy           String?          @map("deleted_by")
  lastJournalId       String?          @map("last_journal_id") // Son bordro bağlantısı
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  // İlişkiler
  account           Account                @relation(...)
  collectionCashbox Cashbox?               @relation(...)
  lastJournal       CheckBillJournal?      @relation("CheckBillLastJournal", ...)
  journalItems      CheckBillJournalItem[]
  logs              CheckBillLog[]
  tenant            Tenant?                @relation(...)
  createdByUser     User?                  @relation("CheckBillCreatedBy", ...)
  updatedByUser     User?                  @relation("CheckBillUpdatedBy", ...)
  deletedByUser     User?                  @relation("CheckBillDeletedBy", ...)

  @@index([tenantId])
  @@index([tenantId, dueDate])
  @@index([accountId])
  @@index([dueDate])
  @@index([status])
  @@index([type])
  @@index([portfolioType])
  @@map("checks_bills")
}
```

---

## 4. Prisma Enum Tanımları

### `JournalType` — Bordro İşlem Tipleri

```prisma
enum JournalType {
  ENTRY_PAYROLL                 // Giriş Bordrosu
  EXIT_PAYROLL                  // Çıkış Bordrosu
  CUSTOMER_DOCUMENT_ENTRY       // Müşteri Evrak Girişi
  CUSTOMER_DOCUMENT_EXIT        // Müşteri Evrak Çıkışı
  OWN_DOCUMENT_ENTRY            // Kendi Evrak Girişi
  OWN_DOCUMENT_EXIT             // Borç Evrak Çıkışı
  BANK_COLLECTION_ENDORSEMENT   // Bankaya Tahsil Cirosu
  BANK_GUARANTEE_ENDORSEMENT    // Bankaya Teminat Cirosu
  ACCOUNT_DOCUMENT_ENDORSEMENT  // Cariye Evrak Cirosu
  DEBIT_DOCUMENT_EXIT           // Borç Evrak Çıkışı
  RETURN_PAYROLL                // İade Bordrosu
}
```

### `CheckBillType` — Evrak Tipi

```prisma
enum CheckBillType {
  CHECK       // Çek
  PROMISSORY  // Senet
}
```

### `CheckBillStatus` — Evrak Durumu

```prisma
enum CheckBillStatus {
  IN_PORTFOLIO      // Portföyde
  UNPAID            // Ödenmedi
  GIVEN_TO_BANK     // Bankaya Verildi
  COLLECTED         // Tahsil Edildi
  PAID              // Ödendi
  ENDORSED          // Ciro Edildi
  RETURNED          // İade Edildi
  WITHOUT_COVERAGE  // Karşılıksız
  IN_BANK_COLLECTION  // Bankada Tahsilde
  IN_BANK_GUARANTEE   // Bankada Teminatta
}
```

### `PortfolioType`

```prisma
enum PortfolioType {
  CREDIT  // Alacak (Müşteriden gelen)
  DEBIT   // Borç (Bize verilen)
}
```

---

## 5. API Endpoint'leri

### 5.1 Bordro Endpoint'leri — `CheckBillJournalController`

> **Base URL:** `/payroll`  
> **Guard:** `JwtAuthGuard`

| Method | URL | Açıklama |
|--------|-----|----------|
| `GET` | `/payroll` | Tüm bordroları listele (tenant filtreli) |
| `GET` | `/payroll/:id` | Bordro detayı + evrak listesini getir |
| `POST` | `/payroll` | Yeni bordro oluştur |

#### `GET /payroll` — Bordro Listesi

```typescript
// Dönüş yapısı (her kayıt için)
{
  id: string,
  journalNo: string,
  type: JournalType,
  date: DateTime,
  accountId: string | null,
  notes: string | null,
  tenantId: string,
  totalAmount: number,      // Hesaplanan: checkBills toplamı
  documentCount: number,    // Hesaplanan: checkBill sayısı
  account: { title: string } | null
}
```

#### `GET /payroll/:id` — Bordro Detayı

```typescript
// Dönüş yapısı
{
  ...CheckBillJournal,
  account: Account,         // Full account object
  checkBills: CheckBill[],  // items içindeki checkBill'ler flatten edilmiş halde
  totalAmount: number       // Tüm evrakların toplam tutarı
}
```

#### `POST /payroll` — Bordro Oluştur

**Request Body:** `CreateCheckBillJournalDto`

```typescript
{
  type: JournalType,         // Zorunlu
  journalNo: string,         // Zorunlu
  date: string (ISO 8601),   // Zorunlu
  accountId?: string,
  bankAccountId?: string,
  notes?: string,

  // CUSTOMER_DOCUMENT_ENTRY için:
  newDocuments?: CreateCheckBillDto[],

  // Diğer EXIT/ENDORSEMENT tipleri için:
  selectedDocumentIds?: string[]
}
```

---

### 5.2 Çek/Senet Endpoint'leri — `CheckBillController`

> **Base URL:** `/checks-promissory-notes`  
> **Guard:** `JwtAuthGuard`

| Method | URL | Açıklama |
|--------|-----|----------|
| `GET` | `/checks-promissory-notes` | Tüm çek/senet listesi (query filtrelenebilir) |
| `GET` | `/checks-promissory-notes/upcoming` | Yaklaşan vadeli evraklar |
| `GET` | `/checks-promissory-notes/:id` | Evrak detayı |
| `PUT` | `/checks-promissory-notes/:id` | Evrak güncelle |
| `DELETE` | `/checks-promissory-notes/:id` | Soft delete |
| `POST` | `/checks-promissory-notes/action` | Evrak üzerinde işlem yap (tahsilat, iano vb.) |

#### `POST /checks-promissory-notes/action` — Evrak İşlemi

```typescript
// CheckBillActionDto
{
  checkBillId: string,          // İşlem yapılacak evrak ID
  newStatus: CheckBillStatus,   // Yeni durum (Enum)
  date: string (ISO 8601),      // İşlem tarihi
  transactionAmount: number,    // İşlem tutarı
  notes?: string,
  cashboxId?: string,           // COLLECTED durumunda kasa ID
  bankAccountId?: string        // COLLECTED durumunda banka hesabı ID
}
```

**İş Mantığı (`processAction`):**
1. Çek/senet tenant ile doğrulayarak bulunur.
2. `newStatus` güncellenir, `updatedBy` kaydedilir.
3. Eğer `newStatus === COLLECTED`:
   - `cashboxId` varsa → `CashboxMovement` (COLLECTION) oluşturulur.
   - `bankAccountId` varsa → `BankAccountMovement` (INCOMING) oluşturulur.
4. Tüm işlemler tek `$transaction` içinde gerçekleşir (**Kural 5 — Transaction**).

---

## 6. Servis İş Mantığı

### 6.1 `CheckBillJournalService.create` — Bordro Oluşturma Akışı

```
POST /payroll
   │
   ├─► resolveForCreate()  →  tenantId alınır
   │
   └─► $transaction başlar
         │
         ├─► CheckBillJournal oluştur
         │
         └─► type'a göre switch:
               │
               ├─► CUSTOMER_DOCUMENT_ENTRY
               │     └─► dto.newDocuments içindeki her evrak için:
               │           ├─► CheckBill oluştur (status: IN_PORTFOLIO)
               │           └─► CheckBillJournalItem oluştur (bağlantı)
               │
               └─► CUSTOMER_DOCUMENT_EXIT / BANK_COLLECTION_ENDORSEMENT
                   / BANK_GUARANTEE_ENDORSEMENT / ACCOUNT_DOCUMENT_ENDORSEMENT
                       └─► dto.selectedDocumentIds içindeki her ID için:
                             ├─► CheckBill.status güncelle (newStatus)
                             └─► CheckBillJournalItem oluştur (bağlantı)
```

**Durum Değişim Tablosu:**

| `JournalType` | Eski Durum | Yeni Durum |
|---|---|---|
| `CUSTOMER_DOCUMENT_ENTRY` | — | `IN_PORTFOLIO` (yeni kayıt) |
| `BANK_COLLECTION_ENDORSEMENT` | herhangi | `IN_BANK_COLLECTION` |
| `BANK_GUARANTEE_ENDORSEMENT` | herhangi | `IN_BANK_GUARANTEE` |
| `CUSTOMER_DOCUMENT_EXIT` | herhangi | `ENDORSED` |
| `ACCOUNT_DOCUMENT_ENDORSEMENT` | herhangi | `ENDORSED` |

---

## 7. Multi-Tenant Güvenlik Mimarisi (Kural 1)

Tüm servis metodları `TenantResolverService` üzerinden kiracı izolasyonunu zorunlu kılar:

```typescript
// Sorgular için:
const tenantId = await this.tenantResolver.resolveForQuery();
where: {
  ...buildTenantWhereClause(tenantId ?? undefined),
  deletedAt: null
}

// Kayıt oluşturmak için:
const tenantId = await this.tenantResolver.resolveForCreate();
data: {
  tenantId,
  ...
}
```

> ⚠️ **Kritik:** `tenantId` olmayan çek/senet kayıtları `findOne` ve `findAll` sorgularında görünmez. Bu nedenle mevcut verilerde `tenantId` mutlaka doldurulmuş olmalıdır.

---

## 8. Veritabanı İlişki Diyagramı

```
Tenant
  │
  ├──[1:N]── CheckBillJournal (check_bill_journals)
  │               │
  │               └──[1:N]── CheckBillJournalItem (check_bill_journal_items)
  │                                   │
  │                                   └──[N:1]── CheckBill (checks_bills)
  │
  └──[1:N]── CheckBill (checks_bills)
                  │
                  ├──[N:1]── Account
                  ├──[N:1]── Cashbox (collectionCashbox)
                  └──[1:N]── CheckBillLog (check_bill_logs)
```

---

## 9. NestJS Modül Tanımı

```typescript
@Module({
  imports: [TenantContextModule],  // Tenant bağlamı (JWT'den tenantId çeker)
  controllers: [
    CheckBillController,           // /checks-promissory-notes
    CheckBillJournalController,    // /payroll
  ],
  providers: [
    CheckBillService,
    CheckBillJournalService,
    ReminderTaskService,           // Yaklaşan vade hatırlatıcı (BullMQ/Scheduler)
  ],
  exports: [CheckBillService, CheckBillJournalService],
})
export class CheckBillModule {}
```

---

## 10. Frontend API Entegrasyon Özeti

`/payroll` sayfası aşağıdaki API çağrılarını kullanır:

```typescript
// Axios instance (client-side) — x-tenant-id header'ı interceptor ile otomatik eklenir

// Bordro listesi
GET /api/payroll

// Bordro detayı + evraklar
GET /api/payroll/:id
// Yanıt: { ...journal, checkBills: CheckBill[], totalAmount: number }

// Yeni bordro oluşturma
POST /api/payroll
Body: CreateCheckBillJournalDto

// Çek/senet durumu güncelleme (Tahsilat, İade vb.)
POST /api/checks-promissory-notes/action
Body: CheckBillActionDto
```
