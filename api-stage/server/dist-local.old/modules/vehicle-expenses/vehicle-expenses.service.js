"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VehicleExpensesService", {
    enumerable: true,
    get: function() {
        return VehicleExpensesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let VehicleExpensesService = class VehicleExpensesService {
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        // Check if vehicle exists and belongs to tenant
        const vehicle = await this.prisma.companyVehicle.findFirst({
            where: {
                id: createDto.vehicleId,
                tenantId
            }
        });
        if (!vehicle) {
            throw new _common.NotFoundException(`Arac id ${createDto.vehicleId} ile bulunamadi`);
        }
        const { date, ...rest } = createDto;
        return this.prisma.vehicleExpense.create({
            data: {
                ...rest,
                date: date ? new Date(date) : new Date(),
                tenantId
            }
        });
    }
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.vehicleExpense.findMany({
            where: {
                tenantId,
                deletedAt: null
            },
            include: {
                vehicle: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async findByVehicle(vehicleId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.vehicleExpense.findMany({
            where: {
                vehicleId,
                tenantId,
                deletedAt: null
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const expense = await this.prisma.vehicleExpense.findFirst({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            include: {
                vehicle: true
            }
        });
        if (!expense) {
            throw new _common.NotFoundException(`Masraf id ${id} ile bulunamadi`);
        }
        return expense;
    }
    async update(id, updateDto) {
        await this.findOne(id); // Ensure it exists and belongs to tenant
        const { date, ...rest } = updateDto;
        return this.prisma.vehicleExpense.update({
            where: {
                id
            },
            data: {
                ...rest,
                date: date ? new Date(date) : undefined
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.vehicleExpense.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date()
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
VehicleExpensesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], VehicleExpensesService);

//# sourceMappingURL=vehicle-expenses.service.js.map