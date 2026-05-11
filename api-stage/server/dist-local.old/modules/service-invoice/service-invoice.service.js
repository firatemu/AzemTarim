"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServiceInvoiceService", {
    enumerable: true,
    get: function() {
        return ServiceInvoiceService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _codetemplateservice = require("../code-template/code-template.service");
const _systemparameterservice = require("../system-parameter/system-parameter.service");
const _stagingutil = require("../../common/utils/staging.util");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const DEFAULT_ACCOUNTS_RECEIVABLE = '120';
const DEFAULT_REVENUE_LABOR = '602';
const DEFAULT_REVENUE_PARTS = '601';
let ServiceInvoiceService = class ServiceInvoiceService {
    /**
   * Step 6: Invoice oluşturma + Muhasebe kaydı
   * - SADECE WorkOrderItem'lardan fatura üretilir
   * - Tüm PartRequest'ler USED olmalı (product Step 5'te düşüldü)
   * - STOK DÜŞÜMÜ YAPILMAZ
   */ async createFromWorkOrder(workOrderId, createdBy) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: true
        });
        const finalTenantId = tenantId ?? undefined;
        const invoiceNo = await this.codeTemplateService.getNextCode('SERVICE_INVOICE');
        return this.prisma.$transaction(async (tx)=>{
            const workOrder = await tx.workOrder.findFirst({
                where: {
                    id: workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
                },
                include: {
                    items: true,
                    partRequests: true,
                    account: true,
                    customerVehicle: true
                }
            });
            if (!workOrder) {
                throw new _common.NotFoundException('Work order not found');
            }
            const isReady = workOrder.vehicleWorkflowStatus === _client.VehicleWorkflowStatus.READY || workOrder.status === _client.WorkOrderStatus.VEHICLE_READY || workOrder.status === _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE;
            if (!isReady) {
                throw new _common.BadRequestException('Sadece araç hazır veya kapatılmış iş emirleri faturalanabilir');
            }
            const existingInvoice = await tx.serviceInvoice.findUnique({
                where: {
                    workOrderId
                }
            });
            if (existingInvoice) {
                throw new _common.BadRequestException('Bu iş emri için fatura zaten oluşturulmuş');
            }
            const partRequestsNotUsed = workOrder.partRequests.filter((pr)=>pr.status !== _client.PartRequestStatus.USED && pr.status !== _client.PartRequestStatus.CANCELLED);
            if (partRequestsNotUsed.length > 0) {
                throw new _common.BadRequestException('Tüm parça talepleri kullanıldı olarak işaretlenmeden fatura oluşturulamaz');
            }
            if (workOrder.items.length === 0) {
                throw new _common.BadRequestException('İş emrinde fatura kalemi bulunmuyor');
            }
            const subtotal = Number(workOrder.grandTotal) - Number(workOrder.taxAmount);
            const taxAmount = Number(workOrder.taxAmount);
            const grandTotal = Number(workOrder.grandTotal);
            const serviceInvoice = await tx.serviceInvoice.create({
                data: {
                    tenantId: finalTenantId,
                    invoiceNo,
                    workOrderId,
                    accountId: workOrder.accountId,
                    subtotal: new _library.Decimal(subtotal),
                    taxAmount: new _library.Decimal(taxAmount),
                    grandTotal: new _library.Decimal(grandTotal),
                    createdBy
                },
                include: {
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true
                        }
                    },
                    workOrder: {
                        select: {
                            id: true,
                            workOrderNo: true
                        }
                    }
                }
            });
            const laborTotal = Number(workOrder.totalLaborCost);
            const partsTotal = Number(workOrder.totalPartsCost);
            const accountsReceivable = await this.systemParameterService.getParameter('SERVICE_INVOICE_ACCOUNTS_RECEIVABLE', DEFAULT_ACCOUNTS_RECEIVABLE) ?? DEFAULT_ACCOUNTS_RECEIVABLE;
            const revenueLabor = await this.systemParameterService.getParameter('SERVICE_INVOICE_REVENUE_LABOR', DEFAULT_REVENUE_LABOR) ?? DEFAULT_REVENUE_LABOR;
            const revenueParts = await this.systemParameterService.getParameter('SERVICE_INVOICE_REVENUE_PARTS', DEFAULT_REVENUE_PARTS) ?? DEFAULT_REVENUE_PARTS;
            const arCode = String(accountsReceivable);
            const laborCode = String(revenueLabor);
            const partsCode = String(revenueParts);
            const journalEntry = await tx.journalEntry.create({
                data: {
                    tenantId: finalTenantId,
                    referenceType: 'SERVICE_INVOICE',
                    referenceId: serviceInvoice.id,
                    serviceInvoiceId: serviceInvoice.id,
                    description: `Servis Faturası ${invoiceNo} - İş Emri ${workOrder.workOrderNo}`,
                    lines: {
                        create: [
                            {
                                accountCode: arCode,
                                accountName: 'Alacaklar',
                                debit: new _library.Decimal(grandTotal),
                                credit: new _library.Decimal(0),
                                description: `Servis Faturası ${invoiceNo}`
                            },
                            ...laborTotal > 0 ? [
                                {
                                    accountCode: laborCode,
                                    accountName: 'Hizmet Geliri',
                                    debit: new _library.Decimal(0),
                                    credit: new _library.Decimal(laborTotal),
                                    description: 'İşçilik'
                                }
                            ] : [],
                            ...partsTotal > 0 ? [
                                {
                                    accountCode: partsCode,
                                    accountName: 'Parça Satış Geliri',
                                    debit: new _library.Decimal(0),
                                    credit: new _library.Decimal(partsTotal),
                                    description: 'Parça satışı'
                                }
                            ] : []
                        ]
                    }
                }
            });
            await tx.workOrder.update({
                where: {
                    id: workOrderId
                },
                data: {
                    status: _client.WorkOrderStatus.INVOICED_CLOSED,
                    vehicleWorkflowStatus: _client.VehicleWorkflowStatus.DELIVERED,
                    actualCompletionDate: workOrder.actualCompletionDate ?? new Date()
                }
            });
            // Update code template counter
            await this.codeTemplateService.saveLastCode('SERVICE_INVOICE', invoiceNo);
            return {
                serviceInvoice,
                journalEntry
            };
        });
    }
    async findAll(page = 1, limit = 50, search, accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        if (search) {
            where.OR = [
                {
                    invoiceNo: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    workOrder: {
                        workOrderNo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        if (accountId) where.accountId = accountId;
        const [data, total] = await Promise.all([
            this.prisma.serviceInvoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    issueDate: 'desc'
                },
                include: {
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true
                        }
                    },
                    workOrder: {
                        select: {
                            id: true,
                            workOrderNo: true,
                            status: true
                        }
                    }
                }
            }),
            this.prisma.serviceInvoice.count({
                where
            })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const invoice = await this.prisma.serviceInvoice.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                workOrder: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        code: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        customerVehicle: true
                    }
                },
                journalEntry: {
                    include: {
                        lines: true
                    }
                }
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Service invoice not found: id`);
        }
        return invoice;
    }
    constructor(prisma, tenantResolver, codeTemplateService, systemParameterService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.systemParameterService = systemParameterService;
    }
};
ServiceInvoiceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService
    ])
], ServiceInvoiceService);

//# sourceMappingURL=service-invoice.service.js.map