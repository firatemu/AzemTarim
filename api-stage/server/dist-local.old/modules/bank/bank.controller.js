"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankController", {
    enumerable: true,
    get: function() {
        return BankController;
    }
});
const _common = require("@nestjs/common");
const _bankservice = require("./bank.service");
const _createbankdto = require("./dto/create-bank.dto");
const _createaccountdto = require("./dto/create-account.dto");
const _createmovementdto = require("./dto/create-movement.dto");
const _createloandto = require("./dto/create-loan.dto");
const _paycreditinstallmentdto = require("./dto/pay-credit-installment.dto");
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
let BankController = class BankController {
    ping() {
        return 'pong';
    }
    // ============ BANK ENDPOINTS ============
    create(createBankDto) {
        return this.bankService.create(createBankDto);
    }
    findAll() {
        return this.bankService.findAll();
    }
    getBanksSummary() {
        return this.bankService.getBanksSummary();
    }
    getBanksOzet() {
        return this.bankService.getBanksSummary();
    }
    // ============ HAREKET ENDPOINTS ============
    getMovements(accountId, start, end, limit) {
        return this.bankService.getMovements(accountId, {
            startDate: start ? new Date(start) : undefined,
            endDate: end ? new Date(end) : undefined,
            limit: limit ? parseInt(limit) : undefined
        });
    }
    createMovement(accountId, dto) {
        return this.bankService.createMovement(accountId, dto);
    }
    createPosMovement(accountId, dto) {
        return this.bankService.createPosMovement(accountId, dto);
    }
    // ============ KREDİ İŞLEMLERİ ============
    getAllLoans() {
        return this.bankService.getAllLoans();
    }
    useLoan(accountId, dto) {
        return this.bankService.useLoan(accountId, dto);
    }
    getLoans(accountId) {
        return this.bankService.getLoans(accountId);
    }
    getLoanDetail(loanId) {
        return this.bankService.getLoanDetail(loanId);
    }
    getUpcomingCreditCardDates(start, end) {
        return this.bankService.getUpcomingCreditCardDates(start ? new Date(start) : new Date(), end ? new Date(end) : new Date());
    }
    getUpcomingInstallments(start, end) {
        return this.bankService.getUpcomingInstallments(start ? new Date(start) : new Date(), end ? new Date(end) : new Date());
    }
    addLoanPlan(loanId, dto) {
        return this.bankService.addLoanPlan(loanId, {
            amount: dto.amount,
            dueDate: new Date(dto.dueDate)
        });
    }
    updateLoanPlan(id, dto) {
        return this.bankService.updateLoanPlan(id, {
            amount: dto.amount,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
        });
    }
    deleteLoanPlan(id) {
        return this.bankService.deleteLoanPlan(id);
    }
    payInstallment(id, dto) {
        return this.bankService.payInstallment(id, dto);
    }
    // ============ HESAP İŞLEMLERİ ============
    findAllAccounts() {
        return this.bankService.findAllAccounts();
    }
    createAccount(id, dto) {
        return this.bankService.createAccount(id, dto);
    }
    findAccount(id) {
        return this.bankService.findAccount(id);
    }
    updateAccount(id, dto) {
        return this.bankService.updateAccount(id, dto);
    }
    removeAccount(id) {
        return this.bankService.removeAccount(id);
    }
    // ============ GENERIC BANK ENDPOINTS ============
    findOne(id) {
        return this.bankService.findOne(id);
    }
    update(id, updateBankDto) {
        return this.bankService.update(id, updateBankDto);
    }
    remove(id) {
        return this.bankService.remove(id);
    }
    constructor(bankService){
        this.bankService = bankService;
        console.log('BankController initialized');
    }
};
_ts_decorate([
    (0, _common.Get)('ping'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "ping", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createbankdto.CreateBankDto === "undefined" ? Object : _createbankdto.CreateBankDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('summary'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getBanksSummary", null);
_ts_decorate([
    (0, _common.Get)('ozet'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getBanksOzet", null);
_ts_decorate([
    (0, _common.Get)('accounts/:accountId/movements'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_param(1, (0, _common.Query)('start')),
    _ts_param(2, (0, _common.Query)('end')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getMovements", null);
_ts_decorate([
    (0, _common.Post)('accounts/:accountId/movements'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createmovementdto.CreateBankMovementDto === "undefined" ? Object : _createmovementdto.CreateBankMovementDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "createMovement", null);
_ts_decorate([
    (0, _common.Post)('accounts/:accountId/pos-payments'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createmovementdto.CreatePosMovementDto === "undefined" ? Object : _createmovementdto.CreatePosMovementDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "createPosMovement", null);
_ts_decorate([
    (0, _common.Get)('loans'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getAllLoans", null);
_ts_decorate([
    (0, _common.Post)('accounts/:accountId/loans/use'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createloandto.CreateLoanUsageDto === "undefined" ? Object : _createloandto.CreateLoanUsageDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "useLoan", null);
_ts_decorate([
    (0, _common.Get)('accounts/:accountId/loans'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getLoans", null);
_ts_decorate([
    (0, _common.Get)('loans/:loanId'),
    _ts_param(0, (0, _common.Param)('loanId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getLoanDetail", null);
_ts_decorate([
    (0, _common.Get)('credit-cards/upcoming'),
    _ts_param(0, (0, _common.Query)('start')),
    _ts_param(1, (0, _common.Query)('end')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getUpcomingCreditCardDates", null);
_ts_decorate([
    (0, _common.Get)('installments/upcoming'),
    _ts_param(0, (0, _common.Query)('start')),
    _ts_param(1, (0, _common.Query)('end')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "getUpcomingInstallments", null);
_ts_decorate([
    (0, _common.Post)('loans/:loanId/plans'),
    _ts_param(0, (0, _common.Param)('loanId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "addLoanPlan", null);
_ts_decorate([
    (0, _common.Put)('loan-plans/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "updateLoanPlan", null);
_ts_decorate([
    (0, _common.Delete)('loan-plans/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "deleteLoanPlan", null);
_ts_decorate([
    (0, _common.Post)('loan-plans/:id/payments'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _paycreditinstallmentdto.PayCreditInstallmentDto === "undefined" ? Object : _paycreditinstallmentdto.PayCreditInstallmentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "payInstallment", null);
_ts_decorate([
    (0, _common.Get)('accounts'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "findAllAccounts", null);
_ts_decorate([
    (0, _common.Post)(':id/accounts'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createaccountdto.BankAccountCreateDto === "undefined" ? Object : _createaccountdto.BankAccountCreateDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "createAccount", null);
_ts_decorate([
    (0, _common.Get)('accounts/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "findAccount", null);
_ts_decorate([
    (0, _common.Put)('accounts/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createaccountdto.BankAccountUpdateDto === "undefined" ? Object : _createaccountdto.BankAccountUpdateDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "updateAccount", null);
_ts_decorate([
    (0, _common.Delete)('accounts/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "removeAccount", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createbankdto.UpdateBankDto === "undefined" ? Object : _createbankdto.UpdateBankDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BankController.prototype, "remove", null);
BankController = _ts_decorate([
    (0, _common.Controller)('banks'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bankservice.BankService === "undefined" ? Object : _bankservice.BankService
    ])
], BankController);

//# sourceMappingURL=bank.controller.js.map