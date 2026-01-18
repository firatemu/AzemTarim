'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from '@mui/icons-material';

export default function SiparisPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sipariş Yönetimi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => router.push('/siparis/satis')}
            >
              <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Satış Siparişleri
              </Typography>
              <Typography color="text.secondary">
                Müşterilerden gelen sipariş emirlerini yönetin
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}

