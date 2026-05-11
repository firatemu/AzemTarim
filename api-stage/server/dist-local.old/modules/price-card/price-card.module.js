"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceCardModule", {
    enumerable: true,
    get: function() {
        return PriceCardModule;
    }
});
const _prismamodule = require("../../common/prisma.module");
const _common = require("@nestjs/common");
const _pricecardservice = require("./price-card.service");
const _pricecardexportservice = require("./price-card-export.service");
const _pricecardcontroller = require("./price-card.controller");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _productmodule = require("../product/product.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PriceCardModule = class PriceCardModule {
};
PriceCardModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            (0, _common.forwardRef)(()=>_productmodule.ProductModule)
        ],
        controllers: [
            _pricecardcontroller.PriceCardController
        ],
        providers: [
            _pricecardservice.PriceCardService,
            _pricecardexportservice.PriceCardExportService
        ],
        exports: [
            _pricecardservice.PriceCardService
        ]
    })
], PriceCardModule);

//# sourceMappingURL=price-card.module.js.map