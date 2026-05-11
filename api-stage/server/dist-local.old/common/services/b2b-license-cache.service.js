"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bLicenseCacheService", {
    enumerable: true,
    get: function() {
        return B2bLicenseCacheService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma.service");
const _redisservice = require("./redis.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const CACHE_TTL_SEC = 300;
let B2bLicenseCacheService = class B2bLicenseCacheService {
    key(tenantId) {
        return `b2b:license:active:${tenantId}`;
    }
    async invalidate(tenantId) {
        await this.redis.del(this.key(tenantId));
        this.log.debug(`B2B license cache invalidated tenant=${tenantId}`);
    }
    /**
   * Aktif B2B lisansı yoksa ForbiddenException fırlatır.
   */ async assertActiveOrThrow(tenantId) {
        const k = this.key(tenantId);
        const cached = await this.redis.get(k);
        if (cached === '1') {
            return;
        }
        if (cached === '0') {
            throw new _common.ForbiddenException('B2B module license is inactive or expired');
        }
        const license = await this.prisma.b2BLicense.findUnique({
            where: {
                tenantId
            }
        });
        const ok = !!license?.isActive && (license.expiresAt == null || license.expiresAt >= new Date());
        await this.redis.set(k, ok ? '1' : '0', CACHE_TTL_SEC);
        if (!ok) {
            throw new _common.ForbiddenException('B2B module license is inactive or expired');
        }
    }
    constructor(prisma, redis){
        this.prisma = prisma;
        this.redis = redis;
        this.log = new _common.Logger(B2bLicenseCacheService.name);
    }
};
B2bLicenseCacheService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService
    ])
], B2bLicenseCacheService);

//# sourceMappingURL=b2b-license-cache.service.js.map