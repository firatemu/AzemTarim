'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { Inventory, QrCode2 } from '@mui/icons-material';

export default function SayimPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{
          background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Stok Sayım Modülü
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                border: '2px solid',
                borderColor: 'primary.main',
              }}
              onClick={() => router.push('/sayim/urun-bazli')}
            >
              <Inventory sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Ürün Bazlı Sayım
              </Typography>
              <Typography color="text.secondary">
                Sadece ürün toplamını sayın, raf adresleri önemli değil
              </Typography>
              <Typography variant="caption" color="primary.main" sx={{ mt: 1, display: 'block' }}>
                Barkod okuma destekli
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                border: '2px solid',
                borderColor: 'secondary.main',
              }}
              onClick={() => router.push('/sayim/raf-bazli')}
            >
              <QrCode2 sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Raf Bazlı Sayım
              </Typography>
              <Typography color="text.secondary">
                Her rafta ne kadar ürün var detaylı sayın
              </Typography>
              <Typography variant="caption" color="secondary.main" sx={{ mt: 1, display: 'block' }}>
                Barkod okuma destekli
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => router.push('/sayim/liste')}
            >
              <Inventory sx={{ fontSize: 60, color: '#14b8a6', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Sayım Listesi
              </Typography>
              <Typography color="text.secondary">
                Geçmiş sayımları görüntüleyin ve onaylayın
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}

