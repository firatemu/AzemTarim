"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceListController", {
    enumerable: true,
    get: function() {
        return PriceListController;
    }
});
const _common = require("@nestjs/common");
const _pricelistservice = require("./price-list.service");
const _createpricelistdto = require("./dto/create-price-list.dto");
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
let PriceListController = class PriceListController {
    create(createDto) {
        return this.priceListService.create(createDto);
    }
    findStokPrice(productId, accountId) {
        return this.priceListService.findStokPrice(productId, accountId);
    }
    findOne(id) {
        return this.priceListService.findOne(id);
    }
    constructor(priceListService){
        this.priceListService = priceListService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpricelistdto.CreatePriceListDto === "undefined" ? Object : _createpricelistdto.CreatePriceListDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceListController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('product/:productId'),
    _ts_param(0, (0, _common.Param)('productId')),
    _ts_param(1, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceListController.prototype, "findStokPrice", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PriceListController.prototype, "findOne", null);
PriceListController = _ts_decorate([
    (0, _common.Controller)('price-lists'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _pricelistservice.PriceListService === "undefined" ? Object : _pricelistservice.PriceListService
    ])
], PriceListController);

//# sourceMappingURL=price-list.controller.js.map