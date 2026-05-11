"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentExitHandler", {
    enumerable: true,
    get: function() {
        return DocumentExitHandler;
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
let DocumentExitHandler = class DocumentExitHandler {
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
            // Validate transition to GIVEN_TO_CUSTOMER status
            (0, _statustransitionutil.assertLegalTransition)(checkBill.status, _client.CheckBillStatus.GIVEN_TO_CUSTOMER);
            // Update check bill status
            await tx.checkBill.update({
                where: {
                    id: checkBillId
                },
                data: {
                    status: _client.CheckBillStatus.GIVEN_TO_CUSTOMER,
                    lastJournalId: journalId,
                    updatedBy: performedById
                }
            });
            // Create journal item record
            await tx.checkBillJournalItem.create({
                data: {
                    tenantId,
                    journalId,
                    checkBillId
                }
            });
            // Create log entry
            await tx.checkBillLog.create({
                data: {
                    tenantId,
                    checkBillId,
                    actionType: _client.LogAction.STATUS_CHANGE,
                    fromStatus: checkBill.status ?? undefined,
                    toStatus: _client.CheckBillStatus.GIVEN_TO_CUSTOMER,
                    journalId,
                    performedById,
                    notes: 'Müşteriye verildi / Portföyden çıkış'
                }
            });
            // Create account movement to reverse the original entry
            await tx.accountMovement.create({
                data: {
                    tenantId,
                    accountId: checkBill.accountId,
                    type: checkBill.portfolioType === 'CREDIT' ? _client.Prisma.DebitCredit.DEBIT : _client.Prisma.DebitCredit.CREDIT,
                    amount: checkBill.amount,
                    balance: new _client.Prisma.Decimal(0),
                    documentType: 'CHECK_EXIT',
                    documentNo: checkBill.checkNo || checkBill.id,
                    checkBillId: checkBillId,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes || 'Müşteriye verildi'
                }
            });
            // Recalculate account balance
            await this.accountBalanceService.recalculateAccountBalance(checkBill.accountId, tx);
        }
    }
    constructor(accountBalanceService){
        this.accountBalanceService = accountBalanceService;
    }
};
DocumentExitHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService
    ])
], DocumentExitHandler);

//# sourceMappingURL=document-exit.handler.js.map