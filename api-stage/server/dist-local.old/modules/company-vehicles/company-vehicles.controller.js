"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyVehiclesController", {
    enumerable: true,
    get: function() {
        return CompanyVehiclesController;
    }
});
const _common = require("@nestjs/common");
const _companyvehiclesservice = require("./company-vehicles.service");
const _createcompanyvehicledto = require("./dto/create-company-vehicle.dto");
const _updatecompanyvehicledto = require("./dto/update-company-vehicle.dto");
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
let CompanyVehiclesController = class CompanyVehiclesController {
    create(createCompanyVehicleDto) {
        return this.companyVehiclesService.create(createCompanyVehicleDto);
    }
    findAll() {
        return this.companyVehiclesService.findAll();
    }
    findOne(id) {
        return this.companyVehiclesService.findOne(id);
    }
    update(id, updateCompanyVehicleDto) {
        return this.companyVehiclesService.update(id, updateCompanyVehicleDto);
    }
    remove(id) {
        return this.companyVehiclesService.remove(id);
    }
    constructor(companyVehiclesService){
        this.companyVehiclesService = companyVehiclesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Yeni şirket aracı oluşturur'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcompanyvehicledto.CreateCompanyVehicleDto === "undefined" ? Object : _createcompanyvehicledto.CreateCompanyVehicleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyVehiclesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Tüm şirket araçlarını listeler'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CompanyVehiclesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Belirtilen şirket aracının detaylarını ve expensesını getirir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyVehiclesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Şirket aracı bilgilerini günceller'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecompanyvehicledto.UpdateCompanyVehicleDto === "undefined" ? Object : _updatecompanyvehicledto.UpdateCompanyVehicleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyVehiclesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Şirket aracını siler'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyVehiclesController.prototype, "remove", null);
CompanyVehiclesController = _ts_decorate([
    (0, _swagger.ApiTags)('Company Vehicles'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('company-vehicles'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _companyvehiclesservice.CompanyVehiclesService === "undefined" ? Object : _companyvehiclesservice.CompanyVehiclesService
    ])
], CompanyVehiclesController);

//# sourceMappingURL=company-vehicles.controller.js.map