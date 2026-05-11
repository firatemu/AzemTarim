"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LicensesModule", {
    enumerable: true,
    get: function() {
        return LicensesModule;
    }
});
const _common = require("@nestjs/common");
const _licensescontroller = require("./licenses.controller");
const _licensesservice = require("./licenses.service");
const _prismamodule = require("../../common/prisma.module");
const _licensemodule = require("../../common/services/license.module");
const _invitationservice = require("../../common/services/invitation.service");
const _emailservice = require("../../common/services/email.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let LicensesModule = class LicensesModule {
};
LicensesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _licensemodule.LicenseModule
        ],
        controllers: [
            _licensescontroller.LicensesController
        ],
        providers: [
            _licensesservice.LicensesService,
            _invitationservice.InvitationService,
            _emailservice.EmailService
        ],
        exports: [
            _licensesservice.LicensesService
        ]
    })
], LicensesModule);

//# sourceMappingURL=licenses.module.js.map