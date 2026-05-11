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
    get SalaryStatus () {
        return SalaryStatus;
    },
    get UpdateSalaryPlanDto () {
        return UpdateSalaryPlanDto;
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
var SalaryStatus = /*#__PURE__*/ function(SalaryStatus) {
    SalaryStatus["UNPAID"] = "UNPAID";
    SalaryStatus["KISMI_PAID"] = "KISMI_PAID";
    SalaryStatus["TAMAMEN_PAID"] = "TAMAMEN_PAID";
    SalaryStatus["PENDING"] = "PENDING";
    return SalaryStatus;
}({});
let UpdateSalaryPlanDto = class UpdateSalaryPlanDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], UpdateSalaryPlanDto.prototype, "salary", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], UpdateSalaryPlanDto.prototype, "bonus", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(SalaryStatus),
    _ts_metadata("design:type", String)
], UpdateSalaryPlanDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateSalaryPlanDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateSalaryPlanDto.prototype, "notes", void 0);

//# sourceMappingURL=update-salary-plan.dto.js.map