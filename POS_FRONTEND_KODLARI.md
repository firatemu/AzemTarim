# POS Frontend Tüm Kodları

## 1. Ana Sayfa (page.tsx)
```typescript
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import VariantDialog from './components/VariantDialog';
import { usePosStore } from '@/stores/posStore';

export default function PosPage() {
  const { setActiveCart, addToCart } = usePosStore();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info',
  });
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveCart('default');
  }, [setActiveCart]);

  const processBarcode = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;
    try {
      const res = await fetch('/api/pos/products/barcode/' + encodeURIComponent(barcode), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setSnackbar({ open: true, message: 'Ürün araması başarısız', severity: 'error' });
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setSnackbar({ open: true, message: 'Ürün bulunamadı', severity: 'error' });
        return;
      }
      const product = data[0];
      if (product.productVariants?.length) {
        setSnackbar({ open: true, message: 'Varyantlı ürün - lütfen seçiniz', severity: 'info' });
        return;
      }
      addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: Number(product.salePrice) || 0,
        vatRate: product.vatRate ?? 20,
        discountRate: 0,
      });
      setSnackbar({ open: true, message: product.name + ' sepete eklendi', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Barkod işleme hatası', severity: 'error' });
    }
  }, [addToCart]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) {
        return;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          e.preventDefault();
          const b = bufferRef.current;
          bufferRef.current = '';
          processBarcode(b);
        }
        return;
      }
      if (e.key === 'Escape') {
        bufferRef.current = '';
        return;
      }
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        bufferRef.current += e.key;
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 0) {
            const b = bufferRef.current;
            bufferRef.current = '';
            processBarcode(b);
          }
          timeoutRef.current = null;
        }, 500);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [processBarcode]);

  return (
    <MainLayout>
      <Box sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        bgcolor: 'color-mix(in srgb, var(--background) 95%, #1e1b4b)',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Product Catalog */}
        <Box sx={{
          width: '60%',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          bgcolor: 'transparent',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {/* Header ... */}
          <Box sx={{
            mb: 3,
            px: 4,
            py: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
            }
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                letterSpacing: '-0.04em',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}
            >
              <Box component="span" sx={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>🛒</Box>
              Ürün Kataloğu
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, maxWidth: '600px' }}>
              Satış işlemleriniz için ürünleri tarayın veya kategoriler arasında hızlıca geçiş yapın.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'hidden' }}>
            <ProductGrid />
          </Box>
        </Box>

        {/* Right Panel - Cart */}
        <Box sx={{
          width: '40%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'var(--background)'
        }}>
          <CartPanel />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            minWidth: '400px',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-md)',
            '& .MuiAlert-message': { fontWeight: 600 }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <VariantDialog />
    </MainLayout>
  );
}
```

---

## 2. ProductGrid Bileşeni (ProductGrid.tsx)
```typescript
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
    if (product.hasVariants) {
      setSelectedProductForVariant(product);
      setVariantDialogOpen(true);
    } else {
      addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: parseFloat(product.salePrice || product.satisFiyati || 0),
        vatRate: product.vatRate || 20,
        discountRate: 0,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', h: '100%', overflowY: 'hidden' }}>
      {/* Category Tabs */}
      <Box sx={{
        mb: 2,
        bgcolor: 'var(--background)',
        borderRadius: 'var(--radius-md)',
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
              bgcolor: 'var(--primary)',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              minWidth: 100,
              color: 'var(--muted-foreground)',
              '&.Mui-selected': {
                color: 'var(--foreground)',
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
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ mr: 1, fontSize: '1.2rem', opacity: 0.5 }}>🔍</Box>
              ),
              sx: {
                borderRadius: 'var(--radius)',
                bgcolor: 'var(--background)',
                '& fieldset': { borderColor: 'var(--border)' },
                '&:hover fieldset': { borderColor: 'var(--secondary)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
              }
            }
          }}
        />
      </Box>

      {/* Product List */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CircularProgress size={40} sx={{ color: 'var(--primary)' }} />
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
                  bgcolor: 'var(--card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)',
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
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    borderColor: 'var(--primary)',
                    transform: 'translateY(-8px) scale(1.02)',
                    '& .product-price-tag': {
                      bgcolor: 'var(--primary)',
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
                    bgcolor: 'var(--primary)',
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
                    color: 'var(--foreground)',
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
                      borderRadius: 'var(--radius-md)',
                      bgcolor: 'color-mix(in srgb, var(--primary) 10%, var(--muted))',
                      color: '#1e1b4b',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease',
                      mb: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                      border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)'
                    }}
                  >
                    {formatCurrency(parseFloat(product.salePrice || product.satisFiyati || 0))}
                  </Box>

                  {/* Variant / Info Chip */}
                  <Box sx={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.hasVariants ? (
                      <Chip
                        label="VARYANT SEÇ"
                        size="small"
                        sx={{
                          bgcolor: 'var(--secondary)',
                          color: 'white',
                          fontWeight: 900,
                          borderRadius: '6px',
                          fontSize: '0.65rem',
                          letterSpacing: '0.08em',
                          px: 1
                        }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', itemsCenter: 'center', justifyContent: 'center', h: 256, textAlign: 'center', py: 8 }}>
              <Box component="span" sx={{ fontSize: '4rem', mb: 2 }}>📦</Box>
              <Typography variant="h6" sx={{ color: 'var(--muted-foreground)', mb: 1 }}>
                Ürün bulunamadı
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                Farklı bir arama terimi deneyin veya kategori değiştirin
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
```

