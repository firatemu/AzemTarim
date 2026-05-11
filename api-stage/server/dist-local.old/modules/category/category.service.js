"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CategoryService", {
    enumerable: true,
    get: function() {
        return CategoryService;
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
let CategoryService = class CategoryService {
    /**
     * Fetch all main categories and their subcategories from products
     */ async findAll() {
        const products = await this.prisma.product.findMany({
            where: {
                mainCategory: {
                    not: null
                }
            },
            select: {
                mainCategory: true,
                subCategory: true
            }
        });
        const categoryMap = new Map();
        products.forEach((p)=>{
            if (p.mainCategory) {
                if (!categoryMap.has(p.mainCategory)) {
                    categoryMap.set(p.mainCategory, new Set());
                }
                if (p.subCategory) {
                    categoryMap.get(p.mainCategory).add(p.subCategory);
                }
            }
        });
        const categories = Array.from(categoryMap.entries()).map(([mainCategory, subCategorySet])=>({
                mainCategory,
                subCategories: Array.from(subCategorySet).sort((a, b)=>a.localeCompare(b, 'tr'))
            })).sort((a, b)=>a.mainCategory.localeCompare(b.mainCategory, 'tr'));
        return categories;
    }
    /**
     * Fetch subcategories of a specific main category
     */ async findSubCategories(mainCategory) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const products = await this.prisma.product.findMany({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: {
                    not: null
                }
            },
            select: {
                subCategory: true
            },
            distinct: [
                'subCategory'
            ]
        });
        const subCategories = products.map((p)=>p.subCategory).filter(Boolean).sort((a, b)=>a.localeCompare(b, 'tr'));
        return {
            mainCategory: decodedMainCategory,
            subCategories
        };
    }
    /**
     * Add a subcategory to a main category (through a placeholder product)
     */ async addSubCategory(mainCategory, subCategory) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const decodedSubCategory = decodeURIComponent(subCategory);
        const existingProduct = await this.prisma.product.findFirst({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory
            }
        });
        if (existingProduct) {
            return {
                message: `This subcategory already exists: ${decodedSubCategory}`,
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
                exists: true
            };
        }
        try {
            const timestamp = Date.now().toString().slice(-6);
            const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${decodedSubCategory.substring(0, 3).toUpperCase()}-${timestamp}`;
            await this.prisma.product.create({
                data: {
                    tenantId: _clsservice.ClsService.getTenantId() || '',
                    code,
                    name: `[Category Definition] ${decodedMainCategory} - ${decodedSubCategory}`,
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
                    mainCategory: decodedMainCategory,
                    subCategory: decodedSubCategory,
                    isCategoryOnly: true,
                    description: 'This record is created only for category definition. It is not a real product.'
                }
            });
            return {
                message: `Subcategory "${decodedSubCategory}" added under main category "${decodedMainCategory}" successfully`,
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
                exists: false
            };
        } catch (error) {
            if (error.code === 'P2002') {
                const timestamp = Date.now().toString();
                const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${decodedSubCategory.substring(0, 3).toUpperCase()}-${timestamp}`;
                await this.prisma.product.create({
                    data: {
                        tenantId: _clsservice.ClsService.getTenantId() || '',
                        code,
                        name: `[Category Definition] ${decodedMainCategory} - ${decodedSubCategory}`,
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
                        mainCategory: decodedMainCategory,
                        subCategory: decodedSubCategory,
                        isCategoryOnly: true,
                        description: 'This record is created only for category definition. It is not a real product.'
                    }
                });
                return {
                    message: `Subcategory "${decodedSubCategory}" added under main category "${decodedMainCategory}" successfully`,
                    mainCategory: decodedMainCategory,
                    subCategory: decodedSubCategory,
                    exists: false
                };
            }
            throw new _common.BadRequestException(`Error adding subcategory: ${error.message}`);
        }
    }
    /**
     * Add a main category
     */ async addMainCategory(mainCategory) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const existingProduct = await this.prisma.product.findFirst({
            where: {
                mainCategory: decodedMainCategory
            }
        });
        if (existingProduct) {
            throw new _common.BadRequestException(`This main category already exists: ${decodedMainCategory}`);
        }
        try {
            const timestamp = Date.now().toString().slice(-6);
            const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${timestamp}`;
            await this.prisma.product.create({
                data: {
                    tenantId: _clsservice.ClsService.getTenantId() || '',
                    code,
                    name: `[Main Category Definition] ${decodedMainCategory}`,
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
                    mainCategory: decodedMainCategory,
                    subCategory: null,
                    isCategoryOnly: true,
                    description: 'This record is created only for main category definition. It is not a real product.'
                }
            });
            return {
                message: `Main category "${decodedMainCategory}" added successfully`,
                mainCategory: decodedMainCategory,
                exists: false
            };
        } catch (error) {
            if (error.code === 'P2002') {
                const timestamp = Date.now().toString();
                const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${timestamp}`;
                await this.prisma.product.create({
                    data: {
                        tenantId: _clsservice.ClsService.getTenantId() || '',
                        code,
                        name: `[Main Category Definition] ${decodedMainCategory}`,
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
                        mainCategory: decodedMainCategory,
                        subCategory: null,
                        isCategoryOnly: true,
                        description: 'This record is created only for main category definition. It is not a real product.'
                    }
                });
                return {
                    message: `Main category "${decodedMainCategory}" added successfully`,
                    mainCategory: decodedMainCategory,
                    exists: false
                };
            }
            throw new _common.BadRequestException(`Error adding main category: ${error.message}`);
        }
    }
    /**
     * Remove subcategory
     */ async removeSubCategory(mainCategory, subCategory) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const decodedSubCategory = decodeURIComponent(subCategory);
        const productCount = await this.prisma.product.count({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory
            }
        });
        if (productCount === 0) {
            throw new _common.NotFoundException(`Subcategory not found: ${decodedSubCategory}`);
        }
        await this.prisma.product.updateMany({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory
            },
            data: {
                subCategory: null
            }
        });
        return {
            message: `Subcategory "${decodedSubCategory}" removed successfully from ${productCount} products`,
            mainCategory: decodedMainCategory,
            subCategory: decodedSubCategory,
            affectedProductCount: productCount
        };
    }
    /**
     * Remove main category
     */ async removeMainCategory(mainCategory) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const productCount = await this.prisma.product.count({
            where: {
                mainCategory: decodedMainCategory
            }
        });
        if (productCount === 0) {
            throw new _common.NotFoundException(`Main category not found: ${decodedMainCategory}`);
        }
        await this.prisma.product.updateMany({
            where: {
                mainCategory: decodedMainCategory
            },
            data: {
                mainCategory: null,
                subCategory: null
            }
        });
        return {
            message: `Main category "${decodedMainCategory}" removed successfully from ${productCount} products`,
            mainCategory: decodedMainCategory,
            affectedProductCount: productCount
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
CategoryService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CategoryService);

//# sourceMappingURL=category.service.js.map