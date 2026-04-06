'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Settings as SettingsIcon,
  Storage as DbIcon,
  Warehouse as WarehouseIcon,
  LocalShipping as DeliveryIcon,
  Security as AdminIcon,
  Info as InfoIcon,
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  Key as LicenseIcon,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

interface B2BSettings {
  config: {
    id: string;
    schemaName: string;
    domain: string | null;
    erpAdapterType: 'OTOMUHASEBE' | 'LOGO' | 'MIKRO';
    erpConnectionString: string | null;
    lastSyncedAt: string | null;
    syncIntervalMinutes: number;
    orderApprovalMode: 'MANUAL' | 'AUTO';
    isActive: boolean;
  };
  license: {
    isActive: boolean;
    maxB2BCustomers: number;
    expiresAt: string;
  } | null;
  domains: Array<{
    id: string;
    domain: string;
    isActive: boolean;
  }>;
  warehouseConfigs: Array<{
    id: string;
    warehouseId: string;
    warehouseName: string;
    displayMode: 'INDIVIDUAL' | 'COMBINED';
    isActive: boolean;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

export default function B2bAdminSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const [logoConfig, setLogoConfig] = useState({
    server: '', port: 1433, database: '', user: '', password: '', logoVersion: '', companyNo: '', periodNo: '',
  });

  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['b2b-settings'],
    queryFn: async () => {
      const res = await axios.get<B2BSettings>('/b2b-admin/settings');
      return res.data;
    },
  });

  // Populate form
  useEffect(() => {
    if (settings?.config?.erpConnectionString) {
      try {
        const savedConfig = JSON.parse(settings.config.erpConnectionString);
        setLogoConfig((prev) => ({ ...prev, ...savedConfig }));
      } catch (e) { console.error('Parse error', e); }
    }
  }, [settings?.config?.erpConnectionString]);

  // Mutations
  const testConnectionMutation = useMutation({
    mutationFn: (data: any) => axios.post('/b2b-admin/settings/test-connection', data).then(r => r.data),
    onSuccess: (data) => {
      setConnectionTestResult(data);
      data.success ? enqueueSnackbar('Bağlantı başarılı!', { variant: 'success' }) : enqueueSnackbar('Bağlantı başarısız', { variant: 'error' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Bağlantı hatası';
      setConnectionTestResult({ success: false, message: msg });
      enqueueSnackbar(msg, { variant: 'error' });
    }
  });

  const updateSyncMutation = useMutation({
    mutationFn: (data: any) => axios.patch('/b2b-admin/settings/sync', data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['b2b-settings'] }); enqueueSnackbar('Ayarlar güncellendi', { variant: 'success' }); },
    onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || 'Hata', { variant: 'error' })
  });

  const saveErpConnectionMutation = useMutation({
    mutationFn: (data: any) => axios.patch('/b2b-admin/settings/erp-connection', data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['b2b-settings'] }); enqueueSnackbar('Ayarlar kaydedildi', { variant: 'success' }); },
    onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || 'Hata', { variant: 'error' })
  });

  const fetchWarehousesMutation = useMutation({
    mutationFn: () => axios.post('/b2b-admin/settings/warehouses/fetch').then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['b2b-settings'] }); enqueueSnackbar('Depolar çekildi', { variant: 'success' }); }
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ warehouseId, data }: any) => axios.patch(`/b2b-admin/settings/warehouses/${warehouseId}`, data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['b2b-settings'] }); enqueueSnackbar('Güncellendi', { variant: 'success' }); }
  });

  if (isLoading) return <StandardPage title="B2B Ayarları"><Box display="flex" justifyContent="center" p={12}><CircularProgress /></Box></StandardPage>;
  if (error || !settings) return <StandardPage title="B2B Ayarları"><Alert severity="error">Ayarlar yüklenemedi</Alert></StandardPage>;

  return (
    <StandardPage
      title="B2B Portal Ayarları"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Ayarlar' }]}
    >
      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            px: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { py: 2.5, fontWeight: 800, minWidth: 140, textTransform: 'none', fontSize: '0.9rem' }
          }}
        >
          <Tab icon={<DbIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="ERP Bağlantısı" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Genel Ayarlar" />
          <Tab icon={<WarehouseIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Depo Yönetimi" />
          <Tab icon={<DeliveryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Lojistik" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Tab 1: ERP Connection */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Veritabanı Entegrasyonu</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>B2B Portalınızın ERP programınızla nasıl iletişim kuracağını buradan yapılandırın.</Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Entegrasyon Modeli (ERP Tipi)</InputLabel>
                    <Select
                      value={settings.config.erpAdapterType}
                      label="Entegrasyon Modeli (ERP Tipi)"
                      onChange={(e) => updateSyncMutation.mutate({ erpAdapterType: e.target.value })}
                      sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                      <MenuItem value="OTOMUHASEBE">OtoMuhasebe Native (Modern)</MenuItem>
                      <MenuItem value="LOGO">Logo Enterprise / Tiger</MenuItem>
                      <MenuItem value="MIKRO">Mikro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {settings.config.erpAdapterType === 'OTOMUHASEBE' && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                          <CheckCircleIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'success.main' }}>Native Entegrasyon Aktif</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            OtoMuhasebe Bulut altyapısını kullandığınız için ek bağlantı ayarına gerek yoktur. Verileriniz anlık olarak senkronize edilir.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {settings.config.erpAdapterType === 'LOGO' && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: 'text.secondary', textTransform: 'uppercase' }}>SQL SERVER BAĞLANTI PARAMETRELERİ</Typography>
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 8 }}><TextField fullWidth label="Server Address / IP" value={logoConfig.server} onChange={(e) => setLogoConfig({ ...logoConfig, server: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Port" type="number" value={logoConfig.port} onChange={(e) => setLogoConfig({ ...logoConfig, port: Number(e.target.value) })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="DB Name" value={logoConfig.database} onChange={(e) => setLogoConfig({ ...logoConfig, database: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="User" value={logoConfig.user} onChange={(e) => setLogoConfig({ ...logoConfig, user: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={logoConfig.password}
                            onChange={(e) => setLogoConfig({ ...logoConfig, password: e.target.value })}
                            InputProps={{
                              sx: { borderRadius: 2.5 },
                              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Logo Versiyon" value={logoConfig.logoVersion} onChange={(e) => setLogoConfig({ ...logoConfig, logoVersion: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Firma No" value={logoConfig.companyNo} onChange={(e) => setLogoConfig({ ...logoConfig, companyNo: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="Dönem No" value={logoConfig.periodNo} onChange={(e) => setLogoConfig({ ...logoConfig, periodNo: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} /></Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <Divider />

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<SyncIcon />}
                  onClick={() => testConnectionMutation.mutate({ erpAdapterType: settings.config.erpAdapterType, ...(settings.config.erpAdapterType === 'LOGO' ? logoConfig : {}) })}
                  disabled={testConnectionMutation.isPending}
                  sx={{ fontWeight: 800, borderRadius: 3, px: 3 }}
                >
                  {testConnectionMutation.isPending ? 'Test Ediliyor...' : 'Bağlantı Testi'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => saveErpConnectionMutation.mutate({ erpAdapterType: settings.config.erpAdapterType, ...logoConfig })}
                  disabled={saveErpConnectionMutation.isPending}
                  sx={{ fontWeight: 900, borderRadius: 3, px: 4 }}
                >
                  Değişiklikleri Kaydet
                </Button>
              </Stack>

              {connectionTestResult && (
                <Alert
                  severity={connectionTestResult.success ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ borderRadius: 3, '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{connectionTestResult.success ? 'Bağlantı Başarıyla Kuruldu' : 'Bağlantı Kurulamadı'}</Typography>
                  <Typography variant="body2">{connectionTestResult.message}</Typography>
                </Alert>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 2: General Settings */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={4} sx={{ maxWidth: 700 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Sistem Parametreleri</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>B2B Sipariş akışı ve lisans yönetimini buradan düzenleyin.</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                    <Stack spacing={3}>
                      <FormControl fullWidth>
                        <InputLabel>Sipariş Onay Modu</InputLabel>
                        <Select
                          value={settings.config.orderApprovalMode}
                          label="Sipariş Onay Modu"
                          onChange={(e) => updateSyncMutation.mutate({ orderApprovalMode: e.target.value })}
                          sx={{ borderRadius: 2.5, fontWeight: 700 }}
                        >
                          <MenuItem value="AUTO">Tam Otomatik (Onay Gerektirmez)</MenuItem>
                          <MenuItem value="MANUAL">Yönetici Onayı Beklet (Tavsiye Edilen)</MenuItem>
                        </Select>
                        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', px: 1 }}>
                          Otomatik modda gelen tüm siparişler anında ERP'ye "Onaylı" olarak aktarılır.
                        </Typography>
                      </FormControl>

                      <TextField
                        fullWidth
                        type="number"
                        label="ERP Senkronizasyon Sıklığı (Dakika)"
                        value={settings.config.syncIntervalMinutes}
                        onChange={(e) => updateSyncMutation.mutate({ syncIntervalMinutes: Number(e.target.value) })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontWeight: 700 } }}
                      />
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <LicenseIcon color="info" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Mevcut Lisans Durumu</Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>PORTAL KULLANICI LİMİTİ</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{settings.license?.maxB2BCustomers === -1 ? 'Sınırsız / Kurumsal' : settings.license?.maxB2BCustomers}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>LİSANS GEÇERLİLİK</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{settings.license?.expiresAt ? new Date(settings.license.expiresAt).toLocaleDateString('tr-TR') : '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* Tab 3: Warehouses */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>Depo Stok Görünürlüğü</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>B2B Portalında müşterilere hangi depoların stok verisinin yansıyacağını seçin.</Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => fetchWarehousesMutation.mutate()}
                  disabled={fetchWarehousesMutation.isPending}
                  startIcon={fetchWarehousesMutation.isPending ? <CircularProgress size={16} /> : <RefreshIcon />}
                  sx={{ fontWeight: 800, borderRadius: 3 }}
                >
                  Depoları ERP'den Güncelle
                </Button>
              </Box>

              <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <DataGrid
                  rows={settings.warehouseConfigs.map((w, idx) => ({ id: w.warehouseId, ...w }))}
                  columns={[
                    { field: 'warehouseName', headerName: 'DEPO / ŞUBE ADI', flex: 1, renderCell: (params) => <Typography sx={{ fontWeight: 800 }}>{params.value}</Typography> },
                    {
                      field: 'displayMode',
                      headerName: 'STOK GÖSTERİMİ',
                      width: 200,
                      renderCell: (params) => (
                        <Select
                          value={params.row.displayMode}
                          size="small"
                          fullWidth
                          onChange={(e) => updateWarehouseMutation.mutate({ warehouseId: params.row.warehouseId, data: { displayMode: e.target.value } })}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          <MenuItem value="INDIVIDUAL">Ayrı Stok Olarak</MenuItem>
                          <MenuItem value="COMBINED">Toplam Stoğa Dahil</MenuItem>
                        </Select>
                      ),
                    },
                    {
                      field: 'isActive',
                      headerName: 'DURUM',
                      width: 120,
                      align: 'center',
                      renderCell: (params) => (
                        <Switch
                          checked={params.row.isActive}
                          onChange={(e) => updateWarehouseMutation.mutate({ warehouseId: params.row.warehouseId, data: { isActive: e.target.checked } })}
                        />
                      ),
                    },
                  ]}
                  disableRowSelectionOnClick
                  hideFooter
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 900, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 1 }
                  }}
                />
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 4, border: '1px dashed', borderColor: 'info.main' }}>
              <DeliveryIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Lojistik & Teslimat Modülü</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Teslimat yöntemlerini, kargo entegrasyonlarını ve şube bazlı sevkiyat ayarlarını yönetmek için ana sevk modülünü kullanın.</Typography>
              <Button variant="contained" color="info" sx={{ fontWeight: 800, borderRadius: 2.5 }}>Lojistik Ayarlarına Git</Button>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </StandardPage>
  );
}