---

## 3. CartPanel Bileşeni (CartPanel.tsx) - 1. KISIM
```typescript
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Money,
  CreditCard,
  AccountBalance,
  CardGiftcard,
  Payments,
  Person,
  Add,
  Remove,
} from '@mui/icons-material';
import { usePosStore } from '@/stores/posStore';
import ReceiptComponent from './ReceiptComponent';
import axios from '@/lib/axios';

export default function CartPanel() {
  const {
    carts,
    activeCartId,
    cartTotal,
    selectedCustomer,
    setSelectedCustomer,
    clearSelectedCustomer,
    payments,
    remainingAmount,
    addPayment,
    removePayment,
    removeFromCart,
    updateCartItem,
    completeCheckout,
    receiptDialogOpen,
    setReceiptDialogOpen,
    cashboxId,
    setCashbox,
  } = usePosStore();

  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [cashboxes, setCashboxes] = useState<any[]>([]);
  const [selectedCashbox, setSelectedCashbox] = useState<any | null>(null);
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    date: Date;
    items: Array<{ productName: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal: number;
    vatAmount: number;
    discount: number;
    grandTotal: number;
    paymentMethods: string[];
    cashierName?: string;
  } | null>(null);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [giftCardDialogOpen, setGiftCardDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(0);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'success' | 'error' | 'warning',
  });

  const activeCart = carts[activeCartId || 'default'] || [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const isCheckoutDisabled = totalPaid !== cartTotal || totalPaid === 0;

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const paymentMethods = [
    { id: 'cash', name: 'Nakit', icon: <Money />, color: 'emerald' },
    { id: 'credit_card', name: 'Kredi Kartı', icon: <CreditCard />, color: 'blue' },
    { id: 'transfer', name: 'Havale/EFT', icon: <AccountBalance />, color: 'amber' },
    { id: 'gift_card', name: 'Hediye Çeki', icon: <CardGiftcard />, color: 'rose' },
  ];

  const bankAccounts = {
    pos: [
      { id: 'pos-1', name: 'İşbankası POS Hesabı 1' },
      { id: 'pos-2', name: 'Garanti POS Hesabı 2' },
      { id: 'pos-3', name: 'Akbank POS Hesabı 3' },
    ],
    current: [
      { id: 'current-1', name: 'İşbankası Vadesiz Hesap 1' },
      { id: 'current-2', name: 'Garanti Vadesiz Hesap 2' },
      { id: 'current-3', name: 'Akbank Vadesiz Hesap 3' },
    ],
  };
```

---

