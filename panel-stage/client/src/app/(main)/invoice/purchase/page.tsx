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
  Button,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Close,
  Cancel,
  Print,
  Undo,
  MoreVert,
  ExpandMore,
  Assessment,
  Search,
  FilterList,
  Download,
  RefreshOutlined,
  Receipt,
  ArrowDownward,
  ArrowUpward
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import {
  Stack,
  LinearProgress,
  Grid,
  Collapse
} from '@mui/material';
import KPIHeader from '@/components/Fatura/KPIHeader';
import InvoiceDataGrid from '@/components/Fatura/InvoiceDataGrid';
import StatusBadge from '@/components/Fatura/StatusBadge';
import { StandardPage, StandardCard } from '@/components/common';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTabStore } from '@/stores/tabStore';

interface Cari {
  id: string;
  accountCode: string;
  title: string;
  type: string;
  vergiNo?: string;
  tcKimlikNo?: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  kdvOrani: number;
}

interface FaturaKalemi {
  productId: string;
  product?: Stok;
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
  aciklama?: string;
  items?: FaturaKalemi[];
  paidAmount?: number;    // FIFO: Ödenen tutar
  remainingAmount?: number;  // FIFO: Kalan tutar
  createdByUser?: {
    fullName?: string;
    username?: string;
  };
  createdAt?: string;
  updatedByUser?: {
    fullName?: string;
    username?: string;
  };
  updatedAt?: string;
  logs?: Array<{
    createdAt: string;
    message: string;
  }>;
  purchaseDeliveryNote?: {
    id: string;
    deliveryNoteNo: string;
  };
}

interface PurchaseStats {
  aylikSatis: { tutar: number; adet: number };
  tahsilatBekleyen: { tutar: number; adet: number };
  vadesiGecmis: { tutar: number; adet: number };
}

