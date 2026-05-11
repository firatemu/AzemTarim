"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdvertisementsController", {
    enumerable: true,
    get: function() {
        return B2bAdvertisementsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _prismaservice = require("../../common/prisma.service");
const _constants = require("./constants");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
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
let B2bAdvertisementsController = class B2bAdvertisementsController {
    activeAdWhere(tenantId, type) {
        const now = new Date();
        return {
            tenantId,
            type,
            isActive: true,
            AND: [
                {
                    OR: [
                        {
                            startsAt: null
                        },
                        {
                            startsAt: {
                                lte: now
                            }
                        }
                    ]
                },
                {
                    OR: [
                        {
                            endsAt: null
                        },
                        {
                            endsAt: {
                                gte: now
                            }
                        }
                    ]
                }
            ]
        };
    }
    async banners(req) {
        const tenantId = req.b2bTenantId;
        return this.prisma.b2BAdvertisement.findMany({
            where: this.activeAdWhere(tenantId, _client.B2BAdType.HOMEPAGE_BANNER),
            orderBy: [
                {
                    displayOrder: 'asc'
                },
                {
                    createdAt: 'desc'
                }
            ],
            select: {
                id: true,
                imageUrl: true,
                linkUrl: true,
                displayOrder: true
            }
        });
    }
    async popup(req) {
        const tenantId = req.b2bTenantId;
        return this.prisma.b2BAdvertisement.findFirst({
            where: this.activeAdWhere(tenantId, _client.B2BAdType.LOGIN_POPUP),
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                imageUrl: true,
                linkUrl: true
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
_ts_decorate([
    (0, _common.Get)('banners'),
    (0, _swagger.ApiOperation)({
        summary: 'Ana sayfa bannerlari (domain)'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdvertisementsController.prototype, "banners", null);
_ts_decorate([
    (0, _common.Get)('popup'),
    (0, _swagger.ApiOperation)({
        summary: 'Giris popup reklami (domain)'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdvertisementsController.prototype, "popup", null);
B2bAdvertisementsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/advertisements'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard),
    (0, _swagger.ApiHeader)({
        name: _constants.B2B_DOMAIN_HEADER,
        required: true
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdvertisementsController);

//# sourceMappingURL=b2b-advertisements.controller.js.map