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
    get CreatePriceCardDto () {
        return CreatePriceCardDto;
    },
    get PriceCardStatus () {
        return PriceCardStatus;
    },
    get PriceType () {
        return PriceType;
    }
});
const _classtransformer = require("class-transformer");
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
var PriceType = /*#__PURE__*/ function(PriceType) {
    PriceType["SALE"] = "SALE";
    PriceType["CAMPAIGN"] = "CAMPAIGN";
    PriceType["LIST"] = "LIST";
    return PriceType;
}({});
var PriceCardStatus = /*#__PURE__*/ function(PriceCardStatus) {
    PriceCardStatus["ACTIVE"] = "ACTIVE";
    PriceCardStatus["PASSIVE"] = "PASSIVE";
    PriceCardStatus["EXPIRED"] = "EXPIRED";
    return PriceCardStatus;
}({});
let CreatePriceCardDto = class CreatePriceCardDto {
    constructor(){
        this.priceType = "SALE";
        this.vatRate = 20;
        this.priceIncludesVat = false;
        this.minQuantity = 1;
        this.currency = 'TRY';
        this.status = "ACTIVE";
    }
};
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreatePriceCardDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(PriceType),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreatePriceCardDto.prototype, "priceType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreatePriceCardDto.prototype, "price", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreatePriceCardDto.prototype, "salePrice", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreatePriceCardDto.prototype, "vatRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreatePriceCardDto.prototype, "priceIncludesVat", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreatePriceCardDto.prototype, "minQuantity", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.MaxLength)(3),
    _ts_metadata("design:type", String)
], CreatePriceCardDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Object)
], CreatePriceCardDto.prototype, "effectiveFrom", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Object)
], CreatePriceCardDto.prototype, "effectiveTo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.MaxLength)(500),
    _ts_metadata("design:type", Object)
], CreatePriceCardDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(PriceCardStatus),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreatePriceCardDto.prototype, "status", void 0);

//# sourceMappingURL=create-price-card.dto.js.map