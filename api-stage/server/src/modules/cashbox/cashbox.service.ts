import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateCashboxDto, UpdateCashboxDto } from './dto';
import { CreateCashboxMovementDto, CashboxMovementType } from './dto/create-cashbox-movement.dto';
import { CashboxType } from './cashbox.enums';
import { Prisma } from '@prisma/client';
import { CodeTemplateService } from '../code-template/code-template.service';
import { ModuleType } from '../code-template/code-template.enums';
import { SystemParameterService } from '../system-parameter/system-parameter.service';

@Injectable()
export class CashboxService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
        @Inject(forwardRef(() => CodeTemplateService))
        private codeTemplateService: CodeTemplateService,
        private systemParameterService: SystemParameterService,
    ) { }

    async findAll(type?: CashboxType, isActive?: boolean) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where: Prisma.CashboxWhereInput = {
            ...buildTenantWhereClause(tenantId ?? undefined),
        };

        if (type) {
            where.type = type;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const cashboxes = await this.prisma.cashbox.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        const cashboxesWithCount = await Promise.all(
            cashboxes.map(async (cashbox) => {
                const movementCount = await this.prisma.cashboxMovement.count({
                    where: { cashboxId: cashbox.id, ...buildTenantWhereClause(tenantId ?? undefined) },
                });

                return {
                    ...cashbox,
                    _count: {
                        movements: movementCount,
                    },
                };
            }),
        );

        return cashboxesWithCount;
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const cashbox = await this.prisma.cashbox.findFirst({
            where: {
                id,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            include: {
                movements: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true,
                            },
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 100,
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
            },
        });

        if (!cashbox) {
            throw new NotFoundException(`Cashbox not found: ${id}`);
        }

        return cashbox;
    }

    async create(dto: CreateCashboxDto, userId?: string) {
        let code = dto.code;

        if (!code || code.trim() === '') {
            try {
                code = await this.codeTemplateService.getNextCode(ModuleType.CASHBOX);
            } catch (error) {
                throw new BadRequestException(
                    'Automatic code could not be created. Please enter a manual code.',
                );
            }
        }

        const tenantId = await this.tenantResolver.resolveForCreate({
            userId,
            allowNull: true,
        });

        const existing = await this.prisma.cashbox.findFirst({
            where: {
                code,
                ...(tenantId != null && { tenantId }),
            },
        });

        if (existing) {
            throw new BadRequestException('This cashbox code is already in use');
        }

        const data = {
            code,
            ...(tenantId != null && { tenantId }),
            name: dto.name,
            type: dto.type,
            isActive: dto.isActive ?? true,
            createdBy: userId,
        };

        return this.prisma.cashbox.create({
            data,
        });
    }

    async update(id: string, dto: UpdateCashboxDto, userId?: string) {
        await this.findOne(id);

        const data = {
            ...dto,
            updatedBy: userId,
        };

        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.cashbox.update({
            where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
            data,
        });
    }

    async remove(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const cashbox = await this.findOne(id);

        const movementCount = await this.prisma.cashboxMovement.count({
            where: { cashboxId: id, ...buildTenantWhereClause(tenantId ?? undefined) },
        });

        const isPosOrCard = cashbox.type === CashboxType.POS || cashbox.type === CashboxType.COMPANY_CREDIT_CARD;
        let extraCheck = 0;
        if (isPosOrCard) {
            extraCheck = await this.prisma.collection.count({
                where: { cashboxId: id, ...buildTenantWhereClause(tenantId ?? undefined) },
            });
        }

        if (movementCount + extraCheck > 0) {
            throw new BadRequestException(
                'This cashbox has movements and cannot be deleted. Please deactivate it.',
            );
        }

        return this.prisma.cashbox.delete({
            where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
        });
    }

    async createMovement(dto: CreateCashboxMovementDto, userId?: string) {
        const cashbox = await this.findOne(dto.cashboxId);
        const tenantId = await this.tenantResolver.resolveForQuery();
        const allowNegativeBalance = await this.systemParameterService.getParameterAsBoolean('ALLOW_NEGATIVE_CASH_BALANCE', false);
        return this.prisma.$transaction(async (prisma) => {
            const createTenantId = await this.tenantResolver.resolveForCreate({ userId });
            let balanceChange = dto.amount;

            if (
                ['COLLECTION', 'INCOMING_TRANSFER', 'CREDIT_CARD'].includes(
                    dto.movementType,
                )
            ) {
                balanceChange = dto.amount;
            } else if (
                ['PAYMENT', 'OUTGOING_TRANSFER', 'TRANSFER'].includes(dto.movementType)
            ) {
                balanceChange = -dto.amount;
            }

            const movementBalance = cashbox.balance.toNumber() + balanceChange;

            if (!allowNegativeBalance && movementBalance < 0) {
                throw new BadRequestException(
                    `Insufficient cashbox balance! (Negative balance is disabled)`,
                );
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
                    tenantId: createTenantId,
                },
                include: {
                    cashbox: true,
                    account: true,
                },
            });

            await prisma.cashbox.update({
                where: { id: dto.cashboxId, ...buildTenantWhereClause(tenantId ?? undefined) },
                data: { balance: movementBalance },
            });

            return movement;
        });
    }

    async deleteMovement(movementId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const movement = await this.prisma.cashboxMovement.findFirst({
            where: { id: movementId, ...buildTenantWhereClause(tenantId ?? undefined) },
            include: { cashbox: true },
        });

        if (!movement) {
            throw new NotFoundException('Movement not found');
        }

        if (movement.isTransferred) {
            throw new BadRequestException('Transferred movement cannot be deleted');
        }

        return this.prisma.$transaction(async (prisma) => {
            let balanceChange = 0;
            if (
                ['COLLECTION', 'INCOMING_TRANSFER', 'CREDIT_CARD'].includes(
                    movement.movementType,
                )
            ) {
                balanceChange = -movement.amount.toNumber();
            } else if (
                ['PAYMENT', 'OUTGOING_TRANSFER', 'TRANSFER'].includes(movement.movementType)
            ) {
                balanceChange = movement.amount.toNumber();
            }

            await prisma.cashbox.update({
                where: { id: movement.cashboxId, ...buildTenantWhereClause(tenantId ?? undefined) },
                data: {
                    balance: { increment: balanceChange },
                },
            });

            return prisma.cashboxMovement.delete({
                where: { id: movementId, ...buildTenantWhereClause(tenantId ?? undefined) },
            });
        });
    }

    async getPendingPOSTransfers(cashboxId: string) {
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
                    lte: oneDayAgo,
                },
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            include: {
                account: {
                    select: {
                        code: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        const totalGrossAmount = pendingMovements.reduce(
            (sum, h) => sum + h.amount.toNumber(),
            0,
        );
        const totalCommission = pendingMovements.reduce(
            (sum, h) => sum + (h.commissionAmount?.toNumber() || 0),
            0,
        );
        const totalBSMV = pendingMovements.reduce(
            (sum, h) => sum + (h.bsmvAmount?.toNumber() || 0),
            0,
        );
        const totalNetAmount = pendingMovements.reduce(
            (sum, h) => sum + (h.netAmount?.toNumber() || 0),
            0,
        );

        return {
            movements: pendingMovements,
            summary: {
                count: pendingMovements.length,
                totalGrossAmount,
                totalCommission,
                totalBSMV,
                totalNetAmount,
            },
        };
    }
}
