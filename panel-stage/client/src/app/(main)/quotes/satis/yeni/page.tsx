'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Autocomplete,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  paymentTerm?: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  salePrice: number;
  vatRate: number;
  barcode?: string;
}

interface QuoteItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  discountAmount: number;
  isMultiDiscount?: boolean;
  discountFormula?: string;
}

export default function YeniSatisTeklifiPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quoteNo: '',
    quoteType: 'SALE' as 'SALE' | 'PURCHASE',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'OFFERED' as 'OFFERED',
    overallDiscountRate: 0,
    overallDiscountAmount: 0,
    notes: '',
    items: [] as QuoteItem[],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchAccounts();
    fetchProducts();
    generateQuoteNo();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000 },
      });
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product', {
        params: { limit: 1000 },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const generateQuoteNo = async () => {
    try {
      const params: any = {
        quoteType: 'SALE',
        limit: '1',
      };
      const response = await axios.get('/quotes', { params });
      const quotes = response.data?.data || [];
      const lastQuote = quotes[0];
      const lastNo = lastQuote ? parseInt(lastQuote.quoteNo.split('-')[2] || '0') : 0;
      const newNo = (lastNo + 1).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        quoteNo: `ST-${new Date().getFullYear()}-${newNo}`,
      }));
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        quoteNo: `ST-${new Date().getFullYear()}-001`,
      }));
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
    const discounts = formula.split('+').map(d => parseFloat(d.trim())).filter(d => !isNaN(d) && d > 0);

    if (discounts.length === 0) {
      return { finalAmount: baseAmount, totalDiscount: 0, effectiveRate: 0 };
    }

    let currentAmount = baseAmount;
    let totalDiscount = 0;

    for (const discount of discounts) {
      const discountAmount = (currentAmount * discount) / 100;
      currentAmount -= discountAmount;
      totalDiscount += discountAmount;
    }

    const effectiveRate = baseAmount > 0 ? (totalDiscount / baseAmount) * 100 : 0;

    return { finalAmount: currentAmount, totalDiscount, effectiveRate };
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        discountRate: 0,
        discountAmount: 0,
        isMultiDiscount: false,
        discountFormula: '',
      }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      if (field === 'productId') {
        const product = products.find(s => s.id === value);
        if (product) {
          item.productId = value;
          item.unitPrice = product.salePrice;
          item.vatRate = product.vatRate;
        }
      } else if (field === 'isMultiDiscount') {
        item.isMultiDiscount = value;
        if (!value) {
          item.discountFormula = '';
          const subTotal = item.quantity * item.unitPrice;
          item.discountAmount = (subTotal * item.discountRate) / 100;
        } else {
          if (item.discountRate > 0) {
            item.discountFormula = item.discountRate.toString();
          }
        }
      } else if (field === 'discountFormula') {
        item.discountFormula = value;
        const subTotal = item.quantity * item.unitPrice;
        const result = calculateMultiDiscount(subTotal, value);
        item.discountAmount = result.totalDiscount;
        item.discountRate = result.effectiveRate;
      } else if (field === 'discountRate') {
        if (item.isMultiDiscount) {
          item.discountFormula = value;
          const subTotal = item.quantity * item.unitPrice;
          const result = calculateMultiDiscount(subTotal, value);
          item.discountAmount = result.totalDiscount;
          item.discountRate = result.effectiveRate;
        } else {
          item.discountRate = parseFloat(value) || 0;
          const subTotal = item.quantity * item.unitPrice;
          item.discountAmount = (subTotal * item.discountRate) / 100;
        }
      } else if (field === 'discountAmount') {
        if (!item.isMultiDiscount) {
          item.discountAmount = parseFloat(value) || 0;
          const subTotal = item.quantity * item.unitPrice;
          item.discountRate = subTotal > 0 ? (item.discountAmount / subTotal) * 100 : 0;
        }
      } else if (field === 'quantity' || field === 'unitPrice') {
        item[field] = parseFloat(value) || 0;
        const subTotal = item.quantity * item.unitPrice;
        if (item.isMultiDiscount && item.discountFormula) {
          const result = calculateMultiDiscount(subTotal, item.discountFormula);
          item.discountAmount = result.totalDiscount;
          item.discountRate = result.effectiveRate;
        } else {
          item.discountAmount = (subTotal * item.discountRate) / 100;
        }
      } else {
        item[field] = value;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const calculateItemAmount = (item: QuoteItem) => {
    const subTotal = item.quantity * item.unitPrice;
    const netAmount = subTotal - item.discountAmount;
    const vatAmount = (netAmount * item.vatRate) / 100;
    return netAmount + vatAmount;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalItemDiscount = 0;
    let totalVat = 0;

    formData.items.forEach(item => {
      const itemSubTotal = item.quantity * item.unitPrice;
      subTotal += itemSubTotal;
      totalItemDiscount += item.discountAmount;

      const netAmount = itemSubTotal - item.discountAmount;
      const vatAmount = (netAmount * item.vatRate) / 100;
      totalVat += vatAmount;
    });

    const overallDiscount = formData.overallDiscountAmount || 0;
    const totalDiscount = totalItemDiscount + overallDiscount;
    const netTotal = subTotal - totalItemDiscount - overallDiscount;
    const grandTotal = netTotal + totalVat;

    return { subTotal, totalItemDiscount, overallDiscount, totalDiscount, totalVat, netTotal, grandTotal };
  };

  const handleOverallDiscountRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    const subTotal = formData.items.reduce((sum, k) => sum + (k.quantity * k.unitPrice - k.discountAmount), 0);
    const amount = (subTotal * rate) / 100;
    setFormData(prev => ({ ...prev, overallDiscountRate: rate, overallDiscountAmount: amount }));
  };

  const handleOverallDiscountAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    const subTotal = formData.items.reduce((sum, k) => sum + (k.quantity * k.unitPrice - k.discountAmount), 0);
    const rate = subTotal > 0 ? (amount / subTotal) * 100 : 0;
    setFormData(prev => ({ ...prev, overallDiscountRate: rate, overallDiscountAmount: amount }));
  };

  const handleSave = async () => {
    try {
      if (!formData.accountId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      const validItems = formData.items.filter(k => k.productId && k.productId.trim() !== '');

      if (validItems.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      const removedCount = formData.items.length - validItems.length;
      if (removedCount > 0) {
        showSnackbar(`${removedCount} adet boş satır otomatik olarak kaldırıldı`, 'info');
      }

      setLoading(true);

      const payload: any = {
        quoteNo: formData.quoteNo,
        quoteType: formData.quoteType,
        accountId: formData.accountId,
        date: new Date(formData.date).toISOString(),
        discount: Number(formData.overallDiscountAmount) || 0,
        items: validItems.map(k => ({
          productId: k.productId,
          quantity: Number(k.quantity),
          unitPrice: Number(k.unitPrice),
          vatRate: Number(k.vatRate),
          discountRate: Number(k.discountRate) || 0,
          discountAmount: Number(k.discountAmount) || 0,
        })),
      };

      if (formData.validUntil) {
        payload.validUntil = new Date(formData.validUntil).toISOString();
      }
      if (formData.notes && formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }
      if (formData.status) {
        payload.status = formData.status;
      }

      await axios.post('/quotes', payload);

      showSnackbar('Teklif başarıyla oluşturuldu', 'success');
      setTimeout(() => {
        router.push('/quotes/satis');
      }, 1500);
    } catch (error: any) {
      console.error('Teklif kaydetme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'İşlem sırasında hata oluştu';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push('/quotes/satis')}
            sx={{
              bgcolor: '#f3f4f6',
              '&:hover': { bgcolor: '#e5e7eb' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Yeni Satış Teklifi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Müşteriye sunulacak teklif oluşturun
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Teklif Bilgileri */}
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Teklif Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: '1 1 200px' }}
              label="Teklif No"
              value={formData.quoteNo}
              onChange={(e) => setFormData(prev => ({ ...prev, quoteNo: e.target.value }))}
              required
            />
            <TextField
              sx={{ flex: '1 1 200px' }}
              type="date"
              label="Tarih"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              sx={{ flex: '1 1 200px' }}
              type="date"
              label="Geçerlilik Tarihi"
              value={formData.validUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box>
            <Autocomplete
              fullWidth
              value={accounts.find(c => c.id === formData.accountId) || null}
              onChange={(_, newValue) => {
                setFormData(prev => ({ ...prev, accountId: newValue?.id || '' }));
              }}
              options={accounts}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.code} - {option.type === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari Seçiniz"
                  placeholder="Cari kodu veya ünvanı ile ara..."
                  required
                />
              )}
              noOptionsText="Cari bulunamadı"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Box>

          {/* Kalemler */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Teklif Kalemleri</Typography>
              <Button
                variant="contained"
                onClick={handleAddItem}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                }}
              >
                + Yeni Kalem Ekle
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="25%" sx={{ fontWeight: 600 }}>Stok</TableCell>
                    <TableCell width="8%" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                    <TableCell width="10%" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                    <TableCell width="8%" sx={{ fontWeight: 600 }}>KDV %</TableCell>
                    <TableCell width="3%" sx={{ fontWeight: 600 }} title="Çoklu İskonto">Ç.İ.</TableCell>
                    <TableCell width="10%" sx={{ fontWeight: 600 }}>İsk. Oran %</TableCell>
                    <TableCell width="12%" sx={{ fontWeight: 600 }}>İsk. Tutar</TableCell>
                    <TableCell width="12%" align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell width="5%" align="center" sx={{ fontWeight: 600 }}>Sil</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Henüz kalem eklenmedi. Yukarıdaki butonu kullanarak kalem ekleyin.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            open={autocompleteOpenStates[index] || false}
                            onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
                            onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
                            value={products.find(s => s.id === item.productId) || null}
                            onChange={(_, newValue) => {
                              handleItemChange(index, 'productId', newValue?.id || '');
                              setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }));
                            }}
                            options={products}
                            getOptionLabel={(option) => `${option.code} - ${option.name}`}
                            filterOptions={(options, params) => {
                              const { inputValue } = params;
                              if (!inputValue) return options;

                              const lowerInput = inputValue.toLowerCase();
                              return options.filter(option =>
                                option.code.toLowerCase().includes(lowerInput) ||
                                option.name.toLowerCase().includes(lowerInput) ||
                                (option.barcode && option.barcode.toLowerCase().includes(lowerInput))
                              );
                            }}
                            renderOption={(props, option) => {
                              const { key, ...otherProps } = props;
                              return (
                                <Box component="li" key={key} {...otherProps}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="600">
                                      {option.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Kod: {option.code}
                                      </Typography>
                                      {option.barcode && (
                                        <Typography variant="caption" color="text.secondary">
                                          | Barkod: {option.barcode}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Stok kodu, adı veya barkod ile ara..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !(autocompleteOpenStates[index])) {
                                    e.preventDefault();
                                    handleAddItem();
                                  }
                                }}
                              />
                            )}
                            noOptionsText="Stok bulunamadı"
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem();
                              }
                            }}
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem();
                              }
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.vatRate}
                            onChange={(e) => handleItemChange(index, 'vatRate', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem();
                              }
                            }}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleItemChange(index, 'isMultiDiscount', !item.isMultiDiscount)}
                            title={item.isMultiDiscount ? 'Çoklu İskonto: Açık (10+5 formatı)' : 'Çoklu İskonto: Kapalı (Tek oran)'}
                            sx={{
                              color: item.isMultiDiscount ? '#10b981' : '#9ca3af',
                              '&:hover': {
                                bgcolor: item.isMultiDiscount ? '#ecfdf5' : '#f3f4f6',
                              }
                            }}
                          >
                            {item.isMultiDiscount ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          {item.isMultiDiscount ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={item.discountFormula || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^[\d+]*$/.test(value)) {
                                  handleItemChange(index, 'discountFormula', value);
                                }
                              }}
                              placeholder="10+5"
                              helperText={item.discountRate > 0 ? `Efektif: %${item.discountRate.toFixed(2)}` : ''}
                              sx={{
                                '& .MuiInputBase-input': {
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                  color: '#10b981',
                                },
                                '& .MuiFormHelperText-root': {
                                  fontSize: '0.65rem',
                                  mt: 0.5,
                                }
                              }}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={item.discountRate || ''}
                              onChange={(e) => handleItemChange(index, 'discountRate', e.target.value)}
                              inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.01,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={item.discountAmount || ''}
                            onChange={(e) => handleItemChange(index, 'discountAmount', e.target.value)}
                            disabled={item.isMultiDiscount}
                            inputProps={{
                              min: 0,
                              step: 0.01,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(calculateItemAmount(item))}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Genel İskonto */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <TextField
              type="number"
              label="Genel İskonto %"
              value={formData.overallDiscountRate || ''}
              onChange={(e) => handleOverallDiscountRateChange(e.target.value)}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              helperText="İskonto oranı"
              sx={{ width: { xs: '100%', sm: '200px' } }}
            />
            <TextField
              type="number"
              label="Genel İskonto (₺)"
              value={formData.overallDiscountAmount || ''}
              onChange={(e) => handleOverallDiscountAmountChange(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="İskonto tutarı"
              sx={{ width: { xs: '100%', sm: '200px' } }}
            />
          </Box>

          {/* Açıklama */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Açıklama / Notlar"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>

          {/* Toplam Bilgileri */}
          <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f9fafb' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Teklif Özeti
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Ara Toplam:</Typography>
                  <Typography variant="body1" fontWeight="600">{formatCurrency(totals.subTotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Kalem İndirimleri:</Typography>
                  <Typography variant="body1" fontWeight="600" color={totals.totalItemDiscount > 0 ? "error" : "inherit"}>
                    {totals.totalItemDiscount > 0 ? '- ' : ''}{formatCurrency(totals.totalItemDiscount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Genel İskonto:</Typography>
                  <Typography variant="body1" fontWeight="600" color={totals.overallDiscount > 0 ? "error" : "inherit"}>
                    {totals.overallDiscount > 0 ? '- ' : ''}{formatCurrency(totals.overallDiscount)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight="bold">Toplam İndirim:</Typography>
                  <Typography variant="body1" fontWeight="bold" color={totals.totalDiscount > 0 ? "error" : "inherit"}>
                    {totals.totalDiscount > 0 ? '- ' : ''}{formatCurrency(totals.totalDiscount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">KDV Toplamı:</Typography>
                  <Typography variant="body1" fontWeight="600">{formatCurrency(totals.totalVat)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: '#10b981',
                    }}
                  >
                    {formatCurrency(totals.grandTotal)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/quotes/satis')}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  minWidth: 150,
                }}
              >
                {loading ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

