# Çek/Senet Backend Analiz Raporu

## Genel Bakış

`/checks` (çek/senet) sayfası, backend'de `check-bill` modülü tarafından yönetilir. Bu modül, çok kiracılı (multi-tenant) ERP sisteminde çek ve senet evraklarının tam yaşam döngüsünü yönetir.

**Modül Konumu:** `api-stage/server/src/modules/check-bill/`

**API Endpoint:** `/api/checks-promissory-notes`

---

## Veritabanı Tablo Yapısı

### 1. CheckBill (Ana Tablo)

Çek/senet evraklarının ana kayıtlarını tutar.

**Tablo Adı:** `check_bills`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `tenantId` | UUID (FK) | - | Kiracı ID (multi-tenancy) |
| `type` | Enum | ✓ | CHECK veya PROMISSORY |
| `portfolioType` | Enum | ✓ | CREDIT (müşteri evrağı) veya DEBIT (firma evrağı) |
| `accountId` | UUID (FK) | ✓ | Cari hesap ID |
| `amount` | Decimal(15,2) | ✓ | Evrak tutarı |
| `remainingAmount` | Decimal(15,2) | ✓ | Kalan tutar (kısmi tahsilat için) |
| `dueDate` | DateTime | ✓ | Vade tarihi |
| `bank` | String | - | Banka adı |
| `branch` | String | - | Şube adı |
| `accountNo` | String | - | Hesap numarası |
| `checkNo` | String | - | Çek/Senet numarası |
| `serialNo` | String | - | Seri numarası |
| `status` | Enum | ✓ | Evrak durumu (aşağıda) |
| `collectionDate` | DateTime | - | Tahsilat tarihi |
| `collectionCashboxId` | UUID (FK) | - | Tahsilat kasası |
| `isEndorsed` | Boolean | ✓ | Ciranta edilmiş mi? |
| `endorsementDate` | DateTime | - | Ciranta tarihi |
| `endorsedTo` | String | - | Ciranta kime |
| `notes` | String | - | Notlar |
| `createdBy` | UUID (FK) | - | Oluşturan kullanıcı |
| `updatedBy` | UUID (FK) | - | Güncelleyen kullanıcı |
| `deletedAt` | DateTime | - | Soft delete tarihi |
| `deletedBy` | UUID (FK) | - | Silen kullanıcı |
| `currentHolderId` | UUID (FK) | - | Mevcut sahip cari ID |
| `isProtested` | Boolean | ✓ | Protesto edildi mi? |
| `protestedAt` | DateTime | - | Protesto tarihi |
| `createdAt` | DateTime | ✓ | Oluşturulma tarihi |
| `updatedAt` | DateTime | ✓ | Güncellenme tarihi |
| `lastJournalId` | UUID (FK) | - | Son bordro ID |

**Indexler:**
- `tenantId`
- `[tenantId, dueDate]`
- `accountId`
- `dueDate`
- `status`
- `type`

### 2. CheckBillJournal (Bordro Tablosu)

Çek/senet bordro işlemlerini tutar (giriş/çıkış bordroları).

**Tablo Adı:** `check_bill_journals`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `journalNo` | String | ✓ | Bordro numarası (unique) |
| `type` | Enum | ✓ | Bordro türü (aşağıda) |
| `date` | DateTime | ✓ | Bordro tarihi |
| `accountId` | UUID (FK) | - | İlgili cari hesap |
| `notes` | String | - | Notlar |
| `tenantId` | UUID (FK) | - | Kiracı ID |
| `createdById` | UUID (FK) | - | Oluşturan kullanıcı |
| `cashboxId` | UUID (FK) | - | Kasa ID |
| `bankAccountId` | UUID (FK) | - | Banka hesap ID |
| `createdAt` | DateTime | ✓ | Oluşturulma tarihi |
| `updatedAt` | DateTime | ✓ | Güncellenme tarihi |
| `deletedAt` | DateTime | - | Soft delete tarihi |

**Unique Constraint:** `[tenantId, journalNo]`

### 3. CheckBillJournalItem (Bordro Kalemi)

Bordro ile evrak arasındaki ilişkiyi tutar.

