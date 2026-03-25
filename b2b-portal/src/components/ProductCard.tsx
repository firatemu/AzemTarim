'use client';

import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { PriceDisplay } from './PriceBreakdown';

interface ProductCardProps {
  id: string;
  name: string;
  stockCode: string;
  brand?: string;
  category?: string;
  finalPrice: number;
  listPrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  minOrderQuantity: number;
  onAddToCart?: (productId: string, quantity: number) => void;
  showAddButton?: boolean;
}

export function ProductCard({
  id,
  name,
  stockCode,
  brand,
  category,
  finalPrice,
  listPrice,
  imageUrl,
  isAvailable,
  minOrderQuantity,
  onAddToCart,
  showAddButton = true,
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(minOrderQuantity);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
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
      setQuantity(minOrderQuantity);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Sepete eklenemedi');
    },
  });

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id, quantity);
    } else {
      addToCartMutation.mutate({ productId: id, qty: quantity });
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + minOrderQuantity);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(minOrderQuantity, prev - minOrderQuantity));
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isAvailable ? 1 : 0.6,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Availability Badge */}
      {!isAvailable && (
        <Chip
          label="Stokta Yok"
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}

      {/* Product Image */}
      <Link href={`/catalog/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardMedia
          component="div"
          sx={{
            height: 200,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              Görsel Yok
            </Typography>
          )}
        </CardMedia>
      </Link>

      {/* Product Info */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/catalog/${id}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {name}
          </Typography>
        </Link>

        <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
          {stockCode}
        </Typography>

        {(brand || category) && (
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            {brand && (
              <Chip label={brand} size="small" variant="outlined" sx={{ height: 20 }} />
            )}
            {category && (
              <Chip label={category} size="small" variant="outlined" sx={{ height: 20 }} />
            )}
          </Stack>
        )}

        <Box sx={{ mt: 'auto' }}>
          <PriceDisplay listPrice={listPrice} finalPrice={finalPrice} />

          {showAddButton && isAvailable && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <IconButton size="small" onClick={handleDecrement} disabled={quantity <= minOrderQuantity}>
                  -
                </IconButton>
                <Typography variant="body2" sx={{ px: 1, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton size="small" onClick={handleIncrement}>
                  +
                </IconButton>
              </Box>

              <Button
                variant="contained"
                size="small"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                sx={{ flexGrow: 1 }}
              >
                Sepete Ekle
              </Button>
            </Box>
          )}

          {!isAvailable && (
            <Button variant="outlined" size="small" disabled fullWidth sx={{ mt: 1 }}>
              Stokta Yok
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
