"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bPaginationQueryDto", {
    enumerable: true,
    get: function() {
        return B2bPaginationQueryDto;
    }
});
const _swagger = require("@nestjs/swagger");
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
let B2bPaginationQueryDto = class B2bPaginationQueryDto {
    constructor(){
        this.page = 1;
        this.pageSize = 20;
    }
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 1
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], B2bPaginationQueryDto.prototype, "page", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 20
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], B2bPaginationQueryDto.prototype, "pageSize", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Ürün adı veya stok kodu'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPaginationQueryDto.prototype, "search", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPaginationQueryDto.prototype, "brand", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bPaginationQueryDto.prototype, "category", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Kampanya başlangıç/bitiş filtresi için referans tarihi (ISO 8601). ' + 'Birim fiyat: önce müşteri sınıfı iskontosu, sonra kampanya oranı sınıf sonrası birim üzerinden (bileşik).'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bPaginationQueryDto.prototype, "pricingAt", void 0);

//# sourceMappingURL=b2b-pagination.dto.js.map