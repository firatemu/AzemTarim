# OtoMuhasebe - AI Agent Hızlı Referans Kartı

🚀 **Hızlı Başlangıç** | 📁 **Dosya Yerleri** | 🔧 **Komutlar** | ✅ **Kurallar**

---

## 🚀 Hızlı Başlangıç (1 dakika)

```bash
# Başlat
cd /home/azem/projects/otomuhasebe/infra/compose
docker compose -f docker-compose.staging.yml up -d

# Erişim
Frontend (UI):     http://localhost:3010
Backend (API):     http://localhost:3020
Database (psql):   localhost:5433
MinIO (S3):        http://localhost:9000
```

| Hizmet | Durumu | Port | Komut |
|--------|--------|------|--------|
| Frontend (Next.js) | `otomuhasebe_saas_panel` | 3010 | `docker logs -f otomuhasebe_saas_panel` |
| Backend (NestJS) | `otomuhasebe_saas_backend` | 3020 | `docker logs -f otomuhasebe_saas_backend` |
| Database (PostgreSQL) | `otomuhasebe_saas_postgres` | 5433 | `docker exec -it otomuhasebe_saas_postgres psql -U postgres` |
| Cache (Redis) | `otomuhasebe_saas_redis` | 6379 | Internal only |
| Storage (MinIO) | `otomuhasebe_saas_minio` | 9000 | `http://localhost:9000` |

---

## 📁 Önemli Dosya Yerleri

### Backend
```
api-stage/server/
├── src/modules/               # Feature modules
│   ├── invoice/              # 📄 Faturalar
│   ├── product/              # 📦 Ürünler
│   ├── pos/                  # 💳 POS API
│   ├── account/              # 👥 Cari hesaplar
│   └── [OTHER_MODULES]/
├── prisma/schema.prisma       # 🗄️ Database schema
├── src/main.ts               # 🟢 Başlangıç
└── package.json
```

### Frontend
```
panel-stage/client/
├── src/app/(main)/           # 📄 Sayfalar
│   ├── pos/                  # 💳 POS Screen
│   ├── invoice/              # 📊 Faturalar
│   └── [OTHER_PAGES]/
├── src/components/           # 🎨 Components
├── src/stores/               # 🗂️ Zustand stores
│   └── posStore.ts          # POS State
├── next.config.ts
└── package.json
```

### Yapılandırma
```
infra/compose/
├── docker-compose.staging.yml # 🐳 Docker setup
└── Caddyfile                 # 🔄 Reverse proxy

AGENTS.md                      # 📋 UI/Coding standards
AI_AGENT_KNOWLEDGE_BASE.md     # 📚 Tüm detaylar (BUNU OKU)
```

---

## 🔧 Temel Komutlar

### Docker
```bash
# Başlat/Durdur
docker compose up -d                    # Tüm servisleri başlat
docker compose down                     # Durdur
docker compose restart service_name     # Restart

# Logs
docker logs -f otomuhasebe_saas_panel   # Frontend logs
docker logs -f otomuhasebe_saas_backend # Backend logs
docker exec -it service_name bash       # Container'a gir

# Rebuild (değişiklik sonrası)
docker compose up -d --build user-panel-staging    # Frontend rebuild
docker compose up -d --build backend-staging       # Backend rebuild
```

### Backend (pnpm)
```bash
cd api-stage/server
pnpm install                    # Dependencies
pnpm dev                        # Development
npm run build                   # Production build
npx prisma migrate dev          # DB migration
npx prisma studio              # Web DB UI
npm run seed                    # Sample data
```

### Frontend (pnpm)
```bash
cd panel-stage/client
pnpm install                    # Dependencies
pnpm dev                        # Development (Turbopack)
pnpm build                      # Production build
# Hard refresh on changes: Ctrl+Shift+R
```

### Database
```bash
# Connect
docker exec -it otomuhasebe_saas_postgres psql -U postgres -d otomuhasebe

# Queries
SELECT * FROM invoices LIMIT 5;
SELECT * FROM accounts WHERE "tenantId" = 'YOUR_TENANT_ID';

# Backup
pg_dump -U postgres otomuhasebe > backup.sql

# Restore
psql -U postgres otomuhasebe < backup.sql
```

### Git
```bash
git status                      # Changes
git diff                        # What changed
git add .                       # Stage
git commit -m "message"         # Commit
git push origin branch_name     # Push
git log --oneline              # History
```

---

## ✅ KRITIK KURALLAR (Multi-tenant & Styling)

### ⚠️ Multi-tenant Isolation (HER ZAMAN)
```typescript
// ❌ YANLIŞ
const invoices = await db.invoice.findMany();

// ✅ DOĞRU - tenantId ZORUNLU
const invoices = await db.invoice.findMany({
  where: { tenantId: currentTenant.id }
});

// ✅ DOĞRU - Unique constraint
const invoice = await db.invoice.findUnique({
  where: { id_tenantId: { id, tenantId } }
});
```

