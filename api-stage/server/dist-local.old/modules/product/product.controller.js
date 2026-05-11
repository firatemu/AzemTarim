"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductController", {
    enumerable: true,
    get: function() {
        return ProductController;
    }
});
const _common = require("@nestjs/common");
const _productexportservice = require("./product-export.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _productservice = require("./product.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
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
let ProductController = class ProductController {
    async exportEslesme(res) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) {
            throw new Error('Tenant ID not found');
        }
        const buffer = await this.productExportService.generateEslesmeExcel(tenantId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=urun-eslesmeleri.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }
    // Parametresiz route'lar
    create(dto) {
        try {
            // #region agent log
            console.log('[DEBUG product.controller.create] Request received:', {
                name: dto.name,
                code: dto.code,
                unit: dto.unit,
                purchasePrice: dto.purchasePrice,
                salePrice: dto.salePrice,
                purchasePriceType: typeof dto.purchasePrice,
                salePriceType: typeof dto.salePrice,
                description: dto.description?.substring(0, 50)
            });
            // #endregion
            console.log('🔍 [Stok Controller] create çağrıldı', {
                dto: {
                    ...dto,
                    description: dto.description?.substring(0, 50)
                }
            });
            return this.productService.create(dto);
        } catch (error) {
            // #region agent log
            console.error('[DEBUG product.controller.create] ERROR:', {
                message: error?.message,
                status: error?.status,
                response: error?.response,
                stack: error?.stack?.split('\n').slice(0, 5).join('\n')
            });
            // #endregion
            console.error('❌ [Stok Controller] create hatası:', error);
            throw error;
        }
    }
    findAll(query) {
        try {
            console.log('🔍 [Stok Controller] findAll çağrıldı', query);
            return this.productService.findAll(query.page, query.limit, query.search, query.isActive, query.brand, query.mainCategory, query.subCategory);
        } catch (error) {
            console.error('❌ [Stok Controller] findAll hatası:', error);
            throw error;
        }
    }
    match(dto) {
        return this.productService.matchProducts(dto.mainProductId, dto.equivalentProductIds);
    }
    matchOem() {
        return this.productService.matchOemIle();
    }
    // Spesifik route'lar - genel route'lardan ÖNCE tanımlanmalı
    canDelete(id) {
        return this.productService.canDelete(id);
    }
    getHareketler(id, page, limit) {
        return this.productService.getStockMovements(id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    getEsdegerler(id) {
        return this.productService.getEsdegerUrunler(id);
    }
    addEsdeger(product1Id, product2Id) {
        return this.productService.addEsdeger(product1Id, product2Id);
    }
    matchmeCiftiKaldir(id, eslesikId) {
        return this.productService.matchmeCiftiKaldir(id, eslesikId);
    }
    matchmeKaldir(id) {
        return this.productService.matchmeKaldir(id);
    }
    getLastPurchasePrice(id) {
        return this.productService.getLastPurchasePrice(id);
    }
    // Genel route'lar - EN SONDA tanımlanmalı
    findOne(id) {
        return this.productService.findOne(id);
    }
    update(id, dto) {
        return this.productService.update(id, dto);
    }
    remove(id) {
        return this.productService.remove(id);
    }
    constructor(productService, productExportService, tenantResolver){
        this.productService = productService;
        this.productExportService = productExportService;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('export/eslesme'),
    _ts_param(0, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], ProductController.prototype, "exportEslesme", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateProductDto === "undefined" ? Object : _dto.CreateProductDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.FindAllProductDto === "undefined" ? Object : _dto.FindAllProductDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Post)('match'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "match", null);
_ts_decorate([
    (0, _common.Post)('match-oem'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "matchOem", null);
_ts_decorate([
    (0, _common.Get)(':id/can-delete'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "canDelete", null);
_ts_decorate([
    (0, _common.Get)(':id/stock-movements'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('page')),
    _ts_param(2, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "getHareketler", null);
_ts_decorate([
    (0, _common.Get)(':id/esdegerler'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "getEsdegerler", null);
_ts_decorate([
    (0, _common.Post)(':product1Id/esdeger/:product2Id'),
    _ts_param(0, (0, _common.Param)('product1Id')),
    _ts_param(1, (0, _common.Param)('product2Id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "addEsdeger", null);
_ts_decorate([
    (0, _common.Delete)(':id/eslesme/:eslesikId'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Param)('eslesikId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "matchmeCiftiKaldir", null);
_ts_decorate([
    (0, _common.Delete)(':id/match'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "matchmeKaldir", null);
_ts_decorate([
    (0, _common.Get)(':id/last-purchase-price'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "getLastPurchasePrice", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateProductDto === "undefined" ? Object : _dto.UpdateProductDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ProductController.prototype, "remove", null);
ProductController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('products'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _productservice.ProductService === "undefined" ? Object : _productservice.ProductService,
        typeof _productexportservice.ProductExportService === "undefined" ? Object : _productexportservice.ProductExportService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ProductController);

//# sourceMappingURL=product.controller.js.map