"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BulkUpdatePriceCardDto", {
    enumerable: true,
    get: function() {
        return BulkUpdatePriceCardDto;
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
let BulkUpdatePriceCardDto = class BulkUpdatePriceCardDto {
    constructor(){
        this.basePriceType = 'SALE';
    }
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "marka", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "anaKategori", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "altKategori", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'percentage',
        'fixed'
    ]),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "adjustmentType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)([
        'SALE',
        'PURCHASE'
    ]),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "basePriceType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], BulkUpdatePriceCardDto.prototype, "adjustmentValue", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], BulkUpdatePriceCardDto.prototype, "note", void 0);

//# sourceMappingURL=bulk-update-price-card.dto.js.map