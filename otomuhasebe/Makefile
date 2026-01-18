SHELL := /bin/bash

BASE = docker/compose/docker-compose.base.yml
STAGING = docker/compose/docker-compose.staging.yml
PROD = docker/compose/docker-compose.prod.yml
COMPOSE ?= docker compose

# Migration komutu (projene göre düzenle)
MIGRATE_CMD ?= npx prisma migrate deploy

# Prod image tag (örn: 1.0.0) – terminalde export IMAGE_TAG=1.0.0 yap
IMAGE_TAG ?= latest

# --- STAGING (local build) ---
up-staging:
	@echo "Starting staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) up -d --build

migrate-staging:
	@echo "Running database migrations (staging)..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) run --rm backend-staging $(MIGRATE_CMD)

logs-staging:
	@echo "Following logs from staging services..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) logs -f

down-staging:
	@echo "Stopping staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) down

# --- PRODUCTION (image pull) ---
pull-prod:
	IMAGE_TAG=\$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) pull

migrate-prod:
	IMAGE_TAG=\$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) run --rm backend $(MIGRATE_CMD)

up-prod:
	IMAGE_TAG=\$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) up -d

logs-prod:
	@echo "Following logs from production services..."
	$(COMPOSE) -f $(BASE) -f $(PROD) logs -f

down-prod:
	@echo "Stopping production environment..."
	$(COMPOSE) -f $(BASE) -f $(PROD) down

# --- BACKUP / RESTORE ---
BACKUP_DIR ?= backups
PG_USER ?= user
PG_DB ?= prod_db
PG_HOST ?= localhost
PG_PORT ?= 5432

backup-prod:
	mkdir -p $(BACKUP_DIR)
	pg_dump -Fc -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT) $(PG_DB) > $(BACKUP_DIR)/prod_\$(date +%F_%H%M).dump

# make restore-prod DUMP=backups/prod_YYYY-MM-DD_HHMM.dump
restore-prod:
	@if [ -z "$(DUMP)" ]; then echo "DUMP dosyası belirtilmeli: make restore-prod DUMP=backups/xxx.dump"; exit 1; fi
	pg_restore -c -d $(PG_DB) $(DUMP)

# --- FULL DEPLOY (önerilen sıra) ---
deploy-prod: pull-prod migrate-prod up-prod

.PHONY: up-staging migrate-staging logs-staging down-staging \
        pull-prod migrate-prod up-prod logs-prod down-prod \
        backup-prod restore-prod
