"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DashboardController", {
    enumerable: true,
    get: function() {
        return DashboardController;
    }
});
const _common = require("@nestjs/common");
const _kpiservice = require("./kpi.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let DashboardController = class DashboardController {
    async getKpis(tenantId) {
        // TenantMiddleware normalde x-tenant-id ile çalışır ancak burada doğrudan Param üzerinden O(1) okuma (veya hesaplama) sağlıyoruz.
        return this.kpiService.getKpis(tenantId);
    }
    async getCashTrend(tenantId) {
        return this.kpiService.getCashTrend(tenantId);
    }
    constructor(kpiService){
        this.kpiService = kpiService;
    }
};
_ts_decorate([
    (0, _common.Get)('kpis/:tenantId'),
    _ts_param(0, (0, _common.Param)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], DashboardController.prototype, "getKpis", null);
_ts_decorate([
    (0, _common.Get)('cash-trend/:tenantId'),
    _ts_param(0, (0, _common.Param)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], DashboardController.prototype, "getCashTrend", null);
DashboardController = _ts_decorate([
    (0, _common.Controller)('dashboard'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _kpiservice.KpiService === "undefined" ? Object : _kpiservice.KpiService
    ])
], DashboardController);

//# sourceMappingURL=dashboard.controller.js.map