"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillReportsController", {
    enumerable: true,
    get: function() {
        return CheckBillReportsController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _rolesguard = require("../../common/guards/roles.guard");
const _userroleenum = require("../../common/enums/user-role.enum");
const _checkbillservice = require("./check-bill.service");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let CheckBillReportsController = class CheckBillReportsController {
    portfolioSummary() {
        return this.checkBillService.getStatsSummary();
    }
    agingReport() {
        return this.checkBillService.getStatsAging();
    }
    cashflowForecast() {
        return this.checkBillService.getStatsCashflow();
    }
    async bankPosition() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const rows = await this.prisma.checkBill.groupBy({
            by: [
                'status'
            ],
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                status: {
                    in: [
                        _client.CheckBillStatus.IN_BANK_COLLECTION,
                        _client.CheckBillStatus.IN_BANK_GUARANTEE,
                        _client.CheckBillStatus.SENT_TO_BANK,
                        _client.CheckBillStatus.DISCOUNTED
                    ]
                }
            },
            _count: true,
            _sum: {
                remainingAmount: true
            }
        });
        return {
            byStatus: rows
        };
    }
    async protestReport() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillProtestTracking.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                protestDate: 'desc'
            },
            take: 500
        });
    }
    async riskExposure() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillRiskLimit.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                isActive: true
            },
            include: {
                account: {
                    select: {
                        id: true,
                        title: true,
                        code: true
                    }
                }
            }
        });
    }
    async endorsementChain(id) {
        return this.checkBillService.getEndorsements(id);
    }
    async reconciliationStatus() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillReconciliation.groupBy({
            by: [
                'status'
            ],
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            _count: true
        });
    }
    fiscalPeriod(year, month, currency) {
        void currency;
        return {
            year,
            month,
            message: 'Mali dönem özeti: GL fişleri bağlandığında genişletilecek',
            summary: null
        };
    }
    constructor(checkBillService, prisma, tenantResolver){
        this.checkBillService = checkBillService;
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('portfolio-summary'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillReportsController.prototype, "portfolioSummary", null);
_ts_decorate([
    (0, _common.Get)('aging-report'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillReportsController.prototype, "agingReport", null);
_ts_decorate([
    (0, _common.Get)('cashflow-forecast'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillReportsController.prototype, "cashflowForecast", null);
_ts_decorate([
    (0, _common.Get)('bank-position'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillReportsController.prototype, "bankPosition", null);
_ts_decorate([
    (0, _common.Get)('protest-report'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillReportsController.prototype, "protestReport", null);
_ts_decorate([
    (0, _common.Get)('risk-exposure'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillReportsController.prototype, "riskExposure", null);
_ts_decorate([
    (0, _common.Get)('endorsement-chain/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CheckBillReportsController.prototype, "endorsementChain", null);
_ts_decorate([
    (0, _common.Get)('reconciliation-status'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillReportsController.prototype, "reconciliationStatus", null);
_ts_decorate([
    (0, _common.Get)('fiscal-period/:year/:month'),
    _ts_param(0, (0, _common.Param)('year', _common.ParseIntPipe)),
    _ts_param(1, (0, _common.Param)('month', _common.ParseIntPipe)),
    _ts_param(2, (0, _common.Query)('currency')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        Number,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillReportsController.prototype, "fiscalPeriod", null);
CheckBillReportsController = _ts_decorate([
    (0, _common.Controller)('check-bill-reports'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillservice.CheckBillService === "undefined" ? Object : _checkbillservice.CheckBillService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CheckBillReportsController);

//# sourceMappingURL=check-bill-reports.controller.js.map