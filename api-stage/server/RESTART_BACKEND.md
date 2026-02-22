# Backend Yeniden Başlatma (404 Düzeltmesi)

`/api/technicians` 404 hatası alıyorsanız, backend eski build ile çalışıyor olabilir.

```bash
cd /home/azem/projects/otomuhasebe

make down-staging-dev
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.dev.yml build backend-staging --no-cache
make up-staging-dev
make migrate-staging
```
