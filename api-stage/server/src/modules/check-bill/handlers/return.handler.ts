import { Injectable, BadRequestException } from '@nestjs/common';
import { CheckBillStatus, AccountTransactionDirection, LogAction } from '@prisma/client';
import { IJournalHandler, JournalHandlerContext } from './journal-handler.interface';
import { CreateCheckBillJournalDto } from '../dto/create-check-bill-journal.dto';
import { assertLegalTransition } from '../utils/status-transition.util';

@Injectable()
export class ReturnHandler implements IJournalHandler {
    async handle(dto: CreateCheckBillJournalDto, context: JournalHandlerContext): Promise<void> {
        const { tx, journalId, tenantId, performedById } = context;

        const ids = dto.selectedDocumentIds ?? [];
        if (ids.length === 0) return;

        for (const checkBillId of ids) {
            const checkBill = await tx.checkBill.findFirst({
                where: { id: checkBillId, tenantId, deletedAt: null },
            });

            if (!checkBill) throw new BadRequestException(`Evrak bulunamadı: ${checkBillId}`);

            assertLegalTransition(checkBill.status, CheckBillStatus.RETURNED);

            await tx.checkBill.update({
                where: { id: checkBillId },
                data: {
                    status: CheckBillStatus.RETURNED,
                    lastJournalId: journalId,
                    updatedBy: performedById,
                },
            });

            await tx.checkBillJournalItem.create({
                data: { tenantId, journalId, checkBillId },
            });

            await tx.checkBillLog.create({
                data: {
                    tenantId,
                    checkBillId,
                    actionType: LogAction.STATUS_CHANGE,
                    fromStatus: checkBill.status ?? undefined,
                    toStatus: CheckBillStatus.RETURNED,
                    journalId,
                    performedById,
                    notes: 'Evrak iade edildi',
                },
            });

            // Account Transaction: Receivable re-opens (CREDIT)
            await tx.accountTransaction.create({
                data: {
                    tenantId,
                    accountId: checkBill.accountId, // Müşteri veya tedarikçi orijinal hesabı
                    sourceType: 'CHECK_BILL_JOURNAL',
                    sourceId: journalId,
                    direction: AccountTransactionDirection.CREDIT,
                    amount: checkBill.amount,
                    description: 'Document returned — receivable re-opens',
                },
            });

            // Account Movement:
            // Eğer evrak Müşteri Evrakı ise (CREDIT) -> iade edince müşteri bize tekrar borçlanır -> DEBIT
            // Eğer evrak Kendi Evrakımız ise (DEBIT) -> iade gelince tedarikçiye borcumuz tekrar artar -> CREDIT
            const movementType = checkBill.portfolioType === 'CREDIT' ? 'DEBIT' : 'CREDIT';

            await tx.$executeRawUnsafe(
                `INSERT INTO account_movements (id, "tenantId", account_id, type, amount, balance, document_type, document_no, check_bill_id, date, notes, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                require('crypto').randomUUID(),
                tenantId,
                checkBill.accountId,
                movementType,
                checkBill.amount,
                0,
                'RETURN', // İade
                checkBill.checkNo || checkBill.serialNo || '—',
                checkBillId,
                dto.date ? new Date(dto.date) : new Date(),
                dto.notes || 'Evrak İade Edildi'
            );
        }
    }
}
