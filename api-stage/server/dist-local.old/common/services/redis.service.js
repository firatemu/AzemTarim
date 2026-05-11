"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RedisService", {
    enumerable: true,
    get: function() {
        return RedisService;
    }
});
const _common = require("@nestjs/common");
const _redis = require("redis");
const _tenantresolverservice = require("./tenant-resolver.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RedisService = class RedisService {
    async onModuleInit() {
        try {
            this.client = (0, _redis.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries)=>{
                        if (retries > 10) {
                            console.error('❌ [Redis] Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });
            this.client.on('error', (err)=>{
                console.error('❌ [Redis] Error:', err);
                this.isConnected = false;
            });
            this.client.on('connect', ()=>{
                console.log('🔄 [Redis] Connecting...');
            });
            this.client.on('ready', ()=>{
                console.log('✅ [Redis] Connected and ready');
                this.isConnected = true;
            });
            this.client.on('reconnecting', ()=>{
                console.log('🔄 [Redis] Reconnecting...');
            });
            await this.client.connect();
        } catch (error) {
            console.error('❌ [Redis] Connection failed:', error);
            console.warn('⚠️ [Redis] Continuing without Redis (fallback mode)');
            this.isConnected = false;
        }
    }
    async onModuleDestroy() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            console.log('🔌 [Redis] Disconnected');
        }
    }
    async ensureConnected() {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.ping();
            return true;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }
    /**
   * Generates a tenant-scoped key
   */ async getTenantKey(key, tenantId) {
        const resolvedTenantId = tenantId || await this.tenantResolver.resolveForQuery();
        if (!resolvedTenantId) {
            return `global:${key}`;
        }
        return `${resolvedTenantId}:${key}`;
    }
    /**
   * Set a tenant-scoped key-value pair in Redis
   */ async setForTenant(key, value, ttlSeconds, tenantId) {
        const tenantKey = await this.getTenantKey(key, tenantId);
        return this.set(tenantKey, value, ttlSeconds);
    }
    /**
   * Get a tenant-scoped value from Redis
   */ async getForTenant(key, tenantId) {
        const tenantKey = await this.getTenantKey(key, tenantId);
        return this.get(tenantKey);
    }
    /**
   * Delete a tenant-scoped key from Redis
   */ async delForTenant(key, tenantId) {
        const tenantKey = await this.getTenantKey(key, tenantId);
        return this.del(tenantKey);
    }
    /**
   * Set a key-value pair in Redis
   */ async set(key, value, ttlSeconds) {
        if (!await this.ensureConnected()) {
            return false;
        }
        try {
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, value);
            } else {
                await this.client.set(key, value);
            }
            return true;
        } catch (error) {
            console.error(`❌ [Redis] Error setting key ${key}:`, error);
            return false;
        }
    }
    /**
   * Get a value from Redis
   */ async get(key) {
        if (!await this.ensureConnected()) {
            return null;
        }
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error(`❌ [Redis] Error getting key ${key}:`, error);
            return null;
        }
    }
    /**
   * Delete a key from Redis
   */ async del(key) {
        if (!await this.ensureConnected()) {
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`❌ [Redis] Error deleting key ${key}:`, error);
            return false;
        }
    }
    /**
   * Check if a key exists
   */ async exists(key) {
        if (!await this.ensureConnected()) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`❌ [Redis] Error checking key ${key}:`, error);
            return false;
        }
    }
    /**
   * Set expiration time for a key
   */ async expire(key, seconds) {
        if (!await this.ensureConnected()) {
            return false;
        }
        try {
            await this.client.expire(key, seconds);
            return true;
        } catch (error) {
            console.error(`❌ [Redis] Error setting expiration for key ${key}:`, error);
            return false;
        }
    }
    constructor(tenantResolver){
        this.tenantResolver = tenantResolver;
        this.isConnected = false;
    }
};
RedisService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], RedisService);

//# sourceMappingURL=redis.service.js.map