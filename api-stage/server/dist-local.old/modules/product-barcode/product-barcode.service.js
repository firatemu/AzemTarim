"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductBarcodeService", {
    enumerable: true,
    get: function() {
        return ProductBarcodeService;
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
let ProductBarcodeService = class ProductBarcodeService {
    async findByProduct(productId) {
        return this.prisma.productBarcode.findMany({
            where: {
                productId
            },
            orderBy: [
                {
                    isPrimary: 'desc'
                },
                {
                    createdAt: 'asc'
                }
            ]
        });
    }
    async findByBarcode(barcode) {
        const productBarcode = await this.prisma.productBarcode.findUnique({
            where: {
                barcode
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        brand: true
                    }
                }
            }
        });
        if (!productBarcode) {
            throw new _common.NotFoundException('Product not found');
        }
        return {
            ...productBarcode,
            product: productBarcode.product ? {
                ...productBarcode.product,
                // Backward-compatible aliases
                code: productBarcode.product.code,
                name: productBarcode.product.name,
                marka: productBarcode.product.brand
            } : null
        };
    }
    async create(createDto) {
        // Ürün kontrolü
        const product = await this.prisma.product.findUnique({
            where: {
                id: createDto.productId
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found');
        }
        // Barkod benzersizliği kontrolü
        const existing = await this.prisma.productBarcode.findUnique({
            where: {
                barcode: createDto.barcode
            }
        });
        if (existing) {
            throw new _common.BadRequestException('Bu barkod zaten kullanılıyor');
        }
        // Eğer birincil barkod olarak işaretleniyorsa, diğer birincil barkodları kaldır
        if (createDto.isPrimary) {
            await this.prisma.productBarcode.updateMany({
                where: {
                    productId: createDto.productId,
                    isPrimary: true
                },
                data: {
                    isPrimary: false
                }
            });
        }
        return this.prisma.productBarcode.create({
            data: {
                productId: createDto.productId,
                barcode: createDto.barcode,
                symbology: createDto.symbology,
                isPrimary: createDto.isPrimary ?? false
            }
        });
    }
    async remove(id) {
        const productBarcode = await this.prisma.productBarcode.findUnique({
            where: {
                id
            }
        });
        if (!productBarcode) {
            throw new _common.NotFoundException('Barcode not found');
        }
        return this.prisma.productBarcode.delete({
            where: {
                id
            }
        });
    }
    async setPrimary(id) {
        const productBarcode = await this.prisma.productBarcode.findUnique({
            where: {
                id
            }
        });
        if (!productBarcode) {
            throw new _common.NotFoundException('Barcode not found');
        }
        // Diğer birincil barkodları kaldır
        await this.prisma.productBarcode.updateMany({
            where: {
                productId: productBarcode.productId,
                isPrimary: true
            },
            data: {
                isPrimary: false
            }
        });
        // Bu barkodu birincil yap
        return this.prisma.productBarcode.update({
            where: {
                id
            },
            data: {
                isPrimary: true
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
ProductBarcodeService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ProductBarcodeService);

//# sourceMappingURL=product-barcode.service.js.map