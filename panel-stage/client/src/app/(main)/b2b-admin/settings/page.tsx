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
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function B2bAdminSettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [logoConfig, setLogoConfig] = useState({
    server: '',
    port: 1433,
    database: '',
    user: '',
    password: '',
    logoVersion: '',
    companyNo: '',
    periodNo: '',
  });
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['b2b-settings'],
    queryFn: async () => {
      const res = await axios.get<B2BSettings>('/b2b-admin/settings');
      return res.data;
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  // Populate form from saved settings
  useEffect(() => {
    if (settings?.config?.erpConnectionString) {
      try {
        const savedConfig = JSON.parse(settings.config.erpConnectionString);
        setLogoConfig((prev) => ({
          ...prev,
          ...savedConfig,
        }));
      } catch (e) {
        console.error('Failed to parse connection string', e);
      }
    }
  }, [settings?.config?.erpConnectionString]);

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/b2b-admin/settings/test-connection', data);
      return res.data;
    },
    onSuccess: (data) => {
      setConnectionTestResult(data);
      if (data.success) {
        toast.success('Bağlantı başarılı!');
      } else {
        toast.error(data.message || 'Bağlantı başarısız');
      }
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || 'Bağlantı hatası';
      setConnectionTestResult({
        success: false,
        message: errorMsg,
        details: err?.response?.data?.details || 'Sunucu ile iletişim kurulamadı',
      });
      toast.error(errorMsg);
    },
  });

  // Update sync settings mutation
  const updateSyncMutation = useMutation({
    mutationFn: async (data: {
      syncIntervalMinutes?: number;
      orderApprovalMode?: 'MANUAL' | 'AUTO';
      erpAdapterType?: 'OTOMUHASEBE' | 'LOGO' | 'MIKRO';
    }) => {
      const res = await axios.patch('/b2b-admin/settings/sync', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-settings'] });
      toast.success('Ayarlar güncellendi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Güncelleme hatası');
    },
  });

  // Save ERP connection mutation
  const saveErpConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.patch('/b2b-admin/settings/erp-connection', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-settings'] });
      toast.success('ayarlar kaydedi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Kaydetme hatası');
    },
  });

  // Fetch warehouses from ERP mutation
  const fetchWarehousesMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/settings/warehouses/fetch');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-settings'] });
      toast.success('Depolar ERP\'den çekildi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Depo çekme hatası');
    },
  });

  // Update warehouse config mutation
  const updateWarehouseMutation = useMutation({
    mutationFn: async ({ warehouseId, data }: { warehouseId: string; data: any }) => {
      const res = await axios.patch(`/b2b-admin/settings/warehouses/${warehouseId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-settings'] });
      toast.success('Depo ayarı güncellendi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Güncelleme hatası');
    },
  });

  if (isLoading) {
    return (
      <StandardPage title="B2B Ayarları" breadcrumbs={[{ label: 'B2B Yönetimi' }, { label: 'Ayarlar' }]}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </StandardPage>
    );
  }

  if (error || !settings) {
    return (
      <StandardPage title="B2B Ayarları" breadcrumbs={[{ label: 'B2B Yönetimi' }, { label: 'Ayarlar' }]}>
        <Alert severity="error">Ayarlar yüklenemedi</Alert>
      </StandardPage>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <StandardPage title="B2B Ayarları" breadcrumbs={[{ label: 'B2B Yönetimi' }, { label: 'Ayarlar' }]}>
      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="ERP Bağlantısı" />
          <Tab label="Genel Ayarlar" />
          <Tab label="Depolar" />
          <Tab label="Teslimat Yöntemleri" />
        </Tabs>

        {/* Tab 1: ERP Connection */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2, maxWidth: 800 }}>
            <Typography variant="h6" gutterBottom>
              ERP Bağlantı Ayarları
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              B2B Portalınızı ERP programınızla entegre edin. Veriler otomatik olarak senkronize edilecektir.
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>ERP Tipi</InputLabel>
                  <Select
                    value={settings.config.erpAdapterType}
                    label="ERP Tipi"
                    onChange={(e) => updateSyncMutation.mutate({
                      erpAdapterType: e.target.value as 'OTOMUHASEBE' | 'LOGO' | 'MIKRO',
                    })}
                    disabled={updateSyncMutation.isPending}
                  >
                    <MenuItem value="OTOMUHASEBE">OtoMuhasebe</MenuItem>
                    <MenuItem value="LOGO">Logo Enterprise</MenuItem>
                    <MenuItem value="MIKRO">Mikro</MenuItem>
                  </Select>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    ERP tipini değiştirmek için sistem yöneticisine başvurun
                  </Typography>
                </FormControl>
              </Grid>

              {settings.config.erpAdapterType === 'OTOMUHASEBE' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="h6" color="success.main">Otomatik Entegrasyon Aktif</Typography>
                          <Typography variant="body2" color="textSecondary">
                            OtoMuhasebe ile aynı veritabanını kullanıyorsunuz. Ek yapılandırma gereklidir.
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Schema Adı"
                      value={settings.config.schemaName || 'public'}
                      disabled
                      helperText="OtoMuhasebe veritabanı şeması"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Tenant ID"
                      value={settings.config.id}
                      disabled
                      helperText="Firma tanımlayıcısı"
                    />
                  </Grid>
                </>
              )}

              {settings.config.erpAdapterType === 'LOGO' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Logo Enterprise SQL Server Bağlantı Ayarları
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Logo veritabanına doğrudan SQL Server üzerinden bağlanılacak
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="SQL Server Sunucusu"
                            placeholder="localhost veya 192.168.1.100"
                            helperText="Sunucu adresi veya IP"
                            value={logoConfig.server}
                            onChange={(e) => setLogoConfig({ ...logoConfig, server: e.target.value })}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Port"
                            type="number"
                            placeholder="1433"
                            value={logoConfig.port}
                            onChange={(e) => setLogoConfig({ ...logoConfig, port: parseInt(e.target.value) || 0 })}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Veritabanı Adı"
                            placeholder="LOGO_TIGER"
                            helperText="Logo veritabanı adı"
                            value={logoConfig.database}
                            onChange={(e) => setLogoConfig({ ...logoConfig, database: e.target.value })}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            placeholder="sa"
                            helperText="SQL Server kullanıcısı"
                            value={logoConfig.user}
                            onChange={(e) => setLogoConfig({ ...logoConfig, user: e.target.value })}
                          />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Parola"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            helperText="SQL Server kullanıcı parolası"
                            value={logoConfig.password}
                            onChange={(e) => setLogoConfig({ ...logoConfig, password: e.target.value })}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth>
                            <InputLabel>Logo Versiyonu</InputLabel>
                            <Select
                              label="Logo Versiyonu"
                              value={logoConfig.logoVersion}
                              onChange={(e) => setLogoConfig({ ...logoConfig, logoVersion: e.target.value })}
                            >
                              <MenuItem value="">Seçin</MenuItem>
                              <MenuItem value="TIGER">Logo Tiger Enterprise</MenuItem>
                              <MenuItem value="GO">Logo Go</MenuItem>
                              <MenuItem value="START">Logo Start</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Firma Numarası"
                            placeholder="1"
                            helperText="Logo firma numarası (örn: 1)"
                            value={logoConfig.companyNo}
                            onChange={(e) => setLogoConfig({ ...logoConfig, companyNo: e.target.value })}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Dönem Numarası"
                            placeholder="1"
                            helperText="Logo dönem numarası (örn: 1)"
                            value={logoConfig.periodNo}
                            onChange={(e) => setLogoConfig({ ...logoConfig, periodNo: e.target.value })}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </>
              )}

              {settings.config.erpAdapterType === 'MIKRO' && (
                <Grid size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Mikro Programı Bağlantı Ayarları
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Mikro entegrasyonu için Firebird/Interbase driver gereklidir.
                    </Alert>
                  </Paper>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      setConnectionTestResult(null);
                      testConnectionMutation.mutate({
                        erpAdapterType: settings.config.erpAdapterType,
                        ...(settings.config.erpAdapterType === 'LOGO' ? logoConfig : {}),
                      });
                    }}
                    disabled={testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending ? 'Bağlanıyor...' : 'Bağlantıyı Test Et'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      saveErpConnectionMutation.mutate({
                        erpAdapterType: settings.config.erpAdapterType,
                        ...logoConfig,
                      });
                    }}
                    disabled={saveErpConnectionMutation.isPending}
                  >
                    {saveErpConnectionMutation.isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                  </Button>

                  {settings.config.lastSyncedAt && !connectionTestResult && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Son Senk: ${new Date(settings.config.lastSyncedAt).toLocaleString('tr-TR')}`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>

              {/* Connection Test Result */}
              {connectionTestResult && (
                <Grid size={{ xs: 12 }}>
                  <Alert
                    severity={connectionTestResult.success ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                    action={
                      connectionTestResult.success ? (
                        <CheckCircleIcon fontSize="inherit" />
                      ) : (
                        <ErrorIcon fontSize="inherit" />
                      )
                    }
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {connectionTestResult.success ? '✓ Bağlantı Başarılı' : '✗ Bağlantı Başarısız'}
                    </Typography>
                    <Typography variant="body2">
                      {connectionTestResult.message}
                    </Typography>
                    {connectionTestResult.details && (
                      <Typography variant="caption" component="div" sx={{ mt: 1, opacity: 0.8 }}>
                        {connectionTestResult.details}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Senkronizasyon Bilgisi:
                  </Typography>
                  <Typography variant="body2" component="div">
                    • Ürünler, stoklar, fiyatlar, cariler ve kampanyalar otomatik senkronize edilir<br />
                    • Senkronizasyon aralığı: {settings.config.syncIntervalMinutes} dakika<br />
                    • Son senkronizasyon: {settings.config.lastSyncedAt
                      ? new Date(settings.config.lastSyncedAt).toLocaleString('tr-TR')
                      : 'Henüz yapılmadı'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 2: General Settings */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Genel Ayarlar
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Sipariş Onay Modu</InputLabel>
                  <Select
                    value={settings.config.orderApprovalMode}
                    label="Sipariş Onay Modu"
                    onChange={(e) => updateSyncMutation.mutate({
                      orderApprovalMode: e.target.value as 'MANUAL' | 'AUTO',
                    })}
                    disabled={updateSyncMutation.isPending}
                  >
                    <MenuItem value="AUTO">Otomatik Onay</MenuItem>
                    <MenuItem value="MANUAL">Manuel Onay</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary">
                  Otomatik: Siparişler otomatik onaylanır ve ERP&apos;e aktarılır
                  <br />
                  Manuel: Siparişler admin onayına bekler
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Senkronizasyon Aralığı (Dakika)"
                  value={settings.config.syncIntervalMinutes}
                  onChange={(e) => updateSyncMutation.mutate({
                    syncIntervalMinutes: parseInt(e.target.value) || 60,
                  })}
                  disabled={updateSyncMutation.isPending}
                  inputProps={{ min: 15, step: 5 }}
                  helperText="Minimum 15 dakika"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Lisans Bilgisi
                </Typography>
                {settings.license ? (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={`Maksimum Müşteri: ${settings.license.maxB2BCustomers === -1 ? 'Sınırsız' : settings.license.maxB2BCustomers}`}
                        color={settings.license.isActive ? 'success' : 'default'}
                      />
                      <Chip
                        label={`Bitiş Tarihi: ${new Date(settings.license.expiresAt).toLocaleDateString('tr-TR')}`}
                        color={settings.license.isActive ? 'success' : 'default'}
                      />
                    </Box>
                    {!settings.license.isActive && (
                      <Alert severity="warning">Lisansınız aktif değil</Alert>
                    )}
                  </>
                ) : (
                  <Alert severity="warning">Lisans bulunamadı</Alert>
                )}
              </Grid>

              {settings.config.domain && (
                <Grid size={{ xs: 12 }}>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    B2B Portal Erişimi
                  </Typography>
                  <Alert severity="info">
                    Portal adresi: <strong>{settings.config.domain}</strong>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 3: Warehouses */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Depo Görünüm Ayarları</Typography>
              <Button
                variant="outlined"
                onClick={() => fetchWarehousesMutation.mutate()}
                disabled={fetchWarehousesMutation.isPending}
                startIcon={fetchWarehousesMutation.isPending ? <CircularProgress size={16} /> : <CloudUploadIcon />}
              >
                ERP&apos;den Çek
              </Button>
            </Box>

            <DataGrid
              rows={settings.warehouseConfigs.map((w, idx) => ({
                idx,
                ...w,
              }))}
              columns={[
                { field: 'warehouseName', headerName: 'Depo Adı', width: 200 },
                {
                  field: 'displayMode',
                  headerName: 'Görünüm Modu',
                  width: 150,
                  renderCell: (params) => (
                    <Select
                      value={params.row.displayMode}
                      size="small"
                      onChange={(e) => updateWarehouseMutation.mutate({
                        warehouseId: params.row.warehouseId,
                        data: { displayMode: e.target.value },
                      })}
                      disabled={updateWarehouseMutation.isPending}
                    >
                      <MenuItem value="INDIVIDUAL">Bireysel</MenuItem>
                      <MenuItem value="COMBINED">Birleşik</MenuItem>
                    </Select>
                  ),
                },
                {
                  field: 'isActive',
                  headerName: 'Aktif',
                  width: 100,
                  renderCell: (params) => (
                    <Switch
                      checked={params.row.isActive}
                      onChange={(e) => updateWarehouseMutation.mutate({
                        warehouseId: params.row.warehouseId,
                        data: { isActive: e.target.checked },
                      })}
                      disabled={updateWarehouseMutation.isPending}
                    />
                  ),
                },
              ]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Box>
        </TabPanel>

        {/* Tab 4: Delivery Methods */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 2 }}>
            <Typography variant="h6" gutterBottom>
              Teslimat Yöntemleri
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Teslimat yöntemlerini yönetmek için lütfen ana ayarlar sayfasını kullanın.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </StandardPage>
  );
}
