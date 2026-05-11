"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCodeTemplateDto", {
    enumerable: true,
    get: function() {
        return CreateCodeTemplateDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _codetemplateenums = require("../code-template.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateCodeTemplateDto = class CreateCodeTemplateDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _codetemplateenums.ModuleType
    }),
    (0, _classvalidator.IsEnum)(_codetemplateenums.ModuleType),
    _ts_metadata("design:type", typeof _codetemplateenums.ModuleType === "undefined" ? Object : _codetemplateenums.ModuleType)
], CreateCodeTemplateDto.prototype, "module", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCodeTemplateDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCodeTemplateDto.prototype, "prefix", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(10),
    _ts_metadata("design:type", Number)
], CreateCodeTemplateDto.prototype, "digitCount", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateCodeTemplateDto.prototype, "currentValue", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateCodeTemplateDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _classvalidator.IsBoolean)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], CreateCodeTemplateDto.prototype, "includeYear", void 0);

//# sourceMappingURL=create-code-template.dto.js.map