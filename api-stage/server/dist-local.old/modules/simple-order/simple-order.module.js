"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SimpleOrderModule", {
    enumerable: true,
    get: function() {
        return SimpleOrderModule;
    }
});
const _common = require("@nestjs/common");
const _simpleorderservice = require("./simple-order.service");
const _simpleordercontroller = require("./simple-order.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SimpleOrderModule = class SimpleOrderModule {
};
SimpleOrderModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _simpleordercontroller.SimpleOrderController
        ],
        providers: [
            _simpleorderservice.SimpleOrderService
        ],
        exports: [
            _simpleorderservice.SimpleOrderService
        ]
    })
], SimpleOrderModule);

//# sourceMappingURL=simple-order.module.js.map