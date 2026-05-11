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
    get CreateBankMovementDto () {
        return CreateBankMovementDto;
    },
    get CreatePosMovementDto () {
        return CreatePosMovementDto;
    }
});
const _classvalidator = require("class-validator");
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
let CreateBankMovementDto = class CreateBankMovementDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.BankMovementType),
    (0, _swagger.ApiProperty)({
        enum: _client.BankMovementType
    }),
    _ts_metadata("design:type", typeof _client.BankMovementType === "undefined" ? Object : _client.BankMovementType)
], CreateBankMovementDto.prototype, "movementType", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.BankMovementSubType),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        enum: _client.BankMovementSubType,
        required: false
    }),
    _ts_metadata("design:type", typeof _client.BankMovementSubType === "undefined" ? Object : _client.BankMovementSubType)
], CreateBankMovementDto.prototype, "movementSubType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateBankMovementDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateBankMovementDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateBankMovementDto.prototype, "referenceNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateBankMovementDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateBankMovementDto.prototype, "date", void 0);
let CreatePosMovementDto = class CreatePosMovementDto {
};
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreatePosMovementDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePosMovementDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePosMovementDto.prototype, "referenceNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePosMovementDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreatePosMovementDto.prototype, "date", void 0);

//# sourceMappingURL=create-movement.dto.js.map