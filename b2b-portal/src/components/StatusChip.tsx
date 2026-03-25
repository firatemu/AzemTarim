'use client';

import { Chip } from '@mui/material';

type B2BOrderStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPORTED_TO_ERP' | 'CANCELLED';

interface StatusChipProps {
  status: B2BOrderStatusType | string;
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { label: string; color: any }> = {
  PENDING: { label: 'Beklemede', color: 'warning' as const },
  APPROVED: { label: 'Onaylandı', color: 'info' as const },
  REJECTED: { label: 'Reddedildi', color: 'error' as const },
  EXPORTED_TO_ERP: { label: 'İşlem Alındı', color: 'success' as const },
  CANCELLED: { label: 'İptal', color: 'default' as const },
};

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status];

  if (!config) {
    return <Chip label={status} size={size} />;
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
}
