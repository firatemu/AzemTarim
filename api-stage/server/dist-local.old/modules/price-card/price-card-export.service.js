"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PriceCardExportService", {
    enumerable: true,
    get: function() {
        return PriceCardExportService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
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
let PriceCardExportService = class PriceCardExportService {
    async generateExcel(type, status, search) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (type) where.type = type;
        if (status) {
            where.isActive = status === 'ACTIVE';
        }
        if (search) {
            where.OR = [
                {
                    product: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    product: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const cards = await this.prisma.priceCard.findMany({
            where,
            include: {
                product: {
                    select: {
                        code: true,
                        name: true,
                        brand: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Fiyat Kartları');
        const statusLabels = {
            true: 'Aktif',
            false: 'Pasif'
        };
        const typeLabels = {
            SALE: 'Satış',
            PURCHASE: 'Alış',
            CAMPAIGN: 'Kampanya',
            LIST: 'Liste'
        };
        worksheet.columns = [
            {
                header: 'Stok Kodu',
                key: 'code',
                width: 20
            },
            {
                header: 'Stok Adı',
                key: 'name',
                width: 35
            },
            {
                header: 'Marka',
                key: 'brand',
                width: 15
            },
            {
                header: 'Tip',
                key: 'type',
                width: 12
            },
            {
                header: 'Fiyat (KDV Hariç)',
                key: 'price',
                width: 18
            },
            {
                header: 'Döviz',
                key: 'currency',
                width: 10
            },
            {
                header: 'KDV %',
                key: 'vatRate',
                width: 10
            },
            {
                header: 'Min. Miktar',
                key: 'minQuantity',
                width: 12
            },
            {
                header: 'Geçerlilik Başlangıç',
                key: 'effectiveFrom',
                width: 20
            },
            {
                header: 'Geçerlilik Bitiş',
                key: 'effectiveTo',
                width: 20
            },
            {
                header: 'Durum',
                key: 'status',
                width: 12
            },
            {
                header: 'Not',
                key: 'note',
                width: 30
            }
        ];
        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = {
            bold: true,
            color: {
                argb: 'FFFFFFFF'
            }
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FF1976D2'
            }
        };
        headerRow.alignment = {
            horizontal: 'center'
        };
        // Add data
        cards.forEach((c)=>{
            worksheet.addRow({
                code: c.product?.code || '',
                name: c.product?.name || '',
                brand: c.product?.brand || '',
                type: typeLabels[c.type] || c.type,
                price: Number(c.price),
                currency: c.currency,
                vatRate: Number(c.vatRate),
                minQuantity: Number(c.minQuantity),
                effectiveFrom: c.effectiveFrom ? new Date(c.effectiveFrom).toLocaleDateString('tr-TR') : '',
                effectiveTo: c.effectiveTo ? new Date(c.effectiveTo).toLocaleDateString('tr-TR') : 'Süresiz',
                status: statusLabels[String(c.isActive)],
                note: c.note || ''
            });
        });
        // Number formatting
        worksheet.getColumn('price').numFmt = '#,##0.00';
        worksheet.getColumn('vatRate').numFmt = '0"%"';
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
PriceCardExportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PriceCardExportService);

//# sourceMappingURL=price-card-export.service.js.map