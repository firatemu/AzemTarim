"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AnalyticsController", {
    enumerable: true,
    get: function() {
        return AnalyticsController;
    }
});
const _common = require("@nestjs/common");
const _analyticsservice = require("./analytics.service");
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
let AnalyticsController = class AnalyticsController {
    getDashboardMetrics() {
        return this.analyticsService.getDashboardMetrics();
    }
    getRevenue(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.getRevenueOverTime(start, end);
    }
    getUserGrowth(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.getUserGrowth(start, end);
    }
    getChurnAnalysis() {
        return this.analyticsService.getChurnAnalysis();
    }
    getSubscriptionDistribution() {
        return this.analyticsService.getSubscriptionDistribution();
    }
    getPlanDistribution() {
        return this.analyticsService.getPlanDistribution();
    }
    getRecentPayments(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.analyticsService.getRecentPayments(limitNum);
    }
    constructor(analyticsService){
        this.analyticsService = analyticsService;
    }
};
_ts_decorate([
    (0, _common.Get)('dashboard'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDashboardMetrics", null);
_ts_decorate([
    (0, _common.Get)('revenue'),
    _ts_param(0, (0, _common.Query)('startDate')),
    _ts_param(1, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRevenue", null);
_ts_decorate([
    (0, _common.Get)('users-growth'),
    _ts_param(0, (0, _common.Query)('startDate')),
    _ts_param(1, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getUserGrowth", null);
_ts_decorate([
    (0, _common.Get)('churn'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getChurnAnalysis", null);
_ts_decorate([
    (0, _common.Get)('subscriptions/distribution'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSubscriptionDistribution", null);
_ts_decorate([
    (0, _common.Get)('plans/distribution'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPlanDistribution", null);
_ts_decorate([
    (0, _common.Get)('payments/recent'),
    _ts_param(0, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRecentPayments", null);
AnalyticsController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('analytics'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _analyticsservice.AnalyticsService === "undefined" ? Object : _analyticsservice.AnalyticsService
    ])
], AnalyticsController);

//# sourceMappingURL=analytics.controller.js.map