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
    get AssignBasePlanLicenseDto () {
        return AssignBasePlanLicenseDto;
    },
    get AssignModuleLicenseDto () {
        return AssignModuleLicenseDto;
    },
    get InviteUserDto () {
        return InviteUserDto;
    },
    get PurchaseAdditionalUsersDto () {
        return PurchaseAdditionalUsersDto;
    },
    get PurchaseModuleLicenseDto () {
        return PurchaseModuleLicenseDto;
    },
    get RevokeLicenseDto () {
        return RevokeLicenseDto;
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
let AssignBasePlanLicenseDto = class AssignBasePlanLicenseDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], AssignBasePlanLicenseDto.prototype, "userId", void 0);
let AssignModuleLicenseDto = class AssignModuleLicenseDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], AssignModuleLicenseDto.prototype, "userId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], AssignModuleLicenseDto.prototype, "moduleSlug", void 0);
let RevokeLicenseDto = class RevokeLicenseDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], RevokeLicenseDto.prototype, "licenseId", void 0);
let InviteUserDto = class InviteUserDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], InviteUserDto.prototype, "email", void 0);
let PurchaseAdditionalUsersDto = class PurchaseAdditionalUsersDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], PurchaseAdditionalUsersDto.prototype, "quantity", void 0);
let PurchaseModuleLicenseDto = class PurchaseModuleLicenseDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], PurchaseModuleLicenseDto.prototype, "moduleSlug", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], PurchaseModuleLicenseDto.prototype, "quantity", void 0);

//# sourceMappingURL=assign-license.dto.js.map