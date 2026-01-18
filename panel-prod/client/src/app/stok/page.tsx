'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { Inventory, Category, DirectionsCar, Calculate, Assessment } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';

export default function StokPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Stok Yönetimi
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Lütfen işlem yapmak istediğiniz modülü seçiniz
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            <CardActionArea onClick={() => router.push('/stok/malzeme-listesi')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Inventory sx={{ fontSize: 40, color: '#06b6d4' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Malzeme Listesi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stok malzemelerini görüntüleyin, ekleyin ve düzenleyin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            <CardActionArea onClick={() => router.push('/stok/malzeme-hareketleri')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Assessment sx={{ fontSize: 40, color: '#06b6d4' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Malzeme Hareketleri
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stok giriş/çıkış hareketlerini takip edin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            <CardActionArea onClick={() => router.push('/stok/kategori-yonetimi')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Category sx={{ fontSize: 40, color: '#06b6d4' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Kategori Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ana ve alt kategorileri düzenleyin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            <CardActionArea onClick={() => router.push('/stok/marka-yonetimi')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 40, color: '#06b6d4' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Marka Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Markaları ekleyin, düzenleyin ve yönetin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            <CardActionArea onClick={() => router.push('/stok/birim-setleri')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: '#ecfeff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Calculate sx={{ fontSize: 40, color: '#06b6d4' }} />
                </Box>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Birim Setleri
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Birimler ve çevrim katsayılarını yönetin
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}

