"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminAdvertisementsController", {
    enumerable: true,
    get: function() {
        return B2bAdminAdvertisementsController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _multer = require("multer");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2badvertisementdto = require("./dto/b2b-advertisement.dto");
const _b2badminadvertisementservice = require("./services/b2b-admin-advertisement.service");
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
let B2bAdminAdvertisementsController = class B2bAdminAdvertisementsController {
    async tenant() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async tenantWrite() {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async list() {
        return this.service.list(await this.tenant());
    }
    async create(file, typeRaw, linkUrl, displayOrder, startsAt, endsAt) {
        if (!Object.values(_client.B2BAdType).includes(typeRaw)) {
            throw new _common.BadRequestException('Invalid advertisement type');
        }
        const type = typeRaw;
        return this.service.create(await this.tenantWrite(), file, type, {
            linkUrl,
            displayOrder: displayOrder != null ? parseInt(displayOrder, 10) : undefined,
            startsAt,
            endsAt
        });
    }
    async update(id, dto) {
        return this.service.update(await this.tenantWrite(), id, dto);
    }
    async uploadImage(id, file) {
        return this.service.uploadImage(await this.tenantWrite(), id, file);
    }
    async remove(id) {
        return this.service.remove(await this.tenantWrite(), id);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Reklam listesi'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminAdvertisementsController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            required: [
                'file',
                'type'
            ],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                },
                type: {
                    enum: Object.values(_client.B2BAdType)
                },
                linkUrl: {
                    type: 'string'
                },
                displayOrder: {
                    type: 'number'
                },
                startsAt: {
                    type: 'string'
                },
                endsAt: {
                    type: 'string'
                }
            }
        }
    }),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file', {
        storage: (0, _multer.memoryStorage)(),
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    (0, _swagger.ApiOperation)({
        summary: 'Reklam oluştur (görsel zorunlu)'
    }),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_param(1, (0, _common.Body)('type')),
    _ts_param(2, (0, _common.Body)('linkUrl')),
    _ts_param(3, (0, _common.Body)('displayOrder')),
    _ts_param(4, (0, _common.Body)('startsAt')),
    _ts_param(5, (0, _common.Body)('endsAt')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File,
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminAdvertisementsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Reklam güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2badvertisementdto.UpdateB2bAdvertisementDto === "undefined" ? Object : _b2badvertisementdto.UpdateB2bAdvertisementDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminAdvertisementsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)(':id/image'),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file', {
        storage: (0, _multer.memoryStorage)(),
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    })),
    (0, _swagger.ApiOperation)({
        summary: 'Reklam görseli değiştir'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminAdvertisementsController.prototype, "uploadImage", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Sil (MinIO nesnesi de silinir)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminAdvertisementsController.prototype, "remove", null);
B2bAdminAdvertisementsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/advertisements'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badminadvertisementservice.B2bAdminAdvertisementService === "undefined" ? Object : _b2badminadvertisementservice.B2bAdminAdvertisementService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminAdvertisementsController);

//# sourceMappingURL=b2b-admin-advertisements.controller.js.map