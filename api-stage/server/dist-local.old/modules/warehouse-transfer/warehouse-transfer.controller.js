"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseTransferController", {
    enumerable: true,
    get: function() {
        return WarehouseTransferController;
    }
});
const _common = require("@nestjs/common");
const _warehousetransferservice = require("./warehouse-transfer.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createwarehousetransferdto = require("./dto/create-warehouse-transfer.dto");
const _updatewarehousetransferdto = require("./dto/update-warehouse-transfer.dto");
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
let WarehouseTransferController = class WarehouseTransferController {
    findAll(status) {
        return this.warehouseTransferService.findAll(status);
    }
    findOne(id) {
        return this.warehouseTransferService.findOne(id);
    }
    create(dto, req) {
        dto.userId = req.user?.id;
        return this.warehouseTransferService.create(dto);
    }
    update(id, dto, req) {
        dto.userId = req.user?.id;
        return this.warehouseTransferService.update(id, dto);
    }
    approve(id, req) {
        return this.warehouseTransferService.approve(id, req.user?.id);
    }
    complete(id, req) {
        return this.warehouseTransferService.complete(id, req.user?.id);
    }
    cancel(id, reason, req) {
        return this.warehouseTransferService.cancel(id, req.user?.id, reason);
    }
    remove(id) {
        return this.warehouseTransferService.remove(id);
    }
    constructor(warehouseTransferService){
        this.warehouseTransferService = warehouseTransferService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('status')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createwarehousetransferdto.CreateWarehouseTransferDto === "undefined" ? Object : _createwarehousetransferdto.CreateWarehouseTransferDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatewarehousetransferdto.UpdateWarehouseTransferDto === "undefined" ? Object : _updatewarehousetransferdto.UpdateWarehouseTransferDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "update", null);
_ts_decorate([
    (0, _common.Put)(':id/approve'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "approve", null);
_ts_decorate([
    (0, _common.Put)(':id/complete'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "complete", null);
_ts_decorate([
    (0, _common.Put)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('reason')),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WarehouseTransferController.prototype, "remove", null);
WarehouseTransferController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('warehouse-transfer'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _warehousetransferservice.WarehouseTransferService === "undefined" ? Object : _warehousetransferservice.WarehouseTransferService
    ])
], WarehouseTransferController);

//# sourceMappingURL=warehouse-transfer.controller.js.map