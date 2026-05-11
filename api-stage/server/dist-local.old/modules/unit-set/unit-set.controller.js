"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UnitSetController", {
    enumerable: true,
    get: function() {
        return UnitSetController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _unitsetservice = require("./unit-set.service");
const _unitsetdto = require("./dto/unit-set.dto");
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
let UnitSetController = class UnitSetController {
    findAll() {
        return this.unitSetService.findAll();
    }
    findOne(id) {
        return this.unitSetService.findOne(id);
    }
    create(dto) {
        return this.unitSetService.create(dto);
    }
    update(id, dto) {
        return this.unitSetService.update(id, dto);
    }
    remove(id) {
        return this.unitSetService.remove(id);
    }
    async ensureDefaults() {
        await this.unitSetService.ensureSystemDefaults();
        return {
            success: true,
            message: 'Sistem varsayılan birim setleri oluşturuldu'
        };
    }
    async getDefaultB2BUnit() {
        return this.unitSetService.getDefaultB2BUnit();
    }
    constructor(unitSetService){
        this.unitSetService = unitSetService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Tüm birim setlerini listele (sistem + tenant)'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], UnitSetController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Tek birim setini getir'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Birim seti UUID'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UnitSetController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    (0, _swagger.ApiOperation)({
        summary: 'Yeni birim seti oluştur (yalnızca tenant)'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _unitsetdto.CreateUnitSetDto === "undefined" ? Object : _unitsetdto.CreateUnitSetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UnitSetController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Birim setini güncelle (yalnızca tenant)'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Birim seti UUID'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _unitsetdto.UpdateUnitSetDto === "undefined" ? Object : _unitsetdto.UpdateUnitSetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UnitSetController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Birim setini sil (yalnızca tenant, ürün bağlantısı yoksa)'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Birim seti UUID'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], UnitSetController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)('ensure-defaults'),
    (0, _swagger.ApiOperation)({
        summary: 'Sistem varsayılan birim setlerini oluştur',
        description: 'Adet, Ağırlık, Hacim, Uzunluk, Alan ve Ambalaj birim setlerini sistem için oluşturur'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], UnitSetController.prototype, "ensureDefaults", null);
_ts_decorate([
    (0, _common.Get)('default/b2b'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B için varsayılan birimi getir',
        description: 'B2B ürünleri için varsayılan birim (Adet) bilgisini döndürür'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], UnitSetController.prototype, "getDefaultB2BUnit", null);
UnitSetController = _ts_decorate([
    (0, _swagger.ApiTags)('Unit Sets'),
    (0, _swagger.ApiBearerAuth)(),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('unit-sets'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _unitsetservice.UnitSetService === "undefined" ? Object : _unitsetservice.UnitSetService
    ])
], UnitSetController);

//# sourceMappingURL=unit-set.controller.js.map