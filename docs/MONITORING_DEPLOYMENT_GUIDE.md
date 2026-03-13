# 🚀 Monitoring Stack Deployment Guide
# Oto Muhasebe SaaS Platform

**Last Updated:** 2026-03-13

---

## 📋 CONTENTS

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Setup Configuration Files](#2-setup-configuration-files)
3. [Configure Caddy](#3-configure-caddy)
4. [Start Monitoring Stack](#4-start-monitoring-stack)
5. [Verify Services](#5-verify-services)
6. [Import Grafana Dashboards](#6-import-grafana-dashboards)
7. [Known Issues](#7-known-issues)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. PRE-DEPLOYMENT CHECKLIST

### ✅ Required Actions Before Deployment

- [ ] Copy `.env.monitoring.example` to `.env.monitoring`
- [ ] Replace ALL placeholder passwords with strong random passwords
- [ ] Create DNS A record: monitor.otomuhasebe.com → VPS IP
- [ ] Update Caddyfile with monitor.otomuhasebe.com block
- [ ] Update `GF_SECURITY_ADMIN_PASSWORD` in .env.monitoring
- [ ] Update `DATA_SOURCE_NAME` with actual PostgreSQL password
- [ ] Update `REDIS_PASSWORD` with actual Redis password
- [ ] Ensure production stack is running (docker-compose.prod.yml)
- [ ] Ensure ports 80 and 443 are open on firewall
- [ ] Verify DNS propagation: dig monitor.otomuhasebe.com

### 📝 Environment Variables to Replace

```bash
# Replace these in .env.monitoring:
GF_SECURITY_ADMIN_PASSWORD=CHANGE_ME_GRAFANA_ADMIN_PASSWORD
DATA_SOURCE_NAME=postgresql://postgres:PASSWORD@postgres:5432/otomuhasebe_saas_db?sslmode=disable
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD
GF_SERVER_ROOT_URL=https://monitor.otomuhasebe.com
GF_SERVER_DOMAIN=monitor.otomuhasebe.com
```

---

## 2. SETUP CONFIGURATION FILES

### Step 1: Copy Environment Template

```bash
# From project root
cp .env.monitoring.example .env.monitoring

# Edit with your favorite editor
nano .env.monitoring
# OR
vim .env.monitoring
# OR
code .env.monitoring
```

### Step 2: Edit Environment Variables

Replace ALL placeholder values with actual production values.

**IMPORTANT:**
- Use strong passwords (32+ chars, mixed case, numbers, symbols)
- Grafana admin password MUST be different from production
- Postgres password MUST match .env.production
- Redis password MUST match .env.production

### Step 3: Update Caddyfile

Add monitoring subdomain to Caddyfile (see [CADDY_MONITORING_CONFIG.md](./CADDY_MONITORING_CONFIG.md) for details).

**Quick add:**
```bash
nano docker/caddy/Caddyfile

# Add at the end:
monitor.otomuhasebe.com {
    reverse_proxy grafana:3000
}
```

### Step 4: Restart Caddy

```bash
cd docker/compose
docker compose restart caddy
```

---

## 3. CONFIGURE CADDY

### Step 1: Add Monitoring Subdomain

Edit Caddyfile:
```bash
nano docker/caddy/Caddyfile
```

Add this block:
```caddy
monitor.otomuhasebe.com {
    reverse_proxy grafana:3000
}
```

### Step 2: Restart Caddy

```bash
cd docker/compose
docker compose restart caddy
```

### Step 3: Verify DNS

```bash
# Check DNS resolution
dig monitor.otomuhasebe.com

# Should return your VPS IP address
```

**If DNS not propagated:**
- Wait up to 24 hours for DNS propagation
- Check DNS record in your DNS provider
- Use `dig +short monitor.otomuhasebe.com` to check

---

## 4. START MONITORING STACK

### Step 1: Start All Services

```bash
cd docker/compose

# Start production stack first (if not running)
docker compose -f docker-compose.prod.yml --env-file ../../.env.production up -d

# Start monitoring stack alongside production
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.monitoring.yml \
  --env-file ../../.env.production \
  --env-file ../../.env.monitoring \
  up -d
```

**What This Does:**
1. Creates 5 monitoring services (prometheus, grafana, node-exporter, postgres-exporter, redis-exporter)
2. Connects to existing networks (monitoring-network, frontend-network, backend-network)
3. Starts all services with healthchecks
4. Waits for dependencies to be healthy

### Step 2: Monitor Startup Progress

```bash
# View logs for all monitoring services
docker compose -f docker-compose.monitoring.yml logs -f

# OR view logs for specific service
docker compose -f docker-compose.monitoring.yml logs -f prometheus
docker compose -f docker-compose.monitoring.yml logs -f grafana
docker compose -f docker-compose.monitoring.yml logs -f node-exporter
```

### Step 3: Check Service Status

```bash
# Check if all services are healthy
docker compose -f docker-compose.monitoring.yml ps

# Expected output: All services should show "Up (healthy)"
```

**Startup Time:** ~2-3 minutes (depending on VPS resources)

---

## 5. VERIFY SERVICES

### Step 1: Verify Prometheus

```bash
# Check Prometheus health endpoint
docker compose -f docker-compose.monitoring.yml exec prometheus \
  wget -q --spider http://localhost:9090/-/healthy

# Expected output: No errors (exit code 0)
```

### Step 2: Verify Grafana

```bash
# Check Grafana health endpoint
docker compose -f docker-compose.monitoring.yml exec grafana \
  wget -q --spider http://localhost:3000/api/health

# Expected output: No errors (exit code 0)
```

### Step 3: Verify Node Exporter

```bash
# Check node-exporter metrics
docker compose -f docker-compose.monitoring.yml exec node-exporter \
  wget -q -O - http://localhost:9100/metrics | head -20

# Expected output: Metrics in Prometheus format
# Example: node_cpu_seconds_total{cpu="0",mode="idle"} 12345.6
```

### Step 4: Verify Postgres Exporter

```bash
# Check postgres-exporter metrics
docker compose -f docker-compose.monitoring.yml exec postgres-exporter \
  wget -q -O - http://localhost:9187/metrics | head -20

# Expected output: Metrics in Prometheus format
# Example: pg_stat_database{datname="otomuhasebe_saas_db"} 1
```

### Step 5: Verify Redis Exporter

```bash
# Check redis-exporter metrics
docker compose -f docker-compose.monitoring.yml exec redis-exporter \
  wget -q -O - http://localhost:9121/metrics | head -20

# Expected output: Metrics in Prometheus format
# Example: redis_connected_clients{addr="redis:6379"} 5
```

### Step 6: Verify Prometheus Targets

```bash
# Check Prometheus health (internal container access)
docker compose -f docker-compose.monitoring.yml exec prometheus \
  wget -q -O - http://localhost:9090/api/v1/targets | head -50

# Expected output: JSON with target status
# All targets should show "health": "up"
```

**Note:** To view targets in browser, access Grafana → Explore → select Prometheus datasource → query `up`

### Step 7: Access Grafana Web Interface

```bash
# From VPS, test Grafana access
curl -I https://monitor.otomuhasebe.com

# Expected output: 200 OK
```

**From your local machine:**
```bash
# Test production domain
curl -I https://monitor.otomuhasebe.com

# Expected output: 200 OK
```

**Open in browser:**
```
https://monitor.otomuhasebe.com
```

Login with:
- Username: `admin` (from .env.monitoring)
- Password: `CHANGE_ME_GRAFANA_ADMIN_PASSWORD` (from .env.monitoring)

---

## 6. IMPORT GRAFANA DASHBOARDS

### Step 1: Import Node Exporter Dashboard

1. Login to Grafana: https://monitor.otomuhasebe.com
2. Click "+" → "Import"
3. Enter "1860" in "Import via grafana.com"
4. Click "Load"
5. Select "Prometheus" as datasource
6. Click "Import"

**Dashboard Info:**
- ID: 1860
- Name: Node Exporter Full
- Description: Comprehensive VPS system metrics

### Step 2: Import PostgreSQL Dashboard

1. Login to Grafana: https://monitor.otomuhasebe.com
2. Click "+" → "Import"
3. Enter "9628" in "Import via grafana.com"
4. Click "Load"
5. Select "Prometheus" as datasource
6. Click "Import"

**Dashboard Info:**
- ID: 9628
- Name: PostgreSQL Overview
- Description: PostgreSQL database performance metrics

### Step 3: Import Redis Dashboard

1. Login to Grafana: https://monitor.otomuhasebe.com
2. Click "+" → "Import"
3. Enter "11835" in "Import via grafana.com"
4. Click "Load"
5. Select "Prometheus" as datasource
6. Click "Import"

**Dashboard Info:**
- ID: 11835
- Name: Redis Dashboard
- Description: Redis cache performance metrics

### Step 4: Organize Dashboards

1. Click "Dashboards" → "Manage"
2. Create folders: "System", "Database", "Cache"
3. Move dashboards to appropriate folders

---

## 7. KNOWN ISSUES

### ⚠️ Silent Failures (No Error Logs)

#### 1. Postgres-exporter pointing to PgBouncer

**Symptom:**
- Postgres-exporter logs show "connection refused" or no metrics
- Prometheus shows postgres target as "DOWN"
- No error in docker logs

**Cause:**
- `DATA_SOURCE_NAME` points to `pgbouncer:5432` instead of `postgres:5432`
- PgBouncer doesn't support PostgreSQL metrics protocol

**Solution:**
```bash
# Edit .env.monitoring
nano .env.monitoring

# WRONG (points to PgBouncer):
DATA_SOURCE_NAME=postgresql://postgres:password@pgbouncer:5432/otomuhasebe_saas_db?sslmode=disable

# CORRECT (points to PostgreSQL):
DATA_SOURCE_NAME=postgresql://postgres:password@postgres:5432/otomuhasebe_saas_db?sslmode=disable

# Restart postgres-exporter
docker compose -f docker-compose.monitoring.yml restart postgres-exporter
```

#### 2. NestJS /metrics endpoint not implemented

**Symptom:**
- Prometheus shows backend target as "DOWN"
- No error in docker logs
- Backend health check passes

**Cause:**
- NestJS doesn't have `@willsoto/nestjs-prometheus` installed
- /metrics endpoint is not exposed

**Solution:**
```bash
# Option 1: Install nestjs-prometheus (recommended)
cd api-stage/server
npm install @willsoto/nestjs-prometheus

# Add to main.ts:
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}

# Rebuild and restart backend

# Option 2: Comment out backend job in prometheus.yml
nano monitoring/prometheus.yml

# Comment out or remove:
# - job_name: 'backend'
#   static_configs:
#     - targets: ['backend:3020']
```

#### 3. DNS not set before Caddy starts

**Symptom:**
- Caddy shows "waiting for http-01 challenge"
- Grafana accessible via IP but not domain
- Let's Encrypt certificate not issued

**Cause:**
- DNS A record not created or not propagated
- monitor.otomuhasebe.com doesn't point to VPS IP

**Solution:**
```bash
# Check DNS resolution
dig monitor.otomuhasebe.com

# If not pointing to VPS IP:
# 1. Create DNS A record in your DNS provider
# 2. Wait for DNS propagation (up to 24 hours)
# 3. Restart Caddy
docker compose restart caddy

# 4. Check Caddy logs
docker compose logs caddy | grep "monitor.otomuhasebe.com"
```

#### 4. Grafana anonymous access not disabled

**Symptom:**
- Public can view dashboards without login
- No prompt for username/password

**Cause:**
- `GF_AUTH_ANONYMOUS_ENABLED=true` in .env.monitoring
- Security misconfiguration

**Solution:**
```bash
# Edit .env.monitoring
nano .env.monitoring

# WRONG (anonymous access enabled):
GF_AUTH_ANONYMOUS_ENABLED=true

# CORRECT (anonymous access disabled):
GF_AUTH_ANONYMOUS_ENABLED=false

# Restart Grafana
docker compose -f docker-compose.monitoring.yml restart grafana
```

---

## 8. TROUBLESHOOTING

### Issue: Services Not Starting

**Symptom:** Docker compose ps shows "Starting" or "Exited"  
**Solution:**

```bash
# Check logs
docker compose -f docker-compose.monitoring.yml logs

# Common causes:
# - Production stack not running
# - Environment variables not set
# - Networks not created
```

### Issue: Prometheus Shows No Targets

**Symptom:** Prometheus targets page is empty  
**Solution:**

```bash
# Check Prometheus config
docker compose -f docker-compose.monitoring.yml exec prometheus \
  cat /etc/prometheus/prometheus.yml

# Check Prometheus logs
docker compose -f docker-compose.monitoring.yml logs prometheus | tail -50

# Reload Prometheus config
docker compose -f docker-compose.monitoring.yml exec prometheus \
  wget --post-data='' http://localhost:9090/-/reload
```

### Issue: Grafana Cannot Connect to Prometheus

**Symptom:** Grafana shows "Datasource not found"  
**Solution:**

```bash
# Check datasource config
docker compose -f docker-compose.monitoring.yml exec grafana \
  cat /etc/grafana/provisioning/datasources/prometheus.yml

# Check Grafana logs
docker compose -f docker-compose.monitoring.yml logs grafana | tail -50

# Verify Prometheus is accessible from Grafana
docker compose -f docker-compose.monitoring.yml exec grafana \
  wget -q --spider http://prometheus:9090/-/healthy
```

### Issue: Exporters Not Scraping Metrics

**Symptom:** Prometheus shows exporters as "DOWN"  
**Solution:**

```bash
# Check exporter health
docker compose -f docker-compose.monitoring.yml exec node-exporter \
  wget -q --spider http://localhost:9100/metrics

# Check exporter logs
docker compose -f docker-compose.monitoring.yml logs node-exporter

# Check Prometheus targets (via Grafana)
# Access Grafana → Explore → select Prometheus → query: up{job="node"}
# Or check targets page in Grafana: Configuration → Data Sources → Prometheus → Test
```

### Issue: High Resource Usage

**Symptom:** VPS shows high CPU/memory usage  
**Solution:**

```bash
# Check container resource usage
docker stats

# Adjust scrape interval (reduce from 15s to 30s)
nano monitoring/prometheus.yml

# Change:
# scrape_interval: 30s

# Restart Prometheus
docker compose -f docker-compose.monitoring.yml restart prometheus
```

---

## 📊 PRODUCTION MONITORING

### Daily Checks

```bash
# Check all services are healthy
docker compose -f docker-compose.monitoring.yml ps

# Check Prometheus targets (via Grafana)
# Access Grafana → Explore → select Prometheus → query: up
# Or check targets in Grafana: Configuration → Data Sources → Prometheus → Test

# Check Grafana logs
docker compose -f docker-compose.monitoring.yml logs grafana --tail=100 | grep -i error
```

### Weekly Tasks

```bash
# Check disk space for monitoring volumes
docker volume inspect monitoring_prometheus_data
docker volume inspect monitoring_grafana_data

# Review Grafana dashboards for anomalies
# Login to Grafana and check dashboards

# Rotate logs (Docker handles this automatically)
# Verify log rotation:
docker compose -f docker-compose.monitoring.yml logs | wc -l
```

---

## 🆘 EMERGENCY RECOVERY

### Restart All Monitoring Services

```bash
cd docker/compose
docker compose -f docker-compose.monitoring.yml restart
```

### Rebuild and Restart

```bash
cd docker/compose
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.monitoring.yml \
  --env-file ../../.env.production \
  --env-file ../../.env.monitoring \
  up -d --build
```

### Stop All Monitoring Services

```bash
cd docker/compose
docker compose -f docker-compose.monitoring.yml down
```

### Stop and Remove All Data (CAUTION!)

```bash
cd docker/compose
docker compose -f docker-compose.monitoring.yml down -v
# ⚠️ This will delete ALL monitoring data (volumes)!
```

---

## 📞 SUPPORT

For issues not covered in this guide:
1. Check Docker logs: `docker compose -f docker-compose.monitoring.yml logs -f`
2. Check Prometheus logs: `docker compose -f docker-compose.monitoring.yml logs prometheus`
3. Check Grafana logs: `docker compose -f docker-compose.monitoring.yml logs grafana`
4. Review [CADDY_MONITORING_CONFIG.md](./CADDY_MONITORING_CONFIG.md) for Caddy issues

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-13  
**Author:** Senior DevOps Architect