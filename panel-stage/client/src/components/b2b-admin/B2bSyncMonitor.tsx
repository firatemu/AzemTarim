'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle,
  Error,
  KeyboardArrowDown,
  BrandingWatermark as BrandIcon,
  PriceCheck as PriceIcon,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

export type B2bSyncStatusPayload = {
  lastSyncedAt: string | null;
  lastSyncRequestedAt: string | null;
  syncIntervalMinutes: number | null;
  recentLogs: Array<{
    id: string;
    syncType: string;
    status: string;
    startedAt?: string;
    finishedAt?: string | null;
    recordsProcessed?: number;
    recordsAdded?: number;
    recordsUpdated?: number;
    errorMessage?: string | null;
  }>;
};

export type B2bSyncLogFinishedEvent = {
  success: boolean;
  errorMessage?: string | null;
};

export function useB2bSyncMonitor(options?: {
  /** Senkron log tamamlandığında (ürün listesi / döngü listesi yenileme vb.) */
  onSyncLogFinished?: (ev: B2bSyncLogFinishedEvent) => void;
}) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const onSyncLogFinishedRef = useRef(options?.onSyncLogFinished);
  onSyncLogFinishedRef.current = options?.onSyncLogFinished;
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStartTime, setLastSyncStartTime] = useState<number | null>(null);
  const [syncAnchorEl, setSyncAnchorEl] = useState<null | HTMLElement>(null);

  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['b2b-sync-status'],
    queryFn: async () => {
      const res = await axios.get<B2bSyncStatusPayload>('/b2b-admin/products/sync/status');
      return res.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.recentLogs?.[0]?.status;
      return status === 'RUNNING' || lastSyncStartTime ? 3000 : 15000;
    },
  });

  useEffect(() => {
    if (!lastSyncStartTime) return;

    const latestLog = syncStatus?.recentLogs?.[0];
    if (latestLog && (latestLog.status === 'SUCCESS' || latestLog.status === 'FAILED')) {
      const finishedAt = latestLog.finishedAt ? new Date(latestLog.finishedAt).getTime() : 0;

      if (finishedAt > lastSyncStartTime) {
        const success = latestLog.status === 'SUCCESS';
        if (onSyncLogFinishedRef.current) {
          onSyncLogFinishedRef.current({
            success,
            errorMessage: latestLog.errorMessage,
          });
        } else if (success) {
          enqueueSnackbar('Senkronizasyon tamamlandı.', { variant: 'success' });
        } else {
          enqueueSnackbar('Senkronizasyon başarısız: ' + (latestLog.errorMessage || ''), { variant: 'error' });
        }

        setLastSyncStartTime(null);
        setIsSyncing(false);
        void queryClient.invalidateQueries({ queryKey: ['b2b-sync-status'] });
      }
    }
  }, [syncStatus, lastSyncStartTime, queryClient, enqueueSnackbar]);

  const syncMutation = useMutation({
    mutationFn: async (type: 'PRODUCTS' | 'PRICES' | 'FULL' = 'FULL') => {
      setIsSyncing(true);
      setLastSyncStartTime(Date.now());
      const res = await axios.post<{ message?: string }>('/b2b-admin/products/sync', { type });
      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['b2b-sync-status'] });
      enqueueSnackbar(data?.message || 'ERP senkronizasyonu kuyruğa alındı.', { variant: 'info' });
    },
    onError: (error: unknown) => {
      setIsSyncing(false);
      setLastSyncStartTime(null);
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      enqueueSnackbar(
        'Senkronizasyon başlatılamadı: ' + (msg || (error instanceof Error ? error.message : 'Hata')),
        { variant: 'error' },
      );
    },
  });

  const handleSyncMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSyncAnchorEl(event.currentTarget);
  };
  const handleSyncMenuClose = () => {
    setSyncAnchorEl(null);
  };
  const handleSyncTrigger = (type: 'PRODUCTS' | 'PRICES' | 'FULL') => {
    setSyncAnchorEl(null);
    syncMutation.mutate(type);
  };

  return {
    syncStatus,
    refetchSyncStatus,
    isSyncing,
    syncMutation,
    syncAnchorEl,
    handleSyncMenuOpen,
    handleSyncMenuClose,
    handleSyncTrigger,
  };
}

