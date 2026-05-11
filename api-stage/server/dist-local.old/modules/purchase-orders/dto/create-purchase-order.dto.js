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
    get CreatePurchaseOrderDto () {
        return CreatePurchaseOrderDto;
    },
    get CreatePurchaseOrderItemDto () {
        return CreatePurchaseOrderItemDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _swagger = require("@nestjs/swagger");
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
let CreatePurchaseOrderItemDto = class CreatePurchaseOrderItemDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderItemDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "quantity", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "unitPrice", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "vatRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "discountRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "discountAmount", void 0);
let CreatePurchaseOrderDto = class CreatePurchaseOrderDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "orderNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "dueDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "discount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.PurchaseOrderLocalStatus),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        enum: _client.PurchaseOrderLocalStatus,
        required: false
    }),
    _ts_metadata("design:type", typeof _client.PurchaseOrderLocalStatus === "undefined" ? Object : _client.PurchaseOrderLocalStatus)
], CreatePurchaseOrderDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreatePurchaseOrderItemDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreatePurchaseOrderItemDto
        ]
    }),
    _ts_metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "items", void 0);

//# sourceMappingURL=create-purchase-order.dto.js.map