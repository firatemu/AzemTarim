# ───────────────────────────────────────────────────────────────────────────────────────
# Caddy Configuration for Monitoring Dashboard
# Oto Muhasebe SaaS Platform
# ═════════════════════════════════════════════════════════════
# Reverse proxy configuration for Grafana dashboard
# SSL termination via Let's Encrypt
# ───────────────────────────────────────────────────────────────────────────────────────

## CADDYFILE SNIPPET

Add the following block to your existing Caddyfile:

```caddy
# ───────────────────────────────────────────────────────────────────────────
# MONITORED SUBDOMAIN - Grafana Dashboard
# ───────────────────────────────────────────────────────────────────────────
# Access: https://monitor.otomuhasebe.com
# Service: Grafana (container: grafana:3000)
# SSL: Auto-generated via Let's Encrypt
# ───────────────────────────────────────────────────────────────────────────

monitor.otomuhasebe.com {
    # Reverse proxy to Grafana container
    reverse_proxy grafana:3000
    
    # Optional: Add headers for security
    # Uncomment these if needed
    header {
        # Enable HSTS (HTTP Strict Transport Security)
        # Strict-Transport-Security "max-age=31536000; includeSubDomains"
        
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        
        # XSS Protection
        X-XSS-Protection "1; mode=block"
        
        # Remove server header
        -Server
    }
    
    # Optional: Basic auth (additional security layer)
    # Uncomment to add basic auth (NOT required if Grafana auth is enabled)
    # basicauth {
    #     admin $2a$14$X... (generate with `caddy hash-password`)
    # }
}
```

---

## WHERE TO ADD THIS SNIPPET

### Option 1: Add to Existing Caddyfile

Open your existing Caddyfile:
```bash
nano docker/caddy/Caddyfile
```

Add the `monitor.otomuhasebe.com` block at the end of the file:
```caddy
# Existing blocks...
api.otomuhasebe.com {
    reverse_proxy backend:3020
}

panel.otomuhasebe.com {
    reverse_proxy frontend:3000
}

# ADD THIS BLOCK:
monitor.otomuhasebe.com {
    reverse_proxy grafana:3000
}
```

### Option 2: Create Separate Monitoring Caddyfile

Create a separate file for monitoring:
```bash
nano docker/caddy/Caddyfile.monitoring
```

Content:
```caddy
monitor.otomuhasebe.com {
    reverse_proxy grafana:3000
}
```

Then mount both Caddyfiles in docker-compose.prod.yml:
```yaml
caddy:
  image: caddy:2
  volumes:
    - ../caddy/Caddyfile:/etc/caddy/Caddyfile:ro
    - ../caddy/Caddyfile.monitoring:/etc/caddy/Caddyfile.monitoring:ro
    - caddy_data:/data
    - caddy_config:/config
```

---

## DNS REQUIREMENT

### A Record for Monitoring Subdomain

Before starting Caddy, create DNS record:

**Record Type:** A  
**Name:** monitor  
**Value:** [YOUR_VPS_IP_ADDRESS]  
**TTL:** 300 (or default)

**Example:**
```
Type: A
Name: monitor
Value: 1.2.3.4
TTL: 300
```

**Verification:**
```bash
# After DNS propagates (may take up to 24 hours)
dig monitor.otomuhasebe.com

# Should return your VPS IP address
```

### Subdomains

Monitoring subdomain structure:
- `monitor.otomuhasebe.com` → Grafana dashboard
- `api.otomuhasebe.com` → Backend API
- `panel.otomuhasebe.com` → Frontend panel

---

## PORT REQUIREMENTS

### Caddy Ports

Caddy already exposes ports 80 and 443 in docker-compose.prod.yml:
```yaml
caddy:
  ports:
    - "80:80"    # HTTP → redirects to HTTPS
    - "443:443"  # HTTPS → serves Grafana
```

**No additional port exposure required!** Grafana is accessed via Caddy reverse proxy.

### Grafana Port

Grafana runs on port 3000 inside Docker network, but is NOT exposed to host:
```yaml
grafana:
  # NO ports section - accessed via Caddy only
  # Port 3000 is internal only
```

---

## FIREWALL REQUIREMENTS

### Open Ports on VPS

