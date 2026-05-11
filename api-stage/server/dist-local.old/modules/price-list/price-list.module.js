"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceListModule", {
    enumerable: true,
    get: function() {
        return PriceListModule;
    }
});
const _prismamodule = require("../../common/prisma.module");
const _common = require("@nestjs/common");
const _pricelistservice = require("./price-list.service");
const _pricelistcontroller = require("./price-list.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PriceListModule = class PriceListModule {
};
PriceListModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule
        ],
        controllers: [
            _pricelistcontroller.PriceListController
        ],
        providers: [
            _pricelistservice.PriceListService
        ],
        exports: [
            _pricelistservice.PriceListService
        ]
    })
], PriceListModule);

//# sourceMappingURL=price-list.module.js.map