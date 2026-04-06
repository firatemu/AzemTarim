# Purchase Workflow — Backend Architecture & Implementation Prompt
> Enterprise Purchase Order → Delivery Note → Invoice Pipeline  
> Version 2.0 | NestJS + Prisma + PostgreSQL | Multi-Tenant

---

## 1. Context & Current State

This document provides a complete AI implementation prompt for upgrading the existing **purchase workflow** system. The current backend has three core modules — `PurchaseOrder`, `PurchaseDeliveryNote`, and `Invoice (PURCHASE type)` — that are structurally linked but lack automated status propagation and cross-referencing.

### Key Differences from Sales Workflow

| Feature | Sales | Purchase |
|---|---|---|
| Delivery Note → Invoice | 1:N (partial invoicing) | **1:1 (one invoice per delivery note)** |
| Stock Movement | Output (çıkış) | **Input (giriş)** |
| Counter-party | Customer | **Supplier** |
| Quantity tracking field | `deliveredQuantity` | **`receivedQuantity`** |
| Item-level status | — | **`OrderItemStatus` per item** |

---

## 2. Architectural Decisions

### 2.1 Enum Standardization

All enums are normalized to English. Existing Turkish values (`TESLIM_EDILDI`, `BEKLEMEDE`, `FATURAYA_BAGLANDI`, `IPTAL`) are replaced. Use Prisma `@map()` to maintain backward compatibility.

#### PurchaseOrder Status (OrderStatus)

| Value | Description |
|---|---|
| `PENDING` | Order placed, no items received yet |
| `PARTIAL` | Some items received, rest pending |
| `COMPLETED` | All items fully received |
| `CANCELLED` | Order cancelled |

#### DeliveryNoteStatus (Purchase)

| Value | Description | Change |
|---|---|---|
| `NOT_INVOICED` | Delivery received, no invoice yet | Keep |
| `INVOICED` | Invoice created for this delivery note | Keep |
| `CANCELLED` | Delivery note cancelled | **NEW — replaces IPTAL** |

> Note: `TESLIM_EDILDI`, `BEKLEMEDE`, `FATURAYA_BAGLANDI` are removed entirely.  
> Since purchase delivery note → invoice is **1:1**, there is no `PARTIALLY_INVOICED` state.

#### OrderItemStatus (PurchaseOrderItem)

| Value | Description |
|---|---|
| `PENDING` | No quantity received yet |
| `PARTIAL` | Some quantity received |
| `COMPLETED` | Full quantity received |

#### InvoiceStatus

| Value | Description |
|---|---|
| `OPEN` | Invoice created, not yet paid |
| `PARTIALLY_PAID` | Partial payment received |
| `PAID` | Fully paid |
| `CANCELLED` | Invoice cancelled |

---

### 2.2 Status Propagation Rules

Status fields are **never set manually** by the caller — always computed by `PurchaseStatusCalculatorService` after a write operation.

**Propagation chain:**
```
Delivery Note saved → recalculate PurchaseOrder status
Invoice saved      → recalculate DeliveryNote status → recalculate PurchaseOrder status
```

#### PurchaseOrder Status Calculation Logic
- Inputs: all `PurchaseOrderItems` (orderedQuantity vs receivedQuantity)
- If all items cancelled → `CANCELLED`
- If `receivedQuantity = 0` for all items → `PENDING`
- If `receivedQuantity >= orderedQuantity` for all items → `COMPLETED`
- If any item has `0 < receivedQuantity < orderedQuantity` → `PARTIAL`

#### PurchaseOrderItem Status Calculation Logic
- Recalculated per item after each delivery note save
- `receivedQuantity = 0` → `PENDING`
- `0 < receivedQuantity < orderedQuantity` → `PARTIAL`
- `receivedQuantity >= orderedQuantity` → `COMPLETED`

#### DeliveryNote Status Calculation Logic
- Since delivery note → invoice is **1:1**:
- No linked invoice → `NOT_INVOICED`
- Invoice exists and is not cancelled → `INVOICED`
- Invoice cancelled or delivery note cancelled → `CANCELLED`

