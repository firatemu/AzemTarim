"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JournalEntryController", {
    enumerable: true,
    get: function() {
        return JournalEntryController;
    }
});
const _common = require("@nestjs/common");
const _journalentryservice = require("./journal-entry.service");
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
let JournalEntryController = class JournalEntryController {
    findByReference(referenceType, referenceId) {
        return this.journalEntryService.findByReference(referenceType, referenceId);
    }
    findAll(page, limit, referenceType, referenceId) {
        return this.journalEntryService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, referenceType, referenceId);
    }
    findOne(id) {
        return this.journalEntryService.findOne(id);
    }
    constructor(journalEntryService){
        this.journalEntryService = journalEntryService;
    }
};
_ts_decorate([
    (0, _common.Get)('by-reference/:referenceType/:referenceId'),
    _ts_param(0, (0, _common.Param)('referenceType')),
    _ts_param(1, (0, _common.Param)('referenceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], JournalEntryController.prototype, "findByReference", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('referenceType')),
    _ts_param(3, (0, _common.Query)('referenceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], JournalEntryController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], JournalEntryController.prototype, "findOne", null);
JournalEntryController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('journal-entries'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _journalentryservice.JournalEntryService === "undefined" ? Object : _journalentryservice.JournalEntryService
    ])
], JournalEntryController);

//# sourceMappingURL=journal-entry.controller.js.map