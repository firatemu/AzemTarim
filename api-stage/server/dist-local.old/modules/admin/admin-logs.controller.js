"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminLogsController", {
    enumerable: true,
    get: function() {
        return AdminLogsController;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
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
let AdminLogsController = class AdminLogsController {
    async getLogs(page = '1', limit = '50', action, userId, resource, startDate, endDate) {
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (action) where.action = {
            contains: action,
            mode: 'insensitive'
        };
        if (userId) where.userId = {
            contains: userId,
            mode: 'insensitive'
        };
        if (resource) where.resource = {
            contains: resource,
            mode: 'insensitive'
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limitNum,
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            this.prisma.auditLog.count({
                where
            })
        ]);
        return {
            data: logs,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        };
    }
    async getStats() {
        const [total, last24h, byAction] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            this.prisma.auditLog.groupBy({
                by: [
                    'action'
                ],
                _count: {
                    action: true
                },
                orderBy: {
                    _count: {
                        action: 'desc'
                    }
                },
                take: 10
            })
        ]);
        return {
            total,
            last24h,
            byAction
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('action')),
    _ts_param(3, (0, _common.Query)('userId')),
    _ts_param(4, (0, _common.Query)('resource')),
    _ts_param(5, (0, _common.Query)('startDate')),
    _ts_param(6, (0, _common.Query)('endDate')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0,
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminLogsController.prototype, "getLogs", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AdminLogsController.prototype, "getStats", null);
AdminLogsController = _ts_decorate([
    (0, _common.Controller)('admin/logs'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], AdminLogsController);

//# sourceMappingURL=admin-logs.controller.js.map