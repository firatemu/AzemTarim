"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostalCodeController", {
    enumerable: true,
    get: function() {
        return PostalCodeController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _publicdecorator = require("../../common/decorators/public.decorator");
const _postalcodeservice = require("./postal-code.service");
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
let PostalCodeController = class PostalCodeController {
    /**
   * İl, ilçe ve mahalle bilgisine göre posta kodunu getirir
   * GET /postal-codes?city=İstanbul&district=Kadıköy&neighborhood=Fenerbahçe
   */ async getPostalCode(city, district, neighborhood) {
        if (!city || !district || !neighborhood) {
            throw new _common.HttpException('city, district ve neighborhood parametreleri zorunludur', _common.HttpStatus.BAD_REQUEST);
        }
        const postalCode = await this.postalCodeService.findPostalCode(city, district, neighborhood);
        return {
            city,
            district,
            neighborhood,
            postalCode,
            found: !!postalCode
        };
    }
    /**
   * İl ve ilçe bilgisine göre mahalle listesini getirir
   * GET /postal-codes/neighborhoods?city=İstanbul&district=Kadıköy
   */ async getNeighborhoods(city, district) {
        if (!city || !district) {
            throw new _common.HttpException('city ve district parametreleri zorunludur', _common.HttpStatus.BAD_REQUEST);
        }
        const neighborhoods = await this.postalCodeService.findNeighborhoodsByCityAndDistrict(city, district);
        return neighborhoods;
    }
    constructor(postalCodeService){
        this.postalCodeService = postalCodeService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('city')),
    _ts_param(1, (0, _common.Query)('district')),
    _ts_param(2, (0, _common.Query)('neighborhood')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostalCodeController.prototype, "getPostalCode", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('neighborhoods'),
    _ts_param(0, (0, _common.Query)('city')),
    _ts_param(1, (0, _common.Query)('district')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostalCodeController.prototype, "getNeighborhoods", null);
PostalCodeController = _ts_decorate([
    (0, _common.Controller)('postal-codes'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postalcodeservice.PostalCodeService === "undefined" ? Object : _postalcodeservice.PostalCodeService
    ])
], PostalCodeController);

//# sourceMappingURL=postal-code.controller.js.map