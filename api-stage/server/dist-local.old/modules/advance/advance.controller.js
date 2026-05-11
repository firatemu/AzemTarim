"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdvanceController", {
    enumerable: true,
    get: function() {
        return AdvanceController;
    }
});
const _common = require("@nestjs/common");
const _advanceservice = require("./advance.service");
const _createadvancedto = require("./dto/create-advance.dto");
const _mahsuplastiradvancedto = require("./dto/mahsuplastir-advance.dto");
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
let AdvanceController = class AdvanceController {
    create(createDto, req) {
        return this.advanceService.createAdvance(createDto, req.user.userId);
    }
    mahsuplastir(mahsupDto) {
        return this.advanceService.mahsuplastir(mahsupDto);
    }
    getAdvanceByEmployee(employeeId) {
        return this.advanceService.getAdvanceByEmployee(employeeId);
    }
    getAdvanceDetay(id) {
        return this.advanceService.getAdvanceDetay(id);
    }
    constructor(advanceService){
        this.advanceService = advanceService;
    }
};
_ts_decorate([
    (0, _common.Post)('create'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createadvancedto.CreateAdvanceDto === "undefined" ? Object : _createadvancedto.CreateAdvanceDto,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], AdvanceController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)('mahsuplastir'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _mahsuplastiradvancedto.MahsuplastirAdvanceDto === "undefined" ? Object : _mahsuplastiradvancedto.MahsuplastirAdvanceDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AdvanceController.prototype, "mahsuplastir", null);
_ts_decorate([
    (0, _common.Get)('employee/:employeeId'),
    _ts_param(0, (0, _common.Param)('employeeId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AdvanceController.prototype, "getAdvanceByEmployee", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AdvanceController.prototype, "getAdvanceDetay", null);
AdvanceController = _ts_decorate([
    (0, _common.Controller)('advances'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _advanceservice.AdvanceService === "undefined" ? Object : _advanceservice.AdvanceService
    ])
], AdvanceController);

//# sourceMappingURL=advance.controller.js.map