---

### 2.3 Status Transition Matrix

| Scenario | PurchaseOrder | DeliveryNote | Invoice |
|---|---|---|---|
| Order created, nothing received | `PENDING` | — | — |
| Partial delivery received | `PARTIAL` | `NOT_INVOICED` | — |
| Full delivery received | `COMPLETED` | `NOT_INVOICED` | — |
| Invoice created for delivery note | `COMPLETED` | `INVOICED` | `OPEN` |
| Invoice cancelled | `COMPLETED` | `NOT_INVOICED` | `CANCELLED` |
| Order/delivery cancelled | `CANCELLED` | `CANCELLED` | `CANCELLED` |

---

### 2.4 New Fields & Schema Changes

| Table | Field | Type | Notes |
|---|---|---|---|
| `purchase_orders` | `status` | `OrderStatus` | Auto-computed by service |
| `purchase_delivery_notes` | `status` | `DeliveryNoteStatus` | Auto-computed by service |
| `purchase_delivery_notes` | `orderNo` | `String?` | Denormalized from source order |
| `purchase_delivery_notes` | `invoiceNo` | `String?` | Set when invoice is created |
| `invoices` | `purchaseOrderNo` | `String?` | Denormalized from source order |
| `invoices` | `deliveryNoteNo` | `String?` | Denormalized from linked delivery note |

> All reference fields are **denormalized** — set at creation time, never recalculated.

---

### 2.5 Service Responsibility Boundaries

| Service | Responsibility |
|---|---|
| `purchase-orders.service.ts` | After save/update: call `recalculateOrderStatus(orderId, tenantId)` |
| `purchase-waybill.service.ts` | After save: update `receivedQuantity` on order items, call `recalculateOrderStatus`, also update item-level statuses |
| `invoice.service.ts` (PURCHASE) | After save: call `recalculateDeliveryNoteStatus(deliveryNoteId, tenantId)`, then cascade to order |
| `PurchaseStatusCalculatorService` | Central service: pure calculation logic, no business logic in other services |

---

## 3. Full AI Implementation Prompt

> Copy everything from **PROMPT START** to **PROMPT END** into your AI coding assistant (Cursor, Claude, ChatGPT). It is fully self-contained.

---

### ━━━ PROMPT START ━━━

---

### ROLE

You are a senior NestJS backend engineer working on a multi-tenant ERP system. The stack is NestJS + Prisma ORM + PostgreSQL. You write clean, typed, testable TypeScript. You never put business logic inside Prisma queries — that belongs in service methods. You follow the single-responsibility principle strictly.

---

### OBJECTIVE

Upgrade the existing **Purchase Workflow** backend to implement automated status propagation across `PurchaseOrder`, `PurchaseDeliveryNote`, and `Invoice (PURCHASE type)`. Add cross-referencing fields so that from any document the linked documents are immediately visible without extra queries. Standardize all enums to English.

> **Critical constraint:** Purchase delivery note → invoice is a **1:1 relationship** (one invoice per delivery note). Do NOT implement partial invoicing for the purchase side. This is different from the sales workflow.

---

### CURRENT SYSTEM SUMMARY

Three core modules exist with the following structure:

- `purchase_orders` — has `OrderStatus`, linked to `PurchaseOrderItem[]`
- `purchase_order_items` — has `orderedQuantity`, `receivedQuantity`, `OrderItemStatus`
- `purchase_delivery_notes` — has `DeliveryNoteStatus`, linked to source order via `sourceId`
- `purchase_delivery_note_items` — has `quantity` (received in this shipment)
- `invoices` (PURCHASE type) — linked via `purchaseDeliveryNoteId` (Unique) and `purchaseOrderId` (Unique)
- `invoice_items` — has `purchaseOrderItemId` to link back to the order item

Service files:
- `api-stage/server/src/modules/purchase-orders/purchase-orders.service.ts`
- `api-stage/server/src/modules/purchase-waybill/purchase-waybill.service.ts`
- `api-stage/server/src/modules/invoice/invoice.service.ts`

