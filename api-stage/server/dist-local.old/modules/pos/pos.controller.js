"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PosController", {
    enumerable: true,
    get: function() {
        return PosController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _posservice = require("./pos.service");
const _createpossaledto = require("./dto/create-pos-sale.dto");
const _createpossessiondto = require("./dto/create-pos-session.dto");
const _closepossessiondto = require("./dto/close-pos-session.dto");
const _createposreturndto = require("./dto/create-pos-return.dto");
const _completepossaledto = require("./dto/complete-pos-sale.dto");
const _client = require("@prisma/client");
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
let PosController = class PosController {
    async createDraftCart(dto, req) {
        const userId = req.user?.id;
        return this.posService.createDraftSale(dto, userId);
    }
    async completeSale(invoiceId, dto, req) {
        const userId = req.user?.id;
        return this.posService.completeSale(invoiceId, dto.payments, userId, dto.cashboxId);
    }
    async getSalesAgents(search) {
        return this.posService.getSalesAgents(search);
    }
    async createReturn(dto, req) {
        const userId = req.user?.id;
        return this.posService.createReturn(dto, userId);
    }
    async openSession(dto, req) {
        const userId = req.user?.id;
        return this.posService.createSession(dto, userId);
    }
    async closeSession(sessionId, dto, req) {
        const userId = req.user?.id;
        return this.posService.closeSession(sessionId, dto, userId);
    }
    async getProductsByBarcode(barcode) {
        return this.posService.getProductsByBarcode(barcode);
    }
    async getActiveCarts(cashierId) {
        return this.posService.getActiveCarts(cashierId);
    }
    async getRetailCashbox() {
        return this.posService.getRetailCashbox();
    }
    async getBankAccounts(type) {
        return this.posService.getBankAccountsByType(type);
    }
    async deleteCart(invoiceId, req) {
        const userId = req.user?.id;
        return this.posService.deleteDraftCart(invoiceId, userId);
    }
    constructor(posService){
        this.posService = posService;
    }
};
_ts_decorate([
    (0, _common.Post)('cart/draft'),
    (0, _swagger.ApiOperation)({
        summary: 'Taslak POS sepeti oluştur'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Taslak fatura oluşturuldu'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpossaledto.CreatePosSaleDto === "undefined" ? Object : _createpossaledto.CreatePosSaleDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "createDraftCart", null);
_ts_decorate([
    (0, _common.Post)('cart/:invoiceId/complete'),
    (0, _swagger.ApiOperation)({
        summary: 'POS satışını tamamla'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Satış tamamlandı'
    }),
    _ts_param(0, (0, _common.Param)('invoiceId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _completepossaledto.CompleteSaleDto === "undefined" ? Object : _completepossaledto.CompleteSaleDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "completeSale", null);
_ts_decorate([
    (0, _common.Get)('sales-agents'),
    (0, _swagger.ApiOperation)({
        summary: 'Satış elemanlarını getir'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Satış elemanları listelendi'
    }),
    _ts_param(0, (0, _common.Query)('search')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "getSalesAgents", null);
_ts_decorate([
    (0, _common.Post)('return'),
    (0, _swagger.ApiOperation)({
        summary: 'POS iadesi oluştur'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'İade oluşturuldu'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createposreturndto.CreatePosReturnDto === "undefined" ? Object : _createposreturndto.CreatePosReturnDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "createReturn", null);
_ts_decorate([
    (0, _common.Post)('session/open'),
    (0, _swagger.ApiOperation)({
        summary: 'POS kasiyer session aç'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Session açıldı'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpossessiondto.CreatePosSessionDto === "undefined" ? Object : _createpossessiondto.CreatePosSessionDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "openSession", null);
_ts_decorate([
    (0, _common.Post)('session/:sessionId/close'),
    (0, _swagger.ApiOperation)({
        summary: 'POS kasiyer session kapat'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Session kapatıldı'
    }),
    _ts_param(0, (0, _common.Param)('sessionId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _closepossessiondto.ClosePosSessionDto === "undefined" ? Object : _closepossessiondto.ClosePosSessionDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "closeSession", null);
_ts_decorate([
    (0, _common.Get)('products/barcode/:barcode'),
    (0, _swagger.ApiOperation)({
        summary: 'Barkoda göre ürünleri getir'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Ürünler listelendi'
    }),
    _ts_param(0, (0, _common.Param)('barcode')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "getProductsByBarcode", null);
_ts_decorate([
    (0, _common.Get)('carts/active'),
    (0, _swagger.ApiOperation)({
        summary: 'Aktif POS sepetlerini getir'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Aktif sepetler getirildi'
    }),
    _ts_param(0, (0, _common.Query)('cashierId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "getActiveCarts", null);
_ts_decorate([
    (0, _common.Get)('retail-cashbox'),
    (0, _swagger.ApiOperation)({
        summary: 'Perakende satis kasasini getir'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Perakende satis kasasi getirildi'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "getRetailCashbox", null);
_ts_decorate([
    (0, _common.Get)('bank-accounts'),
    (0, _swagger.ApiOperation)({
        summary: 'POS odeme icin banka hesaplarini getir'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Banka hesaplari listelendi'
    }),
    _ts_param(0, (0, _common.Query)('type', new _common.ParseEnumPipe(_client.BankAccountType))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _client.BankAccountType === "undefined" ? Object : _client.BankAccountType
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "getBankAccounts", null);
_ts_decorate([
    (0, _common.Delete)('cart/:invoiceId'),
    (0, _swagger.ApiOperation)({
        summary: 'Taslak sepeti sil'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Sepet silindi'
    }),
    _ts_param(0, (0, _common.Param)('invoiceId')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PosController.prototype, "deleteCart", null);
PosController = _ts_decorate([
    (0, _swagger.ApiTags)('POS Console'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('pos'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _posservice.PosService === "undefined" ? Object : _posservice.PosService
    ])
], PosController);

//# sourceMappingURL=pos.controller.js.map