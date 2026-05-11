"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrderItemModule", {
    enumerable: true,
    get: function() {
        return WorkOrderItemModule;
    }
});
const _common = require("@nestjs/common");
const _workorderitemservice = require("./work-order-item.service");
const _workorderitemcontroller = require("./work-order-item.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let WorkOrderItemModule = class WorkOrderItemModule {
};
WorkOrderItemModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _workorderitemcontroller.WorkOrderItemController
        ],
        providers: [
            _workorderitemservice.WorkOrderItemService
        ],
        exports: [
            _workorderitemservice.WorkOrderItemService
        ]
    })
], WorkOrderItemModule);

//# sourceMappingURL=work-order-item.module.js.map