"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TechniciansController", {
    enumerable: true,
    get: function() {
        return TechniciansController;
    }
});
const _common = require("@nestjs/common");
const _techniciansservice = require("./technicians.service");
const _createtechniciandto = require("./dto/create-technician.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _rolesguard = require("../../common/guards/roles.guard");
const _userroleenum = require("../../common/enums/user-role.enum");
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
let TechniciansController = class TechniciansController {
    findAll(search, limit, page) {
        return this.techniciansService.findAll(search, limit ? parseInt(limit) : 100, page ? parseInt(page) : 1);
    }
    create(dto) {
        return this.techniciansService.create(dto);
    }
    constructor(techniciansService){
        this.techniciansService = techniciansService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Query)('search')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createtechniciandto.CreateTechnicianDto === "undefined" ? Object : _createtechniciandto.CreateTechnicianDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "create", null);
TechniciansController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _common.Controller)('technicians'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _techniciansservice.TechniciansService === "undefined" ? Object : _techniciansservice.TechniciansService
    ])
], TechniciansController);

//# sourceMappingURL=technicians.controller.js.map