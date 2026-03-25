export enum CheckBillType {
    CHECK = 'CHECK',
    PROMISSORY = 'PROMISSORY',
}

export enum PortfolioType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

export enum CheckBillStatus {
    IN_PORTFOLIO = 'IN_PORTFOLIO',
    UNPAID = 'UNPAID',
    GIVEN_TO_BANK = 'GIVEN_TO_BANK',
    COLLECTED = 'COLLECTED',
    PAID = 'PAID',
    ENDORSED = 'ENDORSED',
    RETURNED = 'RETURNED',
    WITHOUT_COVERAGE = 'WITHOUT_COVERAGE',
    IN_BANK_COLLECTION = 'IN_BANK_COLLECTION',
    IN_BANK_GUARANTEE = 'IN_BANK_GUARANTEE',
    PARTIAL_PAID = 'PARTIAL_PAID',
    PROTESTED = 'PROTESTED',
}

export enum JournalType {
    ENTRY_PAYROLL = 'ENTRY_PAYROLL',
    EXIT_PAYROLL = 'EXIT_PAYROLL',
    CUSTOMER_DOCUMENT_ENTRY = 'CUSTOMER_DOCUMENT_ENTRY',
    CUSTOMER_DOCUMENT_EXIT = 'CUSTOMER_DOCUMENT_EXIT',
    OWN_DOCUMENT_ENTRY = 'OWN_DOCUMENT_ENTRY',
    OWN_DOCUMENT_EXIT = 'OWN_DOCUMENT_EXIT',
    BANK_COLLECTION_ENDORSEMENT = 'BANK_COLLECTION_ENDORSEMENT',
    BANK_GUARANTEE_ENDORSEMENT = 'BANK_GUARANTEE_ENDORSEMENT',
    ACCOUNT_DOCUMENT_ENDORSEMENT = 'ACCOUNT_DOCUMENT_ENDORSEMENT',
    DEBIT_DOCUMENT_EXIT = 'DEBIT_DOCUMENT_EXIT',
    RETURN_PAYROLL = 'RETURN_PAYROLL',
}

export enum BankAccountType {
    DEMAND_DEPOSIT = 'DEMAND_DEPOSIT',
    LOAN = 'LOAN',
    POS = 'POS',
    COMPANY_CREDIT_CARD = 'COMPANY_CREDIT_CARD',
    TIME_DEPOSIT = 'TIME_DEPOSIT',
    INVESTMENT = 'INVESTMENT',
    GOLD = 'GOLD',
    CURRENCY = 'CURRENCY',
}

export interface Account {
    id: string;
    title: string;
    code?: string;
}

export interface BankAccount {
    id: string;
    name: string;
    bankName: string;
    iban?: string;
    type?: BankAccountType;
}

export interface Cashbox {
    id: string;
    name: string;
    isRetail?: boolean;
}

export interface CheckBillLog {
    id: string;
    checkBillId: string;
    fromStatus?: CheckBillStatus;
    toStatus: CheckBillStatus;
    journalId?: string;
    performedById?: string;
    notes?: string;
    createdAt: string;
}

export interface CheckBillEndorsement {
    id: string;
    checkBillId: string;
    sequence: number;
    fromAccountId: string;
    fromAccount: Account;
    toAccountId: string;
    toAccount: Account;
    endorsedAt: string;
    journalId: string;
}

export interface CheckBillCollection {
    id: string;
    checkBillId: string;
    collectedAmount: number;
    collectionDate: string;
    cashboxId?: string;
    cashbox?: Cashbox;
    bankAccountId?: string;
    bankAccount?: BankAccount;
    journalId: string;
    createdAt: string;
}

export interface CheckBill {
    id: string;
    tenantId: string;
    type: CheckBillType;
    portfolioType: PortfolioType;
    accountId: string;
    account: Account;
    amount: number;
    remainingAmount: number;
    dueDate: string;
    bank?: string;
    branch?: string;
    accountNo?: string;
    checkNo?: string;
    serialNo?: string;
    status: CheckBillStatus;
    currentHolderId?: string;
    currentHolder?: Account;
    isProtested: boolean;
    protestedAt?: string;
    isEndorsed: boolean;
    endorsementDate?: string;
    endorsedTo?: string;
    collectionDate?: string;
    notes?: string;
    lastJournalId?: string;
    createdAt: string;
    updatedAt: string;
    endorsements?: CheckBillEndorsement[];
    collections?: CheckBillCollection[];
    logs?: CheckBillLog[];
}

export interface CheckBillJournal {
    id: string;
    journalNo: string;
    type: JournalType;
    date: string;
    accountId?: string;
    account?: Account;
    bankAccountId?: string;
    bankAccount?: BankAccount;
    cashboxId?: string;
    cashbox?: Cashbox;
    notes?: string;
    totalAmount?: number;
    documentCount?: number;
    checkBills?: CheckBill[];
    createdAt: string;
}

export interface CheckBillFilters {
    type?: CheckBillType;
    portfolioType?: PortfolioType;
    status?: CheckBillStatus | CheckBillStatus[];
    accountId?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    isProtested?: boolean;
    search?: string;
}

export interface JournalFilters {
    type?: JournalType;
    dateFrom?: string;
    dateTo?: string;
    accountId?: string;
    search?: string;
}
