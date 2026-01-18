version: "3.9"

networks:
  app_net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  caddy_data:
    driver: local
  caddy_config:
    driver: local

services:
  postgres:
    image: postgres:16-alpine
    container_name: otomuhasebe-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready", "-U", "user"]
      interval: 5s
      timeout: 3s
      retries: 20

  redis:
    image: redis:7-alpine
    container_name: otomuhasebe-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ""
    volumes:
      - redis_data:/data
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  caddy:
    image: caddy:2
    container_name: otomuhasebe-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - app_net
    environment:
      - ACME_AGREE=true
    healthcheck:
      test: ["CMD", "wget", "-q", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
