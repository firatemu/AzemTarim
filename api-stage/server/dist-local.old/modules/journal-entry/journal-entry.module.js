"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JournalEntryModule", {
    enumerable: true,
    get: function() {
        return JournalEntryModule;
    }
});
const _common = require("@nestjs/common");
const _journalentryservice = require("./journal-entry.service");
const _journalentrycontroller = require("./journal-entry.controller");
const _prismamodule = require("../../common/prisma.module");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let JournalEntryModule = class JournalEntryModule {
};
JournalEntryModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _tenantcontextmodule.TenantContextModule
        ],
        controllers: [
            _journalentrycontroller.JournalEntryController
        ],
        providers: [
            _journalentryservice.JournalEntryService
        ],
        exports: [
            _journalentryservice.JournalEntryService
        ]
    })
], JournalEntryModule);

//# sourceMappingURL=journal-entry.module.js.map