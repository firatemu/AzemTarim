"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bSalespersonController", {
    enumerable: true,
    get: function() {
        return B2bSalespersonController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _prismaservice = require("../../common/prisma.service");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2borderlistdto = require("./dto/b2b-order-list.dto");
const _b2bcartorderservice = require("./services/b2b-cart-order.service");
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
let B2bSalespersonController = class B2bSalespersonController {
    assertSp(user) {
        if (user.userType !== 'SALESPERSON') {
            throw new _common.ForbiddenException('Yalnizca satis temsilcisi');
        }
    }
    async myCustomers(req) {
        const user = req.user;
        this.assertSp(user);
        const sp = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: user.sub,
                tenantId: user.tenantId
            },
            select: {
                canViewAllCustomers: true
            }
        });
        if (!sp) {
            throw new _common.ForbiddenException();
        }
        if (sp.canViewAllCustomers) {
            return this.prisma.b2BCustomer.findMany({
                where: {
                    tenantId: user.tenantId,
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    customerClass: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
        }
        const links = await this.prisma.b2BSalespersonCustomer.findMany({
            where: {
                salespersonId: user.sub
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        customerClass: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        return links.map((l)=>l.customer).filter((c)=>c.isActive);
    }
    myOrders(req, q) {
        const user = req.user;
        this.assertSp(user);
        return this.cartOrder.listSalespersonOrders(user.tenantId, user.sub, {
            page: q.page,
            pageSize: q.pageSize,
            status: q.status
        });
    }
    constructor(prisma, cartOrder){
        this.prisma = prisma;
        this.cartOrder = cartOrder;
    }
};
_ts_decorate([
    (0, _common.Get)('my-customers'),
    (0, _swagger.ApiOperation)({
        summary: 'Atanan musteriler (veya tumu)'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request
    ]),
    _ts_metadata("design:returntype", Promise)
], B2bSalespersonController.prototype, "myCustomers", null);
_ts_decorate([
    (0, _common.Get)('my-orders'),
    (0, _swagger.ApiOperation)({
        summary: 'Temsilci olarak actiginiz siparisler'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Request === "undefined" ? Object : Request,
        typeof _b2borderlistdto.B2bOrderListQueryDto === "undefined" ? Object : _b2borderlistdto.B2bOrderListQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bSalespersonController.prototype, "myOrders", null);
B2bSalespersonController = _ts_decorate([
    (0, _swagger.ApiTags)('B2B Portal'),
    (0, _common.Controller)('b2b/salesperson'),
    (0, _common.UseGuards)(_b2bdomainguard.B2bDomainGuard, _b2blicenseguard.B2BLicenseGuard, _b2bjwtauthguard.B2bJwtAuthGuard, _b2bclaimsmatchguard.B2bClaimsMatchGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bcartorderservice.B2bCartOrderService === "undefined" ? Object : _b2bcartorderservice.B2bCartOrderService
    ])
], B2bSalespersonController);

//# sourceMappingURL=b2b-salesperson.controller.js.map