export default function AlisFaturalariPage() {
  const { addTab, setActiveTab } = useTabStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [faturalar, setFaturalar] = useState<Fatura[]>([]);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [rowCount, setRowCount] = useState(0);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDurum, setFilterDurum] = useState<string[]>([]);
  const [filterCariId, setFilterCariId] = useState('');
  const [filterSatisElemaniId, setFilterSatisElemaniId] = useState('');
  const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openIptal, setOpenIptal] = useState(false);
  const [openDurumOnay, setOpenDurumOnay] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);
  const [pendingDurum, setPendingDurum] = useState<{ faturaId: string; eskiDurum: string; yeniDurum: string } | null>(null);
  const [faturaDurumlari, setFaturaDurumlari] = useState<Record<string, string>>({});
  const [irsaliyeIptal, setIrsaliyeIptal] = useState(false);

  // Açılır menü state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFaturaId, setMenuFaturaId] = useState<string | null>(null);


  // Form data
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceType: 'PURCHASE' as 'SALE' | 'PURCHASE',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    iskonto: 0,
    aciklama: '',
    items: [] as FaturaKalemi[],
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    addTab({
      id: 'invoice-purchase',
      label: 'Satın Alma Faturaları',
      path: '/invoice/purchase',
    });
    fetchFaturalar();
    fetchCariler();
    fetchStoklar();
    fetchSatisElemanlari();
    fetchStats();
  }, [paginationModel, sortModel, filterModel, filterCariId, filterSatisElemaniId, filterStartDate, filterEndDate, filterDurum]);

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
      if (filterSatisElemaniId) params.salesAgentId = filterSatisElemaniId;

      const response = await axios.get('/invoices', { params });
      const faturaData = response.data?.data || [];
      const totalCount = response.data?.meta?.total ?? response.data?.total ?? faturaData.length;
      setFaturalar(faturaData);
      setRowCount(totalCount);
      const durumMap: Record<string, string> = {};
      faturaData.forEach((fatura: Fatura) => {
        durumMap[fatura.id] = fatura.status;
      });
      setFaturaDurumlari(durumMap);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Faturalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSatisElemanlari = async () => {
    try {
      const response = await axios.get('/employees');
      setSatisElemanlari(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Satış elemanları yüklenirken hata:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = { type: 'PURCHASE' };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;
      if (filterSatisElemaniId) params.salesAgentId = filterSatisElemaniId;

      const response = await axios.get('/invoices/stats', {
        params,
      });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

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

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/products', {
        params: { limit: 1000 },
      });
      setStoklar(response.data.data || []);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterDurum([]);
    setSearchTerm('');
    setFilterCariId('');
    setFilterSatisElemaniId('');
  };

  const handleExportExcel = async () => {
    try {
      const params: Record<string, string> = { type: 'PURCHASE' };
      if (searchTerm) params.search = searchTerm;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterDurum.length > 0) params.status = filterDurum.join(',');
      if (filterCariId) params.accountId = filterCariId;

      const response = await axios.get('/invoices/export/excel', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `satin_alma_faturalari_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Excel dosyası indirildi', 'success');
    } catch (error: any) {
      showSnackbar('Excel aktarımı başarısız', 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, faturaId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuFaturaId(faturaId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFaturaId(null);
  };


  const resetForm = () => {
    setFormData({
      invoiceNo: '',
      invoiceType: 'PURCHASE',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      iskonto: 0,
      aciklama: '',
      items: [],
    });
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0, vatRate: 20, discountRate: 0, discountAmount: 0 }],
    }));
  };

  const handleRemoveKalem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof FaturaKalemi, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Stok seçildiğinde fiyat ve KDV oranını otomatik doldur
      if (field === 'productId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          newItems[index].unitPrice = stok.satisFiyati;
          newItems[index].vatRate = stok.kdvOrani;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    let totals = { totalAmount: 0, vatAmount: 0, grandTotal: 0 };

    formData.items.forEach(kalem => {
      const quantity = kalem.quantity || 0;
      const unitPrice = kalem.unitPrice || 0;
      const rawTutar = quantity * unitPrice;
      const discountRate = kalem.discountRate || 0;
      const discountAmount = kalem.discountAmount ?? (rawTutar * discountRate) / 100;
      const amount = rawTutar - discountAmount;
      const kalemVat = (amount * (kalem.vatRate || 0)) / 100;
      totals.totalAmount += amount;
      totals.vatAmount += kalemVat;
    });

    totals.totalAmount -= formData.iskonto || 0;
    totals.grandTotal = totals.totalAmount + totals.vatAmount;

    return totals;
  };

  const handleSave = async () => {
    try {
      if (!formData.accountId) {
        showSnackbar('Cari seçimi zorunludur', 'error');
        return;
      }

      if (formData.items.length === 0) {
        showSnackbar('En az bir kalem eklemelisiniz', 'error');
        return;
      }

      const { totalAmount, vatAmount, grandTotal } = calculateTotal();
      const savePayload = {
        ...formData,
        totalAmount,
        vatAmount,
        grandTotal,
      };

      if (selectedFatura) {
        await axios.put(`/invoices/${selectedFatura.id}`, savePayload);
        showSnackbar('Fatura başarıyla güncellendi', 'success');
        setOpenAdd(false);
      } else {
        await axios.post('/invoices', savePayload);
        showSnackbar('Fatura başarıyla oluşturuldu', 'success');
        setOpenAdd(false);
      }

      fetchFaturalar();
      resetForm();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedFatura) {
        await axios.delete(`/invoices/${selectedFatura.id}`);
        showSnackbar('Fatura başarıyla silindi', 'success');
        setOpenDelete(false);
        fetchFaturalar();
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const openAddDialog = () => {
    resetForm();
    // Otomatik fatura numarası oluştur
    const lastFatura = faturalar[0];
    const lastNo = lastFatura ? parseInt(lastFatura.invoiceNo.split('-')[2]) : 0;
    const newNo = (lastNo + 1).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      invoiceNo: `SF-${new Date().getFullYear()}-${newNo}`,
    }));
    setOpenAdd(true);
  };

  const openViewDialog = async (fatura: Fatura) => {
    try {
      const response = await axios.get(`/invoices/${fatura.id}`);
      setSelectedFatura(response.data);
      setOpenView(true);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Fatura yüklenirken hata oluştu', 'error');
    }
  };

  const openDeleteDialog = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setOpenDelete(true);
  };

  const openIptalDialog = (fatura: Fatura) => {
    setSelectedFatura(fatura);
    setOpenIptal(true);
  };

  const handleIptal = async () => {
    try {
      if (selectedFatura) {
        await axios.put(`/invoices/${selectedFatura.id}/cancel`, {
          deliveryNoteIptal: irsaliyeIptal,
        });
        const mesaj = irsaliyeIptal
          ? 'Fatura ve bağlı irsaliye başarıyla iptal edildi. Stoklar ve cari bakiye güncellendi.'
          : 'Fatura başarıyla iptal edildi. Stoklar ve cari bakiye güncellendi.';
        showSnackbar(mesaj, 'success');
        setOpenIptal(false);
        setIrsaliyeIptal(false);
        fetchFaturalar();
      }
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İptal işlemi başarısız', 'error');
    }
  };

  const handleDurumChangeRequest = (faturaId: string, eskiDurum: string, yeniDurum: string) => {
    // Eğer aynı duruma geçilmeye çalışılıyorsa, işlem yapma
    if (eskiDurum === yeniDurum) {
      return;
    }

    // Faturayı bul
    const fatura = faturalar.find(f => f.id === faturaId);
    if (!fatura) {
      return;
    }

    // Select değerini anında güncelle (UI için)
    setFaturaDurumlari(prev => ({ ...prev, [faturaId]: yeniDurum }));

    // Onay dialogunu aç
    setSelectedFatura(fatura);
    setPendingDurum({ faturaId, eskiDurum, yeniDurum });
    setOpenDurumOnay(true);
  };

  const handleDurumChangeConfirm = async () => {
    if (!pendingDurum) {
      return;
    }

    try {
      await axios.put(`/invoices/${pendingDurum.faturaId}/status`, { status: pendingDurum.yeniDurum });

      let mesaj = 'Fatura durumu güncellendi';
      if (pendingDurum.yeniDurum === 'APPROVED') {
        mesaj = 'Fatura onaylandı. Stoklar eklendi ve cari bakiye güncellendi.';
      } else if (pendingDurum.yeniDurum === 'CANCELLED') {
        mesaj = 'Fatura iptal edildi. Cari bakiye düzeltildi. (İptal faturalar stok hesaplamasında dikkate alınmaz)';
      } else if (pendingDurum.yeniDurum === 'OPEN') {
        mesaj = 'Fatura beklemeye alındı. Stok ve cari işlemleri geri alındı.';
      }

      showSnackbar(mesaj, 'success');
      setOpenDurumOnay(false);
      setPendingDurum(null);
      fetchFaturalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Durum değiştirme başarısız', 'error');
      setOpenDurumOnay(false);
      setPendingDurum(null);
      fetchFaturalar(); // Hata durumunda da listeyi yenile (eski duruma dön)
    }
  };

  const handleDurumChangeCancel = () => {
    if (pendingDurum) {
      // Select değerini eski duruma geri döndür
      setFaturaDurumlari(prev => ({ ...prev, [pendingDurum.faturaId]: pendingDurum.eskiDurum }));
    }
    setOpenDurumOnay(false);
    setPendingDurum(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // DataGrid'de sadece bu sayfada listelenen satırlara göre toplam tutar
  const pageGrandTotal = useMemo(
    () => faturalar.reduce((sum, f) => sum + (f.grandTotal || 0), 0),
    [faturalar]
  );

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'CLOSED':
        return 'success'; // Yeşil - Tamamen ödendi
      case 'APPROVED':
        return 'info'; // Mavi - Onaylandı
      case 'OPEN':
        return 'warning'; // Turuncu - Beklemede
      case 'PARTIALLY_PAID':
        return 'primary'; // Mavi - Kısmen ödendi
      case 'CANCELLED':
        return 'error'; // Kırmızı - İptal
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return 'Ödendi';
      case 'APPROVED':
        return 'Onaylandı';
      case 'OPEN':
        return 'Beklemede';
      case 'PARTIALLY_PAID':
        return 'Kısmen Ödendi';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handleEdit = (row: Fatura) => {
    const tabId = `invoice-purchase-edit-${row.id}`;
    addTab({ id: tabId, label: `Düzenle: ${row.invoiceNo}`, path: `/invoice/purchase/duzenle/${row.id}` });
    setActiveTab(tabId);
    router.push(`/invoice/purchase/duzenle/${row.id}`);
  };

  const handleView = (row: Fatura) => {
    openViewDialog(row);
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'invoiceNo',
      headerName: 'Fatura No',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '',
      renderCell: (params) => (
        <Box sx={{ alignSelf: 'flex-end' }}>{params.value ? new Date(params.value).toLocaleDateString('tr-TR') : ''}</Box>
      ),
    },
    {
      field: 'accountCode',
      headerName: 'Cari Kod',
      width: 130,
      valueGetter: (value, row) => row.account?.accountCode || '',
    },
    {
      field: 'account',
      headerName: 'Cari Ünvan',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (account: any) => account?.title || '',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Vade',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
      renderCell: (params) => (
        <Box sx={{ alignSelf: 'flex-end' }}>{params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '-'}</Box>
      ),
    },
    {
      field: 'grandTotal',
      headerName: 'Tutar',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0),
      renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, width: '100%' }}>
          <ArrowUpward sx={{ color: 'var(--destructive)', fontSize: 16 }} />
          <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', color: 'var(--destructive)' }}>
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value ?? 0)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 160,
      getActions: (params) => [
        <Tooltip key="edit" title="Düzenle">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="print" title="Yazdır">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(`/invoice/purchase/print/${params.row.id}`, '_blank'); }}>
            <Print fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="view" title="Detay">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleView(params.row); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip key="more" title="Diğer İşlemler">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e as any, params.row.id); }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>,
      ],
    },
  ], [handleEdit, handleView, handleMenuOpen]);

  const renderFormDialog = () => {
    const totals = calculateTotal();


    return (
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          {openAdd ? 'Yeni Satın Alma Faturası' : 'Satın Alma Faturası Düzenle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Fatura No"
                value={formData.invoiceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                type="date"
                label="Tarih"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                type="date"
                label="Vade"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <FormControl fullWidth required>
                <InputLabel>Cari</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                  label="Cari"
                >
                  {cariler.map((cari) => (
                    <MenuItem key={cari.id} value={cari.id}>
                      {cari.accountCode} - {cari.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Kalemler */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Fatura Kalemleri</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddKalem}
                  sx={{
                    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                  }}
                >
                  Kalem Ekle
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="30%">Stok</TableCell>
                      <TableCell width="10%">Miktar</TableCell>
                      <TableCell width="12%">Birim Fiyat</TableCell>
                      <TableCell width="10%">İsk (%)</TableCell>
                      <TableCell width="12%">İsk (₺)</TableCell>
                      <TableCell width="10%">KDV %</TableCell>
                      <TableCell width="11%" align="right">Satır Toplamı</TableCell>
                      <TableCell width="5%">İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Kalem eklenmedi
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.items.map((kalem, index) => {
                        const rawTutar = (kalem.quantity || 0) * (kalem.unitPrice || 0);
                        const lineIskonto = kalem.discountAmount || (rawTutar * (kalem.discountRate || 0)) / 100;
                        const lineNet = rawTutar - lineIskonto;
                        const lineKdv = (lineNet * (kalem.vatRate || 0)) / 100;
                        const lineTotal = lineNet + lineKdv;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={kalem.productId}
                                  onChange={(e) => handleKalemChange(index, 'productId', e.target.value)}
                                >
                                  {stoklar.map((stok) => (
                                    <MenuItem key={stok.id} value={stok.id}>
                                      {stok.stokKodu} - {stok.stokAdi}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.quantity}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'quantity', isNaN(value) ? 1 : value);
                                }}
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.unitPrice}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'unitPrice', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.discountRate}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'discountRate', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.discountAmount}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  handleKalemChange(index, 'discountAmount', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={kalem.vatRate}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  handleKalemChange(index, 'vatRate', isNaN(value) ? 0 : value);
                                }}
                                inputProps={{ min: 0, max: 100 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(lineTotal)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveKalem(index)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                type="number"
                label="İskonto"
                value={formData.iskonto}
                onChange={(e) => setFormData(prev => ({ ...prev, iskonto: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                sx={{ flex: 1 }}
                multiline
                rows={1}
                label="Açıklama"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Box>

            {/* Toplam */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--muted)' }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Ara Toplam:</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(totals.totalAmount)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatCurrency(totals.vatAmount)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Genel Toplam:</Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: 'var(--secondary)',
                    }}
                  >
                    {formatCurrency(totals.grandTotal)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
            }}
          >
            {openAdd ? 'Oluştur' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <StandardPage maxWidth={false}>
      {/* Header & Aksiyon Butonları */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'color-mix(in srgb, var(--ring) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt sx={{ color: 'var(--ring)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            Satın Alma Faturaları
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Assessment />}
            onClick={() => router.push('/raporlama/satin-alma')}
            sx={{ fontWeight: 600, fontSize: '0.8rem', px: 1.5, py: 0.75, minWidth: 0, boxShadow: 'none' }}
          >
            Raporlar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              addTab({
                id: 'invoice-purchase-yeni',
                label: 'Yeni Satın Alma Faturası',
                path: '/invoice/purchase/yeni'
              });
              setActiveTab('invoice-purchase-yeni');
              router.push('/invoice/purchase/yeni');
            }}
            sx={{
              bgcolor: 'var(--ring)',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1.5,
              py: 0.75,
              minWidth: 0,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'color-mix(in srgb, var(--ring) 85%, var(--background))', boxShadow: 'none' },
            }}
          >
            Yeni Fatura
          </Button>
        </Stack>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} color="primary" />}

      {/* KPI Kartları */}
      <KPIHeader loading={loading} data={stats} type="ALIS" />

      {/* Entegre Toolbar ve DataGrid */}
      <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'var(--card)' }}>
          <TextField
            size="small"
            placeholder="Fatura Ara (No, Cari vb.)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
          />
          {/* Hızlı Tarih Çipleri */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {['TÜMÜ', 'BUGÜN', 'BU HAFTA', 'BU AY', 'BU YIL'].map((label) => {
              const today = new Date();
              const toISODate = (d: Date) => d.toISOString().split('T')[0];
              const getQuickRange = (quickLabel: string) => {
                if (quickLabel === 'TÜMÜ') return { start: '', end: '' };
                if (quickLabel === 'BUGÜN') return { start: toISODate(today), end: toISODate(today) };
                if (quickLabel === 'BU HAFTA') {
                  const day = today.getDay(); // 0: Pazar ... 6: Cumartesi
                  const diffToMonday = (day === 0 ? -6 : 1 - day);
                  const monday = new Date(today);
                  monday.setDate(today.getDate() + diffToMonday);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  return { start: toISODate(monday), end: toISODate(sunday) };
                }
                if (quickLabel === 'BU AY') {
                  return { start: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), end: toISODate(today) };
                }
                if (quickLabel === 'BU YIL') {
                  return { start: toISODate(new Date(today.getFullYear(), 0, 1)), end: toISODate(today) };
                }
                return { start: '', end: '' };
              };
              const range = getQuickRange(label);
              const isSelected = label === 'TÜMÜ'
                ? !filterStartDate && !filterEndDate
                : filterStartDate === range.start && filterEndDate === range.end;
              return (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => {
                    if (label === 'TÜMÜ') {
                      setFilterStartDate('');
                      setFilterEndDate('');
                      return;
                    }
                    setFilterStartDate(range.start);
                    setFilterEndDate(range.end);
                  }}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  sx={{ borderRadius: 2, cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
              )
            })}
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Filtreler">
              <IconButton size="small" onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excel İndir">
              <IconButton size="small" onClick={handleExportExcel}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yenile">
              <IconButton size="small" onClick={fetchFaturalar}>
                <RefreshOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'var(--muted)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <TextField
                  fullWidth type="date" size="small" label="Başlangıç Tarihi"
                  value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <TextField
                  fullWidth type="date" size="small" label="Bitiş Tarihi"
                  value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    multiple
                    value={filterDurum}
                    onChange={(e: any) => setFilterDurum(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    label="Durum"
                    renderValue={(selected) => (selected as string[]).map(s => getStatusLabel(s)).join(', ')}
                  >
                    <MenuItem value="OPEN">Beklemede</MenuItem>
                    <MenuItem value="APPROVED">Onaylandı</MenuItem>
                    <MenuItem value="PARTIALLY_PAID">Kısmen Ödendi</MenuItem>
                    <MenuItem value="CLOSED">Ödendi</MenuItem>
                    <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Autocomplete
                  size="small"
                  options={cariler}
                  getOptionLabel={(option: Cari) => `${option.accountCode} - ${option.title}`}
                  value={cariler.find(c => c.id === filterCariId) || null}
                  onChange={(_: any, newValue: Cari | null) => setFilterCariId(newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Cari" />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Autocomplete
                  size="small"
                  options={satisElemanlari}
                  getOptionLabel={(option: any) => option.fullName || option.username || ''}
                  value={satisElemanlari.find(s => s.id === filterSatisElemaniId) || null}
                  onChange={(_: any, newValue: any) => setFilterSatisElemaniId(newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Satın Alma Sorumlusu" />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 3 }} >
                <Button variant="outlined" color="secondary" fullWidth onClick={handleClearFilters} sx={{ height: '40px' }}>
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Tablo Satır Özeti */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Toplam <b>{rowCount}</b> fatura listeleniyor
          </Typography>
        </Box>

        {/* DataGrid */}
        <Box sx={{ width: '100%' }}>
          <InvoiceDataGrid
            rows={faturalar}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onFilterModelChange={setFilterModel}
            checkboxSelection={false}
            height={900}
          />
        </Box>

        {/* Tablo footer sum - sadece mevcut sayfadaki satırlara göre */}
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
          <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--secondary)' }}>
            {formatCurrency(pageGrandTotal)}
          </Typography>
        </Box>
      </StandardCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 220, mt: 1 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {(() => {
          const fatura = faturalar.find(f => f.id === menuFaturaId);
          if (!fatura) return null;

          return [
            <MenuItem key="detail" onClick={() => { handleMenuClose(); fatura && handleView(fatura); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Detayları Görüntüle</Typography>
            </MenuItem>,
            <MenuItem key="edit" onClick={() => { handleMenuClose(); fatura && handleEdit(fatura); }}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Düzenle</Typography>
            </MenuItem>,
            <MenuItem key="print" onClick={() => { handleMenuClose(); fatura && window.open(`/invoice/purchase/print/${fatura.id}`, '_blank'); }}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <Typography variant="body2">Yazdır</Typography>
            </MenuItem>,
            <Divider key="d1" />,
            <MenuItem
              key="return"
              onClick={() => {
                if (!fatura) return;
                const path = `/fatura/iade/alis/yeni?originalId=${fatura.id}`;
                addTab({ id: 'fatura-iade-alis-yeni', label: 'Yeni Satın Alma İade Faturası', path });
                setActiveTab('fatura-iade-alis-yeni');
                router.push(path);
                handleMenuClose();
              }}
            >
              <ListItemIcon><Undo fontSize="small" /></ListItemIcon>
              <Typography variant="body2">İade Oluştur</Typography>
            </MenuItem>,
            <MenuItem
              key="cancel"
              onClick={() => { handleMenuClose(); fatura && openIptalDialog(fatura); }}
              disabled={fatura.status !== 'APPROVED'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">İptal Et</Typography>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => { handleMenuClose(); fatura && openDeleteDialog(fatura); }}
              disabled={fatura.status === 'APPROVED' || fatura.status === 'CANCELLED'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <Typography variant="body2">Sil</Typography>
            </MenuItem>,
          ];
        })()}
      </Menu>

      {/* Form Dialog */}
      {renderFormDialog()}

      {/* View Dialog */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>
          Fatura Detayı
        </DialogTitle>
        <DialogContent>
          {selectedFatura && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Fatura No:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedFatura.invoiceNo}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(selectedFatura.date)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Cari:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFatura.account.title}
                </Typography>
              </Box>

              {selectedFatura.items && selectedFatura.items.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Kalemler:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Malzeme Kodu</TableCell>
                          <TableCell>Stok</TableCell>
                          <TableCell>Miktar</TableCell>
                          <TableCell>Birim Fiyat</TableCell>
                          <TableCell>İndirim (%)</TableCell>
                          <TableCell>İndirim (₺)</TableCell>
                          <TableCell>KDV %</TableCell>
                          <TableCell align="right">Tutar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFatura.items.map((kalem, index) => {
                          const araToplam = kalem.quantity * kalem.unitPrice;
                          const iskontoTutar = kalem.discountAmount || (araToplam * (kalem.discountRate || 0)) / 100;
                          const netTutar = araToplam - iskontoTutar;
                          const kdvTutar = (netTutar * kalem.vatRate) / 100;
                          const satirToplami = netTutar + kdvTutar;

                          return (
                            <TableRow key={index} hover>
                              <TableCell>{kalem.product?.stokKodu || '-'}</TableCell>
                              <TableCell>{kalem.product?.stokAdi || '-'}</TableCell>
                              <TableCell>{kalem.quantity}</TableCell>
                              <TableCell>{formatCurrency(kalem.unitPrice)}</TableCell>
                              <TableCell>%{kalem.discountRate || 0}</TableCell>
                              <TableCell>{formatCurrency(kalem.discountAmount || 0)}</TableCell>
                              <TableCell>%{kalem.vatRate}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(satirToplami)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--card)', borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(Number(selectedFatura.totalAmount || 0) + Number(selectedFatura.iskonto || 0))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">İskonto:</Typography>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      -{formatCurrency(selectedFatura.iskonto || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="body2" color="text.secondary">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(selectedFatura.vatAmount || 0)}
                    </Typography>
                  </Box>
                  <Divider sx={{ width: '250px', my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
                    <Typography variant="h6" fontWeight="bold">Genel Toplam:</Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--secondary)' }}>
                      {formatCurrency(selectedFatura.grandTotal)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Audit Bilgileri */}
              <Accordion variant="outlined" sx={{ bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)', mt: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary
                  expandIcon={<ExpandMore color="primary" />}
                  sx={{
                    minHeight: '48px',
                    '& .MuiAccordionSummary-content': { my: 1 }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary)' }}>
                    📋 Denetim Bilgileri
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Oluşturan:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.createdByUser?.fullName || 'Sistem'}
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedFatura.createdByUser?.username || '-'})
                          </Typography>
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Oluşturma Tarihi:
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {selectedFatura.createdAt
                            ? new Date(selectedFatura.createdAt).toLocaleString('tr-TR')
                            : '-'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedFatura.updatedByUser && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleyen:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedFatura.updatedByUser.fullName}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              ({selectedFatura.updatedByUser.username})
                            </Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Son Güncelleme:
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {selectedFatura.updatedAt
                              ? new Date(selectedFatura.updatedAt).toLocaleString('tr-TR')
                              : '-'}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {selectedFatura.logs && selectedFatura.logs.length > 0 && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid var(--border)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Son İşlemler:
                        </Typography>
                        {selectedFatura.logs.slice(0, 3).map((log: any, index: number) => (
                          <Typography key={index} variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                            • {new Date(log.createdAt).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {log.actionType}
                            {log.user && ` (${log.user.fullName})`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>Fatura Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedFatura?.invoiceNo}</strong> nolu faturayı silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Durum Değişikliği Onay Dialog */}
      <Dialog open={openDurumOnay} onClose={handleDurumChangeCancel} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
        }}>
          Durum Değişikliği Onayı
          <IconButton size="small" onClick={handleDurumChangeCancel} sx={{ color: 'var(--primary-foreground)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {pendingDurum && selectedFatura && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bu işlem stok ve cari hareketlerini etkileyecektir!
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedFatura.invoiceNo}</strong> nolu iade faturası durumunu değiştirmek istiyorsunuz.
              </Typography>
              <Box sx={{
                p: 2,
                bgcolor: 'var(--muted)',
                borderRadius: 1,
                mb: 2,
                border: '1px solid var(--border)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Mevcut Durum:</Typography>
                    <Chip
                      label={getStatusLabel(pendingDurum.eskiDurum)}
                      color={getStatusColor(pendingDurum.eskiDurum)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="h6" color="text.secondary">→</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Yeni Durum:</Typography>
                    <Chip
                      label={getStatusLabel(pendingDurum.yeniDurum)}
                      color={getStatusColor(pendingDurum.yeniDurum)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>
              {pendingDurum.yeniDurum === 'APPROVED' && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fatura onaylandığında stoklar güncellenecek ve cari bakiyeye yansıtılacaktır. Devam etmek istiyor musunuz?
                </Typography>
              )}
              {pendingDurum.yeniDurum === 'CANCELLED' && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fatura iptal edildiğinde stok hareketleri geri alınacak ve cari bakiye düzeltilecektir. Devam etmek istiyor musunuz?
                </Typography>
              )}
              {pendingDurum.yeniDurum === 'OPEN' && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fatura beklemeye alındığında stok ve cari işlemleri geri çekilecektir. Devam etmek istiyor musunuz?
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDurumChangeCancel}>İptal</Button>
          <Button
            onClick={handleDurumChangeConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              }
            }}
          >
            Onayla ve Değiştir
          </Button>
        </DialogActions>
      </Dialog>

      {/* İptal Dialog */}
      <Dialog open={openIptal} onClose={() => { setOpenIptal(false); setIrsaliyeIptal(false); }} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{
          background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
        }}>
          Fatura İptal
          <IconButton size="small" onClick={() => { setOpenIptal(false); setIrsaliyeIptal(false); }} sx={{ color: 'var(--primary-foreground)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedFatura && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bu işlem geri alınamaz! Stoklar ve cari hareketleri etkilenecektir.
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedFatura.invoiceNo}</strong> nolu iade faturasını iptal etmek istediğinizden emin misiniz?
              </Typography>
              {(selectedFatura.purchaseDeliveryNote) && (
                <Box sx={{
                  p: 2,
                  bgcolor: 'var(--muted)',
                  borderRadius: 1,
                  mb: 2,
                  border: '1px solid var(--border)'
                }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Bu faturaya bağlı bir irsaliye bulunmaktadır:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    İrsaliye No: <strong>{selectedFatura.purchaseDeliveryNote?.deliveryNoteNo}</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="irsaliyeIptal"
                      checked={irsaliyeIptal}
                      onChange={(e) => setIrsaliyeIptal(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <Typography
                      variant="body2"
                      component="label"
                      htmlFor="irsaliyeIptal"
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      Bağlı olduğu irsaliye de iptal edilsin mi?
                    </Typography>
                  </Box>
                  {irsaliyeIptal && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        İrsaliye iptal edildiğinde, irsaliye durumu güncellenir. (Stok sadece onaylı faturalardan hesaplanır)
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenIptal(false); setIrsaliyeIptal(false); }}>Vazgeç</Button>
          <Button
            onClick={handleIptal}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--destructive) 0%, var(--destructive) 100%)',
              }
            }}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

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
    </StandardPage>
  );
}
