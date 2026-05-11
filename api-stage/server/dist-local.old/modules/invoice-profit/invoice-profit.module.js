"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceProfitModule", {
    enumerable: true,
    get: function() {
        return InvoiceProfitModule;
    }
});
const _common = require("@nestjs/common");
const _invoiceprofitcontroller = require("./invoice-profit.controller");
const _invoiceprofitservice = require("./invoice-profit.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let InvoiceProfitModule = class InvoiceProfitModule {
};
InvoiceProfitModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _invoiceprofitcontroller.InvoiceProfitController
        ],
        providers: [
            _invoiceprofitservice.InvoiceProfitService
        ],
        exports: [
            _invoiceprofitservice.InvoiceProfitService
        ]
    })
], InvoiceProfitModule);

//# sourceMappingURL=invoice-profit.module.js.map