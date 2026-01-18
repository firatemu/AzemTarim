'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Dashboard,
  DirectionsCar,
  NotificationsActive,
  Build,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

export default function ServisPage() {
  const router = useRouter();

  // Quick stats
  const { data: workOrdersData } = useQuery({
    queryKey: ['work-orders-summary'],
    queryFn: async () => {
      const response = await axios.get('/work-orders', { params: { limit: 100 } });
      return response.data;
    },
  });

  const workOrders = workOrdersData?.data || [];
  const activeWorkOrders = workOrders.filter(
    (wo: any) => wo.status !== 'CLOSED' && wo.status !== 'CANCELLED'
  ).length;
  const waitingApproval = workOrders.filter(
    (wo: any) => wo.status === 'WAITING_FOR_APPROVAL'
  ).length;
  const readyForDelivery = workOrders.filter(
    (wo: any) => wo.status === 'READY_FOR_DELIVERY'
  ).length;

  const menuItems = [
    {
      title: 'İş Emirleri',
      description: 'Tüm iş emirlerini listele, filtrele ve yönet',
      icon: <Assignment sx={{ fontSize: 48, color: '#1565c0' }} />,
      href: '/servis/is-emirleri',
      color: '#e3f2fd',
      badge: activeWorkOrders > 0 ? `${activeWorkOrders} Aktif` : null,
      badgeColor: 'primary' as const,
    },
    {
      title: 'Atölye Panosu',
      description: 'Kanban görünümünde iş akışını takip et',
      icon: <Dashboard sx={{ fontSize: 48, color: '#6366f1' }} />,
      href: '/servis/atolye-panosu',
      color: '#ede9fe',
      badge: waitingApproval > 0 ? `${waitingApproval} Onay Bekliyor` : null,
      badgeColor: 'warning' as const,
    },
    {
      title: 'Araçlar',
      description: 'Araç kayıtlarını ve servis geçmişlerini görüntüle',
      icon: <DirectionsCar sx={{ fontSize: 48, color: '#059669' }} />,
      href: '/servis/araclar',
      color: '#d1fae5',
      badge: null,
      badgeColor: 'default' as const,
    },
    {
      title: 'Bakım Hatırlatmaları',
      description: 'Yaklaşan ve geciken bakım hatırlatmalarını yönet',
      icon: <NotificationsActive sx={{ fontSize: 48, color: '#f59e0b' }} />,
      href: '/servis/bakim-hatirlatmalari',
      color: '#fef3c7',
      badge: null,
      badgeColor: 'default' as const,
    },
    {
      title: 'Teknisyenler',
      description: 'Teknisyen kadrolarını ve iş yüklerini görüntüle',
      icon: <Build sx={{ fontSize: 48, color: '#ef4444' }} />,
      href: '/servis/teknisyenler',
      color: '#fee2e2',
      badge: null,
      badgeColor: 'default' as const,
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #1565c0 0%, #6366f1 50%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Servis Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Araç servis operasyonlarınızı tek noktadan yönetin
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#e3f2fd',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => router.push('/servis/is-emirleri')}
            >
              <Typography variant="h3" fontWeight="bold" color="primary">
                {activeWorkOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif İş Emri
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#fff3e0',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => router.push('/servis/is-emirleri?status=WAITING_FOR_APPROVAL')}
            >
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {waitingApproval}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Onay Bekliyor
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#d1fae5',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => router.push('/servis/is-emirleri?status=READY_FOR_DELIVERY')}
            >
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {readyForDelivery}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teslime Hazır
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#ede9fe',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => router.push('/servis/atolye-panosu')}
            >
              <TrendingUp sx={{ fontSize: 32, color: '#6366f1' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Panoyu Aç
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => router.push(item.href)}
              >
                <CardContent sx={{ flex: 1, textAlign: 'center', py: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {item.title}
                    </Typography>
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color={item.badgeColor}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => router.push(item.href)}
                  >
                    Git
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MainLayout>
  );
}

