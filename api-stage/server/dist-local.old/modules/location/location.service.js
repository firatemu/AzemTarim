"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LocationService", {
    enumerable: true,
    get: function() {
        return LocationService;
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
let LocationService = class LocationService {
    /**
   * Adres kodunu parse eder (K1-A1-3-5 formatından bileşenlere)
   */ parseLocationCode(code) {
        const regex = /^K([1-3])-([A-T])([12])-([1-9]|[1-9][0-9])-([1-9]|[1-4][0-9]|50)$/;
        const match = code.match(regex);
        if (!match) {
            return null;
        }
        return {
            layer: parseInt(match[1], 10),
            corridor: match[2],
            side: parseInt(match[3], 10),
            section: parseInt(match[4], 10),
            level: parseInt(match[5], 10)
        };
    }
    /**
   * Bileşenlerden adres kodu üretir
   */ generateLocationCode(layer, corridor, side, section, level) {
        return `K${layer}-${corridor}${side}-${section}-${level}`;
    }
    /**
   * Adres kodunu doğrular
   */ validateLocationCode(code) {
        const regex = /^K([1-3])-([A-T])([12])-([1-9]|[1-9][0-9])-([1-9]|[1-4][0-9]|50)$/;
        return regex.test(code);
    }
    /**
   * Create DTO'dan adres kodunu ve bileşenleri çıkarır
   */ extractLocationData(dto) {
        let layer;
        let corridor;
        let side;
        let section;
        let level;
        let code;
        // Tek satır code girişi varsa parse et
        if ('code' in dto && dto.code) {
            const parsed = this.parseLocationCode(dto.code);
            if (parsed) {
                // Mezanin formatı: K1-A1-3-5
                layer = parsed.layer;
                corridor = parsed.corridor;
                side = parsed.side;
                section = parsed.section;
                level = parsed.level;
                code = dto.code;
            } else {
                // Serbest raf formatı: Herhangi bir kod (örn: K1-RAF001, R-200)
                // Sadece code kullan, diğer alanlar dummy değerler
                code = dto.code;
                layer = 0;
                corridor = 'FREE'; // Boş string yerine 'FREE' kullan
                side = 0;
                section = 0;
                level = 0;
            }
        } else if ('layer' in dto && 'corridor' in dto && 'side' in dto && 'section' in dto && 'level' in dto) {
            // Bileşen bazlı giriş
            layer = dto.layer;
            corridor = dto.corridor;
            side = dto.side;
            section = dto.section;
            level = dto.level;
            // Aralık kontrolleri
            if (layer < 1 || layer > 3) {
                throw new _common.BadRequestException('Kat 1 ile 3 arasında olmalı');
            }
            if (!/^[A-T]$/.test(corridor)) {
                throw new _common.BadRequestException('Koridor A ile T arasında olmalı');
            }
            if (side !== 1 && side !== 2) {
                throw new _common.BadRequestException('Taraf 1 (Sol) veya 2 (Sağ) olmalı');
            }
            if (section < 1 || section > 99) {
                throw new _common.BadRequestException('Bölüm 1 ile 99 arasında olmalı');
            }
            if (level < 1 || level > 50) {
                throw new _common.BadRequestException('Raf seviyesi 1 ile 50 arasında olmalı');
            }
            code = this.generateLocationCode(layer, corridor, side, section, level);
        } else {
            throw new _common.BadRequestException('Kat, Koridor, Taraf, Bölüm, Raf bilgileri veya adres kodu girilmelidir');
        }
        // Mezanin formatı ise doğrula
        if (layer > 0) {
            if (!this.validateLocationCode(code)) {
                throw new _common.BadRequestException('Adres formatı hatalı. Beklenen: K{kat:1-3}-{koridor:A-T}{taraf:1-2}-{bölüm:1-99}-{raf:1-50}. Örnek: K1-A1-3-5');
            }
        } else {
            // Serbest raf için minimal validasyon
            if (!code || code.length < 2) {
                throw new _common.BadRequestException('Raf kodu en az 2 karakter olmalıdır');
            }
        }
        return {
            layer,
            corridor,
            side,
            section,
            level,
            code
        };
    }
    async findAll(warehouseId, active, layer, corridor) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {};
        if (warehouseId) where.warehouseId = warehouseId;
        if (active !== undefined) where.active = active;
        if (layer) where.layer = layer;
        if (corridor) where.corridor = corridor;
        if (tenantId) {
            where.warehouse = {
                tenantId
            };
        }
        try {
            const result = await this.prisma.location.findMany({
                where,
                include: {
                    warehouse: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            productLocationStocks: true
                        }
                    }
                },
                orderBy: [
                    {
                        layer: 'asc'
                    },
                    {
                        corridor: 'asc'
                    },
                    {
                        side: 'asc'
                    },
                    {
                        section: 'asc'
                    },
                    {
                        level: 'asc'
                    }
                ]
            });
            console.log('✅ [Location Service] Sonuç:', result.length, 'adet location bulundu');
            return result;
        } catch (error) {
            console.error('❌ [Location Service] findAll hatası:', error);
            console.error('❌ [Location Service] Hata detayları:', {
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
                stack: error?.stack
            });
            throw new _common.BadRequestException(error?.message || 'Raf listesi alınırken hata oluştu');
        }
    }
    async findOne(id) {
        const location = await this.prisma.location.findUnique({
            where: {
                id
            },
            include: {
                warehouse: true,
                productLocationStocks: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                brand: true
                            }
                        }
                    },
                    where: {
                        qtyOnHand: {
                            gt: 0
                        }
                    },
                    orderBy: {
                        product: {
                            code: 'asc'
                        }
                    }
                }
            }
        });
        if (!location) {
            throw new _common.NotFoundException('Shelf not found');
        }
        return location;
    }
    async findByCode(code) {
        const location = await this.prisma.location.findUnique({
            where: {
                code
            },
            include: {
                warehouse: true,
                productLocationStocks: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                brand: true
                            }
                        }
                    },
                    where: {
                        qtyOnHand: {
                            gt: 0
                        }
                    }
                }
            }
        });
        if (!location) {
            throw new _common.NotFoundException('Shelf not found');
        }
        return location;
    }
    async findByBarcode(barcode) {
        const location = await this.prisma.location.findUnique({
            where: {
                barcode
            },
            include: {
                warehouse: true
            }
        });
        if (!location) {
            throw new _common.NotFoundException('Shelf not found');
        }
        return location;
    }
    async create(createDto) {
        // Warehouse kontrolü
        const warehouse = await this.prisma.warehouse.findUnique({
            where: {
                id: createDto.warehouseId
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        if (!warehouse.active) {
            throw new _common.BadRequestException('Depo aktif değil');
        }
        // Adres bilgilerini çıkar
        const { layer, corridor, side, section, level, code } = this.extractLocationData(createDto);
        // Code benzersizliği kontrolü
        const existingCode = await this.prisma.location.findUnique({
            where: {
                code
            }
        });
        if (existingCode) {
            throw new _common.BadRequestException('Bu kodda bir raf zaten mevcut');
        }
        // Barcode (genelde code ile aynı)
        const barcode = createDto.barcode || code;
        // Barcode benzersizliği kontrolü
        const existingBarcode = await this.prisma.location.findUnique({
            where: {
                barcode
            }
        });
        if (existingBarcode) {
            throw new _common.BadRequestException('Bu barkod zaten kullanılıyor');
        }
        // Aynı warehouse'da aynı code kontrolü
        const existingInWarehouse = await this.prisma.location.findFirst({
            where: {
                warehouseId: createDto.warehouseId,
                code
            }
        });
        if (existingInWarehouse) {
            throw new _common.BadRequestException('Bu depoda bu kodda bir raf zaten mevcut');
        }
        return this.prisma.location.create({
            data: {
                warehouseId: createDto.warehouseId,
                layer: layer || 0,
                corridor: corridor || 'FREE',
                side: side || 0,
                section: section || 0,
                level: level || 0,
                code,
                barcode,
                name: createDto.name,
                active: createDto.active ?? true
            }
        });
    }
    async update(id, updateDto) {
        const location = await this.prisma.location.findUnique({
            where: {
                id
            }
        });
        if (!location) {
            throw new _common.NotFoundException('Shelf not found');
        }
        // Code veya bileşenler değiştiriliyorsa
        if (updateDto.code || updateDto.layer || updateDto.corridor || updateDto.side || updateDto.section || updateDto.level) {
            const { layer, corridor, side, section, level, code } = this.extractLocationData(updateDto);
            // Code değişiyorsa benzersizlik kontrolü
            if (code !== location.code) {
                const existing = await this.prisma.location.findUnique({
                    where: {
                        code
                    }
                });
                if (existing) {
                    throw new _common.BadRequestException('Bu kodda bir raf zaten mevcut');
                }
            }
            // Barcode da güncelle
            const barcode = updateDto.barcode || code;
            if (barcode !== location.barcode) {
                const existingBarcode = await this.prisma.location.findUnique({
                    where: {
                        barcode
                    }
                });
                if (existingBarcode) {
                    throw new _common.BadRequestException('Bu barkod zaten kullanılıyor');
                }
            }
            return this.prisma.location.update({
                where: {
                    id
                },
                data: {
                    layer,
                    corridor,
                    side,
                    section,
                    level,
                    code,
                    barcode,
                    name: updateDto.name,
                    active: updateDto.active
                }
            });
        } else {
            // Sadece name veya active güncelleniyor
            const updateData = {};
            if (updateDto.name !== undefined) {
                updateData.name = updateDto.name;
            }
            if (updateDto.active !== undefined) {
                updateData.active = updateDto.active;
            }
            if (updateDto.barcode !== undefined && updateDto.barcode !== location.barcode) {
                const existingBarcode = await this.prisma.location.findUnique({
                    where: {
                        barcode: updateDto.barcode
                    }
                });
                if (existingBarcode) {
                    throw new _common.BadRequestException('Bu barkod zaten kullanılıyor');
                }
                updateData.barcode = updateDto.barcode;
            }
            return this.prisma.location.update({
                where: {
                    id
                },
                data: updateData
            });
        }
    }
    async remove(id) {
        const location = await this.prisma.location.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: {
                        productLocationStocks: true,
                        stockMoves: true
                    }
                }
            }
        });
        if (!location) {
            throw new _common.NotFoundException('Shelf not found');
        }
        if (location._count.productLocationStocks > 0) {
            throw new _common.BadRequestException('Bu rafta product kayıtları bulunuyor. Önce product kayıtlarını temizleyin.');
        }
        return this.prisma.location.delete({
            where: {
                id
            }
        });
    }
    async deleteAll() {
        const result = await this.prisma.location.deleteMany({});
        return {
            message: `${result.count} adet raf/koridor/sütun kaydı silindi`,
            count: result.count
        };
    }
    /**
   * Toplu bölüm (section) oluşturma (1'den count'a kadar)
   * Her bölümde 1. raf otomatik oluşur
   */ /**
   * Grid toplu oluşturma (Excel-like: bölüm × raf)
   */ async createBulkGrid(locations) {
        const locationsToCreate = [];
        for (const loc of locations){
            const code = this.generateLocationCode(loc.layer, loc.corridor, loc.side, loc.section, loc.level);
            const barcode = code;
            // Aynı code var mı kontrol et
            const existing = await this.prisma.location.findUnique({
                where: {
                    code
                }
            });
            if (!existing) {
                locationsToCreate.push({
                    ...loc,
                    code,
                    barcode
                });
            }
        }
        if (locationsToCreate.length > 0) {
            await this.prisma.location.createMany({
                data: locationsToCreate
            });
        }
        return {
            message: `${locationsToCreate.length} adet raf oluşturuldu`,
            count: locationsToCreate.length
        };
    }
    async createBulkSections(warehouseId, layer, corridor, side, sectionCount) {
        const locations = [];
        for(let section = 1; section <= sectionCount; section++){
            // Bu bölümün 1. rafını oluştur
            const code = this.generateLocationCode(layer, corridor, side, section, 1);
            const barcode = code;
            // Aynı code var mı kontrol et
            const existing = await this.prisma.location.findUnique({
                where: {
                    code
                }
            });
            if (!existing) {
                locations.push({
                    warehouseId,
                    layer,
                    corridor,
                    side,
                    section,
                    level: 1,
                    code,
                    barcode,
                    active: true
                });
            }
        }
        if (locations.length > 0) {
            await this.prisma.location.createMany({
                data: locations
            });
        }
        return {
            message: `${locations.length} adet bölüm oluşturuldu`,
            count: locations.length
        };
    }
    /**
   * Toplu raf oluşturma (1'den count'a kadar)
   */ async createBulkLevels(warehouseId, layer, corridor, side, section, levelCount) {
        const locations = [];
        for(let level = 1; level <= levelCount; level++){
            const code = this.generateLocationCode(layer, corridor, side, section, level);
            const barcode = code;
            // Aynı code var mı kontrol et
            const existing = await this.prisma.location.findUnique({
                where: {
                    code
                }
            });
            if (!existing) {
                locations.push({
                    warehouseId,
                    layer,
                    corridor,
                    side,
                    section,
                    level,
                    code,
                    barcode,
                    active: true
                });
            }
        }
        if (locations.length > 0) {
            await this.prisma.location.createMany({
                data: locations
            });
        }
        return {
            message: `${locations.length} adet raf oluşturuldu`,
            count: locations.length
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
LocationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], LocationService);

//# sourceMappingURL=location.service.js.map