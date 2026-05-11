"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DashboardModule", {
    enumerable: true,
    get: function() {
        return DashboardModule;
    }
});
const _common = require("@nestjs/common");
const _dashboardcontroller = require("./dashboard.controller");
const _kpiservice = require("./kpi.service");
const _prismamodule = require("../../common/prisma.module");
const _ssemodule = require("../../common/sse/sse.module");
const _redismodule = require("../../common/services/redis.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DashboardModule = class DashboardModule {
};
DashboardModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _ssemodule.SseModule,
            _redismodule.RedisModule
        ],
        controllers: [
            _dashboardcontroller.DashboardController
        ],
        providers: [
            _kpiservice.KpiService
        ],
        exports: [
            _kpiservice.KpiService
        ]
    })
], DashboardModule);

//# sourceMappingURL=dashboard.module.js.map