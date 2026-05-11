"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReturnHandler", {
    enumerable: true,
    get: function() {
        return ReturnHandler;
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
let ReturnHandler = class ReturnHandler {
    async handle(dto, context) {
        const { tx, journalId, tenantId, performedById } = context;
        const ids = dto.selectedDocumentIds ?? [];
        if (ids.length === 0) return;
        let lastAccountId = null;
        for (const checkBillId of ids){
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: checkBillId,
                    tenantId,
                    deletedAt: null
                }
            });
            if (!checkBill) throw new _common.BadRequestException(`Evrak bulunamadı: ${checkBillId}`);
            (0, _statustransitionutil.assertLegalTransition)(checkBill.status, _client.CheckBillStatus.RETURNED);
            lastAccountId = checkBill.accountId;
            await tx.checkBill.update({
                where: {
                    id: checkBillId
                },
                data: {
                    status: _client.CheckBillStatus.RETURNED,
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
                    toStatus: _client.CheckBillStatus.RETURNED,
                    journalId,
                    performedById,
                    notes: 'Evrak iade edildi'
                }
            });
            // Account Movement:
            // Eğer evrak Müşteri Evrakı ise (CREDIT) -> iade edince müşteri bize tekrar borçlanır -> DEBIT
            // Eğer evrak Kendi Evrakımız ise (DEBIT) -> iade gelince tedarikçiye borcumuz tekrar artar -> CREDIT
            const movementType = checkBill.portfolioType === 'CREDIT' ? _client.DebitCredit.DEBIT : _client.DebitCredit.CREDIT;
            await tx.accountMovement.create({
                data: {
                    tenantId,
                    accountId: checkBill.accountId,
                    type: movementType,
                    amount: checkBill.amount,
                    balance: new _client.Prisma.Decimal(0),
                    documentType: _client.DocumentType.RETURN,
                    documentNo: checkBill.checkNo || checkBill.serialNo || '-',
                    checkBillId,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes || 'Evrak İade Edildi'
                }
            });
        }
        // Bakiye güncelleme
        if (lastAccountId) {
            await this.accountBalanceService.recalculateAccountBalance(lastAccountId, tx);
        }
    }
    constructor(accountBalanceService){
        this.accountBalanceService = accountBalanceService;
    }
};
ReturnHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService
    ])
], ReturnHandler);

//# sourceMappingURL=return.handler.js.map