Ensure ports 80 and 443 are open:
```bash
# For UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# For firewalld (RHEL/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

**No additional ports needed!** Monitoring stack is internal-only.

---

## SSL CERTIFICATE GENERATION

### Let's Encrypt Auto-Configuration

Caddy automatically generates SSL certificate for `monitor.otomuhasebe.com`:
1. DNS must point to VPS IP
2. Caddy must be running
3. Port 80 and 443 must be accessible from internet
4. Let's Encrypt will issue certificate automatically

**Certificate Location:**
```bash
# SSL certificates are stored in caddy_data volume
docker compose exec caddy ls -la /data/caddy/certificates
```

**Certificate Renewal:**
- Caddy automatically renews certificates 30 days before expiration
- No manual intervention required
- Certificates are persisted in caddy_data volume

---

## VERIFICATION

### Test DNS Resolution

```bash
# Test DNS resolution
dig monitor.otomuhasebe.com

# Should return your VPS IP
```

### Test HTTP to HTTPS Redirect

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://monitor.otomuhasebe.com

# Should return 301 or 308 redirect to HTTPS
```

### Test HTTPS Access

```bash
# Test HTTPS (should return Grafana login page)
curl -I https://monitor.otomuhasebe.com

# Should return 200 OK
```

### Access Grafana Web Interface

Open browser and navigate to:
```
https://monitor.otomuhasebe.com
```

Login with:
- Username: `admin` (or configured in .env.monitoring)
- Password: `CHANGE_ME_GRAFANA_ADMIN_PASSWORD` (from .env.monitoring)

---

## TROUBLESHOOTING

### Issue: Caddy Shows "waiting for http-01 challenge"

**Cause:** DNS not pointing to VPS IP  
**Solution:**
1. Check DNS record: `dig monitor.otomuhasebe.com`
2. Verify record points to correct IP
3. Wait for DNS propagation (up to 24 hours)
4. Check firewall: ports 80 and 443 open

### Issue: "502 Bad Gateway"

**Cause:** Grafana container not running or not accessible  
**Solution:**
1. Check Grafana status: `docker compose ps grafana`
2. Check Grafana logs: `docker compose logs grafana`
3. Check Caddy logs: `docker compose logs caddy`
4. Verify Grafana is healthy: `curl http://grafana:3000/api/health`

### Issue: "SSL certificate not found"

**Cause:** DNS not pointing to VPS or firewall blocking Let's Encrypt  
**Solution:**
1. Verify DNS: `dig monitor.otomuhasebe.com`
2. Check firewall: ports 80 and 443 open
3. Restart Caddy: `docker compose restart caddy`
4. Check Caddy logs: `docker compose logs caddy | tail -50`

### Issue: "Connection refused" to Grafana

**Cause:** Grafana not in frontend-network  
**Solution:**
1. Check docker-compose.monitoring.yml:
   ```yaml
   grafana:
     networks:
       - monitoring-network
       - frontend-network  # ← MUST be present!
   ```
2. Restart Grafana: `docker compose -f docker-compose.monitoring.yml restart grafana`

---

## SECURITY BEST PRACTICES

### 1. Enable HSTS

Add Strict-Transport-Security header:
```caddy
monitor.otomuhasebe.com {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
    reverse_proxy grafana:3000
}
```

### 2. Disable Basic Auth (Use Grafana Auth)

Grafana has built-in authentication. Don't add another layer:
```caddy
# DON'T DO THIS (unnecessary complexity):
# basicauth {
#     admin $2a$14$X...
# }
```

### 3. Monitor Access Logs

Check Caddy access logs regularly:
```bash
docker compose logs caddy | grep "monitor.otomuhasebe.com"
```

### 4. Restrict Access by IP (Optional)

If you want to restrict access to specific IPs:
```caddy
monitor.otomuhasebe.com {
    @allowed_ips remote_ip 1.2.3.4 5.6.7.8
    route @allowed_ips {
        reverse_proxy grafana:3000
    }
    respond "Access denied" 403
}
```

---

## SUMMARY

### Configuration Checklist

- [ ] DNS A record created: monitor.otomuhasebe.com → VPS IP
- [ ] Caddyfile updated with monitor.otomuhasebe.com block
- [ ] Ports 80 and 443 open on firewall
- [ ] .env.monitoring configured with GF_SERVER_ROOT_URL
- [ ] Grafana admin password changed from default
- [ ] DNS propagated (dig monitor.otomuhasebe.com returns VPS IP)

### Access URL

After deployment, access Grafana at:
```
https://monitor.otomuhasebe.com
```

### Login Credentials

- Username: `admin` (from .env.monitoring)
- Password: `CHANGE_ME_GRAFANA_ADMIN_PASSWORD` (from .env.monitoring)

---

## RESTART CADDY

After updating Caddyfile, restart Caddy:

```bash
cd docker/compose
docker compose restart caddy
```

Or reload Caddy without restarting:
```bash
docker compose exec caddy caddy reload
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-13  
**Author:** Senior DevOps Architect