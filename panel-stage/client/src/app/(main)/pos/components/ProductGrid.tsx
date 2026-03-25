'use client';

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Chip, TextField } from '@mui/material';
import { usePosStore } from '@/stores/posStore';
import axios from '@/lib/axios';

export default function ProductGrid() {
  const { addToCart, setVariantDialogOpen, setSelectedProductForVariant } = usePosStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // Kategorileri çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        const kategoriData = response.data || [];
        const kategoriMap: Record<string, string[]> = {};
        kategoriData.forEach((k: { mainCategory: string; subCategories: string[] }) => {
          kategoriMap[k.mainCategory] = k.subCategories || [];
        });
        setCategories(kategoriMap);
      } catch (error) {
        console.error('Kategori listesi alınamadı:', error);
      }
    };
    fetchCategories();
  }, []);

  // Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/products', {
          params: {
            search: searchQuery || undefined,
            limit: 100,
            page: 1,
          },
        });
        const rawData = response.data.data || [];
        setProducts(rawData);
      } catch (error) {
        console.error('Ürün listesi alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  // Kategori filtreleme
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product) => product.mainCategory === selectedCategory);
  }, [products, selectedCategory]);

  const handleProductClick = (product: any) => {
    const vatRate = product.vatRate || 20;
    const netPrice = parseFloat(product.salePrice || product.satisFiyati || 0);
    const inclusivePrice = netPrice * (1 + vatRate / 100);

    if (product.hasVariants) {
      setSelectedProductForVariant({
        productId: product.id,
        name: product.name,
        unitPrice: inclusivePrice,
        vatRate: vatRate,
      });
      setVariantDialogOpen(true);
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: inclusivePrice,
        vatRate: vatRate,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Category Tabs */}
      <Box sx={{
        mb: 2,
        bgcolor: 'var(--surface)',
        borderRadius: 'var(--r)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue as string)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: 'var(--accent)',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              minWidth: 100,
              color: 'var(--muted)',
              '&.Mui-selected': {
                color: 'var(--text)',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab label="Tümü" value="all" />
          {Object.keys(categories).map((kategori) => (
            <Tab key={kategori} label={kategori} value={kategori} />
          ))}
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Ürün ara veya barkod gir..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          id="pos-search-input"
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ mr: 1, fontSize: '1.2rem', opacity: 0.5 }}>🔍</Box>
              ),
              sx: {
                borderRadius: 'var(--r)',
                bgcolor: 'var(--surface2)',
                '& fieldset': { borderColor: 'var(--border)' },
                '&:hover fieldset': { borderColor: 'var(--accent)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
                color: 'var(--text)',
              }
            }
          }}
        />
      </Box>

      {/* Product List */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CircularProgress size={40} sx={{ color: 'var(--accent)' }} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 2,
            px: 1
          }}>
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                onClick={() => handleProductClick(product)}
                sx={{
                  position: 'relative',
                  bgcolor: 'var(--surface2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)',
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '200px',
                  justifyContent: 'space-between',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--accent)',
                    transform: 'translateY(-8px) scale(1.02)',
                    '& .product-price-tag': {
                      bgcolor: 'var(--accent)',
                      color: 'white',
                      transform: 'scale(1.1)'
                    },
                    '& .category-accent': {
                      width: '60%',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)'
                  }
                }}
              >
                {/* Category Accent Selection */}
                <Box
                  className="category-accent"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30%',
                    height: '4px',
                    bgcolor: 'var(--accent)',
                    borderRadius: '0 0 4px 4px',
                    opacity: 0.4,
                    transition: 'all 0.3s ease'
                  }}
                />

                {/* Product Name */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: 'var(--text)',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                    fontSize: '0.95rem'
                  }}
                >
                  {product.name}
                </Typography>

                <Box sx={{ width: '100%', mt: 'auto' }}>
                  {/* Price Tag */}
                  <Box
                    className="product-price-tag"
                    sx={{
                      display: 'inline-block',
                      px: 2.5,
                      py: 1,
                      borderRadius: 'var(--rs)',
                      bgcolor: 'var(--surface3)',
                      color: 'var(--text)',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease',
                      mb: 2,
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {formatCurrency(
                      parseFloat(product.salePrice || product.satisFiyati || 0) * (1 + (product.vatRate || 20) / 100)
                    )}
                  </Box>

                  {/* Variant / Info Chip */}
                  <Box sx={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.hasVariants ? (
                      <Chip
                        label="VARYANT SEÇ"
                        size="small"
                        sx={{
                          bgcolor: 'var(--accent)',
                          color: 'white',
                          fontWeight: 900,
                          borderRadius: '6px',
                          fontSize: '0.65rem',
                          letterSpacing: '0.08em',
                          px: 1
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Hızlı Ekle +
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 256, textAlign: 'center', py: 8 }}>
              <Box component="span" sx={{ fontSize: '4rem', mb: 2 }}>📦</Box>
              <Typography variant="h6" sx={{ color: 'var(--muted)', mb: 1 }}>
                Ürün bulunamadı
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--muted)', opacity: 0.7 }}>
                Farklı bir arama terimi deneyin veya kategori değiştirin
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}