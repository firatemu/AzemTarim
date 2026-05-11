"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminCustomersController", {
    enumerable: true,
    get: function() {
        return B2bAdminCustomersController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _b2bcustomerdto = require("./dto/b2b-customer.dto");
const _b2badmincustomerservice = require("./services/b2b-admin-customer.service");
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
let B2bAdminCustomersController = class B2bAdminCustomersController {
    async tenant() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async tenantWrite() {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found');
        return tenantId;
    }
    async list(q) {
        return this.service.list(await this.tenant(), q);
    }
    async syncAllAccountMovements() {
        return this.service.queueSyncAllAccountMovements(await this.tenantWrite());
    }
    async orders(id, page, limit) {
        return this.service.listOrders(await this.tenant(), id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 25);
    }
    async movements(id, q) {
        return this.service.listMovements(await this.tenant(), id, q);
    }
    async risk(id) {
        return this.service.getRisk(await this.tenant(), id);
    }
    async fifoPreview(id, q, res) {
        const tenantId = await this.tenant();
        let asOf;
        if (q.asOf?.trim()) {
            asOf = new Date(q.asOf);
            if (Number.isNaN(asOf.getTime())) {
                throw new _common.BadRequestException('asOf gecersiz ISO tarih');
            }
        }
        const preview = await this.service.getFifoPreview(tenantId, id, asOf);
        const format = q.format ?? 'json';
        if (format === 'json') {
            return res.json(preview);
        }
        if (format === 'xlsx') {
            const buf = await this.reports.excelBuffer('FIFO', [
                'id',
                'date',
                'type',
                'debit',
                'credit',
                'dueDate',
                'remaining',
                'pastDue'
            ], preview.movements.map((m)=>[
                    m.id,
                    m.date,
                    m.type,
                    m.debit,
                    m.credit,
                    m.dueDate ?? '',
                    m.remainingInvoiceDebit ?? '',
                    m.isPastDue ? 'yes' : 'no'
                ]));
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=b2b-fifo-${id}.xlsx`,
                'Content-Length': buf.length
            });
            return res.end(buf);
        }
        const pdfBuf = await this.reports.fifoPreviewPdfBuffer(preview);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=b2b-fifo-${id}.pdf`,
            'Content-Length': pdfBuf.length
        });
        return res.end(pdfBuf);
    }
    async resetPassword(id) {
        return this.service.resetPassword(await this.tenantWrite(), id);
    }
    async syncMovements(id) {
        return this.service.syncMovements(await this.tenantWrite(), id);
    }
    async getOne(id) {
        return this.service.getOne(await this.tenant(), id);
    }
    async create(dto) {
        return this.service.create(await this.tenantWrite(), dto);
    }
    async update(id, dto) {
        return this.service.update(await this.tenantWrite(), id, dto);
    }
    async importFromErp() {
        return this.service.importFromErp(await this.tenantWrite());
    }
    async syncExistingFromErp() {
        return this.service.syncExistingFromErp(await this.tenantWrite());
    }
    constructor(service, reports, tenantResolver){
        this.service = service;
        this.reports = reports;
        this.tenantResolver = tenantResolver;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'B2B cari listesi'
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bcustomerdto.B2bCustomerListQueryDto === "undefined" ? Object : _b2bcustomerdto.B2bCustomerListQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)('sync-account-movements-all'),
    (0, _swagger.ApiOperation)({
        summary: 'Tüm B2B cariler için ERP cari hareket senkronu (tek kuyruk işi)'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "syncAllAccountMovements", null);
_ts_decorate([
    (0, _common.Get)(':id/orders'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari sipariş geçmişi'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)('page')),
    _ts_param(2, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "orders", null);
_ts_decorate([
    (0, _common.Get)(':id/account-movements'),
    (0, _swagger.ApiOperation)({
        summary: 'Senkron B2B cari hareketleri'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bcustomerdto.B2bCustomerMovementsQueryDto === "undefined" ? Object : _b2bcustomerdto.B2bCustomerMovementsQueryDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "movements", null);
_ts_decorate([
    (0, _common.Get)(':id/risk'),
    (0, _swagger.ApiOperation)({
        summary: 'Canlı risk (ERP adapter)'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "risk", null);
_ts_decorate([
    (0, _common.Get)(':id/fifo-preview'),
    (0, _swagger.ApiOperation)({
        summary: 'FIFO vade özeti (senkron B2B hareketleri)',
        description: 'Ödemeler en eski açık faturadan başlayarak kapatılır. format=json (varsayılan), xlsx veya pdf.'
    }),
    (0, _swagger.ApiProduces)('application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Query)()),
    _ts_param(2, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bcustomerdto.B2bFifoPreviewQueryDto === "undefined" ? Object : _b2bcustomerdto.B2bFifoPreviewQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "fifoPreview", null);
_ts_decorate([
    (0, _common.Post)(':id/reset-password'),
    (0, _swagger.ApiOperation)({
        summary: 'Geçici şifre üret'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "resetPassword", null);
_ts_decorate([
    (0, _common.Post)(':id/sync-movements'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari hareket senkron kuyruğu'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "syncMovements", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari detay + özet istatistik'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "getOne", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'B2B cari oluştur (ERP cari bağla)'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2bcustomerdto.CreateB2bCustomerDto === "undefined" ? Object : _b2bcustomerdto.CreateB2bCustomerDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "create", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B cari güncelle'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _b2bcustomerdto.UpdateB2bCustomerDto === "undefined" ? Object : _b2bcustomerdto.UpdateB2bCustomerDto
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "update", null);
_ts_decorate([
    (0, _common.Post)('import-erp'),
    (0, _swagger.ApiOperation)({
        summary: "ERP'den cari hesapları B2B müşterisi olarak aktar"
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "importFromErp", null);
_ts_decorate([
    (0, _common.Post)('sync-existing-from-erp'),
    (0, _swagger.ApiOperation)({
        summary: "Mevcut B2B müşterilerini ERP'den güncelle"
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], B2bAdminCustomersController.prototype, "syncExistingFromErp", null);
B2bAdminCustomersController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Admin'),
    (0, _common.Controller)('b2b-admin/customers'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _b2blicenseguard.B2BLicenseGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2badmincustomerservice.B2bAdminCustomerService === "undefined" ? Object : _b2badmincustomerservice.B2bAdminCustomerService,
        typeof _b2badminreportservice.B2bAdminReportService === "undefined" ? Object : _b2badminreportservice.B2bAdminReportService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], B2bAdminCustomersController);

//# sourceMappingURL=b2b-admin-customers.controller.js.map