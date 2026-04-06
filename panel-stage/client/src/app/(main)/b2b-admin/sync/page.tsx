'use client';

import StandardPage from '@/components/common/StandardPage';
import axios from '@/lib/axios';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Box,
  alpha,
  useTheme,
  Divider,
  Stack,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Sync as SyncIcon,
  PlayArrow as PlayIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as DbIcon,
  Code as CodeIcon,
  CloudQueue as CloudIcon,
  NotificationsActive as AlertIcon,
} from '@mui/icons-material';
import { useCallback, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

export default function B2bAdminSyncPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get('/b2b/sync/status')
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e?.response?.data?.message || e?.message || 'Senkron durumu alınamadı.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await axios.post('/b2b/sync/trigger', { syncType: 'FULL' });
      enqueueSnackbar('Senkronizasyon işlemi kuyruğa eklendi.', { variant: 'success' });
      loadStatus();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Senkronizasyon başlatılamadı.', { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <StandardPage
      title="ERP & B2B Senkronizasyonu"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Senkronizasyon' }]}
      headerActions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
            disabled={loading}
            sx={{ fontWeight: 800, borderRadius: 3, px: 2 }}
          >
            Durumu Yenile
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            onClick={triggerSync}
            disabled={syncing || loading}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            {syncing ? 'Eşitleniyor...' : 'Senkronizasyonu Tetikle'}
          </Button>
        </Stack>
      }
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 800 }}>
          ERP veritabanı ile B2B portal arasındaki veri tutarlılığını buradan kontrol edebilirsiniz.
          Ürün stokları, cari riskleri ve yeni siparişlerin sisteme aktarımı bu servis üzerinden yönetilmektedir.
        </Typography>
      </Box>

      {error && <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Status Dashboard Section */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {/* Main Status Paper */}
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.01), borderBottom: '6px solid', borderColor: data?.isRunning ? 'primary.main' : 'success.main' }}>
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: data?.isRunning ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                  color: data?.isRunning ? 'primary.main' : 'success.main',
                  display: 'flex'
                }}>
                  {data?.isRunning ? <CircularProgress size={32} thickness={5} /> : <SuccessIcon sx={{ fontSize: 32 }} />}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                    {data?.isRunning ? 'Veri Aktarımı Sürüyor' : 'Sistem Hazır ve Eşit'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HistoryIcon sx={{ fontSize: 14 }} /> SON TAM EŞİTLEME: {data?.lastFullSyncAt ? new Date(data.lastFullSyncAt).toLocaleString('tr-TR') : 'BİLGİ YOK'}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Servis Modu</Typography>
                  <Chip label={data?.mode || 'OTOMATİK (SAATLİK)'} size="small" variant="contained" color="info" sx={{ fontWeight: 900, borderRadius: 1.5 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Bağlantı Durumu</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CloudIcon sx={{ fontSize: 16 }} /> ERP_CONNECTED
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Kuyrukta Bekleyen</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{data?.pendingJobs || 0} Görev</Typography>
                </Box>
              </Stack>
            </Paper>

            <Alert severity="info" icon={<AlertIcon />} sx={{ borderRadius: 3, '& .MuiAlert-message': { fontWeight: 600 } }}>
              Manuel tetikleme işlemi yüksek CPU maliyetlidir, sadece acil durumlarda (stok güncellemeleri vb.) kullanınız.
            </Alert>
          </Stack>
        </Grid>

        {/* Sync Logs Section */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 5,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ px: 3, py: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <HistoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0.5 }}>SİSTEM SENKRON LOGLARI</Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                p: 3,
                flex: 1,
                overflow: 'auto',
                maxHeight: 600,
              }}
            >
              {data?.logs && data.logs.length > 0 ? (
                <Stack spacing={2}>
                  {data.logs.map((log: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: log.status === 'SUCCESS' ? alpha(theme.palette.success.main, 0.05) :
                                   log.status === 'FAILED' ? alpha(theme.palette.error.main, 0.05) :
                                   alpha(theme.palette.info.main, 0.05),
                        border: '1px solid',
                        borderColor: log.status === 'SUCCESS' ? alpha(theme.palette.success.main, 0.2) :
                                    log.status === 'FAILED' ? alpha(theme.palette.error.main, 0.2) :
                                    alpha(theme.palette.info.main, 0.2),
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1 }}>
                        <Box sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: log.status === 'SUCCESS' ? alpha(theme.palette.success.main, 0.15) :
                                     log.status === 'FAILED' ? alpha(theme.palette.error.main, 0.15) :
                                     alpha(theme.palette.info.main, 0.15),
                          color: log.status === 'SUCCESS' ? 'success.main' :
                                   log.status === 'FAILED' ? 'error.main' :
                                   'info.main',
                        }}>
                          {log.status === 'SUCCESS' ? <SuccessIcon sx={{ fontSize: 18 }} /> :
                           log.status === 'FAILED' ? <ErrorIcon sx={{ fontSize: 18 }} /> :
                           <SyncIcon sx={{ fontSize: 18 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {log.syncType === 'FULL' ? 'Tam Senkronizasyon' :
                             log.syncType === 'PRODUCTS' ? 'Ürün Senkronizasyonu' :
                             log.syncType === 'ACCOUNTS' ? 'Cari Hesap Senkronizasyonu' :
                             log.syncType}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {new Date(log.startedAt).toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                        <Chip
                          label={log.status === 'SUCCESS' ? 'BAŞARILI' :
                                 log.status === 'FAILED' ? 'BAŞARISIZ' :
                                 log.status === 'PENDING' ? 'BEKLİYOR' : log.status}
                          size="small"
                          color={log.status === 'SUCCESS' ? 'success' :
                                  log.status === 'FAILED' ? 'error' :
                                  'default'}
                          sx={{ fontWeight: 900, borderRadius: 1.5 }}
                        />
                      </Stack>
                      {log.status === 'SUCCESS' && (
                        <Stack direction="row" spacing={3} sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.25 }}>
                              İŞLENEN KAYIT
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                              {log.recordsProcessed || 0}
                            </Typography>
                          </Box>
                          {log.recordsAdded > 0 && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.25 }}>
                                YENİ EKLENEN
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>
                                +{log.recordsAdded}
                              </Typography>
                            </Box>
                          )}
                          {log.recordsUpdated > 0 && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.25 }}>
                                GÜNCELLENEN
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: 'info.main' }}>
                                ~{log.recordsUpdated}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      )}
                      {log.status === 'FAILED' && log.errorMessage && (
                        <Alert severity="error" sx={{ mt: 1, borderRadius: 2, py: 0, fontWeight: 700 }}>
                          {log.errorMessage}
                        </Alert>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, py: 8 }}>
                  <HistoryIcon sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>HENÜZ SENKRON LOGU YOK</Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>
                    İlk senkronizasyonu başlatmak için yukarıdaki butonu kullanın
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </StandardPage>
  );
}
