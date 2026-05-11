"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PurchaseWaybillController", {
    enumerable: true,
    get: function() {
        return PurchaseWaybillController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _purchasewaybillservice = require("./purchase-waybill.service");
const _createpurchasewaybilldto = require("./dto/create-purchase-waybill.dto");
const _updatepurchasewaybilldto = require("./dto/update-purchase-waybill.dto");
const _filterpurchasewaybilldto = require("./dto/filter-purchase-waybill.dto");
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
let PurchaseWaybillController = class PurchaseWaybillController {
    async getStats() {
        return this.purchaseWaybillService.getStats();
    }
    async findAll(filterDto) {
        const result = await this.purchaseWaybillService.findAll(filterDto);
        return {
            success: true,
            data: result.data,
            meta: result.meta
        };
    }
    async getPendingByAccount(accountId) {
        return this.purchaseWaybillService.getPendingByAccount(accountId);
    }
    async findOne(id) {
        return this.purchaseWaybillService.findOne(id);
    }
    async create(createDto, req) {
        const userId = req.user?.id;
        return this.purchaseWaybillService.create(createDto, userId);
    }
    async update(id, updateDto, req) {
        const userId = req.user?.id;
        return this.purchaseWaybillService.update(id, updateDto, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id;
        return this.purchaseWaybillService.remove(id, userId);
    }
    constructor(purchaseWaybillService){
        this.purchaseWaybillService = purchaseWaybillService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _filterpurchasewaybilldto.FilterPurchaseWaybillDto === "undefined" ? Object : _filterpurchasewaybilldto.FilterPurchaseWaybillDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('pending/:accountId'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "getPendingByAccount", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpurchasewaybilldto.CreatePurchaseWaybillDto === "undefined" ? Object : _createpurchasewaybilldto.CreatePurchaseWaybillDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatepurchasewaybilldto.UpdatePurchaseWaybillDto === "undefined" ? Object : _updatepurchasewaybilldto.UpdatePurchaseWaybillDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseWaybillController.prototype, "remove", null);
PurchaseWaybillController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)([
        'purchase-waybill',
        'satin-alma-irsaliyesi'
    ]),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _purchasewaybillservice.PurchaseWaybillService === "undefined" ? Object : _purchasewaybillservice.PurchaseWaybillService
    ])
], PurchaseWaybillController);

//# sourceMappingURL=purchase-waybill.controller.js.map