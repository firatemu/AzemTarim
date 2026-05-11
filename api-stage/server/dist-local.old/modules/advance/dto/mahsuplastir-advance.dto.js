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
    get MahsuplasmaPlanDto () {
        return MahsuplasmaPlanDto;
    },
    get MahsuplastirAdvanceDto () {
        return MahsuplastirAdvanceDto;
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
let MahsuplasmaPlanDto = class MahsuplasmaPlanDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Plan ID zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], MahsuplasmaPlanDto.prototype, "planId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Tutar zorunludur'
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0.01, {
        message: 'Tutar 0\'dan büyük olmalıdır'
    }),
    _ts_metadata("design:type", Number)
], MahsuplasmaPlanDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], MahsuplasmaPlanDto.prototype, "notes", void 0);
let MahsuplastirAdvanceDto = class MahsuplastirAdvanceDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Advance ID zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], MahsuplastirAdvanceDto.prototype, "advanceId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Mahsuplaşma planları zorunludur'
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>MahsuplasmaPlanDto),
    _ts_metadata("design:type", Array)
], MahsuplastirAdvanceDto.prototype, "planlar", void 0);

//# sourceMappingURL=mahsuplastir-advance.dto.js.map