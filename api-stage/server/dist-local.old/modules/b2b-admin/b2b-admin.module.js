"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminModule", {
    enumerable: true,
    get: function() {
        return B2bAdminModule;
    }
});
const _common = require("@nestjs/common");
const _prismamodule = require("../../common/prisma.module");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _storagemodule = require("../storage/storage.module");
const _b2bsyncmodule = require("../b2b-sync/b2b-sync.module");
const _b2badminadvertisementscontroller = require("./b2b-admin-advertisements.controller");
const _b2badmincustomerclassescontroller = require("./b2b-admin-customer-classes.controller");
const _b2badmincustomerscontroller = require("./b2b-admin-customers.controller");
const _b2badmindeliverymethodscontroller = require("./b2b-admin-delivery-methods.controller");
const _b2badmindiscountgroupscontroller = require("./b2b-admin-discount-groups.controller");
const _b2badmindiscountscontroller = require("./b2b-admin-discounts.controller");
const _b2badminorderscontroller = require("./b2b-admin-orders.controller");
const _b2badminproductscontroller = require("./b2b-admin-products.controller");
const _b2badminreportscontroller = require("./b2b-admin-reports.controller");
const _b2badminsalespersonscontroller = require("./b2b-admin-salespersons.controller");
const _b2badminsettingscontroller = require("./b2b-admin-settings.controller");
const _b2badminadvertisementservice = require("./services/b2b-admin-advertisement.service");
const _b2badmincustomerclassservice = require("./services/b2b-admin-customer-class.service");
const _b2badmincustomerservice = require("./services/b2b-admin-customer.service");
const _b2badmindeliveryservice = require("./services/b2b-admin-delivery.service");
const _b2badmindiscountservice = require("./services/b2b-admin-discount.service");
const _b2badmindiscountgroupservice = require("./services/b2b-admin-discount-group.service");
const _b2badminorderservice = require("./services/b2b-admin-order.service");
const _b2badminproductservice = require("./services/b2b-admin-product.service");
const _b2badminreportservice = require("./services/b2b-admin-report.service");
const _b2badminsalespersonservice = require("./services/b2b-admin-salesperson.service");
const _b2bfifoservice = require("../b2b-portal/services/b2b-fifo.service");
const _b2bschemaprovisioningservice = require("./services/b2b-schema-provisioning.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2bAdminModule = class B2bAdminModule {
};
B2bAdminModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _storagemodule.StorageModule,
            _b2bsyncmodule.B2bSyncModule
        ],
        controllers: [
            _b2badminsettingscontroller.B2bAdminSettingsController,
            _b2badmincustomerscontroller.B2bAdminCustomersController,
            _b2badmincustomerclassescontroller.B2bAdminCustomerClassesController,
            _b2badmindiscountgroupscontroller.B2bAdminDiscountGroupsController,
            _b2badminsalespersonscontroller.B2bAdminSalespersonsController,
            _b2badminproductscontroller.B2bAdminProductsController,
            _b2badmindiscountscontroller.B2bAdminDiscountsController,
            _b2badminorderscontroller.B2bAdminOrdersController,
            _b2badmindeliverymethodscontroller.B2bAdminDeliveryMethodsController,
            _b2badminadvertisementscontroller.B2bAdminAdvertisementsController,
            _b2badminreportscontroller.B2bAdminReportsController
        ],
        providers: [
            _b2blicenseguard.B2BLicenseGuard,
            _b2bfifoservice.B2BFifoService,
            _b2bschemaprovisioningservice.B2BSchemaProvisioningService,
            _b2badmincustomerservice.B2bAdminCustomerService,
            _b2badmincustomerclassservice.B2bAdminCustomerClassService,
            _b2badmindiscountgroupservice.B2bAdminDiscountGroupService,
            _b2badminsalespersonservice.B2bAdminSalespersonService,
            _b2badminproductservice.B2bAdminProductService,
            _b2badmindiscountservice.B2bAdminDiscountService,
            _b2badminorderservice.B2bAdminOrderService,
            _b2badmindeliveryservice.B2bAdminDeliveryService,
            _b2badminadvertisementservice.B2bAdminAdvertisementService,
            _b2badminreportservice.B2bAdminReportService
        ],
        exports: [
            _b2blicenseguard.B2BLicenseGuard,
            _b2bschemaprovisioningservice.B2BSchemaProvisioningService
        ]
    })
], B2bAdminModule);

//# sourceMappingURL=b2b-admin.module.js.map