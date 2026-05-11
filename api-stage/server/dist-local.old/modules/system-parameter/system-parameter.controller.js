"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SystemParameterController", {
    enumerable: true,
    get: function() {
        return SystemParameterController;
    }
});
const _common = require("@nestjs/common");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _systemparameterservice = require("./system-parameter.service");
const _createparameterdto = require("./dto/create-parameter.dto");
const _updateparameterdto = require("./dto/update-parameter.dto");
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
let SystemParameterController = class SystemParameterController {
    getAll(category) {
        if (category) {
            return this.systemParameterService.getParametersByCategory(category);
        }
        return this.systemParameterService.getAllParameters();
    }
    getOne(key) {
        return this.systemParameterService.getParameter(key);
    }
    create(createParameterDto) {
        return this.systemParameterService.create(createParameterDto);
    }
    update(key, updateParameterDto) {
        return this.systemParameterService.update(key, updateParameterDto);
    }
    remove(key) {
        return this.systemParameterService.remove(key);
    }
    constructor(systemParameterService){
        this.systemParameterService = systemParameterService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('category')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SystemParameterController.prototype, "getAll", null);
_ts_decorate([
    (0, _common.Get)(':key'),
    _ts_param(0, (0, _common.Param)('key')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SystemParameterController.prototype, "getOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createparameterdto.CreateParameterDto === "undefined" ? Object : _createparameterdto.CreateParameterDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SystemParameterController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':key'),
    _ts_param(0, (0, _common.Param)('key')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateparameterdto.UpdateParameterDto === "undefined" ? Object : _updateparameterdto.UpdateParameterDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SystemParameterController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':key'),
    _ts_param(0, (0, _common.Param)('key')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SystemParameterController.prototype, "remove", null);
SystemParameterController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('system-parameters'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService
    ])
], SystemParameterController);

//# sourceMappingURL=system-parameter.controller.js.map