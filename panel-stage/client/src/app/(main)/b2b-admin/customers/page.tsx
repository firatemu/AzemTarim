'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  alpha,
  useTheme,
  InputAdornment,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccountCircle as UserIcon,
  ChevronRight as ArrowIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { RiskBadge, StatusChip } from '@/components/b2b-admin';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  erpAccountId: string;
  erpNum?: string;
  customerClassName?: string;
  salespersonName?: string;
  vatDays: number;
  isActive: boolean;
  lastLoginAt?: string;
  riskStatus: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  totalOrders: number;
  balance: number;
};

export default function B2bAdminCustomersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Import customers from ERP
  const importErpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/customers/import-erp');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
      enqueueSnackbar(data?.message || 'Cari hesaplar başarıyla aktarıldı', { variant: 'success' });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || 'Aktarım hatası', { variant: 'error' });
    },
  });

  // Sync existing customers from ERP
  const syncFromErpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/customers/sync-existing-from-erp');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
      enqueueSnackbar(data?.message || 'Müşteri bilgileri güncellendi', { variant: 'success' });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || 'Güncelleme hatası', { variant: 'error' });
    },
  });

  // Fetch customers
  const { data: customersResponse, isLoading, refetch } = useQuery({
    queryKey: ['b2b-customers', { search, classFilter, riskFilter, activeFilter }],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (classFilter !== 'all') params.customerClassId = classFilter;
      if (riskFilter !== 'all') params.riskStatus = riskFilter;
      if (activeFilter !== 'all') params.isActive = activeFilter === 'active';

      const res = await axios.get<{ data: CustomerRow[] }>('/b2b-admin/customers', { params });
      return res.data.data || [];
    },
  });

  const customers = Array.isArray(customersResponse) ? customersResponse : [];

  // Fetch customer classes
  const { data: customerClassesResponse = [] } = useQuery({
    queryKey: ['b2b-customer-classes'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/customer-classes');
      return res.data.data || [];
    },
  });
  const customerClasses = Array.isArray(customerClassesResponse) ? customerClassesResponse : [];

  const handleClearFilters = () => {
    setSearch('');
    setClassFilter('all');
    setRiskFilter('all');
    setActiveFilter('all');
  };

  const columns: GridColDef<CustomerRow>[] = [
    {
      field: 'erpAccountId',
      headerName: 'Cari Kod / No',
      width: 160,
      renderCell: (params) => (
        <Stack spacing={0.5} sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
            {params.row.erpNum || params.row.erpAccountId}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'name',
      headerName: 'Cari Ünvan',
      flex: 1,
      minWidth: 280,
      renderCell: (params) => (
        <Stack spacing={0.25} sx={{ py: 1.5 }}>
          <Link href={`/b2b-admin/customers/${params.row.id}`} style={{ textDecoration: 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
              {params.row.name}
            </Typography>
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserIcon sx={{ fontSize: 12 }} /> {params.row.email || 'E-posta yok'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'salespersonName',
      headerName: 'Atanan Plasiyer',
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Tanımsız'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 1.5, borderColor: params.value ? 'divider' : alpha(theme.palette.warning.main, 0.3) }}
        />
      )
    },
    {
      field: 'vatDays',
      headerName: 'Vade',
      width: 100,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
          {params.value} <Box component="span" sx={{ fontSize: 10, fontWeight: 700 }}>GÜN</Box>
        </Typography>
      )
    },
    {
      field: 'balance',
      headerName: 'Güncel Bakiye',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: params.value > 0 ? 'error.main' : 'success.main', fontFamily: 'monospace' }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value || 0)}
        </Typography>
      )
    },
    {
      field: 'riskStatus',
      headerName: 'Risk Durumu',
      width: 120,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => <RiskBadge status={params.row.riskStatus} />,
    },
    {
      field: 'isActive',
      headerName: 'Erişim',
      width: 100,
      align: 'right',
      renderCell: (params) => (
        <StatusChip status={params.row.isActive ? 'ACTIVE' : 'PASSIVE'} label={params.row.isActive ? 'Açık' : 'Kapalı'} />
      ),
    },
  ];

  const stats = [
    { label: 'TOPLAM MÜŞTERİ', value: customers.length, icon: <PeopleIcon />, color: 'primary' },
    { label: 'AKTİF PORTAL', value: customers.filter(c => c.isActive).length, icon: <CheckIcon />, color: 'success' },
    { label: 'RİSKLİ / LİMİT AŞIMI', value: customers.filter(c => c.riskStatus !== 'OK' && c.riskStatus !== 'BLOCKED').length, icon: <WarningIcon />, color: 'warning' },
    { label: 'ENGELLİ HESAPLAR', value: customers.filter(c => c.riskStatus === 'BLOCKED').length, icon: <BlockIcon />, color: 'error' },
  ];

  return (
    <StandardPage
      title="B2B Müşteri Yönetimi"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Müşteriler' }]}
      headerActions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudDownloadIcon />}
            onClick={() => importErpMutation.mutate()}
            disabled={importErpMutation.isPending}
            sx={{ fontWeight: 800, borderRadius: 3, px: 2 }}
          >
            ERP'den Carileri Çek
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={syncFromErpMutation.isPending ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <CloudDownloadIcon />}
            onClick={() => syncFromErpMutation.mutate()}
            disabled={syncFromErpMutation.isPending}
            sx={{ fontWeight: 800, borderRadius: 3, px: 2 }}
          >
            Mevcutları Güncelle
          </Button>
          <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main', borderRadius: 2 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            component={Link}
            href="/b2b-admin/customers/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            Yeni B2B Kullanıcısı
          </Button>
        </Stack>
      }
    >
      {/* Stats row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {stats.map((stat, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: alpha(theme.palette[stat.color as any].main, 0.02), display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: alpha(theme.palette[stat.color as any].main, 0.1), color: `${stat.color}.main`, display: 'flex' }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Filter Paper */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
        <TextField
          placeholder="İsim, e-posta veya kod ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
            sx: { borderRadius: 2.5, bgcolor: 'background.paper', fontWeight: 600 }
          }}
          sx={{ minWidth: 320 }}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Müşteri Sınıfı</InputLabel>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} label="Müşteri Sınıfı" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
            <MenuItem value="all">Tüm Sınıflar</MenuItem>
            {customerClasses.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Risk / Limit</InputLabel>
          <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} label="Risk / Limit" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
            <MenuItem value="all">Tüm Riskler</MenuItem>
            <MenuItem value="OK">Risk Yok (Normal)</MenuItem>
            <MenuItem value="OVER_LIMIT">Limit Aşıldı</MenuItem>
            <MenuItem value="OVERDUE">Vadesi Geçmiş</MenuItem>
            <MenuItem value="BLOCKED">Engellenmiş</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Erişim</InputLabel>
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} label="Erişim" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="active">Sadece Aktif</MenuItem>
            <MenuItem value="inactive">Sadece Pasif</MenuItem>
          </Select>
        </FormControl>

        {(search || classFilter !== 'all' || riskFilter !== 'all' || activeFilter !== 'all') && (
          <Button onClick={handleClearFilters} size="small" sx={{ fontWeight: 800, textTransform: 'none', color: 'text.secondary' }}>Filtreleri Temizle</Button>
        )}
      </Paper>

      {/* Grid */}
      <Box sx={{
        height: 650,
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        '& .MuiDataGrid-root': { border: 'none' },
        '& .MuiDataGrid-columnHeaders': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' },
        '& .MuiDataGrid-cell': { borderColor: 'divider' },
        '& .blocked-row': { bgcolor: alpha(theme.palette.error.main, 0.03), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) } }
      }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          getRowClassName={(params) => params.row.riskStatus === 'BLOCKED' ? 'blocked-row' : ''}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }
          }}
        />
      </Box>
    </StandardPage>
  );
}
