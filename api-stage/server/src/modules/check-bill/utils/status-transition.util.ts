import { BadRequestException } from '@nestjs/common';
import { CheckBillStatus } from '@prisma/client';

const LEGAL_TRANSITIONS: Record<string, CheckBillStatus[]> = {
    [CheckBillStatus.IN_PORTFOLIO]: [
        CheckBillStatus.IN_BANK_COLLECTION,
        CheckBillStatus.IN_BANK_GUARANTEE,
        CheckBillStatus.ENDORSED,
        CheckBillStatus.PARTIAL_PAID,
        CheckBillStatus.COLLECTED,
        CheckBillStatus.RETURNED,
    ],
    [CheckBillStatus.IN_BANK_COLLECTION]: [
        CheckBillStatus.COLLECTED,
        CheckBillStatus.RETURNED,
        CheckBillStatus.PARTIAL_PAID,
    ],
    [CheckBillStatus.IN_BANK_GUARANTEE]: [
        CheckBillStatus.COLLECTED,
        CheckBillStatus.RETURNED,
    ],
    [CheckBillStatus.ENDORSED]: [
        CheckBillStatus.ENDORSED,
        CheckBillStatus.COLLECTED,
        CheckBillStatus.RETURNED,
    ],
    [CheckBillStatus.PARTIAL_PAID]: [
        CheckBillStatus.PARTIAL_PAID,
        CheckBillStatus.COLLECTED,
    ],
    [CheckBillStatus.COLLECTED]: [
        CheckBillStatus.RETURNED,
        CheckBillStatus.WITHOUT_COVERAGE,
    ],
    [CheckBillStatus.WITHOUT_COVERAGE]: [
        CheckBillStatus.PROTESTED,
        CheckBillStatus.RETURNED,
    ],
    [CheckBillStatus.RETURNED]: [
        CheckBillStatus.IN_PORTFOLIO,
    ],
    [CheckBillStatus.UNPAID]: [
        CheckBillStatus.PAID,
        CheckBillStatus.RETURNED,
        CheckBillStatus.WITHOUT_COVERAGE,
    ],
    [CheckBillStatus.GIVEN_TO_BANK]: [
        CheckBillStatus.COLLECTED,
        CheckBillStatus.RETURNED,
    ],
};

export function assertLegalTransition(
    from: CheckBillStatus | null | undefined,
    to: CheckBillStatus,
): void {
    if (!from) return; // Yeni kayıt — herhangi bir başlangıç durumu kabul edilir

    const allowed = LEGAL_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
        throw new BadRequestException(
            `Bu işlem geçersiz: "${from}" durumundan "${to}" durumuna geçiş yapılamaz.`,
        );
    }
}
