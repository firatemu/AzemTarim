"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CustomerVehicleService", {
    enumerable: true,
    get: function() {
        return CustomerVehicleService;
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
let CustomerVehicleService = class CustomerVehicleService {
    async create(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: true
        });
        const finalTenantId = dto.tenantId ?? tenantId ?? undefined;
        const existingWhere = {
            plate: dto.plaka
        };
        if (finalTenantId) existingWhere.tenantId = finalTenantId;
        const existingPlaka = await this.prisma.customerVehicle.findFirst({
            where: existingWhere
        });
        if (existingPlaka) {
            throw new _common.BadRequestException('Bu plaka zaten kayıtlı');
        }
        if (dto.saseno) {
            const existingSasenoWhere = {
                chassisno: dto.saseno
            };
            if (finalTenantId) existingSasenoWhere.tenantId = finalTenantId;
            const existingSaseno = await this.prisma.customerVehicle.findFirst({
                where: existingSasenoWhere
            });
            if (existingSaseno) {
                throw new _common.BadRequestException('Bu şase no zaten kayıtlı');
            }
        }
        const cari = await this.prisma.account.findFirst({
            where: {
                id: dto.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
            }
        });
        if (!cari) {
            throw new _common.BadRequestException('Account not found');
        }
        const data = {
            tenantId: finalTenantId,
            accountId: dto.accountId,
            plate: dto.plaka,
            chassisno: dto.saseno,
            year: dto.yil,
            mileage: dto.km,
            brand: dto.aracMarka,
            model: dto.aracModel,
            engineSize: dto.aracMotorHacmi,
            fuelType: dto.aracYakitTipi,
            registrationNo: dto.ruhsatNo,
            registrationOwner: dto.ruhsatSahibi,
            enginePower: dto.motorGucu,
            transmission: dto.sanziman,
            color: dto.renk,
            notes: dto.notes,
            ...dto.tescilTarihi && {
                registrationDate: new Date(dto.tescilTarihi)
            }
        };
        return this.prisma.customerVehicle.create({
            data,
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                }
            }
        });
    }
    async findAll(page = 1, limit = 50, search, accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        if (search) {
            where.OR = [
                {
                    plate: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    chassisno: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
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
                }
            ];
        }
        if (accountId) {
            where.accountId = accountId;
        }
        const [data, total] = await Promise.all([
            this.prisma.customerVehicle.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true
                        }
                    }
                }
            }),
            this.prisma.customerVehicle.count({
                where
            })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const vehicle = await this.prisma.customerVehicle.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                }
            }
        });
        if (!vehicle) {
            throw new _common.NotFoundException(`Customer vehicle not found: id`);
        }
        return vehicle;
    }
    async update(id, dto) {
        await this.findOne(id);
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (dto.plaka) {
            const existingPlaka = await this.prisma.customerVehicle.findFirst({
                where: {
                    plate: dto.plaka,
                    id: {
                        not: id
                    },
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (existingPlaka) {
                throw new _common.BadRequestException('Bu plaka zaten kayıtlı');
            }
        }
        if (dto.saseno) {
            const existingSaseno = await this.prisma.customerVehicle.findFirst({
                where: {
                    chassisno: dto.saseno,
                    id: {
                        not: id
                    },
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (existingSaseno) {
                throw new _common.BadRequestException('Bu şase no zaten kayıtlı');
            }
        }
        const updateData = {
            ...dto.accountId && {
                accountId: dto.accountId
            },
            ...dto.plaka && {
                plate: dto.plaka
            },
            ...dto.saseno !== undefined && {
                chassisno: dto.saseno
            },
            ...dto.yil !== undefined && {
                year: dto.yil
            },
            ...dto.km !== undefined && {
                mileage: dto.km
            },
            ...dto.aracMarka && {
                brand: dto.aracMarka
            },
            ...dto.aracModel && {
                model: dto.aracModel
            },
            ...dto.aracMotorHacmi !== undefined && {
                engineSize: dto.aracMotorHacmi
            },
            ...dto.aracYakitTipi !== undefined && {
                fuelType: dto.aracYakitTipi
            },
            ...dto.ruhsatNo !== undefined && {
                registrationNo: dto.ruhsatNo
            },
            ...dto.ruhsatSahibi !== undefined && {
                registrationOwner: dto.ruhsatSahibi
            },
            ...dto.motorGucu !== undefined && {
                enginePower: dto.motorGucu
            },
            ...dto.sanziman !== undefined && {
                transmission: dto.sanziman
            },
            ...dto.renk !== undefined && {
                color: dto.renk
            },
            ...dto.notes !== undefined && {
                notes: dto.notes
            }
        };
        if (dto.tescilTarihi !== undefined) {
            updateData.registrationDate = dto.tescilTarihi ? new Date(dto.tescilTarihi) : null;
        }
        return this.prisma.customerVehicle.update({
            where: {
                id
            },
            data: updateData,
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                }
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.customerVehicle.delete({
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
CustomerVehicleService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CustomerVehicleService);

//# sourceMappingURL=customer-vehicle.service.js.map