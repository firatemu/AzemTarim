"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminAdvertisementService", {
    enumerable: true,
    get: function() {
        return B2bAdminAdvertisementService;
    }
});
const _common = require("@nestjs/common");
const _path = require("path");
const _prismaservice = require("../../../common/prisma.service");
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
let B2bAdminAdvertisementService = class B2bAdminAdvertisementService {
    async list(tenantId) {
        return this.prisma.b2BAdvertisement.findMany({
            where: {
                tenantId
            },
            orderBy: [
                {
                    type: 'asc'
                },
                {
                    displayOrder: 'asc'
                }
            ]
        });
    }
    async adsFolder(tenantId) {
        const cfg = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!cfg) throw new _common.NotFoundException('B2B tenant configuration not found');
        return `b2b/${cfg.schemaName}/ads`;
    }
    async create(tenantId, file, type, dto) {
        if (!file?.buffer) throw new _common.BadRequestException('Image file required');
        const folder = await this.adsFolder(tenantId);
        const ext = (0, _path.extname)(file.originalname) || '.jpg';
        const renamed = {
            ...file,
            originalname: `ad-${type.toLowerCase()}-${Date.now()}${ext}`
        };
        const key = await this.storage.uploadFile({
            tenantId,
            file: renamed,
            folder
        });
        return this.prisma.b2BAdvertisement.create({
            data: {
                tenantId,
                type,
                imageUrl: key,
                linkUrl: dto.linkUrl ?? null,
                displayOrder: dto.displayOrder ?? 0,
                startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
                endsAt: dto.endsAt ? new Date(dto.endsAt) : null
            }
        });
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BAdvertisement.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Advertisement not found');
        return this.prisma.b2BAdvertisement.update({
            where: {
                id
            },
            data: {
                ...dto.type != null && {
                    type: dto.type
                },
                ...dto.linkUrl !== undefined && {
                    linkUrl: dto.linkUrl
                },
                ...dto.displayOrder != null && {
                    displayOrder: dto.displayOrder
                },
                ...dto.isActive != null && {
                    isActive: dto.isActive
                },
                ...dto.startsAt !== undefined && {
                    startsAt: dto.startsAt ? new Date(dto.startsAt) : null
                },
                ...dto.endsAt !== undefined && {
                    endsAt: dto.endsAt ? new Date(dto.endsAt) : null
                }
            }
        });
    }
    async uploadImage(tenantId, id, file) {
        if (!file?.buffer) throw new _common.BadRequestException('File required');
        const ad = await this.prisma.b2BAdvertisement.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!ad) throw new _common.NotFoundException('Advertisement not found');
        const folder = await this.adsFolder(tenantId);
        const ext = (0, _path.extname)(file.originalname) || '.jpg';
        const renamed = {
            ...file,
            originalname: `ad-${id}${ext}`
        };
        if (ad.imageUrl) {
            try {
                await this.storage.deleteFile({
                    tenantId,
                    key: ad.imageUrl
                });
            } catch  {
            /* ignore */ }
        }
        const key = await this.storage.uploadFile({
            tenantId,
            file: renamed,
            folder
        });
        return this.prisma.b2BAdvertisement.update({
            where: {
                id
            },
            data: {
                imageUrl: key
            }
        });
    }
    async remove(tenantId, id) {
        const ad = await this.prisma.b2BAdvertisement.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!ad) throw new _common.NotFoundException('Advertisement not found');
        if (ad.imageUrl) {
            try {
                await this.storage.deleteFile({
                    tenantId,
                    key: ad.imageUrl
                });
            } catch  {
            /* ignore */ }
        }
        await this.prisma.b2BAdvertisement.delete({
            where: {
                id
            }
        });
        return {
            ok: true
        };
    }
    constructor(prisma, storage){
        this.prisma = prisma;
        this.storage = storage;
    }
};
B2bAdminAdvertisementService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _common.Inject)('STORAGE_SERVICE')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof IStorageService === "undefined" ? Object : IStorageService
    ])
], B2bAdminAdvertisementService);

//# sourceMappingURL=b2b-admin-advertisement.service.js.map