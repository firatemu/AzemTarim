# Vehicle Service Management Module - Sonraki Adımlar
# Bu script'i proje kökünden çalıştırın: .\scripts\complete-vehicle-service-setup.ps1

$ErrorActionPreference = "Stop"

$ServerDir = Split-Path -Parent $PSScriptRoot
Set-Location $ServerDir

Write-Host "=== 1. Prisma Client Generate ===" -ForegroundColor Cyan
npx prisma generate --schema=./prisma/schema.prisma
Write-Host "Prisma Client basariyla olusturuldu." -ForegroundColor Green

Write-Host ""
Write-Host "=== 2. Prisma Migration Deploy ===" -ForegroundColor Cyan
Write-Host "Migration baslatiliyor (DATABASE_URL gerekli)..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
Write-Host "Migration tamamlandi." -ForegroundColor Green

Write-Host ""
Write-Host "=== 3. NestJS Build ===" -ForegroundColor Cyan
npm run build
Write-Host "Build tamamlandi." -ForegroundColor Green

Write-Host ""
Write-Host "=== Tum adimlar basariyla tamamlandi ===" -ForegroundColor Green
