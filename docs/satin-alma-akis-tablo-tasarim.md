# Satınalma İş Akışı Backend Tablo Tasarım Raporu

## 1. Tablo İlişkileri Genel Bakış

```
┌─────────────────────┐          ┌──────────────────────┐          ┌─────────────┐
│  PurchaseOrder      │─────────▶│ PurchaseDeliveryNote │─────────▶│   Invoice   │
│ (Satınalma Siparişi)│   1:N    │ (Satınalma İrsaliyesi)│  1:1     │ (Alım Faturası)│
└─────────────────────┘          └──────────────────────┘          └─────────────┘
        │                              │                              │
        │ 1:N                          │ 1:N                          │ 1:N
        ▼                              ▼                              ▼
┌─────────────────────┐          ┌──────────────────────┐          ┌─────────────┐
│ PurchaseOrderItem   │          │PurchaseDeliveryNoteItem│       │ InvoiceItem │
└─────────────────────┘          └──────────────────────┘          └─────────────┘
```

---

## 2. PurchaseOrder (Satınalma Siparişi)

### Tablo Adı: `purchase_orders`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `orderNumber` | String | Sipariş numarası (unique + tenantId) |
| `orderDate` | DateTime | Sipariş tarihi |
| `tenantId` | String? (FK) | Multi-tenancy için |
| `supplierId` | String (FK) | Tedarikçi/Cari hesap |
| `expectedDeliveryDate` | DateTime? | Beklenen teslimat tarihi |
| `status` | OrderStatus | Sipariş durumu |
| `totalAmount` | Decimal(12,2) | Toplam tutar |
| `notes` | String? | Notlar |
| `createdAt` | DateTime | Oluşturulma tarihi |
| `updatedAt` | DateTime | Güncellenme tarihi |

### İlişkiler
- `supplier` → `Account` (N:1)
- `invoices` → `Invoice` (1:1, optional - purchaseOrderId ile)
- `items` → `PurchaseOrderItem[]` (1:N)
- `tenant` → `Tenant` (N:1)

---

## 3. OrderStatus Enum

| Değer | Açıklama |
|-------|----------|
| `PENDING` | Beklemede |
| `PARTIAL` | Kısmen tamamlandı |
| `COMPLETED` | Tamamlandı |
| `CANCELLED` | İptal edildi |

---

## 4. PurchaseOrderItem (Sipariş Kalemi)

### Tablo Adı: `purchase_order_items`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `purchaseOrderId` | String (FK) | Ana sipariş |
| `productId` | String (FK) | Ürün |
| `orderedQuantity` | Int | Sipariş miktarı |
| `receivedQuantity` | Int | Teslim alınan miktar |
| `unitPrice` | Decimal(10,2) | Birim fiyat |
| `status` | OrderItemStatus | Kalemin durumu |
| `createdAt` | DateTime | Oluşturulma tarihi |

### İlişkiler
- `purchaseOrder` → `PurchaseOrder` (N:1, Cascade Delete)
- `product` → `Product` (N:1)
- `invoiceItems` → `InvoiceItem[]` (1:N)

---

## 5. OrderItemStatus Enum

| Değer | Açıklama |
|-------|----------|
| `PENDING` | Beklemede |
| `PARTIAL` | Kısmen teslim alındı |
| `COMPLETED` | Tamamlandı |

---

## 6. PurchaseDeliveryNote (Satınalma İrsaliyesi)

### Tablo Adı: `purchase_delivery_notes`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `deliveryNoteNo` | String | İrsaliye numarası (unique + tenantId) |
| `date` | DateTime | İrsaliye tarihi |
| `tenantId` | String? (FK) | Multi-tenancy |
| `accountId` | String (FK) | Tedarikçi/Cari |
| `warehouseId` | String? (FK) | Depo |
| `sourceType` | DeliveryNoteSourceType | Kaynak türü |
| `sourceId` | String? (FK) | Kaynak sipariş ID |
| `status` | DeliveryNoteStatus | İrsaliye durumu |
| `subtotal` | Decimal(12,2) | Ara toplam |
| `vatAmount` | Decimal(12,2) | KDV tutarı |
| `grandTotal` | Decimal(12,2) | Genel toplam |
| `discount` | Decimal(10,2) | İskonto |
| `notes` | String? | Notlar |
| `createdBy` | String? | Oluşturan kullanıcı |
| `updatedBy` | String? | Güncelleyen kullanıcı |
| `deletedBy` | String? | Silen kullanıcı |
| `deletedAt` | DateTime? | Silinme tarihi |

