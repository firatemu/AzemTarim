import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCheckBillDto, UpdateCheckBillDto } from './dto/create-check-bill.dto';
import { CheckBillActionDto } from './dto/check-bill-transaction.dto';
import { CheckBillFilterDto } from './dto/check-bill-filter.dto';
import { CheckBillStatus, PortfolioType, CashboxMovementType, BankMovementType, AccountTransactionDirection } from '@prisma/client';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { assertLegalTransition } from './utils/status-transition.util';
import { AccountBalanceService } from '../account-balance/account-balance.service';

@Injectable()
export class CheckBillService {
    private readonly logger = new Logger(CheckBillService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
        private readonly accountBalanceService: AccountBalanceService,
    ) { }

    async findAll(filter: CheckBillFilterDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.findMany({
            where: {
                ...buildTenantWhereClause(tenantId ?? undefined),
                deletedAt: null,
                ...(filter.type && { type: filter.type }),
                ...(filter.portfolioType && { portfolioType: filter.portfolioType }),
                ...(filter.status && { status: filter.status }),
                ...(filter.accountId && { accountId: filter.accountId }),
                ...(filter.isProtested !== undefined && { isProtested: filter.isProtested }),
                ...(filter.dueDateFrom || filter.dueDateTo
                    ? {
                        dueDate: {
                            ...(filter.dueDateFrom && { gte: new Date(filter.dueDateFrom) }),
                            ...(filter.dueDateTo && { lte: new Date(filter.dueDateTo) }),
                        },
                    }
                    : {}),
            },
            include: {
                account: { select: { title: true } },
            },
            orderBy: { dueDate: 'asc' },
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
                    include: { journal: true },
                },
                endorsements: { orderBy: { sequence: 'asc' } },
                collections: { orderBy: { collectionDate: 'desc' } },
            },
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
                dueDate: { gte: startDate, lte: endDate },
                status: { in: [CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.GIVEN_TO_BANK] },
                ...buildTenantWhereClause(tenantId ?? undefined),
                deletedAt: null,
            },
            include: { account: { select: { title: true } } },
            orderBy: { dueDate: 'asc' },
        });
    }

    async getEndorsements(checkBillId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillEndorsement.findMany({
            where: {
                checkBillId,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            orderBy: { sequence: 'asc' },
        });
    }

    async getCollectionHistory(checkBillId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBillCollection.findMany({
            where: {
                checkBillId,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            orderBy: { collectionDate: 'desc' },
        });
    }

    async processAction(dto: CheckBillActionDto, userId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const result = await this.prisma.$transaction(async (tx) => {
            const checkBill = await tx.checkBill.findFirst({
                where: {
                    id: dto.checkBillId,
                    ...buildTenantWhereClause(tenantId ?? undefined),
                },
            });

            if (!checkBill) throw new NotFoundException('Document not found');

            assertLegalTransition(checkBill.status, dto.newStatus);

            await tx.checkBill.updateMany({
                where: {
                    id: dto.checkBillId,
                    ...buildTenantWhereClause(tenantId ?? undefined),
                },
                data: { status: dto.newStatus, updatedBy: userId },
            });

            const updated = await tx.checkBill.findFirst({
                where: { id: dto.checkBillId, ...buildTenantWhereClause(tenantId ?? undefined) },
            });

            const movementTenantId = checkBill.tenantId || tenantId;
            if (!movementTenantId) throw new Error('Tenant ID çözümlenemedi');

            // 1. Durum: Tahsilat (Müşteri Evrağı) veya Ödeme (Firma Evrağı)
            if (dto.newStatus === CheckBillStatus.COLLECTED || dto.newStatus === CheckBillStatus.PAID) {
                const isDebit = checkBill.portfolioType === 'DEBIT';

                if (dto.cashboxId) {
                    await tx.cashboxMovement.create({
                        data: {
                            tenantId: movementTenantId,
                            cashboxId: dto.cashboxId,
                            movementType: isDebit ? CashboxMovementType.PAYMENT : CashboxMovementType.COLLECTION,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || (isDebit ? 'Evrak Ödemesi' : 'Evrak Tahsilatı'),
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                            createdBy: userId,
                        },
                    });
                } else if (dto.bankAccountId) {
                    await tx.bankAccountMovement.create({
                        data: {
                            tenantId: movementTenantId,
                            bankAccountId: dto.bankAccountId,
                            movementType: isDebit ? BankMovementType.OUTGOING : BankMovementType.INCOMING,
                            amount: dto.transactionAmount,
                            balance: 0,
                            notes: dto.notes || (isDebit ? 'Evrak Ödemesi' : 'Evrak Tahsilatı'),
                            date: new Date(dto.date),
                            accountId: checkBill.accountId,
                        },
                    });
                }

                await tx.accountTransaction.create({
                    data: {
                        tenantId: movementTenantId,
                        accountId: checkBill.accountId,
                        sourceType: 'CHECK_BILL_ACTION',
                        sourceId: checkBill.id,
                        direction: AccountTransactionDirection.DEBIT,
                        amount: dto.transactionAmount,
                        description: isDebit ? 'Own document paid via action' : 'Document collected via action',
                    },
                });
            }

            // 2. Durum: İade
            if (dto.newStatus === CheckBillStatus.RETURNED) {
                await tx.accountTransaction.create({
                    data: {
                        tenantId: movementTenantId,
                        accountId: checkBill.accountId,
                        sourceType: 'CHECK_BILL_ACTION',
                        sourceId: checkBill.id,
                        direction: AccountTransactionDirection.CREDIT,
                        amount: checkBill.amount,
                        description: 'Document returned via action — receivable re-opens',
                    },
                });

                const movementType = checkBill.portfolioType === 'CREDIT' ? 'DEBIT' : 'CREDIT';
                // Account Movement (Raw SQL)
                await tx.$executeRawUnsafe(
                    `INSERT INTO account_movements (id, "tenantId", account_id, type, amount, balance, document_type, document_no, check_bill_id, date, notes, "createdAt", "updatedAt") 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                    require('crypto').randomUUID(),
                    movementTenantId,
                    checkBill.accountId,
                    movementType,
                    checkBill.amount,
                    0,
                    'RETURN',
                    checkBill.checkNo || '—',
                    checkBill.id,
                    new Date(),
                    'Aksiyondan İade Edildi'
                );
            }

            this.logger.log(
                `[tenantId=${tenantId}] [userId=${userId}] Evrak ${checkBill.id} durumu ${checkBill.status} → ${dto.newStatus}`,
            );

            return { updated, accountIdToRecalculate: (dto.newStatus === CheckBillStatus.RETURNED || dto.transactionAmount) ? checkBill.accountId : null };
        });

        if (result.accountIdToRecalculate) {
            await this.accountBalanceService.recalculateAccountBalance(result.accountIdToRecalculate);
        }

        return result.updated;
    }

    async create(dto: CreateCheckBillDto, checkBillJournalId?: string) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        return this.prisma.checkBill.create({
            data: {
                tenantId: (dto as any).tenantId || tenantId,
                type: dto.type,
                portfolioType: PortfolioType.CREDIT,
                amount: dto.amount,
                remainingAmount: dto.amount,
                dueDate: new Date(dto.dueDate),
                accountId: (dto as any).accountId,
                bank: dto.bank,
                branch: dto.branch,
                accountNo: dto.accountNo,
                checkNo: dto.checkNo,
                status: CheckBillStatus.IN_PORTFOLIO,
                notes: dto.notes,
                lastJournalId: checkBillJournalId,
            },
        });
    }

    async update(id: string, dto: UpdateCheckBillDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const existing = await this.prisma.checkBill.findFirst({
            where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
        });

        if (!existing) {
            throw new Error('Evrak bulunamadı');
        }

        const dataToUpdate: any = {
            checkNo: dto.checkNo,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            bank: dto.bank,
            branch: dto.branch,
            accountNo: dto.accountNo,
            notes: dto.notes,
        };

        if (dto.amount !== undefined) {
            dataToUpdate.amount = dto.amount;
            const collected = Number(existing.amount) - Number(existing.remainingAmount);
            dataToUpdate.remainingAmount = dto.amount - collected;

            // Ilgili tum AccountMovement'lerin tutarlarini guncelle (Raw SQL ile stale client'i asalim)
            await this.prisma.$executeRawUnsafe(
                `UPDATE account_movements SET amount = $1, document_no = $2 WHERE check_bill_id = $3 AND "tenantId" = $4`,
                dto.amount,
                dto.checkNo || existing.checkNo || '—',
                id,
                tenantId
            );
        }

        await this.prisma.checkBill.updateMany({
            where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
            data: dataToUpdate,
        });

        // Bakiyeleri tekrar hesapla (Raw SQL ile)
        const movements: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT account_id FROM account_movements WHERE check_bill_id = $1 AND "tenantId" = $2`,
            id,
            tenantId
        );
        const accountIdsToRecalculate = movements.map(m => m.account_id);
        if (accountIdsToRecalculate.length > 0) {
            await this.accountBalanceService.recalculateMultipleBalances(accountIdsToRecalculate);
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.checkBill.updateMany({
            where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
            data: { deletedAt: new Date() },
        });
    }
}
