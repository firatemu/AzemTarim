'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import {
  ArrowBack,
  Print,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Description,
  FilterList,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import FaturaOzetDialog from '@/components/Cari/FaturaOzetDialog';
import { StandardPage, StandardCard } from '@/components/common';

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceType: string;
  date: string;
  totalAmount: string;
  vatAmount: string;
  grandTotal: string;
  currency: string;
  notes?: string;
  status: string;
}

interface CariHareket {
  id: string;
  tip: 'BORC' | 'ALACAK' | 'DEVIR';
  tutar: string;
  bakiye: string;
  belgeTipi?: string;
  belgeNo?: string;
  tarih: string;
  aciklama: string;
  invoice?: Invoice;
}

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vergiNo?: string;
  vergiDairesi?: string;
  telefon?: string;
  email?: string;
  bakiye: string;
  riskLimiti?: number;
  riskDurumu?: 'NORMAL' | 'RISKLI' | 'BLOKELI' | 'TAKIPTE';
  riskDurdurma?: boolean;
}

export default function CariDetayPage() {
  const params = useParams();
  const router = useRouter();
  const cariId = params.id as string;
  const theme = useTheme();

  const [cari, setCari] = useState<Cari | null>(null);
  const [hareketler, setHareketler] = useState<CariHareket[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });
  const [openInvoice, setOpenInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');

  useEffect(() => {
    fetchCari();
    fetchHareketler();
  }, [cariId]);

  const fetchCari = async () => {
    try {
      const response = await axios.get(`/account/${cariId}`);
      setCari(response.data);
    } catch (error) {
      console.error('Cari bilgisi alınamadı:', error);
      showSnackbar('Cari bilgisi yüklenemedi', 'error');
    }
  };

  const fetchHareketler = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/account/${cariId}/movements`, {
        params: { limit: 1000 },
      });

      const raw = response.data?.data ?? response.data ?? [];
      const normalized: CariHareket[] = Array.isArray(raw)
        ? raw.map((m: {
          id?: string;
          type?: string;
          amount?: number | string;
          tutar?: number | string;
          balance?: number | string;
          bakiye?: number | string;
          documentNo?: string;
          belgeNo?: string;
          documentType?: string;
          belgeTipi?: string;
          date?: string;
          tarih?: string;
          notes?: string;
          aciklama?: string;
          invoice?: Invoice;
        }) => {
          const backendType = m?.type;
          const tip: CariHareket['tip'] =
            backendType === 'DEBIT' || backendType === 'BORC'
              ? 'BORC'
              : backendType === 'CREDIT' || backendType === 'ALACAK'
                ? 'ALACAK'
                : 'DEVIR';

          return {
            id: String(m?.id ?? Math.random().toString(36).slice(2)),
            tip,
            tutar: m?.amount != null ? String(m.amount) : (m?.tutar != null ? String(m.tutar) : '0'),
            bakiye: m?.balance != null ? String(m.balance) : (m?.bakiye != null ? String(m.bakiye) : '0'),
            belgeNo: (m?.documentNo ?? m?.belgeNo) || '-',
            belgeTipi: m?.documentType ?? m?.belgeTipi,
            tarih: m?.date ?? m?.tarih ?? new Date(0).toISOString(),
            aciklama: m?.notes ?? m?.aciklama ?? '',
            invoice: m?.invoice,
          };
        })
        : [];

      // Tarihe ve ID'ye göre sırala (yürüyen bakiye için doğru sıralama)
      const sorted = normalized.sort((a, b) => {
        const dateA = new Date(a.tarih).getTime();
        const dateB = new Date(b.tarih).getTime();
        if (dateA !== dateB) {
          return dateA - dateB; // Tarihe göre artan
        }
        return a.id.localeCompare(b.id); // Aynı tarihte ise ID'ye göre artan
      });

      setHareketler(sorted);
    } catch (error) {
      console.error('Hareketler alınamadı:', error);
      showSnackbar('Hareketler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totals = hareketler.reduce(
    (acc: { borc: number; alacak: number }, h: CariHareket) => {
      const val = parseFloat(h.tutar) || 0;
      if (h.tip === 'BORC') acc.borc += val;
      else if (h.tip === 'ALACAK') acc.alacak += val;
      return acc;
    },
    { borc: 0, alacak: 0 }
  );

  const currentBakiye = cari && cari.bakiye && cari.bakiye !== '' ? parseFloat(cari.bakiye) : (totals.alacak - totals.borc);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenInvoice(true);
  };

  const handleExportExcel = async () => {
    try {
      showSnackbar('Excel indiriliyor...', 'info');
      const response = await axios.get(`/account/${cariId}/statement/export/excel`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Excel başarıyla indirildi', 'success');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      showSnackbar('Excel indirilirken hata oluştu', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      showSnackbar('PDF hazırlanıyor...', 'info');
      const response = await axios.get(`/account/${cariId}/statement/export/pdf`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('PDF başarıyla indirildi', 'success');
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      showSnackbar('PDF indirilirken hata oluştu', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getBelgeTipiLabel = (belgeTipi?: string) => {
    if (!belgeTipi) return '-';
    switch (belgeTipi) {
      // Backend Enum Values (DocumentType)
      case 'INVOICE': return 'Fatura';
      case 'COLLECTION': return 'Tahsilat';
      case 'PAYMENT': return 'Ödeme';
      case 'CHECK_PROMISSORY': return 'Çek/Senet İşlemi';
      case 'CARRY_FORWARD': return 'Devir';
      case 'CORRECTION': return 'Düzeltme Kaydı';
      case 'CHECK_ENTRY': return 'Çek Girişi';
      case 'CHECK_EXIT': return 'Çek Çıkışı';
      case 'RETURN': return 'Evrak İadesi';
      case 'HAVALE': return 'Havale';
      case 'CHECK_BILL': return 'Çek/Senet';

      // Legacy or specific variant mappings
      case 'SATIS_FATURA': return 'Satış Faturası';
      case 'SATIN_ALMA_FATURA': return 'Satınalma Faturası';
      case 'SATIS_IRSALIYE': return 'Satış İrsaliyesi';
      case 'SATIN_ALMA_IRSALIYE': return 'Satınalma İrsaliyesi';
      case 'TAHSILAT': return 'Tahsilat';
      case 'ODEME': return 'Ödeme';
      case 'DEVIR': return 'Devir';

      default: return belgeTipi;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
          {new Date(params.value as string).toLocaleDateString('tr-TR')}
        </Typography>
      ),
    },
    {
      field: 'belgeTipi',
      headerName: 'Belge Tipi',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const belgeTipi = params.value as string;
        return (
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {getBelgeTipiLabel(belgeTipi)}
          </Typography>
        );
      },
    },
    {
      field: 'belgeNo',
      headerName: 'Belge No',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {params.value as string || '-'}
        </Typography>
      ),
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: 'borc',
      headerName: 'Borç',
      width: 130,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as CariHareket;
        return row.tip === 'BORC' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
            <ArrowUpward sx={{ fontSize: 14, color: '#ef4444' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
              ₺{parseFloat(row.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>-</Typography>
        );
      },
    },
    {
      field: 'alacak',
      headerName: 'Alacak',
      width: 130,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as CariHareket;
        return row.tip === 'ALACAK' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
            <ArrowDownward sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
              ₺{parseFloat(row.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>-</Typography>
        );
      },
    },
    {
      field: 'bakiye',
      headerName: 'Bakiye',
      width: 130,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const bakiye = parseFloat(params.value as string);
        return (
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: bakiye >= 0 ? 'text.primary' : '#ef4444' }}>
            ₺{bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Typography>
        );
      },
    },
  ];

  if (!cari) {
    return (
      <StandardPage title="Cari Hesap Hareketleri">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </StandardPage>
    );
  }

  return (
    <StandardPage title="">
      {/* Header Section */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/accounts')}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Cari Hesap Listesine Dön
        </Button>

        <StandardCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {cari.unvan}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight="bold">Cari Kodu:</Box> {cari.cariKodu}
                </Typography>
                {cari.vergiNo && (
                  <Typography variant="body2" color="text.secondary">
                    <Box component="span" fontWeight="bold">Vergi No:</Box> {cari.vergiNo}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TableChart />}
                onClick={handleExportExcel}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'success.main', borderColor: 'success.main' }}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPdf}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'error.main', borderColor: 'error.main' }}
              >
                PDF
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Print />}
                onClick={handleExportPdf}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Yazdır
              </Button>
            </Box>
          </Box>
        </StandardCard>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StandardCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha('#ef4444', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp sx={{ color: '#ef4444' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#ef4444', lineHeight: 1.2 }}>
                  ₺{totals.borc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam Borç
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StandardCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha('#10b981', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingDown sx={{ color: '#10b981' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#10b981', lineHeight: 1.2 }}>
                  ₺{totals.alacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toplam Alacak
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StandardCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: currentBakiye >= 0 ? alpha('#3b82f6', 0.1) : alpha('#ef4444', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AccountBalance sx={{ color: currentBakiye >= 0 ? '#3b82f6' : '#ef4444' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: currentBakiye >= 0 ? '#3b82f6' : '#ef4444', lineHeight: 1.2 }}>
                  {currentBakiye < 0 && '-'}₺{Math.abs(currentBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bakiye
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <StandardCard sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterList sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight="600" color="text.secondary">
            Tarih Filtresi:
          </Typography>
          <TextField
            type="date"
            size="small"
            value={baslangicTarihi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaslangicTarihi(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <Typography variant="body2" color="text.secondary">-</Typography>
          <TextField
            type="date"
            size="small"
            value={bitisTarihi}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBitisTarihi(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {hareketler.length} hareket
          </Typography>
        </Box>
      </StandardCard>

      {/* DataGrid Table */}
      <StandardCard padding={0}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={hareketler}
            columns={columns}
            getRowId={(row: CariHareket) => row.id}
            disableRowSelectionOnClick
            loading={loading}
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
            }}
            pageSizeOptions={[25, 50, 100]}
            slots={{
              toolbar: () => (
                <GridToolbarContainer sx={{ p: 1, borderBottom: '1px solid var(--border)' }}>
                  <Box sx={{ flexGrow: 1 }} />
                  <GridToolbarColumnsButton />
                  <GridToolbarFilterButton />
                  <GridToolbarDensitySelector />
                  <GridToolbarExport />
                </GridToolbarContainer>
              ),
              loadingOverlay: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">Yükleniyor...</Typography>
                </Box>
              ),
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
                  <Description sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">Henüz hareket kaydı bulunmuyor</Typography>
                </Box>
              ),
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            }}
          />
        </Box>
      </StandardCard>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Invoice Dialog */}
      <FaturaOzetDialog
        open={openInvoice}
        onClose={() => setOpenInvoice(false)}
        invoice={selectedInvoice}
      />
    </StandardPage>
  );
}
