

**ÇEK / SENET YÖNETİM MODÜLÜ**

*Kurumsal ERP Backend Mimari Dökümanı*

Versiyon 2.0  |  Nisan 2025  |  Kurumsal ERP Takımı

# **İçindekiler**

# **1\. Yönetici Özeti**

Bu döküman, çok kiracılı (multi-tenant) kurumsal ERP sisteminde yer alan Çek/Senet Yönetim Modülü'nün mevcut backend mimarisini, genişletilmiş veri modelini, iş kurallarını ve eksik bileşenleri kapsamlı biçimde açıklamaktadır.

Modül; çeklerin ve senetlerin tam yaşam döngüsünü (oluşturma → portföy → banka/ciro → tahsilat/protesto → kapanış) yönetmekte, muhasebe entegrasyonunu otomatik gerçekleştirmekte ve TFRS/VUK uyumlu raporlama altyapısı sunmaktadır.

| Kapsam Alanı | Durum |
| ----- | ----- |
| **Temel çek/senet yaşam döngüsü** | ✅ Mevcut |
| **Bordro (journal) motoru** | ✅ Mevcut |
| **Ciranta zinciri** | ✅ Mevcut |
| **Tahsilat & kasa/banka entegrasyonu** | ✅ Mevcut |
| **Muhasebe (GL) otomatik entegrasyonu** | 🔴 Eksik – Kritik |
| **KDV & stopaj hesabı** | 🔴 Eksik – Kritik |
| **Risk / limit yönetimi** | 🔴 Eksik |
| **Dövizli çek/senet desteği** | 🔴 Eksik |
| **İleri tarihli çek planlama** | 🔴 Eksik |
| **Banka EFT/SWIFT entegrasyonu** | 🔴 Eksik |
| **İcra & hukuki takip süreci** | 🔴 Eksik |
| **IBAN/SWIFT doğrulaması** | 🔴 Eksik |
| **Rol bazlı limit yetkilendirme** | 🔴 Eksik |
| **Gelişmiş raporlama & dashboard** | 🔴 Eksik |

# **2\. Veritabanı Şeması – Mevcut Tablolar**

## **2.1 check\_bills – Ana Evrak Tablosu**

Çek ve senet evraklarının tüm master bilgilerini ve yaşam döngüsü durumunu barındırır. Tüm ilişkili tablolar bu tabloya FK referanslar üzerinden bağlanır.

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Benzersiz birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Multi-tenant izolasyon anahtarı |
| **type** | Enum: CheckBillType | ✓ | CHECK veya PROMISSORY |
| **portfolioType** | Enum: PortfolioType | ✓ | CREDIT (alacak) | DEBIT (borç) |
| **accountId** | UUID (FK) | ✓ | İlişkili cari hesap |
| **amount** | Decimal(15,2) | ✓ | Evrak nominal tutarı |
| **remainingAmount** | Decimal(15,2) | ✓ | Kalan tutar (kısmi ödemelerde güncellenir) |
| **currency** | CHAR(3) | \- | Para birimi kodu (TRY/USD/EUR) — YENİ |
| **exchangeRate** | Decimal(15,6) | \- | Kur değeri (dövizli işlemler için) — YENİ |
| **amountTRY** | Decimal(15,2) | \- | TL karşılığı (raporlama için) — YENİ |
| **dueDate** | DateTime | ✓ | Vade / ödeme tarihi |
| **issueDate** | DateTime | \- | Düzenlenme tarihi — YENİ |
| **presentationDate** | DateTime | \- | İbraz tarihi — YENİ |
| **bank** | String | \- | Banka adı (muhatap banka) |
| **bankCode** | String | \- | Banka kodu (SWIFT/BIC) — YENİ |
| **branch** | String | \- | Şube adı |
| **branchCode** | String | \- | Şube kodu — YENİ |
| **accountNo** | String | \- | Banka hesap numarası |
| **iban** | CHAR(26) | \- | IBAN numarası (doğrulanmış) — YENİ |
| **checkNo** | String | \- | Çek/Senet numarası (benzersiz) |
| **serialNo** | String | \- | Seri/Cilt numarası |
| **micrLine** | String | \- | Manyetik karakter satırı (MICR) — YENİ |
| **drawerName** | String | \- | Keşideci adı — YENİ |
| **drawerTaxNo** | String | \- | Keşideci vergi/TC numarası — YENİ |
| **payeeName** | String | \- | Lehdar adı — YENİ |
| **status** | Enum: CheckBillStatus | ✓ | Evrak yaşam döngüsü durumu |
| **riskScore** | Int | \- | Risk skoru (0-100) — YENİ |
| **collectionDate** | DateTime | \- | Gerçekleşen tahsilat tarihi |
| **collectionCashboxId** | UUID (FK) | \- | Tahsilat kasası |
| **isEndorsed** | Boolean | ✓ | Ciro edildi mi? |
| **endorsementDate** | DateTime | \- | Son ciro tarihi |
| **endorsedTo** | String | \- | Ciro yapılan kişi/firma |
| **isProtested** | Boolean | ✓ | Protesto yapıldı mı? |
| **protestedAt** | DateTime | \- | Protesto tarihi |
| **protestReason** | String | \- | Protesto nedeni — YENİ |
| **legalFollowupStarted** | Boolean | \- | Hukuki takip başlatıldı mı? — YENİ |
| **legalFollowupDate** | DateTime | \- | Hukuki takip başlangıç tarihi — YENİ |
| **glEntryId** | UUID (FK) | \- | Bağlı muhasebe yevmiye kaydı — YENİ |
| **isReconciled** | Boolean | \- | Mutabakat tamamlandı mı? — YENİ |
| **reconciledAt** | DateTime | \- | Mutabakat tarihi — YENİ |
| **taxWithholdingRate** | Decimal(5,2) | \- | Stopaj oranı (%) — YENİ |
| **taxWithholdingAmount** | Decimal(15,2) | \- | Stopaj tutarı — YENİ |
| **vatRate** | Decimal(5,2) | \- | KDV oranı (%) — YENİ |
| **vatAmount** | Decimal(15,2) | \- | KDV tutarı — YENİ |
| **notes** | Text | \- | Serbest metin notlar |
| **internalRef** | String | \- | Dahili referans kodu — YENİ |
| **externalRef** | String | \- | Dış referans / banka ref. — YENİ |
| **attachmentUrls** | JSON | \- | Ek belgeler (taranmış çek görseli) — YENİ |
| **tags** | JSON | \- | Etiketler (arama & filtreleme) — YENİ |
| **lastJournalId** | UUID (FK) | \- | Son bordro ID |
| **createdBy** | UUID (FK) | \- | Oluşturan kullanıcı |
| **updatedBy** | UUID (FK) | \- | Son güncelleyen kullanıcı |
| **approvedBy** | UUID (FK) | \- | Onaylayan kullanıcı — YENİ |
| **approvedAt** | DateTime | \- | Onay tarihi/saati — YENİ |
| **deletedAt** | DateTime | \- | Yumuşak silme tarihi |
| **deletedBy** | UUID (FK) | \- | Silen kullanıcı |
| **createdAt** | DateTime | ✓ | Oluşturulma zaman damgası |
| **updatedAt** | DateTime | ✓ | Güncelleme zaman damgası |

