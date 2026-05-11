"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StockMoveModule", {
    enumerable: true,
    get: function() {
        return StockMoveModule;
    }
});
const _prismamodule = require("../../common/prisma.module");
const _common = require("@nestjs/common");
const _stockmoveservice = require("./stock-move.service");
const _stockmovecontroller = require("./stock-move.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let StockMoveModule = class StockMoveModule {
};
StockMoveModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule
        ],
        controllers: [
            _stockmovecontroller.StockMoveController
        ],
        providers: [
            _stockmoveservice.StockMoveService
        ],
        exports: [
            _stockmoveservice.StockMoveService
        ]
    })
], StockMoveModule);

//# sourceMappingURL=stock-move.module.js.map