"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateLoanUsageDto", {
    enumerable: true,
    get: function() {
        return CreateLoanUsageDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateLoanUsageDto = class CreateLoanUsageDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _classtransformer.Type)(()=>Number),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateLoanUsageDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _classtransformer.Type)(()=>Number),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateLoanUsageDto.prototype, "installmentCount", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsEnum)(_client.LoanType),
    (0, _swagger.ApiProperty)({
        enum: _client.LoanType
    }),
    _ts_metadata("design:type", typeof _client.LoanType === "undefined" ? Object : _client.LoanType)
], CreateLoanUsageDto.prototype, "loanType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _classtransformer.Type)(()=>Number),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateLoanUsageDto.prototype, "annualInterestRate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    (0, _classtransformer.Type)(()=>Number),
    (0, _swagger.ApiProperty)({
        required: false,
        default: 1
    }),
    _ts_metadata("design:type", Number)
], CreateLoanUsageDto.prototype, "paymentFrequency", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _classtransformer.Type)(()=>Number),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateLoanUsageDto.prototype, "installmentAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateLoanUsageDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsDateString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateLoanUsageDto.prototype, "firstInstallmentDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateLoanUsageDto.prototype, "notes", void 0);

//# sourceMappingURL=create-loan.dto.js.map