## **2.2 check\_bill\_journals – Bordro Tablosu**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **journalNo** | String (unique) | ✓ | Otomatik bordro numarası |
| **type** | Enum: JournalType | ✓ | Bordro türü |
| **date** | DateTime | ✓ | Bordro işlem tarihi |
| **accountingDate** | DateTime | \- | Muhasebe kayıt tarihi (farklı olabilir) — YENİ |
| **fiscalPeriodId** | UUID (FK) | \- | Muhasebe dönemi bağlantısı — YENİ |
| **accountId** | UUID (FK) | \- | İlgili cari hesap |
| **cashboxId** | UUID (FK) | \- | Kasa bağlantısı |
| **bankAccountId** | UUID (FK) | \- | Banka hesap bağlantısı |
| **glJournalId** | UUID (FK) | \- | Genel Muhasebe yevmiye referansı — YENİ |
| **totalAmount** | Decimal(15,2) | \- | Bordro toplam tutarı — YENİ |
| **totalCount** | Int | \- | Evrak adedi — YENİ |
| **status** | Enum: JournalStatus | \- | DRAFT | POSTED | CANCELLED — YENİ |
| **approvedBy** | UUID (FK) | \- | Onaylayan kullanıcı — YENİ |
| **approvedAt** | DateTime | \- | Onay zaman damgası — YENİ |
| **notes** | Text | \- | Açıklama |
| **createdById** | UUID (FK) | \- | Oluşturan kullanıcı |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |
| **updatedAt** | DateTime | ✓ | Güncelleme tarihi |
| **deletedAt** | DateTime | \- | Yumuşak silme tarihi |

## **2.3 check\_bill\_journal\_items – Bordro Kalemleri**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **journalId** | UUID (FK) | ✓ | Bağlı bordro |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **lineAmount** | Decimal(15,2) | \- | Kalem tutarı (kısmi işlemler için) — YENİ |
| **lineNote** | String | \- | Kalem açıklaması — YENİ |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |
| **updatedAt** | DateTime | ✓ | Güncelleme tarihi |

