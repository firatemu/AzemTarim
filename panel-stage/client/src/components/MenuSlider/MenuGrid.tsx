'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Container,
  useTheme,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { MenuItem } from './types';
import SubMenuDialog from './SubMenuDialog';
import SearchResultsList from './SearchResultsList';
import MenuCard from './MenuCard';

interface SearchResult {
  item: MenuItem;
  type: 'main' | 'sub';
  parentItem?: MenuItem;
}

interface MenuGridProps {
  menuItems: MenuItem[];
  showBackground?: boolean;
  onMenuClick?: (item: MenuItem) => void;
  onSubItemClick?: (parent: MenuItem, subItem: MenuItem) => void;
}

export default function MenuGrid({
  menuItems,
  onMenuClick,
  onSubItemClick,
}: MenuGridProps) {
  const router = useRouter();
  const theme = useTheme();
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate search results for list (real-time) - ONLY sub-items
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];

    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    menuItems.forEach((item) => {
      // Only search in subItems
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.label.toLowerCase().includes(searchLower)) {
            results.push({ item: subItem, type: 'sub', parentItem: item });
          }
        });
      }
    });

    return results;
  }, [menuItems, searchTerm]);

  const showSearchResults = searchTerm.length > 0;

  const handleMenuClick = (item: MenuItem) => {
    if (onMenuClick) {
      onMenuClick(item);
    }

    // If item has subItems, open submenu dialog
    if (item.subItems && item.subItems.length > 0) {
      setSelectedSubMenu(item);
      return;
    }

    // Otherwise navigate to path
    if (item.path) {
      router.push(item.path);
    }
  };

  const handleSubItemClick = (subItem: MenuItem) => {
    if (onSubItemClick) {
      onSubItemClick(selectedSubMenu!, subItem);
    }

    if (subItem.path) {
      router.push(subItem.path);
    }

    setSelectedSubMenu(null);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 50%, #F0F4F8 100%)'
          : 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E293B 100%)',
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 4, md: 8 },
        pb: 8,
        px: { xs: 2, md: 4 },
        overflowX: 'hidden',
      }}
    >
      {/* Animated Gradient Mesh Background */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: theme.palette.mode === 'light'
            ? `
              radial-gradient(at 40% 20%, rgba(227, 242, 253, 0.5) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(224, 242, 241, 0.4) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(252, 228, 236, 0.35) 0px, transparent 50%),
              radial-gradient(at 80% 50%, rgba(243, 229, 245, 0.4) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(255, 253, 231, 0.35) 0px, transparent 50%),
              radial-gradient(at 80% 100%, rgba(232, 245, 233, 0.4) 0px, transparent 50%)
            `
            : `
              radial-gradient(at 40% 20%, rgba(30, 41, 59, 0.4) 0px, transparent 50%),
              radial-gradient(at 80% 0%, rgba(15, 23, 42, 0.3) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(51, 65, 85, 0.35) 0px, transparent 50%),
              radial-gradient(at 80% 50%, rgba(30, 41, 59, 0.3) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(15, 23, 42, 0.25) 0px, transparent 50%),
              radial-gradient(at 80% 100%, rgba(30, 41, 59, 0.3) 0px, transparent 50%)
            `,
          animation: 'meshMove 30s linear infinite',
          '@keyframes meshMove': {
            '0%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
            '50%': { backgroundPosition: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%' },
            '100%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
          },
        }}
      />

      {/* Floating Orbs */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            position: 'absolute',
            width: [350, 300, 250, 220, 180, 150][i],
            height: [350, 300, 250, 220, 180, 150][i],
            borderRadius: '50%',
            top: `${[10, 20, 60, 70, 30, 80][i]}%`,
            left: `${[80, 15, 70, 20, 60, 85][i]}%`,
            opacity: theme.palette.mode === 'light'
              ? [0.12, 0.1, 0.11, 0.09, 0.1, 0.12][i]
              : [0.08, 0.06, 0.07, 0.05, 0.06, 0.08][i],
            background: theme.palette.mode === 'light' ? [
              'radial-gradient(circle, rgba(187, 222, 251, 0.4), transparent)',
              'radial-gradient(circle, rgba(178, 223, 219, 0.35), transparent)',
              'radial-gradient(circle, rgba(248, 187, 208, 0.3), transparent)',
              'radial-gradient(circle, rgba(225, 190, 231, 0.35), transparent)',
              'radial-gradient(circle, rgba(255, 249, 196, 0.3), transparent)',
              'radial-gradient(circle, rgba(200, 230, 201, 0.35), transparent)',
            ][i] : [
              'radial-gradient(circle, rgba(30, 58, 138, 0.25), transparent)',
              'radial-gradient(circle, rgba(15, 23, 42, 0.2), transparent)',
              'radial-gradient(circle, rgba(51, 65, 85, 0.2), transparent)',
              'radial-gradient(circle, rgba(30, 41, 59, 0.15), transparent)',
              'radial-gradient(circle, rgba(15, 23, 42, 0.2), transparent)',
              'radial-gradient(circle, rgba(30, 58, 138, 0.25), transparent)',
            ][i],
            filter: 'blur(60px)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: `float ${[25, 30, 20, 28, 22, 26][i]}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
              },
              '33%': {
                transform: 'translate(30px, -30px) scale(1.05)',
              },
              '66%': {
                transform: 'translate(-20px, 20px) scale(0.95)',
              },
            },
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Search Bar - Pastel Design */}
        <Box
          sx={{
            width: '100%',
            mb: 6,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <TextField
            id="menu-search-input"
            fullWidth
            placeholder="Menü ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.mode === 'light' ? '#94A3B8' : '#64748B', fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: '800px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: theme.palette.mode === 'light'
                  ? 'rgba(255, 255, 255, 0.8)'
                  : 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9',
                fontSize: '1.1rem',
                border: theme.palette.mode === 'light'
                  ? '1px solid rgba(255, 255, 255, 0.9)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                height: '56px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover': {
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(30, 41, 59, 0.8)',
                  border: theme.palette.mode === 'light'
                    ? '1px solid rgba(255, 255, 255, 1)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                },
                '&.Mui-focused': {
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(30, 41, 59, 0.9)',
                  border: theme.palette.mode === 'light'
                    ? '1px solid #BBDEFB'
                    : '1px solid rgba(59, 130, 246, 0.5)',
                  boxShadow: theme.palette.mode === 'light'
                    ? '0 0 0 3px rgba(187, 222, 251, 0.2)'
                    : '0 0 0 3px rgba(59, 130, 246, 0.15)',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
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
        </Box>

        {/* Content Area */}
        <Box sx={{ width: '100%' }}>
          {showSearchResults ? (
            <SearchResultsList
              results={searchResults}
              searchTerm={searchTerm}
              onItemClick={handleMenuClick}
            />
          ) : (
            <Grid
              container
              spacing={{ xs: 3, sm: 4, md: 5 }}
              columns={{ xs: 4, sm: 8, md: 12, lg: 15 }}
            >
              {menuItems.map((item) => (
                <Grid size={{ xs: 2, sm: 2, md: 2, lg: 1.5 }} key={item.id}>
                  <MenuCard
                    item={item}
                    onClick={() => handleMenuClick(item)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* SubMenu Dialog */}
      {selectedSubMenu && (
        <SubMenuDialog
          open={!!selectedSubMenu}
          onClose={() => setSelectedSubMenu(null)}
          parentItem={selectedSubMenu}
          onSubItemClick={handleSubItemClick}
        />
      )}
    </Box>
  );
}
