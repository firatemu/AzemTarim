"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProductExportService", {
    enumerable: true,
    get: function() {
        return ProductExportService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _exceljs = /*#__PURE__*/ _interop_require_wildcard(require("exceljs"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ProductExportService = class ProductExportService {
    async generateEslesmeExcel(tenantId) {
        // Fetch all products for the tenant
        const products = await this.prisma.product.findMany({
            where: {
                tenantId,
                isCategoryOnly: {
                    not: true
                },
                isBrandOnly: {
                    not: true
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                equivalencyGroup: {
                    include: {
                        products: {
                            select: {
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Ürün Eşleşmeleri');
        // Headers
        worksheet.columns = [
            {
                header: 'Stok Kodu',
                key: 'code',
                width: 20
            },
            {
                header: 'Stok Adı',
                key: 'name',
                width: 40
            },
            {
                header: 'Marka',
                key: 'marka',
                width: 15
            },
            {
                header: 'OEM',
                key: 'oem',
                width: 20
            },
            {
                header: 'Eşleşme Durumu',
                key: 'status',
                width: 15
            },
            {
                header: 'Eşleşen Ürünler',
                key: 'eslesenler',
                width: 50
            }
        ];
        // Style headers
        worksheet.getRow(1).font = {
            bold: true
        };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FFE0E0E0'
            }
        };
        // Data
        products.forEach((product)=>{
            let status = 'Eşleşme Yok';
            let eslesenler = '';
            if (product.equivalencyGroup) {
                const digerUrunler = product.equivalencyGroup.products.filter((u)=>u.code !== product.code);
                if (digerUrunler.length > 0) {
                    status = 'Eşleşti';
                    eslesenler = digerUrunler.map((u)=>`${u.code} (${u.name})`).join(', ');
                }
            }
            const row = worksheet.addRow({
                code: product.code,
                name: product.name,
                marka: product.brand || '-',
                oem: product.oem || '-',
                status: status,
                eslesenler: eslesenler
            });
            // Conditional formatting
            if (status === 'Eşleşti') {
                row.getCell('status').font = {
                    color: {
                        argb: 'FF008000'
                    },
                    bold: true
                }; // Green
            } else {
                row.getCell('status').font = {
                    color: {
                        argb: 'FF808080'
                    }
                }; // Gray
            }
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ProductExportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ProductExportService);

//# sourceMappingURL=product-export.service.js.map