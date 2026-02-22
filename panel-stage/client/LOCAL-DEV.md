# Local Geliştirme (staging-api kullanılmaz)

Tüm ayarlar **localhost** için. Backend: `http://localhost:3020`, Panel: `http://localhost:3010`.

## 1. Backend (API)

```bash
cd /home/azem/projects/otomuhasebe/api-stage/server

# İlk seferde bağımlılıklar (peer uyarısı için --legacy-peer-deps)
npm install --legacy-peer-deps

# Veritabanı .env ve Prisma gerekebilir (DATABASE_URL vb.)
# npx prisma generate
# npx prisma migrate dev

# Backend'i başlat (port 3020)
npm run start:dev
# veya: npx nest start --watch
```

API çalışınca: http://localhost:3020/api → `{"status":"ok",...}` benzeri yanıt.

## 2. Panel (Next.js)

Yeni terminal:

```bash
cd /home/azem/projects/otomuhasebe/panel-stage/client

# İlk seferde
npm install   # veya pnpm install

# Panel'i başlat (port 3010)
PORT=3010 npm run dev
```

Tarayıcı: http://localhost:3010

## Özet

| Servis | URL | Komut |
|--------|-----|--------|
| API | http://localhost:3020 | `cd api-stage/server && npm run start:dev` |
| Panel | http://localhost:3010 | `cd panel-stage/client && PORT=3010 npm run dev` |

Panel’deki tüm `/api/*` istekleri otomatik olarak `localhost:3020`’e proxy edilir.
