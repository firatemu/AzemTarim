"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PosModule", {
    enumerable: true,
    get: function() {
        return PosModule;
    }
});
const _common = require("@nestjs/common");
const _poscontroller = require("./pos.controller");
const _posservice = require("./pos.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _invoicemodule = require("../invoice/invoice.module");
const _collectionmodule = require("../collection/collection.module");
const _cashboxmodule = require("../cashbox/cashbox.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PosModule = class PosModule {
};
PosModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            _invoicemodule.InvoiceModule,
            _collectionmodule.CollectionModule,
            _cashboxmodule.CashboxModule
        ],
        controllers: [
            _poscontroller.PosController
        ],
        providers: [
            _posservice.PosService
        ],
        exports: [
            _posservice.PosService
        ]
    })
], PosModule);

//# sourceMappingURL=pos.module.js.map