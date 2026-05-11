"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bDomainGuard", {
    enumerable: true,
    get: function() {
        return B2bDomainGuard;
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
let B2bDomainGuard = class B2bDomainGuard {
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const raw = req.headers[_constants.B2B_DOMAIN_HEADER] ?? req.headers['x-b2b-domain'];
        const domain = typeof raw === 'string' ? raw.trim().toLowerCase() : Array.isArray(raw) ? raw[0]?.trim().toLowerCase() : '';
        if (!domain) {
            throw new _common.BadRequestException({
                message: 'B2B domain gerekli',
                code: 'B2B_DOMAIN_REQUIRED'
            });
        }
        const row = await this.prisma.b2BDomain.findFirst({
            where: {
                domain
            },
            select: {
                id: true,
                tenantId: true,
                domain: true
            }
        });
        if (!row) {
            throw new _common.NotFoundException('Not Found');
        }
        req.b2bTenantId = row.tenantId;
        req.b2bDomainId = row.id;
        req.b2bDomainHost = row.domain;
        return true;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bDomainGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bDomainGuard);

//# sourceMappingURL=b2b-domain.guard.js.map