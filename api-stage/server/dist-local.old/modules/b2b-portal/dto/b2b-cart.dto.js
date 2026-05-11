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
    get B2bAddCartItemDto () {
        return B2bAddCartItemDto;
    },
    get B2bCartItemIdParamDto () {
        return B2bCartItemIdParamDto;
    },
    get B2bPlaceOrderDto () {
        return B2bPlaceOrderDto;
    },
    get B2bUpdateCartItemDto () {
        return B2bUpdateCartItemDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bAddCartItemDto = class B2bAddCartItemDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'B2BProduct.id'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(1),
    _ts_metadata("design:type", String)
], B2bAddCartItemDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        minimum: 1
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], B2bAddCartItemDto.prototype, "quantity", void 0);
let B2bUpdateCartItemDto = class B2bUpdateCartItemDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        minimum: 1
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], B2bUpdateCartItemDto.prototype, "quantity", void 0);
let B2bCartItemIdParamDto = class B2bCartItemIdParamDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(1),
    _ts_metadata("design:type", String)
], B2bCartItemIdParamDto.prototype, "itemId", void 0);
let B2bPlaceOrderDto = class B2bPlaceOrderDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'B2BDeliveryMethod.id'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(1),
    _ts_metadata("design:type", String)
], B2bPlaceOrderDto.prototype, "deliveryMethodId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPlaceOrderDto.prototype, "deliveryBranchId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPlaceOrderDto.prototype, "deliveryBranchName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPlaceOrderDto.prototype, "note", void 0);

//# sourceMappingURL=b2b-cart.dto.js.map