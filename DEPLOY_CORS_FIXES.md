# CORS Fixes Deployment Guide

**Date:** 2026-01-13  
**Status:** READY FOR DEPLOYMENT

---

## OVERVIEW

This document provides step-by-step instructions to deploy CORS fixes across all environments.

## FIXES APPLIED

### 1. Backend (NestJS)

**Files Modified:**
- ✅ `/var/www/api-prod/server/src/main.ts`
- ✅ `/var/www/api-stage/server/src/main.ts`
- ✅ `/var/www/api-prod/server/ecosystem.config.js`

**Changes:**
- Fixed CORS callback to return `false` instead of Error object
- Added all localhost ports to CORS allowlist (3000, 3001, 3010, 3020, 3021)
- Added staging-api.otomuhasebe.com to production allowlist
- Updated allowed headers to include X-Request-ID
- Added maxAge: 86400 (24h) for preflight caching
- Added transformOptions.enableImplicitConversion: true to staging

### 2. Nginx (Reverse Proxy)

**Files Modified:**
- ✅ `/etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf`
- ✅ `/etc/nginx/sites-enabled/04-staging.otomuhasebe.com.conf`

**Changes:**
- Added explicit OPTIONS request handling
- Added CORS headers for preflight requests
- Added proxy_hide_header to prevent duplicate CORS headers
- Added proper HTTP origin handling

### 3. Configuration

**Files Created:**
- ✅ `/var/www/api-prod/server/.env.example` - Environment template
- ✅ `/var/www/api-prod/server/tools/cors-diagnostic.ts` - Diagnostic tool
- ✅ `/var/www/api-prod/server/CORS_FIX_REPORT.md` - Complete report
- ✅ `/var/www/api-prod/server/deploy-cors-fixes.sh` - Backend deployment script
- ✅ `/var/www/reload-nginx-cors.sh` - Nginx deployment script

---

## DEPLOYMENT STEPS

### STEP 1: Update Staging Ecosystem Config

The `/var/www/api-stage/server/ecosystem.config.js` file needs manual update.

**Run:**
```bash
sudo nano /var/www/api-stage/server/ecosystem.config.js
```

**Update CORS_ORIGINS to:**
```javascript
CORS_ORIGINS: 'https://staging.otomuhasebe.com,https://staging-api.otomuhasebe.com,http://localhost:3000,http://localhost:3001,http://localhost:3010,http://localhost:3020,http://localhost:3021,http://127.0.0.1:3000,http://127.0.0.1:3020,http://127.0.0.1:3021'
```

**Save and exit:** Ctrl+O, Enter, Ctrl+X

---

### STEP 2: Deploy Backend Fixes

**Run the automated deployment script:**
```bash
cd /var/www/api-prod/server
chmod +x deploy-cors-fixes.sh
./deploy-cors-fixes.sh
```

**What this does:**
1. Builds API production
2. Builds API staging
3. Restarts both services
4. Verifies services are online

**Expected output:**
```
========================================
  CORS FIXES DEPLOYMENT
========================================

Step 1/4: Building API Production
----------------------------------------
✓ API Production built successfully

Step 2/4: Building API Staging
----------------------------------------
✓ API Staging built successfully

Step 3/4: Restarting Backend Services
----------------------------------------
Restarting api-prod...
✓ API Production restarted
Restarting api-stage...
✓ API Staging restarted

Step 4/4: Checking Service Status
----------------------------------------
✓ API Production is online
✓ API Staging is online

========================================
  DEPLOYMENT COMPLETE
========================================
```

---

### STEP 3: Deploy Nginx Fixes

**Run the automated Nginx script:**
```bash
chmod +x /var/www/reload-nginx-cors.sh
/var/www/reload-nginx-cors.sh
```

**What this does:**
1. Tests Nginx configuration
2. Reloads Nginx service
3. Verifies configuration is valid

**Expected output:**
```
========================================
  NGINX CORS FIXES DEPLOYMENT
========================================

Step 1/2: Testing Nginx Configuration
----------------------------------------
✓ Nginx configuration is valid

Step 2/2: Reloading Nginx
----------------------------------------
Reloading Nginx service...
✓ Nginx reloaded successfully

========================================
  DEPLOYMENT COMPLETE
========================================
```

---

## VERIFICATION

### TEST 1: Run Diagnostic Script

**From backend directory:**
```bash
cd /var/www/api-prod/server
npx ts-node tools/cors-diagnostic.ts
```

**What to look for:**
- ✓ Successful OPTIONS requests (Status 204)
- ✓ Successful GET/POST requests (Status 200)
- ✓ Proper CORS headers in responses
- ✗ No CORS errors for allowed origins

### TEST 2: Browser Testing

**Open Chrome DevTools and test:**

1. **Staging Environment:**
   - Navigate to: https://staging.otomuhasebe.com
   - Open Console tab (F12)
   - Check for: No "Access to XMLHttpRequest at..." errors
   - Open Network tab
   - Find an API request (e.g., /cari)
   - Click to view headers
   - Verify: `Access-Control-Allow-Origin: https://staging.otomuhasebe.com`

