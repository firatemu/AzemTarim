'use client';

import { Alert, AlertTitle, Box, Collapse, IconButton } from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

type RiskStatus = 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';

interface RiskBannerProps {
  status: RiskStatus;
  creditLimit?: number;
  balance?: number;
  overdueAmount?: number;
  onClose?: () => void;
}

export function RiskBanner({ status, creditLimit, balance, overdueAmount, onClose }: RiskBannerProps) {
  if (status === 'OK') {
    return null;
  }

  const getTitle = () => {
    switch (status) {
      case 'OVER_LIMIT':
        return 'Kredi Limiti Aşıldı';
      case 'OVERDUE':
        return 'Vadesi Geçmiş Fatura Bulunuyor';
      case 'BLOCKED':
        return 'Sipariş Girişi Engellendi';
      default:
        return 'Risk Uyarısı';
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'OVER_LIMIT':
        return `Bakiyeniz (${balance?.toFixed(2)} ₺) kredi limitinizi (${creditLimit?.toFixed(2)} ₺) aşmaktadır. Lütfen bakiyenizi düşürün.`;
      case 'OVERDUE':
        return `Vadesi geçmiş ${overdueAmount?.toFixed(2)} ₺ faturanız bulunmaktadır. Lütfen ödemelerinizi kontrol edin.`;
      case 'BLOCKED':
        return 'Risk durumunuz nedeniyle sipariş girişiniz geçici olarak engellenmiştir. Muhasebe birimiyle iletişime geçin.';
      default:
        return 'Lütfen hesap bakiyenizi kontrol edin.';
    }
  };

  const getSeverity = (): 'warning' | 'error' => {
    return status === 'BLOCKED' ? 'error' : 'warning';
  };

  return (
    <Collapse in={true}>
      <Alert
        severity={getSeverity()}
        icon={<WarningIcon fontSize="inherit" />}
        action={
          onClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
        sx={{
          borderRadius: 0,
          '& .MuiAlert-icon': {
            fontSize: '28px',
          },
        }}
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        {getMessage()}
      </Alert>
    </Collapse>
  );
}

// Success banner for when cart can be checked out
export function CartSuccessBanner() {
  return (
    <Alert
      severity="success"
      icon={<CheckCircleIcon fontSize="inherit" />}
      sx={{
        borderRadius: 0,
        '& .MuiAlert-icon': {
          fontSize: '24px',
        },
      }}
    >
      Siparişinizi oluşturabilirsiniz.
    </Alert>
  );
}
