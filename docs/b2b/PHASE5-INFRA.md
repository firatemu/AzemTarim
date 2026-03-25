# Phase 5 — Altyapı (özet)

## 5A — Dinamik tenant schema

Tam **ayrı PostgreSQL schema + ayrı PrismaClient** henüz yok; veri tek veritabanında `tenantId` ile ayrılıyor.

- `B2bTenantSchemaBridgeService`: `B2BTenantConfig.schemaName` okur ve loglar (geçiş için işaret).
- İleride: `B2BPrismaService` connection pool + `search_path` (prompt: `B2B_Development_Prompts.md` Phase 5A).

## 5B — Lisans

- `B2bLicenseCacheService` + `B2BLicenseGuard`: Redis `b2b:license:active:{tenantId}` (TTL 300 sn).
- Portal: `x-b2b-domain` → `b2bTenantId` sonrası aynı guard.
- Giriş: `B2bAuthService.login` lisans kontrolü.
- Lisans güncellemesinde önbellek: `B2bLicenseCacheService.invalidate(tenantId)` çağrılmalı (admin PATCH eklendiğinde bağlanır).

## TLS — Caddy on_demand (örnek)

Backend: `GET /api/internal/tls-ask?domain=` → kayıtlı `B2BDomain` ise **200**, değilse **404** (throttle uygulu).

Örnek Caddy parçası (ortamınıza göre uyarlayın):

```caddy
{
	on_demand_tls {
		ask http://api:3001/api/internal/tls-ask
	}
}

https:// {
	tls {
		on_demand
	}
	reverse_proxy api:3001
}
```

`ask` URL’si Caddy’nin erişebildiği iç ağ adresi olmalıdır.
