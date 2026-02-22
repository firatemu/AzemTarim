'use client';

import React from 'react';
import { Chip } from '@mui/material';
import type { WorkOrderStatus } from '@/types/servis';

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  WAITING_DIAGNOSIS: 'Beklemede',
  PENDING_APPROVAL: 'Müşteri Onayı Bekliyor',
  APPROVED_IN_PROGRESS: 'Yapım Aşamasında',
  PART_WAITING: 'Parça Bekliyor',
  PARTS_SUPPLIED: 'Parçalar Tedarik Edildi',
  VEHICLE_READY: 'Araç Hazır',
  INVOICED_CLOSED: 'Fatura Oluşturuldu',
  CLOSED_WITHOUT_INVOICE: 'Faturasız Kapandı',
  CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<WorkOrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  WAITING_DIAGNOSIS: 'info',
  PENDING_APPROVAL: 'warning',
  APPROVED_IN_PROGRESS: 'primary',
  PART_WAITING: 'warning',
  PARTS_SUPPLIED: 'info',
  VEHICLE_READY: 'info',
  INVOICED_CLOSED: 'success',
  CLOSED_WITHOUT_INVOICE: 'default',
  CANCELLED: 'error',
};

interface WorkOrderStatusChipProps {
  status: WorkOrderStatus;
  size?: 'small' | 'medium';
}

export default function WorkOrderStatusChip({ status, size = 'small' }: WorkOrderStatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      color={STATUS_COLORS[status] ?? 'default'}
      size={size}
    />
  );
}
