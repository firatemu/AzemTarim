"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCrossPaymentDto", {
    enumerable: true,
    get: function() {
        return CreateCrossPaymentDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _collectionenums = require("../collection.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCrossPaymentDto = class CreateCrossPaymentDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateCrossPaymentDto.prototype, "collectionAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateCrossPaymentDto.prototype, "paymentAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateCrossPaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCrossPaymentDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_collectionenums.PaymentMethod),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        enum: _collectionenums.PaymentMethod,
        required: false
    }),
    _ts_metadata("design:type", typeof _collectionenums.PaymentMethod === "undefined" ? Object : _collectionenums.PaymentMethod)
], CreateCrossPaymentDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCrossPaymentDto.prototype, "notes", void 0);

//# sourceMappingURL=create-cross-payment.dto.js.map