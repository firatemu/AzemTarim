"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountMovementService", {
    enumerable: true,
    get: function() {
        return AccountMovementService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _client = require("@prisma/client");
const _exceljs = /*#__PURE__*/ _interop_require_wildcard(require("exceljs"));
const _pdfmake = /*#__PURE__*/ _interop_require_default(require("pdfmake"));
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _stagingutil = require("../../common/utils/staging.util");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
let AccountMovementService = class AccountMovementService {
    async create(dto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const account = await this.prisma.account.findFirst({
            where: {
                id: dto.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!account) {
            throw new _common.NotFoundException('Account not found');
        }
        let nextBalance = Number(account.balance);
        if (dto.type === 'DEBIT') {
            nextBalance += Number(dto.amount);
        } else if (dto.type === 'CREDIT') {
            nextBalance -= Number(dto.amount);
        } else if (dto.type === 'CARRY_FORWARD' || dto.type === 'CARRY_FORWARD') {
            nextBalance = Number(dto.amount);
        }
        const movement = await this.prisma.$transaction(async (tx)=>{
            const newMovement = await tx.accountMovement.create({
                data: {
                    accountId: dto.accountId,
                    tenantId: account.tenantId,
                    type: dto.type,
                    amount: new _client.Prisma.Decimal(dto.amount),
                    balance: new _client.Prisma.Decimal(nextBalance),
                    documentType: dto.documentType,
                    documentNo: dto.documentNo,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes
                },
                include: {
                    account: true
                }
            });
            await tx.account.update({
                where: {
                    id: dto.accountId
                },
                data: {
                    balance: new _client.Prisma.Decimal(nextBalance)
                }
            });
            return newMovement;
        });
        return movement;
    }
    async findAll(accountId, skip = 0, take = 100) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const [movements, total] = await Promise.all([
            this.prisma.accountMovement.findMany({
                where: {
                    accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                include: {
                    account: true
                },
                orderBy: {
                    date: 'desc'
                },
                skip,
                take
            }),
            this.prisma.accountMovement.count({
                where: {
                    accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            })
        ]);
        return {
            data: movements,
            total
        };
    }
    async getStatement(query) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            accountId: query.accountId,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate) {
                where.date.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.date.lte = new Date(query.endDate);
            }
        }
        const [account, movements] = await Promise.all([
            this.prisma.account.findFirst({
                where: {
                    id: query.accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            }),
            this.prisma.accountMovement.findMany({
                where,
                orderBy: {
                    date: 'asc'
                }
            })
        ]);
        return {
            account,
            movements
        };
    }
    async exportExcel(query) {
        const { account, movements } = await this.getStatement(query);
        if (!account) {
            throw new _common.NotFoundException('Account not found');
        }
        const tenantSettings = await this.prisma.tenantSettings.findUnique({
            where: {
                tenantId: account.tenantId || ''
            }
        });
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Account Statement');
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
        worksheet.getCell('A1').font = {
            size: 14,
            bold: true,
            color: {
                argb: 'FF1F2937'
            }
        };
        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = 'ACCOUNT STATEMENT';
        worksheet.getCell('A2').font = {
            size: 18,
            bold: true,
            color: {
                argb: 'FF527575'
            }
        };
        worksheet.getCell('A2').alignment = {
            horizontal: 'center'
        };
        worksheet.getCell('A4').value = 'Account Title:';
        worksheet.getCell('B4').value = account.title;
        worksheet.getCell('A4').font = {
            bold: true
        };
        worksheet.getCell('A5').value = 'Account Code:';
        worksheet.getCell('B5').value = account.code;
        worksheet.getCell('A5').font = {
            bold: true
        };
        worksheet.getCell('D4').value = 'Date:';
        worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
        worksheet.getCell('D4').font = {
            bold: true
        };
        if (account.taxNumber) {
            worksheet.getCell('A6').value = 'Tax Office / Tax No:';
            worksheet.getCell('B6').value = `${account.taxOffice || ''} / ${account.taxNumber}`;
            worksheet.getCell('A6').font = {
                bold: true
            };
        }
        const totalDebt = movements.filter((h)=>h.type === 'DEBIT').reduce((sum, h)=>sum + Number(h.amount), 0);
        const totalCredit = movements.filter((h)=>h.type === 'CREDIT').reduce((sum, h)=>sum + Number(h.amount), 0);
        worksheet.getCell('A8').value = 'TOTAL DEBT';
        worksheet.getCell('B8').value = totalDebt;
        worksheet.getCell('B8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('B8').font = {
            bold: true,
            color: {
                argb: 'FFEF4444'
            }
        };
        worksheet.getCell('C8').value = 'TOTAL CREDIT';
        worksheet.getCell('D8').value = totalCredit;
        worksheet.getCell('D8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('D8').font = {
            bold: true,
            color: {
                argb: 'FF10B981'
            }
        };
        worksheet.getCell('E8').value = 'NET BALANCE';
        worksheet.getCell('F8').value = Number(account.balance);
        worksheet.getCell('F8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('F8').font = {
            bold: true
        };
        const headerRow = worksheet.addRow([]);
        const dataHeaderRow = worksheet.addRow([
            'Date',
            'Document No',
            'Notes',
            'Debt',
            'Credit',
            'Balance'
        ]);
        dataHeaderRow.font = {
            bold: true,
            color: {
                argb: 'FFFFFFFF'
            }
        };
        dataHeaderRow.eachCell((cell)=>{
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {
                    argb: 'FF527575'
                }
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle'
            };
            cell.border = {
                top: {
                    style: 'thin'
                },
                left: {
                    style: 'thin'
                },
                bottom: {
                    style: 'thin'
                },
                right: {
                    style: 'thin'
                }
            };
        });
        movements.forEach((movement, index)=>{
            const row = worksheet.addRow([
                new Date(movement.date).toLocaleDateString('tr-TR'),
                movement.documentNo || '-',
                movement.notes,
                movement.type === 'DEBIT' ? Number(movement.amount) : null,
                movement.type === 'CREDIT' ? Number(movement.amount) : null,
                Number(movement.balance)
            ]);
            row.eachCell((cell, colNumber)=>{
                if (colNumber >= 4) {
                    cell.numFmt = '#,##0.00 ₺';
                }
                cell.alignment = {
                    vertical: 'middle'
                };
                if (index % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {
                            argb: 'FFF9FAFB'
                        }
                    };
                }
                cell.border = {
                    top: {
                        style: 'thin',
                        color: {
                            argb: 'FFE5E7EB'
                        }
                    },
                    left: {
                        style: 'thin',
                        color: {
                            argb: 'FFE5E7EB'
                        }
                    },
                    bottom: {
                        style: 'thin',
                        color: {
                            argb: 'FFE5E7EB'
                        }
                    },
                    right: {
                        style: 'thin',
                        color: {
                            argb: 'FFE5E7EB'
                        }
                    }
                };
            });
            if (movement.type === 'DEBIT') row.getCell(4).font = {
                color: {
                    argb: 'FFEF4444'
                }
            };
            if (movement.type === 'CREDIT') row.getCell(5).font = {
                color: {
                    argb: 'FF10B981'
                }
            };
            row.getCell(6).font = {
                bold: true
            };
        });
        worksheet.columns = [
            {
                width: 15
            },
            {
                width: 15
            },
            {
                width: 50
            },
            {
                width: 15
            },
            {
                width: 15
            },
            {
                width: 15
            }
        ];
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async exportPdf(query) {
        const { account, movements } = await this.getStatement(query);
        if (!account) {
            throw new _common.NotFoundException('Account not found');
        }
        const tenantSettings = await this.prisma.tenantSettings.findUnique({
            where: {
                tenantId: account.tenantId || ''
            }
        });
        let logoBase64 = null;
        if (tenantSettings?.logoUrl) {
            try {
                if (tenantSettings.logoUrl.startsWith('/api/uploads/')) {
                    const fileName = tenantSettings.logoUrl.replace('/api/uploads/', '');
                    const filePath = _path.join(process.cwd(), 'uploads', fileName);
                    if (_fs.existsSync(filePath)) {
                        const buffer = _fs.readFileSync(filePath);
                        const ext = _path.extname(fileName).toLowerCase().replace('.', '');
                        logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                    }
                } else if (tenantSettings.logoUrl.startsWith('data:image')) {
                    logoBase64 = tenantSettings.logoUrl;
                } else {
                    const response = await _axios.default.get(tenantSettings.logoUrl, {
                        responseType: 'arraybuffer'
                    });
                    const buffer = Buffer.from(response.data, 'binary');
                    const ext = _path.extname(tenantSettings.logoUrl).toLowerCase().replace('.', '') || 'png';
                    logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                }
            } catch (error) {
                console.error('Error loading logo:', error);
            }
        }
        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
                italics: Buffer.from(vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64')
            }
        };
        const printer = new _pdfmake.default(fonts);
        const totalDebt = movements.filter((h)=>h.type === 'DEBIT').reduce((sum, h)=>sum + Number(h.amount), 0);
        const totalCredit = movements.filter((h)=>h.type === 'CREDIT').reduce((sum, h)=>sum + Number(h.amount), 0);
        const netBalance = Number(account.balance);
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [
                40,
                140,
                40,
                60
            ],
            header: {
                margin: [
                    40,
                    20,
                    40,
                    0
                ],
                columns: [
                    {
                        width: '*',
                        stack: [
                            logoBase64 ? {
                                image: logoBase64,
                                width: 120,
                                margin: [
                                    0,
                                    0,
                                    0,
                                    10
                                ]
                            } : {
                                text: ''
                            },
                            {
                                text: tenantSettings?.companyName || 'OTOMUHASEBE ERP',
                                style: 'companyName'
                            },
                            {
                                text: [
                                    tenantSettings?.address || '',
                                    tenantSettings?.district ? ` ${tenantSettings.district}` : '',
                                    tenantSettings?.city ? ` / ${tenantSettings.city}` : '',
                                    '\n',
                                    tenantSettings?.phone ? `Tel: ${tenantSettings.phone}` : '',
                                    tenantSettings?.email ? ` | Email: ${tenantSettings.email}` : '',
                                    tenantSettings?.website ? ` | Web: ${tenantSettings.website}` : '',
                                    '\n',
                                    tenantSettings?.taxOffice ? `Tax Office: ${tenantSettings.taxOffice}` : '',
                                    tenantSettings?.taxNumber ? ` | Tax No: ${tenantSettings.taxNumber}` : '',
                                    tenantSettings?.tcNo ? ` | National ID: ${tenantSettings.tcNo}` : ''
                                ].filter(Boolean).join(''),
                                style: 'companyAddress'
                            }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            {
                                text: 'ACCOUNT STATEMENT',
                                style: 'docTitle',
                                alignment: 'right'
                            },
                            {
                                text: `Date: ${new Date().toLocaleDateString('tr-TR')}`,
                                style: 'docDate',
                                alignment: 'right'
                            },
                            {
                                text: `Page: 1`,
                                style: 'docDate',
                                alignment: 'right',
                                margin: [
                                    0,
                                    5,
                                    0,
                                    0
                                ]
                            }
                        ]
                    }
                ]
            },
            content: [
                {
                    style: 'customerBox',
                    table: {
                        widths: [
                            'auto',
                            '*',
                            'auto',
                            'auto'
                        ],
                        body: [
                            [
                                {
                                    text: 'ACCOUNT:',
                                    style: 'labelBold',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: account.title,
                                    style: 'customerName',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: 'ACCOUNT CODE:',
                                    style: 'labelBold',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: account.code,
                                    style: 'value',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                }
                            ],
                            [
                                {
                                    text: 'TAX NO:',
                                    style: 'labelBold',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: account.taxNumber ? `${account.taxOffice || ''} / ${account.taxNumber}` : '',
                                    style: 'value',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: 'BALANCE:',
                                    style: 'labelBold',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                },
                                {
                                    text: `${Math.abs(netBalance).toLocaleString('tr-TR', {
                                        minimumFractionDigits: 2
                                    })} TL (${netBalance < 0 ? 'D' : netBalance > 0 ? 'C' : '-'})`,
                                    style: netBalance < 0 ? 'valueSuccess' : netBalance > 0 ? 'valueDanger' : 'value',
                                    border: [
                                        false,
                                        false,
                                        false,
                                        false
                                    ]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },
                {
                    style: 'summaryTable',
                    table: {
                        widths: [
                            '*',
                            '*',
                            '*'
                        ],
                        body: [
                            [
                                {
                                    text: 'TOTAL DEBT',
                                    style: 'summaryHeader',
                                    alignment: 'center',
                                    fillColor: '#fef2f2'
                                },
                                {
                                    text: 'TOTAL CREDIT',
                                    style: 'summaryHeader',
                                    alignment: 'center',
                                    fillColor: '#f0fdf4'
                                },
                                {
                                    text: 'NET BALANCE',
                                    style: 'summaryHeader',
                                    alignment: 'center',
                                    fillColor: '#f3f4f6'
                                }
                            ],
                            [
                                {
                                    text: `${totalDebt.toLocaleString('tr-TR', {
                                        minimumFractionDigits: 2
                                    })} TL`,
                                    style: 'summaryValueDanger',
                                    alignment: 'center'
                                },
                                {
                                    text: `${totalCredit.toLocaleString('tr-TR', {
                                        minimumFractionDigits: 2
                                    })} TL`,
                                    style: 'summaryValueSuccess',
                                    alignment: 'center'
                                },
                                {
                                    text: `${Math.abs(netBalance).toLocaleString('tr-TR', {
                                        minimumFractionDigits: 2
                                    })} TL ${netBalance < 0 ? '(D)' : netBalance > 0 ? '(C)' : ''}`,
                                    style: 'summaryValueBold',
                                    alignment: 'center'
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i)=>i === 0 || i === 2 ? 1 : 0,
                        vLineWidth: (i)=>i === 0 || i === 3 ? 1 : 1,
                        hLineColor: (i)=>'#e5e7eb',
                        vLineColor: (i)=>'#e5e7eb'
                    }
                },
                {
                    style: 'transactionTable',
                    table: {
                        headerRows: 1,
                        widths: [
                            'auto',
                            'auto',
                            '*',
                            'auto',
                            'auto',
                            'auto'
                        ],
                        body: [
                            [
                                {
                                    text: 'DATE',
                                    style: 'tableHeader'
                                },
                                {
                                    text: 'DOCUMENT NO',
                                    style: 'tableHeader'
                                },
                                {
                                    text: 'NOTES',
                                    style: 'tableHeader'
                                },
                                {
                                    text: 'DEBT',
                                    style: 'tableHeader',
                                    alignment: 'right'
                                },
                                {
                                    text: 'CREDIT',
                                    style: 'tableHeader',
                                    alignment: 'right'
                                },
                                {
                                    text: 'BALANCE',
                                    style: 'tableHeader',
                                    alignment: 'right'
                                }
                            ],
                            ...movements.map((h, index)=>[
                                    {
                                        text: new Date(h.date).toLocaleDateString('tr-TR'),
                                        style: 'tableCell'
                                    },
                                    {
                                        text: h.documentNo || '-',
                                        style: 'tableCell'
                                    },
                                    {
                                        text: h.notes,
                                        style: 'tableCell'
                                    },
                                    {
                                        text: h.type === 'DEBIT' ? Number(h.amount).toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2
                                        }) : '',
                                        style: 'tableCellDanger',
                                        alignment: 'right'
                                    },
                                    {
                                        text: h.type === 'CREDIT' ? Number(h.amount).toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2
                                        }) : '',
                                        style: 'tableCellSuccess',
                                        alignment: 'right'
                                    },
                                    {
                                        text: Number(h.balance).toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2
                                        }),
                                        style: 'tableCellBold',
                                        alignment: 'right'
                                    }
                                ])
                        ]
                    },
                    layout: {
                        fillColor: (rowIndex)=>{
                            return rowIndex > 0 && rowIndex % 2 === 0 ? '#f9fafb' : null;
                        },
                        hLineWidth: (i, node)=>{
                            return i === 0 || i === node.table.body.length ? 1 : 1;
                        },
                        vLineWidth: (i, node)=>{
                            return i === 0 || i === node.table.widths.length ? 1 : 1;
                        },
                        hLineColor: (i)=>'#e5e7eb',
                        vLineColor: (i)=>'#e5e7eb'
                    }
                }
            ],
            footer: (currentPage, pageCount)=>{
                return {
                    text: `Page ${currentPage} / ${pageCount}`,
                    alignment: 'center',
                    fontSize: 8,
                    color: '#6b7280',
                    margin: [
                        0,
                        10,
                        0,
                        0
                    ]
                };
            },
            styles: {
                companyName: {
                    fontSize: 16,
                    bold: true,
                    color: '#111827',
                    margin: [
                        0,
                        0,
                        0,
                        2
                    ]
                },
                companyAddress: {
                    fontSize: 8,
                    color: '#4b5563',
                    lineHeight: 1.2
                },
                docTitle: {
                    fontSize: 18,
                    bold: true,
                    color: '#527575',
                    margin: [
                        0,
                        0,
                        0,
                        2
                    ]
                },
                docDate: {
                    fontSize: 9,
                    color: '#6b7280'
                },
                customerBox: {
                    margin: [
                        0,
                        0,
                        0,
                        20
                    ]
                },
                labelBold: {
                    fontSize: 8,
                    bold: true,
                    color: '#6b7280',
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                customerName: {
                    fontSize: 10,
                    bold: true,
                    color: '#111827',
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                value: {
                    fontSize: 9,
                    color: '#111827',
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                valueSuccess: {
                    fontSize: 9,
                    bold: true,
                    color: '#059669',
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                valueDanger: {
                    fontSize: 9,
                    bold: true,
                    color: '#dc2626',
                    margin: [
                        0,
                        2,
                        0,
                        2
                    ]
                },
                summaryTable: {
                    margin: [
                        0,
                        0,
                        0,
                        20
                    ]
                },
                summaryHeader: {
                    fontSize: 8,
                    bold: true,
                    color: '#374151',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                summaryValueSuccess: {
                    fontSize: 10,
                    bold: true,
                    color: '#059669',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                summaryValueDanger: {
                    fontSize: 10,
                    bold: true,
                    color: '#dc2626',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                summaryValueBold: {
                    fontSize: 10,
                    bold: true,
                    color: '#111827',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                transactionTable: {
                    margin: [
                        0,
                        0,
                        0,
                        0
                    ]
                },
                tableHeader: {
                    fontSize: 8,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#527575',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                tableCell: {
                    fontSize: 8,
                    color: '#374151',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                tableCellBold: {
                    fontSize: 8,
                    bold: true,
                    color: '#111827',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                tableCellSuccess: {
                    fontSize: 8,
                    color: '#059669',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                },
                tableCellDanger: {
                    fontSize: 8,
                    color: '#dc2626',
                    margin: [
                        0,
                        5,
                        0,
                        5
                    ]
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
        return new Promise((resolve, reject)=>{
            try {
                const pdfDoc = printer.createPdfKitDocument(docDefinition);
                const chunks = [];
                pdfDoc.on('data', (chunk)=>chunks.push(chunk));
                pdfDoc.on('end', ()=>resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', reject);
                pdfDoc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
    async delete(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const movement = await this.prisma.accountMovement.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!movement) {
            throw new _common.NotFoundException('Movement record not found');
        }
        const account = await this.prisma.account.findFirst({
            where: {
                id: movement.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!account) {
            throw new _common.NotFoundException('Account not found');
        }
        let nextBalance = Number(account.balance);
        if (movement.type === 'DEBIT') {
            nextBalance -= Number(movement.amount);
        } else if (movement.type === 'CREDIT') {
            nextBalance += Number(movement.amount);
        }
        await this.prisma.$transaction(async (tx)=>{
            await tx.accountMovement.delete({
                where: {
                    id
                }
            });
            await tx.account.update({
                where: {
                    id: movement.accountId
                },
                data: {
                    balance: new _client.Prisma.Decimal(nextBalance)
                }
            });
        });
        return {
            message: 'Movement record deleted and balance updated'
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
AccountMovementService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], AccountMovementService);

//# sourceMappingURL=account-movement.service.js.map