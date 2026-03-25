import { CheckBillStatus, CheckBillType, JournalType, PortfolioType } from '../types/check-bill';

export const STATUS_LABEL: Record<CheckBillStatus, string> = {
    IN_PORTFOLIO: 'Portföyde',
    UNPAID: 'Ödenmedi',
    GIVEN_TO_BANK: 'Bankaya Verildi',
    COLLECTED: 'Tahsil Edildi',
    PAID: 'Ödendi',
    ENDORSED: 'Ciro Edildi',
    RETURNED: 'İade Edildi',
    WITHOUT_COVERAGE: 'Karşılıksız',
    IN_BANK_COLLECTION: 'Bankada Tahsilde',
    IN_BANK_GUARANTEE: 'Bankada Teminatta',
    PARTIAL_PAID: 'Kısmi Ödendi',
    PROTESTED: 'Protesto Edildi',
};

// MUI Chip colors mapping (default, primary, secondary, error, info, success, warning)
export const STATUS_MUI_COLOR: Record<CheckBillStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    IN_PORTFOLIO: 'info',
    UNPAID: 'error',
    GIVEN_TO_BANK: 'secondary',
    COLLECTED: 'success',
    PAID: 'success',
    ENDORSED: 'warning',
    RETURNED: 'error',
    WITHOUT_COVERAGE: 'error',
    IN_BANK_COLLECTION: 'primary',
    IN_BANK_GUARANTEE: 'primary',
    PARTIAL_PAID: 'warning',
    PROTESTED: 'error',
};

export const TYPE_LABEL: Record<CheckBillType, string> = {
    CHECK: 'Çek',
    PROMISSORY: 'Senet',
};

export const PORTFOLIO_LABEL: Record<PortfolioType, string> = {
    CREDIT: 'Alacak',
    DEBIT: 'Borç',
};

export const JOURNAL_TYPE_LABEL: Record<JournalType, string> = {
    ENTRY_PAYROLL: 'Giriş Bordrosu',
    EXIT_PAYROLL: 'Çıkış Bordrosu',
    CUSTOMER_DOCUMENT_ENTRY: 'Müşteri Evrak Girişi',
    CUSTOMER_DOCUMENT_EXIT: 'Müşteri Evrak Çıkışı',
    OWN_DOCUMENT_ENTRY: 'Kendi Evrak Girişi',
    OWN_DOCUMENT_EXIT: 'Borç Evrak Çıkışı',
    BANK_COLLECTION_ENDORSEMENT: 'Bankaya Tahsil Cirosu',
    BANK_GUARANTEE_ENDORSEMENT: 'Bankaya Teminat Cirosu',
    ACCOUNT_DOCUMENT_ENDORSEMENT: 'Cariye Evrak Cirosu',
    DEBIT_DOCUMENT_EXIT: 'Borç Evrak Çıkışı',
    RETURN_PAYROLL: 'İade Bordrosu',
};

export const JOURNAL_TYPE_DESCRIPTION: Record<JournalType, string> = {
    ENTRY_PAYROLL: 'Portföye yeni evrak girişi',
    EXIT_PAYROLL: 'Portföyden evrak çıkışı',
    CUSTOMER_DOCUMENT_ENTRY: 'Müşteriden alınan çek/senet kaydı',
    CUSTOMER_DOCUMENT_EXIT: 'Müşteriye iade edilen evrak',
    OWN_DOCUMENT_ENTRY: 'Firmamız tarafından verilen çek/senet',
    OWN_DOCUMENT_EXIT: 'Borcumuza karşılık evrak çıkışı',
    BANK_COLLECTION_ENDORSEMENT: 'Tahsil için bankaya ciro',
    BANK_GUARANTEE_ENDORSEMENT: 'Teminat olarak bankaya ciro',
    ACCOUNT_DOCUMENT_ENDORSEMENT: 'Cariye ciro edildi',
    DEBIT_DOCUMENT_EXIT: 'Borç evrak çıkışı işlemi',
    RETURN_PAYROLL: 'İade bordrosu işlemi',
};