### İlişkiler
- `account` → `Account` (N:1)
- `warehouse` → `Warehouse` (N:1, optional)
- `sourceOrder` → `ProcurementOrder` (N:1, optional - kaynak sipariş)
- `orderFromDeliveryNote` → `ProcurementOrder` (1:1, optional - siparişe bağlı)
- `invoice` → `Invoice` (1:1, optional - purchaseDeliveryNoteId ile)
- `items` → `PurchaseDeliveryNoteItem[]` (1:N)
- `logs` → `PurchaseDeliveryNoteLog[]` (1:N)
- `tenant` → `Tenant` (N:1)

---

## 7. DeliveryNoteStatus Enum

| Değer | Açıklama |
|-------|----------|
| `NOT_INVOICED` | Fatura edilmedi |
| `INVOICED` | Fatura edildi |
| `TESLIM_EDILDI` | Teslim edildi |
| `BEKLEMEDE` | Beklemede |
| `FATURAYA_BAGLANDI` | Faturaya bağlandı |
| `IPTAL` | İptal |

---

## 8. PurchaseDeliveryNoteItem (İrsaliye Kalemı)

### Tablo Adı: `purchase_delivery_note_items`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `deliveryNoteId` | String (FK) | Ana irsaliye |
| `productId` | String (FK) | Ürün |
| `quantity` | Int | İrsaliye miktarı |
| `unitPrice` | Decimal(10,2) | Birim fiyat |
| `vatRate` | Int | KDV oranı |
| `vatAmount` | Decimal(10,2) | KDV tutarı |
| `totalAmount` | Decimal(12,2) | Satır toplamı |
| `createdAt` | DateTime | Oluşturulma tarihi |
| `updatedAt` | DateTime | Güncellenme tarihi |

### İlişkiler
- `deliveryNote` → `PurchaseDeliveryNote` (N:1, Cascade Delete)
- `product` → `Product` (N:1)

---

## 9. Invoice (Alım Faturası)

### Tablo Adı: `invoices`

**Not:** Satınalma faturaları için `invoiceType = PURCHASE` veya `PURCHASE_RETURN`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `invoiceNo` | String | Fatura numarası |
| `invoiceType` | InvoiceType | PURCHASE / PURCHASE_RETURN |
| `date` | DateTime | Fatura tarihi |
| `dueDate` | DateTime? | Vade tarihi |
| `accountId` | String (FK) | Tedarikçi/Cari hesap |
| `status` | InvoiceStatus | Fatura durumu |
| `totalAmount` | Decimal(12,2) | Ara toplam |
| `vatAmount` | Decimal(12,2) | KDV tutarı |
| `grandTotal` | Decimal(12,2) | Genel toplam |
| `discount` | Decimal(10,2) | İskonto |
| `purchaseOrderId` | String? (FK, Unique) | Bağlı sipariş |
| `purchaseDeliveryNoteId` | String? (FK, Unique) | Bağlı irsaliye |

### İlişkiler (Satınalma için)
- `account` → `Account` (N:1)
- `purchaseOrder` → `PurchaseOrder` (N:1, optional)
- `purchaseDeliveryNote` → `PurchaseDeliveryNote` (N:1, optional)
- `items` → `InvoiceItem[]` (1:N)
- `logs` → `InvoiceLog[]` (1:N)

---

## 10. InvoiceItem (Fatura Kalemı)

### Tablo Adı: `invoice_items`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | UUID (PK) | Benzersiz tanımlayıcı |
| `invoiceId` | String (FK) | Ana fatura |
| `productId` | String (FK) | Ürün |
| `quantity` | Int | Miktar |
| `unitPrice` | Decimal(10,2) | Birim fiyat |
| `vatRate` | Int | KDV oranı |
| `vatAmount` | Decimal(10,2) | KDV tutarı |
| `amount` | Decimal(10,2) | Satır toplamı |
| `purchaseOrderItemId` | String? (FK) | Bağlı sipariş kalemi |
| `withholdingCode` | String? | Tevkifat kodu (GIB) |
| `withholdingRate` | Decimal? | Tevkifat oranı |
| `sctRate` | Decimal? | SCT oranı |
| `sctAmount` | Decimal? | SCT tutarı |

### İlişkiler
- `invoice` → `Invoice` (N:1, Cascade Delete)
- `product` → `Product` (N:1)
- `purchaseOrderItem` → `PurchaseOrderItem` (N:1, optional)

---

## 11. İş Akışı Bağlantı Mantığı

### Sipariş → İrsaliye İlişkisi
1. **PurchaseOrder** → **PurchaseDeliveryNote** (1:N)
   - Bir siparişten birden fazla irsaliye oluşturulabilir
   - `PurchaseDeliveryNote.sourceId` → Kaynak siparişi gösterir

