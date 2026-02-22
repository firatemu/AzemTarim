# Projeyi Ayağa Kaldırma (Tek Doğru Yöntem)

**Önemli:** Proje Docker ile çalıştırılır. WSL/Windows’ta doğrudan `npm run start:dev` veya `nest` çalıştırmaya çalışmayın; servisler compose ile tanımlıdır.

---

## Local / Staging dev (hot-reload)

1. **Proje kökü:** `cd /home/azem/projects/otomuhasebe`

2. **Env:** `docker/compose/.env.staging` olmalı (yoksa `docker/compose/.env.staging.example` veya DOCKER_README’deki değişkenlerle oluşturulur).

3. **Tek komut:**
   ```bash
   make up-staging-dev
   ```
   Bu şunları yapar:
   - `docker/compose/docker-compose.base.yml` → postgres, redis, minio, caddy
   - `docker/compose/docker-compose.staging.dev.yml` → backend-staging, user-panel-staging

4. **Migration (ilk seferde):**
   ```bash
   make migrate-staging
   ```
   (Staging dev compose’da backend servis adı `backend-staging`; migrate komutu staging.yml ile çalışıyor olabilir – gerekirse compose dosyasına göre `run --rm backend-staging npx prisma migrate deploy`.)

5. **Erişim:**
   - Backend API: **http://localhost:3020**
   - User panel: **http://localhost:3010**

6. **Loglar:** `make logs-staging-dev`  
   **Kapatma:** `make down-staging-dev`

---

## Staging (build’li, hot-reload yok)

```bash
make up-staging
make migrate-staging   # ilk seferde
make logs-staging
make down-staging
```

---

## Production

```bash
make up-prod
make migrate-prod     # ilk seferde
make logs-prod
make down-prod
```

Env: `docker/compose/.env.production`.

---

## Servis özeti

| Ortam     | Backend (host port) | User panel (host port) | Compose kombinasyonu        |
|----------|----------------------|-------------------------|-----------------------------|
| Staging dev | 3020               | 3010                    | base + staging.dev          |
| Staging  | 3020                 | 3010                    | base + staging              |
| Prod     | 3021                 | 3025                    | base + prod                  |

Panel’deki `/api/*` istekleri Next.js proxy veya catch-all route ile backend’e (localhost:3020) gider.
