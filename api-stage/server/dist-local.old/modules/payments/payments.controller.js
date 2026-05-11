"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsController", {
    enumerable: true,
    get: function() {
        return PaymentsController;
    }
});
const _common = require("@nestjs/common");
const _paymentsservice = require("./payments.service");
const _createpaymentdto = require("./dto/create-payment.dto");
const _updatepaymentdto = require("./dto/update-payment.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _publicdecorator = require("../../common/decorators/public.decorator");
const _iyzicoservice = require("./iyzico/iyzico.service");
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
let PaymentsController = class PaymentsController {
    create(createPaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }
    findAll() {
        return this.paymentsService.findAll();
    }
    findHistory(subscriptionId) {
        if (!subscriptionId) {
            throw new Error('subscriptionId is required');
        }
        return this.paymentsService.findBySubscriptionId(subscriptionId);
    }
    findOne(id) {
        return this.paymentsService.findOne(id);
    }
    update(id, updatePaymentDto) {
        return this.paymentsService.update(id, updatePaymentDto);
    }
    async refund(id) {
        const payment = await this.paymentsService.findOne(id);
        if (!payment.iyzicoPaymentId) {
            throw new Error('Payment does not have iyzico payment ID');
        }
        return this.iyzicoService.refund(payment.iyzicoPaymentId, Number(payment.amount));
    }
    async handleIyzicoWebhook(payload) {
        return this.iyzicoService.handleWebhook(payload);
    }
    async handleCallback(token) {
        // İyzico callback işleme
        return this.iyzicoService.handleCallback(token);
    }
    remove(id) {
        return this.paymentsService.remove(id);
    }
    constructor(paymentsService, iyzicoService){
        this.paymentsService = paymentsService;
        this.iyzicoService = iyzicoService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpaymentdto.CreatePaymentDto === "undefined" ? Object : _createpaymentdto.CreatePaymentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('history'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('subscriptionId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findHistory", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatepaymentdto.UpdatePaymentDto === "undefined" ? Object : _updatepaymentdto.UpdatePaymentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)(':id/refund'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
_ts_decorate([
    (0, _common.Post)('webhooks/iyzico'),
    (0, _publicdecorator.Public)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleIyzicoWebhook", null);
_ts_decorate([
    (0, _common.Post)('callback'),
    (0, _publicdecorator.Public)(),
    _ts_param(0, (0, _common.Query)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleCallback", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "remove", null);
PaymentsController = _ts_decorate([
    (0, _common.Controller)('payments'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentsservice.PaymentsService === "undefined" ? Object : _paymentsservice.PaymentsService,
        typeof _iyzicoservice.IyzicoService === "undefined" ? Object : _iyzicoservice.IyzicoService
    ])
], PaymentsController);

//# sourceMappingURL=payments.controller.js.map