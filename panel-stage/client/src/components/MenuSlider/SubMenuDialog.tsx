import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search,
} from '@mui/icons-material';
import { SubMenuDialogProps } from './types';
import { getIconComponent } from './utils';

export default function SubMenuDialog({
  open,
  onClose,
  parentItem,
  onSubItemClick,
}: SubMenuDialogProps) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubItems = useMemo(() => {
    if (!parentItem.subItems) return [];
    if (!searchTerm) return parentItem.subItems;
    const searchLower = searchTerm.toLowerCase();
    return parentItem.subItems.filter((subItem) =>
      subItem.label.toLowerCase().includes(searchLower)
    );
  }, [parentItem.subItems, searchTerm]);

  const ParentIcon = getIconComponent(parentItem.icon);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)'
            : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          border: theme.palette.mode === 'light'
            ? '1px solid rgba(255, 255, 255, 0.8)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: theme.palette.mode === 'light'
            ? '0 12px 48px rgba(0, 0, 0, 0.08)'
            : '0 12px 48px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 4, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: parentItem.color || '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ParentIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9' }}>
              {parentItem.label}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8' }}>
              {parentItem.section}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Search and Content */}
      <Box sx={{ p: 4, pt: 2 }}>
        <TextField
          id={`submenu-search-${parentItem.id}`}
          fullWidth
          placeholder="Alt menü ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: theme.palette.mode === 'light' ? '#94A3B8' : '#64748B', fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              background: theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(30, 41, 59, 0.6)',
              color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9',
              border: theme.palette.mode === 'light'
                ? '1px solid rgba(255, 255, 255, 0.8)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover': {
                background: theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.85)'
                  : 'rgba(30, 41, 59, 0.8)',
                border: theme.palette.mode === 'light'
                  ? '1px solid rgba(255, 255, 255, 0.9)'
                  : '1px solid rgba(255, 255, 255, 0.15)',
              },
              '&.Mui-focused': {
                background: theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(30, 41, 59, 0.9)',
                border: theme.palette.mode === 'light'
                  ? '1px solid #BBDEFB'
                  : '1px solid rgba(59, 130, 246, 0.5)',
                '& fieldset': { borderColor: 'transparent' },
              },
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: theme.palette.mode === 'light' ? '#94A3B8' : '#64748B',
                opacity: 1,
              },
            },
          }}
        />

        <Grid container spacing={2}>
          {filteredSubItems.map((subItem) => {
            const SubIcon = getIconComponent(subItem.icon);
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={subItem.id}>
                <Box
                  onClick={() => onSubItemClick(subItem)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: theme.palette.mode === 'light'
                      ? '1px solid rgba(255, 255, 255, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(30, 41, 59, 0.7)',
                      transform: 'translateY(-2px)',
                      border: theme.palette.mode === 'light'
                        ? '1px solid rgba(255, 255, 255, 0.8)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      background: subItem.color || parentItem.color || '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <SubIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
                  </Box>
                  <Typography sx={{ color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9', fontWeight: 600 }}>
                    {subItem.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {searchTerm && filteredSubItems.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8', py: 4 }}>
            Sonuç bulunamadı
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
