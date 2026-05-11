"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlansModule", {
    enumerable: true,
    get: function() {
        return PlansModule;
    }
});
const _common = require("@nestjs/common");
const _planscontroller = require("./plans.controller");
const _plansservice = require("./plans.service");
const _prismamodule = require("../../common/prisma.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PlansModule = class PlansModule {
};
PlansModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule
        ],
        controllers: [
            _planscontroller.PlansController
        ],
        providers: [
            _plansservice.PlansService
        ],
        exports: [
            _plansservice.PlansService
        ]
    })
], PlansModule);

//# sourceMappingURL=plans.module.js.map