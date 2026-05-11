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
    get CreateB2bAdvertisementDto () {
        return CreateB2bAdvertisementDto;
    },
    get UpdateB2bAdvertisementDto () {
        return UpdateB2bAdvertisementDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
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
let CreateB2bAdvertisementDto = class CreateB2bAdvertisementDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _client.B2BAdType
    }),
    (0, _classvalidator.IsEnum)(_client.B2BAdType),
    _ts_metadata("design:type", typeof _client.B2BAdType === "undefined" ? Object : _client.B2BAdType)
], CreateB2bAdvertisementDto.prototype, "type", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bAdvertisementDto.prototype, "linkUrl", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateB2bAdvertisementDto.prototype, "displayOrder", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateB2bAdvertisementDto.prototype, "startsAt", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateB2bAdvertisementDto.prototype, "endsAt", void 0);
let UpdateB2bAdvertisementDto = class UpdateB2bAdvertisementDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.B2BAdType
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.B2BAdType),
    _ts_metadata("design:type", typeof _client.B2BAdType === "undefined" ? Object : _client.B2BAdType)
], UpdateB2bAdvertisementDto.prototype, "type", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", Object)
], UpdateB2bAdvertisementDto.prototype, "linkUrl", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], UpdateB2bAdvertisementDto.prototype, "displayOrder", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", Object)
], UpdateB2bAdvertisementDto.prototype, "startsAt", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", Object)
], UpdateB2bAdvertisementDto.prototype, "endsAt", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateB2bAdvertisementDto.prototype, "isActive", void 0);

//# sourceMappingURL=b2b-advertisement.dto.js.map