"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CashboxController", {
    enumerable: true,
    get: function() {
        return CashboxController;
    }
});
const _common = require("@nestjs/common");
const _cashboxservice = require("./cashbox.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createcashboxdto = require("./dto/create-cashbox.dto");
const _updatecashboxdto = require("./dto/update-cashbox.dto");
const _createcashboxmovementdto = require("./dto/create-cashbox-movement.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _cashboxenums = require("./cashbox.enums");
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
let CashboxController = class CashboxController {
    findAll(type, isActive, isRetail) {
        const isActiveValue = isActive === undefined ? undefined : isActive === 'true';
        const isRetailValue = isRetail === undefined ? undefined : isRetail === 'true';
        return this.cashboxService.findAll(type, isActiveValue, isRetailValue);
    }
    findOne(id) {
        return this.cashboxService.findOne(id);
    }
    create(dto, user) {
        return this.cashboxService.create(dto, user?.userId);
    }
    update(id, dto, user) {
        return this.cashboxService.update(id, dto, user?.userId);
    }
    remove(id) {
        return this.cashboxService.remove(id);
    }
    createMovement(dto, user) {
        return this.cashboxService.createMovement(dto, user?.userId);
    }
    deleteMovement(id) {
        return this.cashboxService.deleteMovement(id);
    }
    getPendingTransfers(id) {
        return this.cashboxService.getPendingPOSTransfers(id);
    }
    constructor(cashboxService){
        this.cashboxService = cashboxService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('type')),
    _ts_param(1, (0, _common.Query)('isActive')),
    _ts_param(2, (0, _common.Query)('isRetail')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cashboxenums.CashboxType === "undefined" ? Object : _cashboxenums.CashboxType,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcashboxdto.CreateCashboxDto === "undefined" ? Object : _createcashboxdto.CreateCashboxDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecashboxdto.UpdateCashboxDto === "undefined" ? Object : _updatecashboxdto.UpdateCashboxDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)('movement'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcashboxmovementdto.CreateCashboxMovementDto === "undefined" ? Object : _createcashboxmovementdto.CreateCashboxMovementDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "createMovement", null);
_ts_decorate([
    (0, _common.Delete)('movement/:id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "deleteMovement", null);
_ts_decorate([
    (0, _common.Get)(':id/pending-transfers'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CashboxController.prototype, "getPendingTransfers", null);
CashboxController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('cashbox'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cashboxservice.CashboxService === "undefined" ? Object : _cashboxservice.CashboxService
    ])
], CashboxController);

//# sourceMappingURL=cashbox.controller.js.map