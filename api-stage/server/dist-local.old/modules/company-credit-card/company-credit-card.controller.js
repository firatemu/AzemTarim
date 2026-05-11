"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyCreditCardController", {
    enumerable: true,
    get: function() {
        return CompanyCreditCardController;
    }
});
const _common = require("@nestjs/common");
const _companycreditcardservice = require("./company-credit-card.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createcompanycreditcarddto = require("./dto/create-company-credit-card.dto");
const _updatecompanycreditcarddto = require("./dto/update-company-credit-card.dto");
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
let CompanyCreditCardController = class CompanyCreditCardController {
    create(createDto) {
        return this.companyCreditCardService.create(createDto);
    }
    findAll(cashboxId) {
        return this.companyCreditCardService.findAll(cashboxId);
    }
    findOne(id) {
        return this.companyCreditCardService.findOne(id);
    }
    update(id, updateDto) {
        return this.companyCreditCardService.update(id, updateDto);
    }
    remove(id) {
        return this.companyCreditCardService.remove(id);
    }
    constructor(companyCreditCardService){
        this.companyCreditCardService = companyCreditCardService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcompanycreditcarddto.CreateCompanyCreditCardDto === "undefined" ? Object : _createcompanycreditcarddto.CreateCompanyCreditCardDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyCreditCardController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('cashboxId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyCreditCardController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyCreditCardController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecompanycreditcarddto.UpdateCompanyCreditCardDto === "undefined" ? Object : _updatecompanycreditcarddto.UpdateCompanyCreditCardDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyCreditCardController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompanyCreditCardController.prototype, "remove", null);
CompanyCreditCardController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('company-credit-cards'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _companycreditcardservice.CompanyCreditCardService === "undefined" ? Object : _companycreditcardservice.CompanyCreditCardService
    ])
], CompanyCreditCardController);

//# sourceMappingURL=company-credit-card.controller.js.map