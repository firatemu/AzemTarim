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
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete, MoreVert, ShoppingCart } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import { useRouter } from 'next/navigation';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface Quote {
  id: string;
  quoteNo: string;
  quoteType: 'SALE' | 'PURCHASE';
  date: string;
  validUntil: string | null;
  account: Account;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: 'OFFERED' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_ORDER';
  discount?: number;
  notes?: string;
  orderId?: string | null;
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  OFFERED: 'default',
  APPROVED: 'info',
  REJECTED: 'error',
  CONVERTED_TO_ORDER: 'success',
};

const statusTexts: Record<string, string> = {
  OFFERED: 'Teklif',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CONVERTED_TO_ORDER: 'Siparişe Dönüştü',
};

export default function SatinAlmaTeklifleriPage() {
  const { addTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OFFERED' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_ORDER'>('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    addTab({
      id: 'quotes-purchase',
      label: 'Satın Alma Teklifleri',
      path: '/quotes/purchase',
    });
  }, [addTab]);

  useEffect(() => {
    fetchQuotes();
  }, [searchTerm]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const params: any = {
        quoteType: 'PURCHASE',
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await axios.get('/quotes', { params });
      setQuotes(response.data.data || []);
    } catch (error: any) {
      console.error('Teklif yükleme hatası:', error);
      // API yoksa boş liste göster
      if (error.response?.status === 404) {
        setQuotes([]);
      } else {
        showSnackbar(error.response?.data?.message || 'Teklifler yüklenirken hata oluştu', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, quote: Quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedQuote) return;

    try {
      await axios.put(`/quotes/${selectedQuote.id}/status`, { status: newStatus });
      showSnackbar(`Teklif durumu "${statusTexts[newStatus]}" olarak güncellendi`, 'success');
      fetchQuotes();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirilirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleConvertToSiparis = async () => {
    if (!selectedQuote) return;

    if (!confirm('Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz?')) {
      handleMenuClose();
      return;
    }

    try {
      const response = await axios.post(`/quotes/${selectedQuote.id}/convert-to-order`);
      showSnackbar('Teklif başarıyla siparişe dönüştürüldü', 'success');
      setTimeout(() => {
        router.push(`/order/purchase/edit/${response.data.orderId}`);
      }, 1500);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif siparişe dönüştürülürken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    if (!selectedQuote) return;

    if (!confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      handleMenuClose();
      return;
    }

    try {
      await axios.delete(`/quotes/${selectedQuote.id}`);
      showSnackbar('Teklif başarıyla silindi', 'success');
      fetchQuotes();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Teklif silinirken hata oluştu', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Satın Alma Teklifleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tedarikçilerden gelen teklifleri yönetin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/quotes/purchase/yeni')}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            Yeni Teklif
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            id="alinan-teklif-search"
            fullWidth
            placeholder="Teklif No, Tedarikçi Ünvanı veya Kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Tümü"
              color={statusFilter === 'ALL' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('ALL')}
              size="small"
            />
            <Chip label="Teklif" color={statusFilter === 'OFFERED' ? 'primary' : 'default'} onClick={() => setStatusFilter('OFFERED')} size="small" />
            <Chip label="Onaylandı" color={statusFilter === 'APPROVED' ? 'primary' : 'default'} onClick={() => setStatusFilter('APPROVED')} size="small" />
            <Chip label="Reddedildi" color={statusFilter === 'REJECTED' ? 'primary' : 'default'} onClick={() => setStatusFilter('REJECTED')} size="small" />
            <Chip label="Siparişe Dönüştü" color={statusFilter === 'CONVERTED_TO_ORDER' ? 'primary' : 'default'} onClick={() => setStatusFilter('CONVERTED_TO_ORDER')} size="small" />
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teklif No</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Geçerlilik Tarihi</TableCell>
                  <TableCell>Tedarikçi</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="right">KDV</TableCell>
                  <TableCell align="right">Genel Toplam</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.filter(t => statusFilter === 'ALL' ? true : t.status === statusFilter).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Teklif bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes
                    .filter(t => statusFilter === 'ALL' ? true : t.status === statusFilter)
                    .map((quote) => (
                      <TableRow key={quote.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {quote.quoteNo}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(quote.date)}</TableCell>
                        <TableCell>
                          {quote.validUntil ? formatDate(quote.validUntil) : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{quote.account.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quote.account.code}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(quote.totalAmount)}</TableCell>
                        <TableCell align="right">{formatCurrency(quote.taxAmount)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(quote.grandTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusTexts[quote.status]}
                            color={statusColors[quote.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/quotes/purchase/edit/${quote.id}`)}
                            disabled={quote.status === 'CONVERTED_TO_ORDER' || quote.status === 'REJECTED'}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, quote)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedQuote && selectedQuote.status !== 'CONVERTED_TO_ORDER' && (
            [
              selectedQuote.status === 'OFFERED' && (
                <MenuItem key="onaylandi" onClick={() => handleStatusChange('APPROVED')}>
                  Onaylandı Olarak İşaretle
                </MenuItem>
              ),
              selectedQuote.status === 'OFFERED' && (
                <MenuItem key="reddedildi" onClick={() => handleStatusChange('REJECTED')}>
                  Reddedildi Olarak İşaretle
                </MenuItem>
              ),
              selectedQuote.status === 'OFFERED' && (
                <MenuItem key="siparise-donustur-teklif" onClick={handleConvertToSiparis}>
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
              selectedQuote.status === 'APPROVED' && (
                <MenuItem key="siparise-donustur-onaylandi" onClick={handleConvertToSiparis}>
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Siparişe Dönüştür
                </MenuItem>
              ),
            ].filter(Boolean)
          )}
          {selectedQuote && selectedQuote.orderId && (
            <MenuItem onClick={() => router.push(`/order/purchase/edit/${selectedQuote.orderId}`)}>
              <Visibility sx={{ mr: 1 }} fontSize="small" />
              İlgili Siparişi Görüntüle
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Sil
          </MenuItem>
        </Menu>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

