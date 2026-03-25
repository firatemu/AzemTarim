#!/bin/bash

# OtoMuhasebe Konteyner Yönetim Script'i
# Bu script, sunucu yeniden başladığında konteynerleri başlatmak için kullanılır

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$SCRIPT_DIR/compose"

# Renkli çıktı
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Konteyner durumunu göster
show_status() {
    log_info "Konteyner durumu:"
    docker ps --filter "name=otomuhasebe_saas_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Konteynerleri başlat
start_containers() {
    log_info "Konteynerler başlatılıyor..."
    cd "$COMPOSE_DIR"
    docker compose -f docker-compose.staging.yml -f docker-compose.base.yml up -d
    log_info "Konteynerler başarıyla başlatıldı!"
    show_status
}

# Konteynerleri durdur
stop_containers() {
    log_info "Konteynerler durduruluyor..."
    cd "$COMPOSE_DIR"
    docker compose -f docker-compose.staging.yml -f docker-compose.base.yml down
    log_info "Konteynerler başarıyla durduruldu!"
}

# Konteynerleri yeniden başlat
restart_containers() {
    log_info "Konteynerler yeniden başlatılıyor..."
    cd "$COMPOSE_DIR"
    docker compose -f docker-compose.staging.yml -f docker-compose.base.yml restart
    log_info "Konteynerler başarıyla yeniden başlatıldı!"
    show_status
}

# Konteynerleri yeniden build et ve başlat
rebuild_containers() {
    log_info "Konteynerler yeniden build ediliyor..."
    cd "$COMPOSE_DIR"
    docker compose -f docker-compose.staging.yml -f docker-compose.base.yml up -d --build
    log_info "Konteynerler başarıyla build edildi ve başlatıldı!"
    show_status
}

# Logları göster
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        log_info "Tüm konteyner logları:"
        cd "$COMPOSE_DIR"
        docker compose -f docker-compose.staging.yml -f docker-compose.base.yml logs -f --tail=100
    else
        log_info "$service konteyner logları:"
        docker logs -f --tail=100 "otomuhasebe_saas_$service"
    fi
}

# Yardım menüsü
show_help() {
    cat << EOF
OtoMuhasebe Konteyner Yönetim Script'i

Kullanım: ./manage.sh [KOMUT]

Komutlar:
    start       - Tüm konteynerleri başlat
    stop        - Tüm konteynerleri durdur
    restart     - Tüm konteynerleri yeniden başlat
    rebuild     - Konteynerleri yeniden build et ve başlat
    status      - Konteyner durumunu göster
    logs [name] - Konteyner loglarını göster (opsiyonel: backend, panel, postgres, redis, minio, caddy)
    help        - Bu yardım mesajını göster

Örnekler:
    ./manage.sh start              # Tüm konteynerleri başlat
    ./manage.sh logs backend        # Backend loglarını izle
    ./manage.sh logs                # Tüm logları izle
    ./manage.sh status              # Durumu göster
EOF
}

# Ana program
case "$1" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    rebuild)
        rebuild_containers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Geçersiz komut: $1"
        show_help
        exit 1
        ;;
esac