"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostalCodeService", {
    enumerable: true,
    get: function() {
        return PostalCodeService;
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
let PostalCodeService = class PostalCodeService {
    /**
   * İl, ilçe ve mahalle bilgisine göre posta kodunu bulur
   * @param city - İl adı
   * @param district - İlçe adı
   * @param neighborhood - Mahalle adı
   * @returns Posta kodu veya null
   */ async findPostalCode(city, district, neighborhood) {
        if (!city || !district || !neighborhood) {
            return null;
        }
        // Normalize: Büyük/küçük harf duyarsız arama
        const postalCode = await this.prisma.postalCode.findFirst({
            where: {
                city: {
                    equals: city.trim(),
                    mode: 'insensitive'
                },
                district: {
                    equals: district.trim(),
                    mode: 'insensitive'
                },
                neighborhood: {
                    equals: neighborhood.trim(),
                    mode: 'insensitive'
                }
            },
            select: {
                postalCode: true
            }
        });
        return postalCode?.postalCode || null;
    }
    /**
   * İl ve ilçe bilgisine göre posta kodlarını bulur (birden fazla mahalle olabilir)
   * @param city - İl adı
   * @param district - İlçe adı
   * @returns Posta kodları listesi
   */ async findPostalCodesByCityAndDistrict(city, district) {
        if (!city || !district) {
            return [];
        }
        const postalCodes = await this.prisma.postalCode.findMany({
            where: {
                city: {
                    equals: city.trim(),
                    mode: 'insensitive'
                },
                district: {
                    equals: district.trim(),
                    mode: 'insensitive'
                }
            },
            select: {
                postalCode: true
            },
            distinct: [
                'postalCode'
            ]
        });
        return postalCodes.map((pc)=>pc.postalCode);
    }
    /**
   * Posta kodunu veritabanına ekler veya günceller
   * @param city - İl adı
   * @param district - İlçe adı
   * @param neighborhood - Mahalle adı
   * @param postalCode - Posta kodu
   */ async upsertPostalCode(city, district, neighborhood, postalCode) {
        await this.prisma.postalCode.upsert({
            where: {
                city_district_neighborhood: {
                    city: city.trim(),
                    district: district.trim(),
                    neighborhood: neighborhood.trim()
                }
            },
            update: {
                postalCode: postalCode.trim()
            },
            create: {
                city: city.trim(),
                district: district.trim(),
                neighborhood: neighborhood.trim(),
                postalCode: postalCode.trim()
            }
        });
    }
    /**
   * Toplu posta kodu ekleme
   * @param postalCodes - Posta kodu listesi
   */ async bulkUpsertPostalCodes(postalCodes) {
        let created = 0;
        let updated = 0;
        for (const pc of postalCodes){
            try {
                const existing = await this.prisma.postalCode.findUnique({
                    where: {
                        city_district_neighborhood: {
                            city: pc.city.trim(),
                            district: pc.district.trim(),
                            neighborhood: pc.neighborhood.trim()
                        }
                    }
                });
                if (existing) {
                    await this.prisma.postalCode.update({
                        where: {
                            id: existing.id
                        },
                        data: {
                            postalCode: pc.postalCode.trim()
                        }
                    });
                    updated++;
                } else {
                    await this.prisma.postalCode.create({
                        data: {
                            city: pc.city.trim(),
                            district: pc.district.trim(),
                            neighborhood: pc.neighborhood.trim(),
                            postalCode: pc.postalCode.trim()
                        }
                    });
                    created++;
                }
            } catch (error) {
                console.error(`Error upserting postal code for ${pc.city}/${pc.district}/${pc.neighborhood}:`, error);
            }
        }
        return {
            created,
            updated
        };
    }
    /**
   * İl ve ilçe bilgisine göre mahalleleri bulur
   * @param city - İl adı
   * @param district - İlçe adı
   * @returns Mahalle listesi
   */ async findNeighborhoodsByCityAndDistrict(city, district) {
        if (!city || !district) {
            return [];
        }
        const neighborhoods = await this.prisma.postalCode.findMany({
            where: {
                city: {
                    equals: city.trim(),
                    mode: 'insensitive'
                },
                district: {
                    equals: district.trim(),
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                neighborhood: true,
                postalCode: true
            },
            orderBy: {
                neighborhood: 'asc'
            }
        });
        return neighborhoods.map((n)=>({
                id: n.id,
                name: n.neighborhood,
                postalCode: n.postalCode
            }));
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
PostalCodeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PostalCodeService);

//# sourceMappingURL=postal-code.service.js.map