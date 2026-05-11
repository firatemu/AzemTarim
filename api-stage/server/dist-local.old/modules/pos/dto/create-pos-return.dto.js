"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreatePosReturnDto", {
    enumerable: true,
    get: function() {
        return CreatePosReturnDto;
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
let CreatePosReturnDto = class CreatePosReturnDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'İade edilen fatura ID'
    }),
    _ts_metadata("design:type", String)
], CreatePosReturnDto.prototype, "originalInvoiceId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'İade edilen ürünler'
    }),
    _ts_metadata("design:type", Array)
], CreatePosReturnDto.prototype, "items", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'İade amountı'
    }),
    _ts_metadata("design:type", Number)
], CreatePosReturnDto.prototype, "totalAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Ödeme yöntemi'
    }),
    (0, _classvalidator.IsEnum)(_client.PaymentMethod),
    _ts_metadata("design:type", typeof _client.PaymentMethod === "undefined" ? Object : _client.PaymentMethod)
], CreatePosReturnDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'İade notesı'
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreatePosReturnDto.prototype, "notes", void 0);

//# sourceMappingURL=create-pos-return.dto.js.map