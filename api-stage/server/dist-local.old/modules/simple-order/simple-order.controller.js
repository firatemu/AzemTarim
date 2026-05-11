"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SimpleOrderController", {
    enumerable: true,
    get: function() {
        return SimpleOrderController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _simpleorderservice = require("./simple-order.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createsimpleorderdto = require("./dto/create-simple-order.dto");
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
let SimpleOrderController = class SimpleOrderController {
    /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak AWAITING_APPROVAL olarak ayarlanır
   */ create(dto) {
        return this.simpleOrderService.create(dto);
    }
    /**
   * Tüm siparişleri listele
   */ findAll(page, limit, status) {
        return this.simpleOrderService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, status);
    }
    /**
   * Tek sipariş getir
   */ findOne(id) {
        return this.simpleOrderService.findOne(id);
    }
    constructor(simpleOrderService){
        this.simpleOrderService = simpleOrderService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateSimpleOrderDto === "undefined" ? Object : _dto.CreateSimpleOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SimpleOrderController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'status',
        enum: _createsimpleorderdto.SimpleOrderDurum,
        required: false
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('status')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _createsimpleorderdto.SimpleOrderDurum === "undefined" ? Object : _createsimpleorderdto.SimpleOrderDurum
    ]),
    _ts_metadata("design:returntype", void 0)
], SimpleOrderController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SimpleOrderController.prototype, "findOne", null);
SimpleOrderController = _ts_decorate([
    (0, _swagger.ApiTags)('simple-order'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('simple-order'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _simpleorderservice.SimpleOrderService === "undefined" ? Object : _simpleorderservice.SimpleOrderService
    ])
], SimpleOrderController);

//# sourceMappingURL=simple-order.controller.js.map