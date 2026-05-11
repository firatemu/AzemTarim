"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrderItemService", {
    enumerable: true,
    get: function() {
        return WorkOrderItemService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
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
let WorkOrderItemService = class WorkOrderItemService {
    calculateTotals(quantity, unitPrice, taxRate = 20) {
        const totalPrice = quantity * unitPrice;
        const taxAmount = totalPrice * (taxRate / 100);
        return {
            totalPrice,
            taxAmount
        };
    }
    async recalculateWorkOrderTotals(workOrderId) {
        return this.recalculateWorkOrderTotalsInTx(this.prisma, workOrderId);
    }
    async recalculateWorkOrderTotalsInTx(tx, workOrderId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const items = await tx.workOrderItem.findMany({
            where: {
                workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        let totalLaborCost = 0;
        let totalPartsCost = 0;
        for (const item of items){
            const total = Number(item.totalPrice);
            if (item.type === 'LABOR') {
                totalLaborCost += total;
            } else {
                totalPartsCost += total;
            }
        }
        const subtotal = totalLaborCost + totalPartsCost;
        const taxAmount = items.reduce((sum, i)=>sum + Number(i.taxAmount), 0);
        const grandTotal = subtotal + taxAmount;
        await tx.workOrder.updateMany({
            where: {
                id: workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                totalLaborCost: new _library.Decimal(totalLaborCost),
                totalPartsCost: new _library.Decimal(totalPartsCost),
                taxAmount: new _library.Decimal(taxAmount),
                grandTotal: new _library.Decimal(grandTotal)
            }
        });
    }
    async create(dto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx)=>{
            const workOrder = await tx.workOrder.findFirst({
                where: {
                    id: dto.workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!workOrder) {
                throw new _common.NotFoundException('Work order not found');
            }
            if (workOrder.status === _client.WorkOrderStatus.INVOICED_CLOSED || workOrder.status === _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
                throw new _common.BadRequestException('Cannot add item to closed work order');
            }
            if (workOrder.status === _client.WorkOrderStatus.CANCELLED) {
                throw new _common.BadRequestException('Cannot add item to cancelled work order');
            }
            if (dto.type === 'PART' && !dto.productId) {
                throw new _common.BadRequestException('Product must be selected for part item');
            }
            const taxRate = dto.taxRate ?? 20;
            const unitPrice = dto.unitPrice ?? 0;
            const { totalPrice, taxAmount } = this.calculateTotals(dto.quantity, unitPrice, taxRate);
            const item = await tx.workOrderItem.create({
                data: {
                    tenantId: workOrder.tenantId || tenantId || undefined,
                    workOrderId: dto.workOrderId,
                    type: dto.type,
                    description: dto.description,
                    productId: dto.productId || null,
                    quantity: dto.quantity,
                    unitPrice,
                    taxRate,
                    taxAmount,
                    totalPrice
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            });
            if (dto.type === 'PART' && workOrder.partWorkflowStatus === _client.PartWorkflowStatus.NOT_STARTED) {
                const partRequestCount = await tx.partRequest.count({
                    where: {
                        workOrderId: dto.workOrderId
                    }
                });
                if (partRequestCount === 0) {
                    await tx.workOrder.updateMany({
                        where: {
                            id: dto.workOrderId,
                            ...(0, _stagingutil.buildTenantWhereClause)(workOrder.tenantId || tenantId || undefined)
                        },
                        data: {
                            partWorkflowStatus: _client.PartWorkflowStatus.PARTS_SUPPLIED_DIRECT
                        }
                    });
                }
            }
            await this.recalculateWorkOrderTotalsInTx(tx, dto.workOrderId);
            return item;
        });
    }
    async findAll(workOrderId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id: workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!workOrder) {
            throw new _common.NotFoundException('Work order not found');
        }
        return this.prisma.workOrderItem.findMany({
            where: {
                workOrderId
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantWhere = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        const item = await this.prisma.workOrderItem.findFirst({
            where: {
                id,
                workOrder: tenantWhere
            },
            include: {
                workOrder: true,
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            }
        });
        if (!item) {
            throw new _common.NotFoundException(`Item not found: ${id}`);
        }
        return item;
    }
    async update(id, dto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx)=>{
            const item = await tx.workOrderItem.findFirst({
                where: {
                    id,
                    workOrder: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                include: {
                    workOrder: true,
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            });
            if (!item) {
                throw new _common.NotFoundException(`Item not found: ${id}`);
            }
            if (item.workOrder.status === _client.WorkOrderStatus.INVOICED_CLOSED || item.workOrder.status === _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
                throw new _common.BadRequestException('Closed work order item cannot be updated');
            }
            const quantity = dto.quantity ?? item.quantity;
            const unitPrice = dto.unitPrice ?? Number(item.unitPrice);
            const taxRate = dto.taxRate ?? item.taxRate;
            const { totalPrice, taxAmount } = this.calculateTotals(quantity, unitPrice, taxRate);
            const finalTenantId = item.workOrder.tenantId || tenantId || undefined;
            await tx.workOrderItem.updateMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
                },
                data: {
                    ...dto,
                    quantity,
                    unitPrice,
                    taxRate,
                    taxAmount,
                    totalPrice
                }
            });
            const updated = await tx.workOrderItem.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            });
            await this.recalculateWorkOrderTotalsInTx(tx, item.workOrderId);
            return updated;
        });
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx)=>{
            const item = await tx.workOrderItem.findFirst({
                where: {
                    id,
                    workOrder: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                include: {
                    workOrder: true
                }
            });
            if (!item) {
                throw new _common.NotFoundException(`Item not found: ${id}`);
            }
            if (item.workOrder.status === _client.WorkOrderStatus.INVOICED_CLOSED || item.workOrder.status === _client.WorkOrderStatus.CLOSED_WITHOUT_INVOICE) {
                throw new _common.BadRequestException('Closed work order item cannot be deleted');
            }
            const deleted = await tx.workOrderItem.deleteMany({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(item.workOrder.tenantId || tenantId || undefined)
                }
            });
            await this.recalculateWorkOrderTotalsInTx(tx, item.workOrderId);
            return deleted;
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
WorkOrderItemService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], WorkOrderItemService);

//# sourceMappingURL=work-order-item.service.js.map