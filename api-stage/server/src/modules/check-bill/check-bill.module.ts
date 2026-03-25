import { Module } from '@nestjs/common';
import { AccountBalanceModule } from '../account-balance/account-balance.module';
import { CheckBillService } from './check-bill.service';
import { CheckBillController } from './check-bill.controller';
import { CheckBillJournalService } from './check-bill-journal.service';
import { CheckBillJournalController } from './check-bill-journal.controller';
import { ReminderTaskService } from './reminder-task.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CheckBillLogService } from './services/check-bill-log.service';
import { CheckBillCollectionService } from './services/check-bill-collection.service';
import { HandlerRegistry } from './handlers/handler-registry';
import { CreditEntryHandler } from './handlers/credit-entry.handler';
import { DebitEntryHandler } from './handlers/debit-entry.handler';
import { BankCollectionHandler } from './handlers/bank-collection.handler';
import { BankGuaranteeHandler } from './handlers/bank-guarantee.handler';
import { EndorsementHandler } from './handlers/endorsement.handler';
import { CollectionHandler } from './handlers/collection.handler';
import { ReturnHandler } from './handlers/return.handler';

@Module({
    imports: [TenantContextModule, AccountBalanceModule],
    controllers: [CheckBillController, CheckBillJournalController],
    providers: [
        CheckBillService,
        CheckBillJournalService,
        ReminderTaskService,
        CheckBillLogService,
        CheckBillCollectionService,
        HandlerRegistry,
        CreditEntryHandler,
        DebitEntryHandler,
        BankCollectionHandler,
        BankGuaranteeHandler,
        EndorsementHandler,
        CollectionHandler,
        ReturnHandler,
    ],
    exports: [CheckBillService, CheckBillJournalService, ReturnHandler],
})
export class CheckBillModule { }