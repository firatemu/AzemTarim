"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminDeliveryService", {
    enumerable: true,
    get: function() {
        return B2bAdminDeliveryService;
    }
});
const _common = require("@nestjs/common");
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
let B2bAdminDeliveryService = class B2bAdminDeliveryService {
    async list(tenantId) {
        return this.prisma.b2BDeliveryMethod.findMany({
            where: {
                tenantId
            },
            orderBy: [
                {
                    displayOrder: 'asc'
                },
                {
                    name: 'asc'
                }
            ]
        });
    }
    async create(tenantId, dto) {
        return this.prisma.b2BDeliveryMethod.create({
            data: {
                tenantId,
                name: dto.name,
                displayOrder: dto.displayOrder ?? 0
            }
        });
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BDeliveryMethod.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Delivery method not found');
        return this.prisma.b2BDeliveryMethod.update({
            where: {
                id
            },
            data: {
                ...dto.name != null && {
                    name: dto.name
                },
                ...dto.displayOrder != null && {
                    displayOrder: dto.displayOrder
                },
                ...dto.isActive != null && {
                    isActive: dto.isActive
                }
            }
        });
    }
    async softDelete(tenantId, id) {
        const existing = await this.prisma.b2BDeliveryMethod.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Delivery method not found');
        return this.prisma.b2BDeliveryMethod.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bAdminDeliveryService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdminDeliveryService);

//# sourceMappingURL=b2b-admin-delivery.service.js.map