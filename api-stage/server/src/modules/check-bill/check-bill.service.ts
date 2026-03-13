import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckBillDto, UpdateCheckBillDto } from './dto/create-check-bill.dto';
import { CheckBillActionDto } from './dto/check-bill-transaction.dto';
import { CheckBillStatus, PortfolioType, CashboxMovementType, BankMovementType } from '@prisma/client';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class CheckBillService {
    constructor(private prisma: PrismaService, private readonly tenantResolver: TenantResolverService) { }

    async findAll(query: any) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const { ...where } = query;
        return this.prisma.checkBill.findMany({
            where: {
                ...where,
                ...buildTenantWhereClause(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                account: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const checkBill = await this.prisma.checkBill.findFirst({
            where: {
                id,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            include: {
                account: true,
                journalItems: {
                    include: {
                        journal: true
                    }
                }
            }
        });

        if (!checkBill || checkBill.deletedAt) {
            throw new NotFoundException('Document not found');
        }

        return checkBill;
    }

    async getUpcomingChecks(startDate: Date, endDate: Date) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.findMany({
            where: {
                dueDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    in: [CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.GIVEN_TO_BANK]
                },
                ...buildTenantWhereClause(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                account: { select: { title: true } }
            },
            orderBy: { dueDate: 'asc' }
        });
    }

    async processAction(dto: CheckBillActionDto, userId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.$transaction(async (tx) => {
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: dto.checkBillId,
                    ...buildTenantWhereClause(tenantId ?? undefined),
                }
            });

            if (!checkBill) throw new NotFoundException('Document not found');

            // Update Status
            await tx.checkBill.updateMany({
                where: {
                    id: dto.checkBillId,
                    ...buildTenantWhereClause(tenantId ?? undefined),
                },
                data: {
                    status: dto.newStatus,
                    updatedBy: userId
                }
            });

            const updated = await tx.checkBill.findFirst({
                where: {
                    id: dto.checkBillId,
                    ...buildTenantWhereClause(tenantId ?? undefined),
                }
            });

            // Financial Integration
            if (dto.newStatus === CheckBillStatus.COLLECTED) {
                if (dto.cashboxId) {
                    await tx.cashboxMovement.create({
                        data: {
                            tenantId: checkBill.tenantId || tenantId,
                            cashboxId: dto.cashboxId,
                            movementType: CashboxMovementType.COLLECTION,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || 'Check Collection',
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                            createdBy: userId
                        }
                    });
                } else if (dto.bankAccountId) {
                    await tx.bankAccountMovement.create({
                        data: {
                            tenantId: checkBill.tenantId || tenantId,
                            bankAccountId: dto.bankAccountId,
                            movementType: BankMovementType.INCOMING,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || 'Check Collection',
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                        }
                    });
                }
            }

            return updated;
        });
    }

    async create(dto: CreateCheckBillDto, checkBillJournalId?: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.create({
            data: {
                tenantId: (dto as any).tenantId || tenantId,
                type: dto.type,
                portfolioType: PortfolioType.CREDIT, // Default
                amount: dto.amount,
                remainingAmount: dto.amount,
                dueDate: new Date(dto.dueDate),
                accountId: (dto as any).accountId, // Direct use if provided
                bank: dto.bank,
                branch: dto.branch,
                accountNo: dto.accountNo,
                checkNo: dto.checkNo,
                status: CheckBillStatus.IN_PORTFOLIO,
                notes: dto.notes,
                lastJournalId: checkBillJournalId
            }
        });
    }

    async update(id: string, dto: UpdateCheckBillDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        await this.prisma.checkBill.updateMany({
            where: {
                id,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            data: {
                checkNo: dto.checkNo,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                bank: dto.bank,
                branch: dto.branch,
                accountNo: dto.accountNo,
                notes: dto.notes
            }
        });
        return this.findOne(id);
    }

    async remove(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.updateMany({
            where: {
                id,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            data: { deletedAt: new Date() }
        });
    }
}
