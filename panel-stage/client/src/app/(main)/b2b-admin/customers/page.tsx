'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  ChevronRight as ArrowIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
  GridSortModel,
} from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { StandardCard } from '@/components/common';
import {
  B2bSyncStatusChips,
  B2bSyncRecentLogsCard,
  useB2bSyncMonitor,
} from '@/components/b2b-admin';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  erpAccountId: string;
  erpNum?: string;
  customerClass?: { id: string; name: string } | null;
  salespersonName?: string;
  vatDays: number;
  isActive: boolean;
  createdAt?: string;
  riskStatus: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  balance: number;
  lastMovementAt?: string | null;
};

type CustomersListResponse = {
  data: CustomerRow[];
  total: number;
  page: number;
  limit: number;
};

const RISK_CHIP: Record<
  CustomerRow['riskStatus'],
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  OK: { label: 'Normal', color: 'success' },
  OVER_LIMIT: { label: 'Limit', color: 'warning' },
  OVERDUE: { label: 'Vade', color: 'error' },
  BLOCKED: { label: 'Engelli', color: 'error' },
};

function formatTry(n: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0);
}

function mapSortToApi(sortModel: GridSortModel): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const first = sortModel[0];
  const field = first?.field;
  const order = first?.sort === 'asc' ? 'asc' : 'desc';
  if (field === 'balance') return { sortBy: 'balance', sortOrder: order };
  if (field === 'name') return { sortBy: 'name', sortOrder: order };
  if (field === 'createdAt') return { sortBy: 'createdAt', sortOrder: order };
  return { sortBy: 'balance', sortOrder: 'desc' };
}

