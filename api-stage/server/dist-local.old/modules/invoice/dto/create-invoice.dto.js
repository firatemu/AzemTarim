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
    get CreateInvoiceDto () {
        return CreateInvoiceDto;
    },
    get CreateInvoiceItemDto () {
        return CreateInvoiceItemDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _swagger = require("@nestjs/swagger");
const _invoiceenums = require("../invoice.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateInvoiceItemDto = class CreateInvoiceItemDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "unitPrice", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "vatRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "discountRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "discountAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "withholdingCode", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "withholdingRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "sctRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "vatExemptionReason", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "unit", void 0);
let CreateInvoiceDto = class CreateInvoiceDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_invoiceenums.InvoiceType),
    (0, _swagger.ApiProperty)({
        enum: _invoiceenums.InvoiceType
    }),
    _ts_metadata("design:type", typeof _invoiceenums.InvoiceType === "undefined" ? Object : _invoiceenums.InvoiceType)
], CreateInvoiceDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "dueDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceDto.prototype, "discount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_invoiceenums.InvoiceStatus),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        enum: _invoiceenums.InvoiceStatus,
        required: false
    }),
    _ts_metadata("design:type", typeof _invoiceenums.InvoiceStatus === "undefined" ? Object : _invoiceenums.InvoiceStatus)
], CreateInvoiceDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "orderId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "deliveryNoteId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false,
        description: 'If true, prevents automatic delivery note creation'
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "preventAutoDeliveryNote", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "warehouseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateInvoiceItemDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreateInvoiceItemDto
        ]
    }),
    _ts_metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "salesAgentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateInvoiceDto.prototype, "exchangeRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "eScenario", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "eInvoiceType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "gibAlias", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateInvoiceDto.prototype, "shippingType", void 0);

//# sourceMappingURL=create-invoice.dto.js.map