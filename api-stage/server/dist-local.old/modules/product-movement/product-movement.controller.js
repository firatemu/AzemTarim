"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MovementType () {
        return MovementType;
    },
    get ProductMovementController () {
        return ProductMovementController;
    }
});
const _common = require("@nestjs/common");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _productmovementservice = require("./product-movement.service");
const _swagger = require("@nestjs/swagger");
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
var MovementType = /*#__PURE__*/ function(MovementType) {
    MovementType["ENTRY"] = "ENTRY";
    MovementType["EXIT"] = "EXIT";
    MovementType["SALE"] = "SALE";
    MovementType["RETURN"] = "RETURN";
    MovementType["CANCELLATION_ENTRY"] = "CANCELLATION_ENTRY";
    MovementType["CANCELLATION_EXIT"] = "CANCELLATION_EXIT";
    MovementType["COUNT"] = "COUNT";
    MovementType["COUNT_SURPLUS"] = "COUNT_SURPLUS";
    MovementType["COUNT_SHORTAGE"] = "COUNT_SHORTAGE";
    return MovementType;
}({});
let ProductMovementController = class ProductMovementController {
    async findAll(user, page, limit, productId, movementType) {
        return this.productMovementService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 100, productId, movementType, user?.tenantId || user?.userId);
    }
    constructor(productMovementService){
        this.productMovementService = productMovementService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'movementType',
        enum: MovementType,
        required: false
    }),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('page')),
    _ts_param(2, (0, _common.Query)('limit')),
    _ts_param(3, (0, _common.Query)('productId')),
    _ts_param(4, (0, _common.Query)('movementType')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ProductMovementController.prototype, "findAll", null);
ProductMovementController = _ts_decorate([
    (0, _swagger.ApiTags)('product-movement'),
    (0, _common.Controller)('product-movements'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _productmovementservice.ProductMovementService === "undefined" ? Object : _productmovementservice.ProductMovementService
    ])
], ProductMovementController);

//# sourceMappingURL=product-movement.controller.js.map