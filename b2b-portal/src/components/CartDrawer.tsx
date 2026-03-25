'use client';

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    stockCode: string;
    imageUrl?: string;
    finalPrice: number;
  };
  quantity: number;
  finalPrice: number;
}

interface CartData {
  items: CartItem[];
  totalListPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const queryClient = useQueryClient();

  // Fetch cart
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['b2b-cart'],
    queryFn: async () => {
      const res = await axios.get<CartData>('/b2b/cart');
      return res.data;
    },
    enabled: open,
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

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cartData?.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const items = cartData?.items || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, maxWidth: '95vw' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon />
            <Typography variant="h6">Sepetim</Typography>
            <Typography variant="body2" color="textSecondary">
              ({items.length} ürün)
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {isLoading ? (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
              Yükleniyor...
            </Typography>
          ) : items.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">Sepetiniz boş</Typography>
              <Typography variant="body2">
                Ürün eklemek için kataloga göz atın
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.product.imageUrl ? (
                      <Box
                        component="img"
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Görsel Yok
                      </Typography>
                    )}
                  </Box>

                  {/* Product Info & Quantity */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                      {item.product.stockCode}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        InputProps={{
                          readOnly: true,
                          sx: { width: 60, textAlign: 'center' },
                        }}
                        sx={{ '& input': { textAlign: 'center' } }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Price & Remove */}
                  <Box sx={{ textAlign: 'right' }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.finalPrice.toFixed(2)} ₺
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.product.finalPrice.toFixed(2)} ₺/adet
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Summary & Checkout */}
        {items.length > 0 && cartData && (
          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              p: 2,
              bgcolor: 'background.paper',
            }}
          >
            {/* Price Breakdown */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Ara Toplam
                </Typography>
                <Typography variant="body2">
                  {cartData.totalListPrice.toFixed(2)} ₺
                </Typography>
              </Box>
              {cartData.totalDiscountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="success.main">
                    İndirim
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -{cartData.totalDiscountAmount.toFixed(2)} ₺
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Toplam</Typography>
                <Typography variant="h6" color="primary.main">
                  {cartData.totalFinalPrice.toFixed(2)} ₺
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Button
              fullWidth
              variant="contained"
              component={Link}
              href="/cart"
              onClick={onClose}
              size="large"
            >
              Siparişi Tamamla
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