All tables have `tenantId` and every Prisma query must include `where: { tenantId }`.

---

### TASK 1 — Enum Migration

Update the Prisma schema and generate a migration:

- **`OrderStatus`** (for `PurchaseOrder`): ensure values are `PENDING`, `PARTIAL`, `COMPLETED`, `CANCELLED` — these already exist, confirm no changes needed
- **`OrderItemStatus`** (for `PurchaseOrderItem`): ensure values are `PENDING`, `PARTIAL`, `COMPLETED`
- **`DeliveryNoteStatus`** (for `PurchaseDeliveryNote`): remove Turkish values `TESLIM_EDILDI`, `BEKLEMEDE`, `FATURAYA_BAGLANDI`, `IPTAL`; replace with clean set: `NOT_INVOICED`, `INVOICED`, `CANCELLED`
- **`InvoiceStatus`**: ensure values are `OPEN`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`
- Use `@map()` on any renamed values to avoid data loss on existing rows
- Generate migration: `npx prisma migrate dev --name purchase_workflow_status_v2`

---

### TASK 2 — Schema: New Cross-Reference Fields

Add the following fields to the Prisma schema:

**On `PurchaseDeliveryNote` model:**
```prisma
orderNo    String?  // denormalized from source PurchaseOrder.orderNumber
invoiceNo  String?  // set when invoice is created, null until then
```

**On `Invoice` model (PURCHASE type only — add as nullable, shared table):**
```prisma
purchaseOrderNo    String?  // denormalized from linked purchase order
deliveryNoteNo     String?  // denormalized from linked purchase delivery note
```

These are denormalized audit-trail reference fields. Set them at creation time. Do not recalculate them after the fact.

---

### TASK 3 — Create PurchaseStatusCalculatorService

Create a new shared service at:
```
src/modules/shared/purchase-status-calculator/purchase-status-calculator.service.ts
```

This service must:
- Be decorated with `@Injectable()` and exported from `SharedModule`
- Inject `PrismaService`
- Expose the following public methods:

```typescript
/**
 * Recalculates and persists PurchaseOrder.status based on receivedQuantity
 * across all PurchaseOrderItems.
 */
async recalculateOrderStatus(orderId: string, tenantId: string): Promise<void>

/**
 * Recalculates and persists each PurchaseOrderItem.status based on
 * receivedQuantity vs orderedQuantity.
 */
async recalculateOrderItemStatuses(orderId: string, tenantId: string): Promise<void>

/**
 * Recalculates and persists PurchaseDeliveryNote.status based on
 * whether a non-cancelled invoice exists for this delivery note.
 */
async recalculateDeliveryNoteStatus(deliveryNoteId: string, tenantId: string): Promise<void>

/**
 * Convenience method: recalculates delivery note status, then
 * cascades to recalculate the source order status.
 */
async recalculateCascade(deliveryNoteId: string, tenantId: string): Promise<void>
```

**`recalculateOrderStatus` logic:**
- Fetch all `PurchaseOrderItems` for the order where `tenantId` matches
- If no items → set `PENDING`
- If all items have `receivedQuantity = 0` → `PENDING`
- If all items have `receivedQuantity >= orderedQuantity` → `COMPLETED`
- If any item has `0 < receivedQuantity < orderedQuantity` → `PARTIAL`
- Use `prisma.purchaseOrder.update({ where: { id: orderId, tenantId }, data: { status } })`

**`recalculateOrderItemStatuses` logic:**
- Fetch all items for the order
- For each item: `receivedQuantity = 0` → `PENDING`; `0 < received < ordered` → `PARTIAL`; `received >= ordered` → `COMPLETED`
- Update all items in a `prisma.$transaction([...])`

**`recalculateDeliveryNoteStatus` logic:**
- Check if a non-cancelled invoice exists: `prisma.invoice.findFirst({ where: { purchaseDeliveryNoteId: deliveryNoteId, tenantId, status: { not: 'CANCELLED' } } })`
- Invoice found → `INVOICED`
- No invoice found → `NOT_INVOICED`
- Update with `prisma.purchaseDeliveryNote.update({ where: { id: deliveryNoteId, tenantId }, data: { status } })`

---

### TASK 4 — Hook PurchaseStatusCalculatorService into Existing Services

Inject `PurchaseStatusCalculatorService` into the three services and call it after every write operation:

**In `purchase-orders.service.ts`:**
- After `createOrder()` → call `recalculateOrderStatus(newOrder.id, tenantId)`
- After `updateOrder()` → call `recalculateOrderStatus(orderId, tenantId)`
- After `cancelOrder()` → set `status: CANCELLED` directly via Prisma, do not use calculator
- Add `// CHANGED: createOrder, updateOrder, cancelOrder` at the top of the file

