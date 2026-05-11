"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CostingController", {
    enumerable: true,
    get: function() {
        return CostingController;
    }
});
const _common = require("@nestjs/common");
const _costingservice = require("./costing.service");
const _calculatebulkcostdto = require("./dto/calculate-bulk-cost.dto");
const _calculatecostdto = require("./dto/calculate-cost.dto");
const _getcostingquerydto = require("./dto/get-costing-query.dto");
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
let CostingController = class CostingController {
    getLatest(query) {
        return this.costingService.getLatestCosts(query);
    }
    calculate(body) {
        return this.costingService.calculateWeightedAverageCost(body.productId);
    }
    calculateBulk(body) {
        return this.costingService.calculateWeightedAverageCostBulk(body.productIds);
    }
    constructor(costingService){
        this.costingService = costingService;
    }
};
_ts_decorate([
    (0, _common.Get)('latest'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _getcostingquerydto.GetCostingQueryDto === "undefined" ? Object : _getcostingquerydto.GetCostingQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CostingController.prototype, "getLatest", null);
_ts_decorate([
    (0, _common.Post)('calculate'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _calculatecostdto.CalculateCostDto === "undefined" ? Object : _calculatecostdto.CalculateCostDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CostingController.prototype, "calculate", null);
_ts_decorate([
    (0, _common.Post)('calculate-bulk'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _calculatebulkcostdto.CalculateBulkCostDto === "undefined" ? Object : _calculatebulkcostdto.CalculateBulkCostDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CostingController.prototype, "calculateBulk", null);
CostingController = _ts_decorate([
    (0, _common.Controller)('costings'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _costingservice.CostingService === "undefined" ? Object : _costingservice.CostingService
    ])
], CostingController);

//# sourceMappingURL=costing.controller.js.map