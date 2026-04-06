'use client';

import { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stack,
  alpha,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  UserCircle as UserIcon,
  Payments as PaymentIcon,
  Assignment as OrderIcon,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
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

export default function B2bAdminReportsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);

  // Queries for different reports
  const fetchReport = async (path: string) => {
    const res = await axios.get(`/b2b-admin/reports/${path}`, { params: { days: parseInt(dateRange) } });
    return res.data.data || [];
  };

  const { data: ordersSummary = [], isLoading: ordersLoading } = useQuery({ queryKey: ['b2b-report-orders-summary', dateRange], queryFn: () => fetchReport('orders-summary'), enabled: tabValue === 0 });
  const { data: byCustomer = [], isLoading: customerLoading } = useQuery({ queryKey: ['b2b-report-by-customer', dateRange], queryFn: () => fetchReport('by-customer'), enabled: tabValue === 1 });
  const { data: byProduct = [], isLoading: productLoading } = useQuery({ queryKey: ['b2b-report-by-product', dateRange], queryFn: () => fetchReport('by-product'), enabled: tabValue === 2 });
  const { data: bySalesperson = [], isLoading: salespersonLoading } = useQuery({ queryKey: ['b2b-report-by-salesperson', dateRange], queryFn: () => fetchReport('by-salesperson'), enabled: tabValue === 3 });
  const { data: collections = [], isLoading: collectionsLoading } = useQuery({ queryKey: ['b2b-report-collections', dateRange], queryFn: () => fetchReport('collections'), enabled: tabValue === 4 });

  const handleExport = async () => {
    setExporting(true);
    try {
      const paths = ['orders-summary', 'by-customer', 'by-product', 'by-salesperson', 'collections'];
      const res = await axios.get(`/b2b-admin/reports/${paths[tabValue]}`, { params: { days: parseInt(dateRange), format: 'xlsx' }, responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `b2b-rapor-${paths[tabValue]}-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click();
      enqueueSnackbar('Rapor indirildi', { variant: 'success' });
    } catch (err) { enqueueSnackbar('İndirme hatası', { variant: 'error' }); } finally { setExporting(false); }
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
      '& .overdue-row': { bgcolor: alpha(theme.palette.error.main, 0.04), color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.06) } }
    }
  };

  return (
    <StandardPage
      title="B2B Performans Raporları"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Raporlar' }]}
      headerActions={
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
            variant="outlined"
            slotProps={{ input: { startAdornment: <DateRangeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />, sx: { borderRadius: 3, fontWeight: 800, bgcolor: 'background.paper', minWidth: 160 } } }}
          >
            <MenuItem value="7">Son 7 Gün</MenuItem>
            <MenuItem value="30">Son 30 Gün</MenuItem>
            <MenuItem value="90">Son 90 Gün</MenuItem>
            <MenuItem value="365">Son 1 Yıl</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={exporting}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            {exporting ? 'Hazırlanıyor...' : 'Excel Raporu'}
          </Button>
        </Stack>
      }
    >
      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', mb: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { py: 2.5, fontWeight: 800, textTransform: 'none', fontSize: '0.9rem' }
          }}
        >
          <Tab icon={<TrendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Sipariş Analizi" />
          <Tab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Müşteri Performansı" />
          <Tab icon={<InventoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="En Çok Satan Ürünler" />
          <Tab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Plasiyer Verimliliği" />
          <Tab icon={<PaymentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tahsilat Durumu" />
        </Tabs>
      </Paper>

      {/* Tab 1: Orders Summary */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'TOPLAM SİPARİŞ', value: ordersSummary.reduce((s: any, r: any) => s + (r.totalOrders || 0), 0), icon: <OrderIcon />, color: 'primary' },
            { label: 'TOPLAM CİRO', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(ordersSummary.reduce((s: any, r: any) => s + (r.totalRevenue || 0), 0)), icon: <TrendingIcon />, color: 'success' },
            { label: 'ONAYLI SİPARİŞ', value: ordersSummary.reduce((s: any, r: any) => s + (r.approvedOrders || 0), 0), icon: <TrendingIcon />, color: 'info' },
            { label: 'REDDEDİLEN', value: ordersSummary.reduce((s: any, r: any) => s + (r.rejectedOrders || 0), 0), icon: <TrendingIcon />, color: 'error' },
          ].map((stat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, bgcolor: alpha(theme.palette[stat.color as any].main, 0.02), display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha(theme.palette[stat.color as any].main, 0.1), color: `${stat.color}.main`, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -1 }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>{stat.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <DataGrid
            rows={ordersSummary.map((r: any, i: any) => ({ id: i, ...r }))}
            columns={[
              { field: 'date', headerName: 'İşlem Tarihi', flex: 1, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(p.value).toLocaleDateString('tr-TR')}</Typography> },
              { field: 'totalOrders', headerName: 'Sipariş', width: 120, align: 'center', renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1 }} /> },
              { field: 'totalRevenue', headerName: 'Ciro', width: 160, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
              { field: 'approvedOrders', headerName: 'Onaylı', width: 120, align: 'center', renderCell: (p) => <Typography sx={{ fontWeight: 800, color: 'success.main' }}>{p.value}</Typography> },
              { field: 'rejectedOrders', headerName: 'Reddedilen', width: 120, align: 'center', renderCell: (p) => <Typography sx={{ fontWeight: 800, color: 'error.main' }}>{p.value}</Typography> },
            ]}
            loading={ordersLoading}
            {...commonGridProps}
          />
        </Paper>
      </TabPanel>

      {/* Tab 2: By Customer */}
      <TabPanel value={tabValue} index={1}>
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <DataGrid
            rows={byCustomer.map((r: any, i: any) => ({ id: i, ...r }))}
            columns={[
              { field: 'customerName', headerName: 'Müşteri Ünvanı', flex: 1, renderCell: (p) => <Typography variant="subtitle2" sx={{ fontWeight: 900, py: 1.5 }}>{p.value}</Typography> },
              { field: 'totalOrders', headerName: 'Sipariş', width: 120, align: 'center', renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} /> },
              { field: 'totalRevenue', headerName: 'Toplam Ciro', width: 180, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'primary.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
              { field: 'avgOrderValue', headerName: 'Ort. Sepet', width: 160, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
            ]}
            loading={customerLoading}
            {...commonGridProps}
          />
        </Paper>
      </TabPanel>

      {/* Tab 3: By Product */}
      <TabPanel value={tabValue} index={2}>
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <DataGrid
            rows={byProduct.map((r: any, i: any) => ({ id: i, ...r }))}
            columns={[
              { field: 'productName', headerName: 'Ürün Tanımı', flex: 1, renderCell: (p) => <Typography variant="subtitle2" sx={{ fontWeight: 900, py: 1.5 }}>{p.value}</Typography> },
              { field: 'stockCode', headerName: 'Stok Kodu', width: 180, renderCell: (p) => <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>{p.value}</Typography> },
              { field: 'totalQuantity', headerName: 'Adet', width: 120, align: 'center', renderCell: (p) => <Chip label={p.value} size="small" sx={{ fontWeight: 900, borderRadius: 1.5 }} /> },
              { field: 'totalRevenue', headerName: 'Toplam Ciro', width: 180, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'success.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
            ]}
            loading={productLoading}
            {...commonGridProps}
          />
        </Paper>
      </TabPanel>

      {/* Tab 4: By Salesperson */}
      <TabPanel value={tabValue} index={3}>
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <DataGrid
            rows={bySalesperson.map((r: any, i: any) => ({ id: i, ...r }))}
            columns={[
              { field: 'salespersonName', headerName: 'Satış Temsilcisi', flex: 1, renderCell: (p) => <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{p.value || 'Tanımsız'}</Typography> },
              { field: 'totalOrders', headerName: 'Sipariş', width: 150, align: 'center', renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} /> },
              { field: 'totalRevenue', headerName: 'Yönetilen Ciro', width: 200, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'primary.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
            ]}
            loading={salespersonLoading}
            {...commonGridProps}
          />
        </Paper>
      </TabPanel>

      {/* Tab 5: Collections */}
      <TabPanel value={tabValue} index={4}>
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <DataGrid
            rows={collections.map((r: any, i: any) => ({ id: i, ...r }))}
            columns={[
              { field: 'customerName', headerName: 'Müşteri', flex: 1, renderCell: (p) => <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{p.value}</Typography> },
              { field: 'balance', headerName: 'Güncel Bakiye', width: 160, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
              { field: 'overdueAmount', headerName: 'Gecikmiş Tutar', width: 160, align: 'right', renderCell: (p) => <Typography sx={{ fontWeight: 900, fontFamily: 'monospace', color: p.value > 0 ? 'error.main' : 'success.main' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value)}</Typography> },
              { field: 'lastPayment', headerName: 'Son Ödeme Tarihi', width: 180, renderCell: (p) => <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>{p.value ? new Date(p.value).toLocaleDateString('tr-TR') : '—'}</Typography> },
            ]}
            loading={collectionsLoading}
            getRowClassName={(params) => params.row.overdueAmount > 0 ? 'overdue-row' : ''}
            {...commonGridProps}
          />
        </Paper>
      </TabPanel>
    </StandardPage>
  );
}
