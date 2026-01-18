# Otomuhasebe – Port-less Prod Standardı (Caddy ile)

## Özet
- Dış dünyaya **sadece 80/443** portları açık (Caddy)
- App container'ları internal **3000** portunu dinler (ports yok)
- Domain tabanlı routing Caddy ile yapılır
- Staging ve prod aynı host'ta çakışmaz: servis isimleri farklı

## Port Mapping (Port-siz Model)

| Environment | Service | Container Port | Host Port | Domain |
|-------------|----------|----------------|-----------|--------|
| Staging | Landing Page | 3000 | Yok | staging.otomuhasebe.com |
| Staging | API Backend | 3000 | Yok | staging-api.otomuhasebe.com |
| Staging | Admin Panel | 3000 | Yok | admin-staging.otomuhasebe.com |
| Production | Landing Page | 3000 | Yok | otomuhasebe.com |
| Production | API Backend | 3000 | Yok | api.otomuhasebe.com |
| Production | Admin Panel | 3000 | Yok | admin.otomuhasebe.com |

## Caddyfile Yapılandırması

```caddy
staging.otomuhasebe.com {
    reverse_proxy landing-page-staging:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}

staging-api.otomuhasebe.com {
    reverse_proxy backend-staging:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}

admin-staging.otomuhasebe.com {
    reverse_proxy admin-panel-staging:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}

otomuhasebe.com {
    reverse_proxy landing-page:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}

api.otomuhasebe.com {
    reverse_proxy backend:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}

admin.otomuhasebe.com {
    reverse_proxy admin-panel:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote}
    }
}
```

## Komutlar

### Staging Başlat

```bash
# /var/www dizinine gidin
cd /var/www

# Staging build ve start (portsuz model)
make up-staging

# Logları izle
make logs-staging
```

### Production Başlat

```bash
# /var/www dizinine gidin
cd /var/www

# Production build ve start (portsuz model)
make up-prod

# Logları izle
make logs-prod
```

### Health Test

```bash
# Production health endpoint'ini test et
curl -I https://api.otomuhasebe.com/health

# Staging health endpoint'ini test et
curl -I https://staging-api.otomuhasebe.com/health
```

## Yapısal Değişiklikler

**Eski yapı (Port mapping'li):** Host portları kullanılırdı (3020, 3021, 3001, 3002, 3006, 3007)
**Yeni yapı (Port-siz):** Sadece Caddy 80/443 açık, app'ler internal 3000'da çalışıyor

## Servis İsimleri (Port-siz Model)

**Staging:**
- `backend-staging` - API Backend
- `admin-panel-staging` - Admin Panel
- `landing-page-staging` - Landing Page

**Production:**
- `backend` - API Backend
- `admin-panel` - Admin Panel
- `landing-page` - Landing Page

## Önemli Notlar

1. **Internal Portlar**: Tüm app container'ları 3000 portunda çalışır, host portlarına exposure yok
2. **Caddy SSL**: Let's Encrypt ile otomatik SSL sertifikası alacak (domain DNS doğru yönlendirilmiş olmalı)
3. **Port çakışması yok**: App'ler internal 3000'da çalıştığı için host portları gerekmez
4. **Servis isimleri**: Staging servislerinde `-staging` son eki vardır, Production'da yoktur

## Environment Dosyaları

| Dosya | Açıklama |
|-------|-----------|
| [docker/compose/.env.staging](/var/www/docker/compose/.env.staging) | Staging environment |
| [docker/compose/.env.production](/var/www/docker/compose/.env.production) | Production environment |

**PORT Değişkeni**: Her iki environment dosyasında `PORT=3000` eklendi
