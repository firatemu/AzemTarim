"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BrandController", {
    enumerable: true,
    get: function() {
        return BrandController;
    }
});
const _common = require("@nestjs/common");
const _brandservice = require("./brand.service");
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
let BrandController = class BrandController {
    findAll() {
        return this.brandService.findAll();
    }
    create(brandName) {
        return this.brandService.create(brandName);
    }
    findOne(brandName) {
        return this.brandService.findOne(brandName);
    }
    update(brandName, newBrandName) {
        return this.brandService.update(brandName, newBrandName);
    }
    remove(brandName) {
        return this.brandService.remove(brandName);
    }
    constructor(brandService){
        this.brandService = brandService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], BrandController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)('brandName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BrandController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':brandName'),
    _ts_param(0, (0, _common.Param)('brandName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BrandController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':brandName'),
    _ts_param(0, (0, _common.Param)('brandName')),
    _ts_param(1, (0, _common.Body)('newBrandName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BrandController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':brandName'),
    _ts_param(0, (0, _common.Param)('brandName')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], BrandController.prototype, "remove", null);
BrandController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('brand'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _brandservice.BrandService === "undefined" ? Object : _brandservice.BrandService
    ])
], BrandController);

//# sourceMappingURL=brand.controller.js.map