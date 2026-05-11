"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalaryPaymentController", {
    enumerable: true,
    get: function() {
        return SalaryPaymentController;
    }
});
const _common = require("@nestjs/common");
const _salarypaymentservice = require("./salary-payment.service");
const _createsalarypaymentdto = require("./dto/create-salary-payment.dto");
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
let SalaryPaymentController = class SalaryPaymentController {
    create(createDto, req) {
        return this.salaryPaymentService.createOdeme(createDto, req.user.userId);
    }
    getOdemelerByPlan(salaryPlanId) {
        return this.salaryPaymentService.getOdemelerByPlan(salaryPlanId);
    }
    getOdemelerByPersonel(employeeId, year) {
        return this.salaryPaymentService.getOdemelerByPersonel(employeeId, parseInt(year));
    }
    async exportExcel(year, month, res) {
        const workbook = await this.salaryPaymentService.exportExcel(parseInt(year), parseInt(month));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=maas-listesi-${year}-${month}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async getMakbuz(id, res) {
        const pdfDoc = await this.salaryPaymentService.generateMakbuz(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=odeme-makbuzu-${id}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    constructor(salaryPaymentService){
        this.salaryPaymentService = salaryPaymentService;
    }
};
_ts_decorate([
    (0, _common.Post)('create'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsalarypaymentdto.CreateSalaryPaymentDto === "undefined" ? Object : _createsalarypaymentdto.CreateSalaryPaymentDto,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPaymentController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('plan/:salaryPlanId'),
    _ts_param(0, (0, _common.Param)('salaryPlanId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalaryPaymentController.prototype, "getOdemelerByPlan", null);
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
], SalaryPaymentController.prototype, "getOdemelerByPersonel", null);
_ts_decorate([
    (0, _common.Get)('export/excel/:year/:month'),
    _ts_param(0, (0, _common.Param)('year')),
    _ts_param(1, (0, _common.Param)('month')),
    _ts_param(2, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], SalaryPaymentController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)('makbuz/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], SalaryPaymentController.prototype, "getMakbuz", null);
SalaryPaymentController = _ts_decorate([
    (0, _common.Controller)('salary-payments'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _salarypaymentservice.SalaryPaymentService === "undefined" ? Object : _salarypaymentservice.SalaryPaymentService
    ])
], SalaryPaymentController);

//# sourceMappingURL=salary-payment.controller.js.map