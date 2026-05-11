"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankTransferController", {
    enumerable: true,
    get: function() {
        return BankTransferController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _createbanktransferdto = require("./dto/create-bank-transfer.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _banktransferservice = require("./bank-transfer.service");
const _filterbanktransferdto = require("./dto/filter-bank-transfer.dto");
const _updatebanktransferdto = require("./dto/update-bank-transfer.dto");
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
let BankTransferController = class BankTransferController {
    // Özel route'lar önce tanımlanmalı (stats, deleted vb.)
    getStats(cashboxId, startDate, endDate, transferType) {
        return this.bankTransferService.getStats(cashboxId, startDate, endDate, transferType);
    }
    findDeleted() {
        return this.bankTransferService.findDeleted();
    }
    // Genel listele endpoint'i
    findAll(filterDto) {
        return this.bankTransferService.findAll(filterDto);
    }
    // Parametrik route'lar en sona konmalı
    findOne(id) {
        return this.bankTransferService.findOne(id);
    }
    create(createDto, user) {
        return this.bankTransferService.create(createDto, user?.userId);
    }
    update(id, updateDto, user) {
        return this.bankTransferService.update(id, updateDto, user?.userId);
    }
    remove(id, user, reason) {
        return this.bankTransferService.remove(id, user?.userId, reason);
    }
    constructor(bankTransferService){
        this.bankTransferService = bankTransferService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    (0, _swagger.ApiQuery)({
        name: 'transferType',
        enum: _createbanktransferdto.TransferType,
        required: false
    }),
    _ts_param(0, (0, _common.Query)('cashboxId')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_param(3, (0, _common.Query)('transferType')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof _createbanktransferdto.TransferType === "undefined" ? Object : _createbanktransferdto.TransferType
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('deleted'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "findDeleted", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _filterbanktransferdto.FilterBankTransferDto === "undefined" ? Object : _filterbanktransferdto.FilterBankTransferDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createbanktransferdto.CreateBankTransferDto === "undefined" ? Object : _createbanktransferdto.CreateBankTransferDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatebanktransferdto.UpdateBankTransferDto === "undefined" ? Object : _updatebanktransferdto.UpdateBankTransferDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Query)('reason')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankTransferController.prototype, "remove", null);
BankTransferController = _ts_decorate([
    (0, _swagger.ApiTags)('bank-transfer'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('bank-transfer'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _banktransferservice.BankTransferService === "undefined" ? Object : _banktransferservice.BankTransferService
    ])
], BankTransferController);

//# sourceMappingURL=bank-transfer.controller.js.map