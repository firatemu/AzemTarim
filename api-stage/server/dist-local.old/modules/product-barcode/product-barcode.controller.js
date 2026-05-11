"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductBarcodeController", {
    enumerable: true,
    get: function() {
        return ProductBarcodeController;
    }
});
const _common = require("@nestjs/common");
const _productbarcodeservice = require("./product-barcode.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createproductbarcodedto = require("./dto/create-product-barcode.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let ProductBarcodeController = class ProductBarcodeController {
    findByProduct(productId) {
        return this.productBarcodeService.findByProduct(productId);
    }
    findByBarcode(barcode) {
        return this.productBarcodeService.findByBarcode(barcode);
    }
    create(createDto) {
        return this.productBarcodeService.create(createDto);
    }
    setPrimary(id) {
        return this.productBarcodeService.setPrimary(id);
    }
    remove(id) {
        return this.productBarcodeService.remove(id);
    }
    constructor(productBarcodeService){
        this.productBarcodeService = productBarcodeService;
    }
};
_ts_decorate([
    (0, _common.Get)('product/:productId'),
    _ts_param(0, (0, _common.Param)('productId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductBarcodeController.prototype, "findByProduct", null);
_ts_decorate([
    (0, _common.Get)('barcode/:barcode'),
    _ts_param(0, (0, _common.Param)('barcode')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductBarcodeController.prototype, "findByBarcode", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createproductbarcodedto.CreateProductBarcodeDto === "undefined" ? Object : _createproductbarcodedto.CreateProductBarcodeDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductBarcodeController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id/set-primary'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductBarcodeController.prototype, "setPrimary", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductBarcodeController.prototype, "remove", null);
ProductBarcodeController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('product-barcode'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _productbarcodeservice.ProductBarcodeService === "undefined" ? Object : _productbarcodeservice.ProductBarcodeService
    ])
], ProductBarcodeController);

//# sourceMappingURL=product-barcode.controller.js.map