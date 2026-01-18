'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Logout,
  Person,
  CalendarMonth,
  Menu as MenuIcon,
  PushPin,
  PushPinOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { SIDEBAR_WIDTH } from './Sidebar';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleSidebarPin: () => void;
  sidebarPinned: boolean;
}

export default function Header({ onToggleSidebar, onToggleSidebarPin, sidebarPinned }: HeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  // Sistem tarih/saat güncelleme
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime(); // İlk yükleme
    const interval = setInterval(updateDateTime, 1000); // Her saniye güncelle

    return () => clearInterval(interval);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sidebarPinned ? SIDEBAR_WIDTH : 0}px)`,
        ml: sidebarPinned ? `${SIDEBAR_WIDTH}px` : 0,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.15s ease-out',
        zIndex: (theme) => (sidebarPinned ? theme.zIndex.drawer + 1 : theme.zIndex.appBar),
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton
          color={sidebarPinned ? 'primary' : 'default'}
          aria-label={sidebarPinned ? 'Menüyü sabitlemeyi kaldır' : 'Menüyü sabitle'}
          onClick={onToggleSidebarPin}
          sx={{ mr: 2 }}
        >
          {sidebarPinned ? <PushPin /> : <PushPinOutlined />}
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {/* Tab başlığı buraya gelecek */}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Sistem Tarihi */}
          <Chip
            icon={<CalendarMonth />}
            label={currentDateTime}
            variant="outlined"
            size="medium"
            sx={{
              fontWeight: 600,
              borderColor: '#191970',
              color: '#191970',
              '& .MuiChip-icon': {
                color: '#191970',
              },
            }}
          />
          
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="body2" fontWeight="600" color="text.primary">
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: '#191970',
                bgcolor: 'rgba(25, 25, 112, 0.05)',
              }
            }}
          >
            <Avatar sx={{ 
              width: 36, 
              height: 36, 
              background: 'linear-gradient(135deg, #191970 0%, #0f0f40 100%)',
              fontWeight: 'bold',
            }}>
              {user?.fullName?.[0] || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
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
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Person sx={{ mr: 1 }} /> Profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Çıkış
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

