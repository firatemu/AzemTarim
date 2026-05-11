"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GlIntegrationService", {
    enumerable: true,
    get: function() {
        return GlIntegrationService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
const _tenantresolverservice = require("../../../common/services/tenant-resolver.service");
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
let GlIntegrationService = class GlIntegrationService {
    async listByCheckBill(checkBillId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const cb = await this.prisma.checkBill.findFirst({
            where: {
                id: checkBillId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!cb) throw new _common.NotFoundException('Evrak bulunamadı.');
        const tid = cb.tenantId ?? tenantId;
        if (!tid) return [];
        return this.prisma.checkBillGlEntry.findMany({
            where: {
                checkBillId,
                tenantId: tid
            },
            orderBy: {
                accountingDate: 'desc'
            }
        });
    }
    /** Taslak GL satırı — muhasebe onayı sonrası POSTED yapılabilir */ async createDraftLine(input) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.NotFoundException('Kiracı çözümlenemedi');
        }
        const cb = await this.prisma.checkBill.findFirst({
            where: {
                id: input.checkBillId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId),
                deletedAt: null
            }
        });
        if (!cb) throw new _common.NotFoundException('Evrak bulunamadı.');
        const now = new Date();
        const amt = input.amount;
        return this.prisma.checkBillGlEntry.create({
            data: {
                tenantId,
                checkBillId: input.checkBillId,
                journalId: input.journalId ?? undefined,
                glJournalNo: `CB-GL-${now.getTime()}`,
                accountingDate: now,
                fiscalYear: now.getFullYear(),
                fiscalPeriod: now.getMonth() + 1,
                debitAccountCode: input.debitAccountCode,
                creditAccountCode: input.creditAccountCode,
                debitAmount: amt,
                creditAmount: amt,
                currency: (input.currency || cb.currency || 'TRY').slice(0, 3),
                exchangeRate: cb.exchangeRate ?? undefined,
                description: input.description,
                entryType: _client.CheckBillGlEntryType.AUTO,
                status: _client.CheckBillGlEntryStatus.DRAFT
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
GlIntegrationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], GlIntegrationService);

//# sourceMappingURL=gl-integration.service.js.map