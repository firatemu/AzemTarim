"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankAccountController", {
    enumerable: true,
    get: function() {
        return BankAccountController;
    }
});
const _common = require("@nestjs/common");
const _bankaccountservice = require("./bank-account.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createbankaccountdto = require("./dto/create-bank-account.dto");
const _updatebankaccountdto = require("./dto/update-bank-account.dto");
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
let BankAccountController = class BankAccountController {
    create(createDto) {
        return this.bankAccountService.create(createDto);
    }
    findAll(bankId, type) {
        return this.bankAccountService.findAll(bankId, type);
    }
    findOne(id) {
        return this.bankAccountService.findOne(id);
    }
    update(id, updateDto) {
        return this.bankAccountService.update(id, updateDto);
    }
    remove(id) {
        return this.bankAccountService.remove(id);
    }
    constructor(bankAccountService){
        this.bankAccountService = bankAccountService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createbankaccountdto.CreateBankAccountDto === "undefined" ? Object : _createbankaccountdto.CreateBankAccountDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankAccountController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('bankId')),
    _ts_param(1, (0, _common.Query)('type')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankAccountController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankAccountController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatebankaccountdto.UpdateBankAccountDto === "undefined" ? Object : _updatebankaccountdto.UpdateBankAccountDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankAccountController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankAccountController.prototype, "remove", null);
BankAccountController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('bank-accounts'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bankaccountservice.BankAccountService === "undefined" ? Object : _bankaccountservice.BankAccountService
    ])
], BankAccountController);

//# sourceMappingURL=bank-account.controller.js.map