**Tablo Adı:** `check_bill_journal_items`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `journalId` | UUID (FK) | ✓ | Bordro ID |
| `checkBillId` | UUID (FK) | ✓ | Evrak ID |
| `tenantId` | UUID (FK) | - | Kiracı ID |
| `createdAt` | DateTime | ✓ | Oluşturulma tarihi |
| `updatedAt` | DateTime | ✓ | Güncellenme tarihi |

### 4. CheckBillLog (İşlem Logları)

Evrak üzerindeki tüm işlemlerin logunu tutar (audit trail).

**Tablo Adı:** `check_bill_logs`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `checkBillId` | UUID (FK) | ✓ | Evrak ID |
| `userId` | UUID (FK) | - | Kullanıcı ID |
| `actionType` | Enum | ✓ | İşlem türü |
| `changes` | String | - | Değişiklik detayı (JSON) |
| `ipAddress` | String | - | IP adresi |
| `userAgent` | String | - | Tarayıcı bilgisi |
| `fromStatus` | Enum | - | Önceki durum |
| `toStatus` | Enum | - | Yeni durum |
| `journalId` | UUID (FK) | - | Bordro ID |
| `performedById` | UUID (FK) | - | İşlemi yapan |
| `notes` | String | - | Notlar |
| `createdAt` | DateTime | ✓ | Oluşturulma tarihi |
| `tenantId` | UUID (FK) | - | Kiracı ID |

### 5. CheckBillEndorsement (Ciranta Kayıtları)

Evrak ciranta işlemlerini tutar.

**Tablo Adı:** `check_bill_endorsements`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `tenantId` | UUID (FK) | - | Kiracı ID |
| `checkBillId` | UUID (FK) | ✓ | Evrak ID |
| `sequence` | Int | ✓ | Sıra numarası |
| `fromAccountId` | UUID (FK) | ✓ | Kimden |
| `toAccountId` | UUID (FK) | ✓ | Kime |
| `endorsedAt` | DateTime | ✓ | Ciranta tarihi |
| `journalId` | UUID (FK) | ✓ | Bordro ID |

### 6. CheckBillCollection (Tahsilat Kayıtları)

Evrak tahsilat işlemlerini tutar.

**Tablo Adı:** `check_bill_collections`

| Kolon | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| `id` | UUID (PK) | ✓ | Benzersiz tanımlayıcı |
| `tenantId` | UUID (FK) | - | Kiracı ID |
| `checkBillId` | UUID (FK) | ✓ | Evrak ID |
| `collectedAmount` | Decimal(15,2) | ✓ | Tahsilat tutarı |
| `collectionDate` | DateTime | ✓ | Tahsilat tarihi |
| `cashboxId` | UUID (FK) | - | Kasa ID |
| `bankAccountId` | UUID (FK) | - | Banka hesap ID |
| `journalId` | UUID (FK) | ✓ | Bordro ID |
| `createdById` | UUID (FK) | - | Oluşturan kullanıcı |
| `createdAt` | DateTime | ✓ | Oluşturulma tarihi |

---

## Enum Tanımları

### CheckBillType (Evrak Türü)
```prisma
enum CheckBillType {
  CHECK       // Çek
  PROMISSORY  // Senet
}
```

### PortfolioType (Portföy Türü)
```prisma
enum PortfolioType {
  CREDIT  // Alacak (Müşteri evrağı)
  DEBIT   // Borç (Firma evrağı)
}
```

### CheckBillStatus (Evrak Durumu)
```prisma
enum CheckBillStatus {
  IN_PORTFOLIO        // Portföyde
  UNPAID              // Ödenmedi (karşılıksız)
  GIVEN_TO_BANK       // Bankaya tevdi
  COLLECTED           // Tahsil edildi
  PAID                // Ödendi
  ENDORSED            // Ciranta edildi
  RETURNED            // İade
  WITHOUT_COVERAGE    // Karşılıksız
  IN_BANK_COLLECTION  // Bankada tahsilde
  IN_BANK_GUARANTEE   // Bankada teminat
  PARTIAL_PAID        // Kısmi ödeme
  PROTESTED           // Protesto
}
```

