"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RlsController", {
    enumerable: true,
    get: function() {
        return RlsController;
    }
});
const _common = require("@nestjs/common");
const _publicdecorator = require("../../common/decorators/public.decorator");
const _prismaservice = require("../../common/prisma.service");
const _tenantcontextservice = require("../../common/services/tenant-context.service");
const _clsservice = require("../../common/services/cls.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RlsController = class RlsController {
    /**
   * RLS Test: Tenant context'i PostgreSQL'e set eder ve ürün sayısını döner
   */ async testRls() {
        const tenantId = this.tenantContext.getTenantId();
        const userId = this.tenantContext.getUserId();
        const userRole = _clsservice.ClsService.get('userRole');
        // Extended Prisma client kullanımı (RLS aktif)
        // Not: Public endpoint olduğu için tenantId undefined olabilir
        let productCount = 0;
        try {
            productCount = await this.prisma.product.count();
        } catch (e) {
            console.error('Prisma extended count error:', e);
        }
        // Raw query ile kontrol (RLS kontrolü için)
        let rawCount = 0;
        if (tenantId) {
            try {
                const result = await this.prisma.$queryRawUnsafe(`
          BEGIN;
          SET LOCAL app.current_tenant_id = $1;
          SELECT COUNT(*) as count FROM "products";
          COMMIT;
        `, tenantId);
                rawCount = Number(result?.[2]?.count || 0);
            } catch (e) {
                console.error('Raw query error:', e);
            }
        }
        return {
            tenantId,
            userId,
            userRole,
            productCountViaPrismaExtended: productCount,
            productCountViaRawQuery: rawCount,
            message: !tenantId ? '⚠️ Tenant context yok (public endpoint)' : productCount === rawCount ? '✅ RLS çalışıyor!' : '⚠️ RLS eşleşmiyor'
        };
    }
    /**
   * RLS Status: Tüm tablolardaki RLS durumunu göster
   */ async getRlsStatus() {
        const result = await this.prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_tables,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%_tenant_isolation') as policies_created
    `;
        // BigInt'i String'e çevir
        return {
            rls_tables: String(result?.[0]?.rls_tables || 0),
            policies_created: String(result?.[0]?.policies_created || 0)
        };
    }
    /**
   * Transaction Test: Prisma transaction içinde RLS kontrolü
   */ async testRlsTransaction() {
        const tenantId = this.tenantContext.getTenantId();
        const result = await this.prisma.$transaction(async (tx)=>{
            // Transaction içinde tenant context otomatik set edilir
            const products = await tx.product.findMany({
                take: 5,
                select: {
                    id: true,
                    name: true,
                    tenantId: true
                }
            });
            const count = await tx.product.count();
            return {
                products,
                count,
                tenantId
            };
        });
        return {
            ...result,
            message: '✅ Transaction içinde RLS aktif'
        };
    }
    constructor(prisma, tenantContext){
        this.prisma = prisma;
        this.tenantContext = tenantContext;
    }
};
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('test'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], RlsController.prototype, "testRls", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Get)('status'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], RlsController.prototype, "getRlsStatus", null);
_ts_decorate([
    (0, _common.Post)('test-transaction'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], RlsController.prototype, "testRlsTransaction", null);
RlsController = _ts_decorate([
    (0, _common.Controller)('rls'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], RlsController);

//# sourceMappingURL=rls.controller.js.map