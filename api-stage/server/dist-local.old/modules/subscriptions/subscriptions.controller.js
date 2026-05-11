"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SubscriptionsController", {
    enumerable: true,
    get: function() {
        return SubscriptionsController;
    }
});
const _common = require("@nestjs/common");
const _subscriptionsservice = require("./subscriptions.service");
const _createsubscriptiondto = require("./dto/create-subscription.dto");
const _updatesubscriptiondto = require("./dto/update-subscription.dto");
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
let SubscriptionsController = class SubscriptionsController {
    create(createSubscriptionDto) {
        return this.subscriptionsService.create(createSubscriptionDto);
    }
    findAll() {
        return this.subscriptionsService.findAll();
    }
    findCurrent(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required');
        }
        return this.subscriptionsService.findByTenantId(tenantId);
    }
    // Özel route'lar dinamik route'lardan ÖNCE olmalı
    startTrial(userId) {
        return this.subscriptionsService.startTrial(userId);
    }
    upgrade(userId, body) {
        return this.subscriptionsService.upgradeFromTrial(userId, body.planName);
    }
    // Özel POST route'ları (cancel, reactivate gibi) dinamik route'lardan ÖNCE olmalı
    cancel(id) {
        return this.subscriptionsService.cancel(id);
    }
    reactivate(id) {
        return this.subscriptionsService.reactivate(id);
    }
    // Dinamik route'lar en sonda
    findOne(id) {
        return this.subscriptionsService.findOne(id);
    }
    update(id, updateSubscriptionDto) {
        return this.subscriptionsService.update(id, updateSubscriptionDto);
    }
    remove(id) {
        return this.subscriptionsService.remove(id);
    }
    constructor(subscriptionsService){
        this.subscriptionsService = subscriptionsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsubscriptiondto.CreateSubscriptionDto === "undefined" ? Object : _createsubscriptiondto.CreateSubscriptionDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('current'),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "findCurrent", null);
_ts_decorate([
    (0, _common.Post)('start-trial'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "startTrial", null);
_ts_decorate([
    (0, _common.Post)('upgrade'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "upgrade", null);
_ts_decorate([
    (0, _common.Post)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Post)(':id/reactivate'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "reactivate", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesubscriptiondto.UpdateSubscriptionDto === "undefined" ? Object : _updatesubscriptiondto.UpdateSubscriptionDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "remove", null);
SubscriptionsController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('subscriptions'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _subscriptionsservice.SubscriptionsService === "undefined" ? Object : _subscriptionsservice.SubscriptionsService
    ])
], SubscriptionsController);

//# sourceMappingURL=subscriptions.controller.js.map