'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Autocomplete,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown, Receipt, CheckCircle, Warning } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Account {
  id: string;
  code: string;
  title: string;
  tip: string;
  balance: number;
}

interface FaturaDetay {
  id: string;
  invoiceNo: string;
  invoiceType: string;
  date: string;
  dueDate: string | null;
  grandTotal: number;
  paidAmount: number;
  payableAmount: number;
  status: string;
  invoiceCollections: Array<{
    id: string;
    amount: number;
    collection: {
      id: string;
      date: string;
      type: string;
      paymentType: string;
    };
  }>;
}

export default function FaturaKapatmaPage() {
  const [cariler, setCariler] = useState<Account[]>([]);
  const [selectedCari, setSelectedCari] = useState<Account | null>(null);
  const [faturalar, setFaturalar] = useState<FaturaDetay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCariler();
  }, []);

  useEffect(() => {
    if (selectedCari) {
      fetchCariFaturalar(selectedCari.id);
    }
  }, [selectedCari]);

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/account', {
        params: { limit: 1000 },
      });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchCariFaturalar = async (accountId: string) => {
    try {
      setLoading(true);
      const response = await axios.get('/invoices', {
        params: {
          accountId,
          page: 1,
          limit: 100,
        },
      });
      setFaturalar(response.data.data || []);
    } catch (error) {
      console.error('Faturalar yüklenirken hata:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getDurumColor = (status: string) => {
    switch (status) {
      case 'CLOSED': return 'success';
      case 'PARTIALLY_PAID': return 'info';
      case 'OPEN': return 'warning';
      case 'APPROVED': return 'warning';
      default: return 'default';
    }
  };

  const getDurumText = (status: string) => {
    switch (status) {
      case 'CLOSED': return 'Kapalı';
      case 'PARTIALLY_PAID': return 'Kısmen Ödendi';
      case 'OPEN': return 'Açık';
      case 'APPROVED': return 'Onaylandı';
      case 'DRAFT': return 'Taslak';
      case 'CANCELLED': return 'İptal';
      default: return status;
    }
  };

  const getOdemeTipiText = (tip: string) => {
    const types: any = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale',
      CHECK: 'Çek',
      PROMISSORY_NOTE: 'Senet',
      GIFT_CARD: 'Hediye Kartı',
    };
    return types[tip] || tip;
  };

  // Özet hesaplamalar - Decimal tiplerini Number'a çevir
  const ozet = {
    toplamFatura: faturalar.reduce((sum, f) => sum + Number(f.grandTotal || 0), 0),
    toplamOdenen: faturalar.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0),
    toplamKalan: faturalar.reduce((sum, f) => sum + Number(f.payableAmount || 0), 0),
    acikFaturaSayisi: faturalar.filter(f => f.status === 'OPEN' || f.status === 'APPROVED').length,
    kismenOdenenSayisi: faturalar.filter(f => f.status === 'PARTIALLY_PAID').length,
    kapaliSayisi: faturalar.filter(f => f.status === 'CLOSED').length,
  };

  // Tahsilat analizleri
  const tahsilatAnalizi = useMemo(() => {
    // Tüm ödemeleri birleştir
    const tumOdemeler = faturalar.flatMap(f => f.invoiceCollections);
    
    if (tumOdemeler.length === 0) {
      return {
        ortalamaTahsilat: 0,
        odemeSayisi: 0,
        odemeSikligiGun: 0,
      };
    }

    // Ortalama tahsilat miktarı
    const toplamTahsilat = tumOdemeler.reduce((sum, oc) => sum + Number(oc.amount || 0), 0);
    const ortalamaTahsilat = toplamTahsilat / tumOdemeler.length;

    // Ödeme sıklığı ortalaması (gün)
    const odemeTarihleri = tumOdemeler
      .map(oc => new Date(oc.collection.date).getTime())
      .sort((a, b) => a - b);

    if (odemeTarihleri.length >= 2) {
      const ilkOdeme = odemeTarihleri[0];
      const sonOdeme = odemeTarihleri[odemeTarihleri.length - 1];
      const gunFarki = (sonOdeme - ilkOdeme) / (1000 * 60 * 60 * 24);
      const odemeSikligiGun = gunFarki / (odemeTarihleri.length - 1);
      
      return {
        ortalamaTahsilat,
        odemeSayisi: tumOdemeler.length,
        odemeSikligiGun,
      };
    }

    return {
      ortalamaTahsilat,
      odemeSayisi: tumOdemeler.length,
      odemeSikligiGun: 0,
    };
  }, [faturalar]);

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}>
          Fatura Kapatma & Ekstre
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cari bazında fatura durumları ve ödeme takibi
        </Typography>
      </Box>

      {/* Cari Seçimi */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Cari Seçimi
        </Typography>
        <Autocomplete
          options={cariler}
          getOptionLabel={(option) => `${option.code} - ${option.title}`}
          value={selectedCari}
          onChange={(_, newValue) => setSelectedCari(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cari Seçiniz"
              placeholder="Cari kodu veya ünvanı ile ara..."
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box component="li" key={key} {...otherProps}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.code} • {option.tip === 'MUSTERI' ? 'Müşteri' : 'Tedarikçi'}
                      </Typography>
                    </Box>
                    <Chip
                      label={formatCurrency(option.balance)}
                      size="small"
                      color={option.balance > 0 ? 'error' : option.balance < 0 ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          }}
          noOptionsText="Cari bulunamadı"
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </Paper>

      {selectedCari && (
        <>
          {/* Özet Kartlar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)', border: '1px solid var(--chart-1)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Receipt sx={{ color: '#3b82f6' }} />
                    <Typography variant="body2" color="text.secondary">
                      Toplam Fatura
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#3b82f6">
                    {formatCurrency(ozet.toplamFatura)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {faturalar.length} adet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)', border: '1px solid var(--chart-3)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <CheckCircle sx={{ color: '#10b981' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ödenen
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#10b981">
                    {formatCurrency(ozet.toplamOdenen)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ozet.kapaliSayisi} fatura kapalı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)', border: '1px solid var(--destructive)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Warning sx={{ color: '#ef4444' }} />
                    <Typography variant="body2" color="text.secondary">
                      Kalan
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#ef4444">
                    {formatCurrency(ozet.toplamKalan)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ozet.acikFaturaSayisi + ozet.kismenOdenenSayisi} açık
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)', border: '1px solid var(--chart-2)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <AccountBalance sx={{ color: '#f59e0b' }} />
                    <Typography variant="body2" color="text.secondary">
                      Cari Bakiye
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                    {formatCurrency(selectedCari.balance)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCari.tip === 'MUSTERI' ? 'Alacak' : 'Borç'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--chart-4) 15%, transparent)', border: '1px solid var(--chart-4)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingUp sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ort. Tahsilat
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#8b5cf6">
                    {formatCurrency(tahsilatAnalizi.ortalamaTahsilat)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tahsilatAnalizi.odemeSayisi} ödeme
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'color-mix(in srgb, var(--chart-5) 15%, transparent)', border: '1px solid var(--chart-5)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingDown sx={{ color: '#ec4899' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ödeme Sıklığı
                    </Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight="bold" color="#ec4899">
                    {tahsilatAnalizi.odemeSikligiGun.toFixed(1)} gün
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ortalama aralık
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Fatura Listesi */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fatura No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vade</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Ödenen</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Ödeme %</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Tahsilat Detayı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faturalar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          Bu cari için fatura bulunamadı.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    faturalar.map((fatura) => {
                      const grandTotal = Number(fatura.grandTotal || 0);
                      const paidAmount = Number(fatura.paidAmount || 0);
                      const payableAmount = Number(fatura.payableAmount || 0);
                      const paymentRate = grandTotal > 0
                        ? (paidAmount / grandTotal) * 100
                        : 0;

                      return (
                        <TableRow
                          key={fatura.id}
                          hover
                          sx={{
                            bgcolor: fatura.status === 'CLOSED' ? '#f0fdf4' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {fatura.invoiceNo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fatura.invoiceType === 'SALE' || fatura.invoiceType === 'SALE_RETURN' ? 'Satış' : 'Alış'}
                              size="small"
                              color={fatura.invoiceType === 'SALE' || fatura.invoiceType === 'SALE_RETURN' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>{formatDate(fatura.date)}</TableCell>
                          <TableCell>
                            {fatura.dueDate ? (
                              <Box>
                                <Typography variant="body2">{formatDate(fatura.dueDate)}</Typography>
                                {new Date(fatura.dueDate) < new Date() && fatura.status !== 'CLOSED' && (
                                  <Typography variant="caption" color="error">
                                    Vadesi geçmiş!
                                  </Typography>
                                )}
                              </Box>
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600">
                              {formatCurrency(grandTotal)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {formatCurrency(paidAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color={payableAmount > 0 ? 'error.main' : 'text.secondary'}
                            >
                              {formatCurrency(payableAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: 80, mx: 'auto' }}>
                              <Tooltip title={`${paymentRate.toFixed(1)}% ödendi`}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(paymentRate, 100)}
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: 'var(--border)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: paymentRate >= 100 ? '#10b981' : paymentRate > 0 ? '#3b82f6' : '#9ca3af',
                                    }
                                  }}
                                />
                              </Tooltip>
                              <Typography variant="caption" color="text.secondary" align="center" display="block">
                                {paymentRate.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getDurumText(fatura.status)}
                              color={getDurumColor(fatura.status)}
                              size="small"
                              icon={fatura.status === 'CLOSED' ? <CheckCircle fontSize="small" /> : undefined}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {fatura.invoiceCollections.length > 0 ? (
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                                      Tahsilat Geçmişi:
                                    </Typography>
                                    {fatura.invoiceCollections.map((fc, idx) => (
                                      <Typography key={fc.id} variant="caption" display="block">
                                        {idx + 1}. {formatDate(fc.collection.date)} - {formatCurrency(fc.amount)} ({getOdemeTipiText(fc.collection.paymentType)})
                                      </Typography>
                                    ))}
                                  </Box>
                                }
                                arrow
                              >
                                <Chip
                                  label={`${fatura.invoiceCollections.length} ödeme`}
                                  size="small"
                                  color="info"
                                  sx={{ cursor: 'pointer' }}
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Özet Çubuk */}
          {faturalar.length > 0 && (
            <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'var(--muted)' }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Fatura Durumu
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip label={`${ozet.acikFaturaSayisi} Açık`} color="warning" size="small" />
                      <Chip label={`${ozet.kismenOdenenSayisi} Kısmen`} color="info" size="small" />
                      <Chip label={`${ozet.kapaliSayisi} Kapalı`} color="success" size="small" />
                    </Stack>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ödeme Durumu
                    </Typography>
                    <Box sx={{ position: 'relative', height: 30 }}>
                      <LinearProgress
                        variant="determinate"
                        value={ozet.toplamFatura > 0 ? (ozet.toplamOdenen / ozet.toplamFatura) * 100 : 0}
                        sx={{
                          height: 30,
                          borderRadius: 2,
                          bgcolor: 'var(--border)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'var(--chart-3)',
                            borderRadius: 2,
                          }
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {formatCurrency(ozet.toplamOdenen)} / {formatCurrency(ozet.toplamFatura)}
                        ({((ozet.toplamOdenen / ozet.toplamFatura) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}

      {/* Cari Seçilmediğinde */}
      {!selectedCari && (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <AccountBalance sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Cari Seçiniz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fatura kapatma ve ekstre görüntülemek için yukarıdan bir cari seçin
          </Typography>
        </Paper>
      )}
    </MainLayout>
  );
}