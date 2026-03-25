import { Injectable } from '@nestjs/common';
import { CheckBillStatus, AccountTransactionDirection, LogAction } from '@prisma/client';
import { IJournalHandler, JournalHandlerContext } from './journal-handler.interface';
import { CreateCheckBillJournalDto } from '../dto/create-check-bill-journal.dto';

@Injectable()
export class CreditEntryHandler implements IJournalHandler {
    async handle(dto: CreateCheckBillJournalDto, context: JournalHandlerContext): Promise<void> {
        const { tx, journalId, tenantId, performedById } = context;

        if (!dto.newDocuments || dto.newDocuments.length === 0) return;

        for (const docDto of dto.newDocuments) {
            const checkBill = await tx.checkBill.create({
                data: {
                    tenantId,
                    type: docDto.type,
                    portfolioType: 'CREDIT',
                    accountId: dto.accountId!,
                    amount: docDto.amount,
                    remainingAmount: docDto.amount,
                    dueDate: new Date(docDto.dueDate),
                    bank: docDto.bank,
                    branch: docDto.branch,
                    accountNo: docDto.accountNo,
                    checkNo: docDto.checkNo,
                    status: CheckBillStatus.IN_PORTFOLIO,
                    notes: docDto.notes,
                    currentHolderId: dto.accountId,
                    lastJournalId: journalId,
                },
            });

            await tx.checkBillJournalItem.create({
                data: { tenantId, journalId, checkBillId: checkBill.id },
            });

            await tx.checkBillLog.create({
                data: {
                    tenantId,
                    checkBillId: checkBill.id,
                    actionType: LogAction.CREATE,
                    fromStatus: null,
                    toStatus: CheckBillStatus.IN_PORTFOLIO,
                    journalId,
                    performedById,
                    notes: 'Müşteri evrak girişi',
                },
            });

            await tx.accountTransaction.create({
                data: {
                    tenantId,
                    accountId: checkBill.accountId,
                    sourceType: 'CHECK_BILL_JOURNAL',
                    sourceId: journalId,
                    direction: AccountTransactionDirection.CREDIT,
                    amount: checkBill.amount,
                    description: 'Customer document received',
                },
            });

            await tx.$executeRawUnsafe(
                `INSERT INTO account_movements (id, "tenantId", account_id, type, amount, balance, document_type, document_no, check_bill_id, date, notes, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                require('crypto').randomUUID(),
                tenantId,
                checkBill.accountId,
                'CREDIT',
                checkBill.amount,
                0,
                'CHECK_ENTRY',
                checkBill.checkNo || '—',
                checkBill.id,
                dto.date ? new Date(dto.date) : new Date(),
                dto.notes || 'Müşteri evrak girişi (Alacak)'
            );
        }
    }
}
