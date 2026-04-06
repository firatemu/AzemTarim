**Sales Workflow — Backend Architecture & Implementation Prompt**

Enterprise Sales Order → Delivery Note → Invoice Pipeline

Version 2.0  |  NestJS \+ Prisma \+ PostgreSQL  |  Multi-Tenant

# **1\. Context & Current State**

This document defines the architectural decisions and provides a complete AI implementation prompt for upgrading the existing sales workflow system. The current backend has three core modules — SalesOrder, SalesDeliveryNote, and Invoice — that are structurally linked but lack automated status propagation and cross-referencing.

The goal is to implement a fully automated, event-driven status pipeline where:

* Creating a delivery note from an order automatically recalculates the order status  
* Creating an invoice from a delivery note automatically recalculates the delivery note status  
* All status transitions are handled by a centralized StatusCalculatorService  
* Cross-references (order number, delivery note number, invoice number) are visible in all three detail views

# **2\. Architectural Decisions**

## **2.1 Enum Standardization**

All enums are normalized to English. The existing Turkish values (TESLIM\_EDILDI, BEKLEMEDE, FATURAYA\_BAGLANDI) are replaced with consistent English equivalents. A Prisma migration with @map() will be used to maintain backward compatibility without data loss.

| Enum | Value | Description |
| :---- | :---- | :---- |
| **SalesOrderStatus** | PENDING | Order placed, no action yet |
|  | PREPARING | Being prepared in warehouse |
|  | PARTIALLY\_SHIPPED | Some items shipped, rest pending |
|  | **COMPLETED** | NEW — All items fully shipped |
|  | INVOICED | At least one invoice generated |
|  | CANCELLED | Order cancelled |
| **DeliveryNoteStatus** | NOT\_INVOICED | Delivery done, no invoice yet |
|  | **PARTIALLY\_INVOICED** | NEW — Some items invoiced, rest pending |
|  | INVOICED | All items fully invoiced |
|  | CANCELLED | Delivery note cancelled |
| **InvoiceStatus** | OPEN | Invoice created, not yet collected |
|  | PARTIALLY\_COLLECTED | Partial payment received |
|  | COLLECTED | Fully paid |
|  | CANCELLED | Invoice cancelled |

## **2.2 Status Propagation Rules**

Status fields are never set manually by the caller — they are always computed by StatusCalculatorService after a write operation. The propagation chain is:

Invoice saved  →  recalculate DeliveryNote status  →  recalculate SalesOrder status

### **SalesOrder Status Calculation Logic**

Inputs: all SalesOrderItems (quantity vs deliveredQuantity)

* If all items cancelled → CANCELLED  
* If deliveredQuantity \= 0 for all items → PENDING  
* If deliveredQuantity \>= quantity for all items → COMPLETED  
* If deliveredQuantity \> 0 but \< quantity for any item → PARTIALLY\_SHIPPED  
* If at least one invoice exists → INVOICED (overrides COMPLETED)

### **DeliveryNote Status Calculation Logic**

Inputs: all SalesDeliveryNoteItems (quantity vs invoicedQuantity) and linked invoices

* If cancelled → CANCELLED  
* If no invoices exist → NOT\_INVOICED  
* If invoicedQuantity \>= quantity for all items → INVOICED  
* If invoicedQuantity \> 0 but \< quantity for any item → PARTIALLY\_INVOICED

## **2.3 Status Transition Matrix**

| Scenario | SalesOrder Status | DeliveryNote Status | Invoice Status |
| :---- | :---- | :---- | :---- |
| Order created, no shipment | PENDING | — | — |
| Partial shipment done | PARTIALLY\_SHIPPED | NOT\_INVOICED | — |
| Full shipment done | COMPLETED | NOT\_INVOICED | — |
| Partial invoice on delivery note | COMPLETED | PARTIALLY\_INVOICED | OPEN |
| Fully invoiced | COMPLETED | INVOICED | OPEN |
| Cancelled | CANCELLED | CANCELLED | CANCELLED |

## **2.4 New Fields & Schema Changes**

| Table | Field | Type | Auto-computed by StatusCalculatorService |
| :---- | :---- | :---- | :---- |
| **sales\_orders** | status | SalesOrderStatus | Recalculated after each delivery note save/update |
| **sales\_delivery\_notes** | status | DeliveryNoteStatus | Recalculated after each invoice save/update |
| **invoices** | orderNo | String? (ref) | Denormalized from linked delivery note \> source order |
| **invoices** | deliveryNoteNo | String? (ref) | Denormalized from linked delivery note number |

Note: orderNo and deliveryNoteNo on Invoice are denormalized reference fields. They are set at invoice creation time and are not recalculated. This avoids join-heavy queries on list views.

