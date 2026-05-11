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
    get CreateQuoteDto () {
        return CreateQuoteDto;
    },
    get CreateQuoteItemDto () {
        return CreateQuoteItemDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _swagger = require("@nestjs/swagger");
const _quoteenums = require("../quote.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateQuoteItemDto = class CreateQuoteItemDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateQuoteItemDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateQuoteItemDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateQuoteItemDto.prototype, "unitPrice", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateQuoteItemDto.prototype, "vatRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateQuoteItemDto.prototype, "discountRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateQuoteItemDto.prototype, "discountAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateQuoteItemDto.prototype, "notes", void 0);
let CreateQuoteDto = class CreateQuoteDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateQuoteDto.prototype, "quoteNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_quoteenums.QuoteType),
    (0, _swagger.ApiProperty)({
        enum: _quoteenums.QuoteType
    }),
    _ts_metadata("design:type", typeof _quoteenums.QuoteType === "undefined" ? Object : _quoteenums.QuoteType)
], CreateQuoteDto.prototype, "quoteType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateQuoteDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateQuoteDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateQuoteDto.prototype, "validUntil", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateQuoteDto.prototype, "discount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateQuoteDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_quoteenums.QuoteStatus),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        enum: _quoteenums.QuoteStatus,
        required: false
    }),
    _ts_metadata("design:type", typeof _quoteenums.QuoteStatus === "undefined" ? Object : _quoteenums.QuoteStatus)
], CreateQuoteDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateQuoteItemDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreateQuoteItemDto
        ]
    }),
    _ts_metadata("design:type", Array)
], CreateQuoteDto.prototype, "items", void 0);

//# sourceMappingURL=create-quote.dto.js.map