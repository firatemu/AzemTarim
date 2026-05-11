"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StockMoveController", {
    enumerable: true,
    get: function() {
        return StockMoveController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _stockmoveservice = require("./stock-move.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _putawaydto = require("./dto/put-away.dto");
const _bulkputawaydto = require("./dto/bulk-put-away.dto");
const _transferdto = require("./dto/transfer.dto");
const _assignlocationdto = require("./dto/assign-location.dto");
const _createstockmovedto = require("./dto/create-stock-move.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
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
let StockMoveController = class StockMoveController {
    findAll(productId, warehouseId, locationId, moveType, limit) {
        const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
        return this.stockMoveService.findAll(productId, warehouseId, locationId, moveType, limitValue);
    }
    findOne(id) {
        return this.stockMoveService.findOne(id);
    }
    assignLocation(assignLocationDto, user) {
        return this.stockMoveService.assignLocation(assignLocationDto, user?.userId);
    }
    putAway(putAwayDto, user) {
        return this.stockMoveService.putAway(putAwayDto, user?.userId);
    }
    bulkPutAway(bulkPutAwayDto, user) {
        return this.stockMoveService.bulkPutAway(bulkPutAwayDto, user?.userId);
    }
    transfer(transferDto, user) {
        return this.stockMoveService.transfer(transferDto, user?.userId);
    }
    constructor(stockMoveService){
        this.stockMoveService = stockMoveService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'moveType',
        enum: _createstockmovedto.StockMoveType,
        required: false
    }),
    _ts_param(0, (0, _common.Query)('productId')),
    _ts_param(1, (0, _common.Query)('warehouseId')),
    _ts_param(2, (0, _common.Query)('locationId')),
    _ts_param(3, (0, _common.Query)('moveType')),
    _ts_param(4, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof _createstockmovedto.StockMoveType === "undefined" ? Object : _createstockmovedto.StockMoveType,
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)('assign-location'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlocationdto.AssignLocationDto === "undefined" ? Object : _assignlocationdto.AssignLocationDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "assignLocation", null);
_ts_decorate([
    (0, _common.Post)('put-away'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _putawaydto.PutAwayDto === "undefined" ? Object : _putawaydto.PutAwayDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "putAway", null);
_ts_decorate([
    (0, _common.Post)('put-away/bulk'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bulkputawaydto.BulkPutAwayDto === "undefined" ? Object : _bulkputawaydto.BulkPutAwayDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "bulkPutAway", null);
_ts_decorate([
    (0, _common.Post)('transfer'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _transferdto.TransferDto === "undefined" ? Object : _transferdto.TransferDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], StockMoveController.prototype, "transfer", null);
StockMoveController = _ts_decorate([
    (0, _swagger.ApiTags)('stock-move'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('stock-movements'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _stockmoveservice.StockMoveService === "undefined" ? Object : _stockmoveservice.StockMoveService
    ])
], StockMoveController);

//# sourceMappingURL=stock-move.controller.js.map