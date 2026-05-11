"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bPortalModule", {
    enumerable: true,
    get: function() {
        return B2bPortalModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _prismamodule = require("../../common/prisma.module");
const _b2bauthcontroller = require("./b2b-auth.controller");
const _b2bcatalogcontroller = require("./b2b-catalog.controller");
const _b2bcartcontroller = require("./b2b-cart.controller");
const _b2bordercontroller = require("./b2b-order.controller");
const _b2badvertisementscontroller = require("./b2b-advertisements.controller");
const _b2baccountcontroller = require("./b2b-account.controller");
const _b2bnotificationscontroller = require("./b2b-notifications.controller");
const _b2bsalespersoncontroller = require("./b2b-salesperson.controller");
const _b2blicenseguard = require("../../common/guards/b2b-license.guard");
const _b2bclaimsmatchguard = require("./guards/b2b-claims-match.guard");
const _b2bdomainguard = require("./guards/b2b-domain.guard");
const _b2beffectivecustomerguard = require("./guards/b2b-effective-customer.guard");
const _b2bjwtauthguard = require("./guards/b2b-jwt-auth.guard");
const _b2bjwtstrategy = require("./strategies/b2b-jwt.strategy");
const _b2bauthservice = require("./services/b2b-auth.service");
const _b2bcartorderservice = require("./services/b2b-cart-order.service");
const _b2bportalactorservice = require("./services/b2b-portal-actor.service");
const _b2bpriceservice = require("./services/b2b-price.service");
const _b2briskcheckservice = require("./services/b2b-risk-check.service");
const _b2baccountservice = require("./services/b2b-account.service");
const _b2bnotificationsservice = require("./services/b2b-notifications.service");
const _b2btenantschemabridgeservice = require("./services/b2b-tenant-schema-bridge.service");
const _b2bfifoservice = require("./services/b2b-fifo.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2bPortalModule = class B2bPortalModule {
};
B2bPortalModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _passport.PassportModule.register({}),
            _jwt.JwtModule.registerAsync({
                imports: [
                    _config.ConfigModule
                ],
                useFactory: (config)=>{
                    const base = config.get('JWT_ACCESS_SECRET') || config.get('JWT_SECRET') || 'secret';
                    const secret = config.get('B2B_JWT_SECRET') || `${base}-b2b-portal`;
                    return {
                        secret,
                        signOptions: {
                            expiresIn: '12h'
                        }
                    };
                },
                inject: [
                    _config.ConfigService
                ]
            })
        ],
        controllers: [
            _b2bauthcontroller.B2bAuthController,
            _b2bcatalogcontroller.B2bCatalogController,
            _b2bcartcontroller.B2bCartController,
            _b2bordercontroller.B2bOrderController,
            _b2badvertisementscontroller.B2bAdvertisementsController,
            _b2baccountcontroller.B2bAccountController,
            _b2bnotificationscontroller.B2bNotificationsController,
            _b2bsalespersoncontroller.B2bSalespersonController
        ],
        providers: [
            _b2bauthservice.B2bAuthService,
            _b2bpriceservice.B2bPriceService,
            _b2briskcheckservice.B2bRiskCheckService,
            _b2bcartorderservice.B2bCartOrderService,
            _b2bportalactorservice.B2bPortalActorService,
            _b2btenantschemabridgeservice.B2bTenantSchemaBridgeService,
            _b2bfifoservice.B2BFifoService,
            _b2baccountservice.B2bAccountService,
            _b2bnotificationsservice.B2bNotificationsService,
            _b2bdomainguard.B2bDomainGuard,
            _b2blicenseguard.B2BLicenseGuard,
            _b2bjwtauthguard.B2bJwtAuthGuard,
            _b2bclaimsmatchguard.B2bClaimsMatchGuard,
            _b2beffectivecustomerguard.B2bEffectiveCustomerGuard,
            _b2bjwtstrategy.B2bJwtStrategy
        ]
    })
], B2bPortalModule);

//# sourceMappingURL=b2b-portal.module.js.map