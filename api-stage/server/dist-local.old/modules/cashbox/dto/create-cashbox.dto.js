"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCashboxDto", {
    enumerable: true,
    get: function() {
        return CreateCashboxDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _cashboxenums = require("../cashbox.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCashboxDto = class CreateCashboxDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxDto.prototype, "code", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateCashboxDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_cashboxenums.CashboxType),
    (0, _swagger.ApiProperty)({
        enum: _cashboxenums.CashboxType
    }),
    _ts_metadata("design:type", typeof _cashboxenums.CashboxType === "undefined" ? Object : _cashboxenums.CashboxType)
], CreateCashboxDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false,
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], CreateCashboxDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false,
        default: false
    }),
    _ts_metadata("design:type", Boolean)
], CreateCashboxDto.prototype, "isRetail", void 0);

//# sourceMappingURL=create-cashbox.dto.js.map