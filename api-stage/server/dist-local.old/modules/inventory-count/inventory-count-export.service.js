"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InventoryCountExportService", {
    enumerable: true,
    get: function() {
        return InventoryCountExportService;
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
const PdfPrinter = require('pdfmake');
let InventoryCountExportService = class InventoryCountExportService {
    async generateExcel(inventoryCountId) {
        const inventoryCount = await this.prisma.stocktake.findUnique({
            where: {
                id: inventoryCountId
            },
            include: {
                items: {
                    include: {
                        product: true,
                        location: true
                    }
                },
                createdByUser: true,
                approvedByUser: true
            }
        });
        if (!inventoryCount) {
            throw new Error('Inventory count not found');
        }
        const workbook = new _exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Count Report');
        // Headers
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = 'INVENTORY COUNT REPORT';
        worksheet.getCell('A1').font = {
            bold: true,
            size: 16
        };
        worksheet.getCell('A1').alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        worksheet.getRow(1).height = 30;
        // Report info
        worksheet.getCell('A3').value = 'Count No:';
        worksheet.getCell('B3').value = inventoryCount.stocktakeNo;
        worksheet.getCell('A4').value = 'Type:';
        worksheet.getCell('B4').value = inventoryCount.stocktakeType === 'PRODUCT_BASED' ? 'Product Based' : 'Shelf Based';
        worksheet.getCell('A5').value = 'Date:';
        worksheet.getCell('B5').value = new Date(inventoryCount.date).toLocaleDateString('tr-TR');
        worksheet.getCell('A6').value = 'Status:';
        worksheet.getCell('B6').value = this.getStatusText(inventoryCount.status);
        worksheet.getCell('A7').value = 'Created By:';
        worksheet.getCell('B7').value = inventoryCount.createdByUser?.fullName || '-';
        if (inventoryCount.approvedByUser) {
            worksheet.getCell('A8').value = 'Approved By:';
            worksheet.getCell('B8').value = inventoryCount.approvedByUser.fullName;
            worksheet.getCell('A9').value = 'Approval Date:';
            worksheet.getCell('B9').value = inventoryCount.approvalDate ? new Date(inventoryCount.approvalDate).toLocaleDateString('tr-TR') : '-';
        }
        // Table headers
        const headerRow = inventoryCount.stocktakeType === 'SHELF_BASED' ? 11 : 11;
        const headers = inventoryCount.stocktakeType === 'SHELF_BASED' ? [
            'Shelf',
            'Product Code',
            'Product Name',
            'System Quantity',
            'Counted Quantity',
            'Difference'
        ] : [
            'Product Code',
            'Product Name',
            'System Quantity',
            'Counted Quantity',
            'Difference'
        ];
        worksheet.getRow(headerRow).values = headers;
        worksheet.getRow(headerRow).font = {
            bold: true
        };
        worksheet.getRow(headerRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
                argb: 'FFE0E0E0'
            }
        };
        // Table Data
        let currentRow = headerRow + 1;
        inventoryCount.items.forEach((item)=>{
            const rowData = inventoryCount.stocktakeType === 'SHELF_BASED' ? [
                item.location?.code || '-',
                item.product.code,
                item.product.name,
                item.systemQuantity,
                item.countedQuantity,
                item.difference
            ] : [
                item.product.code,
                item.product.name,
                item.systemQuantity,
                item.countedQuantity,
                item.difference
            ];
            worksheet.getRow(currentRow).values = rowData;
            const diffColumn = inventoryCount.stocktakeType === 'SHELF_BASED' ? 'F' : 'E';
            const diffCell = worksheet.getCell(`${diffColumn}${currentRow}`);
            if (item.difference > 0) {
                diffCell.font = {
                    color: {
                        argb: 'FF008000'
                    },
                    bold: true
                };
            } else if (item.difference < 0) {
                diffCell.font = {
                    color: {
                        argb: 'FFFF0000'
                    },
                    bold: true
                };
            }
            currentRow++;
        });
        // Summary
        currentRow += 2;
        worksheet.getCell(`A${currentRow}`).value = 'SUMMARY';
        worksheet.getCell(`A${currentRow}`).font = {
            bold: true
        };
        currentRow++;
        const totalSurplus = inventoryCount.items.filter((k)=>k.difference > 0).reduce((sum, k)=>sum + k.difference, 0);
        const totalShortage = inventoryCount.items.filter((k)=>k.difference < 0).reduce((sum, k)=>sum + Math.abs(k.difference), 0);
        worksheet.getCell(`A${currentRow}`).value = 'Total Items:';
        worksheet.getCell(`B${currentRow}`).value = inventoryCount.items.length;
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Inventory Surplus:';
        worksheet.getCell(`B${currentRow}`).value = totalSurplus;
        worksheet.getCell(`B${currentRow}`).font = {
            color: {
                argb: 'FF008000'
            },
            bold: true
        };
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = 'Inventory Shortage:';
        worksheet.getCell(`B${currentRow}`).value = totalShortage;
        worksheet.getCell(`B${currentRow}`).font = {
            color: {
                argb: 'FFFF0000'
            },
            bold: true
        };
        worksheet.columns = [
            {
                width: 20
            },
            {
                width: 20
            },
            {
                width: 40
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
    async generatePdf(inventoryCountId) {
        const inventoryCount = await this.prisma.stocktake.findUnique({
            where: {
                id: inventoryCountId
            },
            include: {
                items: {
                    include: {
                        product: true,
                        location: true
                    }
                },
                createdByUser: true,
                approvedByUser: true
            }
        });
        if (!inventoryCount) {
            throw new Error('Inventory count not found');
        }
        const fonts = {
            Roboto: {
                normal: 'node_modules/pdfmake/build/vfs_fonts.js',
                bold: 'node_modules/pdfmake/build/vfs_fonts.js'
            }
        };
        const printer = new PdfPrinter(fonts);
        const tableBody = [];
        if (inventoryCount.stocktakeType === 'SHELF_BASED') {
            tableBody.push([
                {
                    text: 'Shelf',
                    style: 'tableHeader'
                },
                {
                    text: 'Product Code',
                    style: 'tableHeader'
                },
                {
                    text: 'Product Name',
                    style: 'tableHeader'
                },
                {
                    text: 'System',
                    style: 'tableHeader',
                    alignment: 'right'
                },
                {
                    text: 'Counted',
                    style: 'tableHeader',
                    alignment: 'right'
                },
                {
                    text: 'Diff',
                    style: 'tableHeader',
                    alignment: 'right'
                }
            ]);
        } else {
            tableBody.push([
                {
                    text: 'Product Code',
                    style: 'tableHeader'
                },
                {
                    text: 'Product Name',
                    style: 'tableHeader'
                },
                {
                    text: 'System',
                    style: 'tableHeader',
                    alignment: 'right'
                },
                {
                    text: 'Counted',
                    style: 'tableHeader',
                    alignment: 'right'
                },
                {
                    text: 'Diff',
                    style: 'tableHeader',
                    alignment: 'right'
                }
            ]);
        }
        inventoryCount.items.forEach((item)=>{
            const diffColor = item.difference > 0 ? 'green' : item.difference < 0 ? 'red' : 'black';
            if (inventoryCount.stocktakeType === 'SHELF_BASED') {
                tableBody.push([
                    item.location?.code || '-',
                    item.product.code,
                    item.product.name,
                    {
                        text: item.systemQuantity.toString(),
                        alignment: 'right'
                    },
                    {
                        text: item.countedQuantity.toString(),
                        alignment: 'right'
                    },
                    {
                        text: item.difference > 0 ? `+${item.difference}` : item.difference.toString(),
                        alignment: 'right',
                        color: diffColor,
                        bold: true
                    }
                ]);
            } else {
                tableBody.push([
                    item.product.code,
                    item.product.name,
                    {
                        text: item.systemQuantity.toString(),
                        alignment: 'right'
                    },
                    {
                        text: item.countedQuantity.toString(),
                        alignment: 'right'
                    },
                    {
                        text: item.difference > 0 ? `+${item.difference}` : item.difference.toString(),
                        alignment: 'right',
                        color: diffColor,
                        bold: true
                    }
                ]);
            }
        });
        const totalSurplus = inventoryCount.items.filter((k)=>k.difference > 0).reduce((sum, k)=>sum + k.difference, 0);
        const totalShortage = inventoryCount.items.filter((k)=>k.difference < 0).reduce((sum, k)=>sum + Math.abs(k.difference), 0);
        const rightStack = [
            {
                text: `Created By: ${inventoryCount.createdByUser?.fullName || '-'}`,
                style: 'info'
            }
        ];
        if (inventoryCount.approvedByUser) {
            rightStack.push({
                text: `Approved By: ${inventoryCount.approvedByUser.fullName}`,
                style: 'info'
            });
        }
        if (inventoryCount.approvalDate) {
            rightStack.push({
                text: `Approval Date: ${new Date(inventoryCount.approvalDate).toLocaleDateString('tr-TR')}`,
                style: 'info'
            });
        }
        const docDefinition = {
            content: [
                {
                    text: 'INVENTORY COUNT REPORT',
                    style: 'header',
                    alignment: 'center'
                },
                {
                    text: '\n'
                },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    text: `Count No: ${inventoryCount.stocktakeNo}`,
                                    style: 'info'
                                },
                                {
                                    text: `Type: ${inventoryCount.stocktakeType === 'PRODUCT_BASED' ? 'Product Based' : 'Shelf Based'}`,
                                    style: 'info'
                                },
                                {
                                    text: `Date: ${new Date(inventoryCount.date).toLocaleDateString('tr-TR')}`,
                                    style: 'info'
                                },
                                {
                                    text: `Status: ${this.getStatusText(inventoryCount.status)}`,
                                    style: 'info'
                                }
                            ]
                        },
                        {
                            width: '*',
                            stack: rightStack
                        }
                    ]
                },
                {
                    text: '\n'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: inventoryCount.stocktakeType === 'SHELF_BASED' ? [
                            60,
                            80,
                            '*',
                            50,
                            50,
                            50
                        ] : [
                            80,
                            '*',
                            50,
                            50,
                            50
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
                    text: 'SUMMARY',
                    style: 'subheader'
                },
                {
                    text: `Total Items: ${inventoryCount.items.length}`,
                    style: 'info'
                },
                {
                    text: `Surplus: ${totalSurplus}`,
                    style: 'info',
                    color: 'green'
                },
                {
                    text: `Shortage: ${totalShortage}`,
                    style: 'info',
                    color: 'red'
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
                    fontSize: 10,
                    color: 'black',
                    fillColor: '#CCCCCC'
                }
            },
            defaultStyle: {
                fontSize: 9
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
    getStatusText(status) {
        const statusMap = {
            DRAFT: 'Draft',
            COMPLETED: 'Completed',
            APPROVED: 'Approved',
            CANCELLED: 'Cancelled'
        };
        return statusMap[status] || status;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
InventoryCountExportService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], InventoryCountExportService);

//# sourceMappingURL=inventory-count-export.service.js.map