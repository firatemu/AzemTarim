-- CreateTable
CREATE TABLE "system_parameters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_parameters_tenant_id_key_key" ON "system_parameters"("tenant_id", "key");

-- CreateIndex
CREATE INDEX "system_parameters_tenant_id_idx" ON "system_parameters"("tenant_id");

-- CreateIndex
CREATE INDEX "system_parameters_category_idx" ON "system_parameters"("category");

-- AddForeignKey
ALTER TABLE "system_parameters" ADD CONSTRAINT "system_parameters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
