"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VehicleExpensesController", {
    enumerable: true,
    get: function() {
        return VehicleExpensesController;
    }
});
const _common = require("@nestjs/common");
const _vehicleexpensesservice = require("./vehicle-expenses.service");
const _createvehicleexpensedto = require("./dto/create-vehicle-expense.dto");
const _updatevehicleexpensedto = require("./dto/update-vehicle-expense.dto");
const _swagger = require("@nestjs/swagger");
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
let VehicleExpensesController = class VehicleExpensesController {
    create(createVehicleExpenseDto) {
        return this.vehicleExpensesService.create(createVehicleExpenseDto);
    }
    findAll() {
        return this.vehicleExpensesService.findAll();
    }
    findByVehicle(vehicleId) {
        return this.vehicleExpensesService.findByVehicle(vehicleId);
    }
    findOne(id) {
        return this.vehicleExpensesService.findOne(id);
    }
    update(id, updateVehicleExpenseDto) {
        return this.vehicleExpensesService.update(id, updateVehicleExpenseDto);
    }
    remove(id) {
        return this.vehicleExpensesService.remove(id);
    }
    constructor(vehicleExpensesService){
        this.vehicleExpensesService = vehicleExpensesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Yeni araç masrafı oluşturur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createvehicleexpensedto.CreateVehicleExpenseDto === "undefined" ? Object : _createvehicleexpensedto.CreateVehicleExpenseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Tüm araç expensesını listeler'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('vehicle/:vehicleId'),
    (0, _swagger.ApiOperation)({
        summary: 'Belirtilen aracın expensesını listeler'
    }),
    _ts_param(0, (0, _common.Param)('vehicleId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "findByVehicle", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Belirtilen masraf detaylarını getirir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Masraf bilgilerini günceller'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatevehicleexpensedto.UpdateVehicleExpenseDto === "undefined" ? Object : _updatevehicleexpensedto.UpdateVehicleExpenseDto
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Masrafı siler'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleExpensesController.prototype, "remove", null);
VehicleExpensesController = _ts_decorate([
    (0, _swagger.ApiTags)('Vehicle Expenses'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('vehicle-expenses'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _vehicleexpensesservice.VehicleExpensesService === "undefined" ? Object : _vehicleexpensesservice.VehicleExpensesService
    ])
], VehicleExpensesController);

//# sourceMappingURL=vehicle-expenses.controller.js.map