**In `purchase-waybill.service.ts`:**
- After `createDeliveryNote()`:
  1. For each item in the delivery note, increment `PurchaseOrderItem.receivedQuantity` by the delivered quantity using `prisma.$transaction`
  2. Call `recalculateOrderItemStatuses(sourceOrderId, tenantId)`
  3. Call `recalculateOrderStatus(sourceOrderId, tenantId)`
  4. If `sourceId` is set, also populate `orderNo` on the delivery note from `PurchaseOrder.orderNumber`
- After `updateDeliveryNote()` → apply same cascade (reverse previous quantities, apply new quantities, recalculate)
- After `cancelDeliveryNote()` → reverse `receivedQuantity` increments, then recalculate order status; set delivery note `status: CANCELLED` directly
- Add `// CHANGED: createDeliveryNote, updateDeliveryNote, cancelDeliveryNote` at the top

**In `invoice.service.ts` (PURCHASE type paths only):**
- After `createInvoice()` with `invoiceType = PURCHASE`:
  1. Set `purchaseOrderNo` and `deliveryNoteNo` on the new invoice record (fetch from linked delivery note and its source order)
  2. Set `invoiceNo` on the linked `PurchaseDeliveryNote` record
  3. Call `recalculateCascade(deliveryNoteId, tenantId)`
- After `cancelInvoice()` for PURCHASE type:
  1. Clear `invoiceNo` on the linked `PurchaseDeliveryNote` (set to null)
  2. Call `recalculateCascade(deliveryNoteId, tenantId)`
- Do not touch SALE type invoice paths
- Add `// CHANGED: createInvoice (PURCHASE branch), cancelInvoice (PURCHASE branch)` at the top

---

### TASK 5 — Update API Response DTOs

Add the following fields to response DTOs and their `@ApiProperty()` Swagger decorators:

**`PurchaseOrderResponseDto`:**
- Add: `deliveryNoteNos: string[]` — list of delivery note numbers linked to this order
- Add: `invoiceNo: string | null` — invoice number if one exists (via delivery note)

**`PurchaseDeliveryNoteResponseDto`:**
- Add: `orderNo: string | null` — from denormalized field
- Add: `invoiceNo: string | null` — from denormalized field

**`InvoiceResponseDto` (PURCHASE type):**
- Add: `purchaseOrderNo: string | null`
- Add: `deliveryNoteNo: string | null`

> Do not add nested objects. Only reference number strings. The frontend detail panels will use these to render linked document chips.

---

### TASK 6 — Inventory: Stock Entry on Delivery Note Creation

When a `PurchaseDeliveryNote` is created with items, the system must create stock entry movements:

- For each `PurchaseDeliveryNoteItem`, create a `ProductMovement` record of type `PURCHASE_IN` (or equivalent stock-in type used in your system)
- Movement fields: `productId`, `quantity`, `warehouseId` (from delivery note), `tenantId`, `referenceId` (delivery note id), `referenceType: 'PURCHASE_DELIVERY_NOTE'`
- If the delivery note is **cancelled**, reverse the movements (create negative movements or soft-delete existing ones — use whichever pattern is already established in the codebase)
- Wrap delivery note creation + movement creation in a single `prisma.$transaction`

