"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QueryOrderDto", {
    enumerable: true,
    get: function() {
        return QueryOrderDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _orderenums = require("../order.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let QueryOrderDto = class QueryOrderDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], QueryOrderDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], QueryOrderDto.prototype, "limit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_orderenums.OrderType),
    (0, _swagger.ApiProperty)({
        enum: _orderenums.OrderType,
        required: false
    }),
    _ts_metadata("design:type", typeof _orderenums.OrderType === "undefined" ? Object : _orderenums.OrderType)
], QueryOrderDto.prototype, "orderType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_orderenums.SalesOrderStatus),
    (0, _swagger.ApiProperty)({
        enum: _orderenums.SalesOrderStatus,
        required: false
    }),
    _ts_metadata("design:type", typeof _orderenums.SalesOrderStatus === "undefined" ? Object : _orderenums.SalesOrderStatus)
], QueryOrderDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], QueryOrderDto.prototype, "search", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], QueryOrderDto.prototype, "accountId", void 0);

//# sourceMappingURL=query-order.dto.js.map