"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExpenseController", {
    enumerable: true,
    get: function() {
        return ExpenseController;
    }
});
const _common = require("@nestjs/common");
const _expenseservice = require("./expense.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createexpensedto = require("./dto/create-expense.dto");
const _updateexpensedto = require("./dto/update-expense.dto");
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
let ExpenseController = class ExpenseController {
    getStats(categoryId, startDate, endDate) {
        return this.expenseService.getStats(categoryId, startDate, endDate);
    }
    findAllCategoryler() {
        return this.expenseService.findAllCategoryler();
    }
    findAll(page, limit, categoryId, startDate, endDate) {
        return this.expenseService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, categoryId, startDate, endDate);
    }
    findOne(id) {
        return this.expenseService.findOne(id);
    }
    create(createDto) {
        return this.expenseService.create(createDto);
    }
    createCategory(body) {
        return this.expenseService.createCategory(body.name, body.notes);
    }
    updateCategory(id, body) {
        return this.expenseService.updateCategory(id, body.name, body.notes);
    }
    removeCategory(id) {
        return this.expenseService.removeCategory(id);
    }
    update(id, updateDto) {
        return this.expenseService.update(id, updateDto);
    }
    remove(id) {
        return this.expenseService.remove(id);
    }
    constructor(expenseService){
        this.expenseService = expenseService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_param(0, (0, _common.Query)('categoryId')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('categoryler'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "findAllCategoryler", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('categoryId')),
    _ts_param(3, (0, _common.Query)('startDate')),
    _ts_param(4, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createexpensedto.CreateExpenseDto === "undefined" ? Object : _createexpensedto.CreateExpenseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)('categoryler'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "createCategory", null);
_ts_decorate([
    (0, _common.Put)('categoryler/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "updateCategory", null);
_ts_decorate([
    (0, _common.Delete)('categoryler/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "removeCategory", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateexpensedto.UpdateExpenseDto === "undefined" ? Object : _updateexpensedto.UpdateExpenseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ExpenseController.prototype, "remove", null);
ExpenseController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('expenses'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _expenseservice.ExpenseService === "undefined" ? Object : _expenseservice.ExpenseService
    ])
], ExpenseController);

//# sourceMappingURL=expense.controller.js.map