## **2.4 check\_bill\_endorsements – Ciro Zinciri**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **sequence** | Int | ✓ | Sıra numarası (ciro zinciri) |
| **fromAccountId** | UUID (FK) | ✓ | Ciro eden cari |
| **toAccountId** | UUID (FK) | ✓ | Ciro edilen cari |
| **endorsedAt** | DateTime | ✓ | Ciro tarihi |
| **endorsementType** | Enum | \- | FULL | PARTIAL | BANK — YENİ |
| **endorsedAmount** | Decimal(15,2) | \- | Ciro tutarı (kısmi cirolarda) — YENİ |
| **endorsementReason** | String | \- | Ciro nedeni — YENİ |
| **isReturned** | Boolean | \- | Ciro iade edildi mi? — YENİ |
| **returnedAt** | DateTime | \- | İade tarihi — YENİ |
| **journalId** | UUID (FK) | ✓ | İlgili bordro |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **2.5 check\_bill\_collections – Tahsilat Kayıtları**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **collectedAmount** | Decimal(15,2) | ✓ | Tahsil edilen tutar |
| **collectionDate** | DateTime | ✓ | Tahsilat tarihi |
| **collectionMethod** | Enum | \- | CASH | BANK\_TRANSFER | CLEARING — YENİ |
| **cashboxId** | UUID (FK) | \- | Kasa referansı |
| **bankAccountId** | UUID (FK) | \- | Banka hesap referansı |
| **bankTransactionRef** | String | \- | Banka işlem referans numarası — YENİ |
| **exchangeRate** | Decimal(15,6) | \- | Kur (dövizli tahsilatlarda) — YENİ |
| **amountTRY** | Decimal(15,2) | \- | TL karşılığı — YENİ |
| **taxWithholdingAmount** | Decimal(15,2) | \- | Stopaj kesintisi — YENİ |
| **netAmount** | Decimal(15,2) | \- | Net tahsilat tutarı — YENİ |
| **journalId** | UUID (FK) | ✓ | İlgili bordro |
| **glEntryId** | UUID (FK) | \- | GL yevmiye referansı — YENİ |
| **createdById** | UUID (FK) | \- | İşlemi yapan kullanıcı |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **2.6 check\_bill\_logs – Audit Trail**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **userId** | UUID (FK) | \- | İşlemi yapan kullanıcı |
| **performedById** | UUID (FK) | \- | Fiili işlemi yapan |
| **actionType** | Enum: ActionType | ✓ | İşlem türü (CREATE/UPDATE/STATUS\_CHANGE…) |
| **fromStatus** | Enum | \- | Önceki durum |
| **toStatus** | Enum | \- | Yeni durum |
| **changes** | JSONB | \- | Alan bazlı değişiklik kaydı (before/after) |
| **journalId** | UUID (FK) | \- | İlgili bordro |
| **ipAddress** | INET | \- | İstemci IP adresi |
| **userAgent** | Text | \- | Tarayıcı/istemci bilgisi |
| **sessionId** | UUID | \- | Oturum kimliği — YENİ |
| **requestId** | UUID | \- | API isteği izleme ID — YENİ |
| **duration** | Int | \- | İşlem süresi (ms) — YENİ |
| **isSystem** | Boolean | \- | Sistem otomasyonuyla mı yapıldı? — YENİ |
| **notes** | Text | \- | Ek açıklama |
| **createdAt** | DateTime | ✓ | Log zaman damgası |

# **3\. Yeni Tablolar – Kurumsal ERP Gereksinimleri**

## **3.1 check\_bill\_gl\_entries – Muhasebe Entegrasyonu (KRİTİK)**

**Bu tablo olmadan çek/senet modülü muhasebe sistemine bağlanamaz. Her evrak hareketi otomatik yevmiye maddesi oluşturmalıdır (VUK md. 219).**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **journalId** | UUID (FK) | \- | Bağlı bordro |
| **glJournalNo** | String | ✓ | Yevmiye fiş numarası |
| **accountingDate** | DateTime | ✓ | Muhasebe tarihi |
| **fiscalYear** | Int | ✓ | Mali yıl |
| **fiscalPeriod** | Int | ✓ | Mali dönem (1-12) |
| **debitAccountCode** | String | ✓ | Borç hesap kodu (örn. 101, 121, 321\) |
| **creditAccountCode** | String | ✓ | Alacak hesap kodu |
| **debitAmount** | Decimal(15,2) | ✓ | Borç tutarı |
| **creditAmount** | Decimal(15,2) | ✓ | Alacak tutarı |
| **currency** | CHAR(3) | ✓ | Para birimi |
| **exchangeRate** | Decimal(15,6) | \- | Kur |
| **description** | Text | ✓ | Açıklama |
| **entryType** | Enum | ✓ | AUTO | MANUAL | REVERSAL |
| **status** | Enum | ✓ | DRAFT | POSTED | REVERSED |
| **reversalOf** | UUID (FK) | \- | İptal edilen kayıt referansı |
| **postedBy** | UUID (FK) | \- | Onaylayan |
| **postedAt** | DateTime | \- | Onay tarihi |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **3.2 check\_bill\_risk\_limits – Risk & Limit Yönetimi**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **accountId** | UUID (FK) | ✓ | Cari hesap |
| **limitType** | Enum | ✓ | SINGLE\_CHECK | TOTAL\_PORTFOLIO | MATURITY\_DAYS |
| **limitAmount** | Decimal(15,2) | \- | Maksimum tutar limiti |
| **limitDays** | Int | \- | Maksimum vade günü |
| **currentExposure** | Decimal(15,2) | ✓ | Mevcut risk tutarı |
| **utilizationRate** | Decimal(5,2) | ✓ | Kullanım oranı (%) |
| **riskRating** | Enum | \- | LOW | MEDIUM | HIGH | CRITICAL |
| **alertThreshold** | Decimal(5,2) | \- | Uyarı eşiği (%) |
| **isActive** | Boolean | ✓ | Limit aktif mi? |
| **validFrom** | DateTime | ✓ | Geçerlilik başlangıcı |
| **validUntil** | DateTime | \- | Geçerlilik bitişi |
| **approvedBy** | UUID (FK) | \- | Onaylayan yönetici |
| **notes** | Text | \- | Açıklama |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |
| **updatedAt** | DateTime | ✓ | Güncelleme tarihi |

