"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CodeTemplateController", {
    enumerable: true,
    get: function() {
        return CodeTemplateController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _codetemplateservice = require("./code-template.service");
const _createcodetemplatedto = require("./dto/create-code-template.dto");
const _updatecodetemplatedto = require("./dto/update-code-template.dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _codetemplateenums = require("./code-template.enums");
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
let CodeTemplateController = class CodeTemplateController {
    create(createDto) {
        return this.codeTemplateService.create(createDto);
    }
    async getNextCode(module) {
        try {
            console.log('🔍 [CodeTemplate Controller] getNextCode çağrıldı', {
                module
            });
            const code = await this.codeTemplateService.getNextCode(module);
            console.log('✅ [CodeTemplate Controller] getNextCode başarılı', {
                module,
                code
            });
            return {
                nextCode: code
            };
        } catch (error) {
            console.error('❌ [CodeTemplate Controller] getNextCode hatası:', error);
            throw error;
        }
    }
    async getPreviewCode(module) {
        try {
            const code = await this.codeTemplateService.getPreviewCode(module);
            return {
                nextCode: code
            };
        } catch (error) {
            console.error('❌ [CodeTemplate Controller] getPreviewCode hatası:', error);
            throw error;
        }
    }
    findByModule(module) {
        return this.codeTemplateService.findByModule(module);
    }
    findAll() {
        return this.codeTemplateService.findAll();
    }
    findOne(id) {
        return this.codeTemplateService.findOne(id);
    }
    update(id, updateDto) {
        return this.codeTemplateService.update(id, updateDto);
    }
    remove(id) {
        return this.codeTemplateService.remove(id);
    }
    resetCounter(module, newValue) {
        return this.codeTemplateService.resetCounter(module, newValue);
    }
    saveManualCode(module, code) {
        return this.codeTemplateService.saveLastCode(module, code);
    }
    constructor(codeTemplateService){
        this.codeTemplateService = codeTemplateService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcodetemplatedto.CreateCodeTemplateDto === "undefined" ? Object : _createcodetemplatedto.CreateCodeTemplateDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('next-code/:module'),
    (0, _swagger.ApiParam)({
        name: 'module',
        enum: _codetemplateenums.ModuleType
    }),
    _ts_param(0, (0, _common.Param)('module')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CodeTemplateController.prototype, "getNextCode", null);
_ts_decorate([
    (0, _common.Get)('preview-code/:module'),
    (0, _swagger.ApiParam)({
        name: 'module',
        enum: _codetemplateenums.ModuleType
    }),
    _ts_param(0, (0, _common.Param)('module')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CodeTemplateController.prototype, "getPreviewCode", null);
_ts_decorate([
    (0, _common.Get)('by-module/:module'),
    (0, _swagger.ApiParam)({
        name: 'module',
        enum: _codetemplateenums.ModuleType
    }),
    _ts_param(0, (0, _common.Param)('module')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "findByModule", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecodetemplatedto.UpdateCodeTemplateDto === "undefined" ? Object : _updatecodetemplatedto.UpdateCodeTemplateDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)('reset-counter/:module'),
    (0, _swagger.ApiParam)({
        name: 'module',
        enum: _codetemplateenums.ModuleType
    }),
    _ts_param(0, (0, _common.Param)('module')),
    _ts_param(1, (0, _common.Body)('newValue')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "resetCounter", null);
_ts_decorate([
    (0, _common.Post)('save-manual-code/:module'),
    (0, _swagger.ApiParam)({
        name: 'module',
        enum: _codetemplateenums.ModuleType
    }),
    _ts_param(0, (0, _common.Param)('module')),
    _ts_param(1, (0, _common.Body)('code')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CodeTemplateController.prototype, "saveManualCode", null);
CodeTemplateController = _ts_decorate([
    (0, _swagger.ApiTags)('code-template'),
    (0, _common.Controller)('code-templates'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], CodeTemplateController);

//# sourceMappingURL=code-template.controller.js.map