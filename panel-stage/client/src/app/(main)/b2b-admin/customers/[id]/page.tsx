'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Security as RiskIcon,
  AccountBalance as BalanceIcon,
  ListAlt as OrderIcon,
  History as ActivityIcon,
  Email as EmailIcon,
  Fingerprint as IdIcon,
  Today as DateIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { RiskBadge } from '@/components/b2b-admin';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

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

export default function B2bAdminCustomerDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const id = params.id as string;
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    isActive: true,
    vatDays: 0,
    discountGroupId: '',
  });
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['b2b-customer', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch discount groups
  const { data: discountGroups = [] } = useQuery({
    queryKey: ['b2b-discount-groups'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/discount-groups');
      return res.data || [];
    },
  });

  // Sync formData when customer data is loaded
  useEffect(() => {
    if (customer && !isEditing) {
      setFormData({
        email: customer.email || '',
        isActive: customer.isActive ?? true,
        vatDays: customer.vatDays || 0,
        discountGroupId: customer.discountGroupId || '',
      });
    }
  }, [customer, isEditing]);

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.patch(`/b2b-admin/customers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-customer', id] });
      enqueueSnackbar('Müşteri bilgileri güncellendi', { variant: 'success' });
      setIsEditing(false);
    },
  });

  const { data: movements = [], refetch: refetchMovements, isLoading: movementsLoading } = useQuery({
    queryKey: ['b2b-customer-movements', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}/movements`);
      return res.data.data || [];
    },
    enabled: !!id && tabValue === 2,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['b2b-customer-orders', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}/orders`);
      return res.data.data || [];
    },
    enabled: !!id && tabValue === 3,
  });

  if (isLoading) return <StandardPage title="Yükleniyor..." breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Cari Detay' }]}><Box sx={{ py: 10, textAlign: 'center' }}>Veriler hazırlanıyor...</Box></StandardPage>;
  if (error || !customer) return <StandardPage title="Hata" breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Cari Detay' }]}><Alert severity="error">Müşteri kaydı bulunamadı.</Alert></StandardPage>;

  const handleSave = () => {
    updateCustomerMutation.mutate(formData);
  };

  const commonGridProps = {
    pageSizeOptions: [25, 50, 100],
    initialState: { pagination: { paginationModel: { pageSize: 25 } } },
    disableRowSelectionOnClick: true,
    autoHeight: true,
    sx: {
      border: 'none',
      '& .MuiDataGrid-columnHeaders': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' },
      '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 900, fontSize: '0.75rem', letterSpacing: 1, color: 'text.secondary', textTransform: 'uppercase' },
      '& .MuiDataGrid-cell': { borderColor: 'divider' },
      '& .overdue-row': { bgcolor: alpha(theme.palette.error.main, 0.04), color: 'error.main' }
    }
  };

  return (
    <StandardPage
      title={customer.name}
      breadcrumbs={[
        { label: 'B2B Admin', href: '/b2b-admin' },
        { label: 'Müşteriler', href: '/b2b-admin/customers' },
        { label: 'Detay' },
      ]}
      headerActions={
        <Stack direction="row" spacing={1.5}>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} sx={{ fontWeight: 800 }}>İptal</Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={updateCustomerMutation.isPending} sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}>
                {updateCustomerMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </>
          ) : (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}>
              Bilgileri Düzenle
            </Button>
          )}
        </Stack>
      }
    >
      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_: React.SyntheticEvent, v: number) => setTabValue(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { py: 2.5, fontWeight: 800, textTransform: 'none' } }}>
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Müşteri Künyesi" />
          <Tab icon={<RiskIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Risk & Finansal Durum" />
          <Tab icon={<ActivityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Hesap Ekstresi" />
          <Tab icon={<OrderIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Sipariş Geçmişi" />
        </Tabs>

        {/* Tab 1: Info */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4} sx={{ px: 3 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <IdIcon sx={{ fontSize: 18 }} /> SİSTEM KAYIT BİLGİLERİ
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Cari Ünvan (ERP)" value={customer.name} disabled variant="filled" slotProps={{ input: { sx: { fontWeight: 800 } } }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="ERP Entegrasyon ID" value={customer.erpAccountId} disabled variant="filled" slotProps={{ input: { sx: { fontWeight: 700, fontFamily: 'monospace' } } }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth label="Müşteri Sınıfı" value={customer.customerClass?.name || 'VARSAYILAN'} disabled variant="filled" slotProps={{ input: { sx: { fontWeight: 700 } } }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="İskonto Grubu"
                    value={isEditing ? formData.discountGroupId : (customer.discountGroup?.name || 'YOK')}
                    onChange={(e) => setFormData({ ...formData, discountGroupId: e.target.value })}
                    disabled={!isEditing}
                    SelectProps={{ displayEmpty: true }}
                    slotProps={{ input: { sx: { fontWeight: 700 } } }}
                  >
                    <MenuItem value="">Yok</MenuItem>
                    {discountGroups.map((group: any) => (
                      <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="İletişim E-posta (B2B Giriş)" value={isEditing ? formData.email : customer.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} slotProps={{ input: { startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} />, sx: { borderRadius: 2.5, fontWeight: 700 } } }} />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <RiskIcon sx={{ fontSize: 18 }} /> B2B UYGULAMA KURALLARI
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={<Switch checked={isEditing ? formData.isActive : customer.isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })} disabled={!isEditing} color="success" />}
                    label={<Stack><Typography variant="body2" sx={{ fontWeight: 900 }}>Hesap Durumu</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>Müşterinin portala giriş yetkisi</Typography></Stack>}
                  />
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1.5 }}>VARSAYILAN VADE (GÜN)</Typography>
                    <TextField fullWidth type="number" value={isEditing ? formData.vatDays : (customer.vatDays || 0)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, vatDays: parseInt(e.target.value) || 0 })} disabled={!isEditing} slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 900, textAlign: 'center' } } }} />
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}><DateIcon sx={{ fontSize: 14 }} /> SON ETKİLEŞİM</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 950, mt: 0.5 }}>{customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString('tr-TR') : 'Henüz giriş yapmadı'}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Risk */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
              GÜNCEL FİNANSAL TABLO VE RİSK ANALİZİ
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'RİSK SKORU', value: <RiskBadge status={customer.riskStatus || 'OK'} showLabel />, icon: <RiskIcon />, color: 'primary' },
                { label: 'GÜNCEL BAKİYE', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.balance || 0), icon: <BalanceIcon />, color: 'success' },
                { label: 'KREDİ LİMİTİ', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.creditLimit || 0), icon: <SuccessIcon />, color: 'info' },
              ].map((stat, idx) => (
                <Grid size={{ xs: 12, md: 4 }} key={idx}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 2.5, bgcolor: alpha(theme.palette[stat.color as any].main, 0.02) }}>
                    <Box sx={{ p: 1.8, borderRadius: 3, bgcolor: alpha(theme.palette[stat.color as any].main, 0.1), color: `${stat.color}.main`, display: 'flex' }}>{stat.icon}</Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.5 }}>{stat.value}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>{stat.label}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {customer.riskStatus === 'BLOCKED' && (
              <Alert severity="error" icon={<WarningIcon />} sx={{ borderRadius: 4, fontWeight: 800, border: '1.5px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                DİKKAT: Müşteri riskli durumda olduğu için sipariş girişi otomatik olarak engellenmiştir. Tahsilat sonrası manuel olarak aktifleştirilebilir.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Account Movements */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 0 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ px: 3, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>HESAP EKSTRESİ (SON 100 HAREKET)</Typography>
              <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => refetchMovements()} sx={{ borderRadius: 2, fontWeight: 800 }}> VERİLERİ YENİLE</Button>
            </Stack>

            <DataGrid
              rows={movements.map((r: any, i: number) => ({ id: i, ...r }))}
              columns={[
                { field: 'date', headerName: 'Tarih', width: 140, renderCell: (p: GridRenderCellParams) => <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(p.value).toLocaleDateString('tr-TR')}</Typography> },
                { field: 'type', headerName: 'İşlem Tipi', width: 120, renderCell: (p: GridRenderCellParams) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1 }} /> },
                { field: 'description', headerName: 'Açıklama / Belge No', flex: 1, renderCell: (p: GridRenderCellParams) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography> },
                { field: 'debit', headerName: 'Borç', width: 130, align: 'right', renderCell: (p: GridRenderCellParams) => p.value > 0 ? <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'error.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> : '—' },
                { field: 'credit', headerName: 'Alacak', width: 130, align: 'right', renderCell: (p: GridRenderCellParams) => p.value > 0 ? <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'success.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> : '—' },
                { field: 'balance', headerName: 'Bakiye', width: 140, align: 'right', renderCell: (p: GridRenderCellParams) => <Typography sx={{ fontWeight: 950, fontFamily: 'monospace' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
                { field: 'isPastDue', headerName: 'Vade', width: 100, align: 'center', renderCell: (p: GridRenderCellParams) => p.value ? <Chip label="GECİKMİŞ" color="error" size="small" sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.6rem' }} /> : <Chip label="NORMAL" color="success" size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.6rem' }} /> },
              ]}
              loading={movementsLoading}
              getRowClassName={(params: any) => params.row.isPastDue ? 'overdue-row' : ''}
              {...commonGridProps}
            />
          </Box>
        </TabPanel>

        {/* Tab 4: Orders */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, px: 3, mb: 3 }}>B2B PORTALI ÜZERİNDEN VERİLEN SİPARİŞLER</Typography>
            <DataGrid
              rows={orders}
              columns={[
                { field: 'orderNumber', headerName: 'Sipariş No', width: 160, renderCell: (p: GridRenderCellParams) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'primary.main' }}>{p.value}</Typography> },
                { field: 'createdAt', headerName: 'Tarih', width: 140, renderCell: (p: GridRenderCellParams) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(p.value).toLocaleDateString('tr-TR')}</Typography> },
                { field: 'totalFinalPrice', headerName: 'Net Tutar', width: 160, align: 'right', renderCell: (p: GridRenderCellParams) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value || 0)}</Typography> },
                {
                  field: 'status',
                  headerName: 'Durum',
                  width: 150,
                  renderCell: (params: GridRenderCellParams) => {
                    const statusConfig: Record<string, { label: string; color: any }> = {
                      PENDING: { label: 'ONAY BEKLİYOR', color: 'warning' },
                      APPROVED: { label: 'ONAYLANDI', color: 'info' },
                      EXPORTED_TO_ERP: { label: 'ERP AKTARILDI', color: 'success' },
                      REJECTED: { label: 'REDDEDİLDİ', color: 'error' },
                      CANCELLED: { label: 'İPTAL EDİLDİ', color: 'default' },
                    };
                    const config = statusConfig[params.row.status] || { label: params.row.status, color: 'default' };
                    return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.65rem' }} />;
                  },
                },
                {
                  field: 'actions',
                  headerName: '',
                  width: 100,
                  align: 'right',
                  renderCell: (params: GridRenderCellParams) => (
                    <Link href={`/b2b-admin/orders/${params.row.id}`}>
                      <Button size="small" variant="text" color="primary" sx={{ fontWeight: 800 }}>DETAY</Button>
                    </Link>
                  ),
                },
              ]}
              loading={ordersLoading}
              {...commonGridProps}
            />
          </Box>
        </TabPanel>
      </Paper>
    </StandardPage>
  );
}
