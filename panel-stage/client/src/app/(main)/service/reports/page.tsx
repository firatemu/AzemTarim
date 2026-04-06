'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Inventory,
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Receipt,
  Analytics,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import axios from '@/lib/axios';
import { StandardPage, StandardCard } from '@/components/common';

type ServisStats = {
  workOrders?: {
    total: number;
    waitingDiagnosis: number;
    pendingApproval: number;
    inProgress: number;
    invoiced: number;
    byStatus?: Record<string, number>;
  };
  partRequests?: { pending: number };
  revenue?: { thisMonth: number; invoiceCount: number };
};

const STATUS_LABELS: Record<string, string> = {
  WAITING_DIAGNOSIS: 'Beklemede',
  PENDING_APPROVAL: 'Müşteri Onayı Bekliyor',
  APPROVED_IN_PROGRESS: 'Yapım Aşamasında',
  PART_WAITING: 'Parça Bekliyor',
  PARTS_SUPPLIED: 'Parçalar Tedarik Edildi',
  VEHICLE_READY: 'Araç Hazır',
  INVOICED_CLOSED: 'Fatura Oluşturuldu',
  CLOSED_WITHOUT_INVOICE: 'Faturasız Kapandı',
  CANCELLED: 'İptal',
};

const STATUS_COLORS: Record<string, string> = {
  WAITING_DIAGNOSIS: '#94a3b8',
  PENDING_APPROVAL: '#f59e0b',
  APPROVED_IN_PROGRESS: '#6366f1',
  PART_WAITING: '#ef4444',
  PARTS_SUPPLIED: '#3b82f6',
  VEHICLE_READY: '#10b981',
  INVOICED_CLOSED: '#10b981',
  CLOSED_WITHOUT_INVOICE: '#64748b',
  CANCELLED: '#ef4444',
};

export default function ServisRaporlarPage() {
  const [stats, setStats] = useState<ServisStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/work-orders/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

  const chartData = stats?.workOrders?.byStatus
    ? Object.entries(stats.workOrders.byStatus)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] ?? status,
        count,
        fill: STATUS_COLORS[status] ?? '#6366f1',
      }))
    : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <StandardPage>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
          Servis Raporları
        </Typography>
        <Typography variant="body2" color="text.secondary">Servis operasyonları ve performans metriklerine genel bakış.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StandardCard sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ bgcolor: alpha('#6366f1', 0.1), p: 1.5, borderRadius: 2 }}>
                <Assignment sx={{ color: 'primary.main', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats?.workOrders?.total ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOPLAM İŞ EMRİ
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StandardCard sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), p: 1.5, borderRadius: 2 }}>
                <Schedule sx={{ color: '#f59e0b', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats?.workOrders?.inProgress ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  DEVAM EDEN
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StandardCard sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ bgcolor: alpha('#ef4444', 0.1), p: 1.5, borderRadius: 2 }}>
                <Inventory sx={{ color: '#ef4444', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats?.partRequests?.pending ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  BEKLEYEN PARÇA TALEBİ
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StandardCard sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1.5, borderRadius: 2 }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {formatCurrency(stats?.revenue?.thisMonth ?? 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  BU AY GELİR ({stats?.revenue?.invoiceCount ?? 0} fatura)
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <StandardCard sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
              İş Emri Durum Dağılımı
            </Typography>
            {chartData.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                <Analytics sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography color="text.secondary" fontWeight={600}>Henüz veri bulunmuyor</Typography>
              </Box>
            ) : (
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.05)} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fill: 'text.secondary', fontWeight: 600, fontSize: 13 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: alpha('#000', 0.02) }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid ' + alpha('#000', 0.1),
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                      }}
                      itemStyle={{ color: 'primary' }}
                      formatter={(value: number) => [value, 'Adet']}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 8, 8, 0]}
                      barSize={32}
                      animationDuration={1500}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </StandardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <StandardCard sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 700, letterSpacing: '0.05em' }}>
                DURUM ÖZETİ
              </Typography>
              <Stack spacing={1.5}>
                {stats?.workOrders?.total ? (
                  <>
                    <SummaryRow icon={<HourglassEmpty />} color="#94a3b8" label="Beklemede" value={stats.workOrders.waitingDiagnosis ?? 0} />
                    <SummaryRow icon={<Schedule />} color="#f59e0b" label="Müşteri Onayı" value={stats.workOrders.pendingApproval ?? 0} />
                    <SummaryRow icon={<Assignment />} color="#6366f1" label="Yapım Aşamasında" value={stats.workOrders.inProgress ?? 0} />
                    <SummaryRow icon={<Inventory />} color="#ef4444" label="Parça Bekliyor" value={(stats.workOrders as any).partWaiting ?? 0} />
                    <SummaryRow icon={<Inventory />} color="#3b82f6" label="Tedarik Edildi" value={(stats.workOrders as any).partsSupplied ?? 0} />
                    <SummaryRow icon={<Schedule />} color="#10b981" label="Araç Hazır" value={(stats.workOrders as any).vehicleReady ?? 0} />
                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                    <SummaryRow icon={<CheckCircle />} color="#10b981" label="Faturalandı" value={stats.workOrders.invoiced ?? 0} />
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">Henüz iş emri bulunmuyor.</Typography>
                )}
              </Stack>
            </StandardCard>

            <StandardCard sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.05em' }}>
                GELİR ÖZETİ (AYLIK)
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Receipt sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={600}>Fatura Adedi</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={800}>{stats?.revenue?.invoiceCount ?? 0} Adet</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha('#10b981', 0.05), p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600} color="success.main">Toplam Gelir</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={900} color="success.main">{formatCurrency(stats?.revenue?.thisMonth ?? 0)}</Typography>
                </Box>
              </Stack>
            </StandardCard>
          </Stack>
        </Grid>
      </Grid>
    </StandardPage>
  );
}

function SummaryRow({ icon, color, label, value }: { icon: React.ReactNode, color: string, label: string, value: number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight={800}>{value}</Typography>
    </Box>
  );
}
