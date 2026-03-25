'use client';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

const links = [
  { href: '/dashboard', label: 'Panel', Icon: DashboardIcon },
  { href: '/account', label: 'Cari', Icon: AccountBalanceWalletIcon },
  { href: '/catalog', label: 'Katalog', Icon: MenuBookIcon },
  { href: '/cart', label: 'Sepet', Icon: ShoppingCartIcon },
  { href: '/orders', label: 'Siparisler', Icon: ReceiptLongIcon },
  { href: '/notifications', label: 'Bildirimler', Icon: NotificationsIcon },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/b2b/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            B2B Portal
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {links.map(({ href, label, Icon }) => (
              <Button
                key={href}
                component={Link}
                href={href}
                color={path === href ? 'primary' : 'inherit'}
                startIcon={<Icon fontSize="small" />}
                size="small"
              >
                {label}
              </Button>
            ))}
            <IconButton onClick={logout} aria-label="cikis" size="small">
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
