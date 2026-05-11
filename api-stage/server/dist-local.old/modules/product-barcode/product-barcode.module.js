"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductBarcodeModule", {
    enumerable: true,
    get: function() {
        return ProductBarcodeModule;
    }
});
const _common = require("@nestjs/common");
const _productbarcodeservice = require("./product-barcode.service");
const _productbarcodecontroller = require("./product-barcode.controller");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ProductBarcodeModule = class ProductBarcodeModule {
};
ProductBarcodeModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _productbarcodecontroller.ProductBarcodeController
        ],
        providers: [
            _productbarcodeservice.ProductBarcodeService,
            _prismaservice.PrismaService
        ],
        exports: [
            _productbarcodeservice.ProductBarcodeService
        ]
    })
], ProductBarcodeModule);

//# sourceMappingURL=product-barcode.module.js.map