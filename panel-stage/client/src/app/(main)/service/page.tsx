'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CardActionArea, CircularProgress, Stack, alpha } from '@mui/material';
import { Build, DirectionsCar, Assignment, Receipt, AccountBalance, Inventory, Engineering, TrendingUp, Schedule, BuildCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { StandardPage, StandardCard } from '@/components/common';
import axios from '@/lib/axios';

type ServisStats = {
  workOrders?: { total: number; waitingDiagnosis: number; pendingApproval: number; inProgress: number; invoiced: number };
  partRequests?: { pending: number };
  revenue?: { thisMonth: number; invoiceCount: number };
};

const menuItems = [
  {
    title: 'Müşteri Araçları',
    description: 'Müşteri araçlarını görüntüleyin, ekleyin ve yönetin',
    icon: DirectionsCar,
    href: '/service/customer-vehicles',
    color: '#0ea5e9',
  },
  {
    title: 'İş Emirleri',
    description: 'Servis iş emirlerini oluşturun ve takip edin',
    icon: Assignment,
    href: '/service/work-orders',
    color: '#6366f1',
  },
  {
    title: 'Parça Tedarik ve Yönetimi',
    description: 'İş emirlerine parça ekleyin ve teknisyen taleplerini karşılayın',
    icon: Inventory,
    href: '/service/part-procurement',
    color: '#f59e0b',
  },
  {
    title: 'Teknisyenler',
    description: 'Servis operasyonunda görev alan teknisyenleri yönetin',
    icon: Engineering,
    href: '/service/technicians',
    color: '#10b981',
    hideForTechnician: true,
  },
  {
    title: 'Servis Faturaları',
    description: 'Servis faturalarını görüntüleyin ve yönetin',
    icon: Receipt,
    href: '/service/invoices',
    color: '#8b5cf6',
    hideForTechnician: true,
  },
  {
    title: 'Muhasebe Kayıtları',
    description: 'Servis ile ilgili muhasebe kayıtlarını inceleyin',
    icon: AccountBalance,
    href: '/service/accounting-records',
    color: '#64748b',
    hideForTechnician: true,
  },
  {
    title: 'Servis Raporları',
    description: 'İş emri durumları, gelir ve parça talebi analizi',
    icon: TrendingUp,
    href: '/service/reports',
    color: '#ec4899',
    hideForTechnician: true,
  },
];

export default function ServisHubPage() {
  const router = useRouter();
  const { user } = useAuthStore() as any;
  const isTechnician = user?.role === 'TECHNICIAN';
  const visibleItems = menuItems.filter((item) => !(item as any).hideForTechnician || !isTechnician);
  const [stats, setStats] = useState<ServisStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/work-orders/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

  return (
    <StandardPage maxWidth={false}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <BuildCircle sx={{ fontSize: 40, color: 'primary.main' }} />
          Servis Yönetimi
        </Typography>
        <Typography variant="body2" color="text.secondary">Lütfen işlem yapmak istediğiniz modülü seçiniz veya genel durumu takip edin.</Typography>
      </Box>

      {!isTechnician && (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statsLoading ? (
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            </Grid>
          ) : stats ? (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StandardCard sx={{ height: '100%', py: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ bgcolor: alpha('#6366f1', 0.1), p: 1.5, borderRadius: 2 }}>
                      <Assignment sx={{ color: '#6366f1', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats.workOrders?.total ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        TOPLAM İŞ EMRİ
                      </Typography>
                    </Box>
                  </Stack>
                </StandardCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StandardCard sx={{ height: '100%', py: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), p: 1.5, borderRadius: 2 }}>
                      <Schedule sx={{ color: '#f59e0b', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats.workOrders?.inProgress ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        DEVAM EDEN
                      </Typography>
                    </Box>
                  </Stack>
                </StandardCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StandardCard sx={{ height: '100%', py: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ bgcolor: alpha('#0ea5e9', 0.1), p: 1.5, borderRadius: 2 }}>
                      <Inventory sx={{ color: '#0ea5e9', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {stats.partRequests?.pending ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        BEKLEYEN PARÇA TALEBİ
                      </Typography>
                    </Box>
                  </Stack>
                </StandardCard>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StandardCard sx={{ height: '100%', py: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1.5, borderRadius: 2 }}>
                      <TrendingUp sx={{ color: '#10b981', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {formatCurrency(stats.revenue?.thisMonth ?? 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        BU AY GELİR
                      </Typography>
                    </Box>
                  </Stack>
                </StandardCard>
              </Grid>
            </>
          ) : null}
        </Grid>
      )}

      <Grid container spacing={3}>
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <StandardCard
                sx={{
                  p: 0,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
                    borderColor: item.color,
                  },
                }}
              >
                <CardActionArea onClick={() => router.push(item.href)} sx={{ p: 0 }}>
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        bgcolor: alpha(item.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        border: '1px solid',
                        borderColor: alpha(item.color, 0.2),
                      }}
                    >
                      <IconComponent sx={{ fontSize: 40, color: item.color }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        mb: 1,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        px: 1
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </StandardCard>
            </Grid>
          );
        })}
      </Grid>
    </StandardPage>
  );
}
