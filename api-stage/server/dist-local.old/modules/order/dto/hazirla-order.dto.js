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
    get OrderPreparationItemDto () {
        return OrderPreparationItemDto;
    },
    get PrepareOrderDto () {
        return PrepareOrderDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
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
let OrderPreparationItemDto = class OrderPreparationItemDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], OrderPreparationItemDto.prototype, "orderItemId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], OrderPreparationItemDto.prototype, "locationId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], OrderPreparationItemDto.prototype, "quantity", void 0);
let PrepareOrderDto = class PrepareOrderDto {
};
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>OrderPreparationItemDto),
    (0, _swagger.ApiProperty)({
        type: [
            OrderPreparationItemDto
        ]
    }),
    _ts_metadata("design:type", Array)
], PrepareOrderDto.prototype, "items", void 0);

//# sourceMappingURL=hazirla-order.dto.js.map