## 4. CartPanel Bileşeni (CartPanel.tsx) - 2. KISIM (Fonksiyonlar)
```typescript
  const handlePaymentMethodClick = (methodId: string) => {
    if (methodId === 'gift_card') {
      setSelectedPaymentMethod(methodId);
      setGiftCardNumber('');
      setGiftCardAmount(0);
      setGiftCardDialogOpen(true);
    } else if (methodId === 'credit_card') {
      setSelectedPaymentMethod(methodId);
      setPaymentAmount(remainingAmount.toFixed(2));
      setSelectedBankAccount('');
      setInstallmentCount(1);
      setBankDialogOpen(true);
    } else if (methodId === 'transfer') {
      setSelectedPaymentMethod(methodId);
      setPaymentAmount(remainingAmount.toFixed(2));
      setSelectedBankAccount('');
      setBankDialogOpen(true);
    } else {
      setSelectedPaymentMethod(methodId);
      setPaymentAmount(remainingAmount.toFixed(2));
      setPaymentDialogOpen(true);
    }
  };

  const handlePaymentAmountConfirm = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showSnackbar('Lütfen geçerli bir tutar girin.', 'error');
      return;
    }

    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid > cartTotal) {
      showSnackbar(`Ödenen tutar (₺${newTotalPaid.toFixed(2)}) sepet toplamından (₺${cartTotal.toFixed(2)}) büyük olamaz!`, 'warning');
      return;
    }

    addPayment({
      paymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || '',
      amount: amount,
    });
    setPaymentDialogOpen(false);
    setPaymentAmount('');
    showSnackbar('Ödeme başarıyla eklendi.', 'success');
  };

  const handleBankPaymentConfirm = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showSnackbar('Lütfen geçerli bir tutar girin.', 'error');
      return;
    }

    if (!selectedBankAccount) {
      showSnackbar('Lütfen bir banka hesabı seçin.', 'error');
      return;
    }

    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid > cartTotal) {
      showSnackbar(`Ödenen tutar (₺${newTotalPaid.toFixed(2)}) sepet toplamından (₺${cartTotal.toFixed(2)}) büyük olamaz!`, 'warning');
      return;
    }

    const accountInfo = bankAccounts.pos.find((acc) => acc.id === selectedBankAccount) ||
      bankAccounts.current.find((acc) => acc.id === selectedBankAccount);
    const paymentMethod = accountInfo ? `${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name} - ${accountInfo.name}` :
      paymentMethods.find(m => m.id === selectedPaymentMethod)?.name;

    addPayment({
      paymentMethod: paymentMethod || '',
      amount: amount,
      bankAccountId: selectedBankAccount,
    });
    setBankDialogOpen(false);
    setPaymentAmount('');
    setSelectedBankAccount('');
    setInstallmentCount(1);
    showSnackbar('Ödeme başarıyla eklendi.', 'success');
  };

  const handleGiftCardCheck = async () => {
    const mockGiftCardAmount = 100;
    setGiftCardAmount(mockGiftCardAmount);
    alert(`Hediye çeki bakiyesi: ₺${mockGiftCardAmount.toFixed(2)}`);
  };

  const handleGiftCardConfirm = () => {
    if (isNaN(giftCardAmount) || giftCardAmount <= 0) {
      showSnackbar('Lütfen geçerli bir tutar girin.', 'error');
      return;
    }

    const newTotalPaid = totalPaid + giftCardAmount;
    if (newTotalPaid > cartTotal) {
      showSnackbar(`Ödenen tutar (₺${newTotalPaid.toFixed(2)}) sepet toplamından (₺${cartTotal.toFixed(2)}) büyük olamaz!`, 'warning');
      return;
    }

    addPayment({
      paymentMethod: 'Hediye Çeki',
      amount: giftCardAmount,
    });
    setGiftCardDialogOpen(false);
    setGiftCardNumber('');
    setGiftCardAmount(0);
    showSnackbar('Hediye çeki ödemesi başarıyla eklendi.', 'success');
  };

  const handleCompleteCheckout = async () => {
    try {
      const data = {
        invoiceNumber: 'POS-' + Date.now(),
        date: new Date(),
        items: activeCart.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.quantity * i.unitPrice,
        })),
        subtotal: cartTotal,
        vatAmount: 0,
        discount: 0,
        grandTotal: cartTotal,
        paymentMethods: payments.map((p) => p.paymentMethod + ': ₺' + p.amount.toFixed(2)),
      };
      setReceiptData(data);
      await completeCheckout();
      showSnackbar('Satış başarıyla tamamlandı.', 'success');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Satış tamamlanırken bir hata oluştu';
      showSnackbar(message, 'error');
    }
  };

  const fetchCustomers = async (search: string = '') => {
    try {
      setCustomersLoading(true);
      const res = await axios.get('/account', {
        params: {
          search,
          limit: 20
        }
      });
      setCustomers(res.data?.data || []);
    } catch (error) {
      console.error('Customer fetch error:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchCashboxes = async () => {
    try {
      const res = await axios.get('/cashbox', {
        params: {
          isActive: true,
          isRetail: true
        }
      });
      setCashboxes(res.data || []);

      // Auto-select first cashbox if none selected
      if (!cashboxId && res.data?.length > 0) {
        const firstCashbox = res.data[0];
        setSelectedCashbox(firstCashbox);
        setCashbox(firstCashbox.id);
      }
    } catch (error) {
      console.error('Cashbox fetch error:', error);
    }
  };

  React.useEffect(() => {
    fetchCustomers();
    fetchCashboxes();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };
```

