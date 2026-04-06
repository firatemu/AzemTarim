'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import {
  Add,
  CheckCircle,
  Close,
  Delete,
  Edit,
  Print,
  Search,
  Visibility,
  Cancel,
  Download,
  RefreshOutlined,
  ArrowUpward,
  FilterList,
  ExpandMore,
  MoreHoriz,
  Receipt,
  Payments,
  History,
  Description,
  AccountBalanceWallet,
  FileCopy,
  TrendingUp,
  CloudUpload,
  Undo,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  alpha,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { GridColDef, GridRenderCellParams, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import KPIHeader from '@/components/Fatura/KPIHeader';
import InvoiceDataGrid from '@/components/Fatura/InvoiceDataGrid';
import { StandardCard, StandardPage } from '@/components/common';

interface Cari {
  id: string;
  accountCode?: string;
  code?: string;
  title: string;
}

interface FaturaKalemi {
  id: string;
  productId: string;
  product?: { id: string; name: string; code: string };
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate?: number;
  discountAmount?: number;
  amount?: number;
  vatAmount?: number;
}

interface Fatura {
  id: string;
  invoiceNo: string;
  invoiceType: 'SALE' | 'PURCHASE';
  date: string;
  dueDate: string | null;
  account: Cari;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  status: 'OPEN' | 'APPROVED' | 'PARTIALLY_PAID' | 'CLOSED' | 'CANCELLED';
  iskonto?: number;
  description?: string;
  items?: FaturaKalemi[];
  paidAmount?: number;
  remainingAmount?: number;
  purchaseDeliveryNoteId?: string;
  purchaseDeliveryNote?: { id: string; deliveryNoteNo: string };
  createdByUser?: { fullName?: string; username?: string };
  createdAt?: string;
  updatedByUser?: { fullName?: string; username?: string };
  updatedAt?: string;
  logs?: Array<{ createdAt: string; message: string; actionType?: string; user?: any }>;
}

interface PurchaseStats {
  aylikAlis: { tutar: number; adet: number };
  odemeBekleyen: { tutar: number; adet: number };
  vadesiGecmis: { tutar: number; adet: number };
}

const statusConfig: Record<string, { label: string; color: any }> = {
  DRAFT: { label: 'Taslak', color: 'default' },
  PENDING: { label: 'Beklemede', color: 'warning' },
  OPEN: { label: 'Açık', color: 'info' },
  APPROVED: { label: 'Onaylandı', color: 'primary' },
  PARTIALLY_PAID: { label: 'Kısmi Ödendi', color: 'warning' },
  CLOSED: { label: 'Kapandı', color: 'success' },
  CANCELLED: { label: 'İptal', color: 'error' },
};

const EDITABLE_STATUSES = ['DRAFT', 'PENDING'];
const APPROVABLE_STATUSES = ['DRAFT', 'PENDING', 'OPEN'];
const CANCELLABLE_STATUSES = ['APPROVED', 'PARTIALLY_PAID'];

export default function AlisFaturalariPage() {
  const theme = useTheme();
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [rowCount, setRowCount] = useState(0);

  // Dialog states
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // İstatistikler
  const [stats, setStats] = useState<PurchaseStats | null>(null);

  // Filtreler
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);
  const [filterCariId, setFilterCariId] = useState('');

  useEffect(() => {
    addTab({ id: 'invoice-purchase', label: 'Satın Alma Faturaları', path: '/invoice/purchase' });
  }, [addTab]);

  useEffect(() => {
    fetchFaturalar();
    fetchCariler();
    fetchStats();
  }, [paginationModel, sortModel, filterCariId, filterStartDate, filterEndDate, filterDurum]);

  const fetchFaturalar = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        type: 'PURCHASE',
        search: searchTerm,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/invoices', { params });
      setFaturalar(response.data?.data || []);
      setRowCount(response.data?.meta?.total || 0);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Faturalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/account', { params: { limit: 1000 } });
      setCariler(response.data.data || []);
    } catch (error) { console.error('Cariler hata:', error); }
  };

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = { type: 'PURCHASE' };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/invoices/stats', { params });
      setStats(response.data);
    } catch (error) { console.error('Stats hata:', error); }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClearFilters = () => {
    setFilterStartDate(''); setFilterEndDate(''); setFilterDurum([]); setFilterCariId(''); setSearchTerm('');
  };

  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = { type: 'PURCHASE' };
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/invoices/export/excel', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satin_alma_faturalari_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) { showSnackbar('Excel aktarımı başarısız', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedFatura) return;
    try {
      await axios.delete(`/invoices/${selectedFatura.id}`);
      showSnackbar('Fatura başarıyla silindi', 'success');
      setOpenDelete(false); fetchFaturalar(); fetchStats();
    } catch (error: any) { showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error'); }
  };

  const handleView = async (row: Fatura) => {
    try {
      const response = await axios.get(`/invoices/${row.id}`);
      setSelectedFatura(response.data);
      setOpenView(true);
    } catch (error: any) { showSnackbar('Fatura yüklenirken hata oluştu', 'error'); }
  };

  const handleEdit = (row: Fatura) => {
    const tabId = `purchase-invoice-edit-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.invoiceNo}`, path: `/invoice/purchase/duzenle/${row.id}` });
    setActiveTab(tabId); router.push(`/invoice/purchase/duzenle/${row.id}`);
  };

  const handleApprove = async (row: Fatura) => {
    try {
      await axios.put(`/invoices/${row.id}/status`, { status: 'APPROVED' });
      showSnackbar(`${row.invoiceNo} numaralı fatura onaylanıp stok ve cari hareketleri oluşturuldu.`, 'success');
      fetchFaturalar(); fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Onaylama işlemi başarısız', 'error');
    }
  };

  const handleRevertToDraft = async (row: Fatura) => {
    try {
      await axios.put(`/invoices/${row.id}/status`, { status: 'DRAFT' });
      showSnackbar(`${row.invoiceNo} numaralı fatura taslağa çevrildi. Oluşan hareketler geri alındı.`, 'success');
      fetchFaturalar(); fetchStats();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Taslağa çevirme işlemi başarısız', 'error');
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const kpiData = useMemo(() => stats ? {
    aylikSatis: { tutar: stats.aylikAlis?.tutar || 0, adet: stats.aylikAlis?.adet || 0 },
    tahsilatBekleyen: { tutar: stats.odemeBekleyen?.tutar || 0, adet: stats.odemeBekleyen?.adet || 0 },
    vadesiGecmis: { tutar: stats.vadesiGecmis?.tutar || 0, adet: stats.vadesiGecmis?.adet || 0 },
  } : null, [stats]);

  const pageGrandTotal = useMemo(() => faturalar.reduce((sum, i) => sum + (i.grandTotal || 0), 0), [faturalar]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'invoiceNo', headerName: 'Fatura No', width: 140,
      renderCell: (params) => <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
    },
    { field: 'date', headerName: 'Tarih', width: 110, valueFormatter: (value) => formatDate(value) },
    {
      field: 'account', headerName: 'Cari Ünvan', flex: 1, minWidth: 200,
      valueGetter: (_v, row: Fatura) => row.account?.title || '',
      renderCell: (params) => <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
    },
    {
      field: 'grandTotal', headerName: 'Tutar', width: 140, type: 'number', align: 'right', headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <ArrowUpward sx={{ fontSize: 14, color: 'var(--chart-2)' }} />
          <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--chart-2)' }}>{formatCurrency(params.value)}</Typography>
        </Box>
      )
    },
    {
      field: 'paidAmount', headerName: 'Ödenen', width: 130, type: 'number', align: 'right', headerAlign: 'right',
      valueFormatter: (value) => formatCurrency(value || 0),
      renderCell: (params) => <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>{formatCurrency(params.value || 0)}</Typography>
    },
    {
      field: 'remainingAmount', headerName: 'Kalan', width: 130, type: 'number', align: 'right', headerAlign: 'right',
      valueFormatter: (value) => formatCurrency(value || 0),
      renderCell: (params) => <Typography variant="body2" sx={{ color: params.value > 0 ? 'error.main' : 'text.secondary', fontWeight: 700 }}>{formatCurrency(params.value || 0)}</Typography>
    },
    {
      field: 'status', headerName: 'Durum', width: 130,
      renderCell: (params) => {
        const config = statusConfig[params.value] || { label: params.value, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px' }} />;
      }
    },
    {
      field: 'actions', headerName: 'İşlemler', width: 80, sortable: false,
      renderCell: (params) => {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const row = params.row as Fatura;

        const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        const menuActions = [
          {
            id: 'view',
            label: 'Detayları Görüntüle',
            icon: <Visibility fontSize="small" />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); handleView(row); },
            disabled: false,
          },
          {
            id: 'edit',
            label: 'Düzenle',
            icon: <Edit fontSize="small" />,
            color: EDITABLE_STATUSES.includes(row.status) ? 'var(--primary)' : 'var(--muted-foreground)',
            onClick: () => { handleClose(); handleEdit(row); },
            disabled: !EDITABLE_STATUSES.includes(row.status),
          },
          {
            id: 'approve',
            label: 'Onayla',
            icon: <CheckCircle fontSize="small" sx={{ color: 'var(--chart-3)' }} />,
            color: 'var(--chart-3)',
            onClick: () => { handleClose(); handleApprove(row); },
            disabled: !APPROVABLE_STATUSES.includes(row.status),
          },
          {
            id: 'revert',
            label: 'Taslağa Çevir',
            icon: <Undo fontSize="small" sx={{ color: 'var(--chart-4)' }} />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); handleRevertToDraft(row); },
            disabled: row.status !== 'APPROVED',
          },
          {
            id: 'payment',
            label: 'Ödeme Ekle',
            icon: <Payments fontSize="small" sx={{ color: 'var(--chart-2)' }} />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); router.push(`/payments/purchase/yeni?faturaId=${row.id}`); },
            disabled: false,
          },
          {
            id: 'print',
            label: 'Yazdır',
            icon: <Print fontSize="small" />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); window.open(`/invoice/purchase/print/${row.id}`, '_blank'); },
            disabled: false,
          },
          {
            id: 'copy',
            label: 'Kopyasını Oluştur',
            icon: <FileCopy fontSize="small" />,
            color: 'var(--foreground)',
            onClick: () => {
              handleClose();
              const path = `/invoice/purchase/yeni?kopyala=${row.id}`;
              const tabId = `purchase-invoice-copy-${row.id}`;
              addTab({ id: tabId, label: `Kopya: ${row.invoiceNo}`, path });
              setActiveTab(tabId);
              router.push(path);
            },
            disabled: false,
          },
          {
            id: 'profit',
            label: 'Kâr/Zarar Analizi',
            icon: <TrendingUp fontSize="small" sx={{ color: 'var(--chart-3)' }} />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); /* TODO: Implement profit analysis */ },
            disabled: false,
          },
          {
            id: 'template',
            label: 'Şablon Olarak Kullan',
            icon: <Description fontSize="small" />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); /* TODO: Implement template */ },
            disabled: false,
          },
          {
            id: 'einvoice',
            label: 'E-Fatura Gönder',
            icon: <CloudUpload fontSize="small" sx={{ color: 'var(--primary)' }} />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); /* TODO: Implement e-invoice */ },
            disabled: false,
          },
          {
            id: 'cancel',
            label: 'İptal Et',
            icon: <Cancel fontSize="small" sx={{ color: 'var(--destructive)' }} />,
            color: 'var(--destructive)',
            onClick: () => { handleClose(); /* TODO: Implement cancel */ },
            disabled: !CANCELLABLE_STATUSES.includes(row.status),
          },
          {
            id: 'delete',
            label: 'Sil',
            icon: <Delete fontSize="small" sx={{ color: 'var(--destructive)' }} />,
            color: 'var(--destructive)',
            onClick: () => { handleClose(); setSelectedFatura(row); setOpenDelete(true); },
            disabled: !EDITABLE_STATUSES.includes(row.status),
          },
        ];

        return (
          <>
            <IconButton
              size="small"
              onClick={handleToggle}
              sx={{
                bgcolor: open ? 'var(--secondary)' : 'transparent',
                color: open ? 'var(--secondary-foreground)' : 'text.secondary',
                '&:hover': {
                  bgcolor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <MoreHoriz fontSize="small" />
            </IconButton>

            {/* Creative Action Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                elevation: 8,
                sx: {
                  minWidth: 280,
                  mt: 1,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderTop: '1px solid var(--border)',
                    borderLeft: '1px solid var(--border)',
                  },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Header with Invoice Info */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Fatura İşlemleri
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                  {row.invoiceNo}
                </Typography>
              </Box>

              {/* Quick Actions Section */}
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Hızlı İşlemler
                </Typography>
                {menuActions.slice(0, 6).map((action) => (
                  <MenuItem
                    key={action.id}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      my: 0.25,
                      color: action.color,
                      '&:hover': {
                        bgcolor: 'var(--secondary)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      {action.icon}
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {action.label}
                    </Typography>
                  </MenuItem>
                ))}
              </Box>

              {/* Advanced Section */}
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Gelişmiş İşlemler
                </Typography>
                {menuActions.slice(6).map((action) => (
                  <MenuItem
                    key={action.id}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      my: 0.25,
                      color: action.color,
                      '&:hover': {
                        bgcolor: action.id === 'cancel' || action.id === 'delete'
                          ? 'var(--destructive)'
                          : 'var(--secondary)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      {action.icon}
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {action.label}
                    </Typography>
                  </MenuItem>
                ))}
              </Box>
            </Menu>
          </>
        );
      }
    }
  ], []);

  return (
    <StandardPage maxWidth={false}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--chart-2) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt sx={{ color: 'var(--chart-2)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700">Satın Alma Faturaları</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => {
          addTab({ id: 'purchase-invoice-yeni', label: 'Yeni Fatura', path: '/invoice/purchase/yeni' });
          setActiveTab('purchase-invoice-yeni'); router.push('/invoice/purchase/yeni');
        }} sx={{ bgcolor: 'var(--chart-2)', '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 85%, black)' } }}>
          Yeni Fatura
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, height: 3 }} color="secondary" />}
      <KPIHeader loading={loading} data={kpiData} type="ALIS" />

      <StandardCard padding={0} sx={{ mt: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField size="small" placeholder="Fatura No, Cari Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 250 }} />

          <Stack direction="row" spacing={1}>
            {['TÜMÜ', 'BUGÜN', 'BU AY'].map(l => {
              const selected = (l === 'TÜMÜ' && !filterStartDate);
              return <Chip key={l} label={l} variant={selected ? 'filled' : 'outlined'} color={selected ? 'secondary' : 'default'} onClick={() => {
                if (l === 'TÜMÜ') { setFilterStartDate(''); setFilterEndDate(''); }
                // BUGÜN/BU AY mantığı eklenebilir
              }} sx={{ cursor: 'pointer' }} />;
            })}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtreler"><IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'secondary' : 'default'}><FilterList fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Excel"><IconButton onClick={handleExportExcel}><Download fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Yenile"><IconButton onClick={fetchFaturalar}><RefreshOutlined fontSize="small" /></IconButton></Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth type="date" size="small" label="Başlangıç" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth type="date" size="small" label="Bitiş" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Autocomplete size="small" options={cariler} getOptionLabel={o => o.title} value={cariler.find(c => c.id === filterCariId) || null} onChange={(_, v) => setFilterCariId(v?.id || '')} renderInput={p => <TextField {...p} label="Cari" />} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Button fullWidth variant="outlined" onClick={handleClearFilters}>Temizle</Button></Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Tablo Satır Özeti */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Toplam <b>{rowCount}</b> fatura listeleniyor
          </Typography>
        </Box>

        <InvoiceDataGrid rows={faturalar} columns={columns} loading={loading} rowCount={rowCount} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} checkboxSelection={false} height={800} />
        {/* Tablo footer sum */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Bu sayfadaki toplam <b>Tutar</b>:
          </Typography>
          <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--chart-2)' }}>
            {formatCurrency(pageGrandTotal)}
          </Typography>
        </Box>
      </StandardCard>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Fatura Detayı
          <Chip label={statusConfig[selectedFatura?.status || '']?.label} color={statusConfig[selectedFatura?.status || '']?.color} size="small" />
        </DialogTitle>
        <DialogContent dividers>
          {selectedFatura && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Fatura No</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFatura.invoiceNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Tarih</Typography>
                  <Typography variant="body1" fontWeight={700}>{formatDate(selectedFatura.date)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Vade Tarihi</Typography>
                  <Typography variant="body1" fontWeight={700} color="error.main">{selectedFatura.dueDate ? formatDate(selectedFatura.dueDate) : '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Cari Ünvan</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFatura.account?.title}</Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Fatura Kalemleri</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Ürün/Hizmet</TableCell>
                    <TableCell align="center">Miktar</TableCell>
                    <TableCell align="right">Birim Fiyat</TableCell>
                    <TableCell align="right">İskonto</TableCell>
                    <TableCell align="right">Top. KDV</TableCell>
                    <TableCell align="right">Satır Toplamı</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {selectedFatura.items?.map((k, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{k.product?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{k.product?.code}</Typography>
                        </TableCell>
                        <TableCell align="center">{k.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(k.unitPrice)}</TableCell>
                        <TableCell align="right">
                          {k.discountRate > 0 || k.discountAmount > 0 ? (
                            <Tooltip title={`Oran: %${k.discountRate || 0} / Tutar: ${formatCurrency(k.discountAmount || 0)}`}>
                              <Typography variant="caption" sx={{ cursor: 'help', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                                {k.discountRate > 0 ? `%${k.discountRate}` : formatCurrency(k.discountAmount)}
                              </Typography>
                            </Tooltip>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(k.vatAmount || 0)}</TableCell>
                        <TableCell align="right" fontWeight={600}>{formatCurrency((Number(k.amount) || 0) + (Number(k.vatAmount) || 0))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 250, bgcolor: 'action.hover' }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Ara Toplam:</Typography><Typography variant="body2">{formatCurrency(Number(selectedFatura.totalAmount || 0) + Number(selectedFatura.discount || 0))}</Typography></Box>
                    {Number(selectedFatura.discount) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Genel İskonto:</Typography><Typography variant="body2" color="error.main">-{formatCurrency(selectedFatura.discount)}</Typography></Box>
                    )}
                    {(Number(selectedFatura.sctTotal) > 0 || Number(selectedFatura.withholdingTotal) > 0) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Net Ara Toplam:</Typography><Typography variant="body2">{formatCurrency(selectedFatura.totalAmount)}</Typography></Box>
                    )}
                    {Number(selectedFatura.sctTotal) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">ÖİV Toplamı:</Typography><Typography variant="body2">{formatCurrency(selectedFatura.sctTotal)}</Typography></Box>
                    )}
                    {Number(selectedFatura.withholdingTotal) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">Tevkifat Toplamı:</Typography><Typography variant="body2" color="error.main">-{formatCurrency(selectedFatura.withholdingTotal)}</Typography></Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2">KDV Toplamı:</Typography><Typography variant="body2">{formatCurrency(selectedFatura.vatAmount)}</Typography></Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="subtitle1" fontWeight={800}>GENEL TOPLAM:</Typography><Typography variant="subtitle1" fontWeight={800} color="var(--chart-2)">{formatCurrency(selectedFatura.grandTotal)}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="success.main">Ödenen:</Typography><Typography variant="body2" color="success.main">{formatCurrency(selectedFatura.paidAmount || 0)}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="error.main" fontWeight={700}>Kalan:</Typography><Typography variant="body2" color="error.main" fontWeight={700}>{formatCurrency(selectedFatura.remainingAmount || 0)}</Typography></Box>
                  </Stack>
                </Paper>
              </Box>

              <Accordion sx={{ boxShadow: 'none', border: '1px solid divider', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}><Stack direction="row" spacing={1} alignItems="center"><History fontSize="small" /><Typography variant="subtitle2">Denetim ve Loglar</Typography></Stack></AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" display="block">Oluşturan: {selectedFatura.createdByUser?.fullName} ({formatDate(selectedFatura.createdAt || '')})</Typography>
                  {selectedFatura.logs?.map((log, i) => (
                    <Typography key={i} variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>• {formatDate(log.createdAt)}: {log.message}</Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenView(false)} variant="outlined">Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Fatura Sil</DialogTitle>
        <DialogContent><Typography><strong>{selectedFatura?.invoiceNo}</strong> nolu fatura silinecek. Bu işlem geri alınamaz. Emin misiniz?</Typography></DialogContent>
        <DialogActions><Button onClick={() => setOpenDelete(false)}>Vazgeç</Button><Button onClick={handleDelete} color="error" variant="contained">Evet, Sil</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </StandardPage>
  );
}