### 🎨 Renk & Tema (CSS Variables)
```typescript
// ❌ YANLIŞ
<button style={{ background: '#4f46e5', color: '#fff' }}>
  
// ✅ DOĞRU - Always use CSS variables
<button style={{ background: 'var(--accent)', color: '#fff' }}>

// ✅ DOĞRU - Responsive & Dark mode compatible
<Box sx={{
  background: 'var(--surface)',
  color: 'var(--text)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
}}>
```

### 📱 Responsive (Tüm ekranlar)
```typescript
// ❌ YANLIŞ - Sabit width
<Box sx={{ width: '800px' }}>

// ✅ DOĞRU - Responsive
<Box sx={{
  width: '100%',
  maxWidth: '800px',
  px: { xs: 1, sm: 2, md: 3 },  // xs/sm = mobile optimization
}}>

// ✅ DOĞRU - POS specific
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
}}>
```

### 📄 Sayfalar (Template)
```typescript
// ✅ DOĞRU - Standart sayfa yapısı
export default function MyPage() {
  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Başlık</Typography>
        <Button>Aksiyon</Button>
      </Box>

      {/* Content */}
      <DataTable data={data} />
    </Box>
  );
}
```

---

## 🎯 Yaygın Görevler

### Backend'e Yeni Endpoint Ekle
1. **Entity tanımla:** `prisma/schema.prisma`
2. **Service yazma:** `modules/feature/feature.service.ts`
3. **Controller yazma:** `modules/feature/feature.controller.ts`
4. **Routes ekle:** Controller'da @Get(), @Post() etc.
5. **Test:** `http://localhost:3020/api/feature`

### Frontend'e Sayfa Ekle
1. **Klasör oluştur:** `src/app/(main)/my-page/`
2. **page.tsx yazma:** `src/app/(main)/my-page/page.tsx`
3. **Components:** İhtiyaç duyulan components
4. **Store (opsiyonel):** Zustand store
5. **URL:** `http://localhost:3010/my-page`

### Veritabanı Migrasyon
```bash
# Schema değiştir: schema.prisma
vim api-stage/server/prisma/schema.prisma

# Migration oluştur
cd api-stage/server
npx prisma migrate dev --name describe_change

# Apply
npx prisma migrate deploy

# Seed opsiyonel
npm run seed
```

### Bug Fix Workflow
```bash
# 1. Branch oluştur
git checkout -b fix/bug-name

# 2. Değişiklik yap
# Dosyaları düzenle, test et

# 3. Container rebuild (gerekirse)
docker compose up -d --build

# 4. Hard refresh
# Browser: Ctrl+Shift+R (CSS/JS cache)

# 5. Commit
git commit -m "fix: describe fix"
git push origin fix/bug-name
```

---

## 🚨 Hata Giderme (Quick Fixes)

| Sorun | Sebep | Çözüm |
|-------|-------|-------|
| Frontend 500 hata | Cache/Build | `docker exec user-panel-staging rm -rf .next` |
| CSS eski halinde | Browser cache | `Ctrl+Shift+R` (Hard refresh) |
| Backend API 502 | Service down | `docker restart otomuhasebe_saas_backend` |
| "DB Connection refused" | PostgreSQL down | `docker logs otomuhasebe_saas_postgres` |
| Port already in use | Process çakışması | `lsof -i :PORT_NUMBER` → `kill -9 PID` |
| Changes not showing | Rebuild gerekli | `docker compose up -d --build service_name` |

---

## 📚 Daha Fazla Bilgi

**Kapsamlı Rehber:** `AI_AGENT_KNOWLEDGE_BASE.md` (1300+ satır)  
**Coding Standards:** `AGENTS.md` (UI standards, colors, responsive design)  
**POS Frontend:** `POS_FRONTEND_KODLARI.md` (Component examples)  
**Project Report:** `PROJE_RAPORU.md` (Detaylı analiz)

---

## 💡 Pro Tips

✨ **Tip 1:** Dev server çalışırken değişiklikler otomatik hot reload olur  
✨ **Tip 2:** DB schema değiştirirseniz migration oluşturmayı unutmayın  
✨ **Tip 3:** CSS variables kullanamazsanız, AGENTS.md'deki palette'i manuel kopyalayın  
✨ **Tip 4:** tenantId'yi unutmak = büyük güvenlik sorunu → HER ZAMAN ekle  
✨ **Tip 5:** TypeScript compile hataları ilk bulunacak = runtime hataları azalır

---

**Hazırlayan:** AI Agent Knowledge Base Generator  
**Tarih:** 19 Mart 2026  
**Süre:** 2-3 dakika okuma  
**Amaç:** Yeni AI agents'lerin hızlı başlaması

👉 **ÖNERİ:** Kodlama başlamadan önce `AI_AGENT_KNOWLEDGE_BASE.md` sayfasını **oku**!
