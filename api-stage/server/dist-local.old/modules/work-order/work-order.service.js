"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrderService", {
    enumerable: true,
    get: function() {
        return WorkOrderService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const IMMUTABLE_STATUSES = [
    _client.WorkOrderStatus.INVOICED_CLOSED,
    _client.WorkOrderStatus.CANCELLED,
    _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE
];
const POST_APPROVAL_STATUSES = [
    _client.WorkOrderStatus.APPROVED_IN_PROGRESS,
    _client.WorkOrderStatus.PART_WAITING,
    _client.WorkOrderStatus.VEHICLE_READY
];
const VALID_STATUS_TRANSITIONS = {
    [_client.WorkOrderStatus.WAITING_DIAGNOSIS]: [
        _client.WorkOrderStatus.PENDING_APPROVAL,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.PENDING_APPROVAL]: [
        _client.WorkOrderStatus.APPROVED_IN_PROGRESS,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.APPROVED_IN_PROGRESS]: [
        _client.WorkOrderStatus.PART_WAITING,
        _client.WorkOrderStatus.VEHICLE_READY,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.PART_WAITING]: [
        _client.WorkOrderStatus.APPROVED_IN_PROGRESS,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.PARTS_SUPPLIED]: [
        _client.WorkOrderStatus.APPROVED_IN_PROGRESS,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.VEHICLE_READY]: [
        _client.WorkOrderStatus.INVOICED_CLOSED,
        _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE,
        _client.WorkOrderStatus.CANCELLED
    ],
    [_client.WorkOrderStatus.INVOICED_CLOSED]: [],
    [_client.WorkOrderStatus.CANCELLED]: [],
    [_client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE]: []
};
let WorkOrderService = class WorkOrderService {
    /**
   * 0. findWorkOrderOrThrow - İş emri varlığı kontrolü
   */ async findWorkOrderOrThrow(id, tx) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const prisma = tx || this.prisma;
        const workOrder = await prisma.workOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                customerVehicle: true,
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                technician: true,
                items: {
                    include: {
                        product: true
                    }
                },
                serviceInvoice: true
            }
        });
        if (!workOrder) {
            throw new _common.NotFoundException('Work order not found');
        }
        return workOrder;
    }
    assertMutable(status) {
        if (IMMUTABLE_STATUSES.includes(status)) {
            throw new _common.ForbiddenException(`This work order is ${status === _client.WorkOrderStatus.INVOICED_CLOSED ? 'closed' : 'cancelled'}. Cannot be modified.`);
        }
    }
    assertValidTransition(currentStatus, newStatus) {
        const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
        if (!validTransitions.includes(newStatus)) {
            throw new _common.BadRequestException(`Invalid status transition: ${currentStatus} -> ${newStatus}`);
        }
    }
    assertApprovedForInProgress(currentStatus, newStatus) {
        if (newStatus === _client.WorkOrderStatus.APPROVED_IN_PROGRESS) {
            const allowedForInProgress = [
                _client.WorkOrderStatus.PENDING_APPROVAL,
                _client.WorkOrderStatus.PART_WAITING,
                _client.WorkOrderStatus.PARTS_SUPPLIED
            ];
            if (!allowedForInProgress.includes(currentStatus)) {
                throw new _common.BadRequestException('Must be approved before processing');
            }
        }
    }
    async createAuditLog(data, tx) {
        const prisma = tx || this.prisma;
        const tenantId = await this.tenantResolver.resolveForQuery();
        await prisma.workOrderActivity.create({
            data: {
                workOrderId: data.workOrderId,
                action: data.action,
                userId: data.userId,
                meta: data.details || {},
                tenantId
            }
        });
    }
    async generateWorkOrderNo(tx) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const prefix = `IE${new Date().getFullYear()}`;
        const last = await tx.workOrder.findFirst({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                workOrderNo: {
                    startsWith: prefix
                }
            },
            orderBy: {
                workOrderNo: 'desc'
            },
            select: {
                workOrderNo: true
            }
        });
        let next = 1;
        if (last) {
            const num = parseInt(last.workOrderNo.replace(prefix, ''), 10);
            if (!isNaN(num)) next = num + 1;
        }
        return `${prefix}${next.toString().padStart(6, '0')}`;
    }
    calculateLineTotal(quantity, unitPrice, taxRate) {
        const subtotal = quantity * unitPrice;
        const taxAmount = subtotal * (taxRate / 100);
        const totalPrice = subtotal + taxAmount;
        return {
            taxAmount: Math.round(taxAmount * 100) / 100,
            totalPrice: Math.round(totalPrice * 100) / 100
        };
    }
    async recalculateTotals(workOrderId, tx) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const lines = await tx.workOrderItem.findMany({
            where: {
                workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        let labor = 0, parts = 0, tax = 0;
        for (const line of lines){
            const total = Number(line.totalPrice);
            const lTax = Number(line.taxAmount);
            if (line.type === _client.WorkOrderItemType.LABOR) labor += total - lTax;
            else parts += total - lTax;
            tax += lTax;
        }
        await tx.workOrder.updateMany({
            where: {
                id: workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            data: {
                totalLaborCost: new _library.Decimal(labor),
                totalPartsCost: new _library.Decimal(parts),
                taxAmount: new _library.Decimal(tax),
                grandTotal: new _library.Decimal(labor + parts + tax)
            }
        });
    }
    async create(dto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        return this.prisma.$transaction(async (tx)=>{
            const workOrderNo = await this.generateWorkOrderNo(tx);
            const workOrder = await tx.workOrder.create({
                data: {
                    tenantId,
                    workOrderNo,
                    customerVehicleId: dto.customerVehicleId,
                    accountId: dto.accountId,
                    technicianId: dto.technicianId,
                    status: _client.WorkOrderStatus.WAITING_DIAGNOSIS,
                    description: dto.description || '',
                    diagnosisNotes: dto.diagnosisNotes
                },
                include: {
                    customerVehicle: true,
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true
                        }
                    },
                    technician: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            await this.createAuditLog({
                workOrderId: workOrder.id,
                action: 'CREATE',
                userId
            }, tx);
            return workOrder;
        });
    }
    async addLaborLine(workOrderId, dto, userId) {
        return this.prisma.extended.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
            this.assertMutable(wo.status);
            const { taxAmount, totalPrice } = this.calculateLineTotal(1, dto.laborHours * dto.hourlyRate, dto.taxRate || 20);
            const line = await tx.workOrderItem.create({
                data: {
                    tenantId: wo.tenantId || tenantId,
                    workOrderId,
                    type: _client.WorkOrderItemType.LABOR,
                    description: dto.description || 'Labor',
                    quantity: 1,
                    unitPrice: new _library.Decimal(dto.laborHours * dto.hourlyRate),
                    taxRate: dto.taxRate || 20,
                    taxAmount: new _library.Decimal(taxAmount),
                    totalPrice: new _library.Decimal(totalPrice)
                }
            });
            await this.recalculateTotals(workOrderId, tx);
            await this.createAuditLog({
                workOrderId,
                action: 'ADD_LABOR',
                userId,
                details: {
                    lineId: line.id
                }
            }, tx);
            return line;
        });
    }
    async addPartLine(workOrderId, dto, userId) {
        return this.prisma.extended.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
            this.assertMutable(wo.status);
            const prod = await tx.product.findFirst({
                where: {
                    id: dto.productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!prod) throw new _common.NotFoundException('Product not found');
            const { taxAmount, totalPrice } = this.calculateLineTotal(dto.quantity, dto.unitPrice, dto.taxRate || 20);
            const line = await tx.workOrderItem.create({
                data: {
                    tenantId: wo.tenantId || tenantId,
                    workOrderId,
                    type: _client.WorkOrderItemType.PART,
                    productId: dto.productId,
                    description: dto.description || prod.name,
                    quantity: dto.quantity,
                    unitPrice: new _library.Decimal(dto.unitPrice),
                    taxRate: dto.taxRate || 20,
                    taxAmount: new _library.Decimal(taxAmount),
                    totalPrice: new _library.Decimal(totalPrice)
                }
            });
            await this.recalculateTotals(workOrderId, tx);
            await this.createAuditLog({
                workOrderId,
                action: 'ADD_PART',
                userId,
                details: {
                    lineId: line.id
                }
            }, tx);
            return line;
        });
    }
    async updateStatus(workOrderId, dto, userId) {
        return this.prisma.extended.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
            this.assertMutable(wo.status);
            this.assertValidTransition(wo.status, dto.status);
            await tx.workOrder.updateMany({
                where: {
                    id: workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    deletedAt: null
                },
                data: {
                    status: dto.status
                }
            });
            const updated = await this.findWorkOrderOrThrow(workOrderId, tx);
            await this.createAuditLog({
                workOrderId,
                action: 'STATUS_CHANGE',
                userId,
                details: {
                    from: wo.status,
                    to: dto.status
                }
            }, tx);
            return updated;
        });
    }
    async generateInvoice(workOrderId, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.extended.$transaction(async (tx)=>{
            const wo = await this.findWorkOrderOrThrow(workOrderId, tx);
            if (wo.status !== _client.WorkOrderStatus.VEHICLE_READY) throw new _common.BadRequestException('Only ready vehicles can be invoiced');
            const invoiceNo = `SRV${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`;
            const finalTenantId = wo.tenantId || tenantId || undefined;
            const invoice = await tx.serviceInvoice.create({
                data: {
                    tenantId: finalTenantId,
                    invoiceNo,
                    accountId: wo.accountId,
                    workOrderId: wo.id,
                    invoiceDate: new Date(),
                    grandTotal: wo.grandTotal,
                    taxAmount: wo.taxAmount,
                    totalAmount: wo.grandTotal.minus(wo.taxAmount),
                    serviceInvoiceTipi: _client.InvoiceType.SALE,
                    currency: 'TRY',
                    exchangeRate: 1
                }
            });
            await tx.workOrder.updateMany({
                where: {
                    id: workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
                },
                data: {
                    status: _client.WorkOrderStatus.INVOICED_CLOSED
                }
            });
            await tx.accountMovement.create({
                data: {
                    tenantId: finalTenantId,
                    accountId: wo.accountId,
                    type: 'DEBIT',
                    documentType: 'INVOICE',
                    documentNo: invoiceNo,
                    amount: wo.grandTotal,
                    description: `Work Order Invoice: ${wo.workOrderNo}`,
                    date: new Date()
                }
            });
            await this.createAuditLog({
                workOrderId,
                action: 'INVOICED',
                userId,
                details: {
                    invoiceId: invoice.id
                }
            }, tx);
            return invoice;
        });
    }
    async getAssignmentUsers() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.user.findMany({
            where: {
                tenantId,
                isActive: true,
                role: {
                    in: [
                        'ADMIN',
                        'TECHNICIAN',
                        'SERVICE_MANAGER'
                    ]
                }
            },
            select: {
                id: true,
                fullName: true,
                role: true
            }
        });
    }
    async getStats() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const stats = await this.prisma.workOrder.groupBy({
            by: [
                'status'
            ],
            where: {
                tenantId
            },
            _count: true
        });
        return stats;
    }
    async findForPartsManagement(page, limit, search, partWorkflowStatus) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            tenantId,
            ...partWorkflowStatus && {
                partWorkflowStatus
            },
            ...search && {
                OR: [
                    {
                        workOrderNo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        customerVehicle: {
                            plate: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                ]
            }
        };
        const [items, total] = await Promise.all([
            this.prisma.workOrder.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    customerVehicle: true,
                    account: true,
                    items: {
                        where: {
                            type: 'PART'
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.workOrder.count({
                where
            })
        ]);
        return {
            items,
            total
        };
    }
    async getActivities(workOrderId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.workOrderActivity.findMany({
            where: {
                workOrderId,
                workOrder: {
                    tenantId
                }
            },
            include: {
                user: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async sendForApproval(id, dto, userId) {
        return this.prisma.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(id, tx);
            this.assertMutable(wo.status);
            await tx.workOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    deletedAt: null
                },
                data: {
                    status: 'PENDING_APPROVAL',
                    diagnosisNotes: dto.diagnosisNotes
                }
            });
            await this.createAuditLog({
                workOrderId: id,
                action: 'SEND_FOR_APPROVAL',
                userId,
                details: dto
            }, tx);
            return this.findWorkOrderOrThrow(id, tx);
        });
    }
    async update(id, dto, userId) {
        return this.prisma.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(id, tx);
            this.assertMutable(wo.status);
            await tx.workOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    deletedAt: null
                },
                data: {
                    ...dto,
                    updatedBy: userId
                }
            });
            await this.createAuditLog({
                workOrderId: id,
                action: 'UPDATE',
                userId,
                details: dto
            }, tx);
            return this.findWorkOrderOrThrow(id, tx);
        });
    }
    async changeStatus(id, status, userId) {
        return this.updateStatus(id, {
            status
        }, userId);
    }
    async changeVehicleWorkflowStatus(id, dto, userId) {
        return this.prisma.$transaction(async (tx)=>{
            const tenantId = await this.tenantResolver.resolveForQuery();
            const wo = await this.findWorkOrderOrThrow(id, tx);
            await tx.workOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    deletedAt: null
                },
                data: {
                    vehicleWorkflowStatus: dto.status
                }
            });
            await this.createAuditLog({
                workOrderId: id,
                action: 'VEHICLE_WORKFLOW_CHANGE',
                userId,
                details: dto
            }, tx);
            return this.findWorkOrderOrThrow(id, tx);
        });
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const wo = await this.findWorkOrderOrThrow(id);
        this.assertMutable(wo.status);
        return this.prisma.workOrder.deleteMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
    }
    async findAll(options) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        return this.prisma.workOrder.findMany({
            where,
            include: {
                customerVehicle: true,
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                technician: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            skip: options.skip || 0,
            take: options.take || 20,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        return this.findWorkOrderOrThrow(id);
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
WorkOrderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], WorkOrderService);

//# sourceMappingURL=work-order.service.js.map