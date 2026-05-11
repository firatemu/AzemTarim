"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalesWaybillModule", {
    enumerable: true,
    get: function() {
        return SalesWaybillModule;
    }
});
const _common = require("@nestjs/common");
const _saleswaybillservice = require("./sales-waybill.service");
const _saleswaybillcontroller = require("./sales-waybill.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _sharedmodule = require("../shared/shared.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SalesWaybillModule = class SalesWaybillModule {
};
SalesWaybillModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            _codetemplatemodule.CodeTemplateModule,
            _sharedmodule.SharedModule
        ],
        controllers: [
            _saleswaybillcontroller.SalesWaybillController
        ],
        providers: [
            _saleswaybillservice.SalesWaybillService
        ],
        exports: [
            _saleswaybillservice.SalesWaybillService
        ]
    })
], SalesWaybillModule);

//# sourceMappingURL=sales-waybill.module.js.map