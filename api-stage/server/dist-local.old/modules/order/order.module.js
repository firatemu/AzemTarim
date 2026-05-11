"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OrderModule", {
    enumerable: true,
    get: function() {
        return OrderModule;
    }
});
const _common = require("@nestjs/common");
const _ordercontroller = require("./order.controller");
const _orderservice = require("./order.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _saleswaybillmodule = require("../sales-waybill/sales-waybill.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _unitsetmodule = require("../unit-set/unit-set.module");
const _sharedmodule = require("../shared/shared.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let OrderModule = class OrderModule {
};
OrderModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            (0, _common.forwardRef)(()=>_saleswaybillmodule.SalesWaybillModule),
            _codetemplatemodule.CodeTemplateModule,
            _unitsetmodule.UnitSetModule,
            _sharedmodule.SharedModule
        ],
        controllers: [
            _ordercontroller.OrderController
        ],
        providers: [
            _orderservice.OrderService
        ],
        exports: [
            _orderservice.OrderService
        ]
    })
], OrderModule);

//# sourceMappingURL=order.module.js.map