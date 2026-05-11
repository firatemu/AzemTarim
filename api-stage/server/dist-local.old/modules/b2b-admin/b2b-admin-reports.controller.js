"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminReportsController", {
    enumerable: true,
    get: function() {
        return B2bAdminReportsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2breportquerydto = require("./dto/b2b-report-query.dto");
const _b2badminreportservice = require("./services/b2b-admin-report.service");
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
let B2bAdminReportsController = class B2bAdminReportsController {
    async tenant() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async ordersSummary(q, res) {
        const tenantId = await this.tenant();
        const { format, ...range } = q;
        const summary = await this.service.ordersSummary(tenantId, range);
        if (format === 'xlsx') {
            const buf = await this.service.excelBuffer('Orders Summary', [
                'metric',
                'value'
            ], [
                [
                    'totalOrders',
                    summary.totalOrders
                ],
                [
                    'revenue',
                    summary.revenue
                ],
                [
                    'avgOrderValue',
                    summary.avgOrderValue
                ]
            ]);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=b2b-orders-summary.xlsx',
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        return res.json(summary);
    }
    async byCustomer(q, res) {
        const tenantId = await this.tenant();
        const { format, ...rest } = q;
        const result = await this.service.byCustomer(tenantId, rest, rest);
        if (format === 'xlsx') {
            const buf = await this.service.excelBuffer('By Customer', [
                'customerId',
                'customerName',
                'orderCount',
                'revenue'
            ], result.data.map((r)=>[
                    r.customerId,
                    r.customerName,
                    r.orderCount,
                    r.revenue
                ]));
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=b2b-by-customer.xlsx',
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        return res.json(result);
    }
    async byProduct(q, res) {
        const tenantId = await this.tenant();
        const { format, ...rest } = q;
        const result = await this.service.byProduct(tenantId, rest, rest);
        if (format === 'xlsx') {
            const buf = await this.service.excelBuffer('By Product', [
                'productId',
                'stockCode',
                'productName',
                'qty',
                'revenue'
            ], result.data.map((r)=>[
                    r.productId,
                    r.stockCode,
                    r.productName,
                    r.qty,
                    r.revenue
                ]));
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=b2b-by-product.xlsx',
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        return res.json(result);
    }
    async bySalesperson(q, res) {
        const tenantId = await this.tenant();
        const { format, ...rest } = q;
        const result = await this.service.bySalesperson(tenantId, rest, rest);
        if (format === 'xlsx') {
            const buf = await this.service.excelBuffer('By Salesperson', [
                'salespersonId',
                'name',
                'orderCount',
                'revenue',
                'assignedCustomerCount'
            ], result.data.map((r)=>[
                    r.salespersonId,
                    r.name,
                    r.orderCount,
                    r.revenue,
                    r.assignedCustomerCount
                ]));
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=b2b-by-salesperson.xlsx',
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        return res.json(result);
    }
    async collections(q, res) {
        const tenantId = await this.tenant();
        const { format, ...rest } = q;
        const result = await this.service.collections(tenantId, rest, rest);
        if (format === 'xlsx') {
            const buf = await this.service.excelBuffer('Collections', [
                'customerId',
                'name',
                'totalDebit',
                'totalCredit',
                'latestBalance'
            ], result.data.map((r)=>[
                    r.customerId,
                    r.name,
                    r.totalDebit,
                    r.totalCredit,
                    r.latestBalance
                ]));
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=b2b-collections.xlsx',
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        return res.json(result);
    }
    constructor(service, tenantResolver){
        this.service = service;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)('orders-summary'),
    (0, _swagger.ApiOperation)({
        summary: 'Sipariş özeti (tarih aralığı)'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2breportquerydto.B2bReportQueryDto === "undefined" ? Object : _b2breportquerydto.B2bReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminReportsController.prototype, "ordersSummary", null);
_ts_decorate([
    (0, _common.Get)('by-customer'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari bazlı sipariş / ciro'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2breportquerydto.B2bReportQueryDto === "undefined" ? Object : _b2breportquerydto.B2bReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminReportsController.prototype, "byCustomer", null);
_ts_decorate([
    (0, _common.Get)('by-product'),
    (0, _swagger.ApiOperation)({
        summary: 'Ürün bazlı satış'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2breportquerydto.B2bReportQueryDto === "undefined" ? Object : _b2breportquerydto.B2bReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminReportsController.prototype, "byProduct", null);
_ts_decorate([
    (0, _common.Get)('by-salesperson'),
    (0, _swagger.ApiOperation)({
        summary: 'Plasiyer bazlı'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2breportquerydto.B2bReportQueryDto === "undefined" ? Object : _b2breportquerydto.B2bReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminReportsController.prototype, "bySalesperson", null);
_ts_decorate([
    (0, _common.Get)('collections'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari hareket özeti (senkron veri)'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2breportquerydto.B2bReportQueryDto === "undefined" ? Object : _b2breportquerydto.B2bReportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminReportsController.prototype, "collections", null);
B2bAdminReportsController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/reports'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badminreportservice.B2bAdminReportService === "undefined" ? Object : _b2badminreportservice.B2bAdminReportService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminReportsController);

//# sourceMappingURL=b2b-admin-reports.controller.js.map