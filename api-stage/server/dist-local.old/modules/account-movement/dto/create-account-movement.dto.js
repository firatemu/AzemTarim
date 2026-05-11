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
    get AccountMovementType () {
        return AccountMovementType;
    },
    get CreateAccountMovementDto () {
        return CreateAccountMovementDto;
    },
    get MovementDocumentType () {
        return MovementDocumentType;
    }
});
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
var AccountMovementType = /*#__PURE__*/ function(AccountMovementType) {
    AccountMovementType["DEBIT"] = "DEBIT";
    AccountMovementType["CREDIT"] = "CREDIT";
    AccountMovementType["CARRY_FORWARD"] = "CARRY_FORWARD";
    return AccountMovementType;
}({});
var MovementDocumentType = /*#__PURE__*/ function(MovementDocumentType) {
    MovementDocumentType["INVOICE"] = "INVOICE";
    MovementDocumentType["COLLECTION"] = "COLLECTION";
    MovementDocumentType["PAYMENT"] = "PAYMENT";
    MovementDocumentType["CHECK_PROMISSORY"] = "CHECK_PROMISSORY";
    MovementDocumentType["CARRY_FORWARD"] = "CARRY_FORWARD";
    MovementDocumentType["CORRECTION"] = "CORRECTION";
    MovementDocumentType["CHECK_ENTRY"] = "CHECK_ENTRY";
    MovementDocumentType["CHECK_EXIT"] = "CHECK_EXIT";
    MovementDocumentType["RETURN"] = "RETURN";
    return MovementDocumentType;
}({});
let CreateAccountMovementDto = class CreateAccountMovementDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(AccountMovementType),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateAccountMovementDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(MovementDocumentType),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "documentType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "documentNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateAccountMovementDto.prototype, "notes", void 0);

//# sourceMappingURL=create-account-movement.dto.js.map