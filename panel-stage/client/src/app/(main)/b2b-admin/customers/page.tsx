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
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { RiskBadge, StatusChip } from '@/components/b2b-admin';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { B2BOrderStatus } from '@/types/b2b';
import { toast } from 'react-hot-toast';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  erpAccountId: string;
  customerClassName?: string;
  vatDays: number;
  isActive: boolean;
  lastLoginAt?: string;
  riskStatus: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  totalOrders: number;
  balance: number;
};

export default function B2bAdminCustomersPage() {
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
      toast.success(data?.message || 'Cari hesaplar başarıyla aktarıldı');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Hesapları aktarırken hata oluştu');
    },
  });

  // Fetch customers
  const { data: customers = [], isLoading, refetch } = useQuery({
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

  // Fetch customer classes for filter
  const { data: customerClasses = [] } = useQuery({
    queryKey: ['b2b-customer-classes'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/customer-classes');
      return res.data.data || [];
    },
  });

  const handleClearFilters = () => {
    setSearch('');
    setClassFilter('all');
    setRiskFilter('all');
    setActiveFilter('all');
  };

  const columns: GridColDef<CustomerRow>[] = [
    {
      field: 'erpNum',
      headerName: 'ERP No',
      width: 100,
    },
    {
      field: 'erpAccountId',
      headerName: 'Cari Kod',
      width: 150,
    },
    {
      field: 'name',
      headerName: 'Cari Ünvan',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Link
          href={`/b2b-admin/customers/${params.row.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {params.row.name}
          </Typography>
        </Link>
      ),
    },
    {
      field: 'salespersonName',
      headerName: 'Plasiyer',
      width: 150,
    },
    {
      field: 'vatDays',
      headerName: 'Vade',
      width: 100,
      align: 'right',
      valueFormatter: (value: any) => `${value} gün`,
    },
    {
      field: 'balance',
      headerName: 'Bakiye',
      width: 130,
      align: 'right',
      valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺`,
    },
    {
      field: 'riskStatus',
      headerName: 'Risk',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <RiskBadge status={params.row.riskStatus} showLabel={false} />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Aktif',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Evet' : 'Hayır'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
        />
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Müşterileri"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Müşteriler' },
      ]}
      headerActions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => importErpMutation.mutate()}
            disabled={importErpMutation.isPending || isLoading}
          >
            {importErpMutation.isPending ? 'Aktarılıyor...' : 'Cari Hesapları Aktar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Yenile
          </Button>
          <Button component={Link} href="/b2b-admin/customers/new" variant="contained" startIcon={<AddIcon />}>
            Müşteri Ekle
          </Button>
        </Box>
      }
    >
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="b2b-customer-search"
          placeholder="Müşteri, e-posta veya ERP hesabı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="b2b-customer-class-label">Müşteri Sınıfı</InputLabel>
          <Select
            labelId="b2b-customer-class-label"
            id="b2b-customer-class-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            label="Müşteri Sınıfı"
          >
            <MenuItem value="all">Tümü</MenuItem>
            {customerClasses.map((c: any) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="b2b-risk-status-label">Risk Durumu</InputLabel>
          <Select
            labelId="b2b-risk-status-label"
            id="b2b-risk-status-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            label="Risk Durumu"
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="OK">Risk Yok</MenuItem>
            <MenuItem value="OVER_LIMIT">Limit Aşımı</MenuItem>
            <MenuItem value="OVERDUE">Vadesi Geçmiş</MenuItem>
            <MenuItem value="BLOCKED">Engelli</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="b2b-customer-status-label">Durum</InputLabel>
          <Select
            labelId="b2b-customer-status-label"
            id="b2b-customer-status-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            label="Durum"
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Pasif</MenuItem>
          </Select>
        </FormControl>

        {(search || classFilter !== 'all' || riskFilter !== 'all' || activeFilter !== 'all') && (
          <Button size="small" onClick={handleClearFilters}>
            Filtreleri Temizle
          </Button>
        )}
      </Box>

      <DataGrid
        rows={customers}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        disableRowSelectionOnClick
        autoHeight
        loading={isLoading}
        getRowClassName={(params) =>
          params.row.riskStatus === 'BLOCKED' ? 'blocked-row' : ''
        }
        sx={{
          '& .blocked-row': {
            backgroundColor: 'error.light',
            '&:hover': {
              backgroundColor: 'error.main',
              opacity: 0.8,
            },
          },
        }}
      />
    </StandardPage>
  );
}
