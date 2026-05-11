"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CashboxModule", {
    enumerable: true,
    get: function() {
        return CashboxModule;
    }
});
const _common = require("@nestjs/common");
const _cashboxservice = require("./cashbox.service");
const _cashboxcontroller = require("./cashbox.controller");
const _codetemplatemodule = require("../code-template/code-template.module");
const _systemparametermodule = require("../system-parameter/system-parameter.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CashboxModule = class CashboxModule {
};
CashboxModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            _systemparametermodule.SystemParameterModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _cashboxcontroller.CashboxController
        ],
        providers: [
            _cashboxservice.CashboxService
        ],
        exports: [
            _cashboxservice.CashboxService
        ]
    })
], CashboxModule);

//# sourceMappingURL=cashbox.module.js.map