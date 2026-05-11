"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PartRequestController", {
    enumerable: true,
    get: function() {
        return PartRequestController;
    }
});
const _common = require("@nestjs/common");
const _partrequestservice = require("./part-request.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _rolesguard = require("../../common/guards/roles.guard");
const _getcurrentuserdecorator = require("../../common/decorators/get-current-user.decorator");
const _createpartrequestdto = require("./dto/create-part-request.dto");
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
let PartRequestController = class PartRequestController {
    create(dto, userId) {
        return this.partRequestService.create(dto, userId);
    }
    findAll(workOrderId, status, page, limit, workOrderNo) {
        return this.partRequestService.findAll(workOrderId, status, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, workOrderNo);
    }
    findOne(id) {
        return this.partRequestService.findOne(id);
    }
    supply(id, dto, userId) {
        return this.partRequestService.supply(id, dto, userId);
    }
    markAsUsed(id) {
        return this.partRequestService.markAsUsed(id);
    }
    cancel(id) {
        return this.partRequestService.cancel(id);
    }
    constructor(partRequestService){
        this.partRequestService = partRequestService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreatePartRequestDto === "undefined" ? Object : _dto.CreatePartRequestDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('workOrderId')),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_param(4, (0, _common.Query)('workOrderNo')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createpartrequestdto.PartRequestStatus === "undefined" ? Object : _createpartrequestdto.PartRequestStatus,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(':id/supply'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.PARTS_MANAGER, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WAREHOUSE, _userroleenum.UserRole.PROCUREMENT, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.SupplyPartRequestDto === "undefined" ? Object : _dto.SupplyPartRequestDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "supply", null);
_ts_decorate([
    (0, _common.Post)(':id/mark-as-used'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.TECHNICIAN, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "markAsUsed", null);
_ts_decorate([
    (0, _common.Post)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], PartRequestController.prototype, "cancel", null);
PartRequestController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('part-requests'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _partrequestservice.PartRequestService === "undefined" ? Object : _partrequestservice.PartRequestService
    ])
], PartRequestController);

//# sourceMappingURL=part-request.controller.js.map