import { Injectable } from '@nestjs/common';
import { JournalType } from '@prisma/client';
import { IJournalHandler } from './journal-handler.interface';
import { CreditEntryHandler } from './credit-entry.handler';
import { DebitEntryHandler } from './debit-entry.handler';
import { BankCollectionHandler } from './bank-collection.handler';
import { BankGuaranteeHandler } from './bank-guarantee.handler';
import { EndorsementHandler } from './endorsement.handler';
import { CollectionHandler } from './collection.handler';
import { ReturnHandler } from './return.handler';

@Injectable()
export class HandlerRegistry {
    private readonly registry: Partial<Record<JournalType, IJournalHandler>>;

    constructor(
        private readonly creditEntryHandler: CreditEntryHandler,
        private readonly debitEntryHandler: DebitEntryHandler,
        private readonly bankCollectionHandler: BankCollectionHandler,
        private readonly bankGuaranteeHandler: BankGuaranteeHandler,
        private readonly endorsementHandler: EndorsementHandler,
        private readonly collectionHandler: CollectionHandler,
        private readonly returnHandler: ReturnHandler,
    ) {
        this.registry = {
            [JournalType.CUSTOMER_DOCUMENT_ENTRY]: this.creditEntryHandler,
            [JournalType.OWN_DOCUMENT_ENTRY]: this.debitEntryHandler,
            [JournalType.BANK_COLLECTION_ENDORSEMENT]: this.bankCollectionHandler,
            [JournalType.BANK_GUARANTEE_ENDORSEMENT]: this.bankGuaranteeHandler,
            [JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT]: this.endorsementHandler,
            [JournalType.CUSTOMER_DOCUMENT_EXIT]: this.collectionHandler,
            [JournalType.OWN_DOCUMENT_EXIT]: this.collectionHandler,
            [JournalType.DEBIT_DOCUMENT_EXIT]: this.collectionHandler,
            [JournalType.RETURN_PAYROLL]: this.returnHandler,
        };
    }

    resolve(type: JournalType): IJournalHandler | null {
        return this.registry[type] ?? null;
    }
}
