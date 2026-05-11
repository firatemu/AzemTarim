"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InventoryCountModule", {
    enumerable: true,
    get: function() {
        return InventoryCountModule;
    }
});
const _common = require("@nestjs/common");
const _inventorycountcontroller = require("./inventory-count.controller");
const _inventorycountservice = require("./inventory-count.service");
const _inventorycountexportservice = require("./inventory-count-export.service");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let InventoryCountModule = class InventoryCountModule {
};
InventoryCountModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _inventorycountcontroller.InventoryCountController
        ],
        providers: [
            _inventorycountservice.InventoryCountService,
            _inventorycountexportservice.InventoryCountExportService
        ],
        exports: [
            _inventorycountservice.InventoryCountService
        ]
    })
], InventoryCountModule);

//# sourceMappingURL=inventory-count.module.js.map