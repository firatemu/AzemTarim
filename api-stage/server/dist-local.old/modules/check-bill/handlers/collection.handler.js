"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CollectionHandler", {
    enumerable: true,
    get: function() {
        return CollectionHandler;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _statustransitionutil = require("../utils/status-transition.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CollectionHandler = class CollectionHandler {
    async handle(dto, context) {
        const { tx, journalId, tenantId, performedById } = context;
        const ids = dto.selectedDocumentIds ?? [];
        if (ids.length === 0) return;
        for (const checkBillId of ids){
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: checkBillId,
                    tenantId,
                    deletedAt: null
                }
            });
            if (!checkBill) throw new _common.BadRequestException(`Evrak bulunamadı: ${checkBillId}`);
            const transactionAmount = Number(dto['transactionAmount'] ?? checkBill.remainingAmount);
            const remaining = Number(checkBill.remainingAmount);
            if (transactionAmount <= 0 || transactionAmount > remaining) {
                throw new _common.BadRequestException(`Tahsilat tutarı (${transactionAmount}) geçersiz. Kalan tutar: ${remaining}`);
            }
            const newRemaining = remaining - transactionAmount;
            // PortfolioType'a göre hedef statü belirle
            let newStatus;
            if (newRemaining > 0) {
                newStatus = _client.CheckBillStatus.PARTIAL_PAID;
            } else {
                newStatus = checkBill.portfolioType === 'DEBIT' ? _client.CheckBillStatus.PAID : _client.CheckBillStatus.COLLECTED;
            }
            (0, _statustransitionutil.assertLegalTransition)(checkBill.status, newStatus);
            await tx.checkBill.update({
                where: {
                    id: checkBillId
                },
                data: {
                    status: newStatus,
                    remainingAmount: newRemaining,
                    collectionDate: new Date(dto.date),
                    lastJournalId: journalId,
                    updatedBy: performedById
                }
            });
            await tx.checkBillCollection.create({
                data: {
                    tenantId,
                    checkBillId,
                    collectedAmount: transactionAmount,
                    collectionDate: new Date(dto.date),
                    cashboxId: dto.cashboxId ?? null,
                    bankAccountId: dto.bankAccountId ?? null,
                    journalId,
                    createdById: performedById
                }
            });
            if (dto.cashboxId) {
                await tx.cashboxMovement.create({
                    data: {
                        tenantId,
                        cashboxId: dto.cashboxId,
                        movementType: _client.CashboxMovementType.COLLECTION,
                        amount: transactionAmount,
                        balance: 0,
                        notes: dto.notes ?? 'Evrak tahsilatı',
                        date: new Date(dto.date),
                        accountId: checkBill.accountId,
                        createdBy: performedById
                    }
                });
            } else if (dto.bankAccountId) {
                await tx.bankAccountMovement.create({
                    data: {
                        tenantId,
                        bankAccountId: dto.bankAccountId,
                        movementType: _client.BankMovementType.INCOMING,
                        amount: transactionAmount,
                        balance: 0,
                        notes: dto.notes ?? 'Evrak tahsilatı',
                        date: new Date(dto.date),
                        accountId: checkBill.accountId
                    }
                });
            }
            await tx.checkBillJournalItem.create({
                data: {
                    tenantId,
                    journalId,
                    checkBillId
                }
            });
            await tx.checkBillLog.create({
                data: {
                    tenantId,
                    checkBillId,
                    actionType: _client.LogAction.STATUS_CHANGE,
                    fromStatus: checkBill.status ?? undefined,
                    toStatus: newStatus,
                    journalId,
                    performedById,
                    notes: `Tahsilat: ${transactionAmount} TL`
                }
            });
        }
    }
};
CollectionHandler = _ts_decorate([
    (0, _common.Injectable)()
], CollectionHandler);

//# sourceMappingURL=collection.handler.js.map