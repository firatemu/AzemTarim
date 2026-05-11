"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HandlerRegistry", {
    enumerable: true,
    get: function() {
        return HandlerRegistry;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _creditentryhandler = require("./credit-entry.handler");
const _debitentryhandler = require("./debit-entry.handler");
const _bankcollectionhandler = require("./bank-collection.handler");
const _bankguaranteehandler = require("./bank-guarantee.handler");
const _endorsementhandler = require("./endorsement.handler");
const _collectionhandler = require("./collection.handler");
const _documentexithandler = require("./document-exit.handler");
const _returnhandler = require("./return.handler");
const _discounthandler = require("./discount.handler");
const _protesthandler = require("./protest.handler");
const _writeoffhandler = require("./write-off.handler");
const _reversaljournalhandler = require("./reversal-journal.handler");
const _legaltransferhandler = require("./legal-transfer.handler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let HandlerRegistry = class HandlerRegistry {
    resolve(type) {
        return this.registry[type] ?? null;
    }
    constructor(creditEntryHandler, debitEntryHandler, bankCollectionHandler, bankGuaranteeHandler, endorsementHandler, collectionHandler, documentExitHandler, returnHandler, discountHandler, protestHandler, writeOffHandler, reversalJournalHandler, legalTransferHandler){
        this.creditEntryHandler = creditEntryHandler;
        this.debitEntryHandler = debitEntryHandler;
        this.bankCollectionHandler = bankCollectionHandler;
        this.bankGuaranteeHandler = bankGuaranteeHandler;
        this.endorsementHandler = endorsementHandler;
        this.collectionHandler = collectionHandler;
        this.documentExitHandler = documentExitHandler;
        this.returnHandler = returnHandler;
        this.discountHandler = discountHandler;
        this.protestHandler = protestHandler;
        this.writeOffHandler = writeOffHandler;
        this.reversalJournalHandler = reversalJournalHandler;
        this.legalTransferHandler = legalTransferHandler;
        this.registry = {
            [_client.JournalType.CUSTOMER_DOCUMENT_ENTRY]: this.creditEntryHandler,
            [_client.JournalType.OWN_DOCUMENT_ENTRY]: this.debitEntryHandler,
            [_client.JournalType.BANK_COLLECTION_ENDORSEMENT]: this.bankCollectionHandler,
            [_client.JournalType.BANK_GUARANTEE_ENDORSEMENT]: this.bankGuaranteeHandler,
            [_client.JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT]: this.endorsementHandler,
            [_client.JournalType.CUSTOMER_DOCUMENT_EXIT]: this.documentExitHandler,
            [_client.JournalType.OWN_DOCUMENT_EXIT]: this.documentExitHandler,
            [_client.JournalType.DEBIT_DOCUMENT_EXIT]: this.documentExitHandler,
            [_client.JournalType.RETURN_PAYROLL]: this.returnHandler,
            [_client.JournalType.PARTIAL_COLLECTION]: this.collectionHandler,
            [_client.JournalType.BANK_DISCOUNT_SUBMISSION]: this.discountHandler,
            [_client.JournalType.PROTEST_ENTRY]: this.protestHandler,
            [_client.JournalType.WRITE_OFF]: this.writeOffHandler,
            [_client.JournalType.REVERSAL]: this.reversalJournalHandler,
            [_client.JournalType.LEGAL_TRANSFER]: this.legalTransferHandler,
            [_client.JournalType.RETURN_FROM_BANK]: this.returnHandler
        };
    }
};
HandlerRegistry = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _creditentryhandler.CreditEntryHandler === "undefined" ? Object : _creditentryhandler.CreditEntryHandler,
        typeof _debitentryhandler.DebitEntryHandler === "undefined" ? Object : _debitentryhandler.DebitEntryHandler,
        typeof _bankcollectionhandler.BankCollectionHandler === "undefined" ? Object : _bankcollectionhandler.BankCollectionHandler,
        typeof _bankguaranteehandler.BankGuaranteeHandler === "undefined" ? Object : _bankguaranteehandler.BankGuaranteeHandler,
        typeof _endorsementhandler.EndorsementHandler === "undefined" ? Object : _endorsementhandler.EndorsementHandler,
        typeof _collectionhandler.CollectionHandler === "undefined" ? Object : _collectionhandler.CollectionHandler,
        typeof _documentexithandler.DocumentExitHandler === "undefined" ? Object : _documentexithandler.DocumentExitHandler,
        typeof _returnhandler.ReturnHandler === "undefined" ? Object : _returnhandler.ReturnHandler,
        typeof _discounthandler.DiscountHandler === "undefined" ? Object : _discounthandler.DiscountHandler,
        typeof _protesthandler.ProtestHandler === "undefined" ? Object : _protesthandler.ProtestHandler,
        typeof _writeoffhandler.WriteOffHandler === "undefined" ? Object : _writeoffhandler.WriteOffHandler,
        typeof _reversaljournalhandler.ReversalJournalHandler === "undefined" ? Object : _reversaljournalhandler.ReversalJournalHandler,
        typeof _legaltransferhandler.LegalTransferHandler === "undefined" ? Object : _legaltransferhandler.LegalTransferHandler
    ])
], HandlerRegistry);

//# sourceMappingURL=handler-registry.js.map