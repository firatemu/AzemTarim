"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OrderController", {
    enumerable: true,
    get: function() {
        return OrderController;
    }
});
const _common = require("@nestjs/common");
const _orderservice = require("./order.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createorderdto = require("./dto/create-order.dto");
const _updateorderdto = require("./dto/update-order.dto");
const _queryorderdto = require("./dto/query-order.dto");
const _faturalandiorderdto = require("./dto/faturalandi-order.dto");
const _hazirlaorderdto = require("./dto/hazirla-order.dto");
const _sevkorderdto = require("./dto/sevk-order.dto");
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
let OrderController = class OrderController {
    findAll(query) {
        return this.orderService.findAll(query.page ? parseInt(query.page) : 1, query.limit ? parseInt(query.limit) : 50, query.orderType, query.search, query.accountId, query.status);
    }
    findDeleted(query) {
        return this.orderService.findDeleted(query.page ? parseInt(query.page) : 1, query.limit ? parseInt(query.limit) : 50, query.orderType, query.search);
    }
    getOrdersForInvoice(query) {
        return this.orderService.findOrdersForInvoice(query.accountId, query.search, query.orderType);
    }
    async getStats(siparisTipi, startDate, endDate, durum, accountId) {
        const orderType = siparisTipi === 'SATIS' ? 'SALE' : 'PURCHASE';
        const parsedStartDate = startDate ? new Date(startDate) : undefined;
        const parsedEndDate = endDate ? new Date(endDate) : undefined;
        return this.orderService.getStats(orderType, parsedStartDate, parsedEndDate, durum, accountId);
    }
    getOrdersForDeliveryNote(query) {
        return this.orderService.findOrdersForDeliveryNote(query.accountId, query.search, query.orderType);
    }
    findOne(id) {
        return this.orderService.findOne(id);
    }
    create(createOrderDto, user, req) {
        return this.orderService.create(createOrderDto, user?.userId, req.ip, req.headers['user-agent']);
    }
    update(id, updateOrderDto, user, req) {
        return this.orderService.update(id, updateOrderDto, user?.userId, req.ip, req.headers['user-agent']);
    }
    remove(id, user, req) {
        return this.orderService.remove(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    cancel(id, user, req) {
        return this.orderService.cancel(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    changeStatus(id, status, user, req) {
        return this.orderService.changeStatus(id, status, user?.userId, req.ip, req.headers['user-agent']);
    }
    restore(id, user, req) {
        return this.orderService.restore(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    createDeliveryNote(id, user, req) {
        return this.orderService.createDeliveryNoteFromOrder(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    markInvoiced(id, dto, user, req) {
        return this.orderService.markInvoiced(id, dto.invoiceNo, user?.userId, req.ip, req.headers['user-agent']);
    }
    getPreparationDetails(id) {
        return this.orderService.getPreparationDetails(id);
    }
    prepare(id, dto, user) {
        return this.orderService.prepare(id, dto.items, user?.userId);
    }
    ship(id, dto, user, req) {
        return this.orderService.ship(id, dto.items, user?.userId, req.ip, req.headers['user-agent'], dto.warehouseId, dto.notes, dto.deliveryNoteNo);
    }
    constructor(orderService){
        this.orderService = orderService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _queryorderdto.QueryOrderDto === "undefined" ? Object : _queryorderdto.QueryOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('deleted'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _queryorderdto.QueryOrderDto === "undefined" ? Object : _queryorderdto.QueryOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "findDeleted", null);
_ts_decorate([
    (0, _common.Get)('for-invoice'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "getOrdersForInvoice", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_param(0, (0, _common.Query)('siparisTipi')),
    _ts_param(1, (0, _common.Query)('startDate')),
    _ts_param(2, (0, _common.Query)('endDate')),
    _ts_param(3, (0, _common.Query)('durum')),
    _ts_param(4, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], OrderController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('delivery-note-orders'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "getOrdersForDeliveryNote", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createorderdto.CreateOrderDto === "undefined" ? Object : _createorderdto.CreateOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateorderdto.UpdateOrderDto === "undefined" ? Object : _updateorderdto.UpdateOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "update", null);
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
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "remove", null);
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
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('status')),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "changeStatus", null);
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
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "restore", null);
_ts_decorate([
    (0, _common.Post)(':id/delivery-note'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "createDeliveryNote", null);
_ts_decorate([
    (0, _common.Put)(':id/mark-invoiced'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _faturalandiorderdto.MarkInvoicedDto === "undefined" ? Object : _faturalandiorderdto.MarkInvoicedDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "markInvoiced", null);
_ts_decorate([
    (0, _common.Get)(':id/preparation-details'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "getPreparationDetails", null);
_ts_decorate([
    (0, _common.Post)(':id/prepare'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _hazirlaorderdto.PrepareOrderDto === "undefined" ? Object : _hazirlaorderdto.PrepareOrderDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "prepare", null);
_ts_decorate([
    (0, _common.Post)(':id/ship'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _sevkorderdto.ShipOrderDto === "undefined" ? Object : _sevkorderdto.ShipOrderDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], OrderController.prototype, "ship", null);
OrderController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('orders'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _orderservice.OrderService === "undefined" ? Object : _orderservice.OrderService
    ])
], OrderController);

//# sourceMappingURL=order.controller.js.map