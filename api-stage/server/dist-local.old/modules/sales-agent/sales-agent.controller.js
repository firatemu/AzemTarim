"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalesAgentController", {
    enumerable: true,
    get: function() {
        return SalesAgentController;
    }
});
const _common = require("@nestjs/common");
const _salesagentservice = require("./sales-agent.service");
const _createsalesagentdto = require("./dto/create-sales-agent.dto");
const _updatesalesagentdto = require("./dto/update-sales-agent.dto");
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
let SalesAgentController = class SalesAgentController {
    create(createDto, req) {
        return this.salesAgentService.create(createDto, req.user?.id);
    }
    findAll() {
        return this.salesAgentService.findAll();
    }
    findOne(id) {
        return this.salesAgentService.findOne(id);
    }
    update(id, updateDto) {
        return this.salesAgentService.update(id, updateDto);
    }
    remove(id) {
        return this.salesAgentService.remove(id);
    }
    constructor(salesAgentService){
        this.salesAgentService = salesAgentService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsalesagentdto.CreateSalesAgentDto === "undefined" ? Object : _createsalesagentdto.CreateSalesAgentDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], SalesAgentController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], SalesAgentController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalesAgentController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesalesagentdto.UpdateSalesAgentDto === "undefined" ? Object : _updatesalesagentdto.UpdateSalesAgentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SalesAgentController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SalesAgentController.prototype, "remove", null);
SalesAgentController = _ts_decorate([
    (0, _common.Controller)('sales-agent'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _salesagentservice.SalesAgentService === "undefined" ? Object : _salesagentservice.SalesAgentService
    ])
], SalesAgentController);

//# sourceMappingURL=sales-agent.controller.js.map