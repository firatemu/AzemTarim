'use client';

import { Box, Button, alpha, useTheme, Stack } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: { href: string; label: string }[] = [
  { href: '/b2b-admin', label: 'Özet Dashboard' },
  { href: '/b2b-admin/settings', label: 'Sistem Ayarları' },
  { href: '/b2b-admin/customers', label: 'B2B Müşteriler' },
  { href: '/b2b-admin/customer-classes', label: 'Müşteri Sınıfları' },
  { href: '/b2b-admin/salespersons', label: 'Plasiyerler' },
  { href: '/b2b-admin/products', label: 'Ürün Yönetimi' },
  { href: '/b2b-admin/discounts', label: 'İndirimler' },
  { href: '/b2b-admin/orders', label: 'Siparişler' },
  { href: '/b2b-admin/delivery-methods', label: 'Teslimat' },
  { href: '/b2b-admin/advertisements', label: 'Reklamlar' },
  { href: '/b2b-admin/reports', label: 'Raporlar' },
  { href: '/b2b-admin/sync', label: 'Senkronizasyon' },
];

export function B2bAdminNav() {
  const theme = useTheme();
  const path = usePathname();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mb: 4,
        pb: 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        bgcolor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(8px)',
        zIndex: 10,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {NAV.map(({ href, label }) => {
          const isActive = path === href;
          return (
            <Button
              key={href}
              component={Link}
              href={href}
              size="small"
              variant={isActive ? 'contained' : 'text'}
              sx={{
                textTransform: 'none',
                borderRadius: 2.5,
                px: 2,
                py: 0.75,
                fontWeight: isActive ? 900 : 700,
                fontSize: '0.8125rem',
                color: isActive ? 'primary.contrastText' : 'text.secondary',
                bgcolor: isActive ? 'primary.main' : 'transparent',
                boxShadow: isActive ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05),
                  color: isActive ? undefined : 'primary.main',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
