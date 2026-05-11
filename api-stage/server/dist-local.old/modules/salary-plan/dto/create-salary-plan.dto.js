"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateSalaryPlanDto", {
    enumerable: true,
    get: function() {
        return CreateSalaryPlanDto;
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
let CreateSalaryPlanDto = class CreateSalaryPlanDto {
};
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Employee ID zorunludur'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateSalaryPlanDto.prototype, "employeeId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNotEmpty)({
        message: 'Yıl zorunludur'
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(2020),
    (0, _classvalidator.Max)(2100),
    _ts_metadata("design:type", Number)
], CreateSalaryPlanDto.prototype, "year", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateSalaryPlanDto.prototype, "salary", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateSalaryPlanDto.prototype, "bonus", void 0);

//# sourceMappingURL=create-salary-plan.dto.js.map