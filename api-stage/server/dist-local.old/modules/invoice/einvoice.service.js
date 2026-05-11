"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EInvoiceService", {
    enumerable: true,
    get: function() {
        return EInvoiceService;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let EInvoiceService = class EInvoiceService {
    async sendSalesInvoiceAsEInvoice(invoiceId) {
        throw new _common.BadRequestException('E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.');
    }
    async sendPurchaseInvoiceAsEInvoice(invoiceId) {
        throw new _common.BadRequestException('E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.');
    }
    async sendToHizli(invoiceId) {
        throw new _common.BadRequestException('E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.');
    }
    constructor(){
        this.logger = new _common.Logger(EInvoiceService.name);
    }
};
EInvoiceService = _ts_decorate([
    (0, _common.Injectable)()
], EInvoiceService);

//# sourceMappingURL=einvoice.service.js.map