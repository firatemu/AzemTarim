"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyVehiclesService", {
    enumerable: true,
    get: function() {
        return CompanyVehiclesService;
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
let CompanyVehiclesService = class CompanyVehiclesService {
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        const { registrationDate, lastInspectionDate, insuranceDate, ...rest } = createDto;
        return this.prisma.companyVehicle.create({
            data: {
                ...rest,
                registrationDate: registrationDate ? new Date(registrationDate) : undefined,
                lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : undefined,
                insuranceDate: insuranceDate ? new Date(insuranceDate) : undefined,
                tenantId
            }
        });
    }
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.companyVehicle.findMany({
            where: {
                tenantId,
                deletedAt: null
            },
            include: {
                assignedEmployee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                expenses: {
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const vehicle = await this.prisma.companyVehicle.findFirst({
            where: {
                id,
                tenantId,
                deletedAt: null
            },
            include: {
                assignedEmployee: true,
                expenses: {
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });
        if (!vehicle) {
            throw new _common.NotFoundException(`Arac id ${id} ile bulunamadi`);
        }
        return vehicle;
    }
    async update(id, updateDto) {
        await this.findOne(id); // Ensure it exists and belongs to the tenant
        const { registrationDate, lastInspectionDate, insuranceDate, ...rest } = updateDto;
        return this.prisma.companyVehicle.update({
            where: {
                id
            },
            data: {
                ...rest,
                registrationDate: registrationDate ? new Date(registrationDate) : undefined,
                lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : undefined,
                insuranceDate: insuranceDate ? new Date(insuranceDate) : undefined
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.companyVehicle.update({
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
CompanyVehiclesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CompanyVehiclesService);

//# sourceMappingURL=company-vehicles.service.js.map