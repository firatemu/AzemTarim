"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VehicleBrandController", {
    enumerable: true,
    get: function() {
        return VehicleBrandController;
    }
});
const _common = require("@nestjs/common");
const _vehiclebrandservice = require("./vehicle-brand.service");
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
let VehicleBrandController = class VehicleBrandController {
    create(createVehicleBrandDto) {
        return this.vehicleBrandService.create(createVehicleBrandDto);
    }
    // Spesifik route'lar - parametrik route'lardan ÖNCE tanımlanmalı (sıralama önemli!)
    getBrands() {
        return this.vehicleBrandService.getBrands();
    }
    getFuelTypes() {
        return this.vehicleBrandService.getFuelTypes();
    }
    getModels(brand) {
        return this.vehicleBrandService.getModels(brand);
    }
    // Genel listeleme route'u - parametrik route'lardan ÖNCE ama spesifik route'lardan SONRA
    findAll(page, limit, search, brand, fuelType) {
        return this.vehicleBrandService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search, brand, fuelType);
    }
    // Parametrik route'lar - EN SONDA tanımlanmalı
    findOne(id) {
        return this.vehicleBrandService.findOne(id);
    }
    update(id, updateVehicleBrandDto) {
        return this.vehicleBrandService.update(id, updateVehicleBrandDto);
    }
    remove(id) {
        return this.vehicleBrandService.remove(id);
    }
    constructor(vehicleBrandService){
        this.vehicleBrandService = vehicleBrandService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateVehicleBrandDto === "undefined" ? Object : _dto.CreateVehicleBrandDto
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('brands'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "getBrands", null);
_ts_decorate([
    (0, _common.Get)('fuel-types'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "getFuelTypes", null);
_ts_decorate([
    (0, _common.Get)('models'),
    _ts_param(0, (0, _common.Query)('brand')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "getModels", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('brand')),
    _ts_param(4, (0, _common.Query)('fuelType')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateVehicleBrandDto === "undefined" ? Object : _dto.UpdateVehicleBrandDto
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "remove", null);
VehicleBrandController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('vehicle-brand'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _vehiclebrandservice.VehicleBrandService === "undefined" ? Object : _vehiclebrandservice.VehicleBrandService
    ])
], VehicleBrandController);

//# sourceMappingURL=vehicle-brand.controller.js.map