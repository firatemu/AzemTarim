"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bOrderController", {
    enumerable: true,
    get: function() {
        return B2bOrderController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2beffectivecustomerguard = require("./guards/b2b-effective-customer.guard");
const _b2bcartdto = require("./dto/b2b-cart.dto");
const _b2borderlistdto = require("./dto/b2b-order-list.dto");
const _b2bcartorderservice = require("./services/b2b-cart-order.service");
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
let B2bOrderController = class B2bOrderController {
    list(req, q) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cartOrder.listOrders(user.tenantId, cid, {
            page: q.page,
            pageSize: q.pageSize,
            status: q.status
        });
    }
    one(req, id) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cartOrder.getOrder(user.tenantId, cid, id);
    }
    place(req, dto) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cartOrder.placeOrder(user.tenantId, user, cid, dto);
    }
    constructor(cartOrder){
        this.cartOrder = cartOrder;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sipariş listesi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2borderlistdto.B2bOrderListQueryDto === "undefined" ? Object : _b2borderlistdto.B2bOrderListQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bOrderController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Sipariş detayı'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bOrderController.prototype, "one", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sepetten sipariş oluştur'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2bcartdto.B2bPlaceOrderDto === "undefined" ? Object : _b2bcartdto.B2bPlaceOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bOrderController.prototype, "place", null);
B2bOrderController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/orders'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard, _b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bcartorderservice.B2bCartOrderService === "undefined" ? Object : _b2bcartorderservice.B2bCartOrderService
    ])
], B2bOrderController);

//# sourceMappingURL=b2b-order.controller.js.map