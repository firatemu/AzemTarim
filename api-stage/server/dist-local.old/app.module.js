"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _core = require("@nestjs/core");
const _jwt = require("@nestjs/jwt");
const _schedule = require("@nestjs/schedule");
const _throttler = require("@nestjs/throttler");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
const _jwtauthguard = require("./common/guards/jwt-auth.guard");
const _tenantmiddleware = require("./common/middleware/tenant.middleware");
const _prismamodule = require("./common/prisma.module");
const _licensemodule = require("./common/services/license.module");
const _redismodule = require("./common/services/redis.module");
const _tenantcontextmodule = require("./common/services/tenant-context.module");
const _b2bprismamodule = require("./common/services/b2b-prisma.module");
const _deletionprotectionmodule = require("./common/services/deletion-protection.module");
const _securitymodule = require("./common/services/security.module");
const _tenantsecurityexceptionfilter = require("./common/filters/tenant-security-exception.filter");
const _analyticsmodule = require("./modules/analytics/analytics.module");
const _vehiclebrandmodule = require("./modules/vehicle-brand/vehicle-brand.module");
const _customervehiclemodule = require("./modules/customer-vehicle/customer-vehicle.module");
const _workordermodule = require("./modules/work-order/work-order.module");
const _techniciansmodule = require("./modules/technicians/technicians.module");
const _workorderitemmodule = require("./modules/work-order-item/work-order-item.module");
const _partrequestmodule = require("./modules/part-request/part-request.module");
const _serviceinvoicemodule = require("./modules/service-invoice/service-invoice.module");
const _journalentrymodule = require("./modules/journal-entry/journal-entry.module");
const _authmodule = require("./modules/auth/auth.module");
const _banktransfermodule = require("./modules/bank-transfer/bank-transfer.module");
const _bankaccountmodule = require("./modules/bank-account/bank-account.module");
const _bankmodule = require("./modules/bank/bank.module");
const _simpleordermodule = require("./modules/simple-order/simple-order.module");
const _accountmovementmodule = require("./modules/account-movement/account-movement.module");
const _accountmodule = require("./modules/account/account.module");
const _salesagentmodule = require("./modules/sales-agent/sales-agent.module");
const _dashboardmodule = require("./modules/dashboard/dashboard.module");
const _codetemplatemodule = require("./modules/code-template/code-template.module");
const _costingmodule = require("./modules/costing/costing.module");
const _invoicemodule = require("./modules/invoice/invoice.module");
const _pricelistmodule = require("./modules/price-list/price-list.module");
const _invoiceprofitmodule = require("./modules/invoice-profit/invoice-profit.module");
const _companycreditcardmodule = require("./modules/company-credit-card/company-credit-card.module");
const _cashboxmodule = require("./modules/cashbox/cashbox.module");
const _categorymodule = require("./modules/category/category.module");
const _licensesmodule = require("./modules/licenses/licenses.module");
const _locationmodule = require("./modules/location/location.module");
const _brandmodule = require("./modules/brand/brand.module");
const _expensemodule = require("./modules/expense/expense.module");
const _paymentsmodule = require("./modules/payments/payments.module");
const _employeemodule = require("./modules/employee/employee.module");
const _salaryplanmodule = require("./modules/salary-plan/salary-plan.module");
const _advancemodule = require("./modules/advance/advance.module");
const _unitsetmodule = require("./modules/unit-set/unit-set.module");
const _plansmodule = require("./modules/plans/plans.module");
const _pricecardmodule = require("./modules/price-card/price-card.module");
const _productbarcodemodule = require("./modules/product-barcode/product-barcode.module");
const _purchaseordersmodule = require("./modules/purchase-orders/purchase-orders.module");
const _reportingmodule = require("./modules/reporting/reporting.module");
const _inventorycountmodule = require("./modules/inventory-count/inventory-count.module");
const _ordermodule = require("./modules/order/order.module");
const _saleswaybillmodule = require("./modules/sales-waybill/sales-waybill.module");
const _purchasewaybillmodule = require("./modules/purchase-waybill/purchase-waybill.module");
const _stockmovemodule = require("./modules/stock-move/stock-move.module");
const _productmovementmodule = require("./modules/product-movement/product-movement.module");
const _productmodule = require("./modules/product/product.module");
const _subscriptionsmodule = require("./modules/subscriptions/subscriptions.module");
const _systemparametermodule = require("./modules/system-parameter/system-parameter.module");
const _collectionmodule = require("./modules/collection/collection.module");
const _tenantsmodule = require("./modules/tenants/tenants.module");
const _usersmodule = require("./modules/users/users.module");
const _warehousemodule = require("./modules/warehouse/warehouse.module");
const _postalcodemodule = require("./modules/postal-code/postal-code.module");
const _quickinvoicemodule = require("./modules/quick-invoice/quick-invoice.module");
const _warehousecriticalstockmodule = require("./modules/warehouse-critical-stock/warehouse-critical-stock.module");
const _warehousetransfermodule = require("./modules/warehouse-transfer/warehouse-transfer.module");
const _checkbillmodule = require("./modules/check-bill/check-bill.module");
const _posmodule = require("./modules/pos/pos.module");
const _permissionsmodule = require("./modules/permissions/permissions.module");
const _rolesmodule = require("./modules/roles/roles.module");
const _storagemodule = require("./modules/storage/storage.module");
const _adminmodule = require("./modules/admin/admin.module");
const _queuemodule = require("./common/modules/queue.module");
const _companyvehiclesmodule = require("./modules/company-vehicles/company-vehicles.module");
const _vehicleexpensesmodule = require("./modules/vehicle-expenses/vehicle-expenses.module");
const _rlsmodule = require("./modules/rls/rls.module");
const _b2bsyncmodule = require("./modules/b2b-sync/b2b-sync.module");
const _b2badminmodule = require("./modules/b2b-admin/b2b-admin.module");
const _b2bportalmodule = require("./modules/b2b-portal/b2b-portal.module");
const _internalmodule = require("./modules/internal/internal.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(_tenantmiddleware.TenantMiddleware).forRoutes('*');
    }
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _rolesmodule.RolesModule,
            _permissionsmodule.PermissionsModule,
            _config.ConfigModule.forRoot({
                isGlobal: true
            }),
            _schedule.ScheduleModule.forRoot(),
            _throttler.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 1000
                }
            ]),
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            _deletionprotectionmodule.DeletionProtectionModule,
            _securitymodule.SecurityModule,
            _redismodule.RedisModule,
            _b2bprismamodule.B2BPrismaModule,
            _licensemodule.LicenseModule,
            _jwt.JwtModule.register({}),
            _authmodule.AuthModule,
            _salesagentmodule.SalesAgentModule,
            _tenantsmodule.TenantsModule,
            _subscriptionsmodule.SubscriptionsModule,
            _paymentsmodule.PaymentsModule,
            _plansmodule.PlansModule,
            _analyticsmodule.AnalyticsModule,
            _usersmodule.UsersModule,
            _dashboardmodule.DashboardModule,
            _licensesmodule.LicensesModule,
            _productmodule.ProductModule,
            _productmovementmodule.ProductMovementModule,
            _accountmodule.AccountModule,
            _accountmovementmodule.AccountMovementModule,
            _invoicemodule.InvoiceModule,
            _ordermodule.OrderModule,
            _saleswaybillmodule.SalesWaybillModule,
            _purchasewaybillmodule.PurchaseWaybillModule,
            // QuoteModule,
            _inventorycountmodule.InventoryCountModule,
            _systemparametermodule.SystemParameterModule,
            _collectionmodule.CollectionModule,
            _cashboxmodule.CashboxModule,
            _bankaccountmodule.BankAccountModule,
            _bankmodule.BankModule,
            _companycreditcardmodule.CompanyCreditCardModule,
            _expensemodule.ExpenseModule,
            _banktransfermodule.BankTransferModule,
            _employeemodule.EmployeeModule,
            _salaryplanmodule.SalaryPlanModule,
            // SalaryPaymentModule, // Temporarily disabled due to multiple errors
            _advancemodule.AdvanceModule,
            _unitsetmodule.UnitSetModule,
            _warehousemodule.WarehouseModule,
            _warehousecriticalstockmodule.WarehouseCriticalStockModule,
            _postalcodemodule.PostalCodeModule,
            _locationmodule.LocationModule,
            _productbarcodemodule.ProductBarcodeModule,
            _stockmovemodule.StockMoveModule,
            _codetemplatemodule.CodeTemplateModule,
            _pricecardmodule.PriceCardModule,
            _pricelistmodule.PriceListModule,
            _costingmodule.CostingModule,
            _invoiceprofitmodule.InvoiceProfitModule,
            _reportingmodule.ReportingModule,
            _brandmodule.BrandModule,
            _categorymodule.CategoryModule,
            _vehiclebrandmodule.VehicleBrandModule,
            _customervehiclemodule.CustomerVehicleModule,
            _workordermodule.WorkOrderModule,
            _techniciansmodule.TechniciansModule,
            _workorderitemmodule.WorkOrderItemModule,
            _partrequestmodule.PartRequestModule,
            _serviceinvoicemodule.ServiceInvoiceModule,
            _journalentrymodule.JournalEntryModule,
            _purchaseordersmodule.PurchaseOrdersModule,
            _simpleordermodule.SimpleOrderModule,
            _quickinvoicemodule.QuickInvoiceModule,
            // Service Module - REMOVED
            _warehousetransfermodule.WarehouseTransferModule,
            _checkbillmodule.CheckBillModule,
            _posmodule.PosModule,
            _storagemodule.StorageModule,
            _adminmodule.AdminModule,
            _queuemodule.QueueModule,
            _companyvehiclesmodule.CompanyVehiclesModule,
            _vehicleexpensesmodule.VehicleExpensesModule,
            _rlsmodule.RlsModule,
            _b2bsyncmodule.B2bSyncModule,
            _b2badminmodule.B2bAdminModule,
            _b2bportalmodule.B2bPortalModule,
            _internalmodule.InternalModule
        ],
        controllers: [
            _appcontroller.AppController
        ],
        providers: [
            _appservice.AppService,
            _core.Reflector,
            {
                provide: _core.APP_GUARD,
                useClass: _throttler.ThrottlerGuard
            },
            {
                provide: _core.APP_GUARD,
                useFactory: (reflector)=>{
                    return new _jwtauthguard.JwtAuthGuard(reflector);
                },
                inject: [
                    _core.Reflector
                ]
            },
            {
                provide: _core.APP_FILTER,
                useClass: _tenantsecurityexceptionfilter.TenantSecurityExceptionFilter
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map