export default function B2bAdminCustomersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'balance', sort: 'desc' }]);

  const { sortBy, sortOrder } = useMemo(() => mapSortToApi(sortModel), [sortModel]);

  const { syncStatus, refetchSyncStatus } = useB2bSyncMonitor({
    onSyncLogFinished: (ev) => {
      if (ev.success) {
        void queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
        enqueueSnackbar('Senkronizasyon tamamlandı; liste güncellenebilir.', { variant: 'success' });
      } else {
        enqueueSnackbar('Senkronizasyon başarısız: ' + (ev.errorMessage || ''), { variant: 'error' });
      }
    },
  });

  const importErpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/customers/import-erp');
      return res.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
      void queryClient.invalidateQueries({ queryKey: ['b2b-sync-loops'] });
      void refetchSyncStatus();
      enqueueSnackbar(data?.message || 'Cari hesaplar aktarıldı', { variant: 'success' });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      enqueueSnackbar(msg || 'Aktarım hatası', { variant: 'error' });
    },
  });

  const syncFromErpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/customers/sync-existing-from-erp');
      return res.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
      void queryClient.invalidateQueries({ queryKey: ['b2b-sync-loops'] });
      void refetchSyncStatus();
      enqueueSnackbar(data?.message || 'Müşteri bilgileri güncellendi', { variant: 'success' });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      enqueueSnackbar(msg || 'Güncelleme hatası', { variant: 'error' });
    },
  });

  const syncAllMovementsMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post<{ jobId?: string }>('/b2b-admin/customers/sync-account-movements-all');
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['b2b-sync-status'] });
      void queryClient.invalidateQueries({ queryKey: ['b2b-sync-loops'] });
      enqueueSnackbar('Tüm cariler için hareket senkronu kuyruğa alındı. Birkaç dakika içinde bakiyeler güncellenir.', {
        variant: 'info',
      });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      enqueueSnackbar(msg || 'Kuyruk hatası', { variant: 'error' });
    },
  });

  const { data: listResponse, isLoading, refetch } = useQuery({
    queryKey: [
      'b2b-customers',
      {
        search: deferredSearch,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy,
        sortOrder,
      },
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sortBy,
        sortOrder,
      };
      if (deferredSearch) params.search = deferredSearch;
      const res = await axios.get<CustomersListResponse>('/b2b-admin/customers', { params });
      return res.data;
    },
  });

  const customers = listResponse?.data ?? [];
  const totalRowCount = listResponse?.total ?? 0;

  const handleClearSearch = () => {
    setSearch('');
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  const handleRefreshAll = () => {
    void refetch();
    void refetchSyncStatus();
  };

  const balanceSumPage = useMemo(() => customers.reduce((acc, c) => acc + Number(c.balance || 0), 0), [customers]);
  const debtCount = useMemo(() => customers.filter((c) => Number(c.balance || 0) > 0).length, [customers]);
  const creditCount = useMemo(() => customers.filter((c) => Number(c.balance || 0) < 0).length, [customers]);

  const columns: GridColDef<CustomerRow>[] = [
    {
      field: 'erpAccountId',
      headerName: 'Cari kodu',
      flex: 0.75,
      minWidth: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const hasErpNum = params.row.erpNum != null && String(params.row.erpNum).trim() !== '';
        const codeOnly = hasErpNum ? String(params.row.erpNum).trim() : params.row.erpAccountId;
        const tooltipExtra =
          hasErpNum && params.row.erpAccountId ? `Hesap ID: ${params.row.erpAccountId}` : undefined;
        return (
          <Tooltip title={tooltipExtra ?? codeOnly}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontFamily: 'ui-monospace, monospace',
                color: 'var(--primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {codeOnly.length > 32 ? `${codeOnly.slice(0, 30)}…` : codeOnly}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Ünvan',
      flex: 1.35,
      minWidth: 200,
      sortable: true,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const email = params.row.email?.trim();
        const isPlaceholderB2bEmail = email?.toLowerCase().endsWith('@b2b.local') ?? false;
        const tooltipTitle =
          email && !isPlaceholderB2bEmail ? `${params.row.name} · ${email}` : params.row.name;
        return (
          <Tooltip title={tooltipTitle}>
            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
              <Link href={`/b2b-admin/customers/${params.row.id}`} style={{ textDecoration: 'none', minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    color: 'var(--foreground)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    '&:hover': { color: 'var(--primary)' },
                  }}
                >
                  {params.row.name}
                </Typography>
              </Link>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'class',
      headerName: 'Sınıf',
      flex: 0.55,
      minWidth: 88,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => (
        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.row.customerClass?.name || '—'}
        </Typography>
      ),
    },
    {
      field: 'salespersonName',
      headerName: 'Plasiyer',
      flex: 0.65,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const v = params.row.salespersonName;
        return (
          <Chip
            label={v && v !== '—' ? v : '—'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, height: 22, maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'B2B kayıt',
      width: 118,
      sortable: true,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const d = params.row.createdAt;
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {d ? format(new Date(d), 'dd.MM.yyyy', { locale: tr }) : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'lastMovementAt',
      headerName: 'Son hareket',
      flex: 0.85,
      minWidth: 128,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const d = params.row.lastMovementAt;
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {d ? format(new Date(d), 'dd MMM yyyy HH:mm', { locale: tr }) : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'vatDays',
      headerName: 'Vade',
      width: 72,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {params.row.vatDays} gün
        </Typography>
      ),
    },
    {
      field: 'balance',
      headerName: 'Güncel bakiye',
      flex: 1,
      minWidth: 130,
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const n = Number(params.row.balance || 0);
        const Icon = n > 0 ? TrendingUpIcon : n < 0 ? TrendingDownIcon : null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, width: '100%' }}>
            {Icon ? <Icon sx={{ fontSize: 16, color: n > 0 ? 'var(--destructive)' : 'success.main', opacity: 0.85 }} /> : null}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: n > 0 ? 'var(--destructive)' : n < 0 ? 'success.main' : 'var(--muted-foreground)',
              }}
            >
              {formatTry(n)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'riskStatus',
      headerName: 'Risk',
      width: 88,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => {
        const r = RISK_CHIP[params.row.riskStatus] ?? RISK_CHIP.OK;
        return <Chip label={r.label} size="small" color={r.color} variant="outlined" sx={{ fontWeight: 700, height: 22 }} />;
      },
    },
    {
      field: 'isActive',
      headerName: 'Portal',
      width: 82,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<CustomerRow>) => (
        <Chip
          label={params.row.isActive ? 'Açık' : 'Kapalı'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
          variant={params.row.isActive ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700, height: 22 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 44,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams<CustomerRow>) => (
        <Tooltip title="Detay">
          <IconButton component={Link} href={`/b2b-admin/customers/${params.row.id}`} size="small" sx={{ color: 'var(--muted-foreground)' }}>
            <ArrowIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Cari bakiyeleri"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Cariler' }]}
    >
      <Box sx={{ pb: 4 }}>
        <StandardCard
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 'var(--radius-xl)',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': { boxShadow: 'var(--shadow-sm)' },
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--muted-foreground)',
                fontWeight: 500,
                lineHeight: 1.65,
                letterSpacing: '0.01em',
                maxWidth: '56rem',
              }}
            >
              Senkron B2B hareketlerinden hesaplanan güncel bakiyeler. Özet kartlar ve tablo aşağıdadır; toplu bakiye için önce{' '}
              <Box component="span" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                ERP hareket senkronu
              </Box>{' '}
              ile verileri güncelleyin.
            </Typography>
            <Divider sx={{ borderColor: 'color-mix(in srgb, var(--border) 85%, transparent)' }} />
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', lg: 'center' }}
              justifyContent="space-between"
              useFlexGap
            >
              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1}
                alignItems="center"
                sx={{ flex: '1 1 260px', minWidth: 0 }}
              >
                <B2bSyncStatusChips syncStatus={syncStatus} />
              </Stack>
              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                sx={{ flex: { xs: '1 1 auto', lg: '0 1 auto' } }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={syncAllMovementsMutation.isPending ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <SyncIcon />}
                  onClick={() => syncAllMovementsMutation.mutate()}
                  disabled={syncAllMovementsMutation.isPending}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Tüm bakiyeleri ERP’den güncelle
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={importErpMutation.isPending ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <CloudDownloadIcon />}
                  onClick={() => importErpMutation.mutate()}
                  disabled={importErpMutation.isPending || syncFromErpMutation.isPending}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  ERP’den cari çek
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={syncFromErpMutation.isPending ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <RefreshIcon />}
                  onClick={() => syncFromErpMutation.mutate()}
                  disabled={syncFromErpMutation.isPending || importErpMutation.isPending}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Mevcutları güncelle
                </Button>
                <Tooltip title="Listeyi ve senkron bilgisini yenile">
                  <IconButton onClick={() => handleRefreshAll()} size="small" sx={{ borderRadius: 2, border: '1px solid var(--border)' }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button component={Link} href="/b2b-admin/customers/new" variant="outlined" size="small" startIcon={<AddIcon />} sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}>
                  Yeni kullanıcı
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </StandardCard>

        <Box
          sx={{
            mb: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <StandardCard sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Kayıtlı B2B cari
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--primary)', mt: 0.5 }}>
              {totalRowCount.toLocaleString('tr-TR')}
            </Typography>
          </StandardCard>
          <StandardCard sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bu sayfa bakiye toplamı
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--foreground)', mt: 0.5 }}>
              {formatTry(balanceSumPage)}
            </Typography>
          </StandardCard>
          <StandardCard sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Borçlu (sayfa)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--destructive)', mt: 0.5 }}>
              {debtCount}
            </Typography>
          </StandardCard>
          <StandardCard sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Alacaklı (sayfa)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {creditCount}
            </Typography>
          </StandardCard>
        </Box>

        <B2bSyncRecentLogsCard syncStatus={syncStatus} maxLogs={5} />

        <StandardCard sx={{ mb: 2 }}>
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Ünvan, e-posta, kod ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPaginationModel((p) => ({ ...p, page: 0 }));
              }}
              size="small"
              className="form-control-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{ flex: '1 1 260px', minWidth: 200 }}
            />

            {search.trim() ? (
              <Button size="small" onClick={handleClearSearch} sx={{ fontWeight: 700, textTransform: 'none', color: 'var(--muted-foreground)' }}>
                Temizle
              </Button>
            ) : null}
          </Box>
        </StandardCard>

        <Box sx={{ py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>
            {totalRowCount} kayıt · Bakiye / ünvan / kayıt tarihine göre sıralama (sunucu)
          </Typography>
        </Box>

        <StandardCard noPadding>
          <Box sx={{ width: '100%', height: { xs: 560, md: 640 } }}>
            <DataGrid
              rows={customers}
              columns={columns}
              loading={isLoading}
              rowHeight={44}
              columnHeaderHeight={40}
              density="compact"
              paginationMode="server"
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(m) => {
                setSortModel(m);
                setPaginationModel((p) => ({ ...p, page: 0 }));
              }}
              rowCount={totalRowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[25, 50, 100]}
              disableRowSelectionOnClick
              getRowId={(r) => r.id}
              sx={{
                border: 'none',
                fontSize: '0.8125rem',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'color-mix(in srgb, var(--muted) 50%, transparent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 0,
                  borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                },
                '& .MuiDataGrid-row': {
                  '&:hover': { bgcolor: 'color-mix(in srgb, var(--primary) 4%, transparent)' },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid var(--border)',
                  minHeight: 40,
                },
              }}
            />
          </Box>
        </StandardCard>
      </Box>
    </StandardPage>
  );
}
