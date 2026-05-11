"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAuthService", {
    enumerable: true,
    get: function() {
        return B2bAuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _prismaservice = require("../../../common/prisma.service");
const _b2blicensecacheservice = require("../../../common/services/b2b-license-cache.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bAuthService = class B2bAuthService {
    async issueToken(payload) {
        const accessToken = await this.jwt.signAsync(payload);
        return {
            accessToken,
            expiresIn: 12 * 3600,
            tokenType: 'Bearer'
        };
    }
    async login(domain, email, password) {
        const d = domain.trim().toLowerCase();
        const b2bDomain = await this.prisma.b2BDomain.findFirst({
            where: {
                domain: d
            },
            select: {
                id: true,
                tenantId: true
            }
        });
        if (!b2bDomain) {
            throw new _common.UnauthorizedException('Domain veya giriş bilgileri hatalı');
        }
        await this.licenseCache.assertActiveOrThrow(b2bDomain.tenantId);
        const tenantId = b2bDomain.tenantId;
        const emailNorm = email.trim().toLowerCase();
        const customer = await this.prisma.b2BCustomer.findFirst({
            where: {
                tenantId,
                email: emailNorm
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                isActive: true
            }
        });
        if (customer?.isActive && customer.passwordHash) {
            const ok = await _bcrypt.compare(password, customer.passwordHash);
            if (ok) {
                const payload = {
                    sub: customer.id,
                    tenantId: b2bDomain.tenantId,
                    b2bDomainId: b2bDomain.id,
                    userType: 'CUSTOMER',
                    email: customer.email ?? undefined
                };
                const tok = await this.issueToken(payload);
                await this.prisma.b2BCustomer.update({
                    where: {
                        id: customer.id
                    },
                    data: {
                        lastLoginAt: new Date()
                    }
                });
                return {
                    ...tok,
                    userType: 'CUSTOMER',
                    customerId: customer.id
                };
            }
        }
        const salesperson = await this.prisma.b2BSalesperson.findFirst({
            where: {
                tenantId,
                email: emailNorm,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                name: true
            }
        });
        if (!salesperson?.passwordHash) {
            throw new _common.UnauthorizedException('Domain veya giriş bilgileri hatalı');
        }
        const okSp = await _bcrypt.compare(password, salesperson.passwordHash);
        if (!okSp) {
            throw new _common.UnauthorizedException('Domain veya giriş bilgileri hatalı');
        }
        const payloadSp = {
            sub: salesperson.id,
            tenantId: b2bDomain.tenantId,
            b2bDomainId: b2bDomain.id,
            userType: 'SALESPERSON',
            email: salesperson.email ?? undefined
        };
        const tokSp = await this.issueToken(payloadSp);
        return {
            ...tokSp,
            userType: 'SALESPERSON',
            salespersonId: salesperson.id,
            salespersonName: salesperson.name
        };
    }
    async getProfile(tenantId, customerId) {
        const row = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                vatDays: true,
                customerClass: {
                    select: {
                        id: true,
                        name: true,
                        discountRate: true
                    }
                }
            }
        });
        if (!row) {
            throw new _common.UnauthorizedException('Müşteri bulunamadı');
        }
        return row;
    }
    async getSalespersonProfile(tenantId, salespersonId) {
        const row = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: salespersonId,
                tenantId,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                canViewAllCustomers: true,
                canViewAllReports: true
            }
        });
        if (!row) {
            throw new _common.UnauthorizedException('Temsilci bulunamadı');
        }
        return row;
    }
    async getMe(user) {
        if (user.userType === 'CUSTOMER') {
            const profile = await this.getProfile(user.tenantId, user.sub);
            return {
                userType: 'CUSTOMER',
                profile
            };
        }
        const profile = await this.getSalespersonProfile(user.tenantId, user.sub);
        return {
            userType: 'SALESPERSON',
            profile
        };
    }
    constructor(prisma, jwt, licenseCache){
        this.prisma = prisma;
        this.jwt = jwt;
        this.licenseCache = licenseCache;
    }
};
B2bAuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _b2blicensecacheservice.B2bLicenseCacheService === "undefined" ? Object : _b2blicensecacheservice.B2bLicenseCacheService
    ])
], B2bAuthService);

//# sourceMappingURL=b2b-auth.service.js.map