---

## 5. POS Store (posStore.ts)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '@/lib/axios';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  variantId?: string;
  variantName?: string;
}

interface PosPayment {
  paymentMethod: string;
  amount: number;
  giftCardId?: string;
  cashboxId?: string;
  bankAccountId?: string;
}

interface PosState {
  // Cart management
  carts: Record<string, CartItem[]>;
  activeCartId: string | null;
  cartTotal: number;

  // Customer
  selectedCustomer: {
    id: string;
    code: string;
    title: string;
    creditLimit?: number;
    balance?: number;
  } | null;

  // Session
  activeSessionId: string | null;
  cashierId: string | null;
  cashboxId: string | null;
  warehouseId: string | null;

  // Payment
  payments: PosPayment[];
  remainingAmount: number;

  // UI state
  variantDialogOpen: boolean;
  paymentDialogOpen: boolean;
  receiptDialogOpen: boolean;
  selectedProductForVariant: CartItem | null;

  // Actions
  setActiveCart: (cartId: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string, productId: string, variantId?: string) => void;
  updateCartItem: (cartId: string, productId: string, quantity: number, variantId?: string) => void;
  clearCart: (cartId: string) => void;
  switchCart: (cartId: string) => void;
  deleteCart: (cartId: string) => void;

  setSelectedCustomer: (customer: PosState['selectedCustomer']) => void;
  clearSelectedCustomer: () => void;

  setSession: (sessionId: string | null, cashierId: string | null, cashboxId: string | null, warehouseId: string | null) => void;

  addPayment: (payment: PosPayment) => void;
  removePayment: (index: number) => void;
  clearPayments: () => void;

  setVariantDialogOpen: (open: boolean) => void;
  setSelectedProductForVariant: (product: CartItem | null) => void;
  setPaymentDialogOpen: (open: boolean) => void;
  setReceiptDialogOpen: (open: boolean) => void;
  setCashbox: (cashboxId: string | null) => void;
  completeCheckout: () => Promise<void>;
}

