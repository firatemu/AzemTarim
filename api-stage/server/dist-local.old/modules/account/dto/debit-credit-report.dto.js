"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DebitCreditReportQueryDto", {
    enumerable: true,
    get: function() {
        return DebitCreditReportQueryDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _swagger = require("@nestjs/swagger");
const _createaccountdto = require("./create-account.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DebitCreditReportQueryDto = class DebitCreditReportQueryDto {
    constructor(){
        this.page = 1;
        this.limit = 50;
    }
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], DebitCreditReportQueryDto.prototype, "search", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_createaccountdto.AccountType),
    (0, _swagger.ApiProperty)({
        enum: _createaccountdto.AccountType,
        required: false
    }),
    _ts_metadata("design:type", typeof _createaccountdto.AccountType === "undefined" ? Object : _createaccountdto.AccountType)
], DebitCreditReportQueryDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], DebitCreditReportQueryDto.prototype, "salesAgentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], DebitCreditReportQueryDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Transform)(({ value })=>parseInt(value)),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)({
        required: false,
        default: 1
    }),
    _ts_metadata("design:type", Number)
], DebitCreditReportQueryDto.prototype, "page", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Transform)(({ value })=>parseInt(value)),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _swagger.ApiProperty)({
        required: false,
        default: 50
    }),
    _ts_metadata("design:type", Number)
], DebitCreditReportQueryDto.prototype, "limit", void 0);

//# sourceMappingURL=debit-credit-report.dto.js.map