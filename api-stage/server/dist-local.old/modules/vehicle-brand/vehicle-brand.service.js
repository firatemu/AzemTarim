"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VehicleBrandService", {
    enumerable: true,
    get: function() {
        return VehicleBrandService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let VehicleBrandService = class VehicleBrandService {
    async create(createVehicleBrandDto) {
        // Aynı araç zaten var mı kontrol et
        const existingArac = await this.prisma.vehicleCatalog.findFirst({
            where: {
                brand: createVehicleBrandDto.brand,
                model: createVehicleBrandDto.model,
                engineVolume: createVehicleBrandDto.engineVolume,
                fuelType: createVehicleBrandDto.fuelType
            }
        });
        if (existingArac) {
            throw new _common.BadRequestException(`Bu araç zaten mevcut: ${createVehicleBrandDto.brand} ${createVehicleBrandDto.model} (${createVehicleBrandDto.engineVolume}, ${createVehicleBrandDto.fuelType})`);
        }
        return this.prisma.vehicleCatalog.create({
            data: {
                brand: createVehicleBrandDto.brand,
                model: createVehicleBrandDto.model,
                engineVolume: createVehicleBrandDto.engineVolume,
                fuelType: createVehicleBrandDto.fuelType
            }
        });
    }
    async findAll(page = 1, limit = 50, search, brand, fuelType) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                {
                    brand: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    model: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    engineVolume: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    fuelType: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (brand) {
            where.brand = {
                equals: brand,
                mode: 'insensitive'
            };
        }
        if (fuelType) {
            where.fuelType = {
                equals: fuelType,
                mode: 'insensitive'
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.vehicleCatalog.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    {
                        brand: 'asc'
                    },
                    {
                        model: 'asc'
                    },
                    {
                        engineVolume: 'asc'
                    }
                ]
            }),
            this.prisma.vehicleCatalog.count({
                where
            })
        ]);
        return {
            data: data.map((v)=>({
                    id: v.id,
                    brand: v.brand,
                    model: v.model,
                    engineVolume: v.engineVolume,
                    fuelType: v.fuelType,
                    createdAt: v.createdAt,
                    updatedAt: v.updatedAt
                })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const vehicleBrand = await this.prisma.vehicleCatalog.findUnique({
            where: {
                id
            }
        });
        if (!vehicleBrand) {
            throw new _common.NotFoundException(`Vehicle not found: id`);
        }
        return {
            id: vehicleBrand.id,
            brand: vehicleBrand.brand,
            model: vehicleBrand.model,
            engineVolume: vehicleBrand.engineVolume,
            fuelType: vehicleBrand.fuelType,
            createdAt: vehicleBrand.createdAt,
            updatedAt: vehicleBrand.updatedAt
        };
    }
    async update(id, updateVehicleBrandDto) {
        const existingVehicle = await this.findOne(id);
        // Güncellenecek alanları belirle
        const brandToUpdate = updateVehicleBrandDto.brand ?? existingVehicle.brand;
        const modelToUpdate = updateVehicleBrandDto.model ?? existingVehicle.model;
        const engineVolumeToUpdate = updateVehicleBrandDto.engineVolume ?? existingVehicle.engineVolume;
        const fuelTypeToUpdate = updateVehicleBrandDto.fuelType ?? existingVehicle.fuelType;
        // Eğer benzersiz alanlar değişiyorsa, çakışma kontrolü yap
        const uniqueFieldsChanged = updateVehicleBrandDto.brand || updateVehicleBrandDto.model || updateVehicleBrandDto.engineVolume || updateVehicleBrandDto.fuelType;
        if (uniqueFieldsChanged) {
            const existingArac = await this.prisma.vehicleCatalog.findFirst({
                where: {
                    id: {
                        not: id
                    },
                    brand: brandToUpdate,
                    model: modelToUpdate,
                    engineVolume: engineVolumeToUpdate,
                    fuelType: fuelTypeToUpdate
                }
            });
            if (existingArac) {
                throw new _common.BadRequestException(`Bu araç kombinasyonu zaten mevcut: ${brandToUpdate} ${modelToUpdate} (${engineVolumeToUpdate}, ${fuelTypeToUpdate})`);
            }
        }
        const updated = await this.prisma.vehicleCatalog.update({
            where: {
                id
            },
            data: {
                brand: updateVehicleBrandDto.brand,
                model: updateVehicleBrandDto.model,
                engineVolume: updateVehicleBrandDto.engineVolume,
                fuelType: updateVehicleBrandDto.fuelType
            }
        });
        return {
            id: updated.id,
            brand: updated.brand,
            model: updated.model,
            engineVolume: updated.engineVolume,
            fuelType: updated.fuelType,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        };
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.vehicleCatalog.delete({
            where: {
                id
            }
        });
    }
    async getBrands() {
        const brands = await this.prisma.vehicleCatalog.findMany({
            select: {
                brand: true
            },
            distinct: [
                'brand'
            ],
            orderBy: {
                brand: 'asc'
            }
        });
        return brands.map((m)=>m.brand);
    }
    async getFuelTypes() {
        const yakitTipleri = await this.prisma.vehicleCatalog.findMany({
            select: {
                fuelType: true
            },
            distinct: [
                'fuelType'
            ],
            orderBy: {
                fuelType: 'asc'
            }
        });
        return yakitTipleri.map((y)=>y.fuelType);
    }
    async getModels(brand) {
        const where = brand ? {
            brand: brand
        } : {};
        const models = await this.prisma.vehicleCatalog.findMany({
            where,
            select: {
                model: true
            },
            distinct: [
                'model'
            ],
            orderBy: {
                model: 'asc'
            }
        });
        return models.map((m)=>m.model);
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
VehicleBrandService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], VehicleBrandService);

//# sourceMappingURL=vehicle-brand.service.js.map