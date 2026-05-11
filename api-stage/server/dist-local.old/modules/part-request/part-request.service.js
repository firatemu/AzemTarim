"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PartRequestService", {
    enumerable: true,
    get: function() {
        return PartRequestService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _systemparameterservice = require("../system-parameter/system-parameter.service");
const _stagingutil = require("../../common/utils/staging.util");
const _createpartrequestdto = require("./dto/create-part-request.dto");
const _client = require("@prisma/client");
const _partrequeststatusmachine = require("./domain/part-request-status.machine");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PartRequestService = class PartRequestService {
    async create(dto, requestedBy) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: true
        });
        const finalTenantId = dto.tenantId ?? tenantId ?? undefined;
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id: dto.workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
            }
        });
        if (!workOrder) {
            throw new _common.NotFoundException('Work order not found');
        }
        if (workOrder.status === 'INVOICED_CLOSED' || workOrder.status === 'CANCELLED') {
            throw new _common.BadRequestException('Part request cannot be added to this work order');
        }
        const partRequest = await this.prisma.partRequest.create({
            data: {
                tenantId: finalTenantId,
                workOrderId: dto.workOrderId,
                requestedBy,
                description: dto.description,
                productId: dto.productId || null,
                requestedQty: dto.requestedQty,
                status: _createpartrequestdto.PartRequestStatus.REQUESTED
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                requestedByUser: {
                    select: {
                        id: true,
                        fullName: true
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
        await this.prisma.workOrder.updateMany({
            where: {
                id: dto.workOrderId,
                ...(0, _stagingutil.buildTenantWhereClause)(finalTenantId)
            },
            data: {
                partWorkflowStatus: _client.PartWorkflowStatus.PARTS_PENDING
            }
        });
        await this.prisma.workOrderActivity.create({
            data: {
                tenantId: finalTenantId,
                workOrderId: dto.workOrderId,
                action: 'PART_WORKFLOW_CHANGED',
                userId: requestedBy,
                // @ts-ignore
                meta: {
                    partWorkflowStatus: _client.PartWorkflowStatus.PARTS_PENDING,
                    trigger: 'PART_REQUEST_CREATED'
                }
            }
        });
        return partRequest;
    }
    async findAll(workOrderId, status, page = 1, limit = 50, workOrderNo) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        if (workOrderId) where.workOrderId = workOrderId;
        if (workOrderNo) {
            where.workOrder = {
                workOrderNo: {
                    contains: workOrderNo,
                    mode: 'insensitive'
                }
            };
        }
        if (status) where.status = status;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.partRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    requestedByUser: {
                        select: {
                            id: true,
                            fullName: true
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
            this.prisma.partRequest.count({
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
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const partRequest = await this.prisma.partRequest.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                requestedByUser: {
                    select: {
                        id: true,
                        fullName: true
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
        });
        if (!partRequest) {
            throw new _common.NotFoundException(`Part request not found: ${id}`);
        }
        return partRequest;
    }
    async supply(id, dto, suppliedBy) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx)=>{
            const partRequest = await tx.partRequest.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!partRequest) {
                throw new _common.NotFoundException('Part request not found');
            }
            if (!(0, _partrequeststatusmachine.canTransitionPartRequestStatus)(partRequest.status, _createpartrequestdto.PartRequestStatus.SUPPLIED)) {
                throw new _common.BadRequestException('Only requested parts can be supplied');
            }
            const product = await tx.product.findFirst({
                where: {
                    id: dto.productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!product) {
                throw new _common.NotFoundException('Stock not found');
            }
            // Stock quantity check - apply only if "Negative product control" is enabled
            const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_STOCK_CONTROL', false);
            if (negativeStockControlEnabled) {
                const warehouseIds = await tx.warehouse.findMany({
                    where: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                    select: {
                        id: true
                    }
                });
                if (warehouseIds.length > 0) {
                    const stockResult = await tx.productLocationStock.aggregate({
                        where: {
                            productId: dto.productId,
                            warehouseId: {
                                in: warehouseIds.map((w)=>w.id)
                            }
                        },
                        _sum: {
                            qtyOnHand: true
                        }
                    });
                    const availableQty = Number(stockResult._sum?.qtyOnHand ?? 0);
                    if (availableQty < dto.suppliedQty) {
                        throw new _common.BadRequestException(`Not enough product. Available: ${availableQty}, To supply: ${dto.suppliedQty}`);
                    }
                }
            }
            const updated = await tx.partRequest.update({
                where: {
                    id
                },
                data: {
                    productId: dto.productId,
                    suppliedQty: dto.suppliedQty,
                    status: _createpartrequestdto.PartRequestStatus.SUPPLIED,
                    suppliedBy,
                    suppliedAt: new Date(),
                    version: {
                        increment: 1
                    }
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    requestedByUser: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    },
                    workOrder: {
                        select: {
                            id: true,
                            workOrderNo: true,
                            status: true,
                            customerVehicleId: true
                        }
                    }
                }
            });
            const pendingCount = await tx.partRequest.count({
                where: {
                    workOrderId: updated.workOrderId,
                    status: _createpartrequestdto.PartRequestStatus.REQUESTED
                }
            });
            const newPartStatus = pendingCount === 0 ? _client.PartWorkflowStatus.ALL_PARTS_SUPPLIED : _client.PartWorkflowStatus.PARTIALLY_SUPPLIED;
            await tx.workOrder.updateMany({
                where: {
                    id: updated.workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    partWorkflowStatus: newPartStatus
                }
            });
            await tx.workOrderActivity.create({
                data: {
                    tenantId: tenantId ?? undefined,
                    workOrderId: updated.workOrderId,
                    action: 'PART_WORKFLOW_CHANGED',
                    // @ts-ignore
                    meta: {
                        partWorkflowStatus: newPartStatus,
                        trigger: 'PART_SUPPLY'
                    }
                }
            });
            return updated;
        });
    }
    /**
   * Step 5: Atomic product deduction - When technician marks as "Used"
   * Within transaction: PartRequest SUPPLIED -> USED, InventoryTransaction (-qty)
   */ async markAsUsed(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx)=>{
            const pr = await tx.partRequest.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!pr) {
                throw new _common.NotFoundException('Part request not found');
            }
            if (!(0, _partrequeststatusmachine.canTransitionPartRequestStatus)(pr.status, _createpartrequestdto.PartRequestStatus.USED)) {
                throw new _common.ConflictException('Only supplied parts can be marked as used');
            }
            if (!pr.productId || pr.suppliedQty == null) {
                throw new _common.BadRequestException('Part request product and quantity information is missing');
            }
            const updated = await tx.partRequest.updateMany({
                where: {
                    id,
                    version: pr.version
                },
                data: {
                    status: _createpartrequestdto.PartRequestStatus.USED,
                    usedAt: new Date(),
                    version: {
                        increment: 1
                    }
                }
            });
            if (updated.count === 0) {
                throw new _common.ConflictException('Part request could not be updated (optimistic lock error - please try again)');
            }
            await tx.inventoryTransaction.create({
                data: {
                    tenantId: pr.tenantId,
                    partRequestId: pr.id,
                    productId: pr.productId,
                    quantity: -pr.suppliedQty,
                    transactionType: 'DEDUCTION'
                }
            });
            return tx.partRequest.findFirst({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(pr.tenantId ?? undefined)
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
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
        });
    }
    async cancel(id) {
        const partRequest = await this.findOne(id);
        if (!(0, _partrequeststatusmachine.canTransitionPartRequestStatus)(partRequest.status, _createpartrequestdto.PartRequestStatus.CANCELLED)) {
            throw new _common.BadRequestException('Only requested parts can be cancelled');
        }
        const tenantId = await this.tenantResolver.resolveForQuery();
        const updatedRes = await this.prisma.partRequest.updateMany({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                status: _createpartrequestdto.PartRequestStatus.CANCELLED
            }
        });
        if (updatedRes.count === 0) {
            throw new _common.NotFoundException('Part request not found or access denied');
        }
        const updated = await this.prisma.partRequest.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                workOrder: true
            }
        });
        if (!updated) throw new _common.NotFoundException('Part request not found after update');
        if (updated.workOrder.partWorkflowStatus === _client.PartWorkflowStatus.PARTS_PENDING || updated.workOrder.partWorkflowStatus === _client.PartWorkflowStatus.PARTIALLY_SUPPLIED) {
            const pendingCount = await this.prisma.partRequest.count({
                where: {
                    workOrderId: updated.workOrderId,
                    status: _createpartrequestdto.PartRequestStatus.REQUESTED,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            const newPartStatus = pendingCount === 0 ? _client.PartWorkflowStatus.ALL_PARTS_SUPPLIED : _client.PartWorkflowStatus.PARTIALLY_SUPPLIED;
            await this.prisma.workOrder.updateMany({
                where: {
                    id: updated.workOrderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    partWorkflowStatus: newPartStatus
                }
            });
        }
        return updated;
    }
    constructor(prisma, tenantResolver, systemParameterService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.systemParameterService = systemParameterService;
    }
};
PartRequestService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService
    ])
], PartRequestService);

//# sourceMappingURL=part-request.service.js.map