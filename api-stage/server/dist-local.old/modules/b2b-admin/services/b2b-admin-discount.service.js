"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminDiscountService", {
    enumerable: true,
    get: function() {
        return B2bAdminDiscountService;
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
let B2bAdminDiscountService = class B2bAdminDiscountService {
    async list(tenantId) {
        return this.prisma.b2BDiscount.findMany({
            where: {
                tenantId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async create(tenantId, dto) {
        return this.prisma.b2BDiscount.create({
            data: {
                tenantId,
                name: dto.name,
                type: dto.type,
                targetValue: dto.targetValue,
                discountRate: dto.discountRate,
                startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
                endsAt: dto.endsAt ? new Date(dto.endsAt) : null
            }
        });
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BDiscount.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Discount not found');
        const data = {
            ...dto.name != null && {
                name: dto.name
            },
            ...dto.type != null && {
                type: dto.type
            },
            ...dto.targetValue != null && {
                targetValue: dto.targetValue
            },
            ...dto.discountRate != null && {
                discountRate: dto.discountRate
            },
            ...dto.isActive != null && {
                isActive: dto.isActive
            }
        };
        if (dto.startsAt !== undefined) {
            data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
        }
        if (dto.endsAt !== undefined) {
            data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
        }
        return this.prisma.b2BDiscount.update({
            where: {
                id
            },
            data
        });
    }
    async softDelete(tenantId, id) {
        const existing = await this.prisma.b2BDiscount.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Discount not found');
        return this.prisma.b2BDiscount.update({
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
B2bAdminDiscountService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdminDiscountService);

//# sourceMappingURL=b2b-admin-discount.service.js.map