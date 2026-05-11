"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CollectionModule", {
    enumerable: true,
    get: function() {
        return CollectionModule;
    }
});
const _common = require("@nestjs/common");
const _collectionservice = require("./collection.service");
const _collectionexportservice = require("./collection-export.service");
const _collectioncontroller = require("./collection.controller");
const _prismamodule = require("../../common/prisma.module");
const _systemparametermodule = require("../system-parameter/system-parameter.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _accountbalancemodule = require("../account-balance/account-balance.module");
const _invoicemodule = require("../invoice/invoice.module");
const _paymentplanhelperservice = require("../invoice/services/payment-plan-helper.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CollectionModule = class CollectionModule {
};
CollectionModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _systemparametermodule.SystemParameterModule,
            _tenantcontextmodule.TenantContextModule,
            _accountbalancemodule.AccountBalanceModule,
            _invoicemodule.InvoiceModule
        ],
        controllers: [
            _collectioncontroller.CollectionController
        ],
        providers: [
            _collectionservice.CollectionService,
            _collectionexportservice.CollectionExportService,
            _paymentplanhelperservice.PaymentPlanHelperService
        ],
        exports: [
            _collectionservice.CollectionService
        ]
    })
], CollectionModule);

//# sourceMappingURL=collection.module.js.map