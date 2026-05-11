"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceModule", {
    enumerable: true,
    get: function() {
        return InvoiceModule;
    }
});
const _common = require("@nestjs/common");
const _invoiceservice = require("./invoice.service");
const _invoicecontroller = require("./invoice.controller");
const _invoiceexportservice = require("./invoice-export.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _tcmbservice = require("../../common/services/tcmb.service");
const _codetemplatemodule = require("../code-template/code-template.module");
const _saleswaybillmodule = require("../sales-waybill/sales-waybill.module");
const _invoiceprofitmodule = require("../invoice-profit/invoice-profit.module");
const _costingmodule = require("../costing/costing.module");
const _systemparametermodule = require("../system-parameter/system-parameter.module");
const _warehousemodule = require("../warehouse/warehouse.module");
const _deletionprotectionmodule = require("../../common/services/deletion-protection.module");
const _accountbalancemodule = require("../account-balance/account-balance.module");
const _unitsetmodule = require("../unit-set/unit-set.module");
const _sharedmodule = require("../shared/shared.module");
const _bullmq = require("@nestjs/bullmq");
const _stockeffectservice = require("./services/stock-effect.service");
const _accounteffectservice = require("./services/account-effect.service");
const _invoiceorchestratorservice = require("./services/invoice-orchestrator.service");
const _reconciliationservice = require("./services/reconciliation.service");
const _invoiceeffectsprocessor = require("./processors/invoice-effects.processor");
const _invoiceorchestratorcontroller = require("./controllers/invoice-orchestrator.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let InvoiceModule = class InvoiceModule {
};
InvoiceModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            _codetemplatemodule.CodeTemplateModule,
            (0, _common.forwardRef)(()=>_saleswaybillmodule.SalesWaybillModule),
            _invoiceprofitmodule.InvoiceProfitModule,
            _costingmodule.CostingModule,
            _systemparametermodule.SystemParameterModule,
            _warehousemodule.WarehouseModule,
            _deletionprotectionmodule.DeletionProtectionModule,
            _accountbalancemodule.AccountBalanceModule,
            _unitsetmodule.UnitSetModule,
            _sharedmodule.SharedModule,
            _bullmq.BullModule.registerQueue({
                name: 'invoice-effects'
            })
        ],
        controllers: [
            _invoicecontroller.InvoiceController,
            _invoiceorchestratorcontroller.InvoiceOrchestratorController
        ],
        providers: [
            _invoiceservice.InvoiceService,
            _invoiceexportservice.InvoiceExportService,
            _tcmbservice.TcmbService,
            _stockeffectservice.StockEffectService,
            _accounteffectservice.AccountEffectService,
            _invoiceorchestratorservice.InvoiceOrchestratorService,
            _reconciliationservice.ReconciliationService,
            _invoiceeffectsprocessor.InvoiceEffectsProcessor
        ],
        exports: [
            _invoiceservice.InvoiceService,
            _invoiceorchestratorservice.InvoiceOrchestratorService,
            _reconciliationservice.ReconciliationService
        ]
    })
], InvoiceModule);

//# sourceMappingURL=invoice.module.js.map