import { Injectable, BadRequestException } from '@nestjs/common';
import { CheckBillStatus, AccountTransactionDirection, LogAction } from '@prisma/client';
import { IJournalHandler, JournalHandlerContext } from './journal-handler.interface';
import { CreateCheckBillJournalDto } from '../dto/create-check-bill-journal.dto';
import { assertLegalTransition } from '../utils/status-transition.util';

@Injectable()
export class EndorsementHandler implements IJournalHandler {
    async handle(dto: CreateCheckBillJournalDto, context: JournalHandlerContext): Promise<void> {
        const { tx, journalId, tenantId, performedById } = context;

        if (!dto.selectedDocumentIds || dto.selectedDocumentIds.length === 0) return;
        if (!dto.accountId) throw new BadRequestException('Ciro edilecek cari (accountId) zorunludur.');

        for (const checkBillId of dto.selectedDocumentIds) {
            const checkBill = await tx.checkBill.findFirst({
                where: { id: checkBillId, tenantId, deletedAt: null },
            });

            if (!checkBill) throw new BadRequestException(`Evrak bulunamadı: ${checkBillId}`);

            assertLegalTransition(checkBill.status, CheckBillStatus.ENDORSED);

            // Ciro sekans hesapla
            const existingCount = await tx.checkBillEndorsement.count({
                where: { checkBillId },
            });
            const sequence = existingCount + 1;

            await tx.checkBillEndorsement.create({
                data: {
                    tenantId,
                    checkBillId,
                    sequence,
                    fromAccountId: checkBill.currentHolderId ?? checkBill.accountId,
                    toAccountId: dto.accountId!,
                    endorsedAt: new Date(dto.date),
                    journalId,
                },
            });

            await tx.checkBill.update({
                where: { id: checkBillId },
                data: {
                    status: CheckBillStatus.ENDORSED,
                    currentHolderId: dto.accountId,
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
                    toStatus: CheckBillStatus.ENDORSED,
                    journalId,
                    performedById,
                    notes: `Ciro sırası: ${sequence}`,
                },
            });

            await tx.accountTransaction.create({
                data: {
                    tenantId,
                    accountId: checkBill.currentHolderId ?? checkBill.accountId,
                    sourceType: 'CHECK_BILL_JOURNAL',
                    sourceId: journalId,
                    direction: AccountTransactionDirection.DEBIT,
                    amount: checkBill.amount,
                    description: 'Document endorsed to third party',
                },
            });

            await tx.$executeRawUnsafe(
                `INSERT INTO account_movements (id, "tenantId", account_id, type, amount, balance, document_type, document_no, check_bill_id, date, notes, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
                require('crypto').randomUUID(),
                tenantId,
                dto.accountId, // check'i verdiğimiz cari (Tedarikçi)
                'DEBIT',
                checkBill.amount,
                0,
                'CHECK_EXIT', // Ciro çıkışı
                checkBill.checkNo || '—',
                checkBillId,
                dto.date ? new Date(dto.date) : new Date(),
                dto.notes || 'Evrak Ciro Edildi (Borç)'
            );
        }
    }
}
