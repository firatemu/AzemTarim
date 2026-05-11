"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalesWaybillController", {
    enumerable: true,
    get: function() {
        return SalesWaybillController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _saleswaybillservice = require("./sales-waybill.service");
const _createsaleswaybilldto = require("./dto/create-sales-waybill.dto");
const _updatesaleswaybilldto = require("./dto/update-sales-waybill.dto");
const _filtersaleswaybilldto = require("./dto/filter-sales-waybill.dto");
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
let SalesWaybillController = class SalesWaybillController {
    async getStats() {
        return this.salesWaybillService.getStats();
    }
    async findAll(filterDto) {
        const result = await this.salesWaybillService.findAll(filterDto);
        return {
            success: true,
            data: result.data,
            meta: result.meta
        };
    }
    async getPendingByAccount(accountId) {
        return this.salesWaybillService.getPendingByAccount(accountId);
    }
    async findOne(id) {
        return this.salesWaybillService.findOne(id);
    }
    async create(createDto, req) {
        const userId = req.user?.id;
        return this.salesWaybillService.create(createDto, userId);
    }
    async update(id, updateDto, req) {
        const userId = req.user?.id;
        return this.salesWaybillService.update(id, updateDto, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id;
        return this.salesWaybillService.remove(id, userId);
    }
    constructor(salesWaybillService){
        this.salesWaybillService = salesWaybillService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _filtersaleswaybilldto.FilterSalesWaybillDto === "undefined" ? Object : _filtersaleswaybilldto.FilterSalesWaybillDto
    ]),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('pending/:accountId'),
    _ts_param(0, (0, _common.Param)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "getPendingByAccount", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsaleswaybilldto.CreateSalesWaybillDto === "undefined" ? Object : _createsaleswaybilldto.CreateSalesWaybillDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesaleswaybilldto.UpdateSalesWaybillDto === "undefined" ? Object : _updatesaleswaybilldto.UpdateSalesWaybillDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], SalesWaybillController.prototype, "update", null);
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
], SalesWaybillController.prototype, "remove", null);
SalesWaybillController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)([
        'sales-waybills',
        'delivery-notes',
        'satis-irsaliyesi'
    ]),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _saleswaybillservice.SalesWaybillService === "undefined" ? Object : _saleswaybillservice.SalesWaybillService
    ])
], SalesWaybillController);

//# sourceMappingURL=sales-waybill.controller.js.map