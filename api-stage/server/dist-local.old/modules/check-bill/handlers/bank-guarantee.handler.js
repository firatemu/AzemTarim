"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankGuaranteeHandler", {
    enumerable: true,
    get: function() {
        return BankGuaranteeHandler;
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
let BankGuaranteeHandler = class BankGuaranteeHandler {
    async handle(dto, context) {
        const { tx, journalId, tenantId, performedById } = context;
        if (!dto.selectedDocumentIds || dto.selectedDocumentIds.length === 0) return;
        for (const checkBillId of dto.selectedDocumentIds){
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: checkBillId,
                    tenantId,
                    deletedAt: null
                }
            });
            if (!checkBill) throw new _common.BadRequestException(`Evrak bulunamadı: ${checkBillId}`);
            (0, _statustransitionutil.assertLegalTransition)(checkBill.status, _client.CheckBillStatus.IN_BANK_GUARANTEE);
            await tx.checkBill.update({
                where: {
                    id: checkBillId
                },
                data: {
                    status: _client.CheckBillStatus.IN_BANK_GUARANTEE,
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
                    toStatus: _client.CheckBillStatus.IN_BANK_GUARANTEE,
                    journalId,
                    performedById,
                    notes: 'Bankaya teminat cirosu'
                }
            });
        // No AccountTransaction — bank guarantee only
        }
    }
};
BankGuaranteeHandler = _ts_decorate([
    (0, _common.Injectable)()
], BankGuaranteeHandler);

//# sourceMappingURL=bank-guarantee.handler.js.map