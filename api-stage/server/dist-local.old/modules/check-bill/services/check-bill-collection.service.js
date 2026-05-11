"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillCollectionService", {
    enumerable: true,
    get: function() {
        return CheckBillCollectionService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _stagingutil = require("../../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CheckBillCollectionService = class CheckBillCollectionService {
    /**
     * Mevcut bir $transaction içinde tahsilat kaydı oluşturur.
     */ async createRecord(tx, params) {
        await tx.checkBillCollection.create({
            data: {
                tenantId: params.tenantId,
                checkBillId: params.checkBillId,
                collectedAmount: params.collectedAmount,
                collectionDate: params.collectionDate,
                cashboxId: params.cashboxId ?? null,
                bankAccountId: params.bankAccountId ?? null,
                journalId: params.journalId,
                createdById: params.createdById
            }
        });
    }
    /**
     * Bir evrakın tüm tahsilat geçmişini döner (collectionDate DESC).
     */ async getHistory(checkBillId, tenantId) {
        return this.prisma.checkBillCollection.findMany({
            where: {
                checkBillId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId)
            },
            orderBy: {
                collectionDate: 'desc'
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CheckBillCollectionService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CheckBillCollectionService);

//# sourceMappingURL=check-bill-collection.service.js.map