"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KpiService", {
    enumerable: true,
    get: function() {
        return KpiService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _redisservice = require("../../common/services/redis.service");
const _prismaservice = require("../../common/prisma.service");
const _sseservice = require("../../common/sse/sse.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let KpiService = class KpiService {
    /**
     * KPI'ları Redis'ten oku (O(1), DB'ye gitme).
     * Cache yoksa hesapla.
     */ async getKpis(tenantId) {
        const cached = await this.redis.getForTenant('kpi', tenantId);
        if (cached) return JSON.parse(cached);
        // Cache miss: hesapla ve cache'le
        return this.recomputeAndEmit(tenantId);
    }
    /**
     * KPI'ları DB'den yeniden hesapla, Redis'e yaz, SSE ile push et.
     * Event listener'lardan çağrılır (iş emri tamamlandı, fatura kesildi, vb.)
     */ async recomputeAndEmit(tenantId) {
        try {
            const [receivables, payables, bankBalance, activeWO, readyWO] = await Promise.all([
                this.prisma.invoice.aggregate({
                    where: {
                        tenantId,
                        invoiceType: 'SALE',
                        status: {
                            in: [
                                'OPEN',
                                'PARTIALLY_PAID'
                            ]
                        }
                    },
                    _sum: {
                        grandTotal: true
                    }
                }),
                this.prisma.invoice.aggregate({
                    where: {
                        tenantId,
                        invoiceType: 'PURCHASE',
                        status: {
                            in: [
                                'OPEN',
                                'PARTIALLY_PAID'
                            ]
                        }
                    },
                    _sum: {
                        grandTotal: true
                    }
                }),
                this.prisma.bankAccount.aggregate({
                    where: {
                        bank: {
                            tenantId
                        },
                        isActive: true
                    },
                    _sum: {
                        balance: true
                    }
                }).catch(()=>({
                        _sum: {
                            balance: 0
                        }
                    })),
                this.prisma.workOrder.count({
                    where: {
                        tenantId,
                        status: {
                            notIn: [
                                'INVOICED_CLOSED',
                                'CLOSED_WITHOUT_INVOICE',
                                'CANCELLED'
                            ]
                        }
                    }
                }),
                this.prisma.workOrder.count({
                    where: {
                        tenantId,
                        status: 'VEHICLE_READY'
                    }
                })
            ]);
            const openReceivables = Number(receivables._sum?.grandTotal ?? 0);
            const openPayables = Number(payables._sum?.grandTotal ?? 0);
            const bank = Number(bankBalance._sum?.balance ?? 0);
            const kpi = {
                netCash: bank + openReceivables - openPayables,
                openReceivables,
                openPayables,
                bankBalance: bank,
                activeWorkOrders: activeWO,
                readyForDelivery: readyWO,
                _computedAt: new Date().toISOString()
            };
            // Redis'e yaz
            await this.redis.setForTenant('kpi', JSON.stringify(kpi), this.CACHE_TTL_SECONDS, tenantId);
            // SSE ile CEO'ya push et
            this.sseService.emit(tenantId, 'KPI_UPDATE', kpi);
            return kpi;
        } catch (err) {
            this.logger.error(`[KpiService] Recompute hatası (tenant: ${tenantId}):`, err);
            throw err;
        }
    }
    /**
     * KPI Cache'i manuel olarak geçersiz kıl.
     * Migration veya bulk işlemler sonrasında kullanılır.
     */ async invalidateCache(tenantId) {
        await this.redis.delForTenant('kpi', tenantId);
        this.logger.log(`[KpiService] Cache temizlendi: ${tenantId}`);
    }
    /**
     * Mevcut aydan geriye dönük 6 aylık Nakit Akışı trendini (Gelir/Gider) hesaplar
     * Cache TTL 1 saat.
     */ async getCashTrend(tenantId) {
        const cached = await this.redis.getForTenant('cash-trend', tenantId);
        if (cached) return JSON.parse(cached);
        const today = new Date();
        const trend = [];
        const monthNames = [
            'Oca',
            'Şub',
            'Mar',
            'Nis',
            'May',
            'Haz',
            'Tem',
            'Ağu',
            'Eyl',
            'Eki',
            'Kas',
            'Ara'
        ];
        for(let i = 5; i >= 0; i--){
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            const [gelirRes, giderRes] = await Promise.all([
                this.prisma.invoice.aggregate({
                    where: {
                        tenantId,
                        invoiceType: 'SALE',
                        status: {
                            not: 'CANCELLED'
                        },
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    _sum: {
                        grandTotal: true
                    }
                }),
                this.prisma.invoice.aggregate({
                    where: {
                        tenantId,
                        invoiceType: 'PURCHASE',
                        status: {
                            not: 'CANCELLED'
                        },
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    _sum: {
                        grandTotal: true
                    }
                })
            ]);
            trend.push({
                month: monthNames[date.getMonth()],
                gelir: Number(gelirRes._sum?.grandTotal ?? 0),
                gider: Number(giderRes._sum?.grandTotal ?? 0)
            });
        }
        await this.redis.setForTenant('cash-trend', JSON.stringify(trend), 3600, tenantId); // 1 saat
        return trend;
    }
    constructor(prisma, sseService, redis, tenantResolver){
        this.prisma = prisma;
        this.sseService = sseService;
        this.redis = redis;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(KpiService.name);
        this.CACHE_TTL_SECONDS = 300; // 5 dakika
    }
};
KpiService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _sseservice.SseService === "undefined" ? Object : _sseservice.SseService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], KpiService);

//# sourceMappingURL=kpi.service.js.map