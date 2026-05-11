"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrderItemController", {
    enumerable: true,
    get: function() {
        return WorkOrderItemController;
    }
});
const _common = require("@nestjs/common");
const _workorderitemservice = require("./work-order-item.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
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
let WorkOrderItemController = class WorkOrderItemController {
    create(dto) {
        return this.workOrderItemService.create(dto);
    }
    findAll(workOrderId) {
        return this.workOrderItemService.findAll(workOrderId);
    }
    findOne(id) {
        return this.workOrderItemService.findOne(id);
    }
    update(id, dto) {
        return this.workOrderItemService.update(id, dto);
    }
    remove(id) {
        return this.workOrderItemService.remove(id);
    }
    constructor(workOrderItemService){
        this.workOrderItemService = workOrderItemService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateWorkOrderItemDto === "undefined" ? Object : _dto.CreateWorkOrderItemDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderItemController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('work-order/:workOrderId'),
    _ts_param(0, (0, _common.Param)('workOrderId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderItemController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderItemController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateWorkOrderItemDto === "undefined" ? Object : _dto.UpdateWorkOrderItemDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderItemController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderItemController.prototype, "remove", null);
WorkOrderItemController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('work-order-items'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _workorderitemservice.WorkOrderItemService === "undefined" ? Object : _workorderitemservice.WorkOrderItemService
    ])
], WorkOrderItemController);

//# sourceMappingURL=work-order-item.controller.js.map