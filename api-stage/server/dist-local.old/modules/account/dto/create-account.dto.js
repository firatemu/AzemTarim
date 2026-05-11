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
    get AccountType () {
        return AccountType;
    },
    get AddressType () {
        return AddressType;
    },
    get CompanyType () {
        return CompanyType;
    },
    get CreateAccountAddressDto () {
        return CreateAccountAddressDto;
    },
    get CreateAccountBankDto () {
        return CreateAccountBankDto;
    },
    get CreateAccountContactDto () {
        return CreateAccountContactDto;
    },
    get CreateAccountDto () {
        return CreateAccountDto;
    },
    get RiskStatus () {
        return RiskStatus;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
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
var AccountType = /*#__PURE__*/ function(AccountType) {
    AccountType["CUSTOMER"] = "CUSTOMER";
    AccountType["SUPPLIER"] = "SUPPLIER";
    AccountType["BOTH"] = "BOTH";
    return AccountType;
}({});
var CompanyType = /*#__PURE__*/ function(CompanyType) {
    CompanyType["CORPORATE"] = "CORPORATE";
    CompanyType["INDIVIDUAL"] = "INDIVIDUAL";
    return CompanyType;
}({});
var RiskStatus = /*#__PURE__*/ function(RiskStatus) {
    RiskStatus["NORMAL"] = "NORMAL";
    RiskStatus["RISKY"] = "RISKY";
    RiskStatus["BLACK_LIST"] = "BLACK_LIST";
    RiskStatus["IN_COLLECTION"] = "IN_COLLECTION";
    return RiskStatus;
}({});
var AddressType = /*#__PURE__*/ function(AddressType) {
    AddressType["DELIVERY"] = "DELIVERY";
    AddressType["INVOICE"] = "INVOICE";
    AddressType["CENTER"] = "CENTER";
    AddressType["BRANCH"] = "BRANCH";
    AddressType["WAREHOUSE"] = "WAREHOUSE";
    AddressType["OTHER"] = "OTHER";
    AddressType["SHIPMENT"] = "SHIPMENT";
    return AddressType;
}({});
let CreateAccountContactDto = class CreateAccountContactDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "extension", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Boolean)
], CreateAccountContactDto.prototype, "isDefault", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountContactDto.prototype, "notes", void 0);
let CreateAccountAddressDto = class CreateAccountAddressDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAccountAddressDto.prototype, "address", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(AddressType),
    (0, _swagger.ApiProperty)({
        enum: AddressType
    }),
    _ts_metadata("design:type", String)
], CreateAccountAddressDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountAddressDto.prototype, "city", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountAddressDto.prototype, "district", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountAddressDto.prototype, "postalCode", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Boolean)
], CreateAccountAddressDto.prototype, "isDefault", void 0);
let CreateAccountBankDto = class CreateAccountBankDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "bankName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "branchName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "branchCode", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "accountNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "iban", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountBankDto.prototype, "notes", void 0);
let CreateAccountDto = class CreateAccountDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "code", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "title", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(AccountType),
    (0, _swagger.ApiProperty)({
        enum: AccountType,
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "type", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(CompanyType),
    (0, _swagger.ApiProperty)({
        enum: CompanyType,
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "companyType", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "taxNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "taxOffice", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(11, 11, {
        message: 'National ID must be 11 characters'
    }),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "nationalId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "country", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "city", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "district", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "address", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "contactName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateAccountDto.prototype, "paymentTermDays", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Boolean)
], CreateAccountDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    (0, _classtransformer.Transform)(({ value })=>value === '' ? null : value),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "salesAgentId", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateAccountDto.prototype, "creditLimit", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(RiskStatus),
    (0, _swagger.ApiProperty)({
        enum: RiskStatus,
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "creditStatus", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Boolean)
], CreateAccountDto.prototype, "blockOnRisk", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateAccountDto.prototype, "collateralAmount", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "sector", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "customCode1", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "customCode2", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "website", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "fax", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsInt)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", Number)
], CreateAccountDto.prototype, "dueDays", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "bankInfo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "efaturaPostaKutusu", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", String)
], CreateAccountDto.prototype, "efaturaGondericiBirim", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateAccountContactDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreateAccountContactDto
        ],
        required: false
    }),
    _ts_metadata("design:type", Array)
], CreateAccountDto.prototype, "contacts", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateAccountAddressDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreateAccountAddressDto
        ],
        required: false
    }),
    _ts_metadata("design:type", Array)
], CreateAccountDto.prototype, "addresses", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>CreateAccountBankDto),
    (0, _swagger.ApiProperty)({
        type: [
            CreateAccountBankDto
        ],
        required: false
    }),
    _ts_metadata("design:type", Array)
], CreateAccountDto.prototype, "banks", void 0);

//# sourceMappingURL=create-account.dto.js.map