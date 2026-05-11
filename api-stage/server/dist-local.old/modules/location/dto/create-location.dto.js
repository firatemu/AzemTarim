"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateLocationDto", {
    enumerable: true,
    get: function() {
        return CreateLocationDto;
    }
});
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
let CreateLocationDto = class CreateLocationDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateLocationDto.prototype, "warehouseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(3),
    (0, _classvalidator.ValidateIf)((o)=>!o.code),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateLocationDto.prototype, "layer", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Matches)(/^[A-T]$/, {
        message: 'Koridor A ile T arasında olmalı'
    }),
    (0, _classvalidator.ValidateIf)((o)=>!o.code),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateLocationDto.prototype, "corridor", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.IsIn)([
        1,
        2
    ], {
        message: 'Taraf 1 (Sol) veya 2 (Sağ) olmalı'
    }),
    (0, _classvalidator.ValidateIf)((o)=>!o.code),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateLocationDto.prototype, "side", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(99),
    (0, _classvalidator.ValidateIf)((o)=>!o.code),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateLocationDto.prototype, "section", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(50),
    (0, _classvalidator.ValidateIf)((o)=>!o.code),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateLocationDto.prototype, "level", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.ValidateIf)((o)=>!o.layer && !o.corridor && !o.side && !o.section && !o.level),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateLocationDto.prototype, "code", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateLocationDto.prototype, "barcode", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateLocationDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateLocationDto.prototype, "active", void 0);

//# sourceMappingURL=create-location.dto.js.map