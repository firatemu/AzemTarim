# 🚀 Production Deployment Guide
# Oto Muhasebe SaaS Platform with PgBouncer

**Last Updated:** 2026-03-13

---

## 📋 CONTENTS

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Setup Configuration Files](#2-setup-configuration-files)
3. [Generate MD5 Hash for PgBouncer](#3-generate-md5-hash-for-pgbouncer)
4. [Start Production Stack](#4-start-production-stack)
5. [Run Database Migrations](#5-run-database-migrations)
6. [Verify Deployment](#6-verify-deployment)
7. [Critical Warnings](#7-critical-warnings)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. PRE-DEPLOYMENT CHECKLIST

### ✅ Required Actions Before Deployment

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Replace ALL placeholder passwords with strong random passwords
- [ ] Generate MD5 hash for PostgreSQL password
- [ ] Update `pgbouncer/userlist.txt` with MD5 hash
- [ ] Update `CADDY_DOMAIN` with actual production domain
- [ ] Update `NEXT_PUBLIC_API_URL` with actual production API URL
- [ ] Update `CORS_ALLOWED_ORIGINS` with production frontend URLs
- [ ] Generate random JWT_SECRET (64+ characters)
- [ ] Update MinIO credentials (use NEW format: MINIO_ROOT_USER/PASSWORD)
- [ ] Ensure VPS has 4 vCPU / 16 GB RAM (minimum)
- [ ] Ensure VPS has Docker and Docker Compose installed
- [ ] Ensure ports 80 and 443 are open on firewall
- [ ] Ensure domain DNS points to VPS IP address

### 📝 Environment Variables to Replace

```bash
# Replace these in .env.production:
POSTGRES_PASSWORD=YOUR_SECURE_POSTGRES_PASSWORD_HERE
PGBOUNCER_ADMIN_PASSWORD=YOUR_SECURE_PGBOUNCER_PASSWORD_HERE
DATABASE_URL=postgresql://postgres:YOUR_SECURE_POSTGRES_PASSWORD_HERE@pgbouncer:5432/otomuhasebe_saas_db?pgbouncer=true&connection_limit=1
DIRECT_DATABASE_URL=postgresql://postgres:YOUR_SECURE_POSTGRES_PASSWORD_HERE@postgres:5432/otomuhasebe_saas_db
JWT_SECRET=YOUR_JWT_SECRET_HERE_MIN_64_CHARACTERS
MINIO_ROOT_USER=YOUR_MINIO_ADMIN_USER
MINIO_ROOT_PASSWORD=YOUR_MINIO_ADMIN_PASSWORD
NEXT_PUBLIC_API_URL=https://api.otomuhasebe.com
NEXT_PUBLIC_API_BASE_URL=https://api.otomuhasebe.com
CORS_ALLOWED_ORIGINS=https://api.otomuhasebe.com,https://panel.otomuhasebe.com
CADDY_DOMAIN=otomuhasebe.com
CADDY_ADMIN_EMAIL=admin@otomuhasebe.com
```

---

## 2. SETUP CONFIGURATION FILES

### Step 1: Copy Environment Template

```bash
# From project root
cp .env.production.example .env.production

# Edit with your favorite editor
nano .env.production
# OR
vim .env.production
# OR
code .env.production
```

### Step 2: Edit Environment Variables

Replace ALL placeholder values with actual production values.

**IMPORTANT:** 
- Use different passwords for each environment (dev/staging/prod)
- Use strong passwords (32+ chars, mixed case, numbers, symbols)
- Generate random JWT_SECRET (64+ characters)

### Step 3: Update pgBouncer userlist.txt

```bash
# Open userlist.txt
nano pgbouncer/userlist.txt
```

Replace `YOUR_MD5_HASH_HERE` with actual MD5 hash (see next section).

---

## 3. GENERATE MD5 HASH FOR PgBouncer

### ⚠️ CRITICAL: Passwords MUST be MD5 Hashed

PgBouncer will SILENTLY REJECT plain text passwords!

### Step 1: Generate MD5 Hash

```bash
# Format: echo -n "passwordUSERNAME" | md5sum
# Example for password "mypassword" and user "postgres":
echo -n "mypasswordpostgres" | md5sum

# Output example:
# 5e884898da28047151d0e56f8dc6292773603d  -
```

**IMPORTANT NOTES:**
- Use `-n` flag (NO newline at end!)
- Password comes FIRST, then username
- Copy the hash (everything before " -")

### Step 2: Update userlist.txt

```bash
# Edit pgbouncer/userlist.txt
nano pgbouncer/userlist.txt

# Replace:
"postgres" "YOUR_MD5_HASH_HERE"

# With your actual hash:
"postgres" "5e884898da28047151d0e56f8dc6292773603d"
```

### Step 3: Verify Hash

```bash
# Test connection to PgBouncer (after deployment)
docker compose exec pgbouncer psql -h localhost -p 5432 -U postgres -c "SELECT 1;"

# If successful, hash is correct
# If authentication failed, hash is incorrect
```

---

## 4. START PRODUCTION STACK

### Step 1: Build and Start All Services

```bash
# From project root
cd docker/compose

# Start production stack
docker compose -f docker-compose.prod.yml --env-file ../../.env.production up -d
```

This will:
1. Create 3 networks (frontend, backend, monitoring)
2. Create 5 volumes (postgres_data, redis_data, caddy_data, caddy_config, pgbouncer_logs)
3. Create MinIO bind mount directory: /opt/otomuhasebe/minio
4. Build backend and frontend images (if BACKEND_IMAGE/FRONTEND_IMAGE are empty)
5. Start 7 services (postgres, redis, minio, pgbouncer, backend, frontend, caddy)
6. Wait for all healthchecks to pass

### Step 2: Create MinIO Directory

```bash
# Create MinIO bind mount directory before starting
sudo mkdir -p /opt/otomuhasebe/minio
sudo chown -R $(whoami):$(whoami) /opt/otomuhasebe/minio
```

### Step 3: Monitor Startup Progress

```bash
# View logs for all services
docker compose -f docker-compose.prod.yml logs -f

# OR view logs for specific service
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f pgbouncer
docker compose -f docker-compose.prod.yml logs -f backend
```

### Step 3: Check Service Status

```bash
# Check if all services are healthy
docker compose -f docker-compose.prod.yml ps

# Expected output: All services should show "Up (healthy)"
```

**Startup Time:** ~3-5 minutes (depending on VPS resources)

---

## 5. RUN DATABASE MIGRATIONS

### ⚠️ CRITICAL: Use DIRECT_DATABASE_URL for Migrations

Migrations CANNOT run through PgBouncer!

### Step 1: Wait for All Services to Be Healthy

```bash
# Check health status
docker compose -f docker-compose.prod.yml ps

# Wait until all services show "Up (healthy)"
```

### Step 2: Run Migrations

```bash
# Run migrations on backend (uses DIRECT_DATABASE_URL)
docker compose -f docker-compose.prod.yml exec backend sh -c \
  'DATABASE_URL=$DIRECT_DATABASE_URL npx prisma migrate deploy --schema=./prisma/schema.prisma'

# OR with verbose output
docker compose -f docker-compose.prod.yml exec backend sh -c \
  'DATABASE_URL=$DIRECT_DATABASE_URL npx prisma migrate deploy --schema=./prisma/schema.prisma --verbose'
```

**What This Does:**
1. Overrides DATABASE_URL with DIRECT_DATABASE_URL (bypasses PgBouncer)
2. Connects to PostgreSQL directly
3. Applies pending migrations
4. Updates database schema
5. Returns success or error

**CRITICAL NOTE:** We use `sh -c` to override DATABASE_URL at runtime. Without this, migrations would go through PgBouncer and FAIL.

### Step 3: Verify Migrations

```bash
# Check migration status (uses DATABASE_URL via PgBouncer - OK for read-only)
docker compose -f docker-compose.prod.yml exec backend \
  npx prisma migrate status --schema=./prisma/schema.prisma

# Expected output: All migrations should be "Applied"
```

### ⚠️ Common Migration Issues

**Issue:** "relation already exists"  
**Solution:** Already migrated, skip this step

**Issue:** "connection refused"  
**Solution:** Check if PostgreSQL is healthy: `docker compose logs postgres`

**Issue:** "authentication failed"  
**Solution:** Check MD5 hash in userlist.txt

---

## 6. VERIFY DEPLOYMENT

### Step 1: Check Health Endpoints

```bash
# Backend health check
curl http://localhost:3020/api/health

# Frontend health check
curl http://localhost:3010/

# Caddy health check
curl http://localhost:80

# Expected output: All should return 200 OK
```

### Step 2: Verify PgBouncer is Working

```bash
# Connect to PgBouncer admin console
docker compose -f docker-compose.prod.yml exec pgbouncer psql \
  -h localhost -p 5432 -U postgres -c "SHOW STATS;"

# Expected output:
#   database: otomuhasebe
#   total: X (number of connections)
#   xact_count: Y (number of transactions)
```

```bash
# Check PgBouncer logs
docker compose -f docker-compose.prod.yml exec pgbouncer cat /var/log/pgbouncer/pgbouncer.log

# Expected: No authentication errors
```

### Step 3: Test MinIO Connection

```bash
# Check MinIO health
curl http://localhost:9000/minio/health/live

# Expected output: "OK"
```

```bash
# Check MinIO logs
docker compose -f docker-compose.prod.yml logs minio | tail -20

# Expected: No errors, bucket created
```

### Step 4: Test Redis Connection

```bash
# Test Redis connection
docker compose -f docker-compose.prod.yml exec redis redis-cli ping

# Expected output: "PONG"
```

### Step 5: Test External Access (from VPS)

```bash
# From VPS, test domain resolution
curl https://otomuhasebe.com

# Expected: Your frontend page
```

**From your local machine:**
```bash
# Test production domain
curl https://api.otomuhasebe.com/api/health
curl https://panel.otomuhasebe.com

# Expected: Should return health check / frontend page
```

---

## 7. CRITICAL WARNINGS

### ⚠️ THINGS THAT WILL BREAK IF MISCONFIGURED

#### 1. Plain Text Passwords in userlist.txt

**Symptom:** Backend containers show "authentication failed"  
**Cause:** PgBouncer silently rejects plain text passwords  
**Solution:** Generate MD5 hash and update userlist.txt

```bash
# WRONG (plain text):
"postgres" "mypassword"

# CORRECT (MD5 hashed):
"postgres" "5e884898da28047151d0e56f8dc6292773603d"
```

#### 2. Wrong PgBouncer Pool Mode

**Symptom:** Prisma $transaction() calls crash  
**Cause:** Using `transaction` or `statement` mode instead of `session`  
**Solution:** Ensure `pool_mode = session` in pgbouncer/pgbouncer.ini

```ini
# WRONG:
pool_mode = transaction

# WRONG:
pool_mode = statement

# CORRECT:
pool_mode = session
```

#### 3. Missing pgbouncer=true in DATABASE_URL

**Symptom:** Prisma connection pooling doesn't work  
**Cause:** DATABASE_URL doesn't include PgBouncer parameters  
**Solution:** Add `?pgbouncer=true&connection_limit=1`

```bash
# WRONG:
DATABASE_URL=postgresql://postgres:pass@pgbouncer:5432/otomuhasebe_saas_db

# CORRECT:
DATABASE_URL=postgresql://postgres:pass@pgbouncer:5432/otomuhasebe_saas_db?pgbouncer=true&connection_limit=1
```

#### 4. Using DATABASE_URL for Migrations

**Symptom:** Migration command fails with "prepared statement errors"  
**Cause:** Migrations running through PgBouncer instead of direct PostgreSQL  
**Solution:** Use DIRECT_DATABASE_URL for migrations

```bash
# WRONG:
docker compose exec backend npx prisma migrate deploy

# CORRECT:
docker compose exec backend npx prisma migrate deploy \
  --schema=./prisma/schema.prisma
# (uses DIRECT_DATABASE_URL from .env.production)
```

#### 5. Exposing Internal Services to Host

**Symptom:** Security risk, unauthorized access  
**Cause:** postgres/redis/pgbouncer exposing host ports  
**Solution:** Ensure only Caddy exposes 80/443

```yaml
# WRONG (postgres):
ports:
  - "5432:5432"

# CORRECT (postgres):
# NO ports section - internal only!
```

#### 6. Wrong MD5 Hash Format

**Symptom:** PgBouncer rejects connections silently  
**Cause:** Using wrong format for hash generation  
**Solution:** Use `echo -n "passwordUSERNAME" | md5sum`

```bash
# WRONG (has newline):
echo "passwordpostgres" | md5sum

# CORRECT (no newline):
echo -n "passwordpostgres" | md5sum
```

---

## 8. TROUBLESHOOTING

### Issue: Services Not Starting

**Symptom:** Docker compose ps shows "Starting" or "Exited"  
**Solution:**

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Common causes:
# - Port conflicts (80/443 already in use)
# - Memory/Disk full on VPS
# - Environment variables not set
```

### Issue: PgBouncer Authentication Failed

**Symptom:** Backend logs show "authentication failed"  
**Solution:**

```bash
# 1. Verify MD5 hash
echo -n "YOUR_PASSWORDpostgres" | md5sum

# 2. Update userlist.txt with correct hash
nano pgbouncer/userlist.txt

# 3. Restart PgBouncer
docker compose -f docker-compose.prod.yml restart pgbouncer

# 4. Check PgBouncer logs
docker compose -f docker-compose.prod.yml logs pgbouncer
```

### Issue: Migration Fails

**Symptom:** `prisma migrate deploy` fails  
**Solution:**

```bash
# 1. Check PostgreSQL is healthy
docker compose -f docker-compose.prod.yml ps postgres

# 2. Check DIRECT_DATABASE_URL is set
grep DIRECT_DATABASE_URL .env.production

# 3. Test direct connection (uses DIRECT_DATABASE_URL)
docker compose -f docker-compose.prod.yml exec backend \
  sh -c 'DATABASE_URL=$DIRECT_DATABASE_URL psql -c "SELECT 1;"'

# 4. Run migrations with verbose output (uses DIRECT_DATABASE_URL)
docker compose -f docker-compose.prod.yml exec backend \
  sh -c 'DATABASE_URL=$DIRECT_DATABASE_URL npx prisma migrate deploy --schema=./prisma/schema.prisma --verbose'
```

### Issue: MinIO Not Accessible

**Symptom:** Backend can't upload files to MinIO  
**Solution:**

```bash
# 1. Check MinIO health
docker compose -f docker-compose.prod.yml logs minio | tail -50

# 2. Verify MinIO credentials (NEW format)
grep MINIO_ROOT_USER .env.production
grep MINIO_ROOT_PASSWORD .env.production

# 3. Check MinIO region matches
grep MINIO_REGION .env.production
# Should match pgbouncer/pgbouncer.ini

# 4. Test MinIO connection from backend
docker compose -f docker-compose.prod.yml exec backend \
  curl http://minio:9000/minio/health/live
```

### Issue: Caddy SSL Certificate Not Issued

**Symptom:** Caddy shows "acme: waiting for http-01 challenge"  
**Solution:**

```bash
# 1. Check domain DNS points to VPS
dig otomuhasebe.com

# 2. Check ports 80/443 are open
sudo ufw status
# OR
sudo firewall-cmd --list-ports

# 3. Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy | tail -50

# 4. Check Caddyfile syntax
docker compose -f docker-compose.prod.yml exec caddy \
  caddy validate --config /etc/caddy/Caddyfile
```

### Issue: High CPU/Memory Usage

**Symptom:** VPS shows high resource usage  
**Solution:**

```bash
# 1. Check container resource usage
docker stats

# 2. Adjust PgBouncer pool size (if too many connections)
# Edit pgbouncer/pgbouncer.ini:
# default_pool_size = 10 (reduce from 20)

# 3. Restart PgBouncer
docker compose -f docker-compose.prod.yml restart pgbouncer

# 4. Consider upgrading VPS resources
# Minimum: 4 vCPU / 16 GB RAM
# Recommended: 8 vCPU / 32 GB RAM
```

---

## 📊 PRODUCTION MONITORING

### Daily Checks

```bash
# Check all services are healthy
docker compose -f docker-compose.prod.yml ps

# Check logs for errors
docker compose -f docker-compose.prod.yml logs --tail=100 | grep -i error

# Check disk space
df -h

# Check PostgreSQL connection count
docker compose -f docker-compose.prod.yml exec pgbouncer psql \
  -h localhost -p 5432 -U postgres -c "SHOW STATS;"
```

### Weekly Tasks

```bash
# Rotate logs (Docker handles this automatically with max-size/max-file)
# Verify log rotation:
docker compose -f docker-compose.prod.yml logs | wc -l

# Backup PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres otomuhasebe_saas_db > backup_$(date +%Y%m%d).sql

# Backup MinIO
tar -czf minio_backup_$(date +%Y%m%d).tar.gz /opt/otomuhasebe/minio

# Update system packages
sudo apt update && sudo apt upgrade -y
```

---

## 🆘 Emergency Recovery

### Restart All Services

```bash
cd docker/compose
docker compose -f docker-compose.prod.yml restart
```

### Rebuild and Restart

```bash
cd docker/compose
docker compose -f docker-compose.prod.yml up -d --build
```

### Stop All Services

```bash
cd docker/compose
docker compose -f docker-compose.prod.yml down
```

### Stop and Remove All Data (CAUTION!)

```bash
cd docker/compose
docker compose -f docker-compose.prod.yml down -v
# ⚠️ This will delete ALL data (volumes)!
```

---

## 📞 SUPPORT

For issues not covered in this guide:
1. Check Docker logs: `docker compose logs -f`
2. Check PgBouncer logs: `docker compose logs pgbouncer`
3. Check PostgreSQL logs: `docker compose logs postgres`
4. Review [README.dev.md](./README.dev.md) for dev-specific issues

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-13  
**Author:** Senior DevOps Architect