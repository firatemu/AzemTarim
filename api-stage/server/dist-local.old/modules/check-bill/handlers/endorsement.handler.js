"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EndorsementHandler", {
    enumerable: true,
    get: function() {
        return EndorsementHandler;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _statustransitionutil = require("../utils/status-transition.util");
const _accountbalanceservice = require("../../account-balance/account-balance.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let EndorsementHandler = class EndorsementHandler {
    async handle(dto, context) {
        const { tx, journalId, tenantId, performedById } = context;
        if (!dto.selectedDocumentIds || dto.selectedDocumentIds.length === 0) return;
        if (!dto.accountId) throw new _common.BadRequestException('Ciro edilecek cari (accountId) zorunludur.');
        for (const checkBillId of dto.selectedDocumentIds){
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: checkBillId,
                    tenantId,
                    deletedAt: null
                }
            });
            if (!checkBill) throw new _common.BadRequestException(`Evrak bulunamadı: ${checkBillId}`);
            (0, _statustransitionutil.assertLegalTransition)(checkBill.status, _client.CheckBillStatus.ENDORSED);
            // Ciro sekans hesapla
            const existingCount = await tx.checkBillEndorsement.count({
                where: {
                    checkBillId
                }
            });
            const sequence = existingCount + 1;
            await tx.checkBillEndorsement.create({
                data: {
                    tenantId,
                    checkBillId,
                    sequence,
                    fromAccountId: checkBill.currentHolderId ?? checkBill.accountId,
                    toAccountId: dto.accountId,
                    endorsedAt: new Date(dto.date),
                    journalId
                }
            });
            await tx.checkBill.update({
                where: {
                    id: checkBillId
                },
                data: {
                    status: _client.CheckBillStatus.ENDORSED,
                    currentHolderId: dto.accountId,
                    lastJournalId: journalId,
                    updatedBy: performedById
                }
            });
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
                    toStatus: _client.CheckBillStatus.ENDORSED,
                    journalId,
                    performedById,
                    notes: `Ciro sırası: ${sequence}`
                }
            });
            // Eski cariye ters kayıt (borç silindi)
            await tx.accountMovement.create({
                data: {
                    tenantId,
                    accountId: checkBill.currentHolderId ?? checkBill.accountId,
                    type: 'CREDIT',
                    amount: checkBill.amount,
                    balance: new _client.Prisma.Decimal(0),
                    documentType: 'CHECK_EXIT',
                    documentNo: checkBill.checkNo || checkBill.id,
                    checkBillId: checkBillId,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes || undefined
                }
            });
            // Yeni cariye borç kaydı (ciro alan)
            await tx.accountMovement.create({
                data: {
                    tenantId,
                    accountId: dto.accountId,
                    type: 'DEBIT',
                    amount: checkBill.amount,
                    balance: new _client.Prisma.Decimal(0),
                    documentType: 'CHECK_ENTRY',
                    documentNo: checkBill.checkNo || checkBill.id,
                    checkBillId: checkBillId,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes || undefined
                }
            });
        }
        // Bakiye güncelleme (eski ve yeni cariler için)
        for (const checkBillId of dto.selectedDocumentIds){
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: checkBillId,
                    tenantId,
                    deletedAt: null
                },
                select: {
                    currentHolderId: true,
                    accountId: true
                }
            });
            if (checkBill) {
                const oldAccountId = checkBill.currentHolderId ?? checkBill.accountId;
                if (oldAccountId) {
                    await this.accountBalanceService.recalculateAccountBalance(oldAccountId, tx);
                }
            }
        }
        if (dto.accountId) {
            await this.accountBalanceService.recalculateAccountBalance(dto.accountId, tx);
        }
    }
    constructor(accountBalanceService){
        this.accountBalanceService = accountBalanceService;
    }
};
EndorsementHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService
    ])
], EndorsementHandler);

//# sourceMappingURL=endorsement.handler.js.map