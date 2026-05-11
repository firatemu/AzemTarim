"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreditEntryHandler", {
    enumerable: true,
    get: function() {
        return CreditEntryHandler;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
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
let CreditEntryHandler = class CreditEntryHandler {
    async handle(dto, context) {
        const { tx, journalId, tenantId, performedById } = context;
        if (!dto.newDocuments || dto.newDocuments.length === 0) return;
        for (const docDto of dto.newDocuments){
            const checkBill = await tx.checkBill.create({
                data: {
                    tenantId,
                    type: docDto.type,
                    portfolioType: 'CREDIT',
                    accountId: dto.accountId,
                    amount: docDto.amount,
                    remainingAmount: docDto.amount,
                    dueDate: new Date(docDto.dueDate),
                    bank: docDto.bank,
                    branch: docDto.branch,
                    accountNo: docDto.accountNo,
                    checkNo: docDto.checkNo,
                    status: _client.CheckBillStatus.IN_PORTFOLIO,
                    notes: docDto.notes,
                    currentHolderId: dto.accountId,
                    lastJournalId: journalId
                }
            });
            await tx.checkBillJournalItem.create({
                data: {
                    tenantId,
                    journalId,
                    checkBillId: checkBill.id
                }
            });
            await tx.checkBillLog.create({
                data: {
                    tenantId,
                    checkBillId: checkBill.id,
                    actionType: _client.LogAction.CREATE,
                    fromStatus: null,
                    toStatus: _client.CheckBillStatus.IN_PORTFOLIO,
                    journalId,
                    performedById,
                    notes: 'Müşteri evrak girişi'
                }
            });
            await tx.accountMovement.create({
                data: {
                    tenantId,
                    accountId: checkBill.accountId,
                    type: 'DEBIT',
                    amount: checkBill.amount,
                    balance: new _client.Prisma.Decimal(0),
                    documentType: 'CHECK_ENTRY',
                    documentNo: checkBill.checkNo || checkBill.id,
                    checkBillId: checkBill.id,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes || undefined
                }
            });
        }
        // Bakiye güncelleme
        if (dto.accountId) {
            await this.accountBalanceService.recalculateAccountBalance(dto.accountId, tx);
        }
    }
    constructor(accountBalanceService){
        this.accountBalanceService = accountBalanceService;
    }
};
CreditEntryHandler = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService
    ])
], CreditEntryHandler);

//# sourceMappingURL=credit-entry.handler.js.map