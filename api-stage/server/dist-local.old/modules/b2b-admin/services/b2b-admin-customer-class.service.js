"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminCustomerClassService", {
    enumerable: true,
    get: function() {
        return B2bAdminCustomerClassService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
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
let B2bAdminCustomerClassService = class B2bAdminCustomerClassService {
    async list(tenantId) {
        return this.prisma.b2BCustomerClass.findMany({
            where: {
                tenantId
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    async create(tenantId, dto) {
        try {
            return await this.prisma.b2BCustomerClass.create({
                data: {
                    tenantId,
                    name: dto.name,
                    discountRate: dto.discountRate ?? 0
                }
            });
        } catch (e) {
            if (e instanceof _client.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new _common.ConflictException('Customer class name already exists');
            }
            throw e;
        }
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BCustomerClass.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Customer class not found');
        try {
            return await this.prisma.b2BCustomerClass.update({
                where: {
                    id
                },
                data: {
                    ...dto.name != null && {
                        name: dto.name
                    },
                    ...dto.discountRate != null && {
                        discountRate: dto.discountRate
                    }
                }
            });
        } catch (e) {
            if (e instanceof _client.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new _common.ConflictException('Customer class name already exists');
            }
            throw e;
        }
    }
    async remove(tenantId, id) {
        const existing = await this.prisma.b2BCustomerClass.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Customer class not found');
        const assigned = await this.prisma.b2BCustomer.count({
            where: {
                tenantId,
                customerClassId: id
            }
        });
        if (assigned > 0) {
            throw new _common.ConflictException('Cannot delete class while customers are assigned');
        }
        await this.prisma.b2BCustomerClass.delete({
            where: {
                id
            }
        });
        return {
            ok: true
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bAdminCustomerClassService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdminCustomerClassService);

//# sourceMappingURL=b2b-admin-customer-class.service.js.map