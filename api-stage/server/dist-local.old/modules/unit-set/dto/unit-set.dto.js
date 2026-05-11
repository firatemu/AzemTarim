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
    get CreateUnitDto () {
        return CreateUnitDto;
    },
    get CreateUnitSetDto () {
        return CreateUnitSetDto;
    },
    get UpdateUnitSetDto () {
        return UpdateUnitSetDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateUnitDto = class CreateUnitDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Birim adı zorunludur.'
    }),
    (0, _classvalidator.IsString)({
        message: 'Birim adı metin olmalıdır.'
    }),
    _ts_metadata("design:type", String)
], CreateUnitDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)({
        message: 'GİB kodu metin olmalıdır.'
    }),
    _ts_metadata("design:type", String)
], CreateUnitDto.prototype, "code", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)({}, {
        message: 'Katsayı sayı olmalıdır.'
    }),
    (0, _classvalidator.Min)(0.0001, {
        message: 'Katsayı 0\'dan büyük olmalıdır.'
    }),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "conversionRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)({
        message: 'Ana birim alanı boolean olmalıdır.'
    }),
    _ts_metadata("design:type", Boolean)
], CreateUnitDto.prototype, "isBaseUnit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)({
        message: 'Bölünebilirlik alanı boolean olmalıdır.'
    }),
    _ts_metadata("design:type", Boolean)
], CreateUnitDto.prototype, "isDivisible", void 0);
let CreateUnitSetDto = class CreateUnitSetDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Birim seti adı zorunludur.'
    }),
    (0, _classvalidator.IsString)({
        message: 'Birim seti adı metin olmalıdır.'
    }),
    _ts_metadata("design:type", String)
], CreateUnitSetDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)({
        message: 'Açıklama metin olmalıdır.'
    }),
    _ts_metadata("design:type", String)
], CreateUnitSetDto.prototype, "description", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)({
        message: 'Birimler dizi olmalıdır.'
    }),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateUnitDto),
    (0, _classvalidator.ArrayMinSize)(1, {
        message: 'En az bir birim tanımlanmalıdır.'
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], CreateUnitSetDto.prototype, "units", void 0);
let UpdateUnitSetDto = class UpdateUnitSetDto extends CreateUnitSetDto {
};

//# sourceMappingURL=unit-set.dto.js.map