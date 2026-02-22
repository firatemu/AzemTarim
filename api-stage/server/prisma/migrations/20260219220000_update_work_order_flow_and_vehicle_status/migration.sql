-- Add VehicleServiceStatus enum for araç servis durumu
CREATE TYPE "VehicleServiceStatus" AS ENUM (
  'MUSTERI_ONAYI_BEKLIYOR',
  'YAPIM_ASAMASINDA',
  'PARCA_BEKLIYOR',
  'ARAC_HAZIR',
  'TAMAMLANDI'
);

-- Add servisDurum to customer_vehicles
ALTER TABLE "customer_vehicles" ADD COLUMN "servisDurum" "VehicleServiceStatus";

-- Change work order default status to PENDING_APPROVAL (ilk aşama müşteri onayı)
ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';

-- Add serviceInvoiceId to tahsilat for work order payments (biten iş emirlerinin tahsilatı)
ALTER TABLE "tahsilatlar" ADD COLUMN "serviceInvoiceId" TEXT;
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_serviceInvoiceId_fkey"
  FOREIGN KEY ("serviceInvoiceId") REFERENCES "service_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "tahsilatlar_serviceInvoiceId_idx" ON "tahsilatlar"("serviceInvoiceId");
