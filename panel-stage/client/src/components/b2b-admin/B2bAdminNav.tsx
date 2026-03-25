'use client';

import { Box, Button } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: { href: string; label: string }[] = [
  { href: '/b2b-admin', label: 'Özet' },
  { href: '/b2b-admin/settings', label: 'Ayarlar' },
  { href: '/b2b-admin/customers', label: 'B2B cariler' },
  { href: '/b2b-admin/customer-classes', label: 'Müşteri sınıfları' },
  { href: '/b2b-admin/salespersons', label: 'Plasiyerler' },
  { href: '/b2b-admin/products', label: 'Ürünler' },
  { href: '/b2b-admin/discounts', label: 'İndirimler' },
  { href: '/b2b-admin/orders', label: 'Siparişler' },
  { href: '/b2b-admin/delivery-methods', label: 'Teslimat' },
  { href: '/b2b-admin/advertisements', label: 'Reklamlar' },
  { href: '/b2b-admin/reports', label: 'Raporlar' },
  { href: '/b2b-admin/sync', label: 'Senkron' },
];

export function B2bAdminNav() {
  const path = usePathname();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75,
        mb: 2,
        pb: 2,
        borderBottom: 1,
        borderColor: 'var(--border)',
      }}
    >
      {NAV.map(({ href, label }) => (
        <Button
          key={href}
          component={Link}
          href={href}
          size="small"
          variant={path === href ? 'contained' : 'outlined'}
          color={path === href ? 'primary' : 'inherit'}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            borderColor: 'var(--border)',
            color:
              path === href ? undefined : 'var(--foreground)',
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
}
