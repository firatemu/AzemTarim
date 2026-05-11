"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankTransferModule", {
    enumerable: true,
    get: function() {
        return BankTransferModule;
    }
});
const _common = require("@nestjs/common");
const _banktransfercontroller = require("./bank-transfer.controller");
const _banktransferservice = require("./bank-transfer.service");
const _prismaservice = require("../../common/prisma.service");
const _systemparametermodule = require("../system-parameter/system-parameter.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let BankTransferModule = class BankTransferModule {
};
BankTransferModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _systemparametermodule.SystemParameterModule
        ],
        controllers: [
            _banktransfercontroller.BankTransferController
        ],
        providers: [
            _banktransferservice.BankTransferService,
            _prismaservice.PrismaService
        ],
        exports: [
            _banktransferservice.BankTransferService
        ]
    })
], BankTransferModule);

//# sourceMappingURL=bank-transfer.module.js.map