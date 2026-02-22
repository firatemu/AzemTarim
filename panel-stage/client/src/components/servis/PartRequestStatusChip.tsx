'use client';

import React from 'react';
import { Chip } from '@mui/material';
import type { PartRequestStatus } from '@/types/servis';

const STATUS_LABELS: Record<PartRequestStatus, string> = {
  REQUESTED: 'Talep Edildi',
  SUPPLIED: 'Tedarik Edildi',
  USED: 'Kullanıldı',
  CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<PartRequestStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  REQUESTED: 'info',
  SUPPLIED: 'warning',
  USED: 'success',
  CANCELLED: 'error',
};

interface PartRequestStatusChipProps {
  status: PartRequestStatus;
  size?: 'small' | 'medium';
}

export default function PartRequestStatusChip({ status, size = 'small' }: PartRequestStatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      color={STATUS_COLORS[status] ?? 'default'}
      size={size}
    />
  );
}
