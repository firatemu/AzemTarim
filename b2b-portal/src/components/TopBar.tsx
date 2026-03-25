'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TopBarProps {
  cartItemCount?: number;
  unreadCount?: number;
  onMenuClick?: () => void;
}

export function TopBar({ cartItemCount = 0, unreadCount = 0, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch cart count
  const { data: cartData } = useQuery({
    queryKey: ['b2b-cart-count'],
    queryFn: async () => {
      const res = await axios.get('/b2b/cart/count');
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const actualCartCount = cartData?.count || cartItemCount;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/b2b/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
          }}
        >
          B2B Portal
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            href="/dashboard"
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/catalog"
          >
            Katalog
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/orders"
          >
            Siparişlerim
          </Button>
          <Button
            color="inherit"
            component={Link}
            href="/account"
          >
            Hesabım
          </Button>

          <IconButton color="inherit" component={Link} href="/notifications">
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" component={Link} href="/cart">
            <Badge badgeContent={actualCartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <AccountCircleIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem component={Link} href="/account" onClick={handleProfileMenuClose}>
              Profil
            </MenuItem>
            <MenuItem component={Link} href="/settings" onClick={handleProfileMenuClose}>
              Ayarlar
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
