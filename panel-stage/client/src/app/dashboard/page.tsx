'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Skeleton, Alert, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import PageContainer from '@/components/common/PageContainer';
import Reminders from '@/components/dashboard/Reminders';
import StatsCards from '@/components/dashboard/StatsCards';
import SalesChart from '@/components/dashboard/SalesChart';
import CollectionStats from '@/components/dashboard/CollectionStats';
import CollectionChart from '@/components/dashboard/CollectionChart';
import InventoryOverview from '@/components/dashboard/InventoryOverview';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: { toplamStok: 0, cariSayisi: 0, aylikSatis: 0, karMarji: 0 },
    salesChart: [] as any[],
    collectionStats: {
      currentMonthCollection: 0,
      currentMonthPayment: 0,
      previousMonthCollection: 0,
      previousMonthPayment: 0,
    },
    collectionChart: [] as any[],
    inventory: {
      criticalStock: [] as any[],
      categoryDistribution: [] as any[],
    },
    transactions: {
      invoices: [] as any[],
      payments: [] as any[],
    },
  });

  useEffect(() => {
    fetchDashboardData();
    fetchTenantSettings();
  }, [period]);

  const fetchTenantSettings = async () => {
    try {
      const res = await axios.get('/tenants/settings');
      setTenantSettings(res.data);
    } catch (error) {
      console.error('Tenant settings loading error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel Data Fetching
      const [stokRes, cariRes, faturaRes, tahsilatRes] = await Promise.allSettled([
        axios.get('/stok', { params: { page: 1, limit: 1000 } }),
        axios.get('/cari', { params: { page: 1, limit: 1 } }),
        axios.get('/fatura', { params: { page: 1, limit: 1000 } }),
        axios.get('/tahsilat', { params: { page: 1, limit: 1000 } }),
      ]);

      // 1. Basic Stats
      const stocks = stokRes.status === 'fulfilled' ? (stokRes.value.data?.data || []) : [];
      const toplamStok = stokRes.status === 'fulfilled' ? (stokRes.value.data?.meta?.total || 0) : 0;
      const invoices = faturaRes.status === 'fulfilled' ? (faturaRes.value.data?.data || []) : [];

      const bugun = new Date();
      const buAyBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
      const buAyBitis = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0, 23, 59, 59);

      const buAyFaturalar = invoices.filter((f: any) => {
        const tarih = new Date(f.tarih || f.createdAt);
        return tarih >= buAyBaslangic && tarih <= buAyBitis && f.faturaTipi === 'SATIS';
      });
      const aylikSatis = buAyFaturalar.reduce((sum: number, f: any) => sum + Number(f.genelToplam || 0), 0);

      // 2. Collection & Payment Aggregation (Dynamic)
      const allTahsilat = tahsilatRes.status === 'fulfilled' ? (tahsilatRes.value.data?.data || []) : [];

      let currentPeriodCollection = 0;
      let currentPeriodPayment = 0;
      let previousPeriodCollection = 0;
      let previousPeriodPayment = 0;
      let chartData: any[] = [];

      const now = new Date();

      if (period === 'monthly') {
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const pStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const pEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const currentOps = allTahsilat.filter((t: any) => new Date(t.tarih) >= mStart);
        const prevOps = allTahsilat.filter((t: any) => {
          const dt = new Date(t.tarih);
          return dt >= pStart && dt <= pEnd;
        });

        currentPeriodCollection = currentOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        currentPeriodPayment = currentOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodCollection = prevOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodPayment = prevOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);

        // Chart: Last 6 Months
        const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const s = new Date(d.getFullYear(), d.getMonth(), 1);
          const e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
          const mOps = allTahsilat.filter((t: any) => { const dt = new Date(t.tarih); return dt >= s && dt <= e; });
          chartData.push({
            name: ayIsimleri[d.getMonth()],
            tahsilat: mOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
            odeme: mOps.filter((t: any) => t.tip === 'ODEME').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
          });
        }
      } else if (period === 'weekly') {
        const wStart = new Date(now);
        wStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        wStart.setHours(0, 0, 0, 0);

        const pwStart = new Date(wStart);
        pwStart.setDate(pwStart.getDate() - 7);
        const pwEnd = new Date(wStart);
        pwEnd.setSeconds(-1);

        const currentOps = allTahsilat.filter((t: any) => new Date(t.tarih) >= wStart);
        const prevOps = allTahsilat.filter((t: any) => {
          const dt = new Date(t.tarih);
          return dt >= pwStart && dt <= pwEnd;
        });

        currentPeriodCollection = currentOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        currentPeriodPayment = currentOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodCollection = prevOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodPayment = prevOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);

        // Chart: Last 7 Days
        const gunIsimleri = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const s = new Date(d); s.setHours(0, 0, 0, 0);
          const e = new Date(d); e.setHours(23, 59, 59, 999);
          const dOps = allTahsilat.filter((t: any) => { const dt = new Date(t.tarih); return dt >= s && dt <= e; });
          chartData.push({
            name: gunIsimleri[d.getDay()],
            tahsilat: dOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
            odeme: dOps.filter((t: any) => t.tip === 'ODEME').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
          });
        }
      } else if (period === 'daily') {
        const dStart = new Date(); dStart.setHours(0, 0, 0, 0);
        const pStart = new Date(dStart); pStart.setDate(pStart.getDate() - 1);
        const pEnd = new Date(dStart); pEnd.setSeconds(-1);

        const currentOps = allTahsilat.filter((t: any) => new Date(t.tarih) >= dStart);
        const prevOps = allTahsilat.filter((t: any) => {
          const dt = new Date(t.tarih);
          return dt >= pStart && dt <= pEnd;
        });

        currentPeriodCollection = currentOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        currentPeriodPayment = currentOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodCollection = prevOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((s: number, t: any) => s + Number(t.tutar), 0);
        previousPeriodPayment = prevOps.filter((t: any) => t.tip === 'ODEME').reduce((s: number, t: any) => s + Number(t.tutar), 0);

        // Chart: 24 Hours
        for (let i = 0; i < 24; i += 4) {
          const s = new Date(dStart); s.setHours(i, 0, 0, 0);
          const e = new Date(dStart); e.setHours(i + 3, 59, 59, 999);
          const hOps = currentOps.filter((t: any) => { const dt = new Date(t.tarih); return dt >= s && dt <= e; });
          chartData.push({
            name: `${i}:00`,
            tahsilat: hOps.filter((t: any) => t.tip === 'TAHSILAT').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
            odeme: hOps.filter((t: any) => t.tip === 'ODEME').reduce((sum: number, t: any) => sum + Number(t.tutar), 0),
          });
        }
      }

      setDashboardData({
        stats: {
          toplamStok,
          cariSayisi: cariRes.status === 'fulfilled' ? (cariRes.value.data?.meta?.total || 0) : 0,
          aylikSatis,
          karMarji: aylikSatis * 0.15,
        },
        salesChart: [],
        collectionStats: {
          currentMonthCollection: currentPeriodCollection,
          currentMonthPayment: currentPeriodPayment,
          previousMonthCollection: previousPeriodCollection,
          previousMonthPayment: previousPeriodPayment,
        },
        collectionChart: chartData,
        inventory: {
          criticalStock: stocks.filter((s: any) => Number(s.stokMiktari) < 10).slice(0, 5).map((s: any) => ({
            id: s.id, name: s.urunAdi, stock: Number(s.stokMiktari), minStock: 10, unit: s.birim || 'Adet'
          })),
          categoryDistribution: [
            { name: 'Yedek Parça', value: 45, color: '#10b981' },
            { name: 'Sarf Malzeme', value: 25, color: '#3b82f6' },
            { name: 'Aksesuar', value: 20, color: '#f59e0b' },
          ],
        },
        transactions: {
          invoices: invoices.slice(0, 5).map((f: any) => ({
            id: f.id, unvan: f.cari?.unvan || 'Cari', tarih: f.tarih, tutar: f.genelToplam,
          })),
          payments: allTahsilat.slice(0, 5).map((t: any) => ({
            id: t.id, cariAdi: t.cari?.unvan || 'Kasa/Banka', tarih: t.tarih, tutar: t.tutar, tur: t.tip === 'TAHSILAT' ? 'GIRIS' : 'CIKIS',
          })),
        },
      });

    } catch (error) {
      console.error('Dashboard yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: 'daily' | 'weekly' | 'monthly' | null) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        {/* Header with Company Logo & Welcome */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" width={64} height={64} />
              ) : tenantSettings?.logoUrl ? (
                <Box component="img" src={tenantSettings.logoUrl} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }} />
              ) : (
                <Box sx={{ width: 16, height: 48, bgcolor: 'var(--primary)', borderRadius: '999px' }} />
              )}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {loading ? <Skeleton width={200} /> : (tenantSettings?.companyName || 'Hoş Geldiniz')}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {loading ? <Skeleton width={150} /> : `Merhaba, ${user?.fullName || 'Kullanıcı'} 👋`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Alert severity="success" icon={false} sx={{ py: 0, alignItems: 'center', fontWeight: 600, borderRadius: '12px' }}>
              Kurumsal Panel
            </Alert>
          </Box>
        </Box>

        {/* 1. Quick Stats */}
        <StatsCards stats={dashboardData.stats} loading={loading} />

        {/* 2. Collection & Payment Overview (Dynamic) */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            Tahsilat ve Ödeme Analizi
          </Typography>

          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            sx={{
              bgcolor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'var(--muted-foreground)',
                '&.Mui-selected': {
                  bgcolor: 'var(--primary)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'var(--primary)',
                  }
                }
              }
            }}
          >
            <ToggleButton value="daily">Günlük</ToggleButton>
            <ToggleButton value="weekly">Haftalık</ToggleButton>
            <ToggleButton value="monthly">Aylık</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <CollectionStats data={dashboardData.collectionStats} period={period} loading={loading} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <CollectionChart data={dashboardData.collectionChart} period={period} loading={loading} />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <InventoryOverview
              criticalStock={dashboardData.inventory.criticalStock}
              categoryDistribution={dashboardData.inventory.categoryDistribution}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RecentTransactions
              invoices={dashboardData.transactions.invoices}
              payments={dashboardData.transactions.payments}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Reminders />
          </Grid>
        </Grid>
      </PageContainer>
    </MainLayout>
  );
}