### JournalType (Bordro Türü)
```prisma
enum JournalType {
  ENTRY_PAYROLL                // Giriş bordrosu
  EXIT_PAYROLL                 // Çıkış bordrosu
  CUSTOMER_DOCUMENT_ENTRY      // Müşteri evrağı girişi
  CUSTOMER_DOCUMENT_EXIT       // Müşteri evrağı çıkışı
  OWN_DOCUMENT_ENTRY           // Kendi evrak girişi
  OWN_DOCUMENT_EXIT            // Kendi evrak çıkışı
  BANK_COLLECTION_ENDORSEMENT  // Banka tahsilat cirantası
  BANK_GUARANTEE_ENDORSEMENT   // Banka teminat cirantası
  ACCOUNT_DOCUMENT_ENDORSEMENT // Cari hesap cirantası
  DEBIT_DOCUMENT_EXIT          // Borç evrak çıkışı
  RETURN_PAYROLL               // İade bordrosu
}
```

---

## Tablo İlişkileri (ER Diagram)

```
┌─────────────────┐
│     Tenant      │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CheckBill                                  │
├─────────────────────────────────────────────────────────────────┤
│ id, tenantId, type, portfolioType, accountId, amount,          │
│ remainingAmount, dueDate, bank, branch, checkNo, status, ...   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Account     │  │  User (created) │  │   Cashbox       │
│  (accountId)    │  │  (createdBy)    │  │(collectionBox)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CheckBillJournal                               │
├─────────────────────────────────────────────────────────────────┤
│ id, journalNo, type, date, accountId, bankAccountId, ...       │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│CheckBillJournal  │ │ CheckBillLog     │ │CheckBillEndorse- │
│     Item         │ │                  │ │     ment         │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CheckBillCollection                           │
├─────────────────────────────────────────────────────────────────┤
│ id, checkBillId, collectedAmount, collectionDate, cashboxId,   │
│ bankAccountId, journalId                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Detaylı İlişkiler

| Tablo | Hedef Tablo | İlişki Tipi | Açıklama |
|-------|------------|-------------|----------|
| CheckBill | Tenant | N:1 | Çok kiracılı yapı |
| CheckBill | Account | N:1 | Cari hesap ilişkisi |
| CheckBill | User | N:1 | Oluşturan kullanıcı |
| CheckBill | Cashbox | N:1 | Tahsilat kasası |
| CheckBill | CheckBillJournal | N:1 | Son bordro |
| CheckBill | Account (currentHolderId) | N:1 | Mevcut ciranta sahip |
| CheckBillJournal | CheckBill | 1:N | Bordrodaki evraklar |
| CheckBillJournal | Account | N:1 | İlgili cari |
| CheckBillJournal | BankAccount | N:1 | Banka hesabı |
| CheckBillJournal | Cashbox | N:1 | Kasa |
| CheckBillJournalItem | CheckBillJournal | N:1 | Bordro ilişkisi |
| CheckBillJournalItem | CheckBill | N:1 | Evrak ilişkisi |
| CheckBillLog | CheckBill | N:1 | Log ilişkisi |
| CheckBillLog | User | N:1 | İşlem yapan |
| CheckBillEndorsement | CheckBill | N:1 | Ciranta ilişkisi |
| CheckBillCollection | CheckBill | N:1 | Tahsilat ilişkisi |
| AccountMovement | CheckBill | N:1 | Cari hareketi (check_bill_id) |

---

## Backend Servis Yapısı

### Modül: CheckBillModule

**Dosya:** `check-bill.module.ts`

```typescript
@Module({
    imports: [TenantContextModule, AccountBalanceModule],
    controllers: [
        CheckBillController,
        CheckBillJournalController
    ],
    providers: [
        CheckBillService,
        CheckBillJournalService,
        ReminderTaskService,
        CheckBillLogService,
        CheckBillCollectionService,
        HandlerRegistry,
        CreditEntryHandler,
        DebitEntryHandler,
        BankCollectionHandler,
        BankGuaranteeHandler,
        EndorsementHandler,
        CollectionHandler,
        ReturnHandler,
    ],
    exports: [CheckBillService, CheckBillJournalService, ReturnHandler],
})
```

### Ana Servisler

| Servis | Dosya | Sorumluluk |
|--------|-------|------------|
| CheckBillService | check-bill.service.ts | Evrak CRUD, durum değişiklikleri |
| CheckBillJournalService | check-bill-journal.service.ts | Bordro işlemleri |
| CheckBillLogService | services/check-bill-log.service.ts | Log kaydı |
| CheckBillCollectionService | services/check-bill-collection.service.ts | Tahsilat işlemleri |
| ReminderTaskService | reminder-task.service.ts | Vade hatırlatmaları |

### Handler Pattern (İşlem Yakalayıcılar)

Bordro işlemleri için **Handler Pattern** kullanılır:

| Handler | Dosya | Sorumlu Olduğu İşlem |
|---------|-------|---------------------|
| CreditEntryHandler | handlers/credit-entry.handler.ts | Alacaklı evrak girişi |
| DebitEntryHandler | handlers/debit-entry.handler.ts | Borçlu evrak girişi |
| BankCollectionHandler | handlers/bank-collection.handler.ts | Banka tahsilatı |
| BankGuaranteeHandler | handlers/bank-guarantee.handler.ts | Banka teminatı |
| EndorsementHandler | handlers/endorsement.handler.ts | Ciranta işlemi |
| CollectionHandler | handlers/collection.handler.ts | Tahsilat işlemi |
| ReturnHandler | handlers/return.handler.ts | İade işlemi |

**HandlerRegistry:** `handlers/handler-registry.ts` - JournalType'a göre uygun handler'ı seçer.

---

## API Endpoints

### CheckBillController
**Route:** `/api/checks-promissory-notes`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Filtreleme ile liste |
| GET | `/upcoming` | Yaklaşan vadeliler |
| GET | `/endorsements/:id` | Ciranta geçmişi |
| GET | `/collections/:id` | Tahsilat geçmişi |
| GET | `/:id` | Tek evrak detay |
| PUT | `/:id` | Evrak güncelleme |
| DELETE | `/:id` | Soft delete |
| POST | `/action` | Durum değişikliği işlemi |

### CheckBillJournalController
**Route:** `/api/check-bill-journals`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Bordro listesi |
| GET | `/:id` | Bordro detay |
| POST | `/` | Yeni bordro oluştur |
| PUT | `/:id` | Bordro güncelle |
| DELETE | `/:id` | Bordro sil |

---

## DTO'lar (Data Transfer Objects)

### CreateCheckBillDto
```typescript
{
  type: CheckBillType;           // CHECK | PROMISSORY
  checkNo: string;                // Çek/Senet no
  dueDate: string;                // Vade tarihi (ISO date)
  serialNo?: string;              // Seri no
  portfolioType: PortfolioType;   // CREDIT | DEBIT
  amount: number;                 // Tutar
  debtor?: string;                // Borçlu
  bank?: string;                  // Banka
  branch?: string;                // Şube
  accountNo?: string;             // Hesap no
  notes?: string;                 // Notlar
}
```

### CheckBillActionDto (Durum Değişikliği)
```typescript
{
  checkBillId: string;            // Evrak ID
  newStatus: CheckBillStatus;     // Yeni durum
  date: string;                   // İşlem tarihi
  notes?: string;                 // Notlar
  transactionAmount: number;      // İşlem tutarı
  cashboxId?: string;             // Kasa ID (opsiyonel)
  bankAccountId?: string;         // Banka ID (opsiyonel)
}
```

### CreateCheckBillJournalDto (Bordro Oluşturma)
```typescript
{
  type: JournalType;              // Bordro türü
  journalNo?: string;             // Bordro no (auto generate)
  date: string;                   // Bordro tarihi
  accountId?: string;             // Cari ID
  bankAccountId?: string;         // Banka ID
  cashboxId?: string;             // Kasa ID
  notes?: string;                 // Notlar
  newDocuments?: CreateCheckBillDto[];     // Yeni evraklar
  selectedDocumentIds?: string[];          // Mevcut evrak IDs
}
```

### CheckBillFilterDto
```typescript
{
  type?: CheckBillType;
  portfolioType?: PortfolioType;
  status?: CheckBillStatus;
  accountId?: string;
  isProtested?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}
