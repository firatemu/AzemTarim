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
    get CreatePosSaleDto () {
        return CreatePosSaleDto;
    },
    get DiscountType () {
        return DiscountType;
    },
    get GlobalDiscountDto () {
        return GlobalDiscountDto;
    },
    get PosPaymentDto () {
        return PosPaymentDto;
    },
    get PosSaleItemDto () {
        return PosSaleItemDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
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
var DiscountType = /*#__PURE__*/ function(DiscountType) {
    DiscountType["PCT"] = "pct";
    DiscountType["FIXED"] = "fixed";
    return DiscountType;
}({});
let PosSaleItemDto = class PosSaleItemDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosSaleItemDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosSaleItemDto.prototype, "productName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosSaleItemDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosSaleItemDto.prototype, "unitPrice", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosSaleItemDto.prototype, "vatRate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: DiscountType,
        default: "pct"
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(DiscountType),
    _ts_metadata("design:type", String)
], PosSaleItemDto.prototype, "discountType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosSaleItemDto.prototype, "discountRate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Indirim tutarı veya yüzde değeri (Frontend uyumluluğu için)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosSaleItemDto.prototype, "discountValue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosSaleItemDto.prototype, "variantId", void 0);
let PosPaymentDto = class PosPaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.PaymentMethod
    }),
    (0, _classvalidator.IsEnum)(_client.PaymentMethod),
    _ts_metadata("design:type", typeof _client.PaymentMethod === "undefined" ? Object : _client.PaymentMethod)
], PosPaymentDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], PosPaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosPaymentDto.prototype, "giftCardId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosPaymentDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PosPaymentDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        required: false,
        description: 'Kredi karti taksit sayisi'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], PosPaymentDto.prototype, "installmentCount", void 0);
let GlobalDiscountDto = class GlobalDiscountDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: DiscountType
    }),
    (0, _classvalidator.IsEnum)(DiscountType),
    _ts_metadata("design:type", String)
], GlobalDiscountDto.prototype, "type", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], GlobalDiscountDto.prototype, "value", void 0);
let CreatePosSaleDto = class CreatePosSaleDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Müşteri ID'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Sales Agent ID (Backend tablosuyla uyumlu)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "salesAgentId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Salesperson ID (Frontend alanı)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "salespersonId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Sepetteki ürünler',
        type: [
            PosSaleItemDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>PosSaleItemDto),
    _ts_metadata("design:type", Array)
], CreatePosSaleDto.prototype, "items", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Ödemeler',
        type: [
            PosPaymentDto
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>PosPaymentDto),
    _ts_metadata("design:type", Array)
], CreatePosSaleDto.prototype, "payments", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Global indirim nesnesi (Frontend uyumlu)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.ValidateNested)(),
    (0, _classtransformer.Type)(()=>GlobalDiscountDto),
    _ts_metadata("design:type", typeof GlobalDiscountDto === "undefined" ? Object : GlobalDiscountDto)
], CreatePosSaleDto.prototype, "globalDiscount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Global indirim türü',
        enum: DiscountType
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(DiscountType),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "globalDiscountType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Global indirim tutarı (yüzde veya sabit)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreatePosSaleDto.prototype, "globalDiscountValue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Kasa ID (opsiyonel)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Depo ID (opsiyonel)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "warehouseId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notlar'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tekil Not (Frontend alanı)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePosSaleDto.prototype, "note", void 0);

//# sourceMappingURL=create-pos-sale.dto.js.map