"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountMovementModule", {
    enumerable: true,
    get: function() {
        return AccountMovementModule;
    }
});
const _common = require("@nestjs/common");
const _accountmovementcontroller = require("./account-movement.controller");
const _accountmovementservice = require("./account-movement.service");
const _prismamodule = require("../../common/prisma.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AccountMovementModule = class AccountMovementModule {
};
AccountMovementModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule
        ],
        controllers: [
            _accountmovementcontroller.AccountMovementController
        ],
        providers: [
            _accountmovementservice.AccountMovementService
        ],
        exports: [
            _accountmovementservice.AccountMovementService
        ]
    })
], AccountMovementModule);

//# sourceMappingURL=account-movement.module.js.map