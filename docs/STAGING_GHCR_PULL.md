# Staging Image'ları: GitHub Actions Build ve Başka Sunuculardan Pull

Build işlemi **GitHub Actions** üzerinde yapılır; image'lar **GitHub Container Registry (GHCR)**'a push edilir. Böylece sunucuda build gerekmez; herhangi bir sunucu sadece `docker pull` ile image'ları çekip çalıştırabilir.

---

## 1. GitHub Actions ile Build ve GHCR Push

### Tetikleme

- **Otomatik:** `main` veya `staging` branch'e push → build + GHCR push + (varsayılan) 31.210.43.185'e deploy.
- **Manuel (sadece build, deploy yok):**  
  GitHub → **Actions** → **Staging Deploy (stnoto.com)** → **Run workflow** → **"Sadece build & GHCR push (deploy atla)"** kutusunu işaretleyin → **Run workflow**.  
  Bu seçenek image'ları sadece GHCR'a push eder; SSH deploy çalışmaz. Başka sunuculardan kendiniz pull edersiniz.
- **Manuel (build + deploy):** Aynı workflow'u, kutuyu işaretlemeden çalıştırın; hem build hem 31.210.43.185'e deploy yapılır.

### GHCR Image Adları

| Servis   | Image |
|----------|--------|
| Backend  | `ghcr.io/firatemu/otomuhasebe-backend-staging:latest` |
| Panel    | `ghcr.io/firatemu/otomuhasebe-user-panel-staging:latest` |

Repo farklıysa (farklı GitHub org/user): `docker-compose.staging.ghcr.yml` içinde `GHCR_IMAGE_BACKEND` ve `GHCR_IMAGE_PANEL` environment değişkenleriyle override edebilirsiniz.

---

## 2. Başka Bir Sunucuda Pull ve Çalıştırma

Aynı image'ları **farklı bir sunucuda** (farklı IP/alan adı) kullanmak için aşağıdaki adımları uygulayın. Sunucuda **build yapılmaz**, sadece pull + compose up.

### 2.1 Gereksinimler

- Docker + Docker Compose v2
- Git (projeyi clone etmek için)
- Proje dizini: örn. `/var/www/otomuhasebe`

### 2.2 Adımlar

**1) Docker ve proje**

```bash
# Docker kurulumu (Ubuntu örneği)
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
# Çıkış yapıp tekrar giriş veya: newgrp docker

# Proje dizini ve clone
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/firatemu/otomuhasebe.git otomuhasebe
cd /var/www/otomuhasebe
```

**2) Ağ ve altyapı**

```bash
docker network create compose_app_net 2>/dev/null || true
docker compose -f docker/compose/docker-compose.base.yml up -d postgres redis minio caddy
# Birkaç saniye bekleyin
sleep 10
```

**3) Veritabanı**

- Backup'tan restore: `DEPLOYMENT_GUIDE.md` §6.2.
- Veya boş şema için: `docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml run --rm backend-staging npx prisma migrate deploy`

**4) .env.staging**

Proje kökünde `.env.staging` oluşturun (DATABASE_URL, JWT, MinIO, CORS vb.). Örnek için `.env.staging.example` veya `DEPLOYMENT_GUIDE.md` §7.

**5) GHCR'dan çekme (private package ise login)**

GHCR paketi **private** ise, sunucuda bir kez login gerekir:

```bash
# GitHub Personal Access Token (read:packages) ile
echo "GITHUB_PAT_BURAYA" | docker login ghcr.io -u firatemu --password-stdin
```

Paket **public** ise bu adım gerekmez.

**6) Image'ları çek ve uygulamayı başlat**

```bash
cd /var/www/otomuhasebe
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml pull
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml up -d
```

**7) Farklı alan adı kullanıyorsanız**

Panel build sırasında `NEXT_PUBLIC_API_BASE_URL=https://api.stnoto.com` kullanıldı. Başka bir domain (örn. `https://api.sizin-domain.com`) için:

- Ya GitHub Actions'ta panel build'ine `NEXT_PUBLIC_API_BASE_URL` build-arg'ı o domain ile verip yeni image üretirsiniz,
- Ya da mevcut image ile çalışıp sadece Caddy/nginx tarafında o domain'i aynı servislere yönlendirirsiniz (panel zaten stnoto.com API’ye istek atar; API’yi farklı domain’den sunmak istiyorsanız reverse proxy’de o domain’i backend’e yönlendirmeniz gerekir).

**8) Migration (ilk kurulumda)**

```bash
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml run --rm backend-staging npx prisma migrate deploy
```

---

## 3. Özet

| Yapılacak | Açıklama |
|-----------|----------|
| Build | GitHub Actions (push veya manuel workflow) |
| Image'lar | `ghcr.io/firatemu/otomuhasebe-backend-staging:latest`, `ghcr.io/firatemu/otomuhasebe-user-panel-staging:latest` |
| Sadece build (deploy yok) | Manuel workflow çalıştırırken "Sadece build & GHCR push" seçeneğini işaretleyin |
| Başka sunucuda çalıştırma | Clone, base compose (postgres, redis, minio, caddy), .env.staging, gerekirse GHCR login, pull, up |

Detaylı sunucu kurulumu ve DNS için: [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md).
