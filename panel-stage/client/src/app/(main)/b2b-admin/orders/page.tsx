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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { B2bDrawerWithActions, StatusChip, RiskBadge, PriceBreakdown } from '@/components/b2b-admin';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
  status: string; // or use B2BOrderStatus if it's a type, but here it's used as value
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

  // Approve order mutation
  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axios.post(`/b2b-admin/orders/${orderId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-orders'] });
      toast.success('Sipariş onaylandı');
      setDrawerOrder(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Onaylama hatası');
    },
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const res = await axios.post(`/b2b-admin/orders/${orderId}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-orders'] });
      toast.success('Sipariş reddedildi');
      setDrawerOrder(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Reddetme hatası');
    },
  });

  // Export to Excel
  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get('/b2b-admin/orders/export', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter },
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `b2b-orders-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Excel indirildi');
    },
    onError: (err: any) => {
      toast.error('Excel indirme hatası');
    },
  });

  const columns: GridColDef<OrderRow>[] = [
    {
      field: 'orderNumber',
      headerName: 'Sipariş No',
      width: 150,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => setDrawerOrder(params.row)}
        >
          {params.row.orderNumber}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Müşteri',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.customer.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.customer.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      renderCell: (params: GridRenderCellParams) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'totalFinalPrice',
      headerName: 'Tutar',
      width: 120,
      align: 'right',
      valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺`,
    },
    {
      field: 'createdAt',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString('tr-TR') : '',
    },
    {
      field: 'riskStatus',
      headerName: 'Risk',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <RiskBadge status={params.row.customer.riskStatus} showLabel={false} />
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Siparişleri"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Siparişler' },
      ]}
      headerActions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportExcelMutation.mutate()}
            disabled={exportExcelMutation.isPending}
          >
            Excel
          </Button>
        </Box>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
        >
          <Tab label="Tümü" value="all" />
          <Tab label={<Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} /> Bekleyen</Box>} value={B2BOrderStatus.PENDING} />
          <Tab label={<Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} /> Onaylı</Box>} value={B2BOrderStatus.APPROVED} />
          <Tab label={<Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} /> Aktarılan</Box>} value={B2BOrderStatus.EXPORTED_TO_ERP} />
          <Tab label={<Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} /> Reddedilen</Box>} value={B2BOrderStatus.REJECTED} />
        </Tabs>
      </Box>

      <DataGrid
        rows={orders}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        disableRowSelectionOnClick
        autoHeight
        loading={isLoading}
        onRowClick={(row) => setDrawerOrder(row.row)}
        sx={{ cursor: 'pointer' }}
      />

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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Lütfen reddetme sebebi girin');
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
        title={`Sipariş #${order.orderNumber}`}
        width={600}
        actions={
          <>
            {order.status === B2BOrderStatus.PENDING && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejecting}
                >
                  Reddet
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={approving ? <CheckCircleIcon /> : undefined}
                  onClick={onApprove}
                  disabled={approving || rejecting}
                >
                  {approving ? 'Onaylanıyor...' : 'Onayla'}
                </Button>
              </>
            )}
            {order.status === B2BOrderStatus.EXPORTED_TO_ERP && order.erpOrderId && (
              <Alert severity="success" sx={{ mr: 'auto' }}>
                ERP Sipariş No: {order.erpOrderId}
              </Alert>
            )}
          </>
        }
      >
        <Grid container spacing={2}>
          {/* Customer & Risk Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Müşteri & Risk
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{order.customer.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {order.customer.email}
                  </Typography>
                </Box>
                <RiskBadge status={order.customer.riskStatus} />
              </Box>
              {order.salesperson && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Satış Temsilcisi: {order.salesperson.name}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Items Table */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Sipariş Kalemleri
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="right">Adet</TableCell>
                    <TableCell align="right">Liste</TableCell>
                    <TableCell align="right">İndirim</TableCell>
                    <TableCell align="right">Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.stockCode}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.listPrice.toFixed(2)} ₺</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {((item.customerClassDiscount + item.campaignDiscount) / item.listPrice * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">{item.finalPrice.toFixed(2)} ₺</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Price Summary */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Fiyat Özeti
            </Typography>
            <PriceBreakdown
              listPrice={order.totalListPrice}
              classDiscount={order.items.reduce((sum, i) => sum + i.customerClassDiscount, 0)}
              classDiscountRate={order.totalListPrice > 0 ? (order.items.reduce((sum, i) => sum + i.customerClassDiscount, 0) / order.totalListPrice * 100) : undefined}
              campaignDiscount={order.items.reduce((sum, i) => sum + i.campaignDiscount, 0)}
              campaignDiscountRate={order.totalListPrice > 0 ? (order.items.reduce((sum, i) => sum + i.campaignDiscount, 0) / order.totalListPrice * 100) : undefined}
              finalPrice={order.totalFinalPrice}
            />
          </Grid>

          {/* Delivery Info */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Teslimat Bilgisi
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Teslimat Yöntemi
                  </Typography>
                  <Typography variant="body2">
                    {order.deliveryMethod?.name || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Teslimat Şubesi
                  </Typography>
                  <Typography variant="body2">
                    {order.deliveryBranchName || '—'}
                  </Typography>
                </Grid>
                {order.note && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">
                      Not
                    </Typography>
                    <Typography variant="body2">{order.note}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </B2bDrawerWithActions>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Siparişi Reddet</DialogTitle>
        <DialogContent>
          <TextField
            id="b2b-order-reject-reason"
            fullWidth
            multiline
            rows={3}
            label="Reddetme Sebebi"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lütfen bu siparişi neden reddettiğinizi açıklayın..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>İptal</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={rejecting}>
            {rejecting ? 'Reddediliyor...' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
