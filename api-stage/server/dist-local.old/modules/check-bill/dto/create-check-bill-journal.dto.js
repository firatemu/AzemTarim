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
    get CreateCheckBillJournalDto () {
        return CreateCheckBillJournalDto;
    },
    get UpdateCheckBillJournalDto () {
        return UpdateCheckBillJournalDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _createcheckbilldto = require("./create-check-bill.dto");
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
let CreateCheckBillJournalDto = class CreateCheckBillJournalDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.JournalType),
    _ts_metadata("design:type", typeof _client.JournalType === "undefined" ? Object : _client.JournalType)
], CreateCheckBillJournalDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "journalNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "accountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "bankAccountId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "cashboxId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateCheckBillJournalDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_createcheckbilldto.CreateCheckBillLineDto),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], CreateCheckBillJournalDto.prototype, "newDocuments", void 0);
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsUUID)('4', {
        each: true
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], CreateCheckBillJournalDto.prototype, "selectedDocumentIds", void 0);
let UpdateCheckBillJournalDto = class UpdateCheckBillJournalDto {
};
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateCheckBillJournalDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateCheckBillJournalDto.prototype, "notes", void 0);

//# sourceMappingURL=create-check-bill-journal.dto.js.map