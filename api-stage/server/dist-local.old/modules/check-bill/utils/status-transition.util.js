"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get assertLegalTransition () {
        return assertLegalTransition;
    },
    get assertLegalTransitionForPortfolio () {
        return assertLegalTransitionForPortfolio;
    },
    get getAllowedNextStatusesForPortfolio () {
        return getAllowedNextStatusesForPortfolio;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
/**
 * CREDIT (Alacak / Müşteri Çeki) portföyü için izin verilen durum geçişleri.
 * Alacak çekler tahsil edilir; ödeme YAPILMAZ.
 */ const CREDIT_TRANSITIONS = {
    [_client.CheckBillStatus.IN_PORTFOLIO]: [
        _client.CheckBillStatus.IN_BANK_COLLECTION,
        _client.CheckBillStatus.IN_BANK_GUARANTEE,
        _client.CheckBillStatus.ENDORSED,
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.CANCELLED,
        _client.CheckBillStatus.GIVEN_TO_CUSTOMER
    ],
    [_client.CheckBillStatus.IN_BANK_COLLECTION]: [
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.WITHOUT_COVERAGE,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.PARTIAL_PAID
    ],
    [_client.CheckBillStatus.IN_BANK_GUARANTEE]: [
        _client.CheckBillStatus.IN_PORTFOLIO,
        _client.CheckBillStatus.RETURNED
    ],
    [_client.CheckBillStatus.ENDORSED]: [
        _client.CheckBillStatus.ENDORSED,
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.PROTESTED
    ],
    [_client.CheckBillStatus.PARTIAL_PAID]: [
        _client.CheckBillStatus.PARTIAL_PAID,
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.PROTESTED,
        _client.CheckBillStatus.LEGAL_FOLLOWUP
    ],
    [_client.CheckBillStatus.DISCOUNTED]: [
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.RECOURSE
    ],
    [_client.CheckBillStatus.WITHOUT_COVERAGE]: [
        _client.CheckBillStatus.PROTESTED,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.COLLECTED
    ],
    [_client.CheckBillStatus.PROTESTED]: [
        _client.CheckBillStatus.LEGAL_FOLLOWUP,
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.WRITTEN_OFF
    ],
    [_client.CheckBillStatus.LEGAL_FOLLOWUP]: [
        _client.CheckBillStatus.COLLECTED,
        _client.CheckBillStatus.WRITTEN_OFF
    ],
    [_client.CheckBillStatus.RETURNED]: [
        _client.CheckBillStatus.IN_PORTFOLIO
    ],
    [_client.CheckBillStatus.COLLECTED]: [],
    [_client.CheckBillStatus.WRITTEN_OFF]: [],
    [_client.CheckBillStatus.CANCELLED]: [],
    [_client.CheckBillStatus.RECOURSE]: []
};
/**
 * DEBIT (Borç / Firma Çeki) portföyü için izin verilen durum geçişleri.
 * Borç çekler ödenir; tahsilat YAPILMAZ; bankaya verilmez.
 */ const DEBIT_TRANSITIONS = {
    [_client.CheckBillStatus.IN_PORTFOLIO]: [
        _client.CheckBillStatus.PAID,
        _client.CheckBillStatus.WITHOUT_COVERAGE,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.CANCELLED,
        _client.CheckBillStatus.GIVEN_TO_CUSTOMER
    ],
    [_client.CheckBillStatus.UNPAID]: [
        _client.CheckBillStatus.PAID,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.WITHOUT_COVERAGE
    ],
    [_client.CheckBillStatus.WITHOUT_COVERAGE]: [
        _client.CheckBillStatus.PROTESTED,
        _client.CheckBillStatus.RETURNED,
        _client.CheckBillStatus.PAID
    ],
    [_client.CheckBillStatus.PROTESTED]: [
        _client.CheckBillStatus.LEGAL_FOLLOWUP,
        _client.CheckBillStatus.PAID,
        _client.CheckBillStatus.WRITTEN_OFF
    ],
    [_client.CheckBillStatus.LEGAL_FOLLOWUP]: [
        _client.CheckBillStatus.PAID,
        _client.CheckBillStatus.WRITTEN_OFF
    ],
    [_client.CheckBillStatus.RETURNED]: [
        _client.CheckBillStatus.IN_PORTFOLIO
    ],
    [_client.CheckBillStatus.PAID]: [],
    [_client.CheckBillStatus.WRITTEN_OFF]: [],
    [_client.CheckBillStatus.CANCELLED]: []
};
function getAllowedNextStatusesForPortfolio(from, portfolioType) {
    if (!from) return [];
    const table = portfolioType === _client.PortfolioType.DEBIT ? DEBIT_TRANSITIONS : CREDIT_TRANSITIONS;
    return table[from] ?? [];
}
function assertLegalTransition(from, to) {
    if (!from) return;
    // portfolioType bilinmiyorsa her iki tablodan geçiş kontrolü yap
    const creditOk = (CREDIT_TRANSITIONS[from] ?? []).includes(to);
    const debitOk = (DEBIT_TRANSITIONS[from] ?? []).includes(to);
    if (!creditOk && !debitOk) {
        throw new _common.BadRequestException(`Bu işlem geçersiz: "${from}" durumundan "${to}" durumuna geçiş yapılamaz.`);
    }
}
function assertLegalTransitionForPortfolio(from, to, portfolioType) {
    if (!from) return;
    const allowed = getAllowedNextStatusesForPortfolio(from, portfolioType);
    if (!allowed.includes(to)) {
        throw new _common.BadRequestException(`Bu işlem geçersiz: "${from}" durumundan "${to}" durumuna geçiş yapılamaz (portföy: ${portfolioType ?? 'bilinmiyor'}).`);
    }
}

//# sourceMappingURL=status-transition.util.js.map