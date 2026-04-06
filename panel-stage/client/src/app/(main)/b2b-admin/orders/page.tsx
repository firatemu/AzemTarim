'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  LocalShipping as DeliveryIcon,
  AccountCircle as UserIcon,
  AccessTime as PendingIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { B2bDrawerWithActions, StatusChip, RiskBadge, PriceBreakdown } from '@/components/b2b-admin';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { B2BOrderStatus } from '@/types/b2b';

type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    riskStatus: 'OK' | 'OVER_LIMIT' | 'OVERDUE' | 'BLOCKED';
  };
  salesperson?: {
    name: string;
  };
  status: string;
  totalListPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
  items: Array<{
    id: string;
    productName: string;
    stockCode: string;
    quantity: number;
    listPrice: number;
    customerClassDiscount: number;
    campaignDiscount: number;
    finalPrice: number;
  }>;
  deliveryMethod?: {
    name: string;
  };
  deliveryBranchName?: string;
  note?: string;
  erpOrderId?: string;
};

export default function B2bAdminOrdersPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [drawerOrder, setDrawerOrder] = useState<OrderRow | null>(null);
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['b2b-orders', { statusFilter }],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await axios.get<{ data: OrderRow[] }>('/b2b-admin/orders', { params });
      return res.data.data || [];
    },
  });

  // Approve order
  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axios.post(`/b2b-admin/orders/${orderId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-orders'] });
      enqueueSnackbar('Sipariş başarıyla onaylandı ve ERP\'ye kuyruğa alındı.', { variant: 'success' });
      setDrawerOrder(null);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || 'Onaylama hatası', { variant: 'error' });
    },
  });

  // Reject order
  const rejectOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const res = await axios.post(`/b2b-admin/orders/${orderId}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-orders'] });
      enqueueSnackbar('Sipariş reddedildi.', { variant: 'success' });
      setDrawerOrder(null);
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.response?.data?.message || 'Reddetme hatası', { variant: 'error' });
    },
  });

  // Export
  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get('/b2b-admin/orders/export', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter },
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `b2b-siparisler-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
    },
    onSuccess: () => enqueueSnackbar('Excel raporu hazırlandı', { variant: 'success' }),
    onError: () => enqueueSnackbar('Excel indirme hatası', { variant: 'error' }),
  });

  const columns: GridColDef<OrderRow>[] = [
    {
      field: 'orderNumber',
      headerName: 'Sipariş No',
      width: 160,
      renderCell: (params) => (
        <Stack sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setDrawerOrder(params.row)}>
            {params.row.orderNumber}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {new Date(params.row.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'customer',
      headerName: 'Müşteri & İletişim',
      flex: 1,
      minWidth: 240,
      renderCell: (params: GridRenderCellParams) => (
        <Stack spacing={0.25} sx={{ py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{params.row.customer.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <UserIcon sx={{ fontSize: 12 }} /> {params.row.customer.email}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'itemsCount',
      headerName: 'Kalem',
      width: 80,
      align: 'center',
      renderCell: (params) => <Chip label={params.row.items.length} size="small" variant="outlined" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params: GridRenderCellParams) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'totalFinalPrice',
      headerName: 'Toplam Tutar',
      width: 140,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value || 0)}
        </Typography>
      )
    },
    {
      field: 'riskStatus',
      headerName: 'Risk',
      width: 80,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <RiskBadge status={params.row.customer.riskStatus} showLabel={false} />
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Sipariş Yönetimi"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Siparişler' }]}
      headerActions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => exportExcelMutation.mutate()}
            disabled={exportExcelMutation.isPending}
            sx={{ fontWeight: 800, borderRadius: 3 }}
          >
            Excel Dökümü
          </Button>
          <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main', borderRadius: 2 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <Paper variant="outlined" sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { fontWeight: 800, minHeight: 64, textTransform: 'none', fontSize: '0.9rem' }
          }}
        >
          <Tab label="Tümü" value="all" />
          <Tab icon={<PendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Bekleyenler" value={B2BOrderStatus.PENDING} />
          <Tab icon={<CheckIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Onaylı" value={B2BOrderStatus.APPROVED} />
          <Tab icon={<ReceiptIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="ERP'ye Aktarılan" value={B2BOrderStatus.EXPORTED_TO_ERP} />
          <Tab icon={<ErrorIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Reddedilen" value={B2BOrderStatus.REJECTED} />
        </Tabs>
      </Paper>

      <Box sx={{
        height: 650,
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        '& .MuiDataGrid-root': { border: 'none' },
        '& .MuiDataGrid-columnHeaders': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' },
        '& .MuiDataGrid-cell': { borderColor: 'divider' },
      }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          onRowClick={(row) => setDrawerOrder(row.row)}
          sx={{ cursor: 'pointer', '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' } }}
        />
      </Box>

      {/* Order Detail Drawer */}
      {drawerOrder && (
        <OrderDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onApprove={() => approveOrderMutation.mutate(drawerOrder.id)}
          onReject={(reason) => rejectOrderMutation.mutate({ orderId: drawerOrder.id, reason })}
          approving={approveOrderMutation.isPending}
          rejecting={rejectOrderMutation.isPending}
        />
      )}
    </StandardPage>
  );
}

interface OrderDrawerProps {
  order: OrderRow;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  approving: boolean;
  rejecting: boolean;
}

function OrderDrawer({ order, onClose, onApprove, onReject, approving, rejecting }: OrderDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) {
      enqueueSnackbar('Lütfen reddetme sebebi girin', { variant: 'error' });
      return;
    }
    onReject(rejectReason);
    setRejectDialogOpen(false);
  };

  return (
    <>
      <B2bDrawerWithActions
        open={!!order}
        onClose={onClose}
        title={<Stack direction="row" spacing={1} alignItems="center">
          <ReceiptIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Sipariş #{order.orderNumber}</Typography>
        </Stack>}
        width={700}
        actions={
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            {order.status === B2BOrderStatus.PENDING && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejecting}
                  sx={{ fontWeight: 800, borderRadius: 2.5 }}
                >
                  Siparişi Reddet
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={approving ? undefined : <CheckIcon />}
                  onClick={onApprove}
                  disabled={approving || rejecting}
                  sx={{ fontWeight: 900, borderRadius: 2.5, flex: 1 }}
                >
                  {approving ? 'Onaylanıyor...' : 'Onayla ve ERP\'ye Aktar'}
                </Button>
              </>
            )}
            {order.status === B2BOrderStatus.EXPORTED_TO_ERP && order.erpOrderId && (
              <Alert icon={<CheckIcon sx={{ color: 'success.main' }} />} severity="success" sx={{ flex: 1, borderRadius: 2.5, fontWeight: 800 }}>
                ERP AKTARIMI BAŞARILI (Belge No: {order.erpOrderId})
              </Alert>
            )}
            {(order.status === B2BOrderStatus.APPROVED || order.status === B2BOrderStatus.PENDING) && (
              <IconButton onClick={onClose} sx={{ ml: 'auto' }}><CancelIcon /></IconButton>
            )}
          </Stack>
        }
      >
        <Stack spacing={4}>
          {/* Customer Card */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>MÜŞTERİ BİLGİLERİ</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{order.customer.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.customer.email}</Typography>
                {order.salesperson && (
                  <Typography variant="caption" sx={{ fontWeight: 700, mt: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <UserIcon sx={{ fontSize: 14 }} /> Temsilci: {order.salesperson.name}
                  </Typography>
                )}
              </Stack>
              <RiskBadge status={order.customer.riskStatus} />
            </Stack>
          </Paper>

          {/* Items Table */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewIcon sx={{ fontSize: 18 }} /> SİPARİŞ KALEMLERİ
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Ürün</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Miktar</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Birim</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Net Tutar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.productName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{item.stockCode}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900 }}>{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{item.listPrice.toFixed(2)} ₺</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: 'primary.main' }}>{item.finalPrice.toFixed(2)} ₺</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Pricing Details */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5 }}>FİYATLANDIRMA DETAYLARI</Typography>
            <PriceBreakdown
              listPrice={order.totalListPrice}
              classDiscount={order.items.reduce((sum, i) => sum + i.customerClassDiscount, 0)}
              classDiscountRate={order.totalListPrice > 0 ? (order.items.reduce((sum, i) => sum + i.customerClassDiscount, 0) / order.totalListPrice * 100) : undefined}
              campaignDiscount={order.items.reduce((sum, i) => sum + i.campaignDiscount, 0)}
              campaignDiscountRate={order.totalListPrice > 0 ? (order.items.reduce((sum, i) => sum + i.campaignDiscount, 0) / order.totalListPrice * 100) : undefined}
              finalPrice={order.totalFinalPrice}
            />
          </Box>

          {/* Delivery & Logistics */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeliveryIcon sx={{ fontSize: 18 }} /> TESLİMAT & LOJİSTİK
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>TESLİMAT YÖNTEMİ</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.deliveryMethod?.name || 'Belirtilmedi'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>TESLİMAT NOKTASI / ŞUBE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.deliveryBranchName || 'Merkez Depo'}</Typography>
                </Grid>
                {order.note && (
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>MÜŞTERİ NOTU</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04), fontStyle: 'italic' }}>
                      "{order.note}"
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        </Stack>
      </B2bDrawerWithActions>

      {/* Reject Modal */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Siparişi Reddet</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reddetme Gerekçesi"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Müşteriye iletilecek reddetme sebebini yazın..."
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            Siparişi reddettiğinizde bu işlem geri alınamaz ve müşteriye bildirim gönderilir.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ fontWeight: 700 }}>Vazgeç</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={rejecting} sx={{ fontWeight: 900, borderRadius: 2.5, px: 4 }}>
            Onayla ve Reddet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
