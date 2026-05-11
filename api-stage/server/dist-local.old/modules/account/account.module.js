"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountModule", {
    enumerable: true,
    get: function() {
        return AccountModule;
    }
});
const _common = require("@nestjs/common");
const _accountservice = require("./account.service");
const _accountcontroller = require("./account.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _codetemplatemodule = require("../code-template/code-template.module");
const _accountmovementmodule = require("../account-movement/account-movement.module");
const _deletionprotectionmodule = require("../../common/services/deletion-protection.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AccountModule = class AccountModule {
};
AccountModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule,
            _deletionprotectionmodule.DeletionProtectionModule,
            (0, _common.forwardRef)(()=>_codetemplatemodule.CodeTemplateModule),
            _accountmovementmodule.AccountMovementModule
        ],
        controllers: [
            _accountcontroller.AccountController
        ],
        providers: [
            _accountservice.AccountService
        ],
        exports: [
            _accountservice.AccountService
        ]
    })
], AccountModule);

//# sourceMappingURL=account.module.js.map