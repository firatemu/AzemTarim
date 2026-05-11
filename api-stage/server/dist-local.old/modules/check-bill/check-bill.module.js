"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillModule", {
    enumerable: true,
    get: function() {
        return CheckBillModule;
    }
});
const _common = require("@nestjs/common");
const _codetemplatemodule = require("../code-template/code-template.module");
const _accountbalancemodule = require("../account-balance/account-balance.module");
const _checkbillservice = require("./check-bill.service");
const _checkbillcontroller = require("./check-bill.controller");
const _checkbilljournalservice = require("./check-bill-journal.service");
const _checkbilljournalcontroller = require("./check-bill-journal.controller");
const _checkbillreportscontroller = require("./check-bill-reports.controller");
const _remindertaskservice = require("./reminder-task.service");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _checkbilllogservice = require("./services/check-bill-log.service");
const _checkbillcollectionservice = require("./services/check-bill-collection.service");
const _handlerregistry = require("./handlers/handler-registry");
const _creditentryhandler = require("./handlers/credit-entry.handler");
const _debitentryhandler = require("./handlers/debit-entry.handler");
const _bankcollectionhandler = require("./handlers/bank-collection.handler");
const _bankguaranteehandler = require("./handlers/bank-guarantee.handler");
const _endorsementhandler = require("./handlers/endorsement.handler");
const _collectionhandler = require("./handlers/collection.handler");
const _documentexithandler = require("./handlers/document-exit.handler");
const _returnhandler = require("./handlers/return.handler");
const _discounthandler = require("./handlers/discount.handler");
const _protesthandler = require("./handlers/protest.handler");
const _writeoffhandler = require("./handlers/write-off.handler");
const _reversaljournalhandler = require("./handlers/reversal-journal.handler");
const _legaltransferhandler = require("./handlers/legal-transfer.handler");
const _glintegrationservice = require("./services/gl-integration.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CheckBillModule = class CheckBillModule {
};
CheckBillModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _tenantcontextmodule.TenantContextModule,
            _accountbalancemodule.AccountBalanceModule,
            _codetemplatemodule.CodeTemplateModule
        ],
        controllers: [
            _checkbillcontroller.CheckBillController,
            _checkbilljournalcontroller.CheckBillJournalController,
            _checkbillreportscontroller.CheckBillReportsController
        ],
        providers: [
            _checkbillservice.CheckBillService,
            _checkbilljournalservice.CheckBillJournalService,
            _remindertaskservice.ReminderTaskService,
            _checkbilllogservice.CheckBillLogService,
            _checkbillcollectionservice.CheckBillCollectionService,
            _handlerregistry.HandlerRegistry,
            _creditentryhandler.CreditEntryHandler,
            _debitentryhandler.DebitEntryHandler,
            _bankcollectionhandler.BankCollectionHandler,
            _bankguaranteehandler.BankGuaranteeHandler,
            _endorsementhandler.EndorsementHandler,
            _collectionhandler.CollectionHandler,
            _documentexithandler.DocumentExitHandler,
            _returnhandler.ReturnHandler,
            _discounthandler.DiscountHandler,
            _protesthandler.ProtestHandler,
            _writeoffhandler.WriteOffHandler,
            _reversaljournalhandler.ReversalJournalHandler,
            _legaltransferhandler.LegalTransferHandler,
            _glintegrationservice.GlIntegrationService
        ],
        exports: [
            _checkbillservice.CheckBillService,
            _checkbilljournalservice.CheckBillJournalService,
            _returnhandler.ReturnHandler,
            _glintegrationservice.GlIntegrationService
        ]
    })
], CheckBillModule);

//# sourceMappingURL=check-bill.module.js.map