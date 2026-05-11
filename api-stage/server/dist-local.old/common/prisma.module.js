"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get EXTENDED_PRISMA () {
        return EXTENDED_PRISMA;
    },
    get PrismaModule () {
        return PrismaModule;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("./prisma.service");
const _erpproductlivemetricsservice = require("./services/erp-product-live-metrics.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const EXTENDED_PRISMA = 'EXTENDED_PRISMA';
let PrismaModule = class PrismaModule {
};
PrismaModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        providers: [
            _prismaservice.PrismaService,
            _erpproductlivemetricsservice.ErpProductLiveMetricsService,
            {
                provide: EXTENDED_PRISMA,
                useFactory: (prisma)=>prisma.extended,
                inject: [
                    _prismaservice.PrismaService
                ]
            }
        ],
        exports: [
            _prismaservice.PrismaService,
            _erpproductlivemetricsservice.ErpProductLiveMetricsService,
            EXTENDED_PRISMA
        ]
    })
], PrismaModule);

//# sourceMappingURL=prisma.module.js.map