"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCompanyCreditCardDto", {
    enumerable: true,
    get: function() {
        return CreateCompanyCreditCardDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCompanyCreditCardDto = class CreateCompanyCreditCardDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "code", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "bankName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "cardType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "lastFourDigits", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0, {
        message: 'Limit 0 veya daha büyük olmalıdır. 0 creditLimitsiz anlamına gelir.'
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classtransformer.Transform)(({ value })=>{
        // String gelirse number'a çevir
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
        }
        return value;
    }),
    _ts_metadata("design:type", Number)
], CreateCompanyCreditCardDto.prototype, "creditLimit", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "statementDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCompanyCreditCardDto.prototype, "paymentDueDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateCompanyCreditCardDto.prototype, "isActive", void 0);

//# sourceMappingURL=create-company-credit-card.dto.js.map