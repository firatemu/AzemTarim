'use client';

import { Badge, BadgeProps, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type RiskStatus = 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';

interface RiskBadgeProps {
  status: RiskStatus;
  showLabel?: boolean;
}

const riskConfig: Record<RiskStatus, { label: string; color: BadgeProps['color']; tooltip: string }> = {
  OK: { label: 'Risk Yok', color: 'success', tooltip: 'Müşteri risk durumu normal' },
  OVER_LIMIT: { label: 'Limit Aşımı', color: 'warning', tooltip: 'Kredi limiti aşıldı' },
  OVERDUE: { label: 'Vadesi Geçmiş', color: 'error', tooltip: 'Vadesi geçmiş fatura bulunuyor' },
  BLOCKED: { label: 'Riskli', color: 'error', tooltip: 'Sipariş girişi engellendi' },
};

export function RiskBadge({ status, showLabel = true }: RiskBadgeProps) {
  const config = riskConfig[status];

  if (!config) {
    return null;
  }

  if (!showLabel) {
    return (
      <Tooltip title={config.tooltip}>
        <span>
          {status === 'OK' ? (
            <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
          ) : (
            <WarningIcon fontSize="small" sx={{ color: config.color === 'success' ? 'success.main' : 'error.main' }} />
          )}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={config.tooltip}>
      <Badge
        badgeContent={config.label}
        color={config.color}
        sx={{
          '& .MuiBadge-badge': {
            fontWeight: 600,
            px: 1,
          },
        }}
      />
    </Tooltip>
  );
}
