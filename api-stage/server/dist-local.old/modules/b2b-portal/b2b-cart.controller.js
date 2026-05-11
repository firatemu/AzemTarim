"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bCartController", {
    enumerable: true,
    get: function() {
        return B2bCartController;
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
let B2bCartController = class B2bCartController {
    summary(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cart.getCartSummary(user.tenantId, cid);
    }
    clear(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cart.clearCart(user.tenantId, cid);
    }
    add(req, dto) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cart.addItem(user.tenantId, cid, dto.productId, dto.quantity);
    }
    updateQty(req, itemId, dto) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cart.updateItemQty(user.tenantId, cid, itemId, dto.quantity);
    }
    remove(req, itemId) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.cart.removeItem(user.tenantId, cid, itemId);
    }
    constructor(cart){
        this.cart = cart;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sepet özeti (fiyat kırılımı ile)'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bCartController.prototype, "summary", null);
_ts_decorate([
    (0, _common.Delete)(),
    (0, _swagger.ApiOperation)({
        summary: 'Sepeti temizle'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bCartController.prototype, "clear", null);
_ts_decorate([
    (0, _common.Post)('items'),
    (0, _swagger.ApiOperation)({
        summary: 'Sepete ürün ekle'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2bcartdto.B2bAddCartItemDto === "undefined" ? Object : _b2bcartdto.B2bAddCartItemDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bCartController.prototype, "add", null);
_ts_decorate([
    (0, _common.Patch)('items/:itemId'),
    (0, _swagger.ApiOperation)({
        summary: 'Sepet satırı miktarı'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('itemId')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        String,
        typeof _b2bcartdto.B2bUpdateCartItemDto === "undefined" ? Object : _b2bcartdto.B2bUpdateCartItemDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bCartController.prototype, "updateQty", null);
_ts_decorate([
    (0, _common.Delete)('items/:itemId'),
    (0, _swagger.ApiOperation)({
        summary: 'Sepet satırını sil'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('itemId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bCartController.prototype, "remove", null);
B2bCartController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/cart'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard, _b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bcartorderservice.B2bCartOrderService === "undefined" ? Object : _b2bcartorderservice.B2bCartOrderService
    ])
], B2bCartController);

//# sourceMappingURL=b2b-cart.controller.js.map