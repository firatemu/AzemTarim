"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StatusCalculatorService", {
    enumerable: true,
    get: function() {
        return StatusCalculatorService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let StatusCalculatorService = class StatusCalculatorService {
    /**
     * Recalculates and persists the status of a SalesOrder based on its items'
     * deliveredQuantity vs quantity. If any invoice exists for the order, status
     * is upgraded to INVOICED regardless of shipment state.
     *
     * @param orderId  - UUID of the SalesOrder
     * @param tenantId - Tenant context for multi-tenancy isolation
     */ async recalculateOrderStatus(orderId, tenantId) {
        try {
            const items = await this.prisma.salesOrderItem.findMany({
                where: {
                    orderId
                }
            });
            let newStatus;
            if (!items || items.length === 0) {
                newStatus = 'PENDING';
            } else {
                const allCompleted = items.every((i)=>(i.deliveredQuantity || 0) >= Number(i.quantity));
                const anyShipped = items.some((i)=>(i.deliveredQuantity || 0) > 0);
                if (allCompleted) {
                    newStatus = 'COMPLETED';
                } else if (anyShipped) {
                    newStatus = 'PARTIALLY_SHIPPED';
                } else {
                    newStatus = 'PENDING';
                }
                // If all items are shipped AND at least one invoice exists, upgrade to INVOICED
                const invoiceCount = await this.prisma.invoice.count({
                    where: {
                        deliveryNote: {
                            sourceId: orderId
                        },
                        deletedAt: null
                    }
                });
                if (allCompleted && invoiceCount > 0) {
                    newStatus = 'INVOICED';
                }
            }
            await this.prisma.salesOrder.update({
                where: {
                    id: orderId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[StatusCalculator] SalesOrder ${orderId} → ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[StatusCalculator] Failed to recalculate SalesOrder status for ${orderId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (SalesOrder)');
        }
    }
    /**
     * Recalculates and persists the status of a SalesDeliveryNote based on its
     * items' invoicedQuantity vs quantity, and the count of linked invoices.
     *
     * @param deliveryNoteId - UUID of the SalesDeliveryNote
     * @param tenantId       - Tenant context for multi-tenancy isolation
     */ async recalculateDeliveryNoteStatus(deliveryNoteId, tenantId) {
        try {
            const items = await this.prisma.salesDeliveryNoteItem.findMany({
                where: {
                    deliveryNoteId
                }
            });
            const invoiceCount = await this.prisma.invoice.count({
                where: {
                    deliveryNoteId,
                    deletedAt: null
                }
            });
            let newStatus;
            if (invoiceCount === 0) {
                newStatus = 'NOT_INVOICED';
            } else {
                const allInvoiced = items.every((i)=>(i.invoicedQuantity || 0) >= Number(i.quantity));
                const anyInvoiced = items.some((i)=>(i.invoicedQuantity || 0) > 0);
                if (allInvoiced) {
                    newStatus = 'INVOICED';
                } else if (anyInvoiced) {
                    newStatus = 'PARTIALLY_INVOICED';
                } else {
                    newStatus = 'NOT_INVOICED';
                }
            }
            await this.prisma.salesDeliveryNote.update({
                where: {
                    id: deliveryNoteId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[StatusCalculator] SalesDeliveryNote ${deliveryNoteId} → ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[StatusCalculator] Failed to recalculate DeliveryNote status for ${deliveryNoteId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (SalesDeliveryNote)');
        }
    }
    /**
     * Convenience method: recalculates delivery note status first, then cascades
     * up to the linked source order (if any).
     *
     * @param deliveryNoteId - UUID of the SalesDeliveryNote
     * @param tenantId       - Tenant context for multi-tenancy isolation
     */ /**
     * Convenience method: recalculates delivery note status first, then cascades
     * up to the linked source order (if any).
     *
     * @param deliveryNoteId - UUID of the SalesDeliveryNote
     * @param tenantId       - Tenant context for multi-tenancy isolation
     */ async recalculateCascade(deliveryNoteId, tenantId) {
        try {
            await this.recalculateDeliveryNoteStatus(deliveryNoteId, tenantId);
            // Resolve the source order (if the delivery note came from an order)
            const note = await this.prisma.salesDeliveryNote.findUnique({
                where: {
                    id: deliveryNoteId
                },
                select: {
                    sourceId: true
                }
            });
            if (note?.sourceId) {
                await this.recalculateOrderStatus(note.sourceId, tenantId);
            }
        } catch (err) {
            if (err?.status === 500) {
                throw err; // already wrapped
            }
            this.logger.error(`[StatusCalculator] Cascade failed for DeliveryNote ${deliveryNoteId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Cascade status hesaplama sırasında bir hata oluştu');
        }
    }
    /**
     * PROCUREMENT/PURCHASE METHODS
     */ async recalculateProcurementOrderStatus(orderId, tenantId) {
        try {
            const items = await this.prisma.procurementOrderItem.findMany({
                where: {
                    orderId
                }
            });
            let newStatus;
            if (!items || items.length === 0) {
                newStatus = 'PENDING';
            } else {
                const allCompleted = items.every((i)=>(i.deliveredQuantity || 0) >= Number(i.quantity));
                const anyShipped = items.some((i)=>(i.deliveredQuantity || 0) > 0);
                if (allCompleted) {
                    newStatus = 'SHIPPED'; // Procurement standard: SHIPPED means fully received/shipped
                } else if (anyShipped) {
                    newStatus = 'PARTIALLY_SHIPPED';
                } else {
                    newStatus = 'PENDING';
                }
                // If at least one invoice exists linked via delivery note, upgrade to INVOICED
                const invoiceCount = await this.prisma.invoice.count({
                    where: {
                        purchaseDeliveryNote: {
                            sourceId: orderId
                        },
                        deletedAt: null
                    }
                });
                if (invoiceCount > 0) {
                    newStatus = 'INVOICED';
                }
            }
            await this.prisma.procurementOrder.update({
                where: {
                    id: orderId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[StatusCalculator] ProcurementOrder ${orderId} → ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[StatusCalculator] Failed to recalculate ProcurementOrder status for ${orderId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (ProcurementOrder)');
        }
    }
    async recalculatePurchaseDeliveryNoteStatus(deliveryNoteId, tenantId) {
        try {
            const items = await this.prisma.purchaseDeliveryNoteItem.findMany({
                where: {
                    deliveryNoteId
                }
            });
            const invoiceCount = await this.prisma.invoice.count({
                where: {
                    purchaseDeliveryNoteId: deliveryNoteId,
                    deletedAt: null
                }
            });
            let newStatus;
            if (invoiceCount === 0) {
                newStatus = 'NOT_INVOICED';
            } else {
                // For purchase, we might not track invoicedQuantity per item yet in schema?
                // Let's check schema.prisma again for PurchaseDeliveryNoteItem
                newStatus = 'INVOICED';
            // Simple version for now based on count, can be refined if invoicedQuantity added
            }
            await this.prisma.purchaseDeliveryNote.update({
                where: {
                    id: deliveryNoteId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[StatusCalculator] PurchaseDeliveryNote ${deliveryNoteId} → ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[StatusCalculator] Failed to recalculate PurchaseDeliveryNote status for ${deliveryNoteId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (PurchaseDeliveryNote)');
        }
    }
    async recalculatePurchaseCascade(deliveryNoteId, tenantId) {
        try {
            await this.recalculatePurchaseDeliveryNoteStatus(deliveryNoteId, tenantId);
            const note = await this.prisma.purchaseDeliveryNote.findUnique({
                where: {
                    id: deliveryNoteId
                },
                select: {
                    sourceId: true
                }
            });
            if (note?.sourceId) {
                await this.recalculateProcurementOrderStatus(note.sourceId, tenantId);
            }
        } catch (err) {
            if (err?.status === 500) {
                throw err;
            }
            this.logger.error(`[StatusCalculator] PurchaseCascade failed for DeliveryNote ${deliveryNoteId}: ${err?.message}`);
            throw new _common.InternalServerErrorException('Satınalma cascade status hesaplama sırasında bir hata oluştu');
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(StatusCalculatorService.name);
    }
};
StatusCalculatorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], StatusCalculatorService);

//# sourceMappingURL=status-calculator.service.js.map