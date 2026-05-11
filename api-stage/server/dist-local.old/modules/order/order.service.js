"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OrderService", {
    enumerable: true,
    get: function() {
        return OrderService;
    }
});
const _common = require("@nestjs/common");
const _orderenums = require("./order.enums");
const _client = require("@prisma/client");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _saleswaybillservice = require("../sales-waybill/sales-waybill.service");
const _unitsetservice = require("../unit-set/unit-set.service");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let OrderService = class OrderService {
    async createLog(orderId, actionType, userId, changes, ipAddress, userAgent, tx, tenantId) {
        const prisma = tx || this.prisma;
        const resolvedTenantId = tenantId ?? await this.tenantResolver.resolveForQuery();
        await prisma.salesOrderLog.create({
            data: {
                orderId,
                userId,
                actionType,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress,
                userAgent,
                tenantId: resolvedTenantId ?? undefined
            }
        });
    }
    async findAll(page = 1, limit = 50, orderType, search, accountId, status) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const model = isProcurement ? this.prisma.procurementOrder : this.prisma.salesOrder;
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (accountId) {
            where.accountId = accountId;
        }
        if (status) {
            where.status = status;
        }
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
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        let data;
        try {
            data = await model.findMany({
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
                    deliveryNoteId: true,
                    createdAt: true,
                    updatedAt: true,
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true,
                            type: true
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
                    },
                    deliveryNotes: {
                        select: {
                            id: true,
                            deliveryNoteNo: true,
                            invoiceNos: true
                        }
                    },
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            deliveredQuantity: true
                        }
                    },
                    deliveryNote: {
                        select: {
                            id: true,
                            deliveryNoteNo: true
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
            });
            const total = await model.count({
                where
            });
            const mappedData = data.map((item)=>{
                const allInvoices = new Set();
                if (item.invoiceNo) allInvoices.add(item.invoiceNo);
                item.deliveryNotes?.forEach((dn)=>{
                    if (dn.invoiceNos && Array.isArray(dn.invoiceNos)) {
                        dn.invoiceNos.forEach((inv)=>{
                            if (inv) allInvoices.add(inv);
                        });
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
        } catch (error) {
            throw error;
        }
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        let order = await this.prisma.salesOrder.findFirst({
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
                }
            }
        });
        if (!order) {
            order = await this.prisma.procurementOrder.findFirst({
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
                    }
                }
            });
        }
        if (!order) {
            throw new _common.NotFoundException(`Order not found: ${id}`);
        }
        // Recalculate status
        if (order.id && tenantId) {
            await this.statusCalculator.recalculateOrderStatus(order.id, String(tenantId)).catch((err)=>console.error('[OrderService] Recalculate order status failed:', err?.message));
        }
        return order;
    }
    async create(createOrderDto, userId, ipAddress, userAgent) {
        const { items, orderType, ...orderData } = createOrderDto;
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const model = isProcurement ? this.prisma.procurementOrder : this.prisma.salesOrder;
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const finalTenantId = orderData.tenantId || tenantId || undefined;
        const existingOrder = await model.findFirst({
            where: {
                orderNo: orderData.orderNo,
                ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
            }
        });
        if (existingOrder) {
            throw new _common.BadRequestException(`Order number already exists: ${orderData.orderNo}`);
        }
        const account = await this.prisma.account.findFirst({
            where: {
                id: orderData.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
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
        let totalAmount = new _client.Prisma.Decimal(0);
        let vatAmount = new _client.Prisma.Decimal(0);
        const itemsWithCalculations = items.map((item)=>{
            const lineTotal = new _client.Prisma.Decimal(item.quantity).mul(item.unitPrice);
            const lineVat = lineTotal.mul(item.vatRate).div(100);
            totalAmount = totalAmount.add(lineTotal);
            vatAmount = vatAmount.add(lineVat);
            const data = {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                vatAmount: lineVat
            };
            if (isProcurement) {
                data.amount = lineTotal.add(lineVat);
            } else {
                data.totalAmount = lineTotal.add(lineVat);
            }
            return data;
        });
        const discount = new _client.Prisma.Decimal(orderData.discount || 0);
        const grandTotal = totalAmount.add(vatAmount).sub(discount);
        return this.prisma.$transaction(async (prisma)=>{
            const createData = {
                orderNo: orderData.orderNo,
                date: orderData.date ? new Date(orderData.date) : new Date(),
                accountId: orderData.accountId,
                tenantId: finalTenantId,
                totalAmount,
                vatAmount,
                grandTotal,
                discount,
                notes: orderData.notes,
                dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
                status: orderData.status,
                createdBy: userId,
                items: {
                    create: itemsWithCalculations
                }
            };
            // Only add type for sales orders (procurement orders don't have type field)
            if (!isProcurement) {
                createData.type = orderType;
            }
            const order = await prisma[isProcurement ? 'procurementOrder' : 'salesOrder'].create({
                data: createData,
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            if (!isProcurement) {
                await this.createLog(order.id, _client.LogAction.CREATE, userId, {
                    order: orderData,
                    items
                }, ipAddress, userAgent, prisma, finalTenantId ?? undefined);
            }
            // Recalculate status after creation
            if (order.id && finalTenantId) {
                await this.statusCalculator.recalculateOrderStatus(order.id, String(finalTenantId)).catch((err)=>console.error('[OrderService] Recalculate order status after create failed:', err?.message));
            }
            return order;
        });
    }
    async update(id, updateOrderDto, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === 'INVOICED') {
            throw new _common.BadRequestException('Invoiced order cannot be updated');
        }
        const { items, ...orderData } = updateOrderDto;
        const isProcurement = !('type' in order);
        const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';
        const itemsModelName = isProcurement ? 'procurementOrderItem' : 'salesOrderItem';
        const { orderType, ...actualOrderData } = orderData;
        if (!isProcurement && orderType) {
            actualOrderData.type = orderType;
        }
        if (!items) {
            const updated = await this.prisma[modelName].update({
                where: {
                    id
                },
                data: {
                    ...actualOrderData,
                    updatedBy: userId
                }
            });
            if (!isProcurement) {
                await this.createLog(id, _client.LogAction.UPDATE, userId, {
                    changes: updateOrderDto
                }, ipAddress, userAgent);
            }
            return updated;
        }
        return this.prisma.$transaction(async (prisma)=>{
            // 1. Fetch current items to perform sync
            const currentItems = await prisma[itemsModelName].findMany({
                where: {
                    orderId: id
                }
            });
            // Validate quantities for unit divisibility
            const productIds = items.map((i)=>i.productId);
            const products = await this.prisma.product.findMany({
                where: {
                    id: {
                        in: productIds
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
            let totalAmount = new _client.Prisma.Decimal(0);
            let vatAmount = new _client.Prisma.Decimal(0);
            const newItemsToCreate = [];
            const itemsToUpdate = [];
            const processedExistingItemIds = new Set();
            // 2. Identify items to update or create
            for (const item of items){
                const lineTotal = new _client.Prisma.Decimal(item.quantity).mul(item.unitPrice);
                const lineVat = lineTotal.mul(item.vatRate).div(100);
                totalAmount = totalAmount.add(lineTotal);
                vatAmount = vatAmount.add(lineVat);
                // Try to match with an existing item that hasn't been processed yet
                const existingItem = currentItems.find((ci)=>ci.productId === item.productId && !processedExistingItemIds.has(ci.id));
                const itemData = {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    vatRate: item.vatRate,
                    vatAmount: lineVat,
                    discountRate: item.discountRate || 0,
                    discountAmount: item.discountAmount || 0,
                    discountType: item.discountType || 'pct',
                    unit: item.unit
                };
                if (isProcurement) {
                    itemData.amount = lineTotal.add(lineVat);
                } else {
                    itemData.totalAmount = lineTotal.add(lineVat);
                }
                if (existingItem) {
                    // Validate: cannot reduce quantity below delivered amount
                    if (Number(item.quantity) < Number(existingItem.deliveredQuantity || 0)) {
                        throw new _common.BadRequestException(`Ürün miktarı (${item.quantity}), sevk edilen miktardan (${existingItem.deliveredQuantity}) az olamaz.`);
                    }
                    itemsToUpdate.push({
                        id: existingItem.id,
                        data: itemData
                    });
                    processedExistingItemIds.add(existingItem.id);
                } else {
                    newItemsToCreate.push(itemData);
                }
            }
            // 3. Identify items to delete (those not in new list and not delivered)
            const itemIdsToDelete = currentItems.filter((ci)=>!processedExistingItemIds.has(ci.id)).map((ci)=>{
                if (Number(ci.deliveredQuantity || 0) > 0) {
                    throw new _common.BadRequestException(`Sevk işlemi yapılmış kalemler silinemez (Ürün ID: ${ci.productId}).`);
                }
                return ci.id;
            });
            // 4. Perform DB operations
            if (itemIdsToDelete.length > 0) {
                await prisma[itemsModelName].deleteMany({
                    where: {
                        id: {
                            in: itemIdsToDelete
                        }
                    }
                });
            }
            for (const update of itemsToUpdate){
                await prisma[itemsModelName].update({
                    where: {
                        id: update.id
                    },
                    data: update.data
                });
            }
            const discount = new _client.Prisma.Decimal(orderData.discount ?? order.discount);
            const grandTotal = totalAmount.add(vatAmount).sub(discount);
            const updated = await prisma[modelName].update({
                where: {
                    id
                },
                data: {
                    ...actualOrderData,
                    totalAmount,
                    vatAmount,
                    grandTotal,
                    discount,
                    updatedBy: userId,
                    items: {
                        create: newItemsToCreate
                    }
                }
            });
            if (!isProcurement) {
                await this.createLog(id, _client.LogAction.UPDATE, userId, {
                    changes: updateOrderDto
                }, ipAddress, userAgent, prisma, order.tenantId ?? undefined);
            }
            // Recalculate status after update
            const tenantId = await this.tenantResolver.resolveForQuery();
            if (id && tenantId) {
                await this.statusCalculator.recalculateOrderStatus(id, String(tenantId)).catch((err)=>console.error('[OrderService] Recalculate order status after update failed:', err?.message));
            }
            return updated;
        });
    }
    async remove(id, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === 'INVOICED') {
            throw new _common.BadRequestException('Invoiced order cannot be deleted');
        }
        const isProcurement = !('deliveryNoteId' in order);
        const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';
        await this.prisma[modelName].updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
            },
            data: {
                deletedAt: new Date(),
                deletedBy: userId
            }
        });
        if (!isProcurement) {
            await this.createLog(id, _client.LogAction.DELETE, userId, null, ipAddress, userAgent);
        }
        return {
            message: 'Order deleted'
        };
    }
    async restore(id, userId, ipAddress, userAgent) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        let order = await this.prisma.salesOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        let modelName = 'salesOrder';
        if (!order) {
            order = await this.prisma.procurementOrder.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            modelName = 'procurementOrder';
        }
        if (!order) {
            throw new _common.NotFoundException(`Order not found: ${id}`);
        }
        if (!order.deletedAt) {
            throw new _common.BadRequestException('Order is already active');
        }
        const restored = await this.prisma[modelName].updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
            },
            data: {
                deletedAt: null,
                deletedBy: null
            }
        });
        if (modelName === 'salesOrder') {
            await this.createLog(id, _client.LogAction.RESTORE, userId, null, ipAddress, userAgent);
        }
        return restored;
    }
    async changeStatus(id, status, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === 'INVOICED') {
            throw new _common.BadRequestException('Invoiced order status cannot be changed');
        }
        const isProcurement = !('deliveryNoteId' in order);
        const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';
        const updated = await this.prisma[modelName].updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
            },
            data: {
                status,
                updatedBy: userId
            }
        });
        if (!isProcurement) {
            await this.createLog(id, _client.LogAction.UPDATE, userId, {
                oldStatus: order.status,
                newStatus: status
            }, ipAddress, userAgent);
        }
        return updated;
    }
    async cancel(id, userId, ipAddress, userAgent) {
        const result = await this.changeStatus(id, _orderenums.SalesOrderStatus.CANCELLED, userId, ipAddress, userAgent);
        // Recalculate status
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (id && tenantId) {
            await this.statusCalculator.recalculateOrderStatus(id, String(tenantId)).catch((err)=>console.error('[OrderService] Recalculate order status after cancel failed:', err?.message));
        }
        return result;
    }
    async findDeleted(page = 1, limit = 50, orderType, search) {
        const skip = (page - 1) * limit;
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: {
                not: null
            },
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
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
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma[modelName].findMany({
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
                    deletedByUser: {
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
                    deletedAt: 'desc'
                }
            }),
            this.prisma[modelName].count({
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
    async markInvoiced(id, invoiceNo, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (order.status === 'INVOICED') {
            throw new _common.BadRequestException('Order is already invoiced');
        }
        if (order.status === 'CANCELLED') {
            throw new _common.BadRequestException('Cancelled order cannot be invoiced');
        }
        // Sevk oranı kontrolü - %100 sevk edilmemiş sipariş faturalandırılamaz
        if (order.items && order.items.length > 0) {
            const totalQuantity = order.items.reduce((sum, item)=>sum + (Number(item.quantity) || 0), 0);
            const totalDelivered = order.items.reduce((sum, item)=>sum + (Number(item.deliveredQuantity) || 0), 0);
            if (totalQuantity > 0) {
                const shipmentRatio = totalDelivered / totalQuantity * 100;
                if (shipmentRatio < 99.9) {
                    throw new _common.BadRequestException(`Sipariş %${shipmentRatio.toFixed(1)} sevk edilmiş. Faturalandırılabilmesi için tamamen sevk edilmelidir.`);
                }
            }
        }
        const isProcurement = !('deliveryNoteId' in order);
        const modelName = isProcurement ? 'procurementOrder' : 'salesOrder';
        const updated = await this.prisma[modelName].updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
            },
            data: {
                status: 'INVOICED',
                invoiceNo: isProcurement ? undefined : invoiceNo,
                updatedBy: userId
            }
        });
        if (!isProcurement) {
            await this.createLog(id, _client.LogAction.UPDATE, userId, {
                oldStatus: order.status,
                newStatus: 'INVOICED',
                invoiceNo
            }, ipAddress, userAgent);
        }
        // Recalculate status
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (id && tenantId) {
            await this.statusCalculator.recalculateOrderStatus(id, String(tenantId)).catch((err)=>console.error('[OrderService] Recalculate order status after markInvoiced failed:', err?.message));
        }
        return updated;
    }
    async getPreparationDetails(id) {
        const order = await this.findOne(id);
        const itemsWithLocations = await Promise.all(order.items.map(async (item)=>{
            const locations = await this.prisma.productLocationStock.findMany({
                where: {
                    productId: item.productId,
                    qtyOnHand: {
                        gt: 0
                    },
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                include: {
                    location: {
                        include: {
                            warehouse: true
                        }
                    }
                },
                orderBy: {
                    location: {
                        code: 'asc'
                    }
                }
            });
            return {
                ...item,
                locations
            };
        }));
        return {
            ...order,
            items: itemsWithLocations
        };
    }
    async prepare(id, items, userId) {
        const order = await this.findOne(id);
        if (order.status !== 'PREPARING' && order.status !== 'PENDING') {
            throw new _common.BadRequestException('Order is not in preparation status');
        }
        return this.prisma.$transaction(async (prisma)=>{
            await prisma.orderPicking.deleteMany({
                where: {
                    orderId: id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                }
            });
            const pickingData = items.map((item)=>({
                    orderId: id,
                    orderItemId: item.orderItemId,
                    locationId: item.locationId,
                    quantity: item.quantity,
                    userId: userId
                }));
            await prisma.orderPicking.createMany({
                data: pickingData
            });
            await prisma.salesOrder.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                },
                data: {
                    status: _orderenums.SalesOrderStatus.PREPARED
                }
            });
            return this.findOne(id);
        });
    }
    async ship(id, shippedItems, userId, ipAddress, userAgent, warehouseId, notes, deliveryNoteNo) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const order = await this.prisma.salesOrder.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!order) {
            throw new _common.NotFoundException(`Order not found: ${id}`);
        }
        if (order.status === 'INVOICED' || order.status === 'CANCELLED') {
            throw new _common.BadRequestException('Faturalanmış veya iptal edilmiş siparişler sevk edilemez');
        }
        // Validate quantities before transaction
        for (const shipItem of shippedItems){
            const item = order.items.find((i)=>i.id === shipItem.itemId);
            if (!item) {
                throw new _common.NotFoundException(`Sipariş kalemi bulunamadı: ${shipItem.itemId}`);
            }
            const newDeliveredQuantity = (item.deliveredQuantity || 0) + shipItem.shippedQuantity;
            if (newDeliveredQuantity > Number(item.quantity)) {
                throw new _common.BadRequestException(`${item.product.name} için sevk miktarı (${newDeliveredQuantity}) sipariş miktarını (${item.quantity}) aşamaz`);
            }
        }
        // Generate delivery note number if not provided
        let finalDeliveryNoteNo = deliveryNoteNo;
        if (!finalDeliveryNoteNo) {
            try {
                const code = await this.codeTemplateService.getPreviewCode('SALES_WAYBILL');
                finalDeliveryNoteNo = code;
            } catch  {
                const year = new Date().getFullYear();
                const count = await this.prisma.salesDeliveryNote.count({
                    where: {
                        ...(0, _stagingutil.buildTenantWhereClause)(order.tenantId ?? undefined)
                    }
                });
                finalDeliveryNoteNo = `IRS-${year}-${String(count + 1).padStart(3, '0')}`;
            }
        }
        const result = await this.prisma.$transaction(async (prisma)=>{
            let subtotal = new _client.Prisma.Decimal(0);
            let totalVatAmount = new _client.Prisma.Decimal(0);
            const deliveryNoteItems = [];
            for (const shipItem of shippedItems){
                const item = order.items.find((i)=>i.id === shipItem.itemId);
                const newDeliveredQuantity = (item.deliveredQuantity || 0) + shipItem.shippedQuantity;
                await prisma.salesOrderItem.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        deliveredQuantity: newDeliveredQuantity
                    }
                });
                const lineSubtotal = new _client.Prisma.Decimal(shipItem.shippedQuantity).mul(item.unitPrice);
                const lineVat = lineSubtotal.mul(item.vatRate).div(100);
                const lineTotal = lineSubtotal.add(lineVat);
                subtotal = subtotal.add(lineSubtotal);
                totalVatAmount = totalVatAmount.add(lineVat);
                deliveryNoteItems.push({
                    productId: item.productId,
                    quantity: shipItem.shippedQuantity,
                    unitPrice: item.unitPrice,
                    vatRate: item.vatRate,
                    vatAmount: lineVat,
                    totalAmount: lineTotal,
                    tenantId: order.tenantId ?? undefined
                });
            }
            const grandTotal = subtotal.add(totalVatAmount);
            // Create SalesDeliveryNote automatically
            const deliveryNote = await prisma.salesDeliveryNote.create({
                data: {
                    deliveryNoteNo: finalDeliveryNoteNo,
                    date: new Date(),
                    tenantId: order.tenantId,
                    accountId: order.accountId,
                    warehouseId: warehouseId ?? null,
                    sourceType: 'ORDER',
                    sourceId: order.id,
                    status: 'NOT_INVOICED',
                    subtotal,
                    vatAmount: totalVatAmount,
                    grandTotal,
                    discount: new _client.Prisma.Decimal(0),
                    notes: notes ?? `${order.orderNo} nolu siparişten sevk`,
                    createdBy: userId,
                    items: {
                        create: deliveryNoteItems
                    }
                }
            });
            // Determine new order status
            const updatedItems = await prisma.salesOrderItem.findMany({
                where: {
                    orderId: id
                }
            });
            const allShipped = updatedItems.every((k)=>(k.deliveredQuantity || 0) >= Number(k.quantity));
            const someShipped = updatedItems.some((k)=>(k.deliveredQuantity || 0) > 0);
            let newStatus;
            if (allShipped) {
                newStatus = _orderenums.SalesOrderStatus.SHIPPED;
            } else if (someShipped) {
                newStatus = _orderenums.SalesOrderStatus.PARTIALLY_SHIPPED;
            }
            if (newStatus && order.status !== newStatus) {
                await prisma.salesOrder.update({
                    where: {
                        id
                    },
                    data: {
                        status: newStatus
                    }
                });
            }
            await this.createLog(id, _client.LogAction.UPDATE, userId, {
                shippedItems,
                deliveryNoteId: deliveryNote.id,
                deliveryNoteNo: finalDeliveryNoteNo
            }, ipAddress, userAgent, prisma, order.tenantId ?? undefined);
            // Return minimal data from transaction
            return {
                deliveryNoteId: deliveryNote.id,
                deliveryNoteNo: finalDeliveryNoteNo
            };
        }, {
            timeout: 10000
        });
        // Recalculate status cascade AFTER transaction commits
        if (id && tenantId) {
            await this.statusCalculator.recalculateOrderStatus(id, String(tenantId)).catch((err)=>console.error('[OrderService] Recalculate order status after ship failed:', err?.message));
        }
        // Fetch full order data AFTER transaction commits
        const updatedOrder = await this.findOne(id);
        return {
            ...updatedOrder,
            shipDeliveryNote: {
                id: result.deliveryNoteId,
                deliveryNoteNo: result.deliveryNoteNo
            }
        };
    }
    async createDeliveryNoteFromOrder(id, userId, ipAddress, userAgent) {
        const order = await this.findOne(id);
        if (!order) {
            throw new _common.NotFoundException(`Sipariş bulunamadı: ${id}`);
        }
        const shippedItems = (order.items || []).map((item)=>({
                itemId: item.id,
                shippedQuantity: Number(item.quantity) - (item.deliveredQuantity || 0)
            })).filter((item)=>item.shippedQuantity > 0);
        if (shippedItems.length === 0) {
            throw new _common.BadRequestException('Sevk edilecek miktar kalmadı veya sipariş kapalı.');
        }
        const result = await this.ship(id, shippedItems, userId, ipAddress, userAgent);
        return {
            ...result,
            id: result.shipDeliveryNote?.id
        };
    }
    async findOrdersForInvoice(accountId, search, orderType = _orderenums.OrderType.SALE) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const where = {
            deletedAt: null,
            status: isProcurement ? {
                in: [
                    'SIPARIS_VERILDI',
                    'SEVK_EDILDI',
                    'BEKLEMEDE',
                    'KISMI_SEVK'
                ]
            } : {
                in: [
                    'SHIPPED',
                    'PARTIALLY_SHIPPED'
                ]
            },
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (accountId) {
            where.accountId = accountId;
        }
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
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const model = isProcurement ? this.prisma.procurementOrder : this.prisma.salesOrder;
        const orders = await model.findMany({
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
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return {
            data: orders,
            total: orders.length
        };
    }
    async findOrdersForDeliveryNote(accountId, search, orderType = _orderenums.OrderType.SALE) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const where = {
            deletedAt: null,
            status: isProcurement ? 'ONAYLANDI' : 'APPROVED',
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (accountId) {
            where.accountId = accountId;
        }
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
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const model = isProcurement ? this.prisma.procurementOrder : this.prisma.salesOrder;
        const orders = await model.findMany({
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
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return {
            data: orders,
            total: orders.length
        };
    }
    async getStats(orderType = _orderenums.OrderType.SALE, startDate, endDate, status, accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const isProcurement = orderType === _orderenums.OrderType.PURCHASE;
        const model = isProcurement ? this.prisma.procurementOrder : this.prisma.salesOrder;
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
            model.aggregate({
                where: monthlyWhere,
                _count: {
                    id: true
                },
                _sum: {
                    grandTotal: true
                }
            }),
            model.aggregate({
                where: {
                    ...baseWhere,
                    status: isProcurement ? 'PENDING' : _orderenums.SalesOrderStatus.PENDING
                },
                _count: {
                    id: true
                },
                _sum: {
                    grandTotal: true
                }
            }),
            model.aggregate({
                where: {
                    ...baseWhere,
                    status: isProcurement ? 'SHIPPED' : _orderenums.SalesOrderStatus.SHIPPED
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
    constructor(prisma, tenantResolver, salesWaybillService, codeTemplateService, unitSetService, statusCalculator){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.salesWaybillService = salesWaybillService;
        this.codeTemplateService = codeTemplateService;
        this.unitSetService = unitSetService;
        this.statusCalculator = statusCalculator;
    }
};
OrderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_saleswaybillservice.SalesWaybillService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _saleswaybillservice.SalesWaybillService === "undefined" ? Object : _saleswaybillservice.SalesWaybillService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _unitsetservice.UnitSetService === "undefined" ? Object : _unitsetservice.UnitSetService,
        typeof _statuscalculatorservice.StatusCalculatorService === "undefined" ? Object : _statuscalculatorservice.StatusCalculatorService
    ])
], OrderService);

//# sourceMappingURL=order.service.js.map