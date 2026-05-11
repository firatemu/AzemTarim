"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SalesWaybillService", {
    enumerable: true,
    get: function() {
        return SalesWaybillService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _saleswaybillenums = require("./sales-waybill.enums");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _statuscalculatorservice = require("../shared/status-calculator/status-calculator.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SalesWaybillService = class SalesWaybillService {
    async createLog(deliveryNoteId, actionType, userId, changes, ipAddress, userAgent, tx) {
        const prisma = tx || this.prisma;
        await prisma.salesDeliveryNoteLog.create({
            data: {
                deliveryNoteId: deliveryNoteId,
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
            this.prisma.salesDeliveryNote.findMany({
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
                    items: true,
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
            this.prisma.salesDeliveryNote.count({
                where
            })
        ]);
        return {
            data: data.map((d)=>({
                    ...d,
                    // Backward-compatible aliases
                    irsaliyeNo: d.deliveryNoteNo,
                    irsaliyeTarihi: d.date,
                    durum: d.status,
                    genelToplam: d.grandTotal ? Number(d.grandTotal) : 0,
                    subtotal: d.subtotal ? Number(d.subtotal) : 0,
                    grandTotal: d.grandTotal ? Number(d.grandTotal) : 0,
                    discount: d.discount ? Number(d.discount) : 0,
                    vatAmount: d.vatAmount ? Number(d.vatAmount) : 0,
                    account: d.account ? {
                        id: d.account.id,
                        code: d.account.code,
                        accountCode: d.account.code,
                        title: d.account.title,
                        type: d.account.type
                    } : null,
                    warehouse: d.warehouse ? {
                        id: d.warehouse.id,
                        name: d.warehouse.name
                    } : null,
                    items: d.items,
                    deliveryNoteNo: d.deliveryNoteNo,
                    deliveryNoteDate: d.date,
                    accountId: d.accountId,
                    warehouseId: d.warehouseId,
                    sourceType: d.sourceType,
                    sourceId: d.sourceId,
                    status: d.status,
                    totalAmount: d.subtotal ? Number(d.subtotal) : 0,
                    _count: d._count ? {
                        ...d._count,
                        items: d._count.items
                    } : d._count
                })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const deliveryNote = await this.prisma.salesDeliveryNote.findUnique({
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
                invoices: {
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
            // Backward-compatible aliases
            irsaliyeNo: deliveryNote.deliveryNoteNo,
            irsaliyeTarihi: deliveryNote.date,
            durum: deliveryNote.status,
            genelToplam: deliveryNote.grandTotal ? Number(deliveryNote.grandTotal) : 0,
            toplamTutar: deliveryNote.subtotal ? Number(deliveryNote.subtotal) : 0,
            vatAmount: deliveryNote.vatAmount ? Number(deliveryNote.vatAmount) : 0,
            iskonto: deliveryNote.discount ? Number(deliveryNote.discount) : 0,
            kdvTutar: deliveryNote.vatAmount ? Number(deliveryNote.vatAmount) : 0,
            // Frontend expects 'cari'
            cari: deliveryNote.account ? {
                id: deliveryNote.account.id,
                cariKodu: deliveryNote.account.code,
                unvan: deliveryNote.account.title,
                tip: deliveryNote.account.type || 'Müşteri'
            } : null,
            // Frontend expects 'kalemler' instead of 'items'
            kalemler: (deliveryNote.items || []).map((item)=>({
                    id: item.id,
                    stokId: item.productId,
                    stok: item.product ? {
                        id: item.product.id,
                        stokKodu: item.product.code,
                        stokAdi: item.product.name,
                        birim: item.product.unit || null
                    } : null,
                    birim: item.product?.unit || null,
                    miktar: Number(item.quantity),
                    birimFiyat: Number(item.unitPrice),
                    kdvOrani: Number(item.vatRate),
                    kdvTutar: Number(item.vatAmount),
                    tutar: Number(item.totalAmount) - Number(item.vatAmount)
                })),
            kaynakTip: deliveryNote.sourceType === 'ORDER' ? 'SIPARIS' : 'DOGRUDAN',
            kaynakSiparis: deliveryNote.sourceOrder ? {
                id: deliveryNote.sourceOrder.id,
                siparisNo: deliveryNote.sourceOrder.orderNo
            } : null,
            account: deliveryNote.account ? {
                ...deliveryNote.account,
                accountCode: deliveryNote.account.code
            } : null,
            warehouse: deliveryNote.warehouse,
            items: deliveryNote.items,
            invoices: deliveryNote.invoices?.map((inv)=>({
                    ...inv,
                    invoiceNo: inv.invoiceNo,
                    date: inv.date
                })),
            deliveryNoteNo: deliveryNote.deliveryNoteNo,
            deliveryNoteDate: deliveryNote.date,
            accountId: deliveryNote.accountId,
            warehouseId: deliveryNote.warehouseId,
            sourceType: deliveryNote.sourceType,
            sourceId: deliveryNote.sourceId,
            status: deliveryNote.status,
            totalAmount: deliveryNote.subtotal ? Number(deliveryNote.subtotal) : 0,
            notes: deliveryNote.notes
        };
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
        const existingWaybill = await this.prisma.salesDeliveryNote.findFirst({
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
        if (deliveryNoteData.sourceType === _saleswaybillenums.DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
            const salesOrder = await this.prisma.salesOrder.findUnique({
                where: {
                    id: deliveryNoteData.sourceId
                }
            });
            if (!salesOrder) {
                throw new _common.NotFoundException(`Order not found: deliveryNoteData.sourceId`);
            }
        }
        // Calculate item amounts
        let subtotal = 0;
        let vatAmount = 0;
        const itemsWithCalculations = validItems.map((item)=>{
            const amount = item.quantity * item.unitPrice;
            const itemVat = amount * item.vatRate / 100;
            subtotal += amount;
            vatAmount += itemVat;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                amount,
                vatAmount: itemVat
            };
        });
        const discount = deliveryNoteData.discount || 0;
        subtotal -= discount;
        const grandTotal = subtotal + vatAmount;
        // Create deliveryNote and items with transaction
        return this.prisma.$transaction(async (prisma)=>{
            const deliveryNote = await prisma.salesDeliveryNote.create({
                data: {
                    deliveryNoteNo: deliveryNoteData.deliveryNoteNo,
                    date: new Date(deliveryNoteData.date),
                    accountId: deliveryNoteData.accountId,
                    warehouseId: deliveryNoteData.warehouseId || null,
                    sourceType: deliveryNoteData.sourceType,
                    sourceId: deliveryNoteData.sourceId || null,
                    ...tenantId != null && {
                        tenantId
                    },
                    subtotal: new _library.Decimal(subtotal),
                    vatAmount: new _library.Decimal(vatAmount),
                    grandTotal: new _library.Decimal(grandTotal),
                    discount: new _library.Decimal(discount),
                    notes: deliveryNoteData.notes,
                    status: deliveryNoteData.status || _saleswaybillenums.DeliveryNoteStatus.NOT_INVOICED,
                    createdBy: userId,
                    items: {
                        create: itemsWithCalculations.map((item)=>({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: new _library.Decimal(item.unitPrice),
                                vatRate: item.vatRate,
                                totalAmount: new _library.Decimal(item.amount),
                                vatAmount: new _library.Decimal(item.vatAmount),
                                ...tenantId != null && {
                                    tenantId
                                }
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
            // Create stock movement (inventory decreases when deliveryNote is created)
            for (const item of itemsWithCalculations){
                await prisma.productMovement.create({
                    data: {
                        ...tenantId != null && {
                            tenantId
                        },
                        productId: item.productId,
                        movementType: 'SALE',
                        quantity: item.quantity,
                        unitPrice: new _library.Decimal(item.unitPrice),
                        warehouseId: deliveryNoteData.warehouseId || null,
                        notes: `Sales delivery note: ${deliveryNoteData.deliveryNoteNo}`
                    }
                });
            }
            // Bind deliveryNoteId to order (if sourceType: ORDER) and set orderNo
            if (deliveryNoteData.sourceType === _saleswaybillenums.DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId) {
                const sourceOrder = await prisma.salesOrder.findUnique({
                    where: {
                        id: deliveryNoteData.sourceId
                    },
                    select: {
                        orderNo: true
                    }
                });
                await prisma.salesOrder.update({
                    where: {
                        id: deliveryNoteData.sourceId
                    },
                    data: {
                        deliveryNoteId: deliveryNote.id
                    }
                });
                // Denormalize orderNo onto the delivery note for cross-referencing
                if (sourceOrder?.orderNo) {
                    await prisma.salesDeliveryNote.update({
                        where: {
                            id: deliveryNote.id
                        },
                        data: {
                            orderNo: sourceOrder.orderNo
                        }
                    });
                }
            }
            // Create audit log
            await this.createLog(deliveryNote.id, 'CREATE', userId, {
                deliveryNote: deliveryNoteData,
                items
            }, ipAddress, userAgent, prisma);
            return {
                ...deliveryNote,
                account: deliveryNote.account,
                warehouse: deliveryNote.warehouse,
                items: deliveryNote.items
            };
        }).then(async (result)=>{
            // After transaction: recalculate order status
            if (deliveryNoteData.sourceType === _saleswaybillenums.DeliveryNoteSourceType.ORDER && deliveryNoteData.sourceId && tenantId) {
                await this.statusCalculator.recalculateOrderStatus(deliveryNoteData.sourceId, tenantId).catch((err)=>console.error('[SalesWaybill] recalculateOrderStatus failed:', err?.message));
            }
            return result;
        });
    }
    async update(id, updateDto, userId, ipAddress, userAgent) {
        const existingWaybill = await this.prisma.salesDeliveryNote.findUnique({
            where: {
                id
            },
            include: {
                items: true,
                invoices: true
            }
        });
        if (!existingWaybill) {
            throw new _common.NotFoundException(`Waybill not found: ${id}`);
        }
        if (existingWaybill.status === _saleswaybillenums.DeliveryNoteStatus.INVOICED) {
            throw new _common.BadRequestException('Invoiced waybills cannot be updated');
        }
        if (existingWaybill.invoices && existingWaybill.invoices.length > 0) {
            throw new _common.BadRequestException('Waybills linked to invoices cannot be updated');
        }
        const { items, ...deliveryNoteData } = updateDto;
        // Update with transaction
        return this.prisma.$transaction(async (prisma)=>{
            // If items are being updated
            if (items && items.length > 0) {
                // Delete existing items
                await prisma.salesDeliveryNoteItem.deleteMany({
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
                    const amount = item.quantity * item.unitPrice;
                    const itemVat = amount * item.vatRate / 100;
                    subtotal += amount;
                    vatAmount += itemVat;
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        vatRate: item.vatRate,
                        amount,
                        vatAmount: itemVat
                    };
                });
                const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
                subtotal -= discount;
                const grandTotal = subtotal + vatAmount;
                await prisma.salesDeliveryNoteItem.createMany({
                    data: itemsWithCalculations.map((item)=>({
                            deliveryNoteId: id,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: new _library.Decimal(item.unitPrice),
                            vatRate: item.vatRate,
                            totalAmount: new _library.Decimal(item.amount),
                            vatAmount: new _library.Decimal(item.vatAmount)
                        }))
                });
                // Update waybill amounts
                await prisma.salesDeliveryNote.update({
                    where: {
                        id
                    },
                    data: {
                        ...deliveryNoteData.deliveryNoteNo && {
                            deliveryNoteNo: deliveryNoteData.deliveryNoteNo
                        },
                        ...deliveryNoteData.date && {
                            date: new Date(deliveryNoteData.date)
                        },
                        ...deliveryNoteData.accountId && {
                            accountId: deliveryNoteData.accountId
                        },
                        ...deliveryNoteData.warehouseId !== undefined && {
                            warehouseId: deliveryNoteData.warehouseId || null
                        },
                        ...deliveryNoteData.sourceType && {
                            sourceType: deliveryNoteData.sourceType
                        },
                        ...deliveryNoteData.sourceId !== undefined && {
                            sourceId: deliveryNoteData.sourceId || null
                        },
                        ...deliveryNoteData.status && {
                            status: deliveryNoteData.status
                        },
                        ...deliveryNoteData.notes !== undefined && {
                            notes: deliveryNoteData.notes
                        },
                        subtotal: new _library.Decimal(subtotal),
                        vatAmount: new _library.Decimal(vatAmount),
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(discount),
                        updatedBy: userId
                    }
                });
            } else {
                // Only deliveryNote info is updating
                const discount = deliveryNoteData.discount ?? existingWaybill.discount.toNumber();
                const subtotal = existingWaybill.subtotal.toNumber() - discount + existingWaybill.discount.toNumber();
                const grandTotal = subtotal + existingWaybill.vatAmount.toNumber();
                await prisma.salesDeliveryNote.update({
                    where: {
                        id
                    },
                    data: {
                        ...deliveryNoteData.deliveryNoteNo && {
                            deliveryNoteNo: deliveryNoteData.deliveryNoteNo
                        },
                        ...deliveryNoteData.date && {
                            date: new Date(deliveryNoteData.date)
                        },
                        ...deliveryNoteData.accountId && {
                            accountId: deliveryNoteData.accountId
                        },
                        ...deliveryNoteData.warehouseId !== undefined && {
                            warehouseId: deliveryNoteData.warehouseId || null
                        },
                        ...deliveryNoteData.sourceType && {
                            sourceType: deliveryNoteData.sourceType
                        },
                        ...deliveryNoteData.sourceId !== undefined && {
                            sourceId: deliveryNoteData.sourceId || null
                        },
                        ...deliveryNoteData.status && {
                            status: deliveryNoteData.status
                        },
                        ...deliveryNoteData.notes !== undefined && {
                            notes: deliveryNoteData.notes
                        },
                        subtotal: new _library.Decimal(subtotal),
                        vatAmount: existingWaybill.vatAmount,
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(discount),
                        updatedBy: userId
                    }
                });
            }
            const updatedWaybill = await prisma.salesDeliveryNote.findUnique({
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
            await this.createLog(id, 'UPDATE', userId, {
                updateDto,
                oldData: existingWaybill
            }, ipAddress, userAgent, prisma);
            return updatedWaybill ? {
                ...updatedWaybill,
                account: updatedWaybill.account,
                warehouse: updatedWaybill.warehouse,
                items: updatedWaybill.items
            } : updatedWaybill;
        }).then(async (result)=>{
            // After transaction: recalculate status
            const tenantId = await this.tenantResolver.resolveForQuery();
            if (id && tenantId) {
                await this.statusCalculator.recalculateCascade(id, String(tenantId)).catch((err)=>console.error('[SalesWaybill] recalculateCascade after update failed:', err?.message));
            }
            return result;
        });
    }
    async remove(id, userId, ipAddress, userAgent) {
        const deliveryNote = await this.prisma.salesDeliveryNote.findUnique({
            where: {
                id
            },
            include: {
                invoices: true
            }
        });
        if (!deliveryNote) {
            throw new _common.NotFoundException(`Waybill not found: ${id}`);
        }
        // Invoiced deliveryNote cannot be deleted
        if (deliveryNote.status === _saleswaybillenums.DeliveryNoteStatus.INVOICED) {
            throw new _common.BadRequestException('Invoiced waybill cannot be deleted');
        }
        // DeliveryNote linked to an invoice cannot be deleted
        if (deliveryNote.invoices && deliveryNote.invoices.length > 0) {
            throw new _common.BadRequestException('Waybill linked to an invoice cannot be deleted');
        }
        return this.prisma.$transaction(async (prisma)=>{
            // Soft delete
            await prisma.salesDeliveryNote.update({
                where: {
                    id
                },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId
                }
            });
            // Remove deliveryNoteId from Order
            if (deliveryNote.sourceType === _saleswaybillenums.DeliveryNoteSourceType.ORDER && deliveryNote.sourceId) {
                await prisma.salesOrder.update({
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
            // Since we soft deleted the DN, recalculateOrderStatus for the order it WAS attached to
            if (deliveryNote.sourceId && tenantId) {
                await this.statusCalculator.recalculateOrderStatus(deliveryNote.sourceId, String(tenantId)).catch((err)=>console.error('[SalesWaybill] recalculateOrderStatus after remove failed:', err?.message));
            }
        });
    }
    async getPendingByAccount(accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.salesDeliveryNote.findMany({
            where: {
                accountId: accountId,
                status: {
                    not: _saleswaybillenums.DeliveryNoteStatus.INVOICED
                },
                deletedAt: null,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
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
                }
            },
            orderBy: {
                date: 'desc'
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
        // Monthly total
        const monthlyStats = await this.prisma.salesDeliveryNote.aggregate({
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
        // Pending Notes (NOT_INVOICED)
        const pendingStats = await this.prisma.salesDeliveryNote.aggregate({
            where: {
                ...baseWhere,
                status: _saleswaybillenums.DeliveryNoteStatus.NOT_INVOICED
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        // Delivered Notes (INVOICED) -> Mapping to Delivered as per frontend usage
        const deliveredStats = await this.prisma.salesDeliveryNote.aggregate({
            where: {
                ...baseWhere,
                status: _saleswaybillenums.DeliveryNoteStatus.INVOICED
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
            pendingNotes: {
                totalAmount: pendingStats._sum.grandTotal ? pendingStats._sum.grandTotal.toNumber() : 0,
                count: pendingStats._count || 0
            },
            deliveredNotes: {
                totalAmount: deliveredStats._sum.grandTotal ? deliveredStats._sum.grandTotal.toNumber() : 0,
                count: deliveredStats._count || 0
            }
        };
    }
    constructor(prisma, tenantResolver, codeTemplateService, statusCalculator){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.statusCalculator = statusCalculator;
    }
};
SalesWaybillService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _statuscalculatorservice.StatusCalculatorService === "undefined" ? Object : _statuscalculatorservice.StatusCalculatorService
    ])
], SalesWaybillService);

//# sourceMappingURL=sales-waybill.service.js.map