export const usePosStore = create<PosState>()(
  persist(
    (set) => ({
      // Cart state
      carts: {},
      activeCartId: null,
      cartTotal: 0,

      // Customer state
      selectedCustomer: null,

      // Session state
      activeSessionId: null,
      cashierId: null,
      cashboxId: null,
      warehouseId: null,

      // Payment state
      payments: [],
      remainingAmount: 0,

      // UI state
      variantDialogOpen: false,
      paymentDialogOpen: false,
      receiptDialogOpen: false,
      selectedProductForVariant: null,

      // Cart actions
      setActiveCart: (cartId) => set({ activeCartId: cartId }),

      addToCart: (item) => set((state) => {
        const cartId = state.activeCartId || 'default';
        const currentCart = state.carts[cartId] || [];

        // Check if product with same variant already exists
        const existingItemIndex = currentCart.findIndex(
          (cartItem) =>
            cartItem.productId === item.productId &&
            cartItem.variantId === item.variantId
        );

        let updatedCart;
        if (existingItemIndex > -1) {
          updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + item.quantity
          };
        } else {
          updatedCart = [...currentCart, item];
        }

        const newTotal = calculateCartTotal(updatedCart);
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...state,
          carts: { ...state.carts, [cartId]: updatedCart },
          cartTotal: newTotal,
          remainingAmount: newTotal - totalPaid
        };
      }),

      removeFromCart: (cartId, productId, variantId) => set((state) => {
        const targetCartId = cartId || state.activeCartId || 'default';
        const currentCart = state.carts[targetCartId] || [];
        const updatedCart = currentCart.filter((item) =>
          !(item.productId === productId && item.variantId === variantId)
        );
        const newTotal = calculateCartTotal(updatedCart);
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...state,
          carts: { ...state.carts, [targetCartId]: updatedCart },
          activeCartId: targetCartId,
          cartTotal: newTotal,
          remainingAmount: newTotal - totalPaid
        };
      }),

      updateCartItem: (cartId, productId, quantity, variantId) => set((state) => {
        const targetCartId = cartId || state.activeCartId || 'default';
        const currentCart = state.carts[targetCartId] || [];
        const updatedCart = currentCart.map((item) =>
          (item.productId === productId && item.variantId === variantId)
            ? { ...item, quantity }
            : item
        );
        const newTotal = calculateCartTotal(updatedCart);
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...state,
          carts: { ...state.carts, [targetCartId]: updatedCart },
          cartTotal: newTotal,
          remainingAmount: newTotal - totalPaid
        };
      }),

      clearCart: (cartId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[cartId];
        let newTotal = 0;
        Object.values(newCarts).forEach((cart) => {
          newTotal += calculateCartTotal(cart as CartItem[]);
        });
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...state,
          carts: newCarts,
          cartTotal: newTotal,
          remainingAmount: newTotal - totalPaid
        };
      }),

      switchCart: (cartId) => set((state) => {
        const hasCart = state.carts[cartId];
        if (!hasCart) {
          return {
            ...state,
            carts: { ...state.carts, [cartId]: [] },
            activeCartId: cartId,
            cartTotal: 0,
          };
        }
        return {
          ...state,
          activeCartId: cartId,
          cartTotal: calculateCartTotal(state.carts[cartId] || []),
        };
      }),

      deleteCart: (cartId) => set((state) => {
        const newCarts = { ...state.carts };
        delete newCarts[cartId];
        const newActiveId = state.activeCartId === cartId ? null : state.activeCartId;
        let newTotal = 0;
        Object.values(newCarts).forEach((cart) => {
          newTotal += calculateCartTotal(cart as CartItem[]);
        });
        const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...state,
          carts: newCarts,
          activeCartId: newActiveId,
          cartTotal: newTotal,
          remainingAmount: newTotal - totalPaid
        };
      }),

      // Customer actions
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

      clearSelectedCustomer: () => set({ selectedCustomer: null }),

      // Session actions
      setSession: (sessionId, cashierId, cashboxId) => set({
        activeSessionId: sessionId,
        cashierId,
        cashboxId,
      }),

      // Payment actions
      addPayment: (payment) => set((state) => {
        const newPayments = [...state.payments, payment];
        const newRemaining = state.cartTotal - newPayments.reduce(
          (sum, p) => sum + p.amount,
          0
        );

        return {
          ...state,
          payments: newPayments,
          remainingAmount: newRemaining,
        };
      }),

      removePayment: (index) => set((state) => {
        const newPayments = state.payments.filter((_, i) => i !== index);
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
        const newRemaining = state.cartTotal - totalPaid;

        return {
          ...state,
          payments: newPayments,
          remainingAmount: newRemaining,
        };
      }),

      clearPayments: () => set((state) => ({
        payments: [],
        remainingAmount: state.cartTotal,
      })),

      setVariantDialogOpen: (open) => set({ variantDialogOpen: open }),
      setSelectedProductForVariant: (product) => set({ selectedProductForVariant: product }),
      setPaymentDialogOpen: (open) => set({ paymentDialogOpen: open }),
      setReceiptDialogOpen: (open) => set({ receiptDialogOpen: open }),
      setCashbox: (cashboxId) => set({ cashboxId }),

      completeCheckout: async () => {
        try {
          const state = usePosStore.getState();
          const cartId = state.activeCartId || 'default';
          const items = state.carts[cartId] || [];

          if (items.length === 0) {
            console.error('Sepet boş');
            return;
          }

          if (!state.selectedCustomer) {
            throw new Error('Lütfen bir müşteri seçiniz.');
          }

          // 1. Create draft sepet on server to get a valid invoiceId
          const draftResponse = await axios.post('/pos/cart/draft', {
            accountId: state.selectedCustomer.id,
            items: items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              discountRate: item.discountRate || 0,
              variantId: item.variantId,
            })),
            cashboxId: state.cashboxId,
            warehouseId: state.warehouseId,
          });

          const invoiceId = draftResponse.data.id;

          // 2. Map payment methods to backend enum values
          const mappedPayments = state.payments.map(payment => {
            let paymentMethod: string;

            // Extract base payment method (remove bank account suffix if present)
            const basePaymentMethod = payment.paymentMethod.split(' - ')[0];

            if (basePaymentMethod === 'Nakit') {
              paymentMethod = 'CASH';
            } else if (basePaymentMethod === 'Kredi Kartı') {
              paymentMethod = 'CREDIT_CARD';
            } else if (basePaymentMethod === 'Havale/EFT') {
              paymentMethod = 'BANK_TRANSFER';
            } else if (basePaymentMethod === 'Hediye Çeki') {
              paymentMethod = 'GIFT_CARD';
            } else {
              paymentMethod = basePaymentMethod.toUpperCase().replace(/\s+/g, '_');
            }

            return {
              paymentMethod,
              amount: payment.amount,
              ...(payment.giftCardId && { giftCardId: payment.giftCardId }),
              ...(paymentMethod === 'CASH' && { cashboxId: state.cashboxId }),
              ...((paymentMethod === 'CREDIT_CARD' || paymentMethod === 'BANK_TRANSFER') && payment.bankAccountId && { bankAccountId: payment.bankAccountId }),
            };
          });

          const response = await axios.post('/pos/cart/' + invoiceId + '/complete', {
            payments: mappedPayments,
            cashboxId: state.cashboxId,
          });

          if (response.status === 200 || response.status === 201) {
            set({
              carts: {},
              activeCartId: null,
              cartTotal: 0,
              payments: [],
              remainingAmount: 0,
              paymentDialogOpen: false,
              receiptDialogOpen: true,
              selectedCustomer: null,
            });
          }
        } catch (error: any) {
          console.error('Checkout error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'pos-storage',
    }
  )
);

