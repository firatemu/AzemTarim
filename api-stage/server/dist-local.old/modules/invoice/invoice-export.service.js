"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceExportService", {
    enumerable: true,
    get: function() {
        return InvoiceExportService;
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
let InvoiceExportService = class InvoiceExportService {
    async generateSalesInvoiceExcel(invoiceType, startDate, endDate, status, search, satisElemaniId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (invoiceType) where.invoiceType = invoiceType;
        if (satisElemaniId) where.salesAgentId = satisElemaniId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            }
        }
        if (status) {
            const mapStatus = (s)=>{
                const v = s.trim();
                const trToEn = {
                    OPEN: 'OPEN',
                    ONAYLANDI: 'APPROVED',
                    KISMEN_ODENDI: 'PARTIALLY_PAID',
                    CLOSED: 'CLOSED',
                    CANCELLATION: 'CANCELLED'
                };
                return trToEn[v] || v;
            };
            const statuslar = status.split(',').map(mapStatus);
            where.status = {
                in: statuslar
            };
        }
        if (search) {
            where.OR = [
                {
                    invoiceNo: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const faturalar = await this.prisma.invoice.findMany({
            where,
            include: {
                account: {
                    select: {
                        title: true,
                        code: true
                    }
                },
                salesAgent: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Faturalar');
        const statusLabels = {
            OPEN: 'Açık',
            APPROVED: 'Onaylandı',
            PARTIALLY_PAID: 'Kısmen Ödendi',
            CLOSED: 'Kapalı',
            CANCELLED: 'İptal',
            DRAFT: 'Taslak'
        };
        worksheet.columns = [
            {
                header: 'Invoice No',
                key: 'faturaNo',
                width: 18
            },
            {
                header: 'Tarih',
                key: 'date',
                width: 14
            },
            {
                header: 'Cari Kodu',
                key: 'code',
                width: 14
            },
            {
                header: 'Cari Unvan',
                key: 'title',
                width: 30
            },
            {
                header: 'Vade',
                key: 'vade',
                width: 14
            },
            {
                header: 'Ara Toplam',
                key: 'totalAmount',
                width: 16
            },
            {
                header: 'KDV',
                key: 'kdvTutar',
                width: 14
            },
            {
                header: 'Genel Toplam',
                key: 'grandTotal',
                width: 18
            },
            {
                header: 'Döviz',
                key: 'dovizCinsi',
                width: 10
            },
            {
                header: 'Kur',
                key: 'dovizKuru',
                width: 12
            },
            {
                header: 'Döviz Toplam',
                key: 'dovizToplam',
                width: 18
            },
            {
                header: 'Durum',
                key: 'status',
                width: 14
            },
            {
                header: 'Satış Elemanı',
                key: 'satisElemani',
                width: 20
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
        faturalar.forEach((f)=>{
            worksheet.addRow({
                faturaNo: f.invoiceNo,
                date: f.date ? new Date(f.date).toLocaleDateString('tr-TR') : '',
                code: f.account?.code || '',
                title: f.account?.title || '',
                vade: f.dueDate ? new Date(f.dueDate).toLocaleDateString('tr-TR') : '',
                totalAmount: Number(f.totalAmount),
                kdvTutar: Number(f.vatAmount),
                grandTotal: Number(f.grandTotal),
                dovizCinsi: f.dovizCinsi || 'TRY',
                dovizKuru: f.dovizKuru ? Number(f.dovizKuru) : 1,
                dovizToplam: f.dovizToplam ? Number(f.dovizToplam) : Number(f.grandTotal),
                status: statusLabels[f.status] || f.status,
                satisElemani: f.salesAgent?.fullName || ''
            });
        });
        // Number formatting for currency columns
        [
            'totalAmount',
            'kdvTutar',
            'grandTotal'
        ].forEach((key)=>{
            const col = worksheet.getColumn(key);
            col.numFmt = '#,##0.00 ₺';
        });
        // Add totals row
        const lastRow = faturalar.length + 2;
        const totalsRow = worksheet.getRow(lastRow);
        totalsRow.getCell('title').value = 'TOPLAM';
        totalsRow.getCell('title').font = {
            bold: true
        };
        totalsRow.getCell('totalAmount').value = {
            formula: `SUM(F2:F${lastRow - 1})`
        };
        totalsRow.getCell('kdvTutar').value = {
            formula: `SUM(G2:G${lastRow - 1})`
        };
        totalsRow.getCell('grandTotal').value = {
            formula: `SUM(H2:H${lastRow - 1})`
        };
        totalsRow.font = {
            bold: true
        };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
InvoiceExportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], InvoiceExportService);

//# sourceMappingURL=invoice-export.service.js.map