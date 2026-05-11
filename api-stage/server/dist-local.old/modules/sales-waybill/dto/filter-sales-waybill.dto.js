"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FilterSalesWaybillDto", {
    enumerable: true,
    get: function() {
        return FilterSalesWaybillDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _saleswaybillenums = require("../sales-waybill.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let FilterSalesWaybillDto = class FilterSalesWaybillDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "limit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_saleswaybillenums.DeliveryNoteStatus),
    (0, _swagger.ApiProperty)({
        enum: _saleswaybillenums.DeliveryNoteStatus,
        required: false
    }),
    _ts_metadata("design:type", typeof _saleswaybillenums.DeliveryNoteStatus === "undefined" ? Object : _saleswaybillenums.DeliveryNoteStatus)
], FilterSalesWaybillDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "search", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], FilterSalesWaybillDto.prototype, "endDate", void 0);

//# sourceMappingURL=filter-sales-waybill.dto.js.map