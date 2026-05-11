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
    get B2bAccountMovementsExportQueryDto () {
        return B2bAccountMovementsExportQueryDto;
    },
    get B2bAccountMovementsQueryDto () {
        return B2bAccountMovementsQueryDto;
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
let B2bAccountMovementsQueryDto = class B2bAccountMovementsQueryDto {
    constructor(){
        this.page = 1;
        this.pageSize = 25;
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
], B2bAccountMovementsQueryDto.prototype, "page", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 25
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(100),
    _ts_metadata("design:type", Number)
], B2bAccountMovementsQueryDto.prototype, "pageSize", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bAccountMovementsQueryDto.prototype, "dateFrom", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bAccountMovementsQueryDto.prototype, "dateTo", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Hareket satırlarına FIFO + vatDays ile hesaplanan vade, kalan borç ve gecikme bilgisi ekler'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Transform)(({ value })=>value === true || value === 'true' || value === '1'),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], B2bAccountMovementsQueryDto.prototype, "includeFifo", void 0);
let B2bAccountMovementsExportQueryDto = class B2bAccountMovementsExportQueryDto {
    constructor(){
        this.maxRows = 5000;
    }
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bAccountMovementsExportQueryDto.prototype, "dateFrom", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bAccountMovementsExportQueryDto.prototype, "dateTo", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 5000,
        description: 'Maksimum satır (üst sınır 10000)'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(10000),
    _ts_metadata("design:type", Number)
], B2bAccountMovementsExportQueryDto.prototype, "maxRows", void 0);

//# sourceMappingURL=b2b-account.dto.js.map