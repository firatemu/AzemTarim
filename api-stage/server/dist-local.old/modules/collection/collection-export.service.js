"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CollectionExportService", {
    enumerable: true,
    get: function() {
        return CollectionExportService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
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
let CollectionExportService = class CollectionExportService {
    async generateExcel(tip, paymentMethod, accountId, startDate, endDate, cashboxId, bankAccountId, companyCreditCardId) {
        const where = {
            deletedAt: null,
            OR: [
                {
                    invoiceId: null
                },
                {
                    invoice: {
                        deletedAt: null
                    }
                }
            ]
        };
        if (tip) {
            where.type = tip;
        }
        if (paymentMethod) {
            where.paymentType = paymentMethod;
        }
        if (accountId) {
            where.accountId = accountId;
        }
        if (cashboxId) {
            where.cashboxId = cashboxId;
        }
        if (bankAccountId) {
            where.bankAccountId = bankAccountId;
        }
        if (companyCreditCardId) {
            where.companyCreditCardId = companyCreditCardId;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.date.lte = endOfDay;
            }
        }
        const collectionlar = await this.prisma.collection.findMany({
            where,
            include: {
                account: true,
                cashbox: true,
                bankAccount: {
                    include: {
                        bank: true
                    }
                },
                companyCreditCard: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Collection Raporu');
        // Başlık bilgileri
        worksheet.mergeCells('A1:J1');
        worksheet.getCell('A1').value = tip === 'COLLECTION' ? 'TAHSİLAT RAPORU' : tip === 'PAYMENT' ? 'ÖDEME RAPORU' : 'TAHSİLAT & ÖDEME RAPORU';
        worksheet.getCell('A1').font = {
            bold: true,
            size: 16
        };
        worksheet.getCell('A1').alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        worksheet.getRow(1).height = 30;
        // Filtre bilgileri
        let row = 3;
        if (startDate || endDate) {
            worksheet.getCell(`A${row}`).value = 'Tarih Aralığı:';
            worksheet.getCell(`B${row}`).value = `${startDate || 'Başlangıç'} - ${endDate || 'Bitiş'}`;
            row++;
        }
        if (tip) {
            worksheet.getCell(`A${row}`).value = 'Tip:';
            worksheet.getCell(`B${row}`).value = tip === 'COLLECTION' ? 'Collection' : 'Ödeme';
            row++;
        }
        if (paymentMethod) {
            worksheet.getCell(`A${row}`).value = 'Ödeme Tipi:';
            worksheet.getCell(`B${row}`).value = this.getOdemeTipiText(paymentMethod);
            row++;
        }
        row += 2;
        // Tablo başlıkları
        const headers = [
            'Tarih',
            'Cari Kodu',
            'Cari Ünvan',
            'Tip',
            'Ödeme Tipi',
            'Kasa',
            'Kasa Tipi',
            'Banka',
            'Kart Adı',
            'Tutar',
            'Açıklama'
        ];
        worksheet.getRow(row).values = headers;
        worksheet.getRow(row).font = {
            bold: true
        };
        worksheet.getRow(row).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FFE0E0E0'
            }
        };
        // Veriler
        let currentRow = row + 1;
        let toplamCollection = 0;
        let totalPayment = 0;
        collectionlar.forEach((collection)=>{
            const date = new Date(collection.date).toLocaleDateString('tr-TR');
            const code = collection.account?.code || '-';
            const title = collection.account?.title || '-';
            const tip = collection.type === 'COLLECTION' ? 'Collection' : 'Ödeme';
            const paymentMethod = this.getOdemeTipiText(collection.paymentType);
            const kasa = collection.cashbox?.name || 'Çapraz Ödeme';
            const kasaTipi = collection.cashbox ? this.getKasaTipiText(collection.cashbox.type) : '-';
            const banka = collection.companyCreditCard?.bankName || collection.bankAccount?.bank?.name || '-';
            const kartAdi = collection.companyCreditCard?.name || collection.bankAccount?.name || '-';
            const amount = parseFloat(collection.amount.toString());
            const notes = collection.notes || '-';
            if (collection.type === 'COLLECTION') {
                toplamCollection += amount;
            } else {
                totalPayment += amount;
            }
            worksheet.getRow(currentRow).values = [
                date,
                code,
                title,
                tip,
                paymentMethod,
                kasa,
                kasaTipi,
                banka,
                kartAdi,
                amount,
                notes
            ];
            // Tutar hücresini renklendir
            const amountCell = worksheet.getCell(`J${currentRow}`);
            if (collection.type === 'COLLECTION') {
                amountCell.font = {
                    color: {
                        argb: 'FF008000'
                    },
                    bold: true
                };
            } else {
                amountCell.font = {
                    color: {
                        argb: 'FFFF0000'
                    },
                    bold: true
                };
            }
            currentRow++;
        });
        // Özet bilgileri
        currentRow += 2;
        worksheet.getCell(`A${currentRow}`).value = 'ÖZET';
        worksheet.getCell(`A${currentRow}`).font = {
            bold: true,
            size: 14
        };
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Toplam Collection:';
        worksheet.getCell(`B${currentRow}`).value = toplamCollection;
        worksheet.getCell(`B${currentRow}`).font = {
            color: {
                argb: 'FF008000'
            },
            bold: true
        };
        worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Toplam Ödeme:';
        worksheet.getCell(`B${currentRow}`).value = totalPayment;
        worksheet.getCell(`B${currentRow}`).font = {
            color: {
                argb: 'FFFF0000'
            },
            bold: true
        };
        worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Net Tutar:';
        worksheet.getCell(`B${currentRow}`).value = toplamCollection - totalPayment;
        worksheet.getCell(`B${currentRow}`).font = {
            bold: true
        };
        worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Toplam Kayıt:';
        worksheet.getCell(`B${currentRow}`).value = collectionlar.length;
        // Sütun genişlikleri
        worksheet.columns = [
            {
                width: 12
            },
            {
                width: 15
            },
            {
                width: 30
            },
            {
                width: 12
            },
            {
                width: 15
            },
            {
                width: 20
            },
            {
                width: 15
            },
            {
                width: 15
            },
            {
                width: 15
            },
            {
                width: 15
            },
            {
                width: 40
            }
        ];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async generatePdf(tip, paymentMethod, accountId, startDate, endDate, cashboxId, bankAccountId, companyCreditCardId) {
        const where = {
            deletedAt: null,
            OR: [
                {
                    invoiceId: null
                },
                {
                    invoice: {
                        deletedAt: null
                    }
                }
            ]
        };
        if (tip) {
            where.type = tip;
        }
        if (paymentMethod) {
            where.paymentType = paymentMethod;
        }
        if (accountId) {
            where.accountId = accountId;
        }
        if (cashboxId) {
            where.cashboxId = cashboxId;
        }
        if (bankAccountId) {
            where.bankAccountId = bankAccountId;
        }
        if (companyCreditCardId) {
            where.companyCreditCardId = companyCreditCardId;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.date.lte = endOfDay;
            }
        }
        const collectionlar = await this.prisma.collection.findMany({
            where,
            include: {
                account: true,
                cashbox: true,
                bankAccount: {
                    include: {
                        bank: true
                    }
                },
                companyCreditCard: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        // PDF font tanımlamaları
        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'] || '', 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'] || '', 'base64')
            }
        };
        const printer = new (require('pdfmake'))(fonts);
        // Tablo body
        const tableBody = [];
        // Başlık satırı
        tableBody.push([
            {
                text: 'Tarih',
                style: 'tableHeader'
            },
            {
                text: 'Cari Kodu',
                style: 'tableHeader'
            },
            {
                text: 'Cari Ünvan',
                style: 'tableHeader'
            },
            {
                text: 'Tip',
                style: 'tableHeader'
            },
            {
                text: 'Kasa',
                style: 'tableHeader'
            },
            {
                text: 'Banka',
                style: 'tableHeader'
            },
            {
                text: 'Tutar',
                style: 'tableHeader',
                alignment: 'right'
            },
            {
                text: 'Açıklama',
                style: 'tableHeader'
            }
        ]);
        // Veri satırları
        let toplamCollection = 0;
        let totalPayment = 0;
        collectionlar.forEach((collection)=>{
            const date = new Date(collection.date).toLocaleDateString('tr-TR');
            const code = collection.account?.code || '-';
            const title = collection.account?.title || '-';
            const tip = collection.type === 'COLLECTION' ? 'Collection' : 'Ödeme';
            const kasa = collection.cashbox?.name || 'Çapraz Ödeme';
            const banka = collection.companyCreditCard?.bankName || collection.bankAccount?.bank?.name || '-';
            const amount = parseFloat(collection.amount.toString());
            const notes = collection.notes || '-';
            if (collection.type === 'COLLECTION') {
                toplamCollection += amount;
            } else {
                totalPayment += amount;
            }
            const amountColor = collection.type === 'COLLECTION' ? 'green' : 'red';
            tableBody.push([
                date,
                code,
                {
                    text: title,
                    fontSize: 8
                },
                tip,
                {
                    text: kasa,
                    fontSize: 8
                },
                {
                    text: banka,
                    fontSize: 8
                },
                {
                    text: amount.toFixed(2),
                    alignment: 'right',
                    color: amountColor,
                    bold: true
                },
                {
                    text: notes,
                    fontSize: 7
                }
            ]);
        });
        // Filtre bilgileri
        const filterInfo = [];
        if (startDate || endDate) {
            filterInfo.push({
                text: `Tarih Aralığı: ${startDate || 'Başlangıç'} - ${endDate || 'Bitiş'}`,
                style: 'info'
            });
        }
        if (tip) {
            filterInfo.push({
                text: `Tip: ${tip === 'COLLECTION' ? 'Collection' : 'Ödeme'}`,
                style: 'info'
            });
        }
        if (paymentMethod) {
            filterInfo.push({
                text: `Ödeme Tipi: ${this.getOdemeTipiText(paymentMethod)}`,
                style: 'info'
            });
        }
        const docDefinition = {
            content: [
                {
                    text: tip === 'COLLECTION' ? 'TAHSİLAT RAPORU' : tip === 'PAYMENT' ? 'ÖDEME RAPORU' : 'TAHSİLAT & ÖDEME RAPORU',
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: '\n'
                },
                ...filterInfo,
                {
                    text: '\n'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [
                            60,
                            60,
                            '*',
                            50,
                            60,
                            60,
                            60,
                            '*'
                        ],
                        body: tableBody
                    },
                    layout: {
                        fillColor: (rowIndex)=>rowIndex === 0 ? '#CCCCCC' : null
                    }
                },
                {
                    text: '\n'
                },
                {
                    text: 'ÖZET',
                    style: 'subheader'
                },
                {
                    text: `Toplam Collection: ${toplamCollection.toFixed(2)} TL`,
                    style: 'info',
                    color: 'green'
                },
                {
                    text: `Toplam Ödeme: ${totalPayment.toFixed(2)} TL`,
                    style: 'info',
                    color: 'red'
                },
                {
                    text: `Net Tutar: ${(toplamCollection - totalPayment).toFixed(2)} TL`,
                    style: 'info',
                    bold: true
                },
                {
                    text: `Toplam Kayıt: ${collectionlar.length}`,
                    style: 'info'
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [
                        0,
                        0,
                        0,
                        10
                    ]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [
                        0,
                        10,
                        0,
                        5
                    ]
                },
                info: {
                    fontSize: 10,
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 9,
                    color: 'black',
                    fillColor: '#CCCCCC'
                }
            },
            defaultStyle: {
                fontSize: 8
            }
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        return new Promise((resolve, reject)=>{
            pdfDoc.on('data', (chunk)=>chunks.push(chunk));
            pdfDoc.on('end', ()=>resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
    getOdemeTipiText(paymentMethod) {
        const paymentMethodMap = {
            CASH: 'Nakit',
            CREDIT_CARD: 'Kredi Kartı',
            BANK_TRANSFER: 'Havale',
            CHECK: 'Çek',
            PROMISSORY_NOTE: 'Senet',
            GIFT_CARD: 'Hediye Kartı',
            LOAN_ACCOUNT: 'Kredi Hesabı'
        };
        return paymentMethodMap[paymentMethod] || paymentMethod;
    }
    getKasaTipiText(kasaTipi) {
        const kasaTipiMap = {
            CASH: 'Nakit',
            POS: 'POS',
            COMPANY_CREDIT_CARD: 'Firma Kredi Kartı',
            BANK: 'Banka'
        };
        return kasaTipiMap[kasaTipi] || kasaTipi;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
CollectionExportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CollectionExportService);

//# sourceMappingURL=collection-export.service.js.map