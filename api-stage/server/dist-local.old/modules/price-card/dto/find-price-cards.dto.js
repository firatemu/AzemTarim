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
    get FindAllPriceCardsDto () {
        return FindAllPriceCardsDto;
    },
    get FindPriceCardsDto () {
        return FindPriceCardsDto;
    },
    get LatestPriceQueryDto () {
        return LatestPriceQueryDto;
    }
});
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _createpricecarddto = require("./create-price-card.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let FindPriceCardsDto = class FindPriceCardsDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(_createpricecarddto.PriceType),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", typeof _createpricecarddto.PriceType === "undefined" ? Object : _createpricecarddto.PriceType)
], FindPriceCardsDto.prototype, "type", void 0);
let FindAllPriceCardsDto = class FindAllPriceCardsDto extends FindPriceCardsDto {
    constructor(...args){
        super(...args), this.page = 1, this.limit = 10;
    }
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], FindAllPriceCardsDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], FindAllPriceCardsDto.prototype, "limit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], FindAllPriceCardsDto.prototype, "q", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], FindAllPriceCardsDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], FindAllPriceCardsDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], FindAllPriceCardsDto.prototype, "endDate", void 0);
let LatestPriceQueryDto = class LatestPriceQueryDto extends FindPriceCardsDto {
};

//# sourceMappingURL=find-price-cards.dto.js.map