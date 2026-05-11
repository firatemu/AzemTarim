"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServiceInvoiceModule", {
    enumerable: true,
    get: function() {
        return ServiceInvoiceModule;
    }
});
const _common = require("@nestjs/common");
const _serviceinvoiceservice = require("./service-invoice.service");
const _serviceinvoicecontroller = require("./service-invoice.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _systemparametermodule = require("../system-parameter/system-parameter.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ServiceInvoiceModule = class ServiceInvoiceModule {
};
ServiceInvoiceModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            _systemparametermodule.SystemParameterModule
        ],
        controllers: [
            _serviceinvoicecontroller.ServiceInvoiceController
        ],
        providers: [
            _serviceinvoiceservice.ServiceInvoiceService
        ],
        exports: [
            _serviceinvoiceservice.ServiceInvoiceService
        ]
    })
], ServiceInvoiceModule);

//# sourceMappingURL=service-invoice.module.js.map