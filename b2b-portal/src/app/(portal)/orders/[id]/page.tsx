'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { StatusChip } from '@/components/StatusChip';
import { PriceBreakdown } from '@/components/PriceBreakdown';

type OrderItem = {
  productName: string;
  stockCode: string;
  quantity: number;
  listPrice: number;
  customerClassDiscount: number;
  campaignDiscount: number;
  finalPrice: number;
};

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalListPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
  items: OrderItem[];
  deliveryMethod?: {
    name: string;
  };
  deliveryBranchName?: string;
  note?: string | null;
  erpOrderId?: string;
  customer?: {
    name: string;
    email: string;
  };
  salesperson?: {
    name: string;
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['b2b-order', id],
    queryFn: async () => {
      const res = await axios.get<Order>(`/b2b/orders/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          component={Link}
          href="/orders"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Siparişlere Dön
        </Button>
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Sipariş bulunamadı
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          component={Link}
          href="/orders"
          startIcon={<ArrowBackIcon />}
        >
          Siparişlere Dön
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {order.orderNumber}
        </Typography>
        <StatusChip status={order.status as any} />
      </Box>

      {/* Order Status Timeline */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sipariş Durumu
        </Typography>
        <Stack spacing={1} direction="row" sx={{ flexWrap: 'wrap' }}>
          <Chip
            label={`Oluşturuldu: ${new Date(order.createdAt).toLocaleString('tr-TR')}`}
            size="small"
            color="default"
          />
          {order.status !== 'PENDING' && (
            <Chip label="Onaylandı" size="small" color="info" />
          )}
          {order.status === 'EXPORTED_TO_ERP' && (
            <Chip label="ERP'ye Aktarıldı" size="small" color="success" />
          )}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Items Table */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sipariş Kalemleri
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün</TableCell>
                        <TableCell align="right">Adet</TableCell>
                        <TableCell align="right">Liste Fiyatı</TableCell>
                        <TableCell align="right">İndirim</TableCell>
                        <TableCell align="right">Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.productName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.stockCode}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.listPrice.toFixed(2)} ₺</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            {((item.customerClassDiscount + item.campaignDiscount) / item.listPrice * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {item.finalPrice.toFixed(2)} ₺
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fiyat Özeti
                </Typography>
                <PriceBreakdown
                  listPrice={order.totalListPrice}
                  classDiscount={order.items.reduce((sum: any, item: any) => sum + item.customerClassDiscount, 0)}
                  campaignDiscount={order.items.reduce((sum: any, item: any) => sum + item.campaignDiscount, 0)}
                  finalPrice={order.totalFinalPrice}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Delivery & Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Delivery Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon fontSize="small" />
                  Teslimat Bilgisi
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Teslimat Yöntemi
                    </Typography>
                    <Typography variant="body2">
                      {order.deliveryMethod?.name || '—'}
                    </Typography>
                  </Box>
                  {order.deliveryBranchName && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Teslimat Şubesi
                      </Typography>
                      <Typography variant="body2">
                        {order.deliveryBranchName}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Note */}
            {order.note && (
              <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon fontSize="small" />
                  Sipariş Notu
                </Typography>
                <Typography variant="body2">
                  {order.note}
                </Typography>
              </CardContent>
            </Card>
            )}

            {/* Salesperson */}
            {order.salesperson && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Satış Temsilcisi
                  </Typography>
                  <Typography variant="body2">
                    {order.salesperson.name}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              href="/catalog"
            >
              Yeni Sipariş Oluştur
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
