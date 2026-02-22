// Servis Modülü - Araç Servis Yönetimi Tipleri

export type WorkOrderStatus =
  | 'WAITING_DIAGNOSIS'
  | 'PENDING_APPROVAL'
  | 'APPROVED_IN_PROGRESS'
  | 'PART_WAITING'
  | 'PARTS_SUPPLIED'
  | 'VEHICLE_READY'
  | 'INVOICED_CLOSED'
  | 'CLOSED_WITHOUT_INVOICE'
  | 'CANCELLED';

export type PartWorkflowStatus =
  | 'NOT_STARTED'
  | 'PARTS_SUPPLIED_DIRECT'
  | 'PARTS_PENDING'
  | 'PARTIALLY_SUPPLIED'
  | 'ALL_PARTS_SUPPLIED';

export type VehicleWorkflowStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED';

export type PartRequestStatus = 'REQUESTED' | 'SUPPLIED' | 'USED' | 'CANCELLED';

export type WorkOrderItemType = 'LABOR' | 'PART';

export interface CariRef {
  id: string;
  cariKodu?: string;
  unvan?: string;
}

export interface StokRef {
  id: string;
  stokKodu?: string;
  stokAdi?: string;
}

export interface UserRef {
  id: string;
  fullName?: string;
  email?: string;
}

export interface CustomerVehicle {
  id: string;
  tenantId?: string | null;
  cariId: string;
  plaka: string;
  saseno?: string | null;
  yil?: number | null;
  km?: number | null;
  aracMarka: string;
  aracModel: string;
  aracMotorHacmi?: string | null;
  aracYakitTipi?: string | null;
  ruhsatNo?: string | null;
  tescilTarihi?: string | null;
  ruhsatSahibi?: string | null;
  motorGucu?: number | null;
  sanziman?: string | null;
  renk?: string | null;
  aciklama?: string | null;
  ruhsatPhotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  cari?: CariRef;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  type: WorkOrderItemType;
  description: string;
  stokId?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  totalPrice: number;
  stok?: StokRef;
}

export interface PartRequest {
  id: string;
  workOrderId: string;
  description: string;
  stokId?: string | null;
  requestedQty: number;
  suppliedQty?: number | null;
  status: PartRequestStatus;
  stok?: StokRef;
  requestedByUser?: UserRef;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  tenantId?: string | null;
  status: WorkOrderStatus;
  partWorkflowStatus?: PartWorkflowStatus;
  vehicleWorkflowStatus?: VehicleWorkflowStatus;
  customerVehicleId: string;
  cariId: string;
  technicianId?: string | null;
  description?: string | null;
  diagnosisNotes?: string | null;
  supplyResponseNotes?: string | null;
  estimatedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  totalLaborCost: number;
  totalPartsCost: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  customerVehicle?: CustomerVehicle;
  cari?: CariRef;
  technician?: UserRef;
  items?: WorkOrderItem[];
  partRequests?: PartRequest[];
  serviceInvoice?: ServiceInvoice | null;
}

export interface ServiceInvoice {
  id: string;
  invoiceNo: string;
  workOrderId: string;
  cariId: string;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  dovizCinsi: string;
  workOrder?: WorkOrder;
  cari?: CariRef;
  journalEntry?: JournalEntry | null;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string | null;
}

export interface JournalEntry {
  id: string;
  referenceType: string;
  referenceId: string;
  entryDate: string;
  description?: string | null;
  lines?: JournalEntryLine[];
}

// DTO types for create/update
export interface CreateCustomerVehicleDto {
  cariId: string;
  plaka: string;
  saseno?: string;
  yil?: number;
  km?: number;
  aracMarka: string;
  aracModel: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
  ruhsatNo?: string;
  tescilTarihi?: string;
  ruhsatSahibi?: string;
  motorGucu?: number;
  sanziman?: string;
  renk?: string;
  aciklama?: string;
  ruhsatPhotoUrl?: string;
}

export interface UpdateCustomerVehicleDto extends Partial<CreateCustomerVehicleDto> {}

export interface CreateWorkOrderDto {
  customerVehicleId: string;
  cariId: string;
  technicianId?: string;
  description?: string;
  estimatedCompletionDate?: string;
}

export interface CreateWorkOrderItemDto {
  workOrderId: string;
  type: WorkOrderItemType;
  description: string;
  stokId?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface CreatePartRequestDto {
  workOrderId: string;
  description: string;
  stokId?: string;
  requestedQty: number;
}
