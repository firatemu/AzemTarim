#!/bin/bash
# ALIS_IADE Stok Hareketi Düzeltmesi - Sunucu Rebuild ve Restart
# Plan: fix_alis_iade_stock_movements_257b5308
# Kullanım: chmod +x ALIS_IADE_FIX_REBUILD.sh && ./ALIS_IADE_FIX_REBUILD.sh

set -e

# Sunucu dizini: /var/www (deploy) veya mevcut dizin (local)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "/var/www/api-stage/server" ]; then
  SERVER_DIR="/var/www/api-stage/server"
else
  SERVER_DIR="$SCRIPT_DIR"
fi

cd "$SERVER_DIR" || exit 1

echo "🚀 ALIS_IADE Fix - Sunucu rebuild ve restart"
echo "📁 Dizin: $SERVER_DIR"
echo ""

# 1. Build
echo "🔨 1. Nest build..."
npx nest build
echo "   ✅ Build tamamlandı"
echo ""

# 2. PM2 restart
echo "🔄 2. PM2 restart api-stage..."
if command -v pm2 &> /dev/null; then
  if pm2 list 2>/dev/null | grep -q "api-stage"; then
    pm2 restart api-stage
    echo "   ✅ PM2 restart tamamlandı"
  else
    echo "   ⚠️ api-stage process bulunamadı. Manuel başlatın:"
    echo "      pm2 start dist/src/main.js --name api-stage"
  fi
else
  echo "   ⚠️ PM2 bulunamadı. Manuel restart: npm run start:prod"
fi

echo ""
echo "🎉 Rebuild tamamlandı. Sonraki adım: AIF-2026-006 verisini düzeltin."
