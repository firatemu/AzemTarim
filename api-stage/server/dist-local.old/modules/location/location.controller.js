"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LocationController", {
    enumerable: true,
    get: function() {
        return LocationController;
    }
});
const _common = require("@nestjs/common");
const _locationservice = require("./location.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createlocationdto = require("./dto/create-location.dto");
const _updatelocationdto = require("./dto/update-location.dto");
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
let LocationController = class LocationController {
    findAll(warehouseId, active, layer, corridor) {
        try {
            console.log('🔍 [Location Controller] findAll çağrıldı', {
                warehouseId,
                active,
                layer,
                corridor
            });
            const activeValue = active === undefined ? undefined : active === 'true';
            const layerValue = layer ? parseInt(layer.toString(), 10) : undefined;
            return this.locationService.findAll(warehouseId, activeValue, layerValue, corridor);
        } catch (error) {
            console.error('❌ [Location Controller] findAll hatası:', error);
            throw error;
        }
    }
    findOne(id) {
        return this.locationService.findOne(id);
    }
    findByCode(code) {
        return this.locationService.findByCode(code);
    }
    findByBarcode(barcode) {
        return this.locationService.findByBarcode(barcode);
    }
    create(createDto) {
        return this.locationService.create(createDto);
    }
    update(id, updateDto) {
        return this.locationService.update(id, updateDto);
    }
    createBulkGrid(body) {
        return this.locationService.createBulkGrid(body.locations);
    }
    createBulkSections(body) {
        return this.locationService.createBulkSections(body.warehouseId, body.layer, body.corridor, body.side, body.sectionCount);
    }
    createBulkLevels(body) {
        return this.locationService.createBulkLevels(body.warehouseId, body.layer, body.corridor, body.side, body.section, body.levelCount);
    }
    deleteAll() {
        return this.locationService.deleteAll();
    }
    remove(id) {
        return this.locationService.remove(id);
    }
    constructor(locationService){
        this.locationService = locationService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('warehouseId')),
    _ts_param(1, (0, _common.Query)('active')),
    _ts_param(2, (0, _common.Query)('layer')),
    _ts_param(3, (0, _common.Query)('corridor')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Number,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Get)('code/:code'),
    _ts_param(0, (0, _common.Param)('code')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "findByCode", null);
_ts_decorate([
    (0, _common.Get)('barcode/:barcode'),
    _ts_param(0, (0, _common.Param)('barcode')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "findByBarcode", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createlocationdto.CreateLocationDto === "undefined" ? Object : _createlocationdto.CreateLocationDto
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatelocationdto.UpdateLocationDto === "undefined" ? Object : _updatelocationdto.UpdateLocationDto
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)('bulk/grid'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "createBulkGrid", null);
_ts_decorate([
    (0, _common.Post)('bulk/sections'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "createBulkSections", null);
_ts_decorate([
    (0, _common.Post)('bulk/levels'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "createBulkLevels", null);
_ts_decorate([
    (0, _common.Delete)('all/delete-all'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "deleteAll", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], LocationController.prototype, "remove", null);
LocationController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('location'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _locationservice.LocationService === "undefined" ? Object : _locationservice.LocationService
    ])
], LocationController);

//# sourceMappingURL=location.controller.js.map