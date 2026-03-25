'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  Tooltip,
  Collapse,
  InputAdornment,
  Grid,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  Close,
  AccountBalance,
  MoreVert,
  Refresh,
  ToggleOn,
  ToggleOff,
  ArrowDownward,
  ArrowUpward,
  BarChart,
  Receipt,
  Person,
  Business,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Phone,
  Email,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useTabStore } from '@/stores/tabStore';
import NewCariDialog from '@/components/cari/NewCariDialog';
import { StandardPage } from '@/components/common';

export default function CariPage() {
  const router = useRouter();
  const { addTab, setActiveTab } = useTabStore();
  const [cariler, setCariler] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCari, setSelectedCari] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [showChart, setShowChart] = useState(false);
  const [selectedTipFilter, setSelectedTipFilter] = useState<'all' | 'CUSTOMER' | 'SUPPLIER' | 'BOTH'>('all');

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCariId, setMenuCariId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    cariKodu: '',
    unvan: '',
    tip: 'CUSTOMER',
    telefon: '',
    email: '',
    vergiNo: '',
    vergiDairesi: '',
    yetkili: '',
    adres: '',
    il: '',
    ilce: '',
    riskLimiti: 0,
    teminatTutar: 0,
    aktif: true,
    paraBirimi: 'TRY',
    vadeSuresi: 0,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cariId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuCariId(cariId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCariId(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    addTab({
      id: 'accounts-list',
      label: 'Cari Listesi',
      path: '/accounts',
    });
  }, []);

  const fetchCariler = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/account', {
        params: {
          search: debouncedSearch || undefined,
          page: 1,
          limit: 100,
          aktif: showInactive ? false : true,
        },
      });
      const result = response.data;
      setCariler(result.data || []);
    } catch (error) {
      console.error('Cari verisi alınamadı:', error);
      showSnackbar('Cari listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, showInactive]);

  useEffect(() => {
    fetchCariler();
  }, [fetchCariler]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEdit = async () => {
    try {
      if (!selectedCari) return;

      const dataToSend = {
        code: formData.cariKodu?.trim() || undefined,
        title: formData.unvan?.trim(),
        type: formData.tip === 'MUSTERI' ? 'CUSTOMER' : (formData.tip === 'TEDARIKCI' ? 'SUPPLIER' : 'BOTH'),
        companyType: formData.tip === 'MUSTERI' ? 'INDIVIDUAL' : 'CORPORATE',
        taxNumber: formData.vergiNo || undefined,
        taxOffice: formData.vergiDairesi || undefined,
        phone: formData.telefon || undefined,
        email: formData.email || undefined,
        city: formData.il || undefined,
        district: formData.ilce || undefined,
        address: formData.adres || undefined,
        contactName: formData.yetkili || undefined,
        isActive: formData.aktif ?? true,
        creditLimit: Number(formData.riskLimiti) || 0,
        collateralAmount: Number(formData.teminatTutar) || 0,
        dueDays: parseInt(String(formData.vadeSuresi)) || 0,
        currency: formData.paraBirimi || 'TRY',
      };

      await axios.patch(`/account/${selectedCari.id}`, dataToSend);
      showSnackbar('Cari başarıyla güncellendi', 'success');
      setOpenEdit(false);
      fetchCariler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Cari güncellenemedi', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/account/${selectedCari.id}`);
      showSnackbar('Cari başarıyla silindi', 'success');
      setOpenDelete(false);
      setSelectedCari(null);
      fetchCariler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Cari silinemedi', 'error');
    }
  };

  const openEditDialog = async (cariSummary: any) => {
    try {
      const response = await axios.get(`/account/${cariSummary.id}`);
      const cari = response.data;

      setSelectedCari(cari);

      setFormData({
        cariKodu: cari.code || cari.cariKodu || '',
        unvan: cari.title || cari.unvan || '',
        tip: cari.type || cari.tip || 'CUSTOMER',
        telefon: cari.phone || cari.telefon || '',
        email: cari.email || '',
        vergiNo: cari.taxNumber || cari.vergiNo || '',
        vergiDairesi: cari.taxOffice || cari.vergiDairesi || '',
        yetkili: cari.contactName || cari.yetkili || '',
        adres: cari.address || cari.adres || '',
        il: cari.city || cari.il || '',
        ilce: cari.district || cari.ilce || '',
        riskLimiti: cari.creditLimit || cari.riskLimiti || 0,
        teminatTutar: cari.collateralAmount || cari.teminatTutar || 0,
        aktif: cari.isActive !== undefined ? cari.isActive : (cari.aktif !== undefined ? cari.aktif : true),
        paraBirimi: cari.currency || cari.paraBirimi || 'TRY',
        vadeSuresi: cari.dueDays?.toString() || cari.vadeSuresi?.toString() || '0',
      });
      setOpenEdit(true);
    } catch (error) {
      console.error("Cari detay yüklenemedi", error);
      showSnackbar('Cari bilgileri yüklenirken hata oluştu', 'error');
    }
  };

  const openViewDialog = async (cari: any) => {
    try {
      const response = await axios.get(`/account/${cari.id}`);
      setSelectedCari(response.data);
      setOpenView(true);
    } catch (error) {
      showSnackbar('Cari detayları yüklenemedi', 'error');
    }
  };

  const openDeleteDialog = (cari: any) => {
    setSelectedCari(cari);
    setOpenDelete(true);
  };

  const filteredCariler = useMemo(() => {
    if (selectedTipFilter === 'all') return cariler;
    return cariler.filter((cari) => cari.type === selectedTipFilter);
  }, [cariler, selectedTipFilter]);

  // Metrics calculation
  const totalCari = useMemo(() => filteredCariler.length, [filteredCariler]);
  const totalBakiye = useMemo(() => {
    return filteredCariler.reduce((sum, cari) => sum + (parseFloat(cari.balance || 0)), 0);
  }, [filteredCariler]);
  const borcluCari = useMemo(() => {
    return filteredCariler.filter(c => parseFloat(c.balance || 0) > 0).length;
  }, [filteredCariler]);
  const alacakliCari = useMemo(() => {
    return filteredCariler.filter(c => parseFloat(c.balance || 0) < 0).length;
  }, [filteredCariler]);
  const bakiyeBosCari = useMemo(() => {
    return filteredCariler.filter(c => parseFloat(c.balance || 0) === 0).length;
  }, [filteredCariler]);

  // Custom Toolbar Component
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        bgcolor: 'var(--card)'
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Tip',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const type = params.value;
        const typeConfig = {
          CUSTOMER: { label: 'Müşteri', icon: Person, color: 'var(--chart-1)' },
          SUPPLIER: { label: 'Tedarikçi', icon: Business, color: 'var(--primary)' },
          BOTH: { label: 'Müşteri & Tedarikçi', icon: CreditCard, color: 'var(--chart-2)' },
        };
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.CUSTOMER;
        const Icon = config.icon;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 2,
                bgcolor: 'color-mix(in srgb, var(--card), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
              }}
            >
              <Icon sx={{ fontSize: 16, color: config.color }} />
            </Box>
            <Typography variant="caption" fontWeight={600} sx={{ color: config.color }}>
              {config.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'code',
      headerName: 'Cari Kodu',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--primary)' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Ünvan',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'contactInfo',
      headerName: 'İletişim',
      flex: 1.5,
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const phone = params.row.phone || params.row.telefon;
        const email = params.row.email;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone fontSize="inherit" sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {phone}
                </Typography>
              </Box>
            )}
            {email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="inherit" sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 150,
                  }}
                >
                  {email}
                </Typography>
              </Box>
            )}
            {!phone && !email && (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                -
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Bakiye',
      type: 'number',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const balance = parseFloat(params.value || 0);
        return (
          <Typography variant="body2" sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            fontWeight: 700
          }}>
            {balance > 0 && (
              <Box component="span" sx={{ color: 'var(--success)', fontWeight: 800, mr: 0.5 }}>
                (B)
              </Box>
            )}
            {balance < 0 && (
              <Box component="span" sx={{ color: 'var(--error)', fontWeight: 800, mr: 0.5 }}>
                (A)
              </Box>
            )}
            ₺{Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center', width: '100%' }}>
          <Tooltip title="Ekstre">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/accounts/${params.row.id}`);
              }}
              sx={{
                borderRadius: 1.5,
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)' },
              }}
            >
              <Receipt fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="İncele">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                openViewDialog(params.row);
              }}
              sx={{
                borderRadius: 1.5,
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)' },
              }}
            >
              <Visibility fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Düzenle">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(params.row);
              }}
              sx={{
                borderRadius: 1.5,
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--secondary) 10%, transparent)' },
              }}
            >
              <Edit fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Daha Fazla">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, params.row.id);
              }}
              sx={{
                borderRadius: 1.5,
                width: 32,
                height: 32,
                '&:hover': { bgcolor: 'color-mix(in srgb, var(--muted) 10%, transparent)' },
              }}
            >
              <MoreVert fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const headerActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AccountBalance />}
        onClick={() => router.push('/accounts/invoice-closing')}
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
            boxShadow: 'none',
          },
        }}
      >
        Analiz & Ekstre
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<Add />}
        onClick={() => {
          setOpenAdd(true);
          addTab({
            id: 'yeni-cari',
            label: 'Yeni Cari Ekle',
            path: '/accounts',
          });
          setActiveTab('yeni-cari');
        }}
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'var(--primary)',
            opacity: 0.9,
            boxShadow: 'none',
          },
        }}
      >
        Yeni Cari
      </Button>
    </Box>
  );

  return (
    <StandardPage maxWidth={false}>
      {/* 1. SAYFA HEADER - STOCK-LIKE */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Business sx={{ fontSize: 20, color: 'var(--primary-foreground)' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}
            >
              Cari Yönetimi
            </Typography>
          </Box>
        </Box>

        {headerActions}
      </Box>

      {/* 2. KPI METRICS - MODERN STRIP */}
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0,
        }}
      >
        <Box sx={{ flex: '1 1 120px', px: 1.5, borderRight: '1px solid var(--divider, var(--border))' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mb: 0.25 }}>
            Toplam Cari
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>
            {totalCari}
          </Typography>
        </Box>

        <Box sx={{ flex: '1 1 150px', px: 1.5, borderRight: '1px solid var(--divider, var(--border))' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mb: 0.25 }}>
            Toplam Bakiye
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--chart-2)' }}>
            ₺{totalBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Typography>
        </Box>

        <Box sx={{ flex: '1 1 150px', px: 1.5, borderRight: '1px solid var(--divider, var(--border))' }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mb: 0.25 }}>
            Alacaklı Cari (A)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--chart-3)' }}>
            {alacakliCari}
          </Typography>
        </Box>

        <Box sx={{ flex: '1 1 150px', px: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mb: 0.25 }}>
            Borçlu Cari (B)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--destructive)' }}>
            {borcluCari}
          </Typography>
        </Box>
      </Paper>

      {/* 3. FILTER & ACTION TOOLBAR */}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            {/* Search Box */}
            <TextField
              size="small"
              placeholder="Cari kodu, ünvan veya yetkili ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-textfield"
              sx={{
                minWidth: { xs: '100%', md: 250 },
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  bgcolor: 'var(--background)',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'var(--muted-foreground)' }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} edge="end">
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Quick Type Filters */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={selectedTipFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setSelectedTipFilter('all')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  fontSize: '0.8rem',
                  bgcolor: selectedTipFilter === 'all' ? 'var(--primary)' : 'transparent',
                  color: selectedTipFilter === 'all' ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderColor: selectedTipFilter === 'all' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                Hepsi
              </Button>
              <Button
                size="small"
                variant={selectedTipFilter === 'CUSTOMER' ? 'contained' : 'outlined'}
                onClick={() => setSelectedTipFilter('CUSTOMER')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  fontSize: '0.8rem',
                  bgcolor: selectedTipFilter === 'CUSTOMER' ? 'var(--primary)' : 'transparent',
                  color: selectedTipFilter === 'CUSTOMER' ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderColor: selectedTipFilter === 'CUSTOMER' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                Müşteri
              </Button>
              <Button
                size="small"
                variant={selectedTipFilter === 'SUPPLIER' ? 'contained' : 'outlined'}
                onClick={() => setSelectedTipFilter('SUPPLIER')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  fontSize: '0.8rem',
                  bgcolor: selectedTipFilter === 'SUPPLIER' ? 'var(--primary)' : 'transparent',
                  color: selectedTipFilter === 'SUPPLIER' ? 'var(--primary-foreground)' : 'var(--foreground)',
                  borderColor: selectedTipFilter === 'SUPPLIER' ? 'var(--primary)' : 'var(--border)',
                }}
              >
                Tedarikçi
              </Button>
            </Box>

            {/* Right Tools */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title={showInactive ? 'Aktif Carileri Göster' : 'Pasif Carileri Göster'}>
                <IconButton
                  size="small"
                  onClick={() => setShowInactive(!showInactive)}
                  sx={{
                    color: showInactive ? 'var(--destructive)' : 'var(--chart-2)',
                    bgcolor: 'color-mix(in srgb, var(--muted) 40%, transparent)',
                    borderRadius: 1.5,
                  }}
                >
                  {showInactive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Listeyi Yenile">
                <IconButton
                  size="small"
                  onClick={fetchCariler}
                  sx={{ bgcolor: 'color-mix(in srgb, var(--muted) 40%, transparent)', borderRadius: 1.5 }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'var(--border)' }} />
              <Tooltip title="Grafik Göster/Gizle">
                <IconButton
                  size="small"
                  onClick={() => setShowChart(!showChart)}
                  sx={{
                    bgcolor: showChart ? 'var(--primary)' : 'color-mix(in srgb, var(--muted) 40%, transparent)',
                    color: showChart ? 'var(--primary-foreground)' : 'inherit',
                    borderRadius: 1.5
                  }}
                >
                  <BarChart fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
        </Box>
      </Paper>

      {/* 4. CHART SECTION */}
        <Collapse in={showChart}>
          <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Cari Tipi Dağılımı
            </Typography>
            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Grafik entegrasyonu için placeholder
              </Typography>
            </Box>
          </Paper>
        </Collapse>

        {/* 5. SUMMARY INFO BAR */}
        <Box sx={{ py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCariler.length} cari gösteriliyor
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
              Toplam Cari: <span style={{ color: 'var(--primary)' }}>{totalCari.toLocaleString('tr-TR')}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
              Bakiye: <span style={{ color: 'var(--chart-2)' }}>₺{totalBakiye.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </Typography>
          </Box>
        </Box>

        {/* 6. DATAGRID */}
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
          }}
        >
          <Box sx={{ height: 'auto', minHeight: 600, width: '100%' }}>
            <DataGrid
              rows={filteredCariler}
              columns={columns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              pageSizeOptions={[25, 50, 100]}
              disableRowSelectionOnClick
              loading={loading}
              localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
              slots={{
                toolbar: CustomToolbar,
                loadingOverlay: () => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>Yükleniyor...</Typography>
                  </Box>
                ),
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.05,
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'color-mix(in srgb, var(--primary) 4%, transparent)',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid var(--border)',
                  bgcolor: 'var(--muted)',
                },
              }}
            />
          </Box>
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: '0 4px 20px color-mix(in srgb, var(--foreground) 10%, transparent)',
              borderRadius: 2,
              minWidth: 200,
              border: '1px solid var(--border)',
            },
          }}
        >
          {(() => {
            const cari = cariler.find((c: any) => c.id === menuCariId);
            if (!cari) return null;

            return [
              <MenuItem
                key="delete"
                onClick={() => {
                  openDeleteDialog(cari);
                  handleMenuClose();
                }}
                disabled={!!(cari?.hareketSayisi && cari.hareketSayisi > 0)}
                sx={{
                  gap: 1.5,
                  py: 1,
                  px: 1.5,
                  borderRadius: 1.5,
                  mx: 0.5,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: 'color-mix(in srgb, var(--error) 10%, transparent)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                <Delete fontSize="small" sx={{ color: 'var(--error)' }} />
                <Typography variant="body2" sx={{ color: 'var(--foreground)', fontWeight: 500 }}>
                  Sil
                </Typography>
              </MenuItem>,
            ];
          })()}
        </Menu>

        {/* Cari Düzenle Dialog */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle component="div" sx={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'var(--primary-foreground)',
            py: 2.5,
            px: 2.5,
            borderBottom: '1px solid var(--border)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                  ✏️ Cari Düzenle
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontWeight: 500 }}>
                  Cari bilgilerini güncelleyin
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setOpenEdit(false)} sx={{ color: 'var(--primary-foreground)' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, bgcolor: 'var(--background)', px: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Cari Kodu"
                    value={formData.cariKodu}
                    onChange={(e) => handleFormChange('cariKodu', e.target.value)}
                    size="small"
                    helperText="Otomatik veya manuel kod"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cari Tipi</InputLabel>
                    <Select
                      value={formData.tip}
                      label="Cari Tipi"
                      onChange={(e) => handleFormChange('tip', e.target.value)}
                    >
                      <MenuItem value="MUSTERI">Müşteri</MenuItem>
                      <MenuItem value="TEDARIKCI">Tedarikçi</MenuItem>
                      <MenuItem value="HER_IKISI">Her İkisi</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Ünvan"
                value={formData.unvan}
                onChange={(e) => handleFormChange('unvan', e.target.value)}
                size="small"
                required
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.telefon}
                    onChange={(e) => handleFormChange('telefon', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <Phone fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <Email fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Vergi No"
                    value={formData.vergiNo}
                    onChange={(e) => handleFormChange('vergiNo', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Vergi Dairesi"
                    value={formData.vergiDairesi}
                    onChange={(e) => handleFormChange('vergiDairesi', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Yetkili"
                value={formData.yetkili}
                onChange={(e) => handleFormChange('yetkili', e.target.value)}
                size="small"
              />

              <TextField
                fullWidth
                label="Adres"
                value={formData.adres}
                onChange={(e) => handleFormChange('adres', e.target.value)}
                size="small"
                multiline
                rows={2}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="İl"
                    value={formData.il}
                    onChange={(e) => handleFormChange('il', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="İlçe"
                    value={formData.ilce}
                    onChange={(e) => handleFormChange('ilce', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 0.5, borderColor: 'var(--border)' }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Risk Limiti"
                    type="number"
                    value={formData.riskLimiti}
                    onChange={(e) => handleFormChange('riskLimiti', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Teminat Tutarı"
                    type="number"
                    value={formData.teminatTutar}
                    onChange={(e) => handleFormChange('teminatTutar', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Aktif</InputLabel>
                    <Select
                      value={formData.aktif?.toString() || 'true'}
                      label="Aktif"
                      onChange={(e) => handleFormChange('aktif', e.target.value === 'true')}
                    >
                      <MenuItem value="true">Aktif</MenuItem>
                      <MenuItem value="false">Pasif</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Para Birimi</InputLabel>
                    <Select
                      value={formData.paraBirimi || 'TRY'}
                      label="Para Birimi"
                      onChange={(e) => handleFormChange('paraBirimi', e.target.value)}
                    >
                      <MenuItem value="TRY">₺ TRY</MenuItem>
                      <MenuItem value="USD">$ USD</MenuItem>
                      <MenuItem value="EUR">€ EUR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Vade Süresi (Gün)"
                    type="number"
                    value={formData.vadeSuresi}
                    onChange={(e) => handleFormChange('vadeSuresi', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 2, bgcolor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            <Button
              onClick={() => setOpenEdit(false)}
              sx={{
                borderRadius: 2,
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                '&:hover': {
                  bgcolor: 'var(--card)',
                },
              }}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleEdit}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)',
                bgcolor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                px: 2.5,
                '&:hover': {
                  bgcolor: 'var(--primary)',
                  opacity: 0.9,
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 40%, transparent)',
                },
              }}
            >
              💾 Güncelle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cari İncele Dialog */}
        <Dialog
          open={openView}
          onClose={() => setOpenView(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle component="div" sx={{
            background: 'linear-gradient(135deg, var(--chart-1), var(--primary))',
            color: 'var(--primary-foreground)',
            py: 2.5,
            px: 2.5,
            borderBottom: '1px solid var(--border)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                  👁️ Cari Detayları
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontWeight: 500 }}>
                  Cari bilgilerini inceleyin
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setOpenView(false)} sx={{ color: 'var(--primary-foreground)' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, bgcolor: 'var(--background)', px: 2.5 }}>
            {selectedCari && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Cari Kodu
                      </Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ color: 'var(--primary)', mt: 0.5 }}>
                        {selectedCari.code}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Cari Tipi
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedCari.type === 'CUSTOMER' ? 'Müşteri' : (selectedCari.type === 'BOTH' ? 'Müşteri & Tedarikçi' : 'Tedarikçi')}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            bgcolor: selectedCari.type === 'CUSTOMER'
                              ? 'color-mix(in srgb, var(--chart-1) 20%, transparent)'
                              : (selectedCari.type === 'BOTH' ? 'color-mix(in srgb, var(--chart-2) 20%, transparent)' : 'color-mix(in srgb, var(--primary) 20%, transparent)'),
                            borderColor: selectedCari.type === 'CUSTOMER'
                              ? 'var(--chart-1)'
                              : (selectedCari.type === 'BOTH' ? 'var(--chart-2)' : 'var(--primary)'),
                            color: selectedCari.type === 'CUSTOMER' ? 'var(--chart-1)' : (selectedCari.type === 'BOTH' ? 'var(--chart-2)' : 'var(--primary)'),
                          }}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                    Ünvan
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary', mt: 0.5 }}>
                    {selectedCari.title}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Telefon
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                        <Phone fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body1" sx={{ color: 'text.primary' }}>{selectedCari.phone || '-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Email
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                        <Email fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body1" sx={{ color: 'text.primary' }}>{selectedCari.email || '-'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Vergi No
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>{selectedCari.taxNumber || '-'}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Vergi Dairesi
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>{selectedCari.taxOffice || '-'}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                    Yetkili
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>{selectedCari.contactName || '-'}</Typography>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                    Adres
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', mt: 0.5 }}>{selectedCari.address || selectedCari.adres || '-'}</Typography>
                </Box>

                <Divider sx={{ my: 0.5, borderColor: 'var(--border)' }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'color-mix(in srgb, var(--success) 10%, transparent)', borderRadius: 2, border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Bakiye
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: parseFloat(selectedCari.balance) >= 0 ? 'var(--success)' : 'var(--error)',
                          mt: 0.5,
                        }}
                      >
                        ₺{parseFloat(selectedCari.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
                        Risk Limiti
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                        ₺{parseFloat(selectedCari.creditLimit || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 2, bgcolor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
            <Button
              onClick={() => setOpenView(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                fontWeight: 600,
                px: 2,
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                },
              }}
            >
              Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cari Sil Dialog */}
        <Dialog
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle component="div" sx={{
            bgcolor: 'var(--error)',
            color: 'var(--error-foreground)',
            fontWeight: 700,
            py: 2.5,
            px: 2.5,
            borderBottom: '1px solid var(--border)',
          }}>
            ⚠️ Cari Sil
          </DialogTitle>
          <DialogContent sx={{ mt: 2, bgcolor: 'var(--background)', px: 2.5 }}>
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                bgcolor: 'color-mix(in srgb, var(--warning) 15%, transparent)',
                border: '1px solid var(--warning)',
                borderRadius: 2,
              }}
            >
              Bu işlem geri alınamaz!
            </Alert>
            <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
              <strong>{selectedCari?.title}</strong> carisini silmek istediğinizden emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 2, bgcolor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            <Button
              onClick={() => setOpenDelete(false)}
              sx={{
                borderRadius: 2,
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                '&:hover': { bgcolor: 'var(--card)' },
              }}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--error) 30%, transparent)',
                bgcolor: 'var(--error)',
                color: 'var(--error-foreground)',
                px: 2.5,
                '&:hover': {
                  bgcolor: 'var(--error)',
                  opacity: 0.9,
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--error) 40%, transparent)',
                },
              }}
            >
              🗑️ Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <NewCariDialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={fetchCariler}
          showSnackbar={showSnackbar}
        />
    </StandardPage>
  );
}
