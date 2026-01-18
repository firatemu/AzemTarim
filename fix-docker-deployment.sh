# ==========================================================
# Fix Docker Build Context + Start Staging on Docker
# ==========================================================

set -x  # Debug mode (çıktıları görelmek için)

# 0) PARAMETRELER (DÜZENLE)
ROOT_DIR="${ROOT_DIR:-/var/www}"
STG_API_DOMAIN="${STG_API_DOMAIN:-staging-api.otomuhasebe.com}"
STG_ADMIN_DOMAIN="${STG_ADMIN_DOMAIN:-admin-staging.otomuhasebe.com}"
STG_ROOT_DOMAIN="${STG_ROOT_DOMAIN:-staging.otomuhasebe.com}"
API_HEALTH_PATH="${API_HEALTH_PATH:-/health}"
UI_HEALTH_PATH="${UI_HEALTH_PATH:-/}"

# Proje dizinleri
BACKEND_CTX_REL="../../api-stage"
BACKEND_DOCKERFILE="server/Dockerfile"
ADMIN_CTX_REL="../../admin-stage"
ADMIN_DOCKERFILE="Dockerfile"
LANDING_CTX_REL="../../otomuhasebe-landing"
LANDING_DOCKERFILE="Dockerfile"

# Yardımcılar
ts(){ date +%Y%m%d_%H%M%S; }
backup_file(){ local f="$1"; [ -f "$f" ] && cp -a "$f" "$f.bak-$(ts)" && echo "  ↳ yedek: $f.bak-$(ts)"; }
have_cmd(){ command -v "$1" >/dev/null 2>&1; }
compose_cmd(){ 
  if docker compose version >/dev/null 2>&1; then 
    echo "docker compose"
  else 
    echo "docker-compose"
  fi
}
as_root(){ if [ "$(id -u)" -ne 0 ]; then sudo "$@"; else "$@"; fi; }
log(){ echo -e "\n== $* =="; }
fail(){ echo "ERROR: $*" >&2; exit 1; }

# 1) Docker & Socket kontrolü
log "Docker servisi kontrol et"
as_root systemctl enable --now docker >/dev/null 2>&1 || true
systemctl is-active --quiet docker || fail "Docker aktif değil (systemctl status docker)"

RUN_SOCK="/run/docker.sock"
VAR_SOCK="/var/run/docker.sock"
log "Docker socket kontrolü"
if [ -S "$RUN_SOCK" ] && [ ! -e "$VAR_SOCK" ]; then
  as_root mkdir -p /var/run
  as_root ln -s "$RUN_SOCK" "$VAR_SOCK"
  echo "✓ /var/run/docker.sock → /run/docker.sock symlink oluşturuldu"
elif [ -S "$VAR_SOCK" ]; then
  echo "• /var/run/docker.sock mevcut"
else
  as_root systemctl restart docker
  sleep 2
  [ -S "$RUN_SOCK" ] || fail "Docker socket oluşmadı"
  [ ! -e "$VAR_SOCK" ] || as_root ln -s "$RUN_SOCK" "$VAR_SOCK"
  echo "✓ Symlink tamam"
fi

# Compose yolları
COMPOSE=$(compose_cmd)
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"

[ -f "$BASE" ] || fail "Eksik: $BASE"
[ -f "$STG" ] || fail "Eksik: $STG"

# 2) Devam eden staging stack'ı kapat
log "Ağır build sürecini durduruluyor (compose down)"
$COMPOSE -f "$BASE" -f "$STG" down || true

# 3) Prisma klasörünü kontrol et ve oluştur
log "Prisma klasörü kontrol et ve gerekirse oluştur"

PRISMA_CANDIDATES=(
  "$ROOT_DIR/prisma"
  "$ROOT_DIR/api-stage/prisma"
  "$ROOT_DIR/api-stage/server/prisma"
)

FOUND_PRISMA=""
for PRISMA in "${PRISMA_CANDIDATES[@]}"; do
  if [ -d "$PRISMA" ]; then
    FOUND_PRISMA="$PRISMA"
    break
  fi
done

if [ -z "$FOUND_PRISMA" ]; then
  mkdir -p "$ROOT_DIR/prisma"
  log "✓ Prisma klasörü oluşturuldu: $ROOT_DIR/prisma"
  # Repo kökünden kopyala (rsync yerine çünkü daha güvenli ve hızlı)
  rsync -a --delete "$ROOT_DIR/prisma/" "$ROOT_DIR/api-stage/prisma/"
  echo "✓ Prisma kopyalandı: $ROOT_DIR/api-stage/prisma → $ROOT_DIR/prisma"
else
  log "• Prisma zaten mevcut: $FOUND_PRISMA"
fi

# 4) Backend Dockerfile güncelle (prisma path düzelt)
log "Backend Dockerfile güncelle (prisma path)"
BACKEND_DF="$ROOT_DIR/api-stage/server/Dockerfile"
backup_file "$BACKEND_DF"

# Bu Dockerfile, build context'i api-stage yapısını varsayar:
cat > "$BACKEND_DF" <<'EOF'
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Gerekli dosyaları kopyala
COPY server/package*.json ./server/
# Prisma şeması context içinde (api-stage/prisma) varsayılır:
COPY prisma ./prisma

# Bağımlılıkları kur
RUN cd server && npm ci --legacy-peer-deps

# Uygulama kaynaklarını kopyala
COPY server ./server

# Build
RUN cd server && npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS run
WORKDIR /app/server
ENV NODE_ENV=production

