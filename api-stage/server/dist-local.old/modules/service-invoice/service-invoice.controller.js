"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServiceInvoiceController", {
    enumerable: true,
    get: function() {
        return ServiceInvoiceController;
    }
});
const _common = require("@nestjs/common");
const _serviceinvoiceservice = require("./service-invoice.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _getcurrentuserdecorator = require("../../common/decorators/get-current-user.decorator");
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
let ServiceInvoiceController = class ServiceInvoiceController {
    createFromWorkOrder(workOrderId, userId) {
        return this.serviceInvoiceService.createFromWorkOrder(workOrderId, userId);
    }
    findAll(page, limit, search, accountId) {
        return this.serviceInvoiceService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search, accountId);
    }
    findOne(id) {
        return this.serviceInvoiceService.findOne(id);
    }
    constructor(serviceInvoiceService){
        this.serviceInvoiceService = serviceInvoiceService;
    }
};
_ts_decorate([
    (0, _common.Post)('from-work-order/:workOrderId'),
    _ts_param(0, (0, _common.Param)('workOrderId')),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ServiceInvoiceController.prototype, "createFromWorkOrder", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ServiceInvoiceController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], ServiceInvoiceController.prototype, "findOne", null);
ServiceInvoiceController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('service-invoices'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _serviceinvoiceservice.ServiceInvoiceService === "undefined" ? Object : _serviceinvoiceservice.ServiceInvoiceService
    ])
], ServiceInvoiceController);

//# sourceMappingURL=service-invoice.controller.js.map