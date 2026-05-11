"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceController", {
    enumerable: true,
    get: function() {
        return InvoiceController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _invoiceenums = require("./invoice.enums");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createinvoicedto = require("./dto/create-invoice.dto");
const _updateinvoicedto = require("./dto/update-invoice.dto");
const _invoiceservice = require("./invoice.service");
const _invoiceexportservice = require("./invoice-export.service");
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
let InvoiceController = class InvoiceController {
    async getStats(invoiceType) {
        return this.invoiceService.getSalesStats(invoiceType);
    }
    async getDueDateAnalysis(accountId) {
        return this.invoiceService.getDueDateAnalysis(accountId);
    }
    async getVadeAnaliz(accountId) {
        return this.invoiceService.getVadeAnaliz(accountId);
    }
    async getPriceHistory(accountId, productId) {
        return this.invoiceService.getPriceHistory(accountId, productId);
    }
    async getExchangeRate(currency) {
        const rate = await this.invoiceService.getExchangeRate(currency);
        return {
            rate
        };
    }
    async exportExcel(type, startDate, endDate, status, search, salesAgentId, res) {
        const buffer = await this.invoiceExportService.generateSalesInvoiceExcel(type || undefined, startDate || undefined, endDate || undefined, status || undefined, search || undefined, salesAgentId || undefined);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=faturalar_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    }
    async findAll(page, limit, type, search, accountId, sortBy, sortOrder, startDate, endDate, status, salesAgentId) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        try {
            const result = await this.invoiceService.findAllAdvanced(pageNum, limitNum, type, search, accountId, sortBy, sortOrder, startDate, endDate, status, salesAgentId);
            return {
                data: result.data,
                meta: result.meta
            };
        } catch (error) {
            throw error;
        }
    }
    async create(createFaturaDto, req) {
        const userId = req.user?.id;
        return this.invoiceService.create(createFaturaDto, userId);
    }
    async findOne(id) {
        return this.invoiceService.findOne(id);
    }
    async bulkUpdateDurum(body, req) {
        const userId = req.user?.id;
        return this.invoiceService.bulkUpdateStatus(body.ids, body.status, userId);
    }
    async update(id, updateFaturaDto, req) {
        const userId = req.user?.id;
        return this.invoiceService.update(id, updateFaturaDto, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id;
        return this.invoiceService.remove(id, userId);
    }
    async changeDurum(id, body, req) {
        const userId = req.user?.id;
        return this.invoiceService.changeStatus(id, body.status, userId);
    }
    async cancel(id, body, req) {
        const userId = req.user?.id;
        return this.invoiceService.cancel(id, userId, undefined, undefined, body.deliveryNoteIptal);
    }
    async getMaterialPreparation(id) {
        return this.invoiceService.getMaterialPreparationSlip(id);
    }
    async addPaymentPlan(id, body) {
        return this.invoiceService.createPaymentPlan(id, body);
    }
    async getPaymentPlan(id) {
        return this.invoiceService.getPaymentPlan(id);
    }
    async updatePaymentPlanItem(planId, body) {
        return this.invoiceService.updatePaymentPlanItem(planId, body.isPaid);
    }
    async recalculateBalances(accountId) {
        return this.invoiceService.recalculateCariBakiyeler(accountId);
    }
    constructor(invoiceService, invoiceExportService){
        this.invoiceService = invoiceService;
        this.invoiceExportService = invoiceExportService;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiQuery)({
        name: 'invoiceType',
        enum: _invoiceenums.InvoiceType,
        required: false
    }),
    _ts_param(0, (0, _common.Query)('invoiceType')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('due-date-analysis'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getDueDateAnalysis", null);
_ts_decorate([
    (0, _common.Get)('vade-analiz'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getVadeAnaliz", null);
_ts_decorate([
    (0, _common.Get)('price-history'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('accountId')),
    _ts_param(1, (0, _common.Query)('productId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getPriceHistory", null);
_ts_decorate([
    (0, _common.Get)('exchange-rate'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('currency')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getExchangeRate", null);
_ts_decorate([
    (0, _common.Get)('export/excel'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('invoiceType')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_param(3, (0, _common.Query)('status')),
    _ts_param(4, (0, _common.Query)('search')),
    _ts_param(5, (0, _common.Query)('salesAgentId')),
    _ts_param(6, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String,
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'type',
        enum: _invoiceenums.InvoiceType,
        required: false
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('type')),
    _ts_param(3, (0, _common.Query)('search')),
    _ts_param(4, (0, _common.Query)('accountId')),
    _ts_param(5, (0, _common.Query)('sortBy')),
    _ts_param(6, (0, _common.Query)('sortOrder')),
    _ts_param(7, (0, _common.Query)('startDate')),
    _ts_param(8, (0, _common.Query)('endDate')),
    _ts_param(9, (0, _common.Query)('status')),
    _ts_param(10, (0, _common.Query)('salesAgentId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createinvoicedto.CreateInvoiceDto === "undefined" ? Object : _createinvoicedto.CreateInvoiceDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "create", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Put)('bulk/status'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "bulkUpdateDurum", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateinvoicedto.UpdateInvoiceDto === "undefined" ? Object : _updateinvoicedto.UpdateInvoiceDto,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "update", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "remove", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Put)(':id/status'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "changeDurum", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Put)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Get)(':id/material-preparation'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getMaterialPreparation", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)(':id/payment-plan'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Array
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "addPaymentPlan", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Get)(':id/payment-plan'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "getPaymentPlan", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Put)('payment-plan/:planId'),
    _ts_param(0, (0, _common.Param)('planId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "updatePaymentPlanItem", null);
_ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Post)('recalculate-balances'),
    _ts_param(0, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InvoiceController.prototype, "recalculateBalances", null);
InvoiceController = _ts_decorate([
    (0, _swagger.ApiTags)('Invoices'),
    (0, _common.Controller)('invoices'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _invoiceservice.InvoiceService === "undefined" ? Object : _invoiceservice.InvoiceService,
        typeof _invoiceexportservice.InvoiceExportService === "undefined" ? Object : _invoiceexportservice.InvoiceExportService
    ])
], InvoiceController);

//# sourceMappingURL=invoice.controller.js.map