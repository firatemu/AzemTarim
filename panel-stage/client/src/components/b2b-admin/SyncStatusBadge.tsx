'use client';

import { Chip, Tooltip } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SyncStatusBadgeProps {
  lastSyncedAt: Date | null;
  recordsProcessed?: number;
  recordsAdded?: number;
  recordsUpdated?: number;
  hasError?: boolean;
  size?: 'small' | 'medium';
}

export function SyncStatusBadge({
  lastSyncedAt,
  recordsProcessed = 0,
  recordsAdded = 0,
  recordsUpdated = 0,
  hasError = false,
  size = 'small',
}: SyncStatusBadgeProps) {
  if (!lastSyncedAt) {
    return (
      <Chip
        icon={<SyncProblemIcon />}
        label="Senkronize edilmemiş"
        color="default"
        size={size}
      />
    );
  }

  if (hasError) {
    return (
      <Chip
        icon={<SyncProblemIcon />}
        label="Hatalı"
        color="error"
        size={size}
      />
    );
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  };

  const tooltip = `Son senkronizasyon: ${formatTime(lastSyncedAt)}\nİşlenen: ${recordsProcessed}\nYeni: ${recordsAdded}\nGüncellenen: ${recordsUpdated}`;

  return (
    <Tooltip title={tooltip}>
      <Chip
        icon={<SyncIcon />}
        label={formatTime(lastSyncedAt)}
        color="success"
        size={size}
        sx={{ fontWeight: 500 }}
      />
    </Tooltip>
  );
}
