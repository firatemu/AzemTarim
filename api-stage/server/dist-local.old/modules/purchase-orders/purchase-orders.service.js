// CHANGED: create, update, cancel
// REASON: purchase workflow status automation v2
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PurchaseOrdersService", {
    enumerable: true,
    get: function() {
        return PurchaseOrdersService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _purchasewaybillservice = require("../purchase-waybill/purchase-waybill.service");
const _unitsetservice = require("../unit-set/unit-set.service");
const _purchasestatuscalculatorservice = require("../shared/purchase-status-calculator/purchase-status-calculator.service");
const _saleswaybillenums = require("../sales-waybill/sales-waybill.enums");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _codetemplateenums = require("../code-template/code-template.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let PurchaseOrdersService = class PurchaseOrdersService {
    async createLog(orderId, actionType, userId, changes, ipAddress, userAgent, tx) {
        const prisma = tx || this.prisma;
        const tenantId = await this.tenantResolver.resolveForQuery();
        await prisma.purchaseOrderLocalLog.create({
            data: {
                orderId: orderId,
                userId,
                actionType: actionType,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress,
                userAgent,
                tenantId
            }
        });
    }
    async findAll(query) {
        const page = query.page ? parseInt(query.page) : 1;
        const limit = query.limit ? parseInt(query.limit) : 50;
        const skip = (page - 1) * limit;
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (query.status) {
            where.status = query.status;
        }
        if (query.accountId) {
            where.accountId = query.accountId;
        }
        if (query.search) {
            where.OR = [
                {
                    orderNo: {
                        contains: query.search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: query.search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    account: {
                        code: {
                            contains: query.search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.procurementOrder.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    orderNo: true,
                    date: true,
                    dueDate: true,
                    status: true,
                    totalAmount: true,
                    vatAmount: true,
                    grandTotal: true,
                    discount: true,
                    notes: true,
                    invoiceNo: true,
                    tenantId: true,
                    createdAt: true,
                    createdBy: true,
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true,
                            type: true
                        }
                    },
                    items: {
                        select: {
                            id: true,
                            productId: true,
                            quantity: true,
                            deliveredQuantity: true,
                            unitPrice: true,
                            vatRate: true,
                            amount: true,
                            vatAmount: true
                        }
                    },
                    deliveryNotes: {
                        select: {
                            id: true,
                            deliveryNoteNo: true,
                            invoice: {
                                select: {
                                    invoiceNo: true
                                }
                            }
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
            this.prisma.procurementOrder.count({
                where
            })
        ]);
        const mappedData = data.map((item)=>{
            const allInvoices = new Set();
            if (item.invoiceNo) allInvoices.add(item.invoiceNo);
            item.deliveryNotes?.forEach((dn)=>{
                if (dn.invoice?.invoiceNo) {
                    allInvoices.add(dn.invoice.invoiceNo);
                }
            });
            return {
                ...item,
                invoiceNos: Array.from(allInvoices)
            };
        });
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
        const tenantId = await this.tenantResolver.resolveForQuery();
        const order = await this.prisma.procurementOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                account: true,
                items: {
                    include: {
                        product: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                logs: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                deliveryNotes: true,
                invoices: true
            }
        });
        if (!order) {
            throw new _common.NotFoundException(`Order not found: ${id}`);
        }
        return order;
    }
    async create(dto, userId, ipAddress, userAgent) {
        const { items, ...orderData } = dto;
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const existingOrder = await this.prisma.procurementOrder.findFirst({
            where: {
                orderNo: orderData.orderNo,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (existingOrder) {
            throw new _common.BadRequestException(`This order number already exists: ${orderData.orderNo}`);
        }
        // Account check
        const account = await this.prisma.account.findFirst({
            where: {
                id: orderData.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!account) {
            throw new _common.NotFoundException(`Account not found: ${orderData.accountId}`);
        }
        // Validate quantities for unit divisibility
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: items.map((i)=>i.productId)
                }
            },
            select: {
                id: true,
                unitId: true
            }
        });
        for (const item of items){
            const product = products.find((p)=>p.id === item.productId);
            if (product?.unitId) {
                await this.unitSetService.validateQuantity(product.unitId, item.quantity);
            }
        }
        // Calculations
        let subTotal = new _library.Decimal(0);
        let totalTax = new _library.Decimal(0);
        let totalDiscount = new _library.Decimal(0);
        const itemsWithCalculations = items.map((item)=>{
            const unitPrice = new _library.Decimal(item.unitPrice);
            const quantity = new _library.Decimal(item.quantity);
            const lineTotal = quantity.mul(unitPrice);
            const lineDiscount = new _library.Decimal(item.discountAmount || 0);
            const lineNetTotal = lineTotal.sub(lineDiscount);
            const lineTax = lineNetTotal.mul(new _library.Decimal(item.vatRate)).div(100);
            subTotal = subTotal.add(lineTotal);
            totalTax = totalTax.add(lineTax);
            totalDiscount = totalDiscount.add(lineDiscount);
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                vatRate: item.vatRate,
                amount: lineNetTotal,
                vatAmount: lineTax
            };
        });
        const generalDiscount = new _library.Decimal(orderData.discount || 0);
        const finalTotalDiscount = totalDiscount.add(generalDiscount);
        const totalAmount = subTotal.sub(finalTotalDiscount);
        const grandTotal = totalAmount.add(totalTax);
        return this.prisma.$transaction(async (tx)=>{
            const order = await tx.procurementOrder.create({
                data: {
                    orderNo: orderData.orderNo,
                    accountId: orderData.accountId,
                    date: orderData.date ? new Date(orderData.date) : new Date(),
                    dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
                    tenantId: tenantId || undefined,
                    status: orderData.status || _client.PurchaseOrderLocalStatus.PENDING,
                    totalAmount,
                    vatAmount: totalTax,
                    grandTotal,
                    discount: generalDiscount,
                    notes: orderData.notes,
                    createdBy: userId,
                    items: {
                        create: itemsWithCalculations
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
            await this.createLog(order.id, 'CREATE', userId, {
                order: orderData,
                items
            }, ipAddress, userAgent, tx);
            return order;
        }).then(async (result)=>{
            // Background status recalculation
            const resolveTenantId = await this.tenantResolver.resolveForQuery();
            if (result?.id && resolveTenantId) {
                await this.purchaseStatusCalculator.recalculateOrderStatus(result.id, String(resolveTenantId)).catch((err)=>console.error('[PurchaseOrderService] Error in recalculateOrderStatus after create:', err));
            }
            return result;
        });
    }
    async update(id, dto, userId, ipAddress, userAgent) {
        const existingOrder = await this.findOne(id);
        if (existingOrder.status === _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Faturalandırılmış sipariş düzenlenemez');
        }
        if (existingOrder.status === _client.PurchaseOrderLocalStatus.CANCELLED) {
            throw new _common.BadRequestException('İptal edilmiş sipariş düzenlenemez');
        }
        const { items, ...orderData } = dto;
        return this.prisma.$transaction(async (tx)=>{
            let updatedData = {
                ...orderData
            };
            if (items && items.length > 0) {
                // 1. Fetch current items
                const currentItems = await tx.procurementOrderItem.findMany({
                    where: {
                        orderId: id
                    }
                });
                // Validate quantities for unit divisibility
                const products = await this.prisma.product.findMany({
                    where: {
                        id: {
                            in: items.map((i)=>i.productId)
                        }
                    },
                    select: {
                        id: true,
                        unitId: true
                    }
                });
                for (const item of items){
                    const product = products.find((p)=>p.id === item.productId);
                    if (product?.unitId) {
                        await this.unitSetService.validateQuantity(product.unitId, item.quantity);
                    }
                }
                let subTotal = new _library.Decimal(0);
                let totalTax = new _library.Decimal(0);
                let totalDiscount = new _library.Decimal(0);
                const newItemsToCreate = [];
                const itemsToUpdate = [];
                const processedExistingItemIds = new Set();
                // 2. Identify items to update or create
                for (const item of items){
                    const unitPrice = new _library.Decimal(item.unitPrice);
                    const quantity = new _library.Decimal(item.quantity);
                    const lineTotal = quantity.mul(unitPrice);
                    const lineDiscount = new _library.Decimal(item.discountAmount || 0);
                    const lineNetTotal = lineTotal.sub(lineDiscount);
                    const lineTax = lineNetTotal.mul(new _library.Decimal(item.vatRate)).div(100);
                    subTotal = subTotal.add(lineTotal);
                    totalTax = totalTax.add(lineTax);
                    totalDiscount = totalDiscount.add(lineDiscount);
                    // Try to match with an existing item that hasn't been processed yet
                    const existingItem = currentItems.find((ci)=>ci.productId === item.productId && !processedExistingItemIds.has(ci.id));
                    const itemData = {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice,
                        vatRate: item.vatRate,
                        amount: lineNetTotal,
                        vatAmount: lineTax,
                        discountRate: item.discountRate || 0,
                        discountAmount: item.discountAmount || 0
                    };
                    if (existingItem) {
                        // Validate: cannot reduce quantity below received amount
                        if (Number(item.quantity) < Number(existingItem.deliveredQuantity || 0)) {
                            throw new _common.BadRequestException(`Ürün miktarı (${item.quantity}), teslim alınan miktardan (${existingItem.deliveredQuantity}) az olamaz.`);
                        }
                        itemsToUpdate.push({
                            id: existingItem.id,
                            data: itemData
                        });
                        processedExistingItemIds.add(existingItem.id);
                    } else {
                        newItemsToCreate.push({
                            ...itemData,
                            orderId: id
                        });
                    }
                }
                // 3. Identify items to delete (those not in new list and not received)
                const itemIdsToDelete = currentItems.filter((ci)=>!processedExistingItemIds.has(ci.id)).map((ci)=>{
                    if (Number(ci.deliveredQuantity || 0) > 0) {
                        throw new _common.BadRequestException(`Teslim alınmış kalemler silinemez (Ürün ID: ${ci.productId}).`);
                    }
                    return ci.id;
                });
                // 4. Perform DB operations
                if (itemIdsToDelete.length > 0) {
                    await tx.procurementOrderItem.deleteMany({
                        where: {
                            id: {
                                in: itemIdsToDelete
                            }
                        }
                    });
                }
                for (const update of itemsToUpdate){
                    await tx.procurementOrderItem.update({
                        where: {
                            id: update.id
                        },
                        data: update.data
                    });
                }
                const generalDiscount = new _library.Decimal(dto.discount ?? Number(existingOrder.discount));
                const finalTotalDiscount = totalDiscount.add(generalDiscount);
                const totalAmount = subTotal.sub(finalTotalDiscount);
                const grandTotal = totalAmount.add(totalTax);
                updatedData.totalAmount = totalAmount;
                updatedData.vatAmount = totalTax;
                updatedData.grandTotal = grandTotal;
                updatedData.items = {
                    create: newItemsToCreate.map(({ orderId: _orderId, ...rest })=>rest)
                };
            }
            await tx.procurementOrder.update({
                where: {
                    id
                },
                data: {
                    ...updatedData,
                    updatedBy: userId
                }
            });
            const updatedOrder = await tx.procurementOrder.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(existingOrder.tenantId ?? undefined)
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
            await this.createLog(id, 'UPDATE', userId, {
                old: existingOrder,
                new: dto
            }, ipAddress, userAgent, tx);
            return updatedOrder;
        }).then(async (result)=>{
            // Background status recalculation
            const resolveTenantId = await this.tenantResolver.resolveForQuery();
            if (result?.id && resolveTenantId) {
                await this.purchaseStatusCalculator.recalculateOrderStatus(result.id, String(resolveTenantId)).catch((err)=>console.error('[PurchaseOrderService] Error in recalculateOrderStatus after update:', err));
            }
            return result;
        });
    }
    async remove(id, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Faturalandırılmış sipariş silinemez');
        }
        return this.prisma.$transaction(async (tx)=>{
            await tx.procurementOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId
                }
            });
            await this.createLog(id, 'DELETE', userId, {
                order
            }, ipAddress, userAgent, tx);
            return {
                success: true
            };
        });
    }
    async cancel(id, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Faturalandırılmış sipariş iptal edilemez');
        }
        if (order.status === _client.PurchaseOrderLocalStatus.CANCELLED) {
            throw new _common.BadRequestException('Sipariş zaten iptal edilmiş');
        }
        return this.prisma.$transaction(async (tx)=>{
            await tx.procurementOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    status: _client.PurchaseOrderLocalStatus.CANCELLED,
                    updatedBy: userId
                }
            });
            await this.createLog(id, _client.LogAction.CANCELLATION, userId, {
                status: _client.PurchaseOrderLocalStatus.CANCELLED
            }, ipAddress, userAgent, tx);
            return {
                success: true
            };
        });
    }
    async changeStatus(id, status, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED && status !== _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Faturalandırılmış siparişin durumu değiştirilemez');
        }
        return this.prisma.$transaction(async (tx)=>{
            await tx.procurementOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    status,
                    updatedBy: userId
                }
            });
            await this.createLog(id, _client.LogAction.STATUS_CHANGE, userId, {
                oldStatus: order.status,
                newStatus: status
            }, ipAddress, userAgent, tx);
            return {
                success: true
            };
        });
    }
    async markAsInvoiced(id, invoiceNo, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Order already invoiced');
        }
        return this.prisma.$transaction(async (tx)=>{
            await tx.procurementOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    status: _client.PurchaseOrderLocalStatus.INVOICED,
                    invoiceNo,
                    updatedBy: userId
                }
            });
            await this.createLog(id, _client.LogAction.STATUS_CHANGE, userId, {
                oldStatus: order.status,
                newStatus: _client.PurchaseOrderLocalStatus.INVOICED,
                invoiceNo
            }, ipAddress, userAgent, tx);
            return {
                success: true
            };
        });
    }
    async findDeleted(query) {
        const page = query.page ? parseInt(query.page) : 1;
        const limit = query.limit ? parseInt(query.limit) : 50;
        const skip = (page - 1) * limit;
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: {
                not: null
            },
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (query.search) {
            where.OR = [
                {
                    orderNo: {
                        contains: query.search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: query.search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    account: {
                        code: {
                            contains: query.search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.procurementOrder.findMany({
                where,
                skip,
                take: limit,
                include: {
                    account: true,
                    deletedByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    deletedAt: 'desc'
                }
            }),
            this.prisma.procurementOrder.count({
                where
            })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async restore(id, userId, ipAddress, userAgent) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const order = await this.prisma.procurementOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!order) throw new _common.NotFoundException(`Order not found: ${id}`);
        if (!order.deletedAt) throw new _common.BadRequestException('Sipariş zaten aktif');
        return this.prisma.$transaction(async (tx)=>{
            await tx.procurementOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    deletedAt: null,
                    deletedBy: null,
                    updatedBy: userId
                }
            });
            await this.createLog(id, 'RESTORE', userId, {}, ipAddress, userAgent, tx);
            return {
                success: true
            };
        });
    }
    async receive(id, items, userId, ipAddress, userAgent, warehouseId, notes, deliveryNoteNo) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.CANCELLED) {
            throw new _common.BadRequestException('İptal edilmiş siparişlere teslim alınamaz');
        }
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED) {
            throw new _common.BadRequestException('Faturalandırılmış siparişlerin tüm kalemleri zaten teslim alınmış');
        }
        // Validate quantities
        for (const receiveItem of items){
            const orderItem = order.items.find((oi)=>oi.productId === receiveItem.productId);
            if (!orderItem) {
                throw new _common.BadRequestException(`Sipariş kalemi bulunamadı: ${receiveItem.productId}`);
            }
            const remaining = Number(orderItem.quantity) - Number(orderItem.deliveredQuantity || 0);
            if (receiveItem.quantity > remaining) {
                throw new _common.BadRequestException(`Teslim alınmak istenen miktar (${receiveItem.quantity}) kalan miktardan (${remaining}) fazla olamaz.`);
            }
        }
        // Generate delivery note number
        let waybillNo = deliveryNoteNo;
        if (!waybillNo) {
            try {
                waybillNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.DELIVERY_NOTE_PURCHASE);
            } catch (error) {
                const year = new Date().getFullYear();
                waybillNo = `AIR-${year}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
            }
        }
        const waybillItems = items.map((receiveItem)=>{
            const orderItem = order.items.find((oi)=>oi.productId === receiveItem.productId);
            return {
                productId: receiveItem.productId,
                quantity: receiveItem.quantity,
                unitPrice: Number(orderItem.unitPrice),
                vatRate: orderItem.vatRate
            };
        });
        const createWaybillDto = {
            deliveryNoteNo: waybillNo,
            deliveryNoteDate: new Date().toISOString(),
            accountId: order.accountId,
            sourceType: _saleswaybillenums.DeliveryNoteSourceType.ORDER,
            sourceId: order.id,
            status: _saleswaybillenums.DeliveryNoteStatus.NOT_INVOICED,
            discount: Number(order.discount) || 0,
            notes: notes || `Sipariş ${order.orderNo} üzerinden oluşturuldu.`,
            warehouseId,
            items: waybillItems
        };
        return this.prisma.$transaction(async (tx)=>{
            // Update deliveredQuantity on each order item
            for (const receiveItem of items){
                const orderItem = order.items.find((oi)=>oi.productId === receiveItem.productId);
                const newDeliveredQty = Number(orderItem.deliveredQuantity || 0) + receiveItem.quantity;
                await tx.procurementOrderItem.update({
                    where: {
                        id: orderItem.id
                    },
                    data: {
                        deliveredQuantity: newDeliveredQty
                    }
                });
            }
            // Create purchase waybill
            const waybill = await this.purchaseWaybillService.create(createWaybillDto, userId, ipAddress, userAgent);
            await this.createLog(id, _client.LogAction.STATUS_CHANGE, userId, {
                action: 'RECEIVE',
                items,
                waybillNo
            }, ipAddress, userAgent, tx);
            return waybill;
        }).then(async (result)=>{
            // Recalculate status in background
            if (result && tenantId) {
                await this.purchaseStatusCalculator.recalculateOrderStatus(id, String(tenantId)).catch((err)=>console.error('[PurchaseOrderService] recalculateOrderStatus after receive failed:', err?.message));
            }
            return result;
        });
    }
    async findOrdersForReceiving(accountId, search) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            status: {
                in: [
                    _client.PurchaseOrderLocalStatus.PENDING,
                    _client.PurchaseOrderLocalStatus.PARTIAL
                ]
            }
        };
        if (accountId) where.accountId = accountId;
        if (search) {
            where.OR = [
                {
                    orderNo: {
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
        const orders = await this.prisma.procurementOrder.findMany({
            where,
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
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return orders.filter((order)=>order.items.some((item)=>Number(item.quantity) > Number(item.deliveredQuantity || 0)));
    }
    async findOrdersForInvoice(accountId, search) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            status: {
                notIn: [
                    _client.PurchaseOrderLocalStatus.CANCELLED,
                    _client.PurchaseOrderLocalStatus.INVOICED
                ]
            }
        };
        if (accountId) where.accountId = accountId;
        if (search) {
            where.OR = [
                {
                    orderNo: {
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
        return this.prisma.procurementOrder.findMany({
            where,
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                items: true,
                deliveryNotes: {
                    select: {
                        id: true,
                        deliveryNoteNo: true,
                        grandTotal: true,
                        status: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async createWaybill(id, userId, ipAddress, userAgent) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const order = await this.findOne(id);
        if (order.status === _client.PurchaseOrderLocalStatus.INVOICED || order.status === _client.PurchaseOrderLocalStatus.CANCELLED) {
            throw new _common.BadRequestException('Faturalandırılmış veya iptal edilmiş siparişlerden irsaliye oluşturulamaz');
        }
        // Logic for generating waybill from order items
        // This part depends on PurchaseWaybillService which is legacy named but functionally used
        let waybillNo;
        try {
            waybillNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.DELIVERY_NOTE_PURCHASE);
        } catch (error) {
            const year = new Date().getFullYear();
            waybillNo = `IRS-${year}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        }
        const waybillItems = order.items.map((item)=>({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                vatRate: item.vatRate
            }));
        const createWaybillDto = {
            deliveryNoteNo: waybillNo,
            deliveryNoteDate: new Date().toISOString(),
            accountId: order.accountId,
            sourceType: _saleswaybillenums.DeliveryNoteSourceType.ORDER,
            sourceId: order.id,
            status: _saleswaybillenums.DeliveryNoteStatus.NOT_INVOICED,
            discount: Number(order.discount) || 0,
            notes: `Sipariş ${order.orderNo} üzerinden oluşturuldu.`,
            items: waybillItems
        };
        return this.purchaseWaybillService.create(createWaybillDto, userId, ipAddress, userAgent);
    }
    async getStats(startDate, endDate, status, accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const baseWhere = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (accountId) {
            baseWhere.accountId = accountId;
        }
        if (status) {
            baseWhere.status = status;
        }
        // Monthly orders (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthlyWhere = {
            ...baseWhere,
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        };
        const [monthlyOrders, pendingOrders, completedOrders] = await Promise.all([
            this.prisma.procurementOrder.aggregate({
                where: monthlyWhere,
                _count: {
                    id: true
                },
                _sum: {
                    grandTotal: true
                }
            }),
            this.prisma.procurementOrder.aggregate({
                where: {
                    ...baseWhere,
                    status: _client.PurchaseOrderLocalStatus.PENDING
                },
                _count: {
                    id: true
                },
                _sum: {
                    grandTotal: true
                }
            }),
            this.prisma.procurementOrder.aggregate({
                where: {
                    ...baseWhere,
                    status: _client.PurchaseOrderLocalStatus.COMPLETED
                },
                _count: {
                    id: true
                },
                _sum: {
                    grandTotal: true
                }
            })
        ]);
        return {
            monthlyOrders: {
                totalAmount: Number(monthlyOrders._sum.grandTotal || 0),
                count: monthlyOrders._count.id
            },
            pendingOrders: {
                totalAmount: Number(pendingOrders._sum.grandTotal || 0),
                count: pendingOrders._count.id
            },
            completedOrders: {
                totalAmount: Number(completedOrders._sum.grandTotal || 0),
                count: completedOrders._count.id
            }
        };
    }
    constructor(prisma, tenantResolver, purchaseWaybillService, codeTemplateService, unitSetService, purchaseStatusCalculator){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.purchaseWaybillService = purchaseWaybillService;
        this.codeTemplateService = codeTemplateService;
        this.unitSetService = unitSetService;
        this.purchaseStatusCalculator = purchaseStatusCalculator;
    }
};
PurchaseOrdersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_purchasewaybillservice.PurchaseWaybillService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _purchasewaybillservice.PurchaseWaybillService === "undefined" ? Object : _purchasewaybillservice.PurchaseWaybillService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _unitsetservice.UnitSetService === "undefined" ? Object : _unitsetservice.UnitSetService,
        typeof _purchasestatuscalculatorservice.PurchaseStatusCalculatorService === "undefined" ? Object : _purchasestatuscalculatorservice.PurchaseStatusCalculatorService
    ])
], PurchaseOrdersService);

//# sourceMappingURL=purchase-orders.service.js.map