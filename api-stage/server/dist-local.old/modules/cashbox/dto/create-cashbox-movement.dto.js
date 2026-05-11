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
    get CashboxMovementType () {
        return CashboxMovementType;
    },
    get CreateCashboxMovementDto () {
        return CreateCashboxMovementDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var CashboxMovementType = /*#__PURE__*/ function(CashboxMovementType) {
    CashboxMovementType["COLLECTION"] = "COLLECTION";
    CashboxMovementType["PAYMENT"] = "PAYMENT";
    CashboxMovementType["INCOMING_TRANSFER"] = "INCOMING_TRANSFER";
    CashboxMovementType["OUTGOING_TRANSFER"] = "OUTGOING_TRANSFER";
    CashboxMovementType["CREDIT_CARD"] = "CREDIT_CARD";
    CashboxMovementType["TRANSFER"] = "TRANSFER";
    CashboxMovementType["CARRY_FORWARD"] = "CARRY_FORWARD";
    CashboxMovementType["CHECK_RECEIVED"] = "CHECK_RECEIVED";
    CashboxMovementType["CHECK_GIVEN"] = "CHECK_GIVEN";
    CashboxMovementType["PROMISSORY_RECEIVED"] = "PROMISSORY_RECEIVED";
    CashboxMovementType["PROMISSORY_GIVEN"] = "PROMISSORY_GIVEN";
    CashboxMovementType["CHECK_COLLECTION"] = "CHECK_COLLECTION";
    CashboxMovementType["PROMISSORY_COLLECTION"] = "PROMISSORY_COLLECTION";
    return CashboxMovementType;
}({});
let CreateCashboxMovementDto = class CreateCashboxMovementDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(CashboxMovementType),
    (0, _swagger.ApiProperty)({
        enum: CashboxMovementType
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "movementType", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateCashboxMovementDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "documentType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "documentNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateCashboxMovementDto.prototype, "date", void 0);

//# sourceMappingURL=create-cashbox-movement.dto.js.map