## **2.5 Service Responsibility Boundaries**

| Service | Responsibility |
| :---- | :---- |
| **order.service.ts** | On save/update: call StatusCalculatorService.recalculateOrderStatus(orderId) |
| **sales-waybill.service.ts** | On save/update: call recalculateDeliveryNoteStatus(noteId) and then recalculateOrderStatus(sourceOrderId) |
| **invoice.service.ts** | On save/update: call recalculateDeliveryNoteStatus(deliveryNoteId), then cascade to order |
| **StatusCalculatorService** | Central service: pure calculation logic, no direct DB mutations in other services |

# **3\. Full AI Implementation Prompt**

Copy the prompt below in its entirety into your AI coding assistant (Cursor, Claude, ChatGPT, etc.). It is self-contained and includes all context needed.

**━━━ PROMPT START ━━━**

## **ROLE**

You are a senior NestJS backend engineer working on a multi-tenant ERP system. The stack is NestJS \+ Prisma ORM \+ PostgreSQL. You write clean, typed, testable TypeScript. You never put business logic inside Prisma queries — that belongs in service methods. You follow the single-responsibility principle strictly.

## **OBJECTIVE**

Upgrade the existing Sales Workflow backend to implement automated status propagation across SalesOrder, SalesDeliveryNote, and Invoice. Add partial invoicing support for delivery notes. Add cross-referencing fields so that from any document (order, delivery note, invoice) the linked documents are immediately visible without extra queries.

## **CURRENT SYSTEM SUMMARY**

Three core tables exist with the following relationships:

* sales\_orders → 1:N → sales\_delivery\_notes (via sourceId on delivery note)  
* sales\_delivery\_notes → 1:N → invoices (via deliveryNoteId on invoice)  
* sales\_order\_items has: quantity (ordered), deliveredQuantity (shipped so far)  
* sales\_delivery\_note\_items has: quantity (shipped), invoicedQuantity (invoiced so far)  
* Service files: order.service.ts, sales-waybill.service.ts, invoice.service.ts  
* All tables have tenantId and must be filtered by it in every query

## **TASK 1 — Enum Migration**

Update the Prisma schema and generate a migration:

* Replace SalesOrderStatus enum: remove SHIPPED, add COMPLETED  
* Replace DeliveryNoteStatus enum: remove all Turkish values (TESLIM\_EDILDI, BEKLEMEDE, FATURAYA\_BAGLANDI), replace with: NOT\_INVOICED, PARTIALLY\_INVOICED, INVOICED, CANCELLED  
* Keep InvoiceStatus as-is but ensure values are: OPEN, PARTIALLY\_COLLECTED, COLLECTED, CANCELLED  
* Use Prisma @map() where needed to avoid breaking existing DB data  
* Generate the migration file with: npx prisma migrate dev \--name sales\_workflow\_status\_v2

## **TASK 2 — Schema: New Cross-Reference Fields**

Add the following fields to the Prisma schema:

**On Invoice model:**

orderNo       String?  // denormalized from source order

deliveryNoteNo String? // denormalized from linked delivery note

**On SalesDeliveryNote model:**

orderNo       String?  // denormalized from source order

invoiceNos    String\[\] // array of invoice numbers generated from this note

These are denormalized reference fields. Set them at creation time. Do not recalculate them — they are audit trail references.

## **TASK 3 — Create StatusCalculatorService**

Create a new shared service at:

src/modules/shared/status-calculator/status-calculator.service.ts

This service must:

* Be decorated with @Injectable() and registered in a SharedModule  
* Inject PrismaService  
* **Expose three public methods:**  
* recalculateOrderStatus(orderId: string, tenantId: string): Promise\<void\>  
* recalculateDeliveryNoteStatus(deliveryNoteId: string, tenantId: string): Promise\<void\>  
* recalculateCascade(deliveryNoteId: string, tenantId: string): Promise\<void\> — calls both in order

**recalculateOrderStatus logic:**

* Fetch all SalesOrderItems for the order  
* If none exist → set PENDING  
* If all items have deliveredQuantity \= 0 → PENDING  
* If all items have deliveredQuantity \>= quantity → COMPLETED  
* If any item has 0 \< deliveredQuantity \< quantity → PARTIALLY\_SHIPPED  
* After determining shipment status: if any invoice exists for this order → upgrade to INVOICED  
* Use prisma.salesOrder.update({ where: { id, tenantId }, data: { status } })

**recalculateDeliveryNoteStatus logic:**

* Fetch all SalesDeliveryNoteItems for the delivery note  
* Fetch count of invoices linked to this delivery note  
* If no invoices → NOT\_INVOICED  
* If all items have invoicedQuantity \>= quantity → INVOICED  
* If any item has 0 \< invoicedQuantity \< quantity → PARTIALLY\_INVOICED  
* Use prisma.salesDeliveryNote.update({ where: { id, tenantId }, data: { status } })

