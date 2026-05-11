"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsController", {
    enumerable: true,
    get: function() {
        return TenantsController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _multer = require("multer");
const _fileuploadutils = require("../../common/utils/file-upload.utils");
const _tenantsservice = require("./tenants.service");
const _createtenantdto = require("./dto/create-tenant.dto");
const _updatetenantdto = require("./dto/update-tenant.dto");
const _updatetenantsettingsdto = require("./dto/update-tenant-settings.dto");
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
let TenantsController = class TenantsController {
    create(createTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }
    findAll() {
        return this.tenantsService.findAll();
    }
    async getCurrent(req) {
        const userId = req.user?.id;
        const tenantId = await this.tenantsService.tenantResolver.resolveForQuery();
        return this.tenantsService.getCurrent(tenantId);
    }
    async getSettings(req) {
        const userId = req.user?.id;
        const tenantId = await this.tenantsService.tenantResolver.resolveForQuery();
        return this.tenantsService.getSettings(tenantId);
    }
    async updateSettings(req, updateSettingsDto) {
        const tenantId = await this.tenantsService.tenantResolver.resolveForCreate();
        return this.tenantsService.updateSettings(tenantId, updateSettingsDto);
    }
    async uploadLogo(req, file) {
        const tenantId = req.user?.tenantId;
        // URL'yi oluştur - main.ts'de /api/uploads olarak sunuluyor
        const logoUrl = `/api/uploads/${file.filename}`;
        return this.tenantsService.updateLogo(tenantId, logoUrl);
    }
    findOne(id) {
        return this.tenantsService.findOne(id);
    }
    update(id, updateTenantDto) {
        return this.tenantsService.update(id, updateTenantDto);
    }
    remove(id) {
        return this.tenantsService.remove(id);
    }
    approveTrial(id) {
        return this.tenantsService.approveTrial(id);
    }
    constructor(tenantsService){
        this.tenantsService = tenantsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createtenantdto.CreateTenantDto === "undefined" ? Object : _createtenantdto.CreateTenantDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('current'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getCurrent", null);
_ts_decorate([
    (0, _common.Get)('settings'),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getSettings", null);
_ts_decorate([
    (0, _common.Put)('settings'),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _updatetenantsettingsdto.UpdateTenantSettingsDto === "undefined" ? Object : _updatetenantsettingsdto.UpdateTenantSettingsDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "updateSettings", null);
_ts_decorate([
    (0, _common.Post)('settings/logo'),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file', {
        storage: (0, _multer.diskStorage)({
            destination: './uploads',
            filename: _fileuploadutils.editFileName
        }),
        fileFilter: _fileuploadutils.imageFileFilter
    })),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "uploadLogo", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatetenantdto.UpdateTenantDto === "undefined" ? Object : _updatetenantdto.UpdateTenantDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)(':id/approve-trial'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "approveTrial", null);
TenantsController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('tenants'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantsservice.TenantsService === "undefined" ? Object : _tenantsservice.TenantsService
    ])
], TenantsController);

//# sourceMappingURL=tenants.controller.js.map