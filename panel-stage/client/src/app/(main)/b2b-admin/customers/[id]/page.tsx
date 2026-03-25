'use client';

import { useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { RiskBadge, PriceBreakdown } from '@/components/b2b-admin';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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

export default function B2bAdminCustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch customer details
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['b2b-customer', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.patch(`/b2b-admin/customers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-customer', id] });
      toast.success('Müşteri güncellendi');
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Güncelleme hatası');
    },
  });

  // Fetch account movements
  const { data: movements = [], refetch: refetchMovements } = useQuery({
    queryKey: ['b2b-customer-movements', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}/movements`);
      return res.data.data || [];
    },
    enabled: !!id && tabValue === 2,
  });

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['b2b-customer-orders', id],
    queryFn: async () => {
      const res = await axios.get(`/b2b-admin/customers/${id}/orders`);
      return res.data.data || [];
    },
    enabled: !!id && tabValue === 3,
  });

  if (isLoading) {
    return (
      <StandardPage
        title="Müşteri Detayı"
        breadcrumbs={[
          { label: 'B2B Yönetimi', href: '/b2b-admin' },
          { label: 'Müşteriler', href: '/b2b-admin/customers' },
          { label: id },
        ]}
      >
        <Box display="flex" justifyContent="center" p={4}>
          Yükleniyor...
        </Box>
      </StandardPage>
    );
  }

  if (error || !customer) {
    return (
      <StandardPage
        title="Müşteri Detayı"
        breadcrumbs={[
          { label: 'B2B Yönetimi', href: '/b2b-admin' },
          { label: 'Müşteriler', href: '/b2b-admin/customers' },
          { label: id },
        ]}
      >
        <Alert severity="error">Müşteri bulunamadı</Alert>
      </StandardPage>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = () => {
    updateCustomerMutation.mutate({
      email: customer.email,
      customerClassId: customer.customerClassId,
      vatDays: customer.vatDays,
      isActive: customer.isActive,
    });
  };

  const movementColumns: GridColDef[] = [
    { field: 'date', headerName: 'Tarih', width: 120, valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('tr-TR') : '' },
    { field: 'type', headerName: 'Tip', width: 100 },
    { field: 'description', headerName: 'Açıklama', flex: 1 },
    { field: 'debit', headerName: 'Borç', width: 100, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'credit', headerName: 'Alacak', width: 100, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'balance', headerName: 'Bakiye', width: 120, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    {
      field: 'isPastDue',
      headerName: 'Vade',
      width: 100,
      renderCell: (params) => (
        params.row.isPastDue ? (
          <Chip label="Gecikmiş" size="small" color="error" />
        ) : (
          <Chip label="Normal" size="small" color="success" />
        )
      ),
    },
  ];

  const orderColumns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Sipariş No', width: 150 },
    { field: 'createdAt', headerName: 'Tarih', width: 120, valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('tr-TR') : '' },
    { field: 'totalFinalPrice', headerName: 'Tutar', width: 120, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      renderCell: (params) => {
        const statusConfig: Record<string, { label: string; color: any }> = {
          PENDING: { label: 'Bekliyor', color: 'warning' },
          APPROVED: { label: 'Onaylandı', color: 'info' },
          EXPORTED_TO_ERP: { label: 'Aktarıldı', color: 'success' },
          REJECTED: { label: 'Reddedildi', color: 'error' },
          CANCELLED: { label: 'İptal', color: 'default' },
        };
        const config = statusConfig[params.row.status] || { label: params.row.status, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      renderCell: (params) => (
        <Link href={`/b2b-admin/orders/${params.row.id}`}>
          <Button size="small">Detay</Button>
        </Link>
      ),
    },
  ];

  return (
    <StandardPage
      title={customer.name}
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Müşteriler', href: '/b2b-admin/customers' },
        { label: customer.name },
      ]}
    >
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="Bilgiler" />
          <Tab label="Risk Durumu" />
          <Tab label="Hareketler" />
          <Tab label="Siparişler" />
        </Tabs>

        {/* Tab 1: Info */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2, maxWidth: 800 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Müşteri Bilgileri</Typography>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setIsEditing(false)}
                    disabled={updateCustomerMutation.isPending}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={updateCustomerMutation.isPending}
                  >
                    Kaydet
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Düzenle
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Müşteri Adı"
                  value={customer.name}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="ERP Hesap ID"
                  value={customer.erpAccountId}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="E-posta"
                  value={customer.email}
                  onChange={(e) => (customer.email = e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={customer.isActive}
                      onChange={(e) => (customer.isActive = e.target.checked)}
                      disabled={!isEditing}
                    />
                  }
                  label="Aktif"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Vade Günleri"
                  value={customer.vatDays}
                  onChange={(e) => (customer.vatDays = parseInt(e.target.value))}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Son Giriş"
                  value={customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString('tr-TR') : '—'}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 2: Risk */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Risk Durumu</Typography>
              <IconButton onClick={() => queryClient.invalidateQueries({ queryKey: ['b2b-customer', id] })}>
                <RefreshIcon />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Risk Durumu
                    </Typography>
                    <RiskBadge status={customer.riskStatus || 'OK'} showLabel />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Bakiye
                    </Typography>
                    <Typography variant="h5">
                      {customer.balance?.toFixed(2)} ₺
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      Kredi Limiti
                    </Typography>
                    <Typography variant="h5">
                      {customer.creditLimit?.toFixed(2)} ₺
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {customer.riskStatus === 'BLOCKED' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Bu müşteri riskli durumda olduğu için sipariş girişi engellenmiştir.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Account Movements */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Cari Hareketleri</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetchMovements()}
              >
                Yenile
              </Button>
            </Box>

            <DataGrid
              rows={movements}
              columns={movementColumns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableRowSelectionOnClick
              autoHeight
              getRowClassName={(params) =>
                params.row.isPastDue ? 'overdue-row' : ''
              }
              sx={{
                '& .overdue-row': {
                  backgroundColor: 'error.light',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    opacity: 0.8,
                  },
                },
              }}
            />
          </Box>
        </TabPanel>

        {/* Tab 4: Orders */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sipariş Geçmişi
            </Typography>

            <DataGrid
              rows={orders}
              columns={orderColumns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableRowSelectionOnClick
              autoHeight
            />
          </Box>
        </TabPanel>
      </Paper>
    </StandardPage>
  );
}
