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
    get ApproveInvoiceDto () {
        return ApproveInvoiceDto;
    },
    get CancelInvoiceDto () {
        return CancelInvoiceDto;
    },
    get UpdateInvoiceItemsDto () {
        return UpdateInvoiceItemsDto;
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
let ApproveInvoiceDto = class ApproveInvoiceDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        required: false
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ApproveInvoiceDto.prototype, "notes", void 0);
let CancelInvoiceDto = class CancelInvoiceDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        required: true,
        example: 'Hatalı miktar girişi'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CancelInvoiceDto.prototype, "reason", void 0);
let UpdateInvoiceItemsDto = class UpdateInvoiceItemsDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'İşlem sonrası otomatik mutabakat yapılsın mı?',
        default: true
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Boolean)
], UpdateInvoiceItemsDto.prototype, "runReconciliation", void 0);

//# sourceMappingURL=orchestrator.dto.js.map