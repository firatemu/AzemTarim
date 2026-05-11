"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmployeeController", {
    enumerable: true,
    get: function() {
        return EmployeeController;
    }
});
const _common = require("@nestjs/common");
const _employeeservice = require("./employee.service");
const _createemployeedto = require("./dto/create-employee.dto");
const _updateemployeedto = require("./dto/update-employee.dto");
const _createemployeepaymentdto = require("./dto/create-employee-payment.dto");
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
let EmployeeController = class EmployeeController {
    // Özel route'lar önce tanımlanmalı
    async getStats(department, isActive) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.employeeService.getStats(department, isActiveBoolean);
    }
    async getDepartmanlar() {
        return this.employeeService.getDepartmanlar();
    }
    // Genel listele endpoint'i
    async findAll(isActive, department) {
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.employeeService.findAll(isActiveBoolean, department);
    }
    async create(createDto, req) {
        return this.employeeService.create(createDto, req.user.userId);
    }
    // Parametrik route'lar en sona konmalı
    async findOne(id) {
        return this.employeeService.findOne(id);
    }
    async update(id, updateDto, req) {
        return this.employeeService.update(id, updateDto, req.user.userId);
    }
    async remove(id) {
        return this.employeeService.remove(id);
    }
    // Ödeme işlemleri
    async createOdeme(createOdemeDto, req) {
        return this.employeeService.createOdeme(createOdemeDto, req.user.userId);
    }
    async getOdemeler(employeeId) {
        return this.employeeService.getOdemeler(employeeId);
    }
    constructor(employeeService){
        this.employeeService = employeeService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_param(0, (0, _common.Query)('department')),
    _ts_param(1, (0, _common.Query)('isActive')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('departmentlar'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "getDepartmanlar", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('isActive')),
    _ts_param(1, (0, _common.Query)('department')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createemployeedto.CreateEmployeeDto === "undefined" ? Object : _createemployeedto.CreateEmployeeDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateemployeedto.UpdateEmployeeDto === "undefined" ? Object : _updateemployeedto.UpdateEmployeeDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)('odeme'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createemployeepaymentdto.CreateEmployeeOdemeDto === "undefined" ? Object : _createemployeepaymentdto.CreateEmployeeOdemeDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "createOdeme", null);
_ts_decorate([
    (0, _common.Get)(':id/payments'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], EmployeeController.prototype, "getOdemeler", null);
EmployeeController = _ts_decorate([
    (0, _common.Controller)('employees'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _employeeservice.EmployeeService === "undefined" ? Object : _employeeservice.EmployeeService
    ])
], EmployeeController);

//# sourceMappingURL=employee.controller.js.map