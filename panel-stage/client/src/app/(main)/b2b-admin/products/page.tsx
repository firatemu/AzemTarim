'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  alpha,
  useTheme,
  InputAdornment,
  Tooltip,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  BrandingWatermark as BrandIcon,
  PriceCheck as PriceIcon,
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  CheckCircle,
  Error,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { B2bDrawerWithActions, ImageUpload } from '@/components/b2b-admin';
import { ErpProductTransferDialog } from '@/components/b2b-admin/ErpProductTransferDialog';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

type ProductRow = {
  id: string;
  erpProductId: string;
  stockCode: string;
  name: string;
  brand?: string;
  category?: string;
  erpListPrice: number;
  isVisibleInB2B: boolean;
  minOrderQuantity: number;
  imageUrl?: string;
  stocks: Array<{
    warehouseName: string;
    isAvailable: boolean;
    quantity: number | string;
  }>;
  product?: {
    productLocationStocks: Array<{
      warehouseId: string;
      qtyOnHand: number | string;
    }>;
  };
};

export default function B2bAdminProductsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerProduct, setDrawerProduct] = useState<ProductRow | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStartTime, setLastSyncStartTime] = useState<number | null>(null);
  const [addFromErpOpen, setAddFromErpOpen] = useState(false);
  const [syncAnchorEl, setSyncAnchorEl] = useState<null | HTMLElement>(null);

  const handleSyncMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSyncAnchorEl(event.currentTarget);
  };
  const handleSyncMenuClose = () => {
    setSyncAnchorEl(null);
  };
  const handleSyncTrigger = (type: 'PRODUCTS' | 'PRICES' | 'STOCK' | 'FULL') => {
    setSyncAnchorEl(null);
    syncMutation.mutate(type);
  };

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['b2b-products', { search, visibilityFilter }],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (visibilityFilter !== 'all') params.isVisibleInB2B = visibilityFilter === 'visible';
      const res = await axios.get<{ data: ProductRow[] }>('/b2b-admin/products', { params });
      return res.data.data || [];
    },
  });

  // Toggle visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ productId, visible }: { productId: string; visible: boolean }) => {
      const res = await axios.patch(`/b2b-admin/products/${productId}`, { isVisibleInB2B: visible });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      enqueueSnackbar('Ürün görünürlüğü güncellendi', { variant: 'success' });
    },
    onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || 'Hata', { variant: 'error' })
  });

  // Update product info (minOrder, visibility)
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: Partial<ProductRow> }) => {
      const res = await axios.patch(`/b2b-admin/products/${productId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      enqueueSnackbar('Ürün bilgileri güncellendi', { variant: 'success' });
      setDrawerProduct(null);
    },
  });

  // Image Upload Mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ productId, file }: { productId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`/b2b-admin/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      enqueueSnackbar('Ürün görseli başarıyla yüklendi', { variant: 'success' });
    },
  });

  // Image Delete Mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axios.delete(`/b2b-admin/products/${productId}/image`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      enqueueSnackbar('Ürün görseli kaldırıldı', { variant: 'success' });
    },
  });

  // Sync status
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['b2b-sync-status'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/products/sync/status');
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

      // Eğer log'un bitiş zamanı bizim senkronizasyonu başlattığımız zamandan sonraysa
      if (finishedAt > lastSyncStartTime) {
        if (latestLog.status === 'SUCCESS') {
          queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
          enqueueSnackbar('Senkronizasyon tamamlandı, ürün listesi güncellendi.', { variant: 'success' });
        } else {
          enqueueSnackbar('Senkronizasyon başarısız: ' + latestLog.errorMessage, { variant: 'error' });
        }

        setLastSyncStartTime(null);
        setIsSyncing(false);
      }
    }
  }, [syncStatus, lastSyncStartTime, queryClient, enqueueSnackbar]);

  // Sync trigger
  const syncMutation = useMutation({
    mutationFn: async (type: 'PRODUCTS' | 'PRICES' | 'STOCK' | 'FULL' = 'FULL') => {
      setIsSyncing(true);
      setLastSyncStartTime(Date.now());
      const res = await axios.post('/b2b-admin/products/sync', { type });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-sync-status'] });
      enqueueSnackbar(`ERP senkronizasyonu başlatıldı, lütfen bekleyiniz...`, { variant: 'info' });
    },
    onError: (error: any) => {
      setIsSyncing(false);
      setLastSyncStartTime(null);
      enqueueSnackbar('Senkronizasyon başlatılamadı: ' + (error.response?.data?.message || error.message), { variant: 'error' });
    },
  });

  const handleBulkToggle = (visible: boolean) => {
    selectedIds.forEach((id: string) => toggleVisibilityMutation.mutate({ productId: id, visible }));
    setSelectedIds([]);
  };

  const columns: GridColDef<ProductRow>[] = [
    {
      field: 'imageUrl',
      headerName: '',
      width: 80,
      renderCell: (params: GridRenderCellParams<ProductRow>) => (
        <Box sx={{ width: 50, height: 50, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', my: 1 }}>
          {params.row.imageUrl ? (
            <Box component="img" src={params.row.imageUrl} alt={params.row.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon sx={{ fontSize: 24, color: 'text.disabled', opacity: 0.5 }} />
          )}
        </Box>
      ),
    },
    {
      field: 'stockCode',
      headerName: 'Stok Kodu',
      width: 140,
      renderCell: (params: GridRenderCellParams<ProductRow>) => <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>{params.value}</Typography>
    },
    {
      field: 'name',
      headerName: 'Ürün Adı',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<ProductRow>) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, py: 1.5, lineHeight: 1.4 }}>{params.value}</Typography>
      )
    },
    {
      field: 'brand_category',
      headerName: 'Marka / Kategori',
      width: 180,
      renderCell: (params: GridRenderCellParams<ProductRow>) => (
        <Stack spacing={0.25} sx={{ py: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{params.row.brand || 'Markasız'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>{params.row.category || 'Kategorisiz'}</Typography>
        </Stack>
      )
    },
    {
      field: 'erpListPrice',
      headerName: 'Liste Fiyatı',
      width: 130,
      align: 'right',
      renderCell: (params: GridRenderCellParams<ProductRow>) => (
        <Typography variant="body2" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(params.value || 0)}
        </Typography>
      )
    },
    {
      field: 'stocks',
      headerName: 'B2B Stok',
      width: 140,
      renderCell: (params: GridRenderCellParams<ProductRow>) => {
        const stocks = params.row.stocks || [];
        const totalQty = stocks.reduce((acc, s) => acc + Number(s.quantity || 0), 0);
        const isAvailable = totalQty > 0;

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={isAvailable ? totalQty : 'YOK'}
              size="small"
              variant="outlined"
              color={isAvailable ? 'success' : 'error'}
              sx={{ fontWeight: 900, borderRadius: 1.5, fontSize: '0.75rem', height: 20, minWidth: 40 }}
            />
          </Stack>
        );
      },
    },
    {
      field: 'erpStock',
      headerName: 'ERP Stok',
      width: 120,
      renderCell: (params: GridRenderCellParams<ProductRow>) => {
        const erpStocks = params.row.product?.productLocationStocks || [];
        const erpTotalQty = erpStocks.reduce((acc, s) => acc + Number(s.qtyOnHand || 0), 0);

        return (
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: 'monospace' }}>
            {erpTotalQty}
          </Typography>
        );
      },
    },
    {
      field: 'stockDiff',
      headerName: 'Fark',
      width: 100,
      align: 'center',
      renderCell: (params: GridRenderCellParams<ProductRow>) => {
        const b2bQty = (params.row.stocks || []).reduce((acc, s) => acc + Number(s.quantity || 0), 0);
        const erpQty = (params.row.product?.productLocationStocks || []).reduce((acc, s) => acc + Number(s.qtyOnHand || 0), 0);
        const diff = erpQty - b2bQty;

        if (diff === 0) return <CheckCircle sx={{ fontSize: 16, color: 'success.light', opacity: 0.5 }} />;

        return (
          <Tooltip title={`ERP ve B2B stokları arasında ${Math.abs(diff)} birim fark var. Güncelleme yapılması önerilir.`}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'error.main' }}>
              <Error sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 900 }}>{diff > 0 ? `+${diff}` : diff}</Typography>
            </Stack>
          </Tooltip>
        );
      },
    },
    {
      field: 'isVisibleInB2B',
      headerName: 'Pazar',
      width: 100,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.row.isVisibleInB2B ? 'B2B Portalında Görünür' : 'B2B Portalında Gizli'}>
          <IconButton
            size="small"
            onClick={() => toggleVisibilityMutation.mutate({ productId: params.row.id, visible: !params.row.isVisibleInB2B })}
            disabled={toggleVisibilityMutation.isPending}
            sx={{ bgcolor: alpha(params.row.isVisibleInB2B ? theme.palette.success.main : theme.palette.error.main, 0.1) }}
          >
            {params.row.isVisibleInB2B ? <VisibilityIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <VisibilityOffIcon sx={{ fontSize: 18, color: 'error.main' }} />}
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 64,
      align: 'right',
      renderCell: (params: GridRenderCellParams<ProductRow>) => (
        <IconButton size="small" onClick={() => setDrawerProduct(params.row)} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Ürün Yönetimi"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Ürünler' }]}
      headerActions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          {syncStatus?.recentLogs && syncStatus.recentLogs.length > 0 && (
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
          {syncStatus?.lastSyncRequestedAt && (
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
          {syncStatus?.lastSyncedAt && (
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
          <Button
            variant="contained"
            startIcon={isSyncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            endIcon={<KeyboardArrowDown />}
            onClick={handleSyncMenuOpen}
            disabled={isSyncing}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            {isSyncing ? 'Güncelleniyor...' : 'ERP\'den Güncelle'}
          </Button>
          <Menu
            anchorEl={syncAnchorEl}
            open={Boolean(syncAnchorEl)}
            onClose={handleSyncMenuClose}
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
                }
              }
            }}
          >
            <MenuItem onClick={() => handleSyncTrigger('PRODUCTS')}>
              <BrandIcon sx={{ fontSize: 22, color: 'info.main' }} /> Ürün Bilgilerini Güncelle
            </MenuItem>
            <MenuItem onClick={() => handleSyncTrigger('PRICES')}>
              <PriceIcon sx={{ fontSize: 22, color: 'success.main' }} /> Fiyat Bilgilerini Güncelle
            </MenuItem>
            <MenuItem onClick={() => handleSyncTrigger('STOCK')}>
              <InventoryIcon sx={{ fontSize: 22, color: 'warning.main' }} /> Stok Miktarlarını Güncelle
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={() => handleSyncTrigger('FULL')} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <SyncIcon sx={{ fontSize: 22 }} /> Tümünü Güncelle (Tam Senkronizasyon)
            </MenuItem>
          </Menu>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setAddFromErpOpen(true)}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            ERP'den Ekle
          </Button>
        </Stack>
      }
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
        <TextField
          placeholder="Ürün ismi veya stok kodu ile ara..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
            sx: { borderRadius: 2.5, bgcolor: 'background.paper', fontWeight: 600 }
          }}
          sx={{ minWidth: 320 }}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Stack direction="row" spacing={1}>
          <Button
            variant={visibilityFilter === 'all' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setVisibilityFilter('all')}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            Tümü
          </Button>
          <Button
            variant={visibilityFilter === 'visible' ? 'contained' : 'outlined'}
            size="small"
            color="success"
            onClick={() => setVisibilityFilter('visible')}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            Sadece Görünürler
          </Button>
          <Button
            variant={visibilityFilter === 'hidden' ? 'contained' : 'outlined'}
            size="small"
            color="error"
            onClick={() => setVisibilityFilter('hidden')}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            Sadece Gizliler
          </Button>
        </Stack>

        {selectedIds.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button size="small" variant="contained" color="success" onClick={() => handleBulkToggle(true)} sx={{ fontWeight: 900, borderRadius: 2 }}>
              Görünür Yap ({selectedIds.length})
            </Button>
            <Button size="small" variant="contained" color="error" onClick={() => handleBulkToggle(false)} sx={{ fontWeight: 900, borderRadius: 2 }}>
              Gizle ({selectedIds.length})
            </Button>
          </Stack>
        )}
      </Paper>

      {/* Sync Logs */}
      {syncStatus?.recentLogs && syncStatus.recentLogs.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <SyncIcon sx={{ fontSize: 18, color: 'info.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              Son Senkronizasyon Logları
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {syncStatus.recentLogs.slice(0, 3).map((log: any) => (
              <Stack key={log.id} direction="row" spacing={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Chip
                  label={log.status}
                  size="small"
                  color={log.status === 'SUCCESS' ? 'success' : log.status === 'RUNNING' ? 'info' : 'error'}
                  sx={{ fontWeight: 800, minWidth: 80 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {log.syncType}
                </Typography>
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {log.recordsProcessed || 0} işlendi • {log.recordsAdded || 0} eklendi • {log.recordsUpdated || 0} güncellendi
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {log.finishedAt ? new Date(log.finishedAt).toLocaleString('tr-TR') : 'Devam ediyor...'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

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
        '& .hidden-row': { bgcolor: alpha(theme.palette.action.disabledBackground, 0.4), color: 'text.disabled' }
      }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={isLoading}
          checkboxSelection
          onRowSelectionModelChange={(newSelection: any) => setSelectedIds(newSelection as string[])}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          getRowClassName={(params: any) => !params.row.isVisibleInB2B ? 'hidden-row' : ''}
          sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' } }}
        />
      </Box>

      {/* Product Detail Drawer */}
      {drawerProduct && (
        <ProductDrawer
          product={drawerProduct}
          onClose={() => setDrawerProduct(null)}
          onUpdate={(data) => updateProductMutation.mutate({ productId: drawerProduct.id, data })}
          onUploadImage={(file) => uploadImageMutation.mutateAsync({ productId: drawerProduct.id, file })}
          onDeleteImage={() => deleteImageMutation.mutateAsync(drawerProduct.id)}
          loading={updateProductMutation.isPending || uploadImageMutation.isPending || deleteImageMutation.isPending}
        />
      )}

      {/* Add from ERP Dialog */}
      <ErpProductTransferDialog
        open={addFromErpOpen}
        onClose={() => setAddFromErpOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
        }}
      />
    </StandardPage>
  );
}

interface ProductDrawerProps {
  product: ProductRow;
  onClose: () => void;
  onUpdate: (data: Partial<ProductRow>) => void;
  onUploadImage: (file: File) => Promise<any>;
  onDeleteImage: () => Promise<any>;
  loading: boolean;
}

function ProductDrawer({ product, onClose, onUpdate, onUploadImage, onDeleteImage, loading }: ProductDrawerProps) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [minOrderQuantity, setMinOrderQuantity] = useState(product.minOrderQuantity || 1);
  const [isVisibleInB2B, setIsVisibleInB2B] = useState(product.isVisibleInB2B);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.imageUrl || null);

  const handleSave = async () => {
    try {
      // 1. If image removed or changed
      if (product.imageUrl && !previewUrl) {
        await onDeleteImage();
      } else if (selectedFile) {
        console.log('Uploading image for product:', product.id);
        await onUploadImage(selectedFile);
      }

      // 2. Update other fields
      onUpdate({
        minOrderQuantity,
        isVisibleInB2B,
      });

      // Note: onUpdate handles its own success notification
    } catch (e: any) {
      console.error('B2B Admin Product Save error', e);
      enqueueSnackbar(e?.response?.data?.message || 'Değişiklikler kaydedilirken bir hata oluştu', { variant: 'error' });
    }
  };

  return (
    <B2bDrawerWithActions
      open={!!product}
      onClose={onClose}
      title={<Stack direction="row" spacing={1} alignItems="center"><InventoryIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>Ürün Detay & B2B Ayarları</Typography></Stack>}
      width={550}
      actions={
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button onClick={onClose} sx={{ fontWeight: 800 }}>Vazgeç</Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={loading}
            sx={{ fontWeight: 900, borderRadius: 2.5 }}
          >
            {loading ? 'İşleniyor...' : 'Değişiklikleri Uygula'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        {/* Core Info */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}><InventoryIcon sx={{ fontSize: 14 }} /> STOK VE ERP TANIMI</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>{product.name}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>{product.stockCode}</Typography>
            </Box>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>MARKA</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{product.brand || 'Belirtilmemiş'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>KATEGORİ</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{product.category || 'Belirtilmemiş'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>LİSTE FİYATI (KDV DAHİL)</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', fontFamily: 'monospace' }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.erpListPrice || 0)}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* B2B Visual Settings */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon sx={{ fontSize: 18 }} /> ÜRÜN GÖRSELLERİ
          </Typography>
          <ImageUpload
            value={previewUrl}
            onChange={(file) => {
              setSelectedFile(file);
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            accept="image/*"
            height={240}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, textAlign: 'center' }}>
            Görsel yüklendiğinde anında B2B arayüzüne yansır. Önerilen boyut 800x800px.
          </Typography>
        </Box>

        {/* B2B Visibility & Flow Settings */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ fontSize: 18 }} /> B2B SATIŞ KURALLARI
          </Typography>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={3}>
              <FormControlLabel
                control={<Switch checked={isVisibleInB2B} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsVisibleInB2B(e.target.checked)} color="success" />}
                label={<Typography sx={{ fontWeight: 800 }}>B2B Portalında Yayına Al</Typography>}
              />
              <TextField
                fullWidth
                type="number"
                label="Minimum Sipariş Adedi"
                value={minOrderQuantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinOrderQuantity(Number(e.target.value))}
                slotProps={{ input: { min: 1, sx: { fontWeight: 900, borderRadius: 2.5 } } }}
              />
            </Stack>
          </Paper>
        </Box>

        {/* Warehouse Stocks */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5 }}>DEPO BAZLI STOK DURUMU (YALNIZCA OKUMA)</Typography>
          <Grid container spacing={1.5}>
            {(product.stocks || []).map((stock, idx) => (
              <Grid size={{ xs: 6 }} key={idx}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>{stock.warehouseName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: Number(stock.quantity || 0) > 0 ? 'success.main' : 'error.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 800, color: Number(stock.quantity || 0) > 0 ? 'success.main' : 'error.main' }}>
                          {Number(stock.quantity || 0) > 0 ? 'STOKTA VAR' : 'STOK TÜKENDİ'}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                        {Number(stock.quantity || 0)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </B2bDrawerWithActions>
  );
}