## **3.3 check\_bill\_reminders – Gelişmiş Hatırlatma Sistemi**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **reminderType** | Enum | ✓ | PRE\_DUE | DUE\_DATE | OVERDUE | PROTEST\_WARNING |
| **triggerDaysBefore** | Int | ✓ | Vadeden kaç gün önce tetiklensin |
| **scheduledAt** | DateTime | ✓ | Gönderilecek tarih/saat |
| **sentAt** | DateTime | \- | Gerçek gönderim zamanı |
| **status** | Enum | ✓ | PENDING | SENT | FAILED | CANCELLED |
| **channel** | Enum | ✓ | EMAIL | SMS | IN\_APP | WEBHOOK |
| **recipients** | JSONB | ✓ | Alıcı listesi (e-posta / telefon) |
| **templateId** | UUID (FK) | \- | Bildirim şablonu |
| **retryCount** | Int | \- | Yeniden deneme sayısı |
| **errorMessage** | Text | \- | Hata mesajı |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **3.4 check\_bill\_protest\_tracking – Protesto & Hukuki Takip**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **protestDate** | DateTime | ✓ | Protesto tarihi |
| **protestReason** | Text | ✓ | Protesto nedeni |
| **protestingNotaryId** | String | \- | Protestoyu yapan noter |
| **protestNo** | String | \- | Protesto kayıt numarası |
| **legalStatus** | Enum | ✓ | PROTESTED | LAWSUIT\_FILED | JUDGMENT | EXECUTION | CLOSED |
| **lawsuitDate** | DateTime | \- | Dava açılış tarihi |
| **lawsuitNo** | String | \- | Dava numarası |
| **courtId** | String | \- | Mahkeme adı / kodu |
| **judgmentDate** | DateTime | \- | Karar tarihi |
| **judgmentAmount** | Decimal(15,2) | \- | Hükmedilen tutar |
| **executionDate** | DateTime | \- | İcra takip tarihi |
| **executionNo** | String | \- | İcra dosya numarası |
| **collectedViaLegal** | Decimal(15,2) | \- | Hukuki yolla tahsil edilen tutar |
| **lawyerId** | UUID (FK) | \- | Sorumlu avukat |
| **notes** | Text | \- | Hukuki notlar |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |
| **updatedAt** | DateTime | ✓ | Güncelleme tarihi |

## **3.5 check\_bill\_bank\_submissions – Banka Gönderim Takibi**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Bağlı evrak |
| **bankAccountId** | UUID (FK) | ✓ | Gönderilen banka hesabı |
| **submissionType** | Enum | ✓ | COLLECTION | GUARANTEE | DISCOUNT |
| **submittedAt** | DateTime | ✓ | Gönderim tarihi |
| **submissionRef** | String | \- | Banka tarafından verilen referans |
| **expectedDate** | DateTime | \- | Beklenen işlem tarihi |
| **actualDate** | DateTime | \- | Gerçekleşen işlem tarihi |
| **status** | Enum | ✓ | SUBMITTED | PROCESSING | CLEARED | REJECTED | RETURNED |
| **bankFee** | Decimal(15,2) | \- | Banka masrafı |
| **rejectionReason** | Text | \- | Ret nedeni |
| **createdById** | UUID (FK) | ✓ | Gönderen kullanıcı |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |
| **updatedAt** | DateTime | ✓ | Güncelleme tarihi |

## **3.6 check\_bill\_discounting – İskonto İşlemleri**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | İskonto edilen evrak |
| **bankAccountId** | UUID (FK) | ✓ | Banka hesabı |
| **faceValue** | Decimal(15,2) | ✓ | Nominal değer |
| **discountRate** | Decimal(7,4) | ✓ | İskonto oranı (%) |
| **discountAmount** | Decimal(15,2) | ✓ | İskonto tutarı |
| **bankingCommission** | Decimal(15,2) | \- | Banka komisyonu |
| **netProceeds** | Decimal(15,2) | ✓ | Net gelir |
| **discountDate** | DateTime | ✓ | İskonto tarihi |
| **maturityDate** | DateTime | ✓ | Vade tarihi (onay) |
| **status** | Enum | ✓ | ACTIVE | SETTLED | RECOURSE | CANCELLED |
| **glEntryId** | UUID (FK) | \- | Muhasebe yevmiyesi |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **3.7 check\_bill\_reconciliation – Banka Mutabakatı**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | ✓ | Mutabakat yapılan evrak |
| **bankAccountId** | UUID (FK) | ✓ | Banka hesabı |
| **reconciliationDate** | DateTime | ✓ | Mutabakat tarihi |
| **bankAmount** | Decimal(15,2) | ✓ | Banka ekstresindeki tutar |
| **systemAmount** | Decimal(15,2) | ✓ | Sistemdeki tutar |
| **difference** | Decimal(15,2) | ✓ | Fark tutarı |
| **status** | Enum | ✓ | MATCHED | UNMATCHED | EXCEPTION | RESOLVED |
| **bankReference** | String | \- | Banka hareket referansı |
| **resolvedBy** | UUID (FK) | \- | Çözümleyen kullanıcı |
| **resolvedAt** | DateTime | \- | Çözüm tarihi |
| **notes** | Text | \- | Mutabakat notu |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

## **3.8 check\_bill\_approval\_workflows – Onay İş Akışları**

