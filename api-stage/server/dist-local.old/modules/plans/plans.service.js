"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlansService", {
    enumerable: true,
    get: function() {
        return PlansService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PlansService = class PlansService {
    async getAvailablePlans() {
        // Return hardcoded plans for now
        // In production, this could be stored in database
        return [
            {
                id: 'FREE',
                name: 'FREE',
                price: 0,
                maxCompanies: 1,
                maxInvoices: 100,
                features: [
                    '1 Şirket',
                    '100 Invoice/ay',
                    'Temel raporlar',
                    'Email destek'
                ]
            },
            {
                id: 'BASIC',
                name: 'BASIC',
                price: 299,
                maxCompanies: 1,
                maxInvoices: 100,
                features: [
                    '1 Şirket',
                    '100 Invoice/ay',
                    'Temel raporlar',
                    'Email destek'
                ]
            },
            {
                id: 'PROFESSIONAL',
                name: 'PROFESSIONAL',
                price: 599,
                maxCompanies: 3,
                maxInvoices: -1,
                features: [
                    '3 Şirket',
                    'Sınırsız fatura',
                    'Gelişmiş raporlar',
                    'E-arşiv entegrasyonu',
                    'Öncelikli destek'
                ]
            },
            {
                id: 'ENTERPRISE',
                name: 'ENTERPRISE',
                price: -1,
                maxCompanies: -1,
                maxInvoices: -1,
                features: [
                    'Sınırsız şirket',
                    'API erişimi',
                    'Özel entegrasyonlar',
                    'Dedicated hesap yöneticisi',
                    'SLA garantisi'
                ]
            }
        ];
    }
    async getPlanLimits(planSlug) {
        // Database'den plan bilgisini al
        const plan = await this.prisma.plan.findUnique({
            where: {
                slug: planSlug
            }
        });
        if (!plan) {
            throw new _common.NotFoundException(`Plan ${planSlug} not found`);
        }
        const limits = plan.limits;
        return {
            maxCompanies: limits?.maxCompanies || 1,
            maxInvoices: limits?.maxInvoices || 100
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
PlansService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], PlansService);

//# sourceMappingURL=plans.service.js.map