# Prod runtime dosyaları
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist

# Runtime prisma client gerekiyorsa
COPY --from=build /$PRISMA ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]
EOF
echo "✓ Backend Dockerfile güncellendi: $BACKEND_DF"

# 5) Staging compose içindeki backend context doğru mu?
log "Staging compose backend build context kontrol"
if ! grep -q "backend-staging:" "$STG"; then
  fail "Staging compose içinde backend-staging servisi bulunamadı"
fi

# 6) Staging compose güncelle (backend context düzelt)
log "Staging compose güncelleniyor (backend context düzelt)"
backup_file "$STG"
cat > "$STG" <<EOF
version: "3.9"

services:
  backend-staging:
    build:
      context: ${BACKEND_CTX_REL}
      dockerfile: ${BACKEND_DOCKERFILE}
    env_file:
      - .env.staging
    networks: [app_net]
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000${API_HEALTH_PATH}"]
      interval: 10s
      timeout: 3s
      retries: 12
      start_period: 15s

  admin-panel-staging:
    build:
      context: ${ADMIN_CTX_REL}
      dockerfile: ${ADMIN_DOCKERFILE}
    env_file:
      - .env.staging
    networks: [app_net]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000${UI_HEALTH_PATH}"]
      interval: 10s
      timeout: 3s
      retries: 12
      start_period: 15s

  landing-page-staging:
    build:
      context: ${LANDING_CTX_REL}
      dockerfile: ${LANDING_DOCKERFILE}
    env_file:
      - .env.staging
      environment:
        PORT: 3000
        NEXT_PUBLIC_API_BASE_URL: https://${STG_API_DOMAIN}
    networks: [app_net]
    depends_on:
      - backend-staging
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000${UI_HEALTH_PATH}"]
      interval: 10s
      timeout: 3s
      retries: 12
      start_period: 15s
EOF
echo "✓ Staging compose güncellendi: $STG"

# 7) Backend'i tek başına build + health bekle
log "Backend-staging tek başına build + up (hızlı)"
$COMPOSE -f "$BASE" -f "$STG" build backend-staging
$COMPOSE -f "$BASE" -f "$STG" up -d backend-staging

# Health bekleme (maks 90 sn)
log "Backend health bekleniyor"
for i in {1..30}; do
  CID=$(docker ps -qf "name=backend-staging")
  [ -n "$CID" ] || { sleep 3; continue; }
  HS=$(docker inspect --format='{{json .State.Health.Status}}' "$CID" 2>/dev/null || echo '"starting"')
  if [[ "$HS" == '"healthy"' ]]; then
    echo "✓ Backend healthy"
    break
  fi
  echo "• Bekleniyor ($i/30): $HS"
  sleep 3
  if [ "$i" -eq 30 ]; then
    echo "✗ Backend healthy değil. Loglar:"
    $COMPOSE -f "$BASE" -f "$STG" logs --tail=200 backend-staging || true
    fail "Backend health başarısız"
  fi
done

# 8) Admin & Landing build + up
log "Admin-panel-staging build + up"
$COMPOSE -f "$BASE" -f "$STG" up -d --build admin-panel-staging

log "Landing-page-staging build + up"
$COMPOSE -f "$BASE" -f "$STG" up -d --build landing-page-staging

# 9) Caddy restart (routing)
log "Caddy restart (80/443 routing)"
$COMPOSE -f "$BASE" up -d caddy
sleep 5
$COMPOSE -f "$BASE" logs --tail=50 caddy || true

# 10) Staging ps özeti
log "Staging ps özeti"
$COMPOSE -f "$BASE" -f "$STG" ps || true

# 11) Smoke test (staging domainleri)
log "Smoke test (staging domains)"
ok=1
check(){ local u="$1"; local code; code=$(curl -s -o /dev/null -w "%{http_code}" "$u" || true); echo "$code - $u"; [[ "$code" =~ ^2|^3 ]] || ok=0; }

check "https://${STG_API_DOMAIN}${API_HEALTH_PATH}"
check "https://${STG_ADMIN_DOMAIN}${UI_HEALTH_PATH}"
check "https://${STG_ROOT_DOMAIN}${UI_HEALTH_PATH}"

if [ "$ok" -eq 1 ]; then
  echo "✓ Staging smoke OK — Proje Docker üzerinde çalışıyor."
else
  echo "✗ Staging smoke FAILED"
  echo "Lütfen ilgili servis loglarına bakın:"
  echo "  $COMPOSE -f $BASE -f $STG logs -f backend-staging"
  echo "  $COMPOSE -f $BASE -f $STG logs -f admin-panel-staging"
  echo "  $COMPOSE -f $BASE -f $STG logs -f landing-page-staging"
  exit 1
fi

echo -e "\n=== TAMAMLANDI ✅ ==="
echo "• Prisma path: $PRISMA_DIR_REL"
echo "• Backend Dockerfile güncellendi ($BACKEND_DF)"
echo "• Staging stack Docker üzerinde ayakta"
echo "• Komutlar:"
echo "  - Genel log:   $COMPOSE -f $BASE -f $STG logs -f"
echo "  - Servis logları:"
echo "  - Backend:   $COMPOSE -f $BASE -f $STG logs -f backend-staging"
echo "  - Admin:   $COMPOSE -f $BASE -f $STG logs -f admin-panel-staging"
echo "  - Landing:   $COMPOSE -f $BASE -f $STG logs -f landing-page-staging"
