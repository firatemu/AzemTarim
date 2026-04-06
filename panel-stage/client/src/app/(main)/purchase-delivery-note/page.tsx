'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import {
  Add,
  Delete,
  Edit,
  Print,
  Search,
  Visibility,
  Download,
  RefreshOutlined,
  ArrowUpward,
  FilterList,
  ExpandMore,
  MoreVert,
  LocalShipping,
  Receipt,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Autocomplete,
  Link as MuiLink,
  Menu,
  MenuItem,
  Paper,
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

interface IrsaliyeKalemi {
  id: string;
  productId: string;
  product?: { id: string; name: string; code: string; unit?: string };
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate?: number;
  discountAmount?: number;
  amount?: number;
  vatAmount?: number;
}

interface ProcurementDeliveryNote {
  id: string;
  deliveryNoteNo: string;
  date: string;
  account: Cari;
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  status: 'NOT_INVOICED' | 'PARTIALLY_INVOICED' | 'INVOICED' | 'CANCELLED';
  sourceType: 'ORDER' | 'DIRECT' | 'INVOICE_AUTO';
  sourceOrder?: {
    id: string;
    orderNo: string;
  };
  relatedInvoice?: {
    id: string;
    invoiceNo: string;
  };
  invoiceNos?: string[];
  description?: string;
  items?: IrsaliyeKalemi[];
  createdByUser?: { fullName?: string; username?: string };
  createdAt?: string;
  updatedByUser?: { fullName?: string; username?: string };
  updatedAt?: string;
  logs?: Array<{ createdAt: string; message: string; actionType?: string; user?: any }>;
}

interface DeliveryNoteStats {
  monthlyNotes: { totalAmount: number; count: number };
  pendingNotes: { totalAmount: number; count: number };
  deliveredNotes: { totalAmount: number; count: number };
}

const statusConfig: Record<string, { label: string; color: any; icon: any }> = {
  NOT_INVOICED: { label: 'Faturalanmadı', color: 'warning', icon: <LocalShipping sx={{ fontSize: 16 }} /> },
  PARTIALLY_INVOICED: { label: 'Kısmi Faturalandı', color: 'info', icon: <Receipt sx={{ fontSize: 16 }} /> },
  INVOICED: { label: 'Faturalandı', color: 'success', icon: <Receipt sx={{ fontSize: 16 }} /> },
  CANCELLED: { label: 'İptal', color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> },
};

