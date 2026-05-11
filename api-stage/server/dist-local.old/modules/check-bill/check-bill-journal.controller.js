"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillJournalController", {
    enumerable: true,
    get: function() {
        return CheckBillJournalController;
    }
});
const _common = require("@nestjs/common");
const _checkbilljournalservice = require("./check-bill-journal.service");
const _createcheckbilljournaldto = require("./dto/create-check-bill-journal.dto");
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
let CheckBillJournalController = class CheckBillJournalController {
    findAll() {
        return this.checkBillJournalService.findAll();
    }
    findItems(id) {
        return this.checkBillJournalService.findItems(id);
    }
    glPreview(id) {
        return this.checkBillJournalService.glPreview(id);
    }
    findOne(id) {
        return this.checkBillJournalService.findOne(id);
    }
    create(dto, req) {
        return this.checkBillJournalService.create(dto, req.user);
    }
    post(id, req) {
        return this.checkBillJournalService.postJournal(id, req.user?.id);
    }
    approve(id, req) {
        return this.checkBillJournalService.approveJournal(id, req.user?.id);
    }
    cancel(id) {
        return this.checkBillJournalService.cancelJournal(id);
    }
    update(id, dto) {
        return this.checkBillJournalService.update(id, dto);
    }
    remove(id) {
        return this.checkBillJournalService.remove(id);
    }
    constructor(checkBillJournalService){
        this.checkBillJournalService = checkBillJournalService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id/items'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "findItems", null);
_ts_decorate([
    (0, _common.Get)(':id/gl-preview'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "glPreview", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcheckbilljournaldto.CreateCheckBillJournalDto === "undefined" ? Object : _createcheckbilljournaldto.CreateCheckBillJournalDto,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)(':id/post'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "post", null);
_ts_decorate([
    (0, _common.Post)(':id/approve'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "approve", null);
_ts_decorate([
    (0, _common.Post)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "cancel", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createcheckbilljournaldto.UpdateCheckBillJournalDto === "undefined" ? Object : _createcheckbilljournaldto.UpdateCheckBillJournalDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CheckBillJournalController.prototype, "remove", null);
CheckBillJournalController = _ts_decorate([
    (0, _common.Controller)([
        'check-bill-journals',
        'payroll'
    ]),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _checkbilljournalservice.CheckBillJournalService === "undefined" ? Object : _checkbilljournalservice.CheckBillJournalService
    ])
], CheckBillJournalController);

//# sourceMappingURL=check-bill-journal.controller.js.map