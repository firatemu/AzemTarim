'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  PendingActions as PendingActionsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axios from 'axios';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';
import { RiskBanner } from '@/components/RiskBanner';
import { StatusChip } from '@/components/StatusChip';

type DashboardStats = {
  openOrders: number;
  pendingOrders: number;
  balance: number;
  overdueAmount: number;
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalFinalPrice: number;
  items: Array<{ productName: string; quantity: number }>;
};

type RiskStatus = {
  status: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  creditLimit?: number;
  balance?: number;
  overdueAmount?: number;
};

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['b2b-dashboard-stats'],
    queryFn: async () => {
      const res = await axios.get<DashboardStats>('/b2b/dashboard/stats');
      return res.data;
    },
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['b2b-recent-orders'],
    queryFn: async () => {
      const res = await axios.get<{ data: RecentOrder[] }>('/b2b/orders', {
        params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
      });
      return res.data.data || [];
    },
  });

  // Fetch risk status
  const { data: riskStatus } = useQuery({
    queryKey: ['b2b-risk-status'],
    queryFn: async () => {
      const res = await axios.get<RiskStatus>('/b2b/account/risk');
      return res.data;
    },
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hoş Geldiniz!
        </Typography>
        <Typography variant="body2" color="textSecondary">
          B2B portalınız üzerinden siparişlerinizi yönetebilirsiniz.
        </Typography>
      </Box>

      {/* Risk Banner */}
      {riskStatus && riskStatus.status !== 'OK' && (
        <RiskBanner
          status={riskStatus.status}
          creditLimit={riskStatus.creditLimit}
          balance={riskStatus.balance}
          overdueAmount={riskStatus.overdueAmount}
        />
      )}

      {/* Advertisements */}
      <AdvertisementCarousel location="homepage" />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              textDecoration: 'none',
              height: '100%',
              cursor: 'pointer',
            }}
            component={Link}
            href="/orders"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'warning.light',
                    color: 'warning.dark',
                  }}
                >
                  <PendingActionsIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Bekleyen
                  </Typography>
                  <Typography variant="h5">
                    {stats?.pendingOrders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              textDecoration: 'none',
              height: '100%',
              cursor: 'pointer',
            }}
            component={Link}
            href="/orders"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'info.light',
                    color: 'info.dark',
                  }}
                >
                  <ShoppingCartIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Açık Siparişler
                  </Typography>
                  <Typography variant="h5">
                    {stats?.openOrders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              textDecoration: 'none',
              height: '100%',
              cursor: 'pointer',
            }}
            component={Link}
            href="/account"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: stats && stats.balance < 0 ? 'error.light' : 'success.light',
                    color: stats && stats.balance < 0 ? 'error.dark' : 'success.dark',
                  }}
                >
                  <TrendingUpIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Bakiye
                  </Typography>
                  <Typography variant="h5">
                    {stats?.balance?.toFixed(2) || '0.00'} ₺
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              textDecoration: 'none',
              height: '100%',
              cursor: 'pointer',
            }}
            component={Link}
            href="/account"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: stats && stats.overdueAmount > 0 ? 'error.light' : 'success.light',
                    color: stats && stats.overdueAmount > 0 ? 'error.dark' : 'success.dark',
                  }}
                >
                  {stats && stats.overdueAmount > 0 ? (
                    <ErrorIcon fontSize="large" />
                  ) : (
                    <CheckCircleIcon fontSize="large" />
                  )}
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Vadesi Geçmiş
                  </Typography>
                  <Typography variant="h5">
                    {stats?.overdueAmount?.toFixed(2) || '0.00'} ₺
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Son Siparişlerim</Typography>
                <Button component={Link} href="/orders" size="small">
                  Tümünü Gör
                </Button>
              </Box>

              <Stack spacing={1}>
                {recentOrders.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                    Henüz siparişiniz yok
                  </Typography>
                ) : (
                  recentOrders.map((order) => (
                    <Card
                      key={order.id}
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                      component={Link}
                      href={`/orders/${order.id}`}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')} · {order.items.length} ürün
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <StatusChip status={order.status as any} />
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {order.totalFinalPrice.toFixed(2)} ₺
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hızlı İşlemler
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  href="/catalog"
                  startIcon={<ShoppingCartIcon />}
                >
                  Ürün Katalogu
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  href="/cart"
                >
                  Sepeti Görüntüle
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  href="/account"
                >
                  Hesap Bilgileri
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  href="/notifications"
                >
                  Bildirimler
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
