"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountController", {
    enumerable: true,
    get: function() {
        return AccountController;
    }
});
const _common = require("@nestjs/common");
const _accountservice = require("./account.service");
const _accountmovementservice = require("../account-movement/account-movement.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
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
let AccountController = class AccountController {
    getDebitCreditReport(query) {
        return this.accountService.getDebitCreditReport(query);
    }
    async exportDebitCreditReportExcel(query, res) {
        const buffer = await this.accountService.exportDebitCreditReportExcel(query);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=debit-credit-report.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    async exportDebitCreditReportPdf(query, res) {
        const buffer = await this.accountService.exportDebitCreditReportPdf(query);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=debit-credit-report.pdf',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    getCreditLimitReport(query) {
        return this.accountService.getCreditLimitReport(query);
    }
    async exportCreditLimitReportExcel(query, res) {
        const buffer = await this.accountService.exportCreditLimitReportExcel(query);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=credit-limits-report.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    async exportCreditLimitReportPdf(query, res) {
        const buffer = await this.accountService.exportCreditLimitReportPdf(query);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=credit-limits-report.pdf',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    // Backward compatibility alias for existing frontend routes if needed, otherwise these can be dropped
    async exportStatementExcel(id, startDate, endDate, res) {
        const buffer = await this.accountMovementService.exportExcel({
            accountId: id,
            startDate: startDate,
            endDate: endDate
        });
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=account-statement.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    async exportStatementPdf(id, startDate, endDate, res) {
        const buffer = await this.accountMovementService.exportPdf({
            accountId: id,
            startDate: startDate,
            endDate: endDate
        });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=account-statement.pdf',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    create(dto) {
        return this.accountService.create(dto);
    }
    findAll(page, limit, search, type, isActive) {
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.accountService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search, type, isActiveBool);
    }
    findOne(id) {
        return this.accountService.findOne(id);
    }
    update(id, dto) {
        return this.accountService.update(id, dto);
    }
    remove(id) {
        return this.accountService.remove(id);
    }
    getMovements(id, page, limit) {
        return this.accountService.getMovements(id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    constructor(accountService, // TODO: AccountMovementService should be refactored to AccountMovementService later
    accountMovementService){
        this.accountService = accountService;
        this.accountMovementService = accountMovementService;
    }
};
_ts_decorate([
    (0, _common.Get)('report/debit-credit'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "getDebitCreditReport", null);
_ts_decorate([
    (0, _common.Get)('report/debit-credit/export/excel'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportDebitCreditReportExcel", null);
_ts_decorate([
    (0, _common.Get)('report/debit-credit/export/pdf'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportDebitCreditReportPdf", null);
_ts_decorate([
    (0, _common.Get)('report/credit-limits'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "getCreditLimitReport", null);
_ts_decorate([
    (0, _common.Get)('report/credit-limits/export/excel'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportCreditLimitReportExcel", null);
_ts_decorate([
    (0, _common.Get)('report/credit-limits/export/pdf'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.DebitCreditReportQueryDto === "undefined" ? Object : _dto.DebitCreditReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportCreditLimitReportPdf", null);
_ts_decorate([
    (0, _common.Get)(':id/statement/export/excel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_param(3, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportStatementExcel", null);
_ts_decorate([
    (0, _common.Get)(':id/statement/export/pdf'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_param(3, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountController.prototype, "exportStatementPdf", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateAccountDto === "undefined" ? Object : _dto.CreateAccountDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('type')),
    _ts_param(4, (0, _common.Query)('isActive')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateAccountDto === "undefined" ? Object : _dto.UpdateAccountDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Get)(':id/movements'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('page')),
    _ts_param(2, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AccountController.prototype, "getMovements", null);
AccountController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('account'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountservice.AccountService === "undefined" ? Object : _accountservice.AccountService,
        typeof _accountmovementservice.AccountMovementService === "undefined" ? Object : _accountmovementservice.AccountMovementService
    ])
], AccountController);

//# sourceMappingURL=account.controller.js.map