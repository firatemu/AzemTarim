'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  ManageHistory,
  Refresh,
  Save,
  PriceCheck,
  Search,
  HistoryOutlined,
  MonetizationOnOutlined,
  Inventory2Outlined,
  FilterList
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/Loading/TableSkeleton';
import { SalePriceDialog } from '@/components/SalePriceDialog';

interface Stok {
  id: string;
  productId: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string | null;
  satisFiyati: number;
  alisFiyati?: number;
  priceType?: string;
  currency?: string;
  notes?: string;
}

const formatDateOnly = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function SatisFiyatlariPage() {
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({});
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedStok, setSelectedStok] = useState<Stok | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    void fetchStoklar();
  }, [debouncedSearch]);

  const fetchStoklar = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/price-cards', {
        params: {
          limit: 200,
          type: 'SALE',
          search: debouncedSearch || undefined,
        },
      });
      const items: any[] = response.data?.data ?? [];

      // Map price cards to Stok format
      const mappedItems: Stok[] = items.map((card) => ({
        id: card.id,
        productId: card.productId,
        stokKodu: card.product?.code || card.product?.stokKodu || '',
        stokAdi: card.product?.name || card.product?.stokAdi || '',
        marka: card.product?.brand || null,
        satisFiyati: card.salePrice || card.price || 0,
        priceType: card.priceType || card.type || 'SALE',
        currency: card.currency || 'TRY',
        notes: card.notes || card.note || '',
      }));

      setStoklar(mappedItems);
      setDraftPrices((prev) => {
        const next: Record<string, string> = { ...prev };
        mappedItems.forEach((stok) => {
          if (next[stok.id] === undefined) {
            next[stok.id] = Number(stok.satisFiyati ?? 0).toString();
          }
        });
        return next;
      });
    } catch (error) {
      console.error('Satış fiyatları alınamadı', error);
      setSnackbar({ open: true, severity: 'error', message: 'Satış fiyatları yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (stokId: string, value: string) => {
    setDraftPrices((prev) => ({ ...prev, [stokId]: value }));
  };

  const handleOpenPriceDialog = (stok: Stok) => {
    setSelectedStok(stok);
    setPriceDialogOpen(true);
  };

  const handlePriceDialogClose = () => {
    setPriceDialogOpen(false);
    setSelectedStok(null);
  };

  const handleSavePrice = async (stok: Stok) => {
    const rawValue = draftPrices[stok.id];
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed) || parsed < 0) {
      setSnackbar({ open: true, severity: 'error', message: 'Geçerli bir fiyat giriniz.' });
      return;
    }

    setSavingId(stok.id);
    try {
      const now = new Date();
      await axios.post('/price-cards', {
        productId: stok.productId,
        priceType: 'SALE',
        price: parsed,
        salePrice: parsed,
        currency: 'TRY',
        effectiveFrom: formatDateOnly(now),
        notes: `Tablodan güncelleme • ${now.toLocaleString('tr-TR')}`,
      });
      setSnackbar({ open: true, severity: 'success', message: `${stok.stokKodu} için satış fiyatı güncellendi.` });
      setStoklar((prev) =>
        prev.map((item) => (item.id === stok.id ? { ...item, satisFiyati: parsed } : item))
      );
      setDraftPrices((prev) => ({ ...prev, [stok.id]: parsed.toString() }));
      await fetchStoklar();
    } catch (error: any) {
      console.error('Satış fiyatı güncellenemedi', error);
      const message = error?.response?.data?.message ?? 'Fiyat güncellenirken hata oluştu.';
      setSnackbar({ open: true, severity: 'error', message });
    } finally {
      setSavingId(null);
    }
  };

  const filteredStoklar = useMemo(() => stoklar, [stoklar]);

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 1. Header Area */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              <MonetizationOnOutlined fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, color: 'var(--foreground)' }}>
                Satış Fiyatları
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                Ürün satış fiyatlarını merkezi olarak yönetin
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={fetchStoklar}
              disabled={loading}
              startIcon={<Refresh />}
              sx={{
                boxShadow: 'var(--shadow-sm)',
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-md)',
                '&:hover': { bgcolor: 'var(--primary-hover)', boxShadow: 'var(--shadow-md)' }
              }}
            >
              Yenile
            </Button>
          </Box>
        </Box>

        {/* 2. Metrics Strip */}
        <Paper variant="outlined" sx={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', mb: 1, border: '1px solid var(--border)', background: 'var(--card)' }}>
          <Box sx={{ flex: '1 1 150px', p: 1.5, borderRight: '1px solid var(--border)' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: "block", fontSize: '0.7rem', textTransform: 'uppercase', mb: 0.5 }}>
              Toplam Kayıt
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory2Outlined sx={{ fontSize: '1rem', color: 'var(--primary)' }} />
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
                {stoklar.length} Malzeme
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 150px', p: 1.5, borderRight: '1px solid var(--border)' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: "block", fontSize: '0.7rem', textTransform: 'uppercase', mb: 0.5 }}>
              Para Birimi
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
              ₺ Türk Lirası
            </Typography>
          </Box>
          <Box sx={{ flex: '2 1 200px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
            {/* Buraya opsiyonel olarak genel bilgi gelebilir */}
          </Box>
        </Paper>

        {/* 3. Integrated Toolbar and DataGrid/Table */}
        <Paper variant="outlined" sx={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--card)' }}>
          {/* Toolbar area */}
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid var(--border)', bgcolor: 'var(--muted)' }}>
            <TextField
              size="small"
              placeholder="Stok kodu veya adına göre ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <IconButton size="small" sx={{ color: 'var(--muted-foreground)' }}>
                <FilterList fontSize="small" />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', mr: 1 }}>
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{
                    bgcolor: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid var(--border)'
                  }}>Stok Bilgisi</TableCell>
                  <TableCell sx={{
                    bgcolor: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid var(--border)'
                  }}>Marka</TableCell>
                  <TableCell align="right" sx={{
                    bgcolor: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid var(--border)'
                  }}>Mevcut Fiyat</TableCell>
                  <TableCell align="right" sx={{
                    bgcolor: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid var(--border)'
                  }}>Yeni Fiyat Girişi</TableCell>
                  <TableCell align="center" sx={{
                    bgcolor: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '2px solid var(--border)'
                  }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableSkeleton rows={8} columns={5} />
                ) : filteredStoklar.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Box sx={{ textAlign: 'center', opacity: 0.5 }}>
                        <Inventory2Outlined sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2">Kayıt bulunamadı</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStoklar.map((stok, index) => {
                    const draft = draftPrices[stok.id] ?? stok.satisFiyati?.toString() ?? '';
                    const hasChanged = Number(draft) !== Number(stok.satisFiyati);

                    return (
                      <TableRow
                        key={stok.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: 'var(--accent) !important' },
                          '&:nth-of-type(even)': { bgcolor: 'color-mix(in srgb, var(--muted) 40%, transparent)' },
                          '& .MuiTableCell-root': { borderBottom: '1px solid var(--border)' }
                        }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--primary)' }}>
                            {stok.stokKodu}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }} component="div">
                            {stok.stokAdi}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {stok.marka ? (
                            <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 'var(--radius-sm)', bgcolor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                              {stok.marka}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--foreground)' }}>
                              ₺{Number(stok.satisFiyati ?? 0).toLocaleString('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            variant="outlined"
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 } }}
                            value={draft}
                            onChange={(e) => handlePriceChange(stok.id, e.target.value)}
                            sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Fiyat Kartını Kaydet">
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  disabled={savingId === stok.id || !hasChanged}
                                  onClick={() => handleSavePrice(stok)}
                                  sx={{ bgcolor: hasChanged ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'transparent' }}
                                >
                                  <Save fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Fiyat Geçmişini Gör">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPriceDialog(stok)}
                                sx={{ color: 'var(--muted-foreground)' }}
                              >
                                <HistoryOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <SalePriceDialog
        open={priceDialogOpen}
        stok={selectedStok}
        onClose={handlePriceDialogClose}
        onPriceCreated={(newPrice) => {
          if (!selectedStok) return;
          setDraftPrices((prev) => ({ ...prev, [selectedStok.id]: newPrice.toString() }));
          setStoklar((prev) =>
            prev.map((item) => (item.id === selectedStok.id ? { ...item, satisFiyati: newPrice } : item))
          );
        }}
      />
    </MainLayout>
  );
}

