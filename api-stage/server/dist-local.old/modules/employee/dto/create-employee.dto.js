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
    get Cinsiyet () {
        return Cinsiyet;
    },
    get CreateEmployeeDto () {
        return CreateEmployeeDto;
    },
    get MedeniDurum () {
        return MedeniDurum;
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
var Cinsiyet = /*#__PURE__*/ function(Cinsiyet) {
    Cinsiyet["MALE"] = "MALE";
    Cinsiyet["FEMALE"] = "FEMALE";
    Cinsiyet["NOT_SPECIFIED"] = "NOT_SPECIFIED";
    return Cinsiyet;
}({});
var MedeniDurum = /*#__PURE__*/ function(MedeniDurum) {
    MedeniDurum["SINGLE"] = "SINGLE";
    MedeniDurum["MARRIED"] = "MARRIED";
    return MedeniDurum;
}({});
let CreateEmployeeDto = class CreateEmployeeDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "employeeCode", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(11, 11, {
        message: 'TC Kimlik No 11 karakter olmalıdır'
    }),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "identityNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Ad alanı zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Soyad alanı zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "birthDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(Cinsiyet),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "gender", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(MedeniDurum),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "maritalStatus", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)({}, {
        message: 'Geçerli bir email addressi giriniz'
    }),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "address", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "il", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "district", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "pozisyon", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "department", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "endDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateEmployeeDto.prototype, "salary", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateEmployeeDto.prototype, "bonus", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateEmployeeDto.prototype, "salaryGunu", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "sgkNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "ibanNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateEmployeeDto.prototype, "notes", void 0);

//# sourceMappingURL=create-employee.dto.js.map