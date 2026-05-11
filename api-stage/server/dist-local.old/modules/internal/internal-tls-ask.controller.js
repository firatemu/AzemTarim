"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InternalTlsAskController", {
    enumerable: true,
    get: function() {
        return InternalTlsAskController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _throttler = require("@nestjs/throttler");
const _prismaservice = require("../../common/prisma.service");
const _redisservice = require("../../common/services/redis.service");
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
let InternalTlsAskController = class InternalTlsAskController {
    async tlsAsk(domain) {
        const d = (domain ?? '').trim().toLowerCase();
        if (!d) {
            throw new _common.NotFoundException();
        }
        const cacheKey = `${this.CACHE_PREFIX}${d}`;
        try {
            // Check Redis cache first
            const cached = await this.redis.get(cacheKey);
            if (cached === '1') {
                return {
                    ok: true,
                    cached: true
                };
            }
            // Query database if not in cache
            const row = await this.prisma.b2BDomain.findFirst({
                where: {
                    domain: d
                },
                select: {
                    id: true
                }
            });
            if (!row) {
                // Cache negative result for 1 minute to prevent repeated queries
                await this.redis.set(cacheKey, '0', 60);
                throw new _common.NotFoundException();
            }
            // Cache positive result for 10 minutes
            await this.redis.set(cacheKey, '1', this.CACHE_TTL);
            return {
                ok: true,
                cached: false
            };
        } catch (error) {
            // If Redis fails, fall back to database query only
            if (error instanceof _common.NotFoundException) {
                throw error;
            }
            // Redis error - query database directly
            const row = await this.prisma.b2BDomain.findFirst({
                where: {
                    domain: d
                },
                select: {
                    id: true
                }
            });
            if (!row) {
                throw new _common.NotFoundException();
            }
            return {
                ok: true,
                cached: false
            };
        }
    }
    constructor(prisma, redis){
        this.prisma = prisma;
        this.redis = redis;
        this.CACHE_PREFIX = 'b2b_tls_ask:';
        this.CACHE_TTL = 600; // 10 minutes in seconds
    }
};
_ts_decorate([
    (0, _common.Get)('tls-ask'),
    (0, _throttler.Throttle)({
        default: {
            limit: 200,
            ttl: 60_000
        }
    }),
    (0, _swagger.ApiOperation)({
        summary: 'TLS on-demand: domain B2B kayitli mi?'
    }),
    _ts_param(0, (0, _common.Query)('domain')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], InternalTlsAskController.prototype, "tlsAsk", null);
InternalTlsAskController = _ts_decorate([
    (0, _swagger.ApiTags)('Internal'),
    (0, _common.Controller)('internal'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService
    ])
], InternalTlsAskController);

//# sourceMappingURL=internal-tls-ask.controller.js.map