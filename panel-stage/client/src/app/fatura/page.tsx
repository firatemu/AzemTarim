'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { Receipt, ShoppingCart, CloudDownload } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function FaturaPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Fatura Yönetimi
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Lütfen işlem yapmak istediğiniz fatura türünü seçiniz
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={2}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}
          >
            <CardActionArea onClick={() => router.push('/fatura/satis')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#fdf2f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Receipt sx={{ fontSize: 40, color: '#ec4899' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Satış Faturaları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Müşterilerinize kestiğiniz faturaları görüntüleyin ve yönetin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={2}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}
          >
            <CardActionArea onClick={() => router.push('/fatura/satin-alma')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#fdf2f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 40, color: '#ec4899' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Satın Alma Faturaları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tedarikçilerden aldığınız faturaları görüntüleyin ve yönetin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={2}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}
          >
            <CardActionArea onClick={() => router.push('/efatura/gelen')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CloudDownload sx={{ fontSize: 40, color: '#0ea5e9' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Gelen E-Faturalar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hızlı Teknoloji entegratöründen gelen e-faturaları görüntüleyin ve yönetin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

      </Grid>
    </MainLayout>
  );
}
