"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BrandService", {
    enumerable: true,
    get: function() {
        return BrandService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _clsservice = require("../../common/services/cls.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BrandService = class BrandService {
    isPlaceholderProduct(p) {
        return p.isBrandOnly === true || (p.name?.includes('[Marka Tanımı]') ?? false) || (p.name?.includes('[Brand Definition]') ?? false);
    }
    /**
     * Fetch all brands (unique brands from products)
     * Includes placeholder records (with product count 0)
     */ async findAll() {
        const products = await this.prisma.product.findMany({
            where: {
                brand: {
                    not: null
                }
            },
            select: {
                brand: true,
                name: true,
                isBrandOnly: true
            }
        });
        const allBrands = new Set();
        const brandMap = new Map();
        products.forEach((p)=>{
            if (p.brand) {
                allBrands.add(p.brand);
                const isPlaceholder = this.isPlaceholderProduct(p);
                if (!isPlaceholder) {
                    const count = brandMap.get(p.brand) || 0;
                    brandMap.set(p.brand, count + 1);
                }
            }
        });
        const brands = Array.from(allBrands).map((brandName)=>({
                brandName,
                productCount: brandMap.get(brandName) || 0
            })).sort((a, b)=>a.brandName.localeCompare(b.brandName, 'tr'));
        return brands;
    }
    /**
     * Fetch a specific brand
     */ async findOne(brandName) {
        const decodedBrandName = decodeURIComponent(brandName);
        const productCount = await this.prisma.product.count({
            where: {
                brand: decodedBrandName,
                NOT: {
                    OR: [
                        {
                            isBrandOnly: true
                        },
                        {
                            name: {
                                contains: '[Marka Tanımı]'
                            }
                        },
                        {
                            name: {
                                contains: '[Brand Definition]'
                            }
                        }
                    ]
                }
            }
        });
        const totalProductCount = await this.prisma.product.count({
            where: {
                brand: decodedBrandName
            }
        });
        if (totalProductCount === 0) {
            throw new _common.NotFoundException(`Brand not found: ${decodedBrandName}`);
        }
        return {
            brandName: decodedBrandName,
            productCount
        };
    }
    /**
     * Add a new brand - Creates a placeholder product record
     */ async create(brandName) {
        if (!brandName || !brandName.trim()) {
            throw new _common.BadRequestException('Brand name is required');
        }
        const trimmedBrandName = brandName.trim();
        const existingProduct = await this.prisma.product.findFirst({
            where: {
                brand: trimmedBrandName
            }
        });
        if (existingProduct) {
            throw new _common.BadRequestException(`Brand "${trimmedBrandName}" already exists`);
        }
        const timestamp = Date.now().toString().slice(-6);
        const code = `BRD-${trimmedBrandName.substring(0, 3).toUpperCase()}-${timestamp}`;
        try {
            const product = await this.prisma.product.create({
                data: {
                    tenantId: _clsservice.ClsService.getTenantId() || '',
                    code,
                    name: `[Brand Definition] ${trimmedBrandName}`,
                    unit: 'Adet',
                    priceCards: {
                        create: [
                            {
                                tenantId: _clsservice.ClsService.getTenantId() || '',
                                type: 'PURCHASE',
                                price: 0,
                                vatRate: 20
                            },
                            {
                                tenantId: _clsservice.ClsService.getTenantId() || '',
                                type: 'SALE',
                                price: 0,
                                vatRate: 20
                            }
                        ]
                    },
                    brand: trimmedBrandName,
                    isBrandOnly: true,
                    description: 'This record was created only for brand definition. It is not a real product.'
                }
            });
            return {
                message: `Brand "${trimmedBrandName}" added successfully`,
                brandName: trimmedBrandName,
                productCode: product.code
            };
        } catch (error) {
            if (error.code === 'P2002') {
                const timestamp = Date.now().toString();
                const retryCode = `BRD-${trimmedBrandName.substring(0, 3).toUpperCase()}-${timestamp}`;
                const product = await this.prisma.product.create({
                    data: {
                        tenantId: _clsservice.ClsService.getTenantId() || '',
                        code: retryCode,
                        name: `[Brand Definition] ${trimmedBrandName}`,
                        unit: 'Adet',
                        priceCards: {
                            create: [
                                {
                                    tenantId: _clsservice.ClsService.getTenantId() || '',
                                    type: 'PURCHASE',
                                    price: 0,
                                    vatRate: 20
                                },
                                {
                                    tenantId: _clsservice.ClsService.getTenantId() || '',
                                    type: 'SALE',
                                    price: 0,
                                    vatRate: 20
                                }
                            ]
                        },
                        brand: trimmedBrandName,
                        isBrandOnly: true,
                        description: 'This record was created only for brand definition. It is not a real product.'
                    }
                });
                return {
                    message: `Brand "${trimmedBrandName}" added successfully`,
                    brandName: trimmedBrandName,
                    productCode: product.code
                };
            }
            throw new _common.BadRequestException(error?.message || 'An error occurred while adding the brand');
        }
    }
    /**
     * Update brand - Changes the brand name across all associated products
     */ async update(brandName, newBrandName) {
        const decodedBrandName = decodeURIComponent(brandName);
        const decodedNewBrandName = decodeURIComponent(newBrandName);
        if (decodedBrandName === decodedNewBrandName) {
            throw new _common.BadRequestException('New brand name cannot be identical to the existing brand name');
        }
        const productCount = await this.prisma.product.count({
            where: {
                brand: decodedBrandName
            }
        });
        if (productCount === 0) {
            throw new _common.NotFoundException(`Brand not found: ${decodedBrandName}`);
        }
        const newBrandProductCount = await this.prisma.product.count({
            where: {
                brand: decodedNewBrandName
            }
        });
        if (newBrandProductCount > 0) {
            throw new _common.BadRequestException(`Brand name "${decodedNewBrandName}" is already in use`);
        }
        await this.prisma.product.updateMany({
            where: {
                brand: decodedBrandName
            },
            data: {
                brand: decodedNewBrandName
            }
        });
        return {
            message: `Brand successfully updated from "${decodedBrandName}" to "${decodedNewBrandName}"`,
            oldBrandName: decodedBrandName,
            newBrandName: decodedNewBrandName,
            affectedProductCount: productCount
        };
    }
    /**
     * Remove brand - Can only be removed if no real products are attached
     */ async remove(brandName) {
        const decodedBrandName = decodeURIComponent(brandName);
        const productCount = await this.prisma.product.count({
            where: {
                brand: decodedBrandName,
                NOT: {
                    OR: [
                        {
                            isBrandOnly: true
                        },
                        {
                            name: {
                                contains: '[Marka Tanımı]'
                            }
                        },
                        {
                            name: {
                                contains: '[Brand Definition]'
                            }
                        }
                    ]
                }
            }
        });
        const totalProductCount = await this.prisma.product.count({
            where: {
                brand: decodedBrandName
            }
        });
        if (totalProductCount === 0) {
            throw new _common.NotFoundException(`Brand not found: ${decodedBrandName}`);
        }
        if (productCount > 0) {
            throw new _common.BadRequestException(`There are ${productCount} products attached to this brand. Brands with products cannot be deleted.`);
        }
        const placeholderRecords = await this.prisma.product.findMany({
            where: {
                brand: decodedBrandName,
                OR: [
                    {
                        isBrandOnly: true
                    },
                    {
                        name: {
                            contains: '[Marka Tanımı]'
                        }
                    },
                    {
                        name: {
                            contains: '[Brand Definition]'
                        }
                    }
                ]
            },
            select: {
                id: true
            }
        });
        if (placeholderRecords.length > 0) {
            await this.prisma.product.deleteMany({
                where: {
                    id: {
                        in: placeholderRecords.map((k)=>k.id)
                    }
                }
            });
        }
        return {
            message: `Brand "${decodedBrandName}" removed successfully`,
            brandName: decodedBrandName,
            deletedPlaceholderCount: placeholderRecords.length
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
BrandService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], BrandService);

//# sourceMappingURL=brand.service.js.map