// Helper function to calculate cart total
function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discount = itemTotal * (item.discountRate || 0) / 100;
    const vat = (itemTotal - discount) * item.vatRate / 100;
    return total + (itemTotal - discount + vat);
  }, 0);
}
```

---

## 📝 DOSYA YOLLARI

```
panel-stage/client/src/app/(main)/pos/
├── page.tsx                    # Ana POS sayfası
├── components/
│   ├── ProductGrid.tsx         # Ürün kataloğu bileşeni
│   ├── CartPanel.tsx           # Sepet paneli bileşeni
│   ├── PaymentDialog.tsx       # Ödeme dialog'ları
│   ├── ReceiptComponent.tsx    # Fiş gösterim bileşeni
│   ├── VariantDialog.tsx       # Varyant seçim dialog'u
│   └── VirtualNumpad.tsx       # Sanal sayı tuş takımı

panel-stage/client/src/stores/
└── posStore.ts                 # POS state management (Zustand)
```

---

## 🔗 BAĞIMLILIKLAR

### Frontend:
- **Next.js 14** (App Router)
- **React 18+**
- **TypeScript**
- **Material UI (MUI)**
- **Zustand** (State Management)
- **Axios** (HTTP Client)
- **Tailwind CSS** (Styling)

---

## 💡 KULLANIM

### Kurulum:
```bash
cd panel-stage/client
npm install
npm run dev
```

### Erişim:
```
http://localhost:3010/pos
```

---

Bu dosya, POS sayfasının tüm frontend kodlarını içerir. Kodları kopyalayıp projenizde kullanabilirsiniz.