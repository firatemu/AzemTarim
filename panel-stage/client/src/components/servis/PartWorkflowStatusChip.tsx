'use client';

import React from 'react';
import { Chip } from '@mui/material';
import type { PartWorkflowStatus } from '@/types/servis';

const LABELS: Record<PartWorkflowStatus, string> = {
  NOT_STARTED: 'Henüz başlamadı',
  PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
  PARTS_PENDING: 'Parça bekleniyor',
  PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
  ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
};

const COLORS: Record<PartWorkflowStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  NOT_STARTED: 'default',
  PARTS_SUPPLIED_DIRECT: 'success',
  PARTS_PENDING: 'warning',
  PARTIALLY_SUPPLIED: 'info',
  ALL_PARTS_SUPPLIED: 'success',
};

interface PartWorkflowStatusChipProps {
  status: PartWorkflowStatus;
  size?: 'small' | 'medium';
}

export default function PartWorkflowStatusChip({ status, size = 'small' }: PartWorkflowStatusChipProps) {
  return (
    <Chip
      label={LABELS[status] ?? status}
      color={COLORS[status] ?? 'default'}
      size={size}
    />
  );
}
