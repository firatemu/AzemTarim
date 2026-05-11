"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillActionDto", {
    enumerable: true,
    get: function() {
        return CheckBillActionDto;
    }
});
const _classvalidator = require("class-validator");
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
let CheckBillActionDto = class CheckBillActionDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "checkBillId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.CheckBillStatus),
    _ts_metadata("design:type", typeof _client.CheckBillStatus === "undefined" ? Object : _client.CheckBillStatus)
], CheckBillActionDto.prototype, "newStatus", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CheckBillActionDto.prototype, "transactionAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", typeof CheckBillPaymentMethod === "undefined" ? Object : CheckBillPaymentMethod)
], CheckBillActionDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CheckBillActionDto.prototype, "toAccountId", void 0);

//# sourceMappingURL=check-bill-transaction.dto.js.map