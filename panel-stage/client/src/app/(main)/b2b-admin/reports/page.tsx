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
} from '@mui/material';
import { Download as DownloadIcon, DateRange as DateRangeIcon } from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
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

export default function B2bAdminReportsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);

  // Orders Summary Report
  const { data: ordersSummary = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['b2b-report-orders-summary', dateRange],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/reports/orders-summary', {
        params: { days: parseInt(dateRange) },
      });
      return res.data.data || [];
    },
    enabled: tabValue === 0,
  });

  // By Customer Report
  const { data: byCustomer = [], isLoading: customerLoading } = useQuery({
    queryKey: ['b2b-report-by-customer', dateRange],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/reports/by-customer', {
        params: { days: parseInt(dateRange) },
      });
      return res.data.data || [];
    },
    enabled: tabValue === 1,
  });

  // By Product Report
  const { data: byProduct = [], isLoading: productLoading } = useQuery({
    queryKey: ['b2b-report-by-product', dateRange],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/reports/by-product', {
        params: { days: parseInt(dateRange) },
      });
      return res.data.data || [];
    },
    enabled: tabValue === 2,
  });

  // By Salesperson Report
  const { data: bySalesperson = [], isLoading: salespersonLoading } = useQuery({
    queryKey: ['b2b-report-by-salesperson', dateRange],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/reports/by-salesperson', {
        params: { days: parseInt(dateRange) },
      });
      return res.data.data || [];
    },
    enabled: tabValue === 3,
  });

  // Collections Report
  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['b2b-report-collections', dateRange],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/reports/collections', {
        params: { days: parseInt(dateRange) },
      });
      return res.data.data || [];
    },
    enabled: tabValue === 4,
  });

  const handleExport = async (reportType: string) => {
    setExporting(true);
    try {
      const res = await axios.get('/b2b-admin/reports/orders-summary', {
        params: { days: parseInt(dateRange), format: 'xlsx' },
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `b2b-report-${reportType}-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel indirildi');
    } catch (err) {
      toast.error('Excel indirme hatası');
    } finally {
      setExporting(false);
    }
  };

  const ordersSummaryColumns: GridColDef[] = [
    { field: 'date', headerName: 'Tarih', width: 120, valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('tr-TR') : '' },
    { field: 'totalOrders', headerName: 'Sipariş', width: 100, align: 'right' },
    { field: 'totalRevenue', headerName: 'Ciro', width: 140, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'approvedOrders', headerName: 'Onaylı', width: 100, align: 'right' },
    { field: 'rejectedOrders', headerName: 'Reddedilen', width: 120, align: 'right' },
  ];

  const byCustomerColumns: GridColDef[] = [
    { field: 'customerName', headerName: 'Müşteri', flex: 1 },
    { field: 'totalOrders', headerName: 'Sipariş', width: 100, align: 'right' },
    { field: 'totalRevenue', headerName: 'Ciro', width: 140, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'avgOrderValue', headerName: 'Ortalama', width: 120, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
  ];

  const byProductColumns: GridColDef[] = [
    { field: 'productName', headerName: 'Ürün', flex: 1 },
    { field: 'stockCode', headerName: 'Stok Kodu', width: 130 },
    { field: 'totalQuantity', headerName: 'Adet', width: 100, align: 'right' },
    { field: 'totalRevenue', headerName: 'Ciro', width: 140, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
  ];

  const bySalespersonColumns: GridColDef[] = [
    { field: 'salespersonName', headerName: 'Satış Temsilcisi', flex: 1 },
    { field: 'totalOrders', headerName: 'Sipariş', width: 100, align: 'right' },
    { field: 'totalRevenue', headerName: 'Ciro', width: 140, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
  ];

  const collectionsColumns: GridColDef[] = [
    { field: 'customerName', headerName: 'Müşteri', flex: 1 },
    { field: 'balance', headerName: 'Bakiye', width: 120, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'overdueAmount', headerName: 'Gecikmiş', width: 120, align: 'right', valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺` },
    { field: 'lastPayment', headerName: 'Son Ödeme', width: 140, valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('tr-TR') : '—' },
  ];

  return (
    <StandardPage
      title="B2B Raporları"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Raporlar' },
      ]}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DateRangeIcon sx={{ color: 'text.secondary' }} />
          <TextField
            select
            label="Tarih Aralığı"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="7">Son 7 Gün</MenuItem>
            <MenuItem value="30">Son 30 Gün</MenuItem>
            <MenuItem value="90">Son 90 Gün</MenuItem>
            <MenuItem value="365">Son 1 Yıl</MenuItem>
          </TextField>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExport('summary')}
          disabled={exporting}
        >
          {exporting ? 'İndiriliyor...' : 'Excel'}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Sipariş Özeti" />
          <Tab label="Müşteri Bazlı" />
          <Tab label="Ürün Bazlı" />
          <Tab label="Satış Temsilcisi" />
          <Tab label="Tahsilat" />
        </Tabs>
      </Box>

      {/* Tab 1: Orders Summary */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Toplam Sipariş
                </Typography>
                <Typography variant="h4">
                  {ordersSummary.reduce((sum: any, row: any) => sum + (row.totalOrders || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Toplam Ciro
                </Typography>
                <Typography variant="h4">
                  {ordersSummary.reduce((sum: any, row: any) => sum + (row.totalRevenue || 0), 0).toFixed(2)} ₺
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Onaylanan
                </Typography>
                <Typography variant="h4">
                  {ordersSummary.reduce((sum: any, row: any) => sum + (row.approvedOrders || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="subtitle2">
                  Reddedilen
                </Typography>
                <Typography variant="h4">
                  {ordersSummary.reduce((sum: any, row: any) => sum + (row.rejectedOrders || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <DataGrid
          rows={ordersSummary}
          columns={ordersSummaryColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          autoHeight
          loading={ordersLoading}
        />
      </TabPanel>

      {/* Tab 2: By Customer */}
      <TabPanel value={tabValue} index={1}>
        <DataGrid
          rows={byCustomer}
          columns={byCustomerColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          autoHeight
          loading={customerLoading}
          getRowClassName={(params) =>
            parseFloat(params.row.overdueAmount || 0) > 0 ? 'overdue-row' : ''
          }
          sx={{
            '& .overdue-row': {
              backgroundColor: 'error.light',
            },
          }}
        />
      </TabPanel>

      {/* Tab 3: By Product */}
      <TabPanel value={tabValue} index={2}>
        <DataGrid
          rows={byProduct}
          columns={byProductColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          autoHeight
          loading={productLoading}
        />
      </TabPanel>

      {/* Tab 4: By Salesperson */}
      <TabPanel value={tabValue} index={3}>
        <DataGrid
          rows={bySalesperson}
          columns={bySalespersonColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          autoHeight
          loading={salespersonLoading}
        />
      </TabPanel>

      {/* Tab 5: Collections */}
      <TabPanel value={tabValue} index={4}>
        <DataGrid
          rows={collections}
          columns={collectionsColumns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          autoHeight
          loading={collectionsLoading}
          getRowClassName={(params) =>
            parseFloat(params.row.overdueAmount || 0) > 0 ? 'overdue-row' : ''
          }
          sx={{
            '& .overdue-row': {
              backgroundColor: 'error.light',
            },
          }}
        />
      </TabPanel>
    </StandardPage>
  );
}
