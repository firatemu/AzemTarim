'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

type Product = {
  id: string;
  stockCode: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  unit: string | null;
  oemCode: string | null;
  supplierCode: string | null;
  minOrderQuantity: number;
  imageUrl: string | null;
};

type Pricing = {
  listUnit: number;
  customerClassDiscountUnit: number;
  campaignDiscountUnit: number;
  finalUnit: number;
};

type StockWarehouse = {
  warehouseId: string;
  warehouseName: string;
  isAvailable: boolean;
};

type ProductDetail = {
  product: Product & { stocks: StockWarehouse[] };
  pricing: Pricing;
  stockPresentation: 'INDIVIDUAL' | 'COMBINED';
  inStock: boolean;
  warehouses: StockWarehouse[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['b2b-product', productId],
    queryFn: async () => {
      const res = await axios.get<ProductDetail>(`/b2b/catalog/products/${productId}`);
      return res.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (qty: number) => {
      const res = await axios.post('/b2b/cart/items', {
        productId,
        quantity: qty,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-cart'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-cart-count'] });
      toast.success('Ürün sepete eklendi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Ürün sepete eklenemedi');
    },
  });

  const handleQuantityChange = (delta: number) => {
    if (!productData) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= productData.product.minOrderQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate(quantity);
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

  if (error || !productData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          component={Link}
          href="/catalog"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Kataloğa Dön
        </Button>
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Ürün bulunamadı
          </Typography>
        </Paper>
      </Container>
    );
  }

  const { product, pricing, inStock, stockPresentation, warehouses } = productData;
  const total = pricing.finalUnit * quantity;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          component={Link}
          href="/catalog"
          startIcon={<ArrowBackIcon />}
        >
          Kataloğa Dön
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {product.name}
        </Typography>
        {inStock ? (
          <Chip label="Stokta Var" color="success" size="small" />
        ) : (
          <Chip label="Stokta Yok" color="error" size="small" />
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
        }}
      >
        {/* Left Column - Product Image */}
        <Stack spacing={2}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {product.imageUrl ? (
                <Box
                  component="img"
                  src={product.imageUrl}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Görsel Yok
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Stock Info */}
          {stockPresentation === 'INDIVIDUAL' && warehouses.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Stok Durumu
                </Typography>
                <Stack spacing={1}>
                  {warehouses.map((wh) => (
                    <Box
                      key={wh.warehouseId}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: wh.isAvailable ? 'success.main' : 'error.main',
                        }}
                      />
                      <Typography variant="body2">
                        {wh.warehouseName}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {stockPresentation === 'COMBINED' && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Stok Durumu
                </Typography>
                <Typography variant="body2">
                  {inStock ? 'Mevcut' : 'Stokta Yok'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Right Column - Product Details */}
        <Stack spacing={3}>
          {/* Product Info */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {product.name}
              </Typography>

              <Stack spacing={1} sx={{ mb: 2 }}>
                {product.stockCode && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Stok Kodu:</strong> {product.stockCode}
                  </Typography>
                )}
                {product.brand && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Marka:</strong> {product.brand}
                  </Typography>
                )}
                {product.category && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Kategori:</strong> {product.category}
                  </Typography>
                )}
                {product.unit && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Birim:</strong> {product.unit}
                  </Typography>
                )}
                {product.oemCode && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>OEM Kodu:</strong> {product.oemCode}
                  </Typography>
                )}
                {product.supplierCode && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tedarikçi Kodu:</strong> {product.supplierCode}
                  </Typography>
                )}
              </Stack>

              {product.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fiyat Bilgisi
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Liste Fiyatı
                  </Typography>
                  <Typography variant="body2">
                    {pricing.listUnit.toFixed(2)} ₺
                  </Typography>
                </Box>

                {pricing.customerClassDiscountUnit > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Müşteri Sınıfı İskontosu
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{pricing.customerClassDiscountUnit.toFixed(2)} ₺
                    </Typography>
                  </Box>
                )}

                {pricing.campaignDiscountUnit > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Kampanya İskontosu
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{pricing.campaignDiscountUnit.toFixed(2)} ₺
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Birim Fiyat
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {pricing.finalUnit.toFixed(2)} ₺
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Quantity & Add to Cart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sipariş
              </Typography>

              <Stack spacing={3}>
                {/* Quantity Selector */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Adet (Min: {product.minOrderQuantity})
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      maxWidth: 200,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= product.minOrderQuantity}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{ minWidth: 60, textAlign: 'center' }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Total */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {total.toFixed(2)} ₺
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Toplam:</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {total.toFixed(2)} ₺
                    </Typography>
                  </Box>
                </Box>

                {/* Add to Cart Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={!inStock || addToCartMutation.isPending}
                >
                  {!inStock
                    ? 'Stokta Yok'
                    : addToCartMutation.isPending
                    ? 'Ekleniyor...'
                    : 'Sepete Ekle'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
