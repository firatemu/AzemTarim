"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminReportService", {
    enumerable: true,
    get: function() {
        return B2bAdminReportService;
    }
});
const _common = require("@nestjs/common");
const _pdfmake = /*#__PURE__*/ _interop_require_default(require("pdfmake"));
const _excelonesheetutil = require("../../../common/utils/excel-one-sheet.util");
const _prismaservice = require("../../../common/prisma.service");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
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
let B2bAdminReportService = class B2bAdminReportService {
    dateWhere(range) {
        if (!range?.from && !range?.to) return undefined;
        const w = {};
        if (range.from) w.gte = new Date(range.from);
        if (range.to) w.lte = new Date(range.to);
        return w;
    }
    async ordersSummary(tenantId, range) {
        const createdAt = this.dateWhere(range);
        const where = {
            tenantId
        };
        if (createdAt) where.createdAt = createdAt;
        const [agg, count] = await Promise.all([
            this.prisma.b2BOrder.aggregate({
                where,
                _sum: {
                    totalFinalPrice: true
                },
                _avg: {
                    totalFinalPrice: true
                }
            }),
            this.prisma.b2BOrder.count({
                where
            })
        ]);
        const revenue = Number(agg._sum.totalFinalPrice ?? 0);
        const avg = count > 0 ? revenue / count : 0;
        return {
            totalOrders: count,
            revenue,
            avgOrderValue: avg
        };
    }
    async byCustomer(tenantId, range, p) {
        const page = p.page ?? 1;
        const limit = p.limit ?? 25;
        const skip = (page - 1) * limit;
        const createdAt = this.dateWhere(range);
        const orderWhere = {
            tenantId
        };
        if (createdAt) orderWhere.createdAt = createdAt;
        const grouped = await this.prisma.b2BOrder.groupBy({
            by: [
                'customerId'
            ],
            where: orderWhere,
            _count: {
                _all: true
            },
            _sum: {
                totalFinalPrice: true
            }
        });
        const total = grouped.length;
        const slice = grouped.slice(skip, skip + limit);
        const customerIds = slice.map((g)=>g.customerId);
        const customers = await this.prisma.b2BCustomer.findMany({
            where: {
                tenantId,
                id: {
                    in: customerIds
                }
            }
        });
        const byId = new Map(customers.map((c)=>[
                c.id,
                c
            ]));
        const data = slice.map((g)=>({
                customerId: g.customerId,
                customerName: byId.get(g.customerId)?.name ?? g.customerId,
                orderCount: g._count._all,
                revenue: Number(g._sum.totalFinalPrice ?? 0)
            }));
        return {
            data,
            total,
            page,
            limit
        };
    }
    async byProduct(tenantId, range, p) {
        const page = p.page ?? 1;
        const limit = p.limit ?? 25;
        const skip = (page - 1) * limit;
        const createdAt = this.dateWhere(range);
        const itemWhere = {
            tenantId
        };
        if (createdAt) {
            itemWhere.order = {
                createdAt
            };
        }
        const items = await this.prisma.b2BOrderItem.findMany({
            where: itemWhere,
            select: {
                productId: true,
                quantity: true,
                finalPrice: true,
                stockCode: true,
                productName: true
            }
        });
        const map = new Map();
        for (const it of items){
            const key = it.productId;
            const cur = map.get(key) ?? {
                productId: it.productId,
                stockCode: it.stockCode,
                productName: it.productName,
                qty: 0,
                revenue: 0
            };
            cur.qty += it.quantity;
            // finalPrice: satır birim fiyatı varsayımı (satır tutarı = adet × birim)
            cur.revenue += Number(it.finalPrice) * it.quantity;
            map.set(key, cur);
        }
        const rows = [
            ...map.values()
        ].sort((a, b)=>b.revenue - a.revenue);
        const total = rows.length;
        const data = rows.slice(skip, skip + limit);
        return {
            data,
            total,
            page,
            limit
        };
    }
    async bySalesperson(tenantId, range, p) {
        const page = p.page ?? 1;
        const limit = p.limit ?? 25;
        const skip = (page - 1) * limit;
        const createdAt = this.dateWhere(range);
        const orderWhere = {
            tenantId,
            salespersonId: {
                not: null
            }
        };
        if (createdAt) orderWhere.createdAt = createdAt;
        const grouped = await this.prisma.b2BOrder.groupBy({
            by: [
                'salespersonId'
            ],
            where: orderWhere,
            _count: {
                _all: true
            },
            _sum: {
                totalFinalPrice: true
            }
        });
        const withSp = grouped.filter((g)=>g.salespersonId != null);
        const total = withSp.length;
        const slice = withSp.slice(skip, skip + limit);
        const ids = slice.map((g)=>g.salespersonId);
        const sps = await this.prisma.b2BSalesperson.findMany({
            where: {
                tenantId,
                id: {
                    in: ids
                }
            }
        });
        const byId = new Map(sps.map((s)=>[
                s.id,
                s
            ]));
        const customerCounts = await Promise.all(ids.map((id)=>this.prisma.b2BSalespersonCustomer.count({
                where: {
                    salespersonId: id
                }
            })));
        const ccMap = new Map(ids.map((id, i)=>[
                id,
                customerCounts[i]
            ]));
        const data = slice.map((g)=>{
            const spId = g.salespersonId;
            return {
                salespersonId: spId,
                name: byId.get(spId)?.name ?? spId,
                orderCount: g._count._all,
                revenue: Number(g._sum.totalFinalPrice ?? 0),
                assignedCustomerCount: ccMap.get(spId) ?? 0
            };
        });
        return {
            data,
            total,
            page,
            limit
        };
    }
    async collections(tenantId, range, p) {
        const page = p.page ?? 1;
        const limit = p.limit ?? 25;
        const skip = (page - 1) * limit;
        const dateF = this.dateWhere(range);
        const customers = await this.prisma.b2BCustomer.findMany({
            where: {
                tenantId
            },
            select: {
                id: true,
                name: true,
                erpAccountId: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        const rows = [];
        for (const c of customers){
            const mWhere = {
                tenantId,
                customerId: c.id
            };
            if (dateF) mWhere.date = dateF;
            const [sums, last] = await Promise.all([
                this.prisma.b2BAccountMovement.aggregate({
                    where: mWhere,
                    _sum: {
                        debit: true,
                        credit: true
                    }
                }),
                this.prisma.b2BAccountMovement.findFirst({
                    where: mWhere,
                    orderBy: {
                        date: 'desc'
                    }
                })
            ]);
            rows.push({
                customerId: c.id,
                name: c.name,
                totalDebit: Number(sums._sum.debit ?? 0),
                totalCredit: Number(sums._sum.credit ?? 0),
                latestBalance: last ? Number(last.balance) : null
            });
        }
        const total = rows.length;
        const data = rows.slice(skip, skip + limit);
        return {
            data,
            total,
            page,
            limit
        };
    }
    async excelBuffer(sheetName, headers, rows) {
        return (0, _excelonesheetutil.excelOneSheetBuffer)(sheetName, headers, rows);
    }
    /** B2B admin — FIFO cari önizleme PDF (basit tablo) */ async fifoPreviewPdfBuffer(payload) {
        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64')
            }
        };
        const printer = new _pdfmake.default(fonts);
        const headerRow = [
            {
                text: 'Tarih',
                style: 'th'
            },
            {
                text: 'Tip',
                style: 'th'
            },
            {
                text: 'Borç',
                style: 'th',
                alignment: 'right'
            },
            {
                text: 'Alacak',
                style: 'th',
                alignment: 'right'
            },
            {
                text: 'Vade',
                style: 'th'
            },
            {
                text: 'Kalan',
                style: 'th',
                alignment: 'right'
            },
            {
                text: 'Gecikme',
                style: 'th'
            }
        ];
        const body = [
            headerRow
        ];
        for (const m of payload.movements){
            body.push([
                m.date.slice(0, 10),
                m.type,
                m.debit,
                m.credit,
                m.dueDate ? m.dueDate.slice(0, 10) : '—',
                m.remainingInvoiceDebit ?? '—',
                m.isPastDue ? 'Evet' : 'Hayır'
            ]);
        }
        const doc = {
            pageSize: 'A4',
            pageMargins: [
                40,
                40,
                40,
                40
            ],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 8
            },
            styles: {
                th: {
                    bold: true
                },
                title: {
                    fontSize: 14,
                    bold: true
                }
            },
            content: [
                {
                    text: 'B2B FIFO — Cari önizleme',
                    style: 'title'
                },
                {
                    text: `${payload.customer.name} (${payload.customer.email})`,
                    margin: [
                        0,
                        4,
                        0,
                        2
                    ]
                },
                {
                    text: `Referans: ${payload.asOf}  |  Vade günü: ${payload.vatDays}`,
                    margin: [
                        0,
                        0,
                        0,
                        6
                    ]
                },
                {
                    text: [
                        `Borç: ${payload.summary.totalDebit}  `,
                        `Alacak: ${payload.summary.totalCredit}  `,
                        `Bakiye: ${payload.summary.balance}  `,
                        `Gecikmiş: ${payload.summary.overdueAmount}  `,
                        `(Satır: ${payload.summary.pastDueMovementCount})`
                    ].join(''),
                    margin: [
                        0,
                        0,
                        0,
                        10
                    ]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [
                            'auto',
                            '*',
                            'auto',
                            'auto',
                            'auto',
                            'auto',
                            'auto'
                        ],
                        body
                    }
                }
            ]
        };
        return await new Promise((resolve, reject)=>{
            const pdf = printer.createPdfKitDocument(doc);
            const chunks = [];
            pdf.on('data', (c)=>chunks.push(c));
            pdf.on('end', ()=>resolve(Buffer.concat(chunks)));
            pdf.on('error', reject);
            pdf.end();
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bAdminReportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdminReportService);

//# sourceMappingURL=b2b-admin-report.service.js.map