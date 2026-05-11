"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceProfitController", {
    enumerable: true,
    get: function() {
        return InvoiceProfitController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _invoiceprofitservice = require("./invoice-profit.service");
const _getprofitquerydto = require("./dto/get-profit-query.dto");
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
let InvoiceProfitController = class InvoiceProfitController {
    async getProfitByInvoice(invoiceId) {
        return this.invoiceProfitService.getProfitByInvoice(invoiceId);
    }
    async getProfitList(query) {
        return this.invoiceProfitService.getProfitList({
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            accountId: query.accountId,
            status: query.status
        });
    }
    async getProfitByProduct(query) {
        return this.invoiceProfitService.getProfitByProduct({
            productId: query.productId,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined
        });
    }
    async getProfitDetail(invoiceId) {
        return this.invoiceProfitService.getProfitDetailByInvoice(invoiceId);
    }
    async recalculateProfit(invoiceId, req) {
        await this.invoiceProfitService.recalculateProfit(invoiceId, req.user?.id);
        return {
            message: 'Kar hesaplaması başarıyla güncellendi'
        };
    }
    constructor(invoiceProfitService){
        this.invoiceProfitService = invoiceProfitService;
    }
};
_ts_decorate([
    (0, _common.Get)('by-invoice/:invoiceId'),
    _ts_param(0, (0, _common.Param)('invoiceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceProfitController.prototype, "getProfitByInvoice", null);
_ts_decorate([
    (0, _common.Get)('list'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _getprofitquerydto.GetProfitQueryDto === "undefined" ? Object : _getprofitquerydto.GetProfitQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceProfitController.prototype, "getProfitList", null);
_ts_decorate([
    (0, _common.Get)('by-product'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _getprofitquerydto.GetProfitQueryDto === "undefined" ? Object : _getprofitquerydto.GetProfitQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceProfitController.prototype, "getProfitByProduct", null);
_ts_decorate([
    (0, _common.Get)('detail/:invoiceId'),
    _ts_param(0, (0, _common.Param)('invoiceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceProfitController.prototype, "getProfitDetail", null);
_ts_decorate([
    (0, _common.Post)('recalculate/:invoiceId'),
    _ts_param(0, (0, _common.Param)('invoiceId')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceProfitController.prototype, "recalculateProfit", null);
InvoiceProfitController = _ts_decorate([
    (0, _common.Controller)('invoice-profits'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _invoiceprofitservice.InvoiceProfitService === "undefined" ? Object : _invoiceprofitservice.InvoiceProfitService
    ])
], InvoiceProfitController);

//# sourceMappingURL=invoice-profit.controller.js.map