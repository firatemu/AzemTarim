"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillLogService", {
    enumerable: true,
    get: function() {
        return CheckBillLogService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CheckBillLogService = class CheckBillLogService {
    /**
     * Mevcut bir $transaction içinde çağrılmalıdır.
     * Kendi transaction'ını AÇMAZ.
     */ async write(tx, params) {
        await tx.checkBillLog.create({
            data: {
                tenantId: params.tenantId,
                checkBillId: params.checkBillId,
                actionType: _client.LogAction.STATUS_CHANGE,
                fromStatus: params.fromStatus ?? undefined,
                toStatus: params.toStatus,
                journalId: params.journalId,
                performedById: params.performedById,
                notes: params.notes
            }
        });
    }
};
CheckBillLogService = _ts_decorate([
    (0, _common.Injectable)()
], CheckBillLogService);

//# sourceMappingURL=check-bill-log.service.js.map