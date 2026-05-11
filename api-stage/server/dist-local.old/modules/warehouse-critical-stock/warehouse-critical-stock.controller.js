"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseCriticalStockController", {
    enumerable: true,
    get: function() {
        return WarehouseCriticalStockController;
    }
});
const _common = require("@nestjs/common");
const _warehousecriticalstockservice = require("./warehouse-critical-stock.service");
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
let WarehouseCriticalStockController = class WarehouseCriticalStockController {
    updateCriticalStock(warehouseId, productId, criticalQty) {
        return this.service.updateCriticalStock(warehouseId, productId, criticalQty);
    }
    getCriticalStockReport() {
        return this.service.getCriticalStockReport();
    }
    bulkUpdate(data) {
        return this.service.bulkUpdateFromExcel(data);
    }
    constructor(service){
        this.service = service;
    }
};
_ts_decorate([
    (0, _common.Put)(':warehouseId/:productId'),
    _ts_param(0, (0, _common.Param)('warehouseId')),
    _ts_param(1, (0, _common.Param)('productId')),
    _ts_param(2, (0, _common.Body)('criticalQty')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseCriticalStockController.prototype, "updateCriticalStock", null);
_ts_decorate([
    (0, _common.Get)('report'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], WarehouseCriticalStockController.prototype, "getCriticalStockReport", null);
_ts_decorate([
    (0, _common.Put)('bulk-update'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Array
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseCriticalStockController.prototype, "bulkUpdate", null);
WarehouseCriticalStockController = _ts_decorate([
    (0, _common.Controller)('warehouse-critical-stock'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _warehousecriticalstockservice.WarehouseCriticalStockService === "undefined" ? Object : _warehousecriticalstockservice.WarehouseCriticalStockService
    ])
], WarehouseCriticalStockController);

//# sourceMappingURL=warehouse-critical-stock.controller.js.map