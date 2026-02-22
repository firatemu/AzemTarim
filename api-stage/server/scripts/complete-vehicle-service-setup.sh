#!/bin/bash
# Vehicle Service Management Module - Sonraki Adımlar
# Bu script'i proje kökünden çalıştırın: ./scripts/complete-vehicle-service-setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
cd "$SERVER_DIR"

echo "=== 1. Prisma Client Generate ==="
npx prisma generate --schema=./prisma/schema.prisma
echo "Prisma Client başarıyla oluşturuldu."

echo ""
echo "=== 2. Prisma Migration Deploy ==="
echo "Migration başlatılıyor (DATABASE_URL gerekli)..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "Migration tamamlandı."

echo ""
echo "=== 3. NestJS Build ==="
npm run build
echo "Build tamamlandı."

echo ""
echo "=== Tüm adımlar başarıyla tamamlandı ==="
