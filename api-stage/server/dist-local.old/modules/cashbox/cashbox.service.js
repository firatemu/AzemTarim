"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CashboxService", {
    enumerable: true,
    get: function() {
        return CashboxService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _cashboxenums = require("./cashbox.enums");
const _codetemplateservice = require("../code-template/code-template.service");
const _codetemplateenums = require("../code-template/code-template.enums");
const _systemparameterservice = require("../system-parameter/system-parameter.service");
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
let CashboxService = class CashboxService {
    async findAll(type, isActive, isRetail) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        if (type) {
            where.type = type;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (isRetail !== undefined) {
            where.isRetail = isRetail;
        }
        const cashboxes = await this.prisma.cashbox.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });
        const cashboxesWithCount = await Promise.all(cashboxes.map(async (cashbox)=>{
            const movementCount = await this.prisma.cashboxMovement.count({
                where: {
                    cashboxId: cashbox.id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            return {
                ...cashbox,
                _count: {
                    movements: movementCount
                }
            };
        }));
        return cashboxesWithCount;
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const cashbox = await this.prisma.cashbox.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                movements: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true
                            }
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    take: 100
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
        if (!cashbox) {
            throw new _common.NotFoundException(`Cashbox not found: ${id}`);
        }
        return cashbox;
    }
    async getRetailCashbox() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const baseWhere = {
            deletedAt: null,
            isActive: true,
            type: _cashboxenums.CashboxType.CASH
        };
        if (tenantId) {
            // Legacy compatibility: some cashboxes may have null tenantId.
            baseWhere.OR = [
                {
                    tenantId
                },
                {
                    tenantId: null
                }
            ];
        }
        // 1) Preferred: explicitly flagged retail cashbox
        const retailCashbox = await this.prisma.cashbox.findFirst({
            where: {
                AND: [
                    baseWhere,
                    {
                        isRetail: true
                    }
                ]
            },
            orderBy: [
                {
                    createdAt: 'asc'
                }
            ]
        });
        if (retailCashbox) return retailCashbox;
        // 2) Fallback: cashbox name indicates retail
        const namedRetailCashbox = await this.prisma.cashbox.findFirst({
            where: {
                AND: [
                    baseWhere,
                    {
                        OR: [
                            {
                                name: {
                                    contains: 'perakende',
                                    mode: 'insensitive'
                                }
                            },
                            {
                                name: {
                                    contains: 'perakande',
                                    mode: 'insensitive'
                                }
                            },
                            {
                                name: {
                                    contains: 'retail',
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                ]
            },
            orderBy: [
                {
                    createdAt: 'asc'
                }
            ]
        });
        if (namedRetailCashbox) return namedRetailCashbox;
        // 3) Last resort: any active CASH cashbox
        return this.prisma.cashbox.findFirst({
            where: baseWhere,
            orderBy: [
                {
                    createdAt: 'asc'
                }
            ]
        });
    }
    async create(dto, userId) {
        console.log('Cashbox create DTO:', JSON.stringify(dto, null, 2));
        let code = dto.code;
        if (!code || code.trim() === '') {
            try {
                code = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.CASHBOX);
            } catch (error) {
                throw new _common.BadRequestException('Automatic code could not be created. Please enter a manual code.');
            }
        }
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId,
            allowNull: true
        });
        const existing = await this.prisma.cashbox.findFirst({
            where: {
                code,
                ...tenantId != null && {
                    tenantId
                }
            }
        });
        if (existing) {
            throw new _common.BadRequestException('This cashbox code is already in use');
        }
        if (dto.isRetail) {
            await this.validateSingleRetailCashbox(tenantId);
        }
        const data = {
            code,
            ...tenantId != null && {
                tenantId
            },
            name: dto.name,
            type: _cashboxenums.CashboxType.CASH,
            isActive: dto.isActive ?? true,
            isRetail: dto.isRetail ?? false,
            createdBy: userId
        };
        console.log('Cashbox create data:', JSON.stringify(data, null, 2));
        const created = await this.prisma.cashbox.create({
            data
        });
        // Update code template counter only if code was auto-generated
        if (!dto.code || dto.code.trim() === '') {
            try {
                await this.codeTemplateService.saveLastCode(_codetemplateenums.ModuleType.CASHBOX, created.code);
            } catch (error) {
                console.error('Failed to update code template counter:', error);
            }
        }
        return created;
    }
    async update(id, dto, userId) {
        await this.findOne(id);
        const data = {
            ...dto,
            updatedBy: userId
        };
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (dto.isRetail) {
            await this.validateSingleRetailCashbox(tenantId, id);
        }
        return this.prisma.cashbox.update({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data
        });
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const cashbox = await this.findOne(id);
        const movementCount = await this.prisma.cashboxMovement.count({
            where: {
                cashboxId: id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        const isPosOrCard = cashbox.type === _cashboxenums.CashboxType.POS || cashbox.type === _cashboxenums.CashboxType.COMPANY_CREDIT_CARD;
        let extraCheck = 0;
        if (isPosOrCard) {
            extraCheck = await this.prisma.collection.count({
                where: {
                    cashboxId: id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
        }
        if (movementCount + extraCheck > 0) {
            throw new _common.BadRequestException('This cashbox has movements and cannot be deleted. Please deactivate it.');
        }
        return this.prisma.cashbox.delete({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
    }
    async createMovement(dto, userId) {
        const cashbox = await this.findOne(dto.cashboxId);
        const tenantId = await this.tenantResolver.resolveForQuery();
        const allowNegativeBalance = await this.systemParameterService.getParameterAsBoolean('ALLOW_NEGATIVE_CASH_BALANCE', false);
        return this.prisma.$transaction(async (prisma)=>{
            const createTenantId = await this.tenantResolver.resolveForCreate({
                userId
            });
            let balanceChange = dto.amount;
            if ([
                'COLLECTION',
                'INCOMING_TRANSFER',
                'CREDIT_CARD'
            ].includes(dto.movementType)) {
                balanceChange = dto.amount;
            } else if ([
                'PAYMENT',
                'OUTGOING_TRANSFER',
                'TRANSFER'
            ].includes(dto.movementType)) {
                balanceChange = -dto.amount;
            }
            const movementBalance = cashbox.balance.toNumber() + balanceChange;
            if (!allowNegativeBalance && movementBalance < 0) {
                throw new _common.BadRequestException(`Insufficient cashbox balance! (Negative balance is disabled)`);
            }
            const movement = await prisma.cashboxMovement.create({
                data: {
                    cashboxId: dto.cashboxId,
                    movementType: dto.movementType,
                    amount: dto.amount,
                    balance: movementBalance,
                    documentType: dto.documentType,
                    documentNo: dto.documentNo,
                    accountId: dto.accountId,
                    notes: dto.notes,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    createdBy: userId,
                    tenantId: createTenantId
                },
                include: {
                    cashbox: true,
                    account: true
                }
            });
            await prisma.cashbox.update({
                where: {
                    id: dto.cashboxId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    balance: movementBalance
                }
            });
            return movement;
        });
    }
    async deleteMovement(movementId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const movement = await this.prisma.cashboxMovement.findFirst({
            where: {
                id: movementId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                cashbox: true
            }
        });
        if (!movement) {
            throw new _common.NotFoundException('Movement not found');
        }
        if (movement.isTransferred) {
            throw new _common.BadRequestException('Transferred movement cannot be deleted');
        }
        return this.prisma.$transaction(async (prisma)=>{
            let balanceChange = 0;
            if ([
                'COLLECTION',
                'INCOMING_TRANSFER',
                'CREDIT_CARD'
            ].includes(movement.movementType)) {
                balanceChange = -movement.amount.toNumber();
            } else if ([
                'PAYMENT',
                'OUTGOING_TRANSFER',
                'TRANSFER'
            ].includes(movement.movementType)) {
                balanceChange = movement.amount.toNumber();
            }
            await prisma.cashbox.update({
                where: {
                    id: movement.cashboxId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    balance: {
                        increment: balanceChange
                    }
                }
            });
            return prisma.cashboxMovement.delete({
                where: {
                    id: movementId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
        });
    }
    async getPendingPOSTransfers(cashboxId) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        oneDayAgo.setHours(23, 59, 59, 999);
        const tenantId = await this.tenantResolver.resolveForQuery();
        const pendingMovements = await this.prisma.cashboxMovement.findMany({
            where: {
                cashboxId,
                movementType: 'CREDIT_CARD',
                isTransferred: false,
                date: {
                    lte: oneDayAgo
                },
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: {
                    select: {
                        code: true,
                        title: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
        const totalGrossAmount = pendingMovements.reduce((sum, h)=>sum + h.amount.toNumber(), 0);
        const totalCommission = pendingMovements.reduce((sum, h)=>sum + (h.commissionAmount?.toNumber() || 0), 0);
        const totalBSMV = pendingMovements.reduce((sum, h)=>sum + (h.bsmvAmount?.toNumber() || 0), 0);
        const totalNetAmount = pendingMovements.reduce((sum, h)=>sum + (h.netAmount?.toNumber() || 0), 0);
        return {
            movements: pendingMovements,
            summary: {
                count: pendingMovements.length,
                totalGrossAmount,
                totalCommission,
                totalBSMV,
                totalNetAmount
            }
        };
    }
    async validateSingleRetailCashbox(tenantId, excludeId) {
        const existingRetail = await this.prisma.cashbox.findFirst({
            where: {
                isRetail: true,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null,
                ...excludeId && {
                    id: {
                        not: excludeId
                    }
                }
            }
        });
        if (existingRetail) {
            throw new _common.BadRequestException('Sistemde zaten bir adet perakende kasa bulunmaktadır. İkinci bir perakende kasa oluşturulamaz.');
        }
    }
    constructor(prisma, tenantResolver, codeTemplateService, systemParameterService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.systemParameterService = systemParameterService;
    }
};
CashboxService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_codetemplateservice.CodeTemplateService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService
    ])
], CashboxService);

//# sourceMappingURL=cashbox.service.js.map