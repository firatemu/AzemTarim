"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QuickInvoiceController", {
    enumerable: true,
    get: function() {
        return QuickInvoiceController;
    }
});
const _common = require("@nestjs/common");
const _publicdecorator = require("../../common/decorators/public.decorator");
const _quickinvoiceservice = require("./quick-invoice.service");
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
let QuickInvoiceController = class QuickInvoiceController {
    async getTokenStatus() {
        return this.quickInvoiceService.getTokenStatus();
    }
    async getIncoming(appType, dateType, startDate, endDate, isNew, isExport, isDraft, takenFromEntegrator) {
        // DateType varsayılan olarak "CreatedDate" (C# örneğinde kullanılıyor)
        // AppType varsayılan olarak 1 (Gelen e-Invoice)
        return this.quickInvoiceService.getIncoming(appType ? Number(appType) : 1, dateType || 'CreatedDate', startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, isNew === true, isExport === true, isDraft !== undefined ? isDraft === true : null, takenFromEntegrator || 'ALL', null);
    }
    async utilEncrypt(body) {
        return this.quickInvoiceService.utilEncrypt(body.username, body.password, body.secretKey);
    }
    async login(body) {
        return this.quickInvoiceService.login(body.usernameHash, body.passwordHash, body.apiKey);
    }
    async getUrnConfig() {
        return this.quickInvoiceService.getUrnConfig();
    }
    async autoLogin() {
        return this.quickInvoiceService.autoLogin();
    }
    async checkAndRefreshToken() {
        return this.quickInvoiceService.checkAndRefreshToken();
    }
    async getDocumentContent(uuid, type) {
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location: 'quick-invoice.controller.ts:74',
                message: 'getDocumentContent called',
                data: {
                    uuid,
                    type
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A'
            })
        }).catch(()=>{});
        // #endregion
        if (!uuid) {
            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: 'quick-invoice.controller.ts:77',
                    message: 'UUID missing error',
                    data: {
                        uuid
                    },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'run1',
                    hypothesisId: 'A'
                })
            }).catch(()=>{});
            // #endregion
            throw new Error('UUID parametresi gerekli');
        }
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location: 'quick-invoice.controller.ts:81',
                message: 'Calling service.getDocumentContent',
                data: {
                    uuid,
                    type: type || 'XML'
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A'
            })
        }).catch(()=>{});
        // #endregion
        const result = await this.quickInvoiceService.getDocumentContent(uuid, type || 'XML');
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location: 'quick-invoice.controller.ts:85',
                message: 'getDocumentContent result',
                data: {
                    hasContent: !!result?.content,
                    contentLength: result?.content?.length
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A'
            })
        }).catch(()=>{});
        // #endregion
        return result;
    }
    constructor(quickInvoiceService){
        this.quickInvoiceService = quickInvoiceService;
    }
};
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('token-status'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "getTokenStatus", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('incoming'),
    _ts_param(0, (0, _common.Query)('appType')),
    _ts_param(1, (0, _common.Query)('dateType')),
    _ts_param(2, (0, _common.Query)('startDate')),
    _ts_param(3, (0, _common.Query)('endDate')),
    _ts_param(4, (0, _common.Query)('isNew')),
    _ts_param(5, (0, _common.Query)('isExport')),
    _ts_param(6, (0, _common.Query)('isDraft')),
    _ts_param(7, (0, _common.Query)('takenFromEntegrator')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        String,
        String,
        String,
        Boolean,
        Boolean,
        Boolean,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "getIncoming", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('util-encrypt'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "utilEncrypt", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('login'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "login", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('urn-config'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "getUrnConfig", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('auto-login'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "autoLogin", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('check-and-refresh-token'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "checkAndRefreshToken", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('document-content'),
    _ts_param(0, (0, _common.Query)('uuid')),
    _ts_param(1, (0, _common.Query)('type')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], QuickInvoiceController.prototype, "getDocumentContent", null);
QuickInvoiceController = _ts_decorate([
    (0, _common.Controller)('quick-invoices'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _quickinvoiceservice.QuickInvoiceService === "undefined" ? Object : _quickinvoiceservice.QuickInvoiceService
    ])
], QuickInvoiceController);

//# sourceMappingURL=quick-invoice.controller.js.map