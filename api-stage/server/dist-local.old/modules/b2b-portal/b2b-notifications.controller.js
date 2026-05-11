"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bNotificationsController", {
    enumerable: true,
    get: function() {
        return B2bNotificationsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2beffectivecustomerguard = require("./guards/b2b-effective-customer.guard");
const _b2bnotificationsdto = require("./dto/b2b-notifications.dto");
const _b2bnotificationsservice = require("./services/b2b-notifications.service");
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
let B2bNotificationsController = class B2bNotificationsController {
    list(req, q) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.notifications.list(user.tenantId, cid, q.page, q.pageSize);
    }
    unread(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.notifications.unreadCount(user.tenantId, cid);
    }
    markAll(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.notifications.markAllRead(user.tenantId, cid);
    }
    markRead(req, id) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.notifications.markRead(user.tenantId, cid, id);
    }
    constructor(notifications){
        this.notifications = notifications;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Bildirim listesi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2bnotificationsdto.B2bNotifListQueryDto === "undefined" ? Object : _b2bnotificationsdto.B2bNotifListQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bNotificationsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)('unread-count'),
    (0, _swagger.ApiOperation)({
        summary: 'Okunmamis bildirim sayisi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bNotificationsController.prototype, "unread", null);
_ts_decorate([
    (0, _common.Patch)('read-all'),
    (0, _swagger.ApiOperation)({
        summary: 'Tumunu okundu isaretle'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bNotificationsController.prototype, "markAll", null);
_ts_decorate([
    (0, _common.Patch)(':id/read'),
    (0, _swagger.ApiOperation)({
        summary: 'Bildirimi okundu isaretle'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bNotificationsController.prototype, "markRead", null);
B2bNotificationsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/notifications'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard, _b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bnotificationsservice.B2bNotificationsService === "undefined" ? Object : _b2bnotificationsservice.B2bNotificationsService
    ])
], B2bNotificationsController);

//# sourceMappingURL=b2b-notifications.controller.js.map