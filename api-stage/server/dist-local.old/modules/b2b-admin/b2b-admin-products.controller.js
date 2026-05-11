"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminProductsController", {
    enumerable: true,
    get: function() {
        return B2bAdminProductsController;
    }
});
const _common = require("@nestjs/common");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _platformexpress = require("@nestjs/platform-express");
const _multer = require("multer");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bproductdto = require("./dto/b2b-product.dto");
const _b2badminproductservice = require("./services/b2b-admin-product.service");
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
let B2bAdminProductsController = class B2bAdminProductsController {
    async tenant() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async tenantWrite() {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async syncStatus() {
        return this.service.syncStatus(await this.tenant());
    }
    async getSyncLoops() {
        return this.service.getSyncLoops(await this.tenant());
    }
    async triggerSync(dto, user) {
        const type = dto?.type || 'FULL';
        const result = await this.service.triggerSync(await this.tenantWrite(), type, user?.id);
        return {
            success: true,
            message: 'Senkronizasyon kuyruğa alındı',
            jobId: result.jobId,
            inline: false
        };
    }
    async getAvailableErpProducts(q) {
        return this.service.getAvailableErpProducts(await this.tenant(), q);
    }
    async addFromErp(dto) {
        return this.service.addFromErp(await this.tenantWrite(), dto.erpProductId);
    }
    async addBatchFromErp(dto) {
        return this.service.addBatchFromErp(await this.tenantWrite(), dto.erpProductIds);
    }
    async list(q) {
        return this.service.list(await this.tenant(), q);
    }
    async getOne(id) {
        return this.service.getOne(await this.tenant(), id);
    }
    async update(id, dto) {
        return this.service.update(await this.tenantWrite(), id, dto);
    }
    async uploadImage(id, file) {
        return this.service.uploadImage(await this.tenantWrite(), id, file);
    }
    async deleteImage(id) {
        return this.service.deleteImage(await this.tenantWrite(), id);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('sync/status'),
    (0, _swagger.ApiOperation)({
        summary: 'Son senkron logları'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "syncStatus", null);
_ts_decorate([
    (0, _common.Get)('sync/loops'),
    (0, _swagger.ApiOperation)({
        summary: 'Senkronizasyon döngüleri (Loops) listesi'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "getSyncLoops", null);
_ts_decorate([
    (0, _common.Post)('sync'),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün/fiyat senkronizasyon kuyruğu',
        description: 'Stok ve liste fiyatı B2B API okumalarında ERP’den anlık alınır; kuyruk ürün kartı ve fiyat kartı eşitlemesi içindir.'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "triggerSync", null);
_ts_decorate([
    (0, _common.Get)('erp/available'),
    (0, _swagger.ApiOperation)({
        summary: 'ERP\'de mevcut ama B2B\'de olmayan ürünler'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "getAvailableErpProducts", null);
_ts_decorate([
    (0, _common.Post)('erp/add'),
    (0, _swagger.ApiOperation)({
        summary: 'ERP\'den manuel olarak ürün B2B\'ye ekle'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "addFromErp", null);
_ts_decorate([
    (0, _common.Post)('erp/add-batch'),
    (0, _swagger.ApiOperation)({
        summary: 'ERP\'den çoklu ürün B2B\'ye ekle'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "addBatchFromErp", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'B2B ürün listesi'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bproductdto.B2bProductListQueryDto === "undefined" ? Object : _b2bproductdto.B2bProductListQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün detayı'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "getOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B alanları (görünürlük, min adet, açıklama)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bproductdto.UpdateB2bProductDto === "undefined" ? Object : _b2bproductdto.UpdateB2bProductDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)(':id/image'),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file', {
        storage: (0, _multer.memoryStorage)(),
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün görseli yükle (MinIO)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "uploadImage", null);
_ts_decorate([
    (0, _common.Delete)(':id/image'),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün görselini kaldır'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminProductsController.prototype, "deleteImage", null);
B2bAdminProductsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/products'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badminproductservice.B2bAdminProductService === "undefined" ? Object : _b2badminproductservice.B2bAdminProductService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminProductsController);

//# sourceMappingURL=b2b-admin-products.controller.js.map