```

---

## İş Akışları (Business Logic)

### 1. Evrak Oluşturma (Bordro ile)
1. `CheckBillJournalService.create()` çağrılır
2. Bordro numarası otomatik oluşturulur (`BRD-{timestamp}`)
3. `JournalType`'a göre uygun handler seçilir
4. Handler evrakları oluşturur ve cari hareketleri ekler
5. İşlem sonrası bakiyeler yeniden hesaplanır

### 2. Durum Değişikliği (Aksiyon)
1. `CheckBillService.processAction()` çağrılır
2. Geçerli durum geçişi kontrol edilir (`assertLegalTransition`)
3. Durum güncellenir
4. Duruma göre ek işlemler yapılır:
   - **Tahsilat/Ödeme:** Kasa veya banka hareketi oluşturulur
   - **İade:** Alacak tekrar açılır, cari hareket eklenir
5. İlgili cari bakiyesi yeniden hesaplanır

### 3. Evrak Güncelleme
1. `CheckBillService.update()` çağrılır
2. Tutar değişikliği varsa:
   - `remainingAmount` yeniden hesaplanır
   - Bağlı `AccountMovement` kayıtları güncellenir (raw SQL)
3. Tüm ilgili carilerin bakiyeleri yeniden hesaplanır

### 4. Bordro Silme
1. `CheckBillJournalService.remove()` çağrılır
2. Sadece `IN_PORTFOLIO` durumundaki evraklar silinir
3. Cari hareketler temizlenir (raw SQL)
4. Bakiyeler yeniden hesaplanır

---

## İlgili Tablolar (Dış Bağlantılar)

| Tablo | İlişki | Açıklama |
|-------|--------|----------|
| Account | accountId | Cari hesap bilgileri |
| AccountMovement | check_bill_id | Evrak cari hareketleri |
| AccountTransaction | sourceId: CHECK_BILL_ACTION | Hesap işlemleri |
| Cashbox | collectionCashboxId | Kasa bilgileri |
| CashboxMovement | check_bill_id | Kasa hareketleri |
| BankAccount | bankAccountId | Banka hesap bilgileri |
| BankAccountMovement | check_bill_id | Banka hareketleri |
| User | createdBy, updatedBy, deletedBy | Kullanıcı bilgileri |
| Tenant | tenantId | Kiracı bilgisi |

---

## Güvenlik ve Multi-Tenancy

1. **Tenant Isolation:** Tüm sorgular `tenantId` ile filtrelenir
2. **Soft Delete:** `deletedAt` kullanılır, fiziksel silme yok
3. **Audit Trail:** `CheckBillLog` ile tüm işlemler kaydedilir
4. **JWT Guard:** Tüm endpoint'ler kimlik doğrulaması gerektirir
5. **Status Transition Validation:** Geçersiz durum geçişleri engellenir

---

## Performans Notları

1. **Indexler:** Sık sorgulanan alanlarda index mevcut
2. **Raw SQL:** Bazı işlemlerde Prisma client bypass edilir (stale data önleme)
3. **Transaction:** Kritik işlemler transaction içinde çalışır
4. **Balance Recalculation:** İşlem sonrası bakiyeler asenkron hesaplanır

---

## Dosya Yapısı

```
check-bill/
├── check-bill.module.ts
├── check-bill.controller.ts
├── check-bill.service.ts
├── check-bill-journal.controller.ts
├── check-bill-journal.service.ts
├── reminder-task.service.ts
├── dto/
│   ├── create-check-bill.dto.ts
│   ├── check-bill-transaction.dto.ts
│   ├── check-bill-filter.dto.ts
│   ├── collection-action.dto.ts
│   └── create-check-bill-journal.dto.ts
├── handlers/
│   ├── handler-registry.ts
│   ├── journal-handler.interface.ts
│   ├── credit-entry.handler.ts
│   ├── debit-entry.handler.ts
│   ├── bank-collection.handler.ts
│   ├── bank-guarantee.handler.ts
│   ├── endorsement.handler.ts
│   ├── collection.handler.ts
│   └── return.handler.ts
├── services/
│   ├── check-bill-log.service.ts
│   └── check-bill-collection.service.ts
└── utils/
    └── status-transition.util.ts
```

---

*Bu rapot `api-stage/server/prisma/schema.prisma` ve kaynak kod analizi ile oluşturulmuştur.*
