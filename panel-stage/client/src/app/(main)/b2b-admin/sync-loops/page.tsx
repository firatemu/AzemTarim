'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import {
  B2bSyncStatusChips,
  B2bErpSyncMenuButton,
  B2bSyncRecentLogsCard,
  useB2bSyncMonitor,
} from '@/components/b2b-admin';
import axios from '@/lib/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

/** Kısa bilgi — B2BSyncType ile uyumlu (STOCK kuyrukta kullanılmaz, tabloda gösterilmez) */
const SYNC_LOOP_HELP: Record<string, string> = {
  PRODUCTS:
    'B2B ürün kartlarını ERP malzeme bilgisiyle eşitler (kod, ad, marka, kategori vb.).',
  PRICES: 'Aktif fiyat kartları ve liste fiyatlarını ERP’den B2B’ye aktarır.',
  ACCOUNT_MOVEMENTS:
    'Tüm B2B cariler veya tek cari için ERP hareketlerini çekerek bakiye satırlarını günceller.',
  FULL: 'Ürün ve fiyat senkronunu tek kuyruk işinde birlikte çalıştırır (tam eşitleme).',
};

export default function SyncLoopsPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    syncStatus,
    refetchSyncStatus,
    isSyncing,
    syncAnchorEl,
    handleSyncMenuOpen,
    handleSyncMenuClose,
    handleSyncTrigger,
  } = useB2bSyncMonitor({
    onSyncLogFinished: (ev) => {
      if (ev.success) {
        void queryClient.invalidateQueries({ queryKey: ['b2b-sync-loops'] });
        void queryClient.invalidateQueries({ queryKey: ['b2b-customers'] });
        enqueueSnackbar('Senkronizasyon tamamlandı, döngü bilgileri güncellendi.', { variant: 'success' });
      } else {
        enqueueSnackbar('Senkronizasyon başarısız: ' + (ev.errorMessage || ''), { variant: 'error' });
      }
    },
  });

  const { data: loopsRaw = [], isLoading, refetch: refetchLoops } = useQuery({
    queryKey: ['b2b-sync-loops'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/products/sync/loops');
      return res.data;
    },
  });

  const loops = Array.isArray(loopsRaw)
    ? loopsRaw.filter((row: { syncType?: string }) => row?.syncType !== 'STOCK')
    : [];

  const handleRefreshAll = () => {
    void refetchLoops();
    void refetchSyncStatus();
  };

  const columns: GridColDef[] = [
    {
      field: 'syncType',
      headerName: 'Döngü Tipi',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const typeMap: Record<string, string> = {
          PRODUCTS: 'Ürün Senkronizasyonu',
          PRICES: 'Fiyat Senkronizasyonu',
          ACCOUNT_MOVEMENTS: 'Cari Hareketler',
          FULL: 'Tam Senkronizasyon',
        };
        const val = params.value as string;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SyncIcon sx={{ color: 'var(--primary)', fontSize: 18 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeMap[val] || val}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'purpose',
      headerName: 'Ne işe yarar?',
      flex: 1.35,
      minWidth: 260,
      sortable: false,
      valueGetter: (_v, row: { syncType: string }) => SYNC_LOOP_HELP[row.syncType] ?? '',
      renderCell: (params: GridRenderCellParams) => {
        const key = params.row.syncType as string;
        const text =
          (params.value as string) || SYNC_LOOP_HELP[key] || 'Bu döngü tipi için açıklama tanımlı değil.';
        return (
          <Tooltip title={text}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--muted-foreground)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.35,
              }}
            >
              {text}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'lastRunAt',
      headerName: 'Son Çalışma Zamanı',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const val = params.value as string;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <UpdateIcon sx={{ color: 'text.secondary', fontSize: 16, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {val ? format(new Date(val), 'dd MMMM yyyy HH:mm', { locale: tr }) : 'Hiç çalışmadı'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'lastUser',
      headerName: 'Başlatan Kullanıcı',
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.value as { fullName?: string } | null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <PersonIcon sx={{ color: 'text.secondary', fontSize: 16, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: user?.fullName ? 'text.primary' : 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Sistem / Otomatik'}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const lastRun = params.row.lastRunAt as string | null | undefined;
        return (
          <Chip
            label={lastRun ? 'Çalıştı' : 'Bekliyor'}
            size="small"
            color={lastRun ? 'success' : 'default'}
            variant={lastRun ? 'outlined' : 'filled'}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 52,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: () => (
        <Tooltip title="Listeyi yenile">
          <IconButton size="small" color="primary" onClick={() => handleRefreshAll()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <StandardPage
      title="Senkronizasyon Döngüleri"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Döngüler' }]}
      headerActions={
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <B2bSyncStatusChips syncStatus={syncStatus} />
          <B2bErpSyncMenuButton
            isSyncing={isSyncing}
            syncAnchorEl={syncAnchorEl}
            onOpen={handleSyncMenuOpen}
            onClose={handleSyncMenuClose}
            onTrigger={handleSyncTrigger}
          />
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => handleRefreshAll()}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Listeyi Güncelle
          </Button>
        </Stack>
      }
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          ERP senkron durumu, son loglar ve her döngü tipinin son çalışma zamanı bu sayfada bir arada listelenir. Ürünler sayfasındaki senkron bilgileri ile aynı veriyi kullanır (ortak önbellek).
        </Typography>
      </Box>

      <B2bSyncRecentLogsCard syncStatus={syncStatus} maxLogs={10} />

      <Paper
        variant="outlined"
        sx={{
          height: 650,
          width: '100%',
          p: 0,
          borderRadius: 'var(--radius, 8px)',
          overflow: 'hidden',
          borderColor: 'var(--border)',
          bgcolor: 'var(--card)',
        }}
      >
        <DataGrid
          rows={loops}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          getRowId={(row: { syncType: string }) => row.syncType}
          rowHeight={44}
          columnHeaderHeight={40}
          density="compact"
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
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
      </Paper>
    </StandardPage>
  );
}
