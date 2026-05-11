"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmployeeModule", {
    enumerable: true,
    get: function() {
        return EmployeeModule;
    }
});
const _common = require("@nestjs/common");
const _employeeservice = require("./employee.service");
const _employeecontroller = require("./employee.controller");
const _prismamodule = require("../../common/prisma.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let EmployeeModule = class EmployeeModule {
};
EmployeeModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _employeecontroller.EmployeeController
        ],
        providers: [
            _employeeservice.EmployeeService
        ],
        exports: [
            _employeeservice.EmployeeService
        ]
    })
], EmployeeModule);

//# sourceMappingURL=employee.module.js.map