"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAccountController", {
    enumerable: true,
    get: function() {
        return B2bAccountController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2beffectivecustomerguard = require("./guards/b2b-effective-customer.guard");
const _b2baccountdto = require("./dto/b2b-account.dto");
const _b2baccountservice = require("./services/b2b-account.service");
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
let B2bAccountController = class B2bAccountController {
    summary(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.account.getSummary(user.tenantId, cid);
    }
    movements(req, q) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.account.listMovements(user.tenantId, cid, q);
    }
    async exportMovements(req, q, res) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        const buf = await this.account.exportMovementsXlsx(user.tenantId, cid, q);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=b2b-account-movements.xlsx',
            'Content-Length': buf.length
        });
        return res.end(buf);
    }
    risk(req) {
        const user = req.user;
        const cid = req.effectiveB2bCustomerId;
        return this.account.getRiskSnapshot(user.tenantId, cid);
    }
    constructor(account){
        this.account = account;
    }
};
_ts_decorate([
    (0, _common.Get)('summary'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari ozet ve acik siparis sayisi'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bAccountController.prototype, "summary", null);
_ts_decorate([
    (0, _common.Get)('movements'),
    (0, _swagger.ApiOperation)({
        summary: 'B2B senkron cari hareketler'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2baccountdto.B2bAccountMovementsQueryDto === "undefined" ? Object : _b2baccountdto.B2bAccountMovementsQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bAccountController.prototype, "movements", null);
_ts_decorate([
    (0, _common.Get)('movements/export'),
    (0, _swagger.ApiOperation)({
        summary: 'Cari hareketler Excel (FIFO sütunları)',
        description: 'Tarih filtresi opsiyonel. En fazla maxRows satır (varsayılan 5000, üst sınır 10000).'
    }),
    (0, _swagger.ApiProduces)('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_param(2, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2baccountdto.B2bAccountMovementsExportQueryDto === "undefined" ? Object : _b2baccountdto.B2bAccountMovementsExportQueryDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bAccountController.prototype, "exportMovements", null);
_ts_decorate([
    (0, _common.Get)('risk'),
    (0, _swagger.ApiOperation)({
        summary: 'Risk / limit ozeti (dashboard)'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bAccountController.prototype, "risk", null);
B2bAccountController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/account'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard, _b2beffectivecustomerguard.B2bEffectiveCustomerGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _b2baccountservice.B2bAccountService === "undefined" ? Object : _b2baccountservice.B2bAccountService
    ])
], B2bAccountController);

//# sourceMappingURL=b2b-account.controller.js.map