"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubscriptionsModule", {
    enumerable: true,
    get: function() {
        return SubscriptionsModule;
    }
});
const _common = require("@nestjs/common");
const _subscriptionscontroller = require("./subscriptions.controller");
const _subscriptionsservice = require("./subscriptions.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantsmodule = require("../tenants/tenants.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SubscriptionsModule = class SubscriptionsModule {
};
SubscriptionsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantsmodule.TenantsModule
        ],
        controllers: [
            _subscriptionscontroller.SubscriptionsController
        ],
        providers: [
            _subscriptionsservice.SubscriptionsService
        ],
        exports: [
            _subscriptionsservice.SubscriptionsService
        ]
    })
], SubscriptionsModule);

//# sourceMappingURL=subscriptions.module.js.map