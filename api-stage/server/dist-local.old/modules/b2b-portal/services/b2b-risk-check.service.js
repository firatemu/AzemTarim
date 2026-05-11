"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bRiskCheckService", {
    enumerable: true,
    get: function() {
        return B2bRiskCheckService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bRiskCheckService = class B2bRiskCheckService {
    /**
   * Sipariş öncesi: cari limit / risk durumu.
   */ async assertOrderAllowed(tenantId, customerId, orderTotal) {
        const customer = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                erpAccountId: true
            }
        });
        if (!customer) {
            throw new _common.BadRequestException('Müşteri bulunamadı');
        }
        const account = await this.prisma.account.findFirst({
            where: {
                id: customer.erpAccountId,
                tenantId,
                deletedAt: null
            },
            select: {
                balance: true,
                creditLimit: true,
                creditStatus: true
            }
        });
        if (!account) {
            throw new _common.BadRequestException('ERP cari kaydı bulunamadı');
        }
        if (account.creditStatus === _client.RiskStatus.BLACK_LIST || account.creditStatus === _client.RiskStatus.IN_COLLECTION) {
            throw new _common.BadRequestException({
                message: 'Cari risk durumu nedeniyle sipariş verilemez',
                code: 'B2B_RISK_BLOCKED'
            });
        }
        const limit = account.creditLimit;
        if (limit != null) {
            const bal = new _client.Prisma.Decimal(account.balance);
            const lim = new _client.Prisma.Decimal(limit);
            const exposure = bal.add(orderTotal);
            if (exposure.gt(lim)) {
                throw new _common.BadRequestException({
                    message: 'Kredi limiti aşılıyor',
                    code: 'B2B_CREDIT_LIMIT'
                });
            }
        }
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bRiskCheckService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bRiskCheckService);

//# sourceMappingURL=b2b-risk-check.service.js.map