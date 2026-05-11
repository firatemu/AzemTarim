"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PatchB2bWarehouseConfigDto", {
    enumerable: true,
    get: function() {
        return PatchB2bWarehouseConfigDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
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
let PatchB2bWarehouseConfigDto = class PatchB2bWarehouseConfigDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.B2BWarehouseDisplayMode
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.B2BWarehouseDisplayMode),
    _ts_metadata("design:type", typeof _client.B2BWarehouseDisplayMode === "undefined" ? Object : _client.B2BWarehouseDisplayMode)
], PatchB2bWarehouseConfigDto.prototype, "displayMode", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], PatchB2bWarehouseConfigDto.prototype, "isActive", void 0);

//# sourceMappingURL=b2b-warehouse-config.dto.js.map