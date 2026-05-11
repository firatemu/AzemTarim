"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountMovementController", {
    enumerable: true,
    get: function() {
        return AccountMovementController;
    }
});
const _common = require("@nestjs/common");
const _accountmovementservice = require("./account-movement.service");
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
let AccountMovementController = class AccountMovementController {
    async create(dto) {
        return this.accountMovementService.create(dto);
    }
    async findAll(accountId, skip, take) {
        return this.accountMovementService.findAll(accountId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 100);
    }
    async getStatement(query) {
        return this.accountMovementService.getStatement(query);
    }
    async exportExcel(query, res) {
        try {
            const buffer = await this.accountMovementService.exportExcel(query);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="account-statement-${Date.now()}.xlsx"`,
                'Content-Length': buffer.length
            });
            res.send(buffer);
        } catch (error) {
            res.status(_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Excel oluşturulurken hata oluştu',
                error: error.message
            });
        }
    }
    async exportPdf(query, res) {
        try {
            const buffer = await this.accountMovementService.exportPdf(query);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="account-statement-${Date.now()}.pdf"`,
                'Content-Length': buffer.length
            });
            res.send(buffer);
        } catch (error) {
            res.status(_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'PDF oluşturulurken hata oluştu',
                error: error.message
            });
        }
    }
    async delete(id) {
        return this.accountMovementService.delete(id);
    }
    constructor(accountMovementService){
        this.accountMovementService = accountMovementService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateAccountMovementDto === "undefined" ? Object : _dto.CreateAccountMovementDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('accountId')),
    _ts_param(1, (0, _common.Query)('skip')),
    _ts_param(2, (0, _common.Query)('take')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('statement'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.StatementQueryDto === "undefined" ? Object : _dto.StatementQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "getStatement", null);
_ts_decorate([
    (0, _common.Get)('statement/excel'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.StatementQueryDto === "undefined" ? Object : _dto.StatementQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)('statement/pdf'),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.StatementQueryDto === "undefined" ? Object : _dto.StatementQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "exportPdf", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AccountMovementController.prototype, "delete", null);
AccountMovementController = _ts_decorate([
    (0, _common.Controller)('account-movements'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _accountmovementservice.AccountMovementService === "undefined" ? Object : _accountmovementservice.AccountMovementService
    ])
], AccountMovementController);

//# sourceMappingURL=account-movement.controller.js.map