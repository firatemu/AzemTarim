"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalaryPlanController", {
    enumerable: true,
    get: function() {
        return SalaryPlanController;
    }
});
const _common = require("@nestjs/common");
const _salaryplanservice = require("./salary-plan.service");
const _createsalaryplandto = require("./dto/create-salary-plan.dto");
const _updatesalaryplandto = require("./dto/update-salary-plan.dto");
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
let SalaryPlanController = class SalaryPlanController {
    create(createDto) {
        return this.salaryPlanService.createPlanForEmployee(createDto);
    }
    getPlanByEmployee(employeeId, year) {
        return this.salaryPlanService.getPlanByEmployee(employeeId, parseInt(year));
    }
    getOdenecekMaaslar(year, month) {
        return this.salaryPlanService.getOdenecekMaaslar(parseInt(year), parseInt(month));
    }
    getPlanById(id) {
        return this.salaryPlanService.getPlanById(id);
    }
    update(id, updateDto) {
        return this.salaryPlanService.updatePlan(id, updateDto);
    }
    delete(id) {
        return this.salaryPlanService.deletePlan(id);
    }
    deleteYillikPlan(employeeId, year) {
        return this.salaryPlanService.deleteYillikPlan(employeeId, parseInt(year));
    }
    constructor(salaryPlanService){
        this.salaryPlanService = salaryPlanService;
    }
};
_ts_decorate([
    (0, _common.Post)('create'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsalaryplandto.CreateSalaryPlanDto === "undefined" ? Object : _createsalaryplandto.CreateSalaryPlanDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('employee/:employeeId/:year'),
    _ts_param(0, (0, _common.Param)('employeeId')),
    _ts_param(1, (0, _common.Param)('year')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "getPlanByEmployee", null);
_ts_decorate([
    (0, _common.Get)('odenecek/:year/:month'),
    _ts_param(0, (0, _common.Param)('year')),
    _ts_param(1, (0, _common.Param)('month')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "getOdenecekMaaslar", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "getPlanById", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesalaryplandto.UpdateSalaryPlanDto === "undefined" ? Object : _updatesalaryplandto.UpdateSalaryPlanDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "delete", null);
_ts_decorate([
    (0, _common.Delete)('yearlik/:employeeId/:year'),
    _ts_param(0, (0, _common.Param)('employeeId')),
    _ts_param(1, (0, _common.Param)('year')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPlanController.prototype, "deleteYillikPlan", null);
SalaryPlanController = _ts_decorate([
    (0, _common.Controller)('salary-plans'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _salaryplanservice.SalaryPlanService === "undefined" ? Object : _salaryplanservice.SalaryPlanService
    ])
], SalaryPlanController);

//# sourceMappingURL=salary-plan.controller.js.map