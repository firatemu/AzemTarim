"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bSyncModule", {
    enumerable: true,
    get: function() {
        return B2bSyncModule;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _prismamodule = require("../../common/prisma.module");
const _b2badapterfactory = require("./adapters/b2b-adapter.factory");
const _b2bsynccontroller = require("./b2b-sync.controller");
const _b2bsyncprocessor = require("./b2b-sync.processor");
const _b2bsyncservice = require("./b2b-sync.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2bSyncModule = class B2bSyncModule {
};
B2bSyncModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _bullmq.BullModule.registerQueue({
                name: _b2bsyncservice.B2B_SYNC_QUEUE
            })
        ],
        controllers: [
            _b2bsynccontroller.B2bSyncController
        ],
        providers: [
            _b2bsyncservice.B2bSyncService,
            _b2bsyncprocessor.B2bSyncProcessor,
            _b2badapterfactory.B2BAdapterFactory
        ],
        exports: [
            _b2bsyncservice.B2bSyncService,
            _b2badapterfactory.B2BAdapterFactory
        ]
    })
], B2bSyncModule);

//# sourceMappingURL=b2b-sync.module.js.map