| Alan Adı | Veri Tipi | Zorunlu | Açıklama |
| ----- | :---: | :---: | ----- |
| **id** | UUID (PK) | ✓ | Birincil anahtar |
| **tenantId** | UUID (FK) | ✓ | Kiracı izolasyonu |
| **checkBillId** | UUID (FK) | \- | Evrak (tekil onay için) |
| **journalId** | UUID (FK) | \- | Bordro (toplu onay için) |
| **workflowType** | Enum | ✓ | CREATION | COLLECTION | DISCOUNT | PROTEST |
| **step** | Int | ✓ | Onay adımı (1,2,3…) |
| **approverId** | UUID (FK) | ✓ | Onaylayacak kullanıcı |
| **status** | Enum | ✓ | PENDING | APPROVED | REJECTED | DELEGATED |
| **actionAt** | DateTime | \- | Onay/ret zamanı |
| **comments** | Text | \- | Onaylayanın yorumu |
| **delegatedTo** | UUID (FK) | \- | Devredilen kullanıcı |
| **amountThreshold** | Decimal(15,2) | \- | Bu adımın tutar eşiği |
| **createdAt** | DateTime | ✓ | Oluşturulma tarihi |

# **4\. Enum Tanımları**

## **4.1 CheckBillStatus – Evrak Durum Matrisi**

| Durum Kodu | Türkçe Adı | Açıklama |
| ----- | ----- | ----- |
| **IN\_PORTFOLIO** | Portföyde | Evrak firmada, henüz işlem yapılmadı |
| **SENT\_TO\_BANK** | Bankaya Gönderildi | Tahsilat/teminat için bankaya verildi (düzeltilmiş) |
| **IN\_BANK\_COLLECTION** | Bankada Tahsilde | Banka tahsilat sürecinde |
| **IN\_BANK\_GUARANTEE** | Bankada Teminat | Banka teminat olarak tutmakta |
| **DISCOUNTED** | İskonto Edildi | Vadeden önce bankaya iskonto edildi — YENİ |
| **COLLECTED** | Tahsil Edildi | Başarıyla tahsil edildi |
| **PAID** | Ödendi | Borç çeki/senedi ödendi |
| **PARTIAL\_PAID** | Kısmi Ödendi | Kısmi tahsilat yapıldı |
| **ENDORSED** | Ciro Edildi | Üçüncü tarafa ciro edildi |
| **RETURNED** | İade Edildi | Cari hesaba iade edildi |
| **WITHOUT\_COVERAGE** | Karşılıksız | Banka tarafından karşılıksız iade |
| **PROTESTED** | Protesto Edildi | Resmi protesto süreci başlatıldı |
| **LEGAL\_FOLLOWUP** | Hukuki Takipte | İcra/dava sürecinde — YENİ |
| **WRITTEN\_OFF** | Değersiz Silindi | Alacak silindi, muhasebe kaydı yapıldı — YENİ |
| **CANCELLED** | İptal Edildi | Veri girişi hatası ile iptal — YENİ |

## **4.2 JournalType – Bordro Türleri (Genişletilmiş)**

| Bordro Türü | Açıklama |
| ----- | ----- |
| **CREDIT\_ENTRY** | Alacaklı evrak girişi (müşteri çeki/senedi alındı) |
| **DEBIT\_ENTRY** | Borçlu evrak girişi (firma çeki/senedi düzenlendi) |
| **BANK\_COLLECTION\_SUBMISSION** | Bankaya tahsilat amacıyla tevdi |
| **BANK\_GUARANTEE\_SUBMISSION** | Bankaya teminat amacıyla tevdi |
| **BANK\_DISCOUNT\_SUBMISSION** | Bankaya iskonto amacıyla tevdi — YENİ |
| **ENDORSEMENT\_TO\_ACCOUNT** | Cari hesaba ciro |
| **ENDORSEMENT\_RETURN** | Ciro iadesi |
| **COLLECTION** | Tahsilat bordrosu |
| **PAYMENT** | Ödeme bordrosu |
| **PARTIAL\_COLLECTION** | Kısmi tahsilat bordrosu — YENİ |
| **RETURN\_FROM\_BANK** | Bankadan iade bordrosu |
| **PROTEST\_ENTRY** | Protesto kayıt bordrosu — YENİ |
| **LEGAL\_TRANSFER** | Hukuki takip transfer bordrosu — YENİ |
| **WRITE\_OFF** | Değersiz silme bordrosu — YENİ |
| **REVERSAL** | Tersine çevirme (iptal) bordrosu — YENİ |

# **5\. API Endpoint Mimarisi**

## **5.1 CheckBill Controller  –  /api/checks-promissory-notes**

| Method | Endpoint | Açıklama | Auth |
| ----- | ----- | ----- | ----- |
| **GET** | / | Evrak listesi (filtreleme, sayfalama, sıralama) | JWT |
| **GET** | /stats/summary | Dashboard özet istatistikleri — YENİ | JWT |
| **GET** | /stats/aging | Vadeli alacak/borç yaşlandırma raporu — YENİ | JWT |
| **GET** | /stats/cashflow | Nakit akış tahmini (vadeye göre) — YENİ | JWT |
| **GET** | /upcoming | Yaklaşan vade listesi |  |
| **GET** | /overdue | Vadesi geçmiş evraklar — YENİ | JWT |
| **GET** | /at-risk | Risk skoruna göre kritik evraklar — YENİ | JWT |
| **GET** | /:id | Evrak detayı (tam ilişkilerle) | JWT |
| **GET** | /:id/timeline | Evrak işlem zaman çizelgesi — YENİ | JWT |
| **GET** | /:id/endorsements | Ciro geçmişi | JWT |
| **GET** | /:id/collections | Tahsilat geçmişi | JWT |
| **GET** | /:id/gl-entries | Muhasebe kayıtları — YENİ | JWT |
| **GET** | /:id/documents | Ekli belgeler — YENİ | JWT |
| **POST** | / | Doğrudan evrak oluşturma | JWT \+ ROLE |
| **POST** | /action | Durum değişikliği aksiyonu | JWT \+ ROLE |
| **POST** | /bulk-action | Toplu aksiyon — YENİ | JWT \+ ROLE |
| **POST** | /import | Excel/CSV ile toplu ithalat — YENİ | JWT \+ ROLE |
| **PUT** | /:id | Evrak güncelleme (onay öncesi) | JWT \+ ROLE |
| **DELETE** | /:id | Yumuşak silme | JWT \+ ROLE |
| **GET** | /export/excel | Excel dışa aktarma — YENİ | JWT |
| **GET** | /export/pdf | PDF rapor — YENİ | JWT |