2. **ProcurementOrder.deliveryNoteId** → **PurchaseDeliveryNote** (1:1)
   - Yerel sipariş tek bir irsaliyeye bağlanabilir

### İrsaliye → Fatura İlişkisi
1. **PurchaseDeliveryNote** → **Invoice** (1:1)
   - `Invoice.purchaseDeliveryNoteId` (Unique)
   - Bir irsaliyeden tek bir fatura oluşturulur

2. **PurchaseOrder** → **Invoice** (1:1)
   - `Invoice.purchaseOrderId` (Unique)
   - Bir siparişten tek bir fatura oluşturulabilir

### Sipariş Kalemı → Fatura Kalemı İlişkisi
- **PurchaseOrderItem** → **InvoiceItem[]** (1:N)
  - `InvoiceItem.purchaseOrderItemId`
  - Bir sipariş kalemi birden fazla fatura kalemine bağlanabilir (kısmi faturalandırma)

---

## 12. Durum (Status) Etkileşimi

| PurchaseOrder Status | PurchaseDeliveryNote Status | Invoice Status |
|---------------------|----------------------------|----------------|
| COMPLETED | TESLIM_EDILDI | - |
| COMPLETED | INVOICED | OPEN |
| - | INVOICED | OPEN / PAID |

---

## 13. ER Diyagramı (Prisma Relation Summary)

```prisma
PurchaseOrder {
  supplierId          → Account (N:1)
  invoices            → Invoice (1:1, optional, via purchaseOrderId)
  items[]             → PurchaseOrderItem (1:N)
  tenant              → Tenant (N:1)
}

PurchaseOrderItem {
  purchaseOrderId     → PurchaseOrder (N:1, cascade)
  productId           → Product (N:1)
  invoiceItems[]      → InvoiceItem (1:N)
}

PurchaseDeliveryNote {
  accountId           → Account (N:1)
  warehouseId         → Warehouse (N:1, optional)
  sourceId            → ProcurementOrder (N:1, optional)
  invoice             → Invoice (1:1, optional, via purchaseDeliveryNoteId)
  items[]             → PurchaseDeliveryNoteItem (1:N)
  logs[]              → PurchaseDeliveryNoteLog (1:N)
  tenant              → Tenant (N:1)
}

PurchaseDeliveryNoteItem {
  deliveryNoteId      → PurchaseDeliveryNote (N:1, cascade)
  productId           → Product (N:1)
}

Invoice (PURCHASE type) {
  invoiceType         PURCHASE / PURCHASE_RETURN
  accountId           → Account (N:1)
  purchaseOrderId     → PurchaseOrder (N:1, optional, unique)
  purchaseDeliveryNoteId → PurchaseDeliveryNote (N:1, optional, unique)
  items[]             → InvoiceItem (1:N)
}

InvoiceItem {
  invoiceId           → Invoice (N:1, cascade)
  productId           → Product (N:1)
  purchaseOrderItemId → PurchaseOrderItem (N:1, optional)
}
```

---

## 14. İlgili Servis Dosyaları

| Modül | Dosya Yolu |
|-------|------------|
| Satınalma Sipariş | `api-stage/server/src/modules/purchase-orders/purchase-orders.service.ts` |
| Satınalma İrsaliye | `api-stage/server/src/modules/purchase-waybill/purchase-waybill.service.ts` |
| Alım Faturası | `api-stage/server/src/modules/invoice/invoice.service.ts` |

---

## 15. Satış vs Satınalma Karşılaştırması

| Özellik | Satış (Sales) | Satınalma (Purchase) |
|---------|---------------|---------------------|
| Sipariş Tablosu | `SalesOrder` | `PurchaseOrder` / `ProcurementOrder` |
| İrsaliye Tablosu | `SalesDeliveryNote` | `PurchaseDeliveryNote` |
| Fatura Tipi | `SALE` / `SALES_RETURN` | `PURCHASE` / `PURCHASE_RETURN` |
| Cari Hesap | Müşteri (Customer) | Tedarikçi (Supplier) |
| Stok Hareketi | Çıkış (Output) | Giriş (Input) |
| Sipariş-İrsaliye | 1:N (birden fazla irsaliye) | 1:N (birden fazla irsaliye) |
| İrsaliye-Fatura | 1:N (kısmi faturalandırma) | 1:1 (tek fatura) |

---

## 16. Multi-Tenancy Notu

Tüm tablolarda `tenantId` alanı bulunur ve Prisma sorgularında `where: { tenantId }` filtresi zorunludur. TenantMiddleware otomatik olarak tenant ID'yi request'ten çeker ve sorgulara ekler.