## **TASK 4 — Hook StatusCalculatorService into Existing Services**

Inject StatusCalculatorService into the three existing services and call it after every write operation:

**In order.service.ts:**

* After createOrder() → call recalculateOrderStatus(newOrder.id, tenantId)  
* After updateOrder() → call recalculateOrderStatus(orderId, tenantId)  
* After cancelOrder() → set status CANCELLED directly, do not use calculator

**In sales-waybill.service.ts:**

* After createDeliveryNote() → update deliveredQuantity on SalesOrderItems for the source order, then call recalculateOrderStatus(sourceOrderId, tenantId)  
* After updateDeliveryNote() → same cascade  
* When setting sourceId on a delivery note, also set orderNo from the source order

**In invoice.service.ts:**

* After createInvoice() → update invoicedQuantity on SalesDeliveryNoteItems, then call recalculateCascade(deliveryNoteId, tenantId)  
* After createInvoice() → set orderNo and deliveryNoteNo fields on the new Invoice record  
* After cancelInvoice() → reverse invoicedQuantity updates, then call recalculateCascade(deliveryNoteId, tenantId)

## **TASK 5 — Update API Response DTOs**

Ensure the following fields are included in response DTOs and Swagger decorators:

**SalesOrderResponseDto:**

* Add: deliveryNoteNos: string\[\] (list of delivery note numbers linked to this order)  
* Add: invoiceNos: string\[\] (list of invoice numbers linked to this order, via delivery notes)

**SalesDeliveryNoteResponseDto:**

* Add: orderNo: string | null  
* Add: invoiceNos: string\[\] (from the invoiceNos denormalized array field)

**InvoiceResponseDto:**

* Add: orderNo: string | null  
* Add: deliveryNoteNo: string | null

Do not add nested objects — only the reference numbers. The frontend detail panels will use these to render linked document chips.

## **TASK 6 — Partial Invoicing Support**

The system must support creating multiple invoices from a single delivery note (partial invoicing). Implement the following:

* When creating an invoice from a delivery note, accept a payload that specifies per-item invoiced quantities (not necessarily all items at full quantity)  
* Update SalesDeliveryNoteItem.invoicedQuantity by adding the new invoice's quantities (not replacing)  
* Validate: invoicedQuantity cannot exceed quantity for any item — throw a BadRequestException if it does  
* After each invoice creation, append the new invoiceNo to the SalesDeliveryNote.invoiceNos array field  
* Run recalculateCascade() after each partial invoice creation

## **CONSTRAINTS & RULES**

* Every Prisma query must include tenantId in the where clause  
* StatusCalculatorService must never throw — wrap in try/catch and log errors, then rethrow as InternalServerErrorException  
* Do not use database triggers or Prisma middleware for status updates — keep logic in the service layer  
* All new service methods must be async and return typed Promises  
* Write JSDoc comments on every public method in StatusCalculatorService  
* Do not change existing API route paths — only extend response payloads  
* Use Prisma transactions (prisma.$transaction) when multiple tables are updated in a single operation

## **DELIVERABLES**

Produce the following in order:

* Updated schema.prisma with enum changes and new fields  
* Migration SQL file (or the npx command to generate it)  
* src/modules/shared/status-calculator/status-calculator.service.ts (full implementation)  
* src/modules/shared/shared.module.ts (updated to export StatusCalculatorService)  
* Updated order.service.ts (only the changed methods, clearly marked)  
* Updated sales-waybill.service.ts (only the changed methods)  
* Updated invoice.service.ts (only the changed methods)  
* Updated DTO files for all three modules

For each changed service file, provide a diff-style comment at the top: // CHANGED: list of changed methods

**━━━ PROMPT END ━━━**

# **4\. Usage Tips**

When using this prompt with an AI assistant:

* Paste the full prompt above into a new conversation — do not split it across turns  
* If the AI produces schema.prisma, verify enum @map() values against your current database before running the migration  
* Ask for one TASK at a time if the output is too long: add 'Complete TASK 1 only' at the end  
* After receiving StatusCalculatorService, test it independently before integrating into the other services  
* For Cursor users: open all three service files \+ schema.prisma in the context window before pasting the prompt

# **5\. File Reference**

* Order service: api-stage/server/src/modules/order/order.service.ts  
* Delivery note service: api-stage/server/src/modules/sales-waybill/sales-waybill.service.ts  
* Invoice service: api-stage/server/src/modules/invoice/invoice.service.ts  
* Target new file: api-stage/server/src/modules/shared/status-calculator/status-calculator.service.ts