export function B2bSyncStatusChips({ syncStatus }: { syncStatus: B2bSyncStatusPayload | undefined }) {
  if (!syncStatus) return null;

  return (
    <>
      {syncStatus.recentLogs && syncStatus.recentLogs.length > 0 && (
        <Tooltip title={`Son sync durumu: ${syncStatus.recentLogs[0].status}`}>
          <Chip
            icon={syncStatus.recentLogs[0].status === 'SUCCESS' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Error sx={{ fontSize: 14 }} />}
            label={`${syncStatus.recentLogs[0].status === 'SUCCESS' ? 'Başarılı' : 'Başarısız'} - ${syncStatus.recentLogs[0].recordsProcessed || 0} kayıt`}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 800,
              borderRadius: 2,
              color: syncStatus.recentLogs[0].status === 'SUCCESS' ? 'success.main' : 'error.main',
              borderColor: syncStatus.recentLogs[0].status === 'SUCCESS' ? 'success.main' : 'error.main',
            }}
          />
        </Tooltip>
      )}
      {syncStatus.lastSyncRequestedAt && (
        <Tooltip title="Son güncelleme isteği gönderilme zamanı">
          <Chip
            icon={<SyncIcon sx={{ fontSize: 14 }} />}
            label={`İstek: ${new Date(syncStatus.lastSyncRequestedAt).toLocaleString('tr-TR')}`}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{ fontWeight: 800, borderRadius: 2 }}
          />
        </Tooltip>
      )}
      {syncStatus.lastSyncedAt && (
        <Tooltip title="Son başarılı senkronizasyon zamanı">
          <Chip
            icon={<CheckCircle sx={{ fontSize: 14 }} />}
            label={`Eşitlenen: ${new Date(syncStatus.lastSyncedAt).toLocaleString('tr-TR')}`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 800, borderRadius: 2 }}
          />
        </Tooltip>
      )}
    </>
  );
}

type ErpSyncMenuProps = {
  isSyncing: boolean;
  syncAnchorEl: null | HTMLElement;
  onOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  onTrigger: (type: 'PRODUCTS' | 'PRICES' | 'FULL') => void;
};

export function B2bErpSyncMenuButton({
  isSyncing,
  syncAnchorEl,
  onOpen,
  onClose,
  onTrigger,
}: ErpSyncMenuProps) {
  const theme = useTheme();

  return (
    <>
      <Button
        variant="contained"
        startIcon={isSyncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
        endIcon={<KeyboardArrowDown />}
        onClick={onOpen}
        disabled={isSyncing}
        sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
      >
        {isSyncing ? 'Güncelleniyor...' : "ERP'den Güncelle"}
      </Button>
      <Menu
        anchorEl={syncAnchorEl}
        open={Boolean(syncAnchorEl)}
        onClose={onClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            minWidth: 280,
            boxShadow: theme.shadows[8],
            mt: 1.5,
          },
          '& .MuiMenuItem-root': {
            fontWeight: 600,
            py: 1.5,
            px: 2,
            gap: 1.5,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              pl: 2.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => onTrigger('PRODUCTS')}>
          <BrandIcon sx={{ fontSize: 22, color: 'info.main' }} /> Ürün Bilgilerini Güncelle
        </MenuItem>
        <MenuItem onClick={() => onTrigger('PRICES')}>
          <PriceIcon sx={{ fontSize: 22, color: 'success.main' }} /> Fiyat Bilgilerini Güncelle
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => onTrigger('FULL')} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <SyncIcon sx={{ fontSize: 22 }} /> Tümünü Güncelle (Tam Senkronizasyon)
        </MenuItem>
      </Menu>
    </>
  );
}

export function B2bSyncRecentLogsCard({
  syncStatus,
  maxLogs = 10,
}: {
  syncStatus: B2bSyncStatusPayload | undefined;
  maxLogs?: number;
}) {
  const theme = useTheme();

  if (!syncStatus?.recentLogs?.length) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.02) }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SyncIcon sx={{ fontSize: 18, color: 'info.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          Son Senkronizasyon Logları
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {syncStatus.recentLogs.slice(0, maxLogs).map((log) => (
          <Stack
            key={log.id}
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
          >
            <Chip
              label={log.status}
              size="small"
              color={log.status === 'SUCCESS' ? 'success' : log.status === 'RUNNING' ? 'info' : 'error'}
              sx={{ fontWeight: 800, minWidth: 80 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {log.syncType}
            </Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 200 }}>
              {log.recordsProcessed || 0} işlendi • {log.recordsAdded || 0} eklendi • {log.recordsUpdated || 0} güncellendi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {log.finishedAt ? new Date(log.finishedAt).toLocaleString('tr-TR') : 'Devam ediyor...'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
