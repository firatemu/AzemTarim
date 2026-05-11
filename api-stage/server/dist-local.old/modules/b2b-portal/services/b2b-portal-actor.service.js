"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bPortalActorService", {
    enumerable: true,
    get: function() {
        return B2bPortalActorService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _constants = require("../constants");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bPortalActorService = class B2bPortalActorService {
    async assertSalespersonCanAccess(salespersonId, customerId, tenantId) {
        const sp = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: salespersonId,
                tenantId,
                isActive: true
            },
            select: {
                id: true,
                canViewAllCustomers: true
            }
        });
        if (!sp) {
            throw new _common.ForbiddenException('Gecersiz temsilci');
        }
        if (sp.canViewAllCustomers) {
            const c = await this.prisma.b2BCustomer.findFirst({
                where: {
                    id: customerId,
                    tenantId,
                    isActive: true
                },
                select: {
                    id: true
                }
            });
            if (!c) {
                throw new _common.BadRequestException('Musteri bulunamadi');
            }
            return;
        }
        const link = await this.prisma.b2BSalespersonCustomer.findUnique({
            where: {
                salespersonId_customerId: {
                    salespersonId,
                    customerId
                }
            }
        });
        if (!link) {
            throw new _common.ForbiddenException('Bu musteri icin yetkiniz yok');
        }
    }
    /**
   * JWT + (istege bagli) acting header ile efektif B2B musteri id.
   */ async resolveEffectiveCustomerId(req, user) {
        if (user.userType === 'CUSTOMER') {
            return user.sub;
        }
        const raw = req.headers[_constants.B2B_ACTING_CUSTOMER_HEADER] ?? req.headers['x-b2b-acting-customer-id'];
        const acting = typeof raw === 'string' ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : '';
        if (!acting) {
            throw new _common.BadRequestException({
                message: 'Temsilci oturumu icin x-b2b-acting-customer-id gerekli',
                code: 'B2B_ACTING_CUSTOMER_REQUIRED'
            });
        }
        await this.assertSalespersonCanAccess(user.sub, acting, user.tenantId);
        return acting;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bPortalActorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bPortalActorService);

//# sourceMappingURL=b2b-portal-actor.service.js.map