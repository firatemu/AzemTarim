"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BAdapterFactory", {
    enumerable: true,
    get: function() {
        return B2BAdapterFactory;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _erpproductlivemetricsservice = require("../../../common/services/erp-product-live-metrics.service");
const _prismaservice = require("../../../common/prisma.service");
const _logoerpadapter = require("./logo-erp.adapter");
const _mikroerpadapter = require("./mikro-erp.adapter");
const _otomuhasebeerpadapter = require("./otomuhasebe-erp.adapter");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2BAdapterFactory = class B2BAdapterFactory {
    create(adapterType, tenantId) {
        switch(adapterType){
            case _client.B2BErpAdapter.OTOMUHASEBE:
                return new _otomuhasebeerpadapter.OtomuhasebeErpAdapter(this.prisma, tenantId, this.liveMetrics);
            case _client.B2BErpAdapter.LOGO:
                return new _logoerpadapter.LogoErpAdapter(this.prisma, tenantId);
            case _client.B2BErpAdapter.MIKRO:
                return new _mikroerpadapter.MikroErpAdapter();
            default:
                {
                    const _exhaustive = adapterType;
                    return _exhaustive;
                }
        }
    }
    constructor(prisma, liveMetrics){
        this.prisma = prisma;
        this.liveMetrics = liveMetrics;
    }
};
B2BAdapterFactory = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _erpproductlivemetricsservice.ErpProductLiveMetricsService === "undefined" ? Object : _erpproductlivemetricsservice.ErpProductLiveMetricsService
    ])
], B2BAdapterFactory);

//# sourceMappingURL=b2b-adapter.factory.js.map