2. **Production Environment:**
   - Navigate to: https://panel.otomuhasebe.com
   - Repeat the same checks

3. **Test Preflight:**
   - Open Console tab
   - Run:
     ```javascript
     fetch('/api/cari', {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     })
       .then(r => console.log('✓ CORS OK', r.status))
       .catch(e => console.error('✗ CORS Error', e));
     ```
   - Expected: Status 200 or 401 (auth), no CORS error

### TEST 3: Network Tab Verification

**In Chrome DevTools Network tab:**

1. Find an API request (red or green dot)
2. Click on it
3. Go to **Headers** tab
4. Verify CORS headers:
   ```
   Access-Control-Allow-Origin: https://staging.otomuhasebe.com
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, X-Tenant-Id, X-Request-ID
   Access-Control-Max-Age: 86400
   ```

---

## EXPECTED RESULTS

### Before Fixes:
- ❌ CORS errors: "Access to XMLHttpRequest at '...' has been blocked by CORS policy"
- ❌ Preflight requests: 404 or timeout
- ❌ CORS errors logged as 500 instead of 403
- ❌ Missing CORS headers in responses

### After Fixes:
- ✅ No CORS errors in browser console
- ✅ Preflight requests: Status 204 (immediate)
- ✅ CORS properly rejected: Status 403 for disallowed origins
- ✅ Proper CORS headers in all responses
- ✅ Fast preflight (24h cache reduces OPTIONS requests)

---

## TROUBLESHOOTING

### ISSUE: Still Seeing CORS Errors

**Check:**
```bash
# 1. Verify backend services are running
pm2 status

# Expected:
# online: api-prod, api-stage

# If not running:
pm2 restart api-prod
pm2 restart api-stage

# 2. Verify Nginx is running
sudo systemctl status nginx

# If not running:
sudo systemctl start nginx

# 3. Check Nginx configuration
sudo nginx -t

# If errors:
# Review /etc/nginx/sites-enabled/*.conf files
```

### ISSUE: Preflight Requests Still Failing

**Check:**
```bash
# 1. Verify Nginx config includes OPTIONS handling
grep -A 10 "if.*request_method.*OPTIONS" /etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf

# Expected: Should find CORS headers block

# 2. Reload Nginx
sudo systemctl reload nginx

# 3. Check Nginx error logs
sudo tail -f /var/log/nginx/staging-error.log
```

### ISSUE: CORS Works But Auth Fails

**Check:**
```javascript
// In browser console, verify token:
localStorage.getItem('accessToken')

// Expected: JWT string (not null/undefined)

// If missing, user needs to log in again
```

### ISSUE: Local Development CORS Failures

**Check:**
```bash
# 1. Verify localhost ports in CORS allowlist
# Backend should include:
# - http://localhost:3020
# - http://localhost:3021
# - http://127.0.0.1:3020
# - http://127.0.0.1:3021

# 2. Restart backend with new config
pm2 restart api-prod  # or api-stage
```

---

## LOGGING

### Backend Logs

**Production:**
```bash
pm2 logs api-prod --lines 100
```

**Staging:**
```bash
pm2 logs api-stage --lines 100
```

### Nginx Logs

**Staging:**
```bash
sudo tail -f /var/log/nginx/staging-access.log
sudo tail -f /var/log/nginx/staging-error.log
```

**Production:**
```bash
sudo tail -f /var/log/nginx/api-prod-access.log
sudo tail -f /var/log/nginx/api-prod-error.log
```

---

## ROLLBACK

If something goes wrong, you can rollback:

### Rollback Backend:
```bash
cd /var/www/api-prod/server
git checkout src/main.ts
npm run build
pm2 restart api-prod

cd /var/www/api-stage/server
git checkout src/main.ts
npm run build
pm2 restart api-stage
```

### Rollback Nginx:
```bash
# Keep backup of current configs
sudo cp /etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf /etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf.backup

# Rollback from Git
sudo git checkout /etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf
sudo git checkout /etc/nginx/sites-enabled/04-staging.otomuhasebe.com.conf

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## MONITORING POST-DEPLOYMENT

### Key Metrics to Watch:

1. **CORS Errors:**
   - Should be 0 for allowed origins
   - Should be 403 for disallowed origins (expected)

2. **Preflight Requests:**
   - Should return 204
   - Should be cached (reduce frequency)

3. **Response Time:**
   - Preflight: < 100ms (immediate response)
   - GET/POST: Normal (no CORS overhead)

4. **Browser Console:**
   - No CORS errors
   - Only auth/normal errors (expected)

---

## SUPPORT

If you encounter issues:

1. Check this deployment guide
2. Run diagnostic script
3. Check logs
4. Review CORS_FIX_REPORT.md
5. Verify environment variables

---

**Deployment Status:** ✅ READY  
**Last Updated:** 2026-01-13  
**Version:** 1.0
