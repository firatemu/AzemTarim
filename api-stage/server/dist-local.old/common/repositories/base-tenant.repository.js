"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseTenantRepository", {
    enumerable: true,
    get: function() {
        return BaseTenantRepository;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma.service");
const _tenantcontextservice = require("../services/tenant-context.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BaseTenantRepository = class BaseTenantRepository {
    /**
   * Prisma extended client'yi döndürür (RLS aktif)
   */ getExtendedPrisma() {
        return this.prisma.extended;
    }
    /**
   * Tenant filtresi ile findMany
   * 
   * NOT: Manuel tenant filtering devre dışı bırakıldı.
   * RLS otomatik olarak tenant'a göre filtreler (prisma.extended aracılığıyla).
   */ async findMany(args) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].findMany(args);
    }
    /**
   * Tenant filtresi ile findUnique
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */ async findUnique(where, args) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].findFirst({
            ...args,
            where
        });
    }
    /**
   * Tenant filtresi ile create
   * 
   * NOT: RLS otomatik olarak tenantId'yi inject eder.
   */ async create(data) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].create({
            data
        });
    }
    /**
   * Tenant filtresi ile update
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */ async update(where, data) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].update({
            where,
            data
        });
    }
    /**
   * Tenant filtresi ile delete
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */ async delete(where) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].delete({
            where
        });
    }
    /**
   * Tenant filtresi ile count
   */ async count(args) {
        const model = this.getModel();
        return this.getExtendedPrisma()[model].count(args);
    }
    /**
   * Transaction ile bulk operation
   */ async transaction(callback) {
        return this.getExtendedPrisma().$transaction(callback);
    }
    constructor(prisma, tenantContext){
        this.prisma = prisma;
        this.tenantContext = tenantContext;
        this.logger = new _common.Logger(BaseTenantRepository.name);
    }
};
BaseTenantRepository = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], BaseTenantRepository);

//# sourceMappingURL=base-tenant.repository.js.map