"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCollectionDto", {
    enumerable: true,
    get: function() {
        return CreateCollectionDto;
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
/** Swagger circular dependency önleme - literal array */ const COLLECTION_TYPE_VALUES = [
    'COLLECTION',
    'PAYMENT'
];
const PAYMENT_METHOD_VALUES = [
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'CHECK',
    'PROMISSORY_NOTE',
    'GIFT_CARD',
    'LOAN_ACCOUNT'
];
let CreateCollectionDto = class CreateCollectionDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "invoiceId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "serviceInvoiceId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_collectionenums.CollectionType),
    (0, _swagger.ApiProperty)({
        enum: COLLECTION_TYPE_VALUES
    }),
    _ts_metadata("design:type", typeof _collectionenums.CollectionType === "undefined" ? Object : _collectionenums.CollectionType)
], CreateCollectionDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateCollectionDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_collectionenums.PaymentMethod),
    (0, _swagger.ApiProperty)({
        enum: PAYMENT_METHOD_VALUES
    }),
    _ts_metadata("design:type", typeof _collectionenums.PaymentMethod === "undefined" ? Object : _collectionenums.PaymentMethod)
], CreateCollectionDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "companyCreditCardId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCollectionDto.prototype, "salesAgentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)({
        required: false,
        description: 'Kredi karti icin taksit sayisi'
    }),
    _ts_metadata("design:type", Number)
], CreateCollectionDto.prototype, "installmentCount", void 0);

//# sourceMappingURL=create-collection.dto.js.map