> Check the existing `ProductMovement` model and movement type enum in the codebase before implementing. Match the existing pattern exactly.

---

### CONSTRAINTS & RULES

- Every Prisma query must include `tenantId` in the `where` clause
- `PurchaseStatusCalculatorService` must never throw silently — wrap in `try/catch`, log the error with `Logger`, then rethrow as `InternalServerErrorException`
- Do **not** use database triggers or Prisma middleware for status updates — keep all logic in the service layer
- Purchase delivery note → invoice is **strictly 1:1** — do not implement partial invoicing, do not add `invoicedQuantity` to delivery note items
- All new service methods must be `async` and return typed `Promise<void>` or `Promise<T>`
- Use `prisma.$transaction([...])` when multiple table updates happen in a single operation
- Write JSDoc comments on every public method in `PurchaseStatusCalculatorService`
- Do not change existing API route paths — only extend response payloads
- Do not modify SALE type invoice logic when editing `invoice.service.ts` — use `if (invoice.invoiceType === InvoiceType.PURCHASE)` guards

---

### DELIVERABLES

Produce the following files in order:

1. Updated `schema.prisma` — enum changes and new fields
2. Migration command or SQL: `npx prisma migrate dev --name purchase_workflow_status_v2`
3. `src/modules/shared/purchase-status-calculator/purchase-status-calculator.service.ts` — full implementation
4. Updated `src/modules/shared/shared.module.ts` — exports `PurchaseStatusCalculatorService`
5. Updated `purchase-orders.service.ts` — changed methods only, with `// CHANGED:` header comment
6. Updated `purchase-waybill.service.ts` — changed methods only, with `// CHANGED:` header comment
7. Updated `invoice.service.ts` — PURCHASE type branches only, with `// CHANGED:` header comment
8. Updated DTO files for all three modules

> For each service file, add a diff-style comment block at the top:  
> `// CHANGED: methodName1, methodName2`  
> `// REASON: purchase workflow status automation v2`

---

### ━━━ PROMPT END ━━━

---

## 4. Usage Tips

- Paste the full prompt into a **new conversation** — do not split across turns
- If the output is too long, add **"Complete TASK 1 only"** at the end and proceed task by task
- Before pasting: open these files in your editor context window:
  - `schema.prisma`
  - `purchase-orders.service.ts`
  - `purchase-waybill.service.ts`
  - `invoice.service.ts`
- After receiving `PurchaseStatusCalculatorService`, **unit test it in isolation** before integrating into the other services
- Verify `@map()` values in the migration against your actual database enum values before running `prisma migrate`
- The `ProductMovement` task (Task 6) depends on your existing movement model — check the model first and share it with the AI if the pattern is unclear

---

## 5. Key Difference Summary vs Sales Workflow Prompt

| Decision Point | Sales Prompt | This Prompt (Purchase) |
|---|---|---|
| Delivery Note → Invoice | 1:N partial invoicing | **1:1 strict** |
| `invoicedQuantity` on note items | Yes | **No** |
| `PARTIALLY_INVOICED` status | Yes | **No** |
| Item-level status tracking | No | **Yes (`OrderItemStatus`)** |
| Stock movement direction | Output (SALE_OUT) | **Input (PURCHASE_IN)** |
| Calculator service name | `StatusCalculatorService` | **`PurchaseStatusCalculatorService`** |
| Cascade trigger field | `deliveredQuantity` | **`receivedQuantity`** |

---

## 6. File Reference

| Module | Path |
|---|---|
| Purchase Order Service | `api-stage/server/src/modules/purchase-orders/purchase-orders.service.ts` |
| Purchase Delivery Note Service | `api-stage/server/src/modules/purchase-waybill/purchase-waybill.service.ts` |
| Invoice Service (shared) | `api-stage/server/src/modules/invoice/invoice.service.ts` |
| New Calculator Service | `api-stage/server/src/modules/shared/purchase-status-calculator/purchase-status-calculator.service.ts` |