export default function SatinAlmaIrsaliyeleriPage() {
  const theme = useTheme();
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [irsaliyeler, setIrsaliyeler] = useState<ProcurementDeliveryNote[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [rowCount, setRowCount] = useState(0);

  // Dialog states
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedIrsaliye, setSelectedIrsaliye] = useState<ProcurementDeliveryNote | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // İstatistikler
  const [stats, setStats] = useState<DeliveryNoteStats | null>(null);

  // Filtreler
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);
  const [filterCariId, setFilterCariId] = useState('');

  useEffect(() => {
    addTab({ id: 'purchase-delivery-note-list', label: 'Satın Alma İrsaliyeleri', path: '/purchase-delivery-note' });
  }, [addTab]);

  useEffect(() => {
    fetchIrsaliyeler();
    fetchCariler();
    fetchStats();
  }, [paginationModel, sortModel, filterModel, filterCariId, filterStartDate, filterEndDate, filterDurum]);

  const fetchIrsaliyeler = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
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

      const response = await axios.get('/purchase-waybill', { params });
      setIrsaliyeler(response.data?.data || []);
      setRowCount(response.data?.meta?.total || 0);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu', 'error');
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
      const params: Record<string, any> = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/purchase-waybill/stats', { params });
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
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/purchase-waybill/export/excel', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satin_alma_irsaliyeleri_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) { showSnackbar('Excel aktarımı başarısız', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedIrsaliye) return;
    try {
      await axios.delete(`/purchase-waybill/${selectedIrsaliye.id}`);
      showSnackbar('İrsaliye başarıyla silindi', 'success');
      setOpenDelete(false); fetchIrsaliyeler(); fetchStats();
    } catch (error: any) { showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error'); }
  };

  const handleView = async (row: ProcurementDeliveryNote) => {
    try {
      const response = await axios.get(`/purchase-waybill/${row.id}`);
      setSelectedIrsaliye(response.data);
      setOpenView(true);
    } catch (error: any) { showSnackbar('İrsaliye yüklenirken hata oluştu', 'error'); }
  };

  const handleEdit = (row: ProcurementDeliveryNote) => {
    const tabId = `purchase-delivery-note-edit-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.deliveryNoteNo}`, path: `/purchase-delivery-note/duzenle/${row.id}` });
    setActiveTab(tabId); router.push(`/purchase-delivery-note/duzenle/${row.id}`);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const kpiData = useMemo(() => stats ? {
    aylikSatis: { tutar: stats.monthlyNotes?.totalAmount || 0, adet: stats.monthlyNotes?.count || 0 },
    tahsilatBekleyen: { tutar: stats.pendingNotes?.totalAmount || 0, adet: stats.pendingNotes?.count || 0 },
    vadesiGecmis: { tutar: stats.deliveredNotes?.totalAmount || 0, adet: stats.deliveredNotes?.count || 0 },
  } : null, [stats]);

  const pageGrandTotal = useMemo(() => irsaliyeler.reduce((sum, i) => sum + (i.grandTotal || 0), 0), [irsaliyeler]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'deliveryNoteNo', headerName: 'İrsaliye No', width: 150,
      renderCell: (params) => <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
    },
    { field: 'date', headerName: 'Tarih', width: 120, valueFormatter: (value) => formatDate(value) },
    { field: 'accountCode', headerName: 'Cari Kod', width: 130, valueGetter: (_v, row: ProcurementDeliveryNote) => row.account?.code || row.account?.accountCode || '' },
    {
      field: 'account', headerName: 'Cari Ünvan', flex: 1, minWidth: 200,
      valueGetter: (_v, row: ProcurementDeliveryNote) => row.account?.title || '',
      renderCell: (params) => <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
    },
    {
      field: 'invoiceNos', headerName: 'Fatura No', width: 130,
      renderCell: (params: GridRenderCellParams<ProcurementDeliveryNote>) => {
        const invs = params.value as string[] || [];
        if (invs.length === 0) return '-';
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {invs.map(inv => (
              <Chip key={inv} label={inv} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            ))}
          </Box>
        );
      }
    },
    {
      field: 'grandTotal', headerName: 'Tutar', width: 150, type: 'number', align: 'right', headerAlign: 'right',
      valueFormatter: (value) => formatCurrency(value),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          <ArrowUpward sx={{ fontSize: 14, color: 'var(--chart-2)' }} />
          <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--chart-2)' }}>{formatCurrency(params.value)}</Typography>
        </Box>
      )
    },
    {
      field: 'status', headerName: 'Durum', width: 140,
      renderCell: (params) => {
        const config = statusConfig[params.value] || { label: params.value, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }} />;
      }
    },
    {
      field: 'actions', headerName: 'İşlemler', width: 80, sortable: false, pinned: 'right',
      renderCell: (params) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const row = params.row as ProcurementDeliveryNote;

        const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        const canEdit = row.status === 'NOT_INVOICED';
        const canInvoice = row.status === 'NOT_INVOICED' || row.status === 'PARTIALLY_INVOICED';

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
            color: 'var(--foreground)',
            onClick: () => { handleClose(); handleEdit(row); },
            disabled: !canEdit,
          },
          {
            id: 'invoice',
            label: 'Faturaya Çevir',
            icon: <Receipt fontSize="small" sx={{ color: 'var(--primary)' }} />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); router.push(`/invoice/purchase/yeni?irsaliyeId=${row.id}`); },
            disabled: !canInvoice,
          },
          {
            id: 'print',
            label: 'Yazdır',
            icon: <Print fontSize="small" />,
            color: 'var(--foreground)',
            onClick: () => { handleClose(); window.open(`/purchase-delivery-note/print/${row.id}`, '_blank'); },
            disabled: false,
          },
          {
            id: 'delete',
            label: 'Sil',
            icon: <Delete fontSize="small" sx={{ color: 'var(--destructive)' }} />,
            color: 'var(--destructive)',
            onClick: () => { handleClose(); setSelectedIrsaliye(row); setOpenDelete(true); },
            disabled: !canEdit,
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
              <MoreVert fontSize="small" />
            </IconButton>

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
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  İrsaliye İşlemleri
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                  {row.deliveryNoteNo}
                </Typography>
              </Box>

              <Box sx={{ px: 1.5, py: 1 }}>
                {menuActions.map((action) => (
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
                        bgcolor: action.id === 'delete'
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
            <LocalShipping sx={{ color: 'var(--chart-2)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700">Satın Alma İrsaliyeleri</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add />} onClick={() => {
          addTab({ id: 'purchase-delivery-note-yeni', label: 'Yeni İrsaliye', path: '/purchase-delivery-note/yeni' });
          setActiveTab('purchase-delivery-note-yeni'); router.push('/purchase-delivery-note/yeni');
        }} sx={{ bgcolor: 'var(--chart-2)', '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 85%, black)' } }}>
          Yeni İrsaliye
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, height: 3 }} color="secondary" />}
      <KPIHeader loading={loading} data={kpiData} type="ALIS" />

      <StandardCard padding={0} sx={{ mt: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField size="small" placeholder="İrsaliye Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 250 }} />

          <Stack direction="row" spacing={1}>
            {['TÜMÜ', 'BUGÜN', 'BU HAFTA', 'BU AY'].map(l => {
              const selected = (l === 'TÜMÜ' && !filterStartDate) || (l === 'BUGÜN' && filterStartDate === new Date().toISOString().split('T')[0]);
              return <Chip key={l} label={l} variant={selected ? 'filled' : 'outlined'} color={selected ? 'secondary' : 'default'} onClick={() => {
                if (l === 'TÜMÜ') { setFilterStartDate(''); setFilterEndDate(''); }
                else if (l === 'BUGÜN') { const d = new Date().toISOString().split('T')[0]; setFilterStartDate(d); setFilterEndDate(d); }
              }} sx={{ cursor: 'pointer' }} />;
            })}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtreler"><IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'secondary' : 'default'}><FilterList fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Excel"><IconButton onClick={handleExportExcel}><Download fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Yenile"><IconButton onClick={fetchIrsaliyeler}><RefreshOutlined fontSize="small" /></IconButton></Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth type="date" size="small" label="Başlangıç" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth type="date" size="small" label="Bitiş" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Autocomplete size="small" options={cariler} getOptionLabel={o => `${o.code || o.accountCode || ''} - ${o.title}`} value={cariler.find(c => c.id === filterCariId) || null} onChange={(_, v) => setFilterCariId(v?.id || '')} renderInput={p => <TextField {...p} label="Cari" />} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}><Button fullWidth variant="outlined" onClick={handleClearFilters}>Temizle</Button></Grid>
            </Grid>
          </Box>
        </Collapse>

        <InvoiceDataGrid rows={irsaliyeler} columns={columns} loading={loading} rowCount={rowCount} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} checkboxSelection={false} height={800} />
      </StandardCard>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>İrsaliye Detayı</DialogTitle>
        <DialogContent>
          {selectedIrsaliye && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">No</Typography><Typography variant="body2" fontWeight={700}>{selectedIrsaliye.deliveryNoteNo}</Typography></Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">Tarih</Typography><Typography variant="body2" fontWeight={700}>{formatDate(selectedIrsaliye.date)}</Typography></Grid>
                <Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">Durum</Typography><Box><Chip label={statusConfig[selectedIrsaliye.status]?.label} color={statusConfig[selectedIrsaliye.status]?.color} size="small" /></Box></Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary">Cari</Typography>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>{selectedIrsaliye.account?.title}</Typography>

              {selectedIrsaliye.items && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell>Ürün</TableCell><TableCell align="center">Miktar</TableCell><TableCell align="right">Birim Fiyat</TableCell><TableCell align="right">Toplam</TableCell></TableRow></TableHead>
                    <TableBody>
                      {selectedIrsaliye.items.map((k, i) => (
                        <TableRow key={i}><TableCell>{k.product?.name}</TableCell><TableCell align="center">{k.quantity}</TableCell><TableCell align="right">{formatCurrency(k.unitPrice)}</TableCell><TableCell align="right">{formatCurrency((k.amount || 0) + (k.vatAmount || 0))}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200 }}><Typography variant="caption">KDV:</Typography><Typography variant="body2">{formatCurrency(selectedIrsaliye.vatAmount)}</Typography></Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, mt: 1 }}><Typography variant="subtitle2" fontWeight={800}>GENEL TOPLAM:</Typography><Typography variant="subtitle2" fontWeight={800} color="var(--chart-2)">{formatCurrency(selectedIrsaliye.grandTotal)}</Typography></Box>
              </Box>

              <Accordion sx={{ mt: 2, boxShadow: 'none', border: '1px solid divider' }}>
                <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Denetim Bilgileri</Typography></AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" display="block">Oluşturan: {selectedIrsaliye.createdByUser?.fullName} ({formatDate(selectedIrsaliye.createdAt || '')})</Typography>
                  {selectedIrsaliye.updatedByUser && <Typography variant="caption" display="block">Güncelleyen: {selectedIrsaliye.updatedByUser?.fullName} ({formatDate(selectedIrsaliye.updatedAt || '')})</Typography>}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenView(false)}>Kapat</Button></DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>İrsaliye Sil</DialogTitle>
        <DialogContent><Typography><strong>{selectedIrsaliye?.deliveryNoteNo}</strong> nolu irsaliye silinecek. Emin misiniz?</Typography></DialogContent>
        <DialogActions><Button onClick={() => setOpenDelete(false)}>Vazgeç</Button><Button onClick={handleDelete} color="error" variant="contained">Sil</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </StandardPage>
  );
}
