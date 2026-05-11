"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrderController", {
    enumerable: true,
    get: function() {
        return WorkOrderController;
    }
});
const _common = require("@nestjs/common");
const _workorderservice = require("./work-order.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _getcurrentuserdecorator = require("../../common/decorators/get-current-user.decorator");
const _rolesguard = require("../../common/guards/roles.guard");
const _userroleenum = require("../../common/enums/user-role.enum");
const _workorderenums = require("./work-order.enums");
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
let WorkOrderController = class WorkOrderController {
    create(dto) {
        return this.workOrderService.create(dto);
    }
    getAssignmentUsers() {
        return this.workOrderService.getAssignmentUsers();
    }
    getStats() {
        return this.workOrderService.getStats();
    }
    findForPartsManagement(page, limit, search, partWorkflowStatus) {
        return this.workOrderService.findForPartsManagement(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search, partWorkflowStatus);
    }
    findAll(page, limit, search, status, accountId, createdAtFrom, createdAtTo, customerVehicleId, readyForInvoice) {
        return this.workOrderService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
            search,
            status,
            customerId: accountId,
            startDate: createdAtFrom ? new Date(createdAtFrom) : undefined,
            endDate: createdAtTo ? new Date(createdAtTo) : undefined,
            vehicleId: customerVehicleId,
            readyForInvoice: readyForInvoice === 'true'
        });
    }
    getActivities(id) {
        return this.workOrderService.getActivities(id);
    }
    sendForApproval(id, dto, userId) {
        return this.workOrderService.sendForApproval(id, dto, userId);
    }
    findOne(id) {
        return this.workOrderService.findOne(id);
    }
    update(id, dto, userId) {
        return this.workOrderService.update(id, dto, userId);
    }
    changeStatus(id, dto, userId) {
        return this.workOrderService.changeStatus(id, dto.status, userId);
    }
    changeVehicleWorkflow(id, dto, userId) {
        return this.workOrderService.changeVehicleWorkflowStatus(id, dto, userId);
    }
    remove(id) {
        return this.workOrderService.remove(id);
    }
    constructor(workOrderService){
        this.workOrderService = workOrderService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateWorkOrderDto === "undefined" ? Object : _dto.CreateWorkOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('assignment-users'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "getAssignmentUsers", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)('for-parts-management'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.PARTS_MANAGER, _userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WAREHOUSE, _userroleenum.UserRole.PROCUREMENT, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('partWorkflowStatus')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof _workorderenums.PartWorkflowStatus === "undefined" ? Object : _workorderenums.PartWorkflowStatus
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "findForPartsManagement", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('status')),
    _ts_param(4, (0, _common.Query)('accountId')),
    _ts_param(5, (0, _common.Query)('createdAtFrom')),
    _ts_param(6, (0, _common.Query)('createdAtTo')),
    _ts_param(7, (0, _common.Query)('customerVehicleId')),
    _ts_param(8, (0, _common.Query)('readyForInvoice')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        typeof _workorderenums.WorkOrderStatus === "undefined" ? Object : _workorderenums.WorkOrderStatus,
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id/activities'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "getActivities", null);
_ts_decorate([
    (0, _common.Post)(':id/send-for-approval'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION, _userroleenum.UserRole.TECHNICIAN),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.SendForApprovalDto === "undefined" ? Object : _dto.SendForApprovalDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "sendForApproval", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateWorkOrderDto === "undefined" ? Object : _dto.UpdateWorkOrderDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "update", null);
_ts_decorate([
    (0, _common.Patch)(':id/status'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.ChangeStatusWorkOrderDto === "undefined" ? Object : _dto.ChangeStatusWorkOrderDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "changeStatus", null);
_ts_decorate([
    (0, _common.Patch)(':id/vehicle-workflow'),
    (0, _common.UseGuards)(_rolesguard.RolesGuard),
    (0, _rolesguard.Roles)(_userroleenum.UserRole.ADMIN, _userroleenum.UserRole.SUPER_ADMIN, _userroleenum.UserRole.WORKSHOP_MANAGER, _userroleenum.UserRole.SERVICE_MANAGER, _userroleenum.UserRole.RECEPTION, _userroleenum.UserRole.TECHNICIAN),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.ChangeVehicleWorkflowDto === "undefined" ? Object : _dto.ChangeVehicleWorkflowDto,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "changeVehicleWorkflow", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrderController.prototype, "remove", null);
WorkOrderController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('work-orders'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _workorderservice.WorkOrderService === "undefined" ? Object : _workorderservice.WorkOrderService
    ])
], WorkOrderController);

//# sourceMappingURL=work-order.controller.js.map