'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tab,
  Tabs,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axios from 'axios';
import { StatusChip } from '@/components/StatusChip';
import { B2BOrderStatus, B2BOrderStatusType } from '@/types/b2b';

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: B2BOrderStatusType;
  totalFinalPrice: number;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryMethod?: {
    name: string;
  };
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<B2BOrderStatusType | 'all'>('all');

  // Fetch orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['b2b-orders', statusFilter],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await axios.get<{ data: Order[] }>('/b2b/orders', { params });
      return res.data.data || [];
    },
  });

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const stats = {
    all: orders.length,
    [B2BOrderStatus.PENDING]: orders.filter((o) => o.status === B2BOrderStatus.PENDING).length,
    [B2BOrderStatus.APPROVED]: orders.filter((o) => o.status === B2BOrderStatus.APPROVED).length,
    [B2BOrderStatus.EXPORTED_TO_ERP]: orders.filter((o) => o.status === B2BOrderStatus.EXPORTED_TO_ERP).length,
    [B2BOrderStatus.REJECTED]: orders.filter((o) => o.status === B2BOrderStatus.REJECTED).length,
    [B2BOrderStatus.CANCELLED]: orders.filter((o) => o.status === B2BOrderStatus.CANCELLED).length,
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Siparişlerim
        </Typography>
      </Box>

      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Tümü <Chip label={stats.all} size="small" sx={{ ml: 1 }} />
              </Box>
            }
            value="all"
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Bekleyen <Chip label={stats[B2BOrderStatus.PENDING]} size="small" sx={{ ml: 1 }} />
              </Box>
            }
            value={B2BOrderStatus.PENDING}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Onaylı <Chip label={stats[B2BOrderStatus.APPROVED]} size="small" sx={{ ml: 1 }} />
              </Box>
            }
            value={B2BOrderStatus.APPROVED}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                İşlem Alındı <Chip label={stats[B2BOrderStatus.EXPORTED_TO_ERP]} size="small" sx={{ ml: 1 }} />
              </Box>
            }
            value={B2BOrderStatus.EXPORTED_TO_ERP}
          />
        </Tabs>
      </Box>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Sipariş bulunamadı
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {statusFilter === 'all'
              ? 'Henüz siparişiniz yok. Katalogdan ürünleri inceleyerek sipariş oluşturun.'
              : 'Bu statüde siparişiniz yok.'}
          </Typography>
          {statusFilter !== 'all' && (
            <Button
              variant="outlined"
              onClick={() => setStatusFilter('all')}
              sx={{ mt: 2 }}
            >
              Tüm Siparişleri Gör
            </Button>
          )}
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              variant="outlined"
              component={Link}
              href={`/orders/${order.id}`}
              sx={{
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')} · {order.items.length} ürün
                    </Typography>
                    {order.deliveryMethod && (
                      <Typography variant="caption" color="textSecondary">
                        Teslimat: {order.deliveryMethod.name}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      alignItems: { xs: 'center', sm: 'flex-end' },
                      gap: 1,
                    }}
                  >
                    <StatusChip status={order.status} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {order.totalFinalPrice.toFixed(2)} ₺
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
