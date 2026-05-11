"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillController", {
    enumerable: true,
    get: function() {
        return CheckBillController;
    }
});
const _common = require("@nestjs/common");
const _checkbillservice = require("./check-bill.service");
const _createcheckbilldto = require("./dto/create-check-bill.dto");
const _checkbilltransactiondto = require("./dto/check-bill-transaction.dto");
const _checkbillfilterdto = require("./dto/check-bill-filter.dto");
const _checkbillbulkdto = require("./dto/check-bill-bulk.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _rolesguard = require("../../common/guards/roles.guard");
const _userroleenum = require("../../common/enums/user-role.enum");
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
let CheckBillController = class CheckBillController {
    getStatsSummary() {
        return this.checkBillService.getStatsSummary();
    }
    getStatsAging() {
        return this.checkBillService.getStatsAging();
    }
    getStatsCashflow() {
        return this.checkBillService.getStatsCashflow();
    }
    async exportExcel(filter, res) {
        const buffer = await this.checkBillService.exportExcel(filter);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="cek-senet-listesi.xlsx"');
        res.send(buffer);
    }
    async exportPdf(filter, res) {
        const buffer = await this.checkBillService.exportExcel(filter);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="cek-senet-listesi.pdf"');
        res.send(buffer);
    }
    async healthCheck() {
        try {
            await this.checkBillService.getOverdue();
            return {
                status: 'ok',
                message: 'Database connection working'
            };
        } catch (error) {
            console.error('[CheckBillController] health check error:', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    findAll(filter) {
        return this.checkBillService.findAll(filter);
    }
    create(dto, req) {
        return this.checkBillService.create(dto, undefined, req.user.id);
    }
    bulkAction(dto, req) {
        if (dto.action !== 'soft_delete') {
            throw new _common.BadRequestException('Desteklenmeyen aksiyon');
        }
        return this.checkBillService.bulkSoftDelete(dto.checkBillIds, req.user.id);
    }
    importDocuments() {
        throw new _common.NotImplementedException('Excel/CSV toplu içe aktarma için şablon ve doğrulama yakında eklenecek.');
    }
    async getUpcomingChecks(startDate, endDate) {
        try {
            let start = startDate ? new Date(startDate) : new Date();
            let end = endDate ? new Date(endDate) : new Date();
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                throw new _common.BadRequestException('Geçersiz startDate veya endDate');
            }
            if (start.getTime() > end.getTime()) {
                const t = start;
                start = end;
                end = t;
            }
            return await this.checkBillService.getUpcomingChecks(start, end);
        } catch (error) {
            console.error('[CheckBillController] getUpcomingChecks error:', error);
            throw error;
        }
    }
    async getOverdue() {
        try {
            return await this.checkBillService.getOverdue();
        } catch (error) {
            console.error('[CheckBillController] getOverdue error:', error);
            throw error;
        }
    }
    async getAtRisk(minScore) {
        try {
            const n = minScore ? parseInt(minScore, 10) : 70;
            return await this.checkBillService.getAtRisk(Number.isFinite(n) ? n : 70);
        } catch (error) {
            console.error('[CheckBillController] getAtRisk error:', error);
            throw error;
        }
    }
    /** Doc §5.1: /:id/endorsements — eski `endorsements/:id` ile birlikte */ getEndorsements(id) {
        return this.checkBillService.getEndorsements(id);
    }
    getCollectionHistory(id) {
        return this.checkBillService.getCollectionHistory(id);
    }
    getTimeline(id) {
        return this.checkBillService.getTimeline(id);
    }
    getGlEntries(id) {
        return this.checkBillService.getGlEntriesForCheckBill(id);
    }
    getDocuments(id) {
        return this.checkBillService.getDocuments(id);
    }
    findOne(id) {
        return this.checkBillService.findOne(id);
    }
    update(id, dto) {
        return this.checkBillService.update(id, dto);
    }
    remove(id) {
        return this.checkBillService.remove(id);
    }
    processAction(dto, req) {
        return this.checkBillService.processAction(dto, req.user.id);
    }
    constructor(checkBillService){
        this.checkBillService = checkBillService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats/summary'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getStatsSummary", null);
_ts_decorate([
    (0, _common.Get)('stats/aging'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getStatsAging", null);
_ts_decorate([
    (0, _common.Get)('stats/cashflow'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getStatsCashflow", null);
_ts_decorate([
    (0, _common.Get)('export/excel'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillfilterdto.CheckBillFilterDto === "undefined" ? Object : _checkbillfilterdto.CheckBillFilterDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)('export/pdf'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillfilterdto.CheckBillFilterDto === "undefined" ? Object : _checkbillfilterdto.CheckBillFilterDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "exportPdf", null);
_ts_decorate([
    (0, _common.Get)('health'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "healthCheck", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillfilterdto.CheckBillFilterDto === "undefined" ? Object : _checkbillfilterdto.CheckBillFilterDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcheckbilldto.CreateCheckBillDto === "undefined" ? Object : _createcheckbilldto.CreateCheckBillDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)('bulk-action'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillbulkdto.CheckBillBulkActionDto === "undefined" ? Object : _checkbillbulkdto.CheckBillBulkActionDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "bulkAction", null);
_ts_decorate([
    (0, _common.Post)('import'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "importDocuments", null);
_ts_decorate([
    (0, _common.Get)('upcoming'),
    _ts_param(0, (0, _common.Query)('startDate')),
    _ts_param(1, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "getUpcomingChecks", null);
_ts_decorate([
    (0, _common.Get)('overdue'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "getOverdue", null);
_ts_decorate([
    (0, _common.Get)('at-risk'),
    _ts_param(0, (0, _common.Query)('minScore')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CheckBillController.prototype, "getAtRisk", null);
_ts_decorate([
    (0, _common.Get)([
        ':id/endorsements',
        'endorsements/:id'
    ]),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getEndorsements", null);
_ts_decorate([
    (0, _common.Get)([
        ':id/collections',
        'collections/:id'
    ]),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getCollectionHistory", null);
_ts_decorate([
    (0, _common.Get)(':id/timeline'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getTimeline", null);
_ts_decorate([
    (0, _common.Get)(':id/gl-entries'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getGlEntries", null);
_ts_decorate([
    (0, _common.Get)(':id/documents'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "getDocuments", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createcheckbilldto.UpdateCheckBillDto === "undefined" ? Object : _createcheckbilldto.UpdateCheckBillDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)('action'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TENANT_ADMIN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.MANAGER, _userroleenum.UserRole.USER),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbilltransactiondto.CheckBillActionDto === "undefined" ? Object : _checkbilltransactiondto.CheckBillActionDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillController.prototype, "processAction", null);
CheckBillController = _ts_decorate([
    (0, _common.Controller)('checks-promissory-notes'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbillservice.CheckBillService === "undefined" ? Object : _checkbillservice.CheckBillService
    ])
], CheckBillController);

//# sourceMappingURL=check-bill.controller.js.map