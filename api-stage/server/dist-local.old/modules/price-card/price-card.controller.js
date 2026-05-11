"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceCardController", {
    enumerable: true,
    get: function() {
        return PriceCardController;
    }
});
const _common = require("@nestjs/common");
const _pricecardservice = require("./price-card.service");
const _pricecardexportservice = require("./price-card-export.service");
const _createpricecarddto = require("./dto/create-price-card.dto");
const _updatepricecarddto = require("./dto/update-price-card.dto");
const _bulkupdatepricecarddto = require("./dto/bulk-update-price-card.dto");
const _findpricecardsdto = require("./dto/find-price-cards.dto");
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
let PriceCardController = class PriceCardController {
    bulkUpdate(bulkUpdateDto, req) {
        const userId = req?.user?.id;
        return this.priceCardService.bulkUpdatePrices(bulkUpdateDto, userId);
    }
    create(createDto, req) {
        const userId = req?.user?.id;
        return this.priceCardService.create(createDto, userId);
    }
    async exportExcel(type, status, search, res) {
        const buffer = await this.priceCardExportService.generateExcel(type || undefined, status || undefined, search || undefined);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=fiyat_kartlari_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    }
    findAll(query) {
        return this.priceCardService.findAll(query);
    }
    findOne(id) {
        return this.priceCardService.findOne(id);
    }
    update(id, updateDto, req) {
        const userId = req?.user?.id;
        return this.priceCardService.update(id, updateDto, userId);
    }
    remove(id) {
        return this.priceCardService.remove(id);
    }
    findByStok(productId, query) {
        return this.priceCardService.findByStok(productId, query);
    }
    findLatest(productId, query) {
        const type = query.type ?? _createpricecarddto.PriceType.SALE;
        return this.priceCardService.findLatest(productId, type);
    }
    constructor(priceCardService, priceCardExportService){
        this.priceCardService = priceCardService;
        this.priceCardExportService = priceCardExportService;
    }
};
_ts_decorate([
    (0, _common.Post)('bulk-update'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bulkupdatepricecarddto.BulkUpdatePriceCardDto === "undefined" ? Object : _bulkupdatepricecarddto.BulkUpdatePriceCardDto,
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "bulkUpdate", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpricecarddto.CreatePriceCardDto === "undefined" ? Object : _createpricecarddto.CreatePriceCardDto,
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('export/excel'),
    _ts_param(0, (0, _common.Query)('type')),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], PriceCardController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _findpricecardsdto.FindAllPriceCardsDto === "undefined" ? Object : _findpricecardsdto.FindAllPriceCardsDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatepricecarddto.UpdatePriceCardDto === "undefined" ? Object : _updatepricecarddto.UpdatePriceCardDto,
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Get)('product/:productId'),
    _ts_param(0, (0, _common.Param)('productId')),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _findpricecardsdto.FindPriceCardsDto === "undefined" ? Object : _findpricecardsdto.FindPriceCardsDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "findByStok", null);
_ts_decorate([
    (0, _common.Get)('product/:productId/latest'),
    _ts_param(0, (0, _common.Param)('productId')),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _findpricecardsdto.LatestPriceQueryDto === "undefined" ? Object : _findpricecardsdto.LatestPriceQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceCardController.prototype, "findLatest", null);
PriceCardController = _ts_decorate([
    (0, _common.Controller)('price-cards'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _pricecardservice.PriceCardService === "undefined" ? Object : _pricecardservice.PriceCardService,
        typeof _pricecardexportservice.PriceCardExportService === "undefined" ? Object : _pricecardexportservice.PriceCardExportService
    ])
], PriceCardController);

//# sourceMappingURL=price-card.controller.js.map