"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PurchaseStatusCalculatorService", {
    enumerable: true,
    get: function() {
        return PurchaseStatusCalculatorService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PurchaseStatusCalculatorService = class PurchaseStatusCalculatorService {
    /**
     * Recalculates and persists PurchaseOrder.status based on receivedQuantity
     * across all PurchaseOrderItems.
     */ async recalculateOrderStatus(orderId, tenantId) {
        try {
            const items = await this.prisma.procurementOrderItem.findMany({
                where: {
                    orderId
                }
            });
            let newStatus;
            if (!items || items.length === 0) {
                newStatus = _client.OrderStatus.PENDING;
            } else {
                const allPending = items.every((i)=>(i.receivedQuantity || 0) === 0);
                const allCompleted = items.every((i)=>(i.receivedQuantity || 0) >= Number(i.quantity));
                if (allPending) {
                    newStatus = _client.OrderStatus.PENDING;
                } else if (allCompleted) {
                    newStatus = _client.OrderStatus.COMPLETED;
                } else {
                    newStatus = _client.OrderStatus.PARTIAL;
                }
            }
            await this.prisma.procurementOrder.update({
                where: {
                    id: orderId,
                    tenantId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[PurchaseStatusCalculator] ProcurementOrder ${orderId} -> ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[PurchaseStatusCalculator] Failed to recalculate ProcurementOrder status for ${orderId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (ProcurementOrder)');
        }
    }
    /**
     * Recalculates and persists each PurchaseOrderItem.status based on
     * receivedQuantity vs orderedQuantity.
     */ async recalculateOrderItemStatuses(orderId, tenantId) {
        try {
            const items = await this.prisma.procurementOrderItem.findMany({
                where: {
                    orderId
                }
            });
            if (!items || items.length === 0) return;
            const updates = items.map((item)=>{
                let newStatus;
                const received = item.receivedQuantity || 0;
                const ordered = Number(item.quantity);
                if (received === 0) {
                    newStatus = 'PENDING';
                } else if (received >= ordered) {
                    newStatus = 'COMPLETED';
                } else {
                    newStatus = 'PARTIAL';
                }
                return this.prisma.procurementOrderItem.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        status: newStatus
                    }
                });
            });
            await this.prisma.$transaction(updates);
            this.logger.log(`[PurchaseStatusCalculator] ProcurementOrderItems recalculated for order ${orderId} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[PurchaseStatusCalculator] Failed to recalculate ProcurementOrderItem statuses for ${orderId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (ProcurementOrderItem)');
        }
    }
    /**
     * Recalculates and persists PurchaseDeliveryNote.status based on
     * whether a non-cancelled invoice exists for this delivery note.
     */ async recalculateDeliveryNoteStatus(deliveryNoteId, tenantId) {
        try {
            // Find First valid invoice for this delivery note
            const invoice = await this.prisma.invoice.findFirst({
                where: {
                    purchaseDeliveryNoteId: deliveryNoteId,
                    tenantId,
                    status: {
                        not: 'CANCELLED'
                    },
                    deletedAt: null
                }
            });
            // 1:1 mapping constraint
            const newStatus = invoice ? _client.DeliveryNoteStatus.INVOICED : _client.DeliveryNoteStatus.NOT_INVOICED;
            await this.prisma.purchaseDeliveryNote.update({
                where: {
                    id: deliveryNoteId,
                    tenantId
                },
                data: {
                    status: newStatus
                }
            });
            this.logger.log(`[PurchaseStatusCalculator] PurchaseDeliveryNote ${deliveryNoteId} -> ${newStatus} (tenant: ${tenantId})`);
        } catch (err) {
            this.logger.error(`[PurchaseStatusCalculator] Failed to recalculate PurchaseDeliveryNote status for ${deliveryNoteId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Status hesaplama sırasında bir hata oluştu (PurchaseDeliveryNote)');
        }
    }
    /**
     * Convenience method: recalculates delivery note status, then
     * cascades to recalculate the source order status.
     */ async recalculateCascade(deliveryNoteId, tenantId) {
        try {
            await this.recalculateDeliveryNoteStatus(deliveryNoteId, tenantId);
            const note = await this.prisma.purchaseDeliveryNote.findUnique({
                where: {
                    id: deliveryNoteId
                },
                select: {
                    sourceId: true
                }
            });
            if (note?.sourceId) {
                await this.recalculateOrderItemStatuses(note.sourceId, tenantId);
                await this.recalculateOrderStatus(note.sourceId, tenantId);
            }
        } catch (err) {
            // Don't rewrap if already InternalServerErrorException
            if (err?.status === 500) {
                throw err;
            }
            this.logger.error(`[PurchaseStatusCalculator] Cascade failed for DeliveryNote ${deliveryNoteId}: ${err?.message}`, err?.stack);
            throw new _common.InternalServerErrorException('Cascade status hesaplama sırasında bir hata oluştu');
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(PurchaseStatusCalculatorService.name);
    }
};
PurchaseStatusCalculatorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PurchaseStatusCalculatorService);

//# sourceMappingURL=purchase-status-calculator.service.js.map