## **5.2 Journal Controller  –  /api/check-bill-journals**

| Method | Endpoint | Açıklama |
| ----- | ----- | ----- |
| **GET** | / | Bordro listesi |
| **GET** | /:id | Bordro detayı |
| **GET** | /:id/items | Bordro kalemleri |
| **GET** | /:id/gl-preview | Muhasebe önizleme — YENİ |
| **POST** | / | Yeni bordro oluştur |
| **POST** | /:id/post | Bordroyu muhasebe sistemine aktar — YENİ |
| **POST** | /:id/approve | Bordro onayı — YENİ |
| **POST** | /:id/cancel | Bordro iptal — YENİ |
| **PUT** | /:id | Bordro güncelle (DRAFT durumunda) |
| **DELETE** | /:id | Bordro sil (DRAFT durumunda) |

## **5.3 Risk & Raporlama Controller  –  /api/check-bill-reports  (YENİ)**

| Method | Endpoint | Açıklama |
| ----- | ----- | ----- |
| **GET** | /portfolio-summary | Portföy özeti (tür, durum, para birimine göre) |
| **GET** | /aging-report | Yaşlandırma raporu (0-30, 31-60, 61-90, 90+ gün) |
| **GET** | /cashflow-forecast | Nakit akış tahmini (önümüzdeki 90 gün) |
| **GET** | /bank-position | Bankadaki evrak pozisyon raporu |
| **GET** | /protest-report | Protesto & hukuki takip raporu |
| **GET** | /risk-exposure | Cari bazlı risk maruziyet raporu |
| **GET** | /endorsement-chain/:id | Evrak ciro zinciri görselleştirmesi |
| **GET** | /reconciliation-status | Banka mutabakat durumu |
| **GET** | /fiscal-period/:year/:month | Mali dönem özet raporu |

# **6\. İş Akışları ve Durum Geçiş Matrisi**

## **6.1 Durum Geçiş Matrisi**

Sadece aşağıdaki geçişler izin verilmeli. assertLegalTransition() bu matrisi kontrol etmelidir.

| Kaynak Durum | İzin Verilen Geçişler |
| ----- | ----- |
| **IN\_PORTFOLIO** | SENT\_TO\_BANK, ENDORSED, COLLECTED, PAID, RETURNED, CANCELLED |
| **SENT\_TO\_BANK** | IN\_BANK\_COLLECTION, IN\_BANK\_GUARANTEE, DISCOUNTED, RETURNED |
| **IN\_BANK\_COLLECTION** | COLLECTED, WITHOUT\_COVERAGE, RETURNED |
| **IN\_BANK\_GUARANTEE** | IN\_PORTFOLIO, RETURNED |
| **DISCOUNTED** | COLLECTED, RECOURSE |
| **ENDORSED** | COLLECTED, RETURNED, PROTESTED |
| **COLLECTED** | — (terminal durum) |
| **PAID** | — (terminal durum) |
| **PARTIAL\_PAID** | COLLECTED, PROTESTED, LEGAL\_FOLLOWUP |
| **WITHOUT\_COVERAGE** | PROTESTED, RETURNED, COLLECTED |
| **PROTESTED** | LEGAL\_FOLLOWUP, COLLECTED, WRITTEN\_OFF |
| **LEGAL\_FOLLOWUP** | COLLECTED, WRITTEN\_OFF |
| **WRITTEN\_OFF** | — (terminal durum) |
| **CANCELLED** | — (terminal durum) |

## **6.2 Otomatik Muhasebe Entegrasyon Akışı (YENİ)**

| Tetikleyici Olay | Borç Hesabı | Alacak Hesabı | Açıklama |
| ----- | ----- | ----- | ----- |
| **Müşteri çeki/senedi alındı** | 101.01 Alınan Çekler | 120 Alıcılar | CREDIT\_ENTRY bordrosu |
| **Bankaya tahsilat tevdii** | 101.02 Bankadaki Çekler | 101.01 Alınan Çekler | Banka gönderimi |
| **Banka tahsilat gerçekleşti** | 102 Bankalar | 101.02 Bankadaki Çekler | Tahsilat tamamlandı |
| **Karşılıksız iade** | 121 Şüpheli Alacaklar | 101.01 Alınan Çekler | İade işlemi |
| **Protesto** | 127 Protestolu Çekler | 121 Şüpheli Alacaklar | Protesto kaydı |
| **Firma çeki/senedi düzenlendi** | 321 Borçlular | 103.01 Verilen Çekler | DEBIT\_ENTRY bordrosu |
| **Firma çeki/senedi ödendi** | 103.01 Verilen Çekler | 102 Bankalar | Ödeme gerçekleşti |
| **İskonto yapıldı** | 102 Bankalar \+ 780 Faiz | 101.01 Alınan Çekler | İskonto işlemi |
| **Değersiz silme** | 654 Şüpheli Alacak Karşılığı | 127 Protestolu Çekler | Write-off kaydı |

