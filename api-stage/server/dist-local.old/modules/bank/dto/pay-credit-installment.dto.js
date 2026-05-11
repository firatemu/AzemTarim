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
    get PayCreditInstallmentDto () {
        return PayCreditInstallmentDto;
    },
    get PaymentType () {
        return PaymentType;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var PaymentType = /*#__PURE__*/ function(PaymentType) {
    PaymentType["BANKA_HAVALESI"] = "BANKA_HAVALESI";
    PaymentType["CASH"] = "CASH";
    PaymentType["ELDEN"] = "ELDEN";
    return PaymentType;
}({});
let PayCreditInstallmentDto = class PayCreditInstallmentDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(PaymentType),
    (0, _swagger.ApiProperty)({
        enum: PaymentType
    }),
    _ts_metadata("design:type", String)
], PayCreditInstallmentDto.prototype, "paymentType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], PayCreditInstallmentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.paymentType === "BANKA_HAVALESI"),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], PayCreditInstallmentDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.paymentType === "CASH"),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], PayCreditInstallmentDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], PayCreditInstallmentDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], PayCreditInstallmentDto.prototype, "paymentDate", void 0);

//# sourceMappingURL=pay-credit-installment.dto.js.map