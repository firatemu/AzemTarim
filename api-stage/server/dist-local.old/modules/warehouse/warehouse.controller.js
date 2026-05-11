"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseController", {
    enumerable: true,
    get: function() {
        return WarehouseController;
    }
});
const _common = require("@nestjs/common");
const _warehouseservice = require("./warehouse.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createwarehousedto = require("./dto/create-warehouse.dto");
const _updatewarehousedto = require("./dto/update-warehouse.dto");
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
let WarehouseController = class WarehouseController {
    findAll(active) {
        const activeValue = active === undefined ? undefined : active === 'true';
        return this.warehouseService.findAll(activeValue);
    }
    findByCode(code) {
        return this.warehouseService.findByCode(code);
    }
    getDefault() {
        return this.warehouseService.getDefaultWarehouse();
    }
    getProductStockHistory(productId, date) {
        const targetDate = date ? new Date(date) : new Date();
        return this.warehouseService.getProductStockHistory(productId, targetDate);
    }
    getUniversalStockReport(date) {
        const targetDate = date ? new Date(date) : new Date();
        return this.warehouseService.getUniversalStockReport(targetDate);
    }
    findOne(id) {
        return this.warehouseService.findOne(id);
    }
    getInventory(id) {
        return this.warehouseService.getWarehouseStock(id);
    }
    create(createDto) {
        return this.warehouseService.create(createDto);
    }
    update(id, updateDto) {
        return this.warehouseService.update(id, updateDto);
    }
    remove(id) {
        return this.warehouseService.remove(id);
    }
    getStockReport(id) {
        return this.warehouseService.getStockReport(id);
    }
    constructor(warehouseService){
        this.warehouseService = warehouseService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('active')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('code/:code'),
    _ts_param(0, (0, _common.Param)('code')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "findByCode", null);
_ts_decorate([
    (0, _common.Get)('default/get'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "getDefault", null);
_ts_decorate([
    (0, _common.Get)('product/:productId/stock-history'),
    _ts_param(0, (0, _common.Param)('productId')),
    _ts_param(1, (0, _common.Query)('date')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "getProductStockHistory", null);
_ts_decorate([
    (0, _common.Get)('all/universal-stock-report'),
    _ts_param(0, (0, _common.Query)('date')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "getUniversalStockReport", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Get)(':id/inventory'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "getInventory", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createwarehousedto.CreateWarehouseDto === "undefined" ? Object : _createwarehousedto.CreateWarehouseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatewarehousedto.UpdateWarehouseDto === "undefined" ? Object : _updatewarehousedto.UpdateWarehouseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Get)(':id/stock-report'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseController.prototype, "getStockReport", null);
WarehouseController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('warehouses'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _warehouseservice.WarehouseService === "undefined" ? Object : _warehouseservice.WarehouseService
    ])
], WarehouseController);

//# sourceMappingURL=warehouse.controller.js.map