# **7\. Servis ve Handler Mimarisi**

## **7.1 Mevcut Servisler**

| Servis / Handler | Sorumluluk |
| ----- | ----- |
| **CheckBillService** | CRUD, durum değişiklikleri, validasyon |
| **CheckBillJournalService** | Bordro oluşturma, onay ve iptal akışları |
| **CheckBillLogService** | Kapsamlı audit trail kayıtları |
| **CheckBillCollectionService** | Tahsilat işlemleri ve kasa/banka entegrasyonu |
| **ReminderTaskService** | Cron tabanlı vade hatırlatmaları |
| **CreditEntryHandler** | Müşteri evrağı giriş bordrosu |
| **DebitEntryHandler** | Firma evrağı giriş bordrosu |
| **BankCollectionHandler** | Banka tahsilat işlemleri |
| **BankGuaranteeHandler** | Banka teminat işlemleri |
| **EndorsementHandler** | Ciro zinciri yönetimi |
| **CollectionHandler** | Tahsilat aksiyon handler |
| **ReturnHandler** | İade işlemi handler |

## **7.2 Yeni Eklenmesi Gereken Servisler**

| Servis | Dosya | Sorumluluk |
| ----- | ----- | ----- |
| **GLIntegrationService** | services/gl-integration.service.ts | Otomatik yevmiye maddesi oluşturma |
| **RiskLimitService** | services/risk-limit.service.ts | Risk hesaplama ve limit kontrolü |
| **BankSubmissionService** | services/bank-submission.service.ts | Banka gönderim takibi |
| **DiscountingService** | services/discounting.service.ts | İskonto işlemleri |
| **ReconciliationService** | services/reconciliation.service.ts | Banka mutabakatı |
| **ProtestTrackingService** | services/protest-tracking.service.ts | Protesto & hukuki takip |
| **CashFlowService** | services/cash-flow.service.ts | Nakit akış tahminleri |
| **ReportingService** | services/reporting.service.ts | Kapsamlı raporlama |
| **ApprovalWorkflowService** | services/approval-workflow.service.ts | Onay iş akışı motoru |
| **CurrencyService** | services/currency.service.ts | Döviz kuru yönetimi |
| **NotificationService** | services/notification.service.ts | Çok kanallı bildirim gönderimi |
| **DocumentService** | services/document.service.ts | Evrak tarama ve depolama |
| **DiscountHandler** | handlers/discount.handler.ts | İskonto bordro handler |
| **ProtestHandler** | handlers/protest.handler.ts | Protesto bordro handler |
| **WriteOffHandler** | handlers/write-off.handler.ts | Değersiz silme handler |
| **ReversalHandler** | handlers/reversal.handler.ts | İptal/tersine çevirme handler |

# **8\. Güvenlik, Yetkilendirme ve Mevzuat Uyumu**

## **8.1 Rol Tabanlı Erişim Kontrolü (RBAC)**

| Rol | İzin Verilen İşlemler |
| ----- | ----- |
| **CHECK\_VIEWER** | Listeleme ve görüntüleme |
| **CHECK\_OPERATOR** | Evrak oluşturma, bordro düzenleme, aksiyon alma |
| **CHECK\_APPROVER** | Bordro onaylama, limit üstü işlem onayı |
| **CHECK\_MANAGER** | Risk limiti tanımlama, değersiz silme, raporlama |
| **CHECK\_ADMIN** | Tüm işlemler, iptal, sistem konfigürasyonu |
| **AUDIT** | Sadece okuma; log ve audit trail erişimi |

## **8.2 Mevzuat ve Standart Uyumu**

| Standart / Mevzuat | Gereksinim |
| ----- | ----- |
| **VUK Madde 219** | Her finansal işlem için yevmiye maddesi zorunlu |
| **TTK Madde 780-818** | Çek hükümlerine uygun durum geçişleri |
| **TTK Madde 776-779** | Senet hukukuna uygun akış |
| **BDDK Tebliği** | Bankaya gönderilen evrakların kayıt zorunluluğu |
| **TFRS 9** | Değer düşüklüğü karşılıkları ve finansal araç muhasebesi |
| **KAP/SPK** | Halka açık şirketler için özel raporlama zorunlulukları |
| **KVKK** | Kişisel veri alanlarının korunması ve maskelenmesi |
| **ISO 27001** | Bilgi güvenliği standartlarına uyumluluk |

# **9\. Performans ve Teknik Mimari**

## **9.1 Veritabanı Index Stratejisi**

| Tablo | Önerilen Index | Kullanım Amacı |
| ----- | ----- | ----- |
| **check\_bills** | (tenantId, status, dueDate) | Filtreli liste sorguları |
| **check\_bills** | (tenantId, accountId, status) | Cari bazlı portföy sorgusu |
| **check\_bills** | (tenantId, dueDate) WHERE status NOT IN (terminal) | Vade takip sorguları |
| **check\_bills** | (tenantId, checkNo) | Çek numarasına göre arama |
| **check\_bills** | (tenantId, isProtested) WHERE isProtested \= true | Protesto filtreleme |
| **check\_bill\_journals** | (tenantId, date, type) | Bordro listesi sorguları |
| **check\_bill\_logs** | (checkBillId, createdAt) | Audit trail erişimi |
| **check\_bill\_gl\_entries** | (tenantId, accountingDate, fiscalPeriod) | Muhasebe dönem sorgusu |

## **9.2 Önbellek Stratejisi**

| Veri | Önbellek Süresi | Strateji |
| ----- | ----- | ----- |
| **Kur bilgileri** | 15 dakika | Redis – ECB/TCMB API |
| **Portföy özet istatistikleri** | 5 dakika | Redis – event-driven invalidation |
| **Hesap plan kodları** | 24 saat | Redis – konfigürasyon bazlı |
| **Risk limit konfigürasyonu** | 10 dakika | Redis – değişiklikte invalidate |
| **Yaşlandırma raporu** | 30 dakika | Redis – gece yarısı yenile |
| **Nakit akış tahmini** | 1 saat | Redis – vade değişiminde yenile |

## **9.3 Genişletilmiş Dosya Yapısı**

check-bill/  
├── check-bill.module.ts  
├── check-bill.controller.ts  
├── check-bill.service.ts  
├── check-bill-journal.controller.ts  
├── check-bill-journal.service.ts  
**├── check-bill-report.controller.ts        ← YENİ**  
├── reminder-task.service.ts  
├── dto/  
│   ├── create-check-bill.dto.ts  
│   ├── check-bill-transaction.dto.ts  
│   ├── check-bill-filter.dto.ts  
│   ├── collection-action.dto.ts  
│   ├── create-check-bill-journal.dto.ts  
**│   ├── bulk-action.dto.ts                 ← YENİ**  
**│   ├── discount-action.dto.ts             ← YENİ**  
**│   ├── protest-action.dto.ts              ← YENİ**  
**│   └── report-filter.dto.ts               ← YENİ**  
├── handlers/  
│   ├── handler-registry.ts  
│   ├── journal-handler.interface.ts  
│   ├── credit-entry.handler.ts  
│   ├── debit-entry.handler.ts  
│   ├── bank-collection.handler.ts  
│   ├── bank-guarantee.handler.ts  
│   ├── endorsement.handler.ts  
│   ├── collection.handler.ts  
│   ├── return.handler.ts  
**│   ├── discount.handler.ts                ← YENİ**  
**│   ├── protest.handler.ts                 ← YENİ**  
**│   ├── write-off.handler.ts               ← YENİ**  
**│   └── reversal.handler.ts                ← YENİ**  
├── services/  
│   ├── check-bill-log.service.ts  
│   ├── check-bill-collection.service.ts  
**│   ├── gl-integration.service.ts          ← YENİ (KRİTİK)**  
**│   ├── risk-limit.service.ts              ← YENİ**  
**│   ├── bank-submission.service.ts         ← YENİ**  
**│   ├── discounting.service.ts             ← YENİ**  
**│   ├── reconciliation.service.ts          ← YENİ**  
**│   ├── protest-tracking.service.ts        ← YENİ**  
**│   ├── cash-flow.service.ts               ← YENİ**  
**│   ├── reporting.service.ts               ← YENİ**  
**│   ├── approval-workflow.service.ts       ← YENİ**  
**│   ├── currency.service.ts               ← YENİ**  
**│   ├── notification.service.ts            ← YENİ**  
**│   └── document.service.ts               ← YENİ**  
└── utils/  
    ├── status-transition.util.ts  
    **├── gl-account-mapping.util.ts         ← YENİ**  
    **├── risk-calculator.util.ts            ← YENİ**  
    **├── iban-validator.util.ts             ← YENİ**  
    **└── currency-converter.util.ts         ← YENİ**

# **10\. Geliştirme Yol Haritası**

## **10.1 Öncelik Sırası**

| Öncelik | Geliştirme Kalemi | Tahmini Efor | Etki |
| ----- | ----- | ----- | ----- |
| **P0 – Kritik** | GL muhasebe entegrasyonu (gl-integration.service) | 5 gün | Yasal zorunluluk |
| **P0 – Kritik** | Dövizli çek/senet desteği | 3 gün | Dış ticaret müşterileri |
| **P1 – Yüksek** | Risk & limit yönetimi | 4 gün | Kredi riski kontrolü |
| **P1 – Yüksek** | Onay iş akışı motoru | 4 gün | İç kontrol / SOX |
| **P1 – Yüksek** | Banka mutabakatı modülü | 3 gün | Operasyonel verimlilik |
| **P2 – Orta** | İskonto işlemleri | 3 gün | Nakit akış optimizasyonu |
| **P2 – Orta** | Protesto & hukuki takip | 3 gün | Şüpheli alacak yönetimi |
| **P2 – Orta** | Gelişmiş raporlama & dashboard | 5 gün | Yönetim bilgisi |
| **P3 – Düşük** | Banka EFT/API entegrasyonu | 10 gün | Otomasyon |
| **P3 – Düşük** | Mobil bildirimler (push) | 2 gün | Kullanıcı deneyimi |

*Bu döküman otomatik analiz ve kurumsal ERP best-practice'leri temel alınarak oluşturulmuştur.*

Çek/Senet Yönetim Modülü  |  Versiyon 2.0  |  Nisan 2025