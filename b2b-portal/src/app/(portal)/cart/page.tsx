'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  IconButton,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { RiskBanner } from '@/components/RiskBanner';
import { PriceBreakdown } from '@/components/PriceBreakdown';

type CartItem = {
  id: string;
  product: {
    id: string;
    name: string;
    stockCode: string;
    imageUrl?: string;
    listPrice: number;
    finalPrice: number;
    minOrderQuantity: number;
  };
  quantity: number;
  finalPrice: number;
};

type CartData = {
  items: CartItem[];
  totalListPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
};

type DeliveryMethod = {
  id: string;
  name: string;
};

type RiskStatus = {
  status: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  creditLimit?: number;
  balance?: number;
  overdueAmount?: number;
};

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deliveryMethodId, setDeliveryMethodId] = useState('');
  const [note, setNote] = useState('');
  const [showRiskBanner, setShowRiskBanner] = useState(true);

  // Fetch cart
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['b2b-cart'],
    queryFn: async () => {
      const res = await axios.get<CartData>('/b2b/cart');
      return res.data;
    },
  });

  // Fetch delivery methods
  const { data: deliveryMethods = [] } = useQuery({
    queryKey: ['b2b-delivery-methods'],
    queryFn: async () => {
      const res = await axios.get<DeliveryMethod[]>('/b2b/delivery-methods');
      return res.data || [];
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

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await axios.patch(`/b2b/cart/items/${itemId}`, { quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-cart'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-cart-count'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Miktar güncellenemedi');
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await axios.delete(`/b2b/cart/items/${itemId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-cart'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-cart-count'] });
      toast.success('Ürün sepetten çıkarıldı');
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b/orders', {
        deliveryMethodId,
        note: note || undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Siparişiniz alındı: ${data.orderNumber}`);
      queryClient.invalidateQueries({ queryKey: ['b2b-cart'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-cart-count'] });
      router.push(`/orders/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Sipariş oluşturulamadı');
    },
  });

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cartData?.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < item.product.minOrderQuantity) return;

    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handlePlaceOrder = () => {
    if (!deliveryMethodId) {
      toast.error('Lütfen teslimat yöntemi seçin');
      return;
    }

    if (riskStatus?.status === 'BLOCKED') {
      toast.error('Risk durumunuz nedeniyle sipariş oluşturulamıyor');
      return;
    }

    placeOrderMutation.mutate();
  };

  const items = cartData?.items || [];
  const canPlaceOrder = items.length > 0 && deliveryMethodId && riskStatus?.status !== 'BLOCKED';

  if (cartLoading) {
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          component={Link}
          href="/catalog"
          startIcon={<ArrowBackIcon />}
        >
          Alışverişe Dön
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Alışveriş Sepeti
        </Typography>
      </Box>

      {/* Risk Banner */}
      {riskStatus && showRiskBanner && riskStatus.status !== 'OK' && (
        <RiskBanner
          status={riskStatus.status}
          creditLimit={riskStatus.creditLimit}
          balance={riskStatus.balance}
          overdueAmount={riskStatus.overdueAmount}
          onClose={() => setShowRiskBanner(false)}
        />
      )}

      {items.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Sepetiniz boş
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Ürün eklemek için kataloga göz atın
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/catalog"
          >
            Kataloga Git
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sepet Ürünleri ({items.length})
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ürün</TableCell>
                      <TableCell align="right">Adet</TableCell>
                      <TableCell align="right">Fiyat</TableCell>
                      <TableCell align="right">Toplam</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {item.product.imageUrl && (
                              <Box
                                component="img"
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            )}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.product.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {item.product.stockCode}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= item.product.minOrderQuantity}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2">
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.product.finalPrice.toFixed(2)} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.finalPrice.toFixed(2)} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemove(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Order Summary & Checkout */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              {/* Price Summary */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sipariş Özeti
                </Typography>
                {cartData && (
                  <PriceBreakdown
                    listPrice={cartData.totalListPrice}
                    classDiscount={0}
                    campaignDiscount={cartData.totalDiscountAmount}
                    finalPrice={cartData.totalFinalPrice}
                  />
                )}
              </Paper>

              {/* Order Details Form */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sipariş Detayları
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel>Teslimat Yöntemi</InputLabel>
                    <Select
                      value={deliveryMethodId}
                      onChange={(e) => setDeliveryMethodId(e.target.value)}
                      label="Teslimat Yöntemi"
                    >
                      {deliveryMethods.map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    id="b2b-cart-note"
                    fullWidth
                    multiline
                    rows={3}
                    label="Sipariş Notu (Opsiyonel)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Siparişinizle ilgili notlarınızı buraya yazabilirsiniz..."
                    inputProps={{ maxLength: 500 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handlePlaceOrder}
                    disabled={!canPlaceOrder || placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? 'İşleniyor...' : 'Siparişi Tamamla'}
                  </Button>

                  {!canPlaceOrder && items.length > 0 && !deliveryMethodId && (
                    <Typography variant="caption" color="textSecondary" align="center">
                      Teslimat yöntemi seçin
                    </Typography>
                  )}
                </Stack>
              </Paper>

              {/* Risk Warning */}
              {riskStatus && riskStatus.status === 'BLOCKED' && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography variant="body2" color="error.dark">
                    <strong>Risk Uyarısı:</strong> Hesap bakiyeniz veya vadesi geçmiş faturalarınız nedeniyle sipariş oluşturulamıyor.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
