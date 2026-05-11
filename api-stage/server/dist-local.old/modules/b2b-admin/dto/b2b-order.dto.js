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
    get B2bOrderListQueryDto () {
        return B2bOrderListQueryDto;
    },
    get PatchB2bOrderStatusDto () {
        return PatchB2bOrderStatusDto;
    },
    get RejectB2bOrderDto () {
        return RejectB2bOrderDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _classvalidator = require("class-validator");
const _paginationquerydto = require("./pagination-query.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bOrderListQueryDto = class B2bOrderListQueryDto extends _paginationquerydto.PaginationQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.B2BOrderStatus
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.B2BOrderStatus),
    _ts_metadata("design:type", typeof _client.B2BOrderStatus === "undefined" ? Object : _client.B2BOrderStatus)
], B2bOrderListQueryDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bOrderListQueryDto.prototype, "customerId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bOrderListQueryDto.prototype, "salespersonId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bOrderListQueryDto.prototype, "from", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bOrderListQueryDto.prototype, "to", void 0);
let PatchB2bOrderStatusDto = class PatchB2bOrderStatusDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.B2BOrderStatus
    }),
    (0, _classvalidator.IsEnum)(_client.B2BOrderStatus),
    _ts_metadata("design:type", typeof _client.B2BOrderStatus === "undefined" ? Object : _client.B2BOrderStatus)
], PatchB2bOrderStatusDto.prototype, "status", void 0);
let RejectB2bOrderDto = class RejectB2bOrderDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RejectB2bOrderDto.prototype, "reason", void 0);

//# sourceMappingURL=b2b-order.dto.js.map