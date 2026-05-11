"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductModule", {
    enumerable: true,
    get: function() {
        return ProductModule;
    }
});
const _common = require("@nestjs/common");
const _productservice = require("./product.service");
const _productcontroller = require("./product.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _warehousecriticalstockmodule = require("../warehouse-critical-stock/warehouse-critical-stock.module");
const _deletionprotectionmodule = require("../../common/services/deletion-protection.module");
const _productexportservice = require("./product-export.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ProductModule = class ProductModule {
};
ProductModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            _deletionprotectionmodule.DeletionProtectionModule,
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            (0, _common.forwardRef)(()=>_warehousecriticalstockmodule.WarehouseCriticalStockModule)
        ],
        controllers: [
            _productcontroller.ProductController
        ],
        providers: [
            _productservice.ProductService,
            _productexportservice.ProductExportService
        ],
        exports: [
            _productservice.ProductService,
            _productexportservice.ProductExportService
        ]
    })
], ProductModule);

//# sourceMappingURL=product.module.js.map