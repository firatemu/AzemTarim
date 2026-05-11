"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalaryPlanModule", {
    enumerable: true,
    get: function() {
        return SalaryPlanModule;
    }
});
const _common = require("@nestjs/common");
const _salaryplanservice = require("./salary-plan.service");
const _salaryplancontroller = require("./salary-plan.controller");
const _employeemodule = require("../employee/employee.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SalaryPlanModule = class SalaryPlanModule {
};
SalaryPlanModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            (0, _common.forwardRef)(()=>_employeemodule.EmployeeModule),
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _salaryplancontroller.SalaryPlanController
        ],
        providers: [
            _salaryplanservice.SalaryPlanService
        ],
        exports: [
            _salaryplanservice.SalaryPlanService
        ]
    })
], SalaryPlanModule);

//# sourceMappingURL=salary-plan.module.js.map