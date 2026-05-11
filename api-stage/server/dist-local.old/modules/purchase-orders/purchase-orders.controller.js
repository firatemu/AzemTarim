"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PurchaseOrdersController", {
    enumerable: true,
    get: function() {
        return PurchaseOrdersController;
    }
});
const _common = require("@nestjs/common");
const _purchaseordersservice = require("./purchase-orders.service");
const _createpurchaseorderdto = require("./dto/create-purchase-order.dto");
const _updatepurchaseorderdto = require("./dto/update-purchase-order.dto");
const _querypurchaseorderdto = require("./dto/query-purchase-order.dto");
const _invoicedpurchaseorderdto = require("./dto/invoiced-purchase-order.dto");
const _receivepurchaseorderdto = require("./dto/receive-purchase-order.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _client = require("@prisma/client");
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
let PurchaseOrdersController = class PurchaseOrdersController {
    async getStats(startDate, endDate, status, accountId) {
        const parsedStartDate = startDate ? new Date(startDate) : undefined;
        const parsedEndDate = endDate ? new Date(endDate) : undefined;
        return this.service.getStats(parsedStartDate, parsedEndDate, status, accountId);
    }
    async getOrdersForInvoice(query) {
        return this.service.findOrdersForInvoice(query.accountId, query.search);
    }
    async getOrdersForReceiving(query) {
        return this.service.findOrdersForReceiving(query.accountId, query.search);
    }
    async findAll(query) {
        return this.service.findAll(query);
    }
    async findDeleted(query) {
        return this.service.findDeleted(query);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async create(dto, user, req) {
        return this.service.create(dto, user?.userId, req.ip, req.headers['user-agent']);
    }
    async update(id, dto, user, req) {
        return this.service.update(id, dto, user?.userId, req.ip, req.headers['user-agent']);
    }
    async remove(id, user, req) {
        return this.service.remove(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    async cancel(id, user, req) {
        return this.service.cancel(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    async changeStatus(id, status, user, req) {
        return this.service.changeStatus(id, status, user?.userId, req.ip, req.headers['user-agent']);
    }
    async restore(id, user, req) {
        return this.service.restore(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    async invoiced(id, dto, user, req) {
        return this.service.markAsInvoiced(id, dto.invoiceNo, user?.userId, req.ip, req.headers['user-agent']);
    }
    async receive(id, dto, user, req) {
        return this.service.receive(id, dto.items, user?.userId, req.ip, req.headers['user-agent'], dto.warehouseId, dto.notes, dto.deliveryNoteNo);
    }
    async createWaybill(id, user, req) {
        return this.service.createWaybill(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    constructor(service){
        this.service = service;
    }
};
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_param(0, (0, _common.Query)('startDate')),
    _ts_param(1, (0, _common.Query)('endDate')),
    _ts_param(2, (0, _common.Query)('status')),
    _ts_param(3, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('for-invoice'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getOrdersForInvoice", null);
_ts_decorate([
    (0, _common.Get)('receiving-orders'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getOrdersForReceiving", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _querypurchaseorderdto.QueryPurchaseOrderDto === "undefined" ? Object : _querypurchaseorderdto.QueryPurchaseOrderDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('deleted'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _querypurchaseorderdto.QueryPurchaseOrderDto === "undefined" ? Object : _querypurchaseorderdto.QueryPurchaseOrderDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "findDeleted", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpurchaseorderdto.CreatePurchaseOrderDto === "undefined" ? Object : _createpurchaseorderdto.CreatePurchaseOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatepurchaseorderdto.UpdatePurchaseOrderDto === "undefined" ? Object : _updatepurchaseorderdto.UpdatePurchaseOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Put)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('status')),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _client.PurchaseOrderLocalStatus === "undefined" ? Object : _client.PurchaseOrderLocalStatus,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "changeStatus", null);
_ts_decorate([
    (0, _common.Put)(':id/restore'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "restore", null);
_ts_decorate([
    (0, _common.Put)(':id/invoiced'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _invoicedpurchaseorderdto.InvoicedPurchaseOrderDto === "undefined" ? Object : _invoicedpurchaseorderdto.InvoicedPurchaseOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "invoiced", null);
_ts_decorate([
    (0, _common.Post)(':id/receive'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _receivepurchaseorderdto.ReceivePurchaseOrderDto === "undefined" ? Object : _receivepurchaseorderdto.ReceivePurchaseOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "receive", null);
_ts_decorate([
    (0, _common.Post)(':id/create-waybill'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "createWaybill", null);
PurchaseOrdersController = _ts_decorate([
    (0, _common.Controller)('purchase-orders'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _purchaseordersservice.PurchaseOrdersService === "undefined" ? Object : _purchaseordersservice.PurchaseOrdersService
    ])
], PurchaseOrdersController);

//# sourceMappingURL=purchase-orders.controller.js.map