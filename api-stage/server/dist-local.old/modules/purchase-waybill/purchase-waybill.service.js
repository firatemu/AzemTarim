// CHANGED: createDeliveryNote, updateDeliveryNote, cancelDeliveryNote
// REASON: purchase workflow status automation v2
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PurchaseWaybillService", {
    enumerable: true,
    get: function() {
        return PurchaseWaybillService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _statuscalculatorservice = require("../shared/status-calculator/status-calculator.service");
const _purchasestatuscalculatorservice = require("../shared/purchase-status-calculator/purchase-status-calculator.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PurchaseWaybillService = class PurchaseWaybillService {
    async createLog(deliveryNoteId, actionType, userId, changes, ipAddress, userAgent, tx) {
        const prisma = tx || this.prisma;
        await prisma.purchaseDeliveryNoteLog.create({
            data: {
                deliveryNoteId,
                userId,
                actionType,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress,
                userAgent
            }
        });
    }
    async findAll(filterDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const page = filterDto.page ? parseInt(filterDto.page, 10) : 1;
        const limit = filterDto.limit ? parseInt(filterDto.limit, 10) : 50;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (filterDto.status) {
            where.status = filterDto.status;
        }
        if (filterDto.accountId) {
            where.accountId = filterDto.accountId;
        }
        if (filterDto.search) {
            where.OR = [
                {
                    deliveryNoteNo: {
                        contains: filterDto.search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: filterDto.search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    account: {
                        code: {
                            contains: filterDto.search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        if (filterDto.startDate && filterDto.endDate) {
            where.date = {
                gte: new Date(filterDto.startDate),
                lte: new Date(filterDto.endDate)
            };
        } else if (filterDto.startDate) {
            where.date = {
                gte: new Date(filterDto.startDate)
            };
        } else if (filterDto.endDate) {
            where.date = {
                lte: new Date(filterDto.endDate)
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.purchaseDeliveryNote.findMany({
                where,
                skip,
                take: limit,
                include: {
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true,
                            type: true
                        }
                    },
                    warehouse: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    sourceOrder: {
                        select: {
                            id: true,
                            orderNo: true
                        }
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true
                        }
                    },
                    _count: {
                        select: {
                            items: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.purchaseDeliveryNote.count({
                where
            })
        ]);
        const mappedData = data.map((item)=>({
                ...item,
                irsaliyeNo: item.deliveryNoteNo,
                irsaliyeTarihi: item.date,
                durum: item.status,
                genelToplam: item.grandTotal ? Number(item.grandTotal) : 0,
                subtotal: item.subtotal ? Number(item.subtotal) : 0,
                grandTotal: item.grandTotal ? Number(item.grandTotal) : 0,
                discount: item.discount ? Number(item.discount) : 0,
                vatAmount: item.vatAmount ? Number(item.vatAmount) : 0,
                account: item.account ? {
                    ...item.account,
                    accountCode: item.account.code
                } : null
            }));
        return {
            data: mappedData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const deliveryNote = await this.prisma.purchaseDeliveryNote.findUnique({
            where: {
                id
            },
            include: {
                account: true,
                warehouse: true,
                sourceOrder: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true
                            }
                        }
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                invoice: {
                    select: {
                        id: true,
                        invoiceNo: true,
                        date: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            }
        });
        if (!deliveryNote) {
            throw new _common.NotFoundException(`Waybill not found: ${id}`);
        }
        return {
            ...deliveryNote,
            irsaliyeNo: deliveryNote.deliveryNoteNo,
            irsaliyeTarihi: deliveryNote.date,
            durum: deliveryNote.status,
            genelToplam: deliveryNote.grandTotal ? Number(deliveryNote.grandTotal) : 0,
            subtotal: deliveryNote.subtotal ? Number(deliveryNote.subtotal) : 0,
            grandTotal: deliveryNote.grandTotal ? Number(deliveryNote.grandTotal) : 0,
            discount: deliveryNote.discount ? Number(deliveryNote.discount) : 0,
            vatAmount: deliveryNote.vatAmount ? Number(deliveryNote.vatAmount) : 0,
            account: deliveryNote.account ? {
                ...deliveryNote.account,
                accountCode: deliveryNote.account.code
            } : null
        };
    }
    async getPendingByAccount(accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const pendingNotes = await this.prisma.purchaseDeliveryNote.findMany({
            where: {
                accountId,
                status: 'NOT_INVOICED',
                deletedAt: null,
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
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        }
                    }
                },
                sourceOrder: {
                    select: {
                        id: true,
                        orderNo: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return pendingNotes;
    }
    async create(createDto, userId, ipAddress, userAgent) {
        const { items, ...deliveryNoteData } = createDto;
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const validItems = items.filter((i)=>i.productId && i.productId.trim() !== '');
        if (validItems.length === 0) {
            throw new _common.BadRequestException('At least one item must be added');
        }
        const existingWaybill = await this.prisma.purchaseDeliveryNote.findFirst({
            where: {
                deliveryNoteNo: deliveryNoteData.deliveryNoteNo,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (existingWaybill) {
            throw new _common.BadRequestException(`Waybill number already exists: ${deliveryNoteData.deliveryNoteNo}`);
        }
        // Account check
        const account = await this.prisma.account.findUnique({
            where: {
                id: deliveryNoteData.accountId
            }
        });
        if (!account) {
            throw new _common.NotFoundException(`Account not found: ${deliveryNoteData.accountId}`);
        }
        // Order check (if sourceType: ORDER)
        if (deliveryNoteData.sourceType === _client.DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
            const order = await this.prisma.procurementOrder.findUnique({
                where: {
                    id: deliveryNoteData.sourceId
                }
            });
            if (!order) {
                throw new _common.NotFoundException(`Order not found: ${deliveryNoteData.sourceId}`);
            }
        }
        // Calculate item amounts
        let subtotal = 0;
        let vatAmount = 0;
        const itemsWithCalculations = validItems.map((item)=>{
            const totalAmount = item.quantity * item.unitPrice;
            const itemVat = totalAmount * item.vatRate / 100;
            subtotal += totalAmount;
            vatAmount += itemVat;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                totalAmount,
                vatAmount: itemVat
            };
        });
        const discount = deliveryNoteData.discount || 0;
        subtotal -= discount;
        const grandTotal = subtotal + vatAmount;
        // Create deliveryNote and items with transaction
        return this.prisma.$transaction(async (prisma)=>{
            const deliveryNote = await prisma.purchaseDeliveryNote.create({
                data: {
                    ...deliveryNoteData,
                    ...tenantId != null && {
                        tenantId
                    },
                    subtotal: new _library.Decimal(subtotal),
                    vatAmount: new _library.Decimal(vatAmount),
                    grandTotal: new _library.Decimal(grandTotal),
                    discount: new _library.Decimal(discount),
                    status: deliveryNoteData.status || _client.DeliveryNoteStatus.NOT_INVOICED,
                    createdBy: userId,
                    items: {
                        create: itemsWithCalculations.map((k)=>({
                                productId: k.productId,
                                quantity: k.quantity,
                                unitPrice: new _library.Decimal(k.unitPrice),
                                totalAmount: new _library.Decimal(k.totalAmount),
                                vatAmount: new _library.Decimal(k.vatAmount),
                                vatRate: k.vatRate
                            }))
                    }
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Create stock movement (when product added)
            for (const item of itemsWithCalculations){
                await prisma.productMovement.create({
                    data: {
                        ...tenantId != null && {
                            tenantId
                        },
                        productId: item.productId,
                        movementType: 'ENTRY',
                        quantity: item.quantity,
                        unitPrice: new _library.Decimal(item.unitPrice),
                        warehouseId: deliveryNoteData.warehouseId || null,
                        notes: `Purchase delivery note: ${deliveryNoteData.deliveryNoteNo}`
                    }
                });
            }
            // Link deliveryNoteId to Order (if sourceType: ORDER)
            if (deliveryNoteData.sourceType === _client.DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
                await prisma.procurementOrder.update({
                    where: {
                        id: deliveryNoteData.sourceId
                    },
                    data: {
                        deliveryNoteId: deliveryNote.id
                    }
                });
            }
            // Create audit log
            await this.createLog(deliveryNote.id, _client.LogAction.CREATE, userId, {
                deliveryNote: deliveryNoteData,
                items
            }, ipAddress, userAgent, prisma);
            return deliveryNote;
        }).then(async (result)=>{
            // After transaction: recalculate status
            const tenantId = await this.tenantResolver.resolveForQuery();
            if (result.id && tenantId) {
                await this.purchaseStatusCalculator.recalculateCascade(result.id, String(tenantId)).catch((err)=>console.error('[PurchaseWaybill] recalculateCascade after create failed:', err?.message));
                // Also update the source order orderNo on the waybill if applicable
                if (result.sourceType === _client.DeliveryNoteSourceType.ORDER && result.sourceId) {
                    const order = await this.prisma.procurementOrder.findUnique({
                        where: {
                            id: result.sourceId
                        }
                    });
                    if (order && order.orderNo) {
                        await this.prisma.purchaseDeliveryNote.update({
                            where: {
                                id: result.id
                            },
                            data: {
                                orderNo: order.orderNo
                            }
                        });
                    }
                }
            }
            return result;
        });
    }
    async update(id, updateDto, userId, ipAddress, userAgent) {
        const existingWaybill = await this.prisma.purchaseDeliveryNote.findUnique({
            where: {
                id
            },
            include: {
                items: true,
                invoice: true
            }
        });
        if (!existingWaybill) {
            throw new _common.NotFoundException(`Waybill not found: ${id}`);
        }
        // Invoiced waybill cannot be updated
        if (existingWaybill.status === _client.DeliveryNoteStatus.INVOICED) {
            throw new _common.BadRequestException('Invoiced waybill cannot be updated');
        }
        // Waybill linked to invoice cannot be updated
        if (existingWaybill.invoice) {
            throw new _common.BadRequestException('Waybill linked to invoice cannot be updated');
        }
        const { items, ...deliveryNoteData } = updateDto;
        // Update with transaction
        return this.prisma.$transaction(async (prisma)=>{
            // If items are being updated
            if (items && items.length > 0) {
                // Mevcut itemsi sil
                await prisma.purchaseDeliveryNoteItem.deleteMany({
                    where: {
                        deliveryNoteId: id
                    }
                });
                // Add new items and calculate amounts
                let subtotal = 0;
                let vatAmount = 0;
                const validItems = items.filter((i)=>i.productId && i.productId.trim() !== '');
                if (validItems.length === 0) {
                    throw new _common.BadRequestException('At least one item must be added');
                }
                const itemsWithCalculations = validItems.map((item)=>{
                    const totalAmount = item.quantity * item.unitPrice;
                    const itemVat = totalAmount * item.vatRate / 100;
                    subtotal += totalAmount;
                    vatAmount += itemVat;
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        vatRate: item.vatRate,
                        totalAmount,
                        vatAmount: itemVat
                    };
                });
                const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
                subtotal -= discount;
                const grandTotal = subtotal + vatAmount;
                // EKSIK: Eski ProductMovement kayıtlarını sil (not içerenleri baz alarak)
                await prisma.productMovement.deleteMany({
                    where: {
                        notes: {
                            contains: existingWaybill.deliveryNoteNo
                        }
                    }
                });
                await prisma.purchaseDeliveryNoteItem.createMany({
                    data: itemsWithCalculations.map((k)=>({
                            productId: k.productId,
                            quantity: k.quantity,
                            deliveryNoteId: id,
                            unitPrice: new _library.Decimal(k.unitPrice),
                            totalAmount: new _library.Decimal(k.totalAmount),
                            vatAmount: new _library.Decimal(k.vatAmount),
                            vatRate: k.vatRate
                        }))
                });
                // YENI: Güncellenmiş kalemlere göre yeni ProductMovement kayıtları oluştur
                const tenantIdForMovement = await this.tenantResolver.resolveForQuery();
                await prisma.productMovement.createMany({
                    data: itemsWithCalculations.map((k)=>({
                            ...tenantIdForMovement && {
                                tenantId: tenantIdForMovement
                            },
                            productId: k.productId,
                            movementType: 'ENTRY',
                            quantity: k.quantity,
                            unitPrice: new _library.Decimal(k.unitPrice),
                            warehouseId: deliveryNoteData.warehouseId || existingWaybill.warehouseId || null,
                            notes: `Purchase delivery note: ${existingWaybill.deliveryNoteNo}`
                        }))
                });
                // Update waybill amounts
                await prisma.purchaseDeliveryNote.update({
                    where: {
                        id
                    },
                    data: {
                        ...deliveryNoteData,
                        subtotal: new _library.Decimal(subtotal),
                        vatAmount: new _library.Decimal(vatAmount),
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(discount),
                        updatedBy: userId
                    }
                });
            } else {
                // Only deliveryNote info is being updated
                const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
                const subtotal = existingWaybill.subtotal.toNumber() - discount + existingWaybill.discount.toNumber();
                const grandTotal = subtotal + existingWaybill.vatAmount.toNumber();
                await prisma.purchaseDeliveryNote.update({
                    where: {
                        id
                    },
                    data: {
                        ...deliveryNoteData,
                        subtotal: new _library.Decimal(subtotal),
                        vatAmount: existingWaybill.vatAmount,
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(discount),
                        updatedBy: userId
                    }
                });
            }
            const updatedWaybill = await prisma.purchaseDeliveryNote.findUnique({
                where: {
                    id
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Create audit log
            await this.createLog(id, _client.LogAction.UPDATE, userId, {
                updateDto,
                oldData: existingWaybill
            }, ipAddress, userAgent, prisma);
            return updatedWaybill;
        }).then(async (result)=>{
            // After transaction: recalculate status
            const tenantId = await this.tenantResolver.resolveForQuery();
            if (id && tenantId) {
                await this.purchaseStatusCalculator.recalculateCascade(id, String(tenantId)).catch((err)=>console.error('[PurchaseWaybill] recalculateCascade after update failed:', err?.message));
            }
            return result;
        });
    }
    async remove(id, userId, ipAddress, userAgent) {
        const deliveryNote = await this.prisma.purchaseDeliveryNote.findUnique({
            where: {
                id
            },
            include: {
                invoice: true
            }
        });
        if (!deliveryNote) {
            throw new _common.NotFoundException(`Waybill not found: ${id}`);
        }
        // Invoiced waybill cannot be deleted
        if (deliveryNote.status === _client.DeliveryNoteStatus.INVOICED) {
            throw new _common.BadRequestException('Invoiced waybill cannot be deleted');
        }
        // Waybill linked to invoice cannot be deleted
        if (deliveryNote.invoice) {
            throw new _common.BadRequestException('Waybill linked to invoice cannot be deleted');
        }
        return this.prisma.$transaction(async (prisma)=>{
            // Soft delete
            await prisma.purchaseDeliveryNote.update({
                where: {
                    id
                },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId
                }
            });
            // EKSIK: İrsaliyeye bağlı ProductMovement kayıtlarını (not'a göre bularak) null/iptal yap
            await prisma.productMovement.updateMany({
                where: {
                    notes: {
                        contains: deliveryNote.deliveryNoteNo
                    }
                },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId
                }
            });
            // Sipariş'ten deliveryNoteId'yi kaldır
            if (deliveryNote.sourceType === _client.DeliveryNoteSourceType.ORDER && deliveryNote.sourceId) {
                await prisma.procurementOrder.update({
                    where: {
                        id: deliveryNote.sourceId
                    },
                    data: {
                        deliveryNoteId: null
                    }
                });
            }
            // Create audit log
            await this.createLog(id, _client.LogAction.DELETE, userId, {
                deliveryNote
            }, ipAddress, userAgent, prisma);
        }).then(async ()=>{
            // After transaction: recalculate status for the order
            const tenantId = await this.tenantResolver.resolveForQuery();
            if (deliveryNote.sourceId && tenantId) {
                await this.purchaseStatusCalculator.recalculateOrderStatus(deliveryNote.sourceId, String(tenantId)).catch((err)=>console.error('[PurchaseWaybill] recalculateOrderStatus after remove failed:', err?.message));
            }
        });
    }
    async getStats() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const baseWhere = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        // Monthly total (all approved/not deleted)
        const monthlyStats = await this.prisma.purchaseDeliveryNote.aggregate({
            where: {
                ...baseWhere,
                date: {
                    gte: startOfMonth
                }
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        // Pending Invoicing (NOT_INVOICED)
        const pendingStats = await this.prisma.purchaseDeliveryNote.aggregate({
            where: {
                ...baseWhere,
                status: _client.DeliveryNoteStatus.NOT_INVOICED
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        // Invoiced (INVOICED)
        const invoicedStats = await this.prisma.purchaseDeliveryNote.aggregate({
            where: {
                ...baseWhere,
                status: _client.DeliveryNoteStatus.INVOICED
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        return {
            monthlyNotes: {
                totalAmount: monthlyStats._sum.grandTotal ? monthlyStats._sum.grandTotal.toNumber() : 0,
                count: monthlyStats._count || 0
            },
            pendingInvoicing: {
                totalAmount: pendingStats._sum.grandTotal ? pendingStats._sum.grandTotal.toNumber() : 0,
                count: pendingStats._count || 0
            },
            invoicedNotes: {
                totalAmount: invoicedStats._sum.grandTotal ? invoicedStats._sum.grandTotal.toNumber() : 0,
                count: invoicedStats._count || 0
            }
        };
    }
    constructor(prisma, tenantResolver, codeTemplateService, statusCalculator, purchaseStatusCalculator){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.statusCalculator = statusCalculator;
        this.purchaseStatusCalculator = purchaseStatusCalculator;
    }
};
PurchaseWaybillService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _statuscalculatorservice.StatusCalculatorService === "undefined" ? Object : _statuscalculatorservice.StatusCalculatorService,
        typeof _purchasestatuscalculatorservice.PurchaseStatusCalculatorService === "undefined" ? Object : _purchasestatuscalculatorservice.PurchaseStatusCalculatorService
    ])
], PurchaseWaybillService);

//# sourceMappingURL=purchase-waybill.service.js.map