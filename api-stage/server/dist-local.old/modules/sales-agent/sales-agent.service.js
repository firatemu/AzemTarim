"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalesAgentService", {
    enumerable: true,
    get: function() {
        return SalesAgentService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SalesAgentService = class SalesAgentService {
    async create(createDto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        return this.prisma.salesAgent.create({
            data: {
                fullName: createDto.fullName,
                phone: createDto.phone,
                email: createDto.email,
                isActive: createDto.isActive ?? true,
                tenantId
            }
        });
    }
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const list = await this.prisma.salesAgent.findMany({
            where: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            orderBy: {
                fullName: 'asc'
            }
        });
        return list.map((s)=>({
                id: s.id,
                fullName: s.fullName,
                phone: s.phone ?? undefined,
                email: s.email ?? undefined,
                isActive: s.isActive,
                tenantId: s.tenantId ?? undefined,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            }));
    }
    async findOne(id) {
        const item = await this.prisma.salesAgent.findUnique({
            where: {
                id
            }
        });
        if (!item) throw new _common.NotFoundException('Sales agent not found');
        return {
            id: item.id,
            fullName: item.fullName,
            phone: item.phone ?? undefined,
            email: item.email ?? undefined,
            isActive: item.isActive,
            tenantId: item.tenantId ?? undefined,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        };
    }
    async update(id, updateDto) {
        await this.findOne(id);
        return this.prisma.salesAgent.update({
            where: {
                id
            },
            data: {
                fullName: updateDto.fullName,
                phone: updateDto.phone,
                email: updateDto.email,
                isActive: updateDto.isActive
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.salesAgent.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
SalesAgentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], SalesAgentService);

//# sourceMappingURL=sales-agent.service.js.map