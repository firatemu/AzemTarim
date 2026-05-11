"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get CreateSalaryPaymentDto () {
        return CreateSalaryPaymentDto;
    },
    get SalaryPaymentDetailDto () {
        return SalaryPaymentDetailDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SalaryPaymentDetailDto = class SalaryPaymentDetailDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Ödeme tipi zorunludur'
    }),
    (0, _classvalidator.IsEnum)(_client.PaymentMethod),
    _ts_metadata("design:type", typeof _client.PaymentMethod === "undefined" ? Object : _client.PaymentMethod)
], SalaryPaymentDetailDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Tutar zorunludur'
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0.01, {
        message: 'Tutar 0\'dan büyük olmalıdır'
    }),
    _ts_metadata("design:type", Number)
], SalaryPaymentDetailDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SalaryPaymentDetailDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SalaryPaymentDetailDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SalaryPaymentDetailDto.prototype, "referenceNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SalaryPaymentDetailDto.prototype, "notes", void 0);
let CreateSalaryPaymentDto = class CreateSalaryPaymentDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Plan ID zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "salaryPlanId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Personel ID zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "employeeId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Tutar zorunludur'
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0.01, {
        message: 'Tutar 0\'dan büyük olmalıdır'
    }),
    _ts_metadata("design:type", Number)
], CreateSalaryPaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], CreateSalaryPaymentDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Ödeme detayları zorunludur'
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>SalaryPaymentDetailDto),
    _ts_metadata("design:type", Array)
], CreateSalaryPaymentDto.prototype, "paymentDetails", void 0);

//# sourceMappingURL=create-salary-payment.dto.js.map