'use client';

import { Chip } from '@mui/material';

type B2BOrderStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPORTED_TO_ERP' | 'CANCELLED';

interface StatusChipProps {
  status: B2BOrderStatusType | string;
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' | 'info' | 'secondary' }> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'info' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
  EXPORTED_TO_ERP: { label: 'ERP\'e Aktarıldı', color: 'success' },
  CANCELLED: { label: 'İptal', color: 'default' },
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
