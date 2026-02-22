-- Parça İş Akışı Durumları
CREATE TYPE "PartWorkflowStatus" AS ENUM (
  'NOT_STARTED',
  'PARTS_SUPPLIED_DIRECT',
  'PARTS_PENDING',
  'PARTIALLY_SUPPLIED',
  'ALL_PARTS_SUPPLIED'
);

-- Araç İş Akışı Durumları
CREATE TYPE "VehicleWorkflowStatus" AS ENUM (
  'WAITING',
  'IN_PROGRESS',
  'READY',
  'DELIVERED'
);

-- Add new workflow status columns to work_orders
ALTER TABLE "work_orders" ADD COLUMN "partWorkflowStatus" "PartWorkflowStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "work_orders" ADD COLUMN "vehicleWorkflowStatus" "VehicleWorkflowStatus" NOT NULL DEFAULT 'WAITING';
