'use client';

import { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { B2bDrawerWithActions } from '@/components/b2b-admin';
import { ImageUpload } from '@/components/b2b-admin';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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
  }>;
};

export default function B2bAdminProductsPage() {
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerProduct, setDrawerProduct] = useState<ProductRow | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const queryClient = useQueryClient();

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

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ productId, visible }: { productId: string; visible: boolean }) => {
      const res = await axios.patch(`/b2b-admin/products/${productId}`, {
        isVisibleInB2B: visible,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      toast.success('Görünürlük güncellendi');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Güncelleme hatası');
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const res = await axios.patch(`/b2b-admin/products/${productId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      toast.success('Ürün güncellendi');
      setDrawerProduct(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Güncelleme hatası');
    },
  });

  // Sync status query
  const { data: syncStatus } = useQuery({
    queryKey: ['b2b-sync-status'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/products/sync/status');
      return res.data;
    },
    refetchInterval: 30000, // 30 saniyede bir güncelle
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/b2b-admin/products/sync');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-products'] });
      queryClient.invalidateQueries({ queryKey: ['b2b-sync-status'] });
      toast.success('Ürün senkronizasyonu başlatıldı');
      setIsSyncing(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Senkronizasyon hatası');
      setIsSyncing(false);
    },
  });

  // Bulk visibility toggle
  const handleBulkToggle = (visible: boolean) => {
    selectedIds.forEach((id) => {
      toggleVisibilityMutation.mutate({ productId: id, visible });
    });
    setSelectedIds([]);
  };

  const columns: GridColDef<ProductRow>[] = [
    {
      field: 'imageUrl',
      headerName: '',
      width: 80,
      renderCell: (params) => (
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'grey.100',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {params.row.imageUrl ? (
            <Box
              component="img"
              src={params.row.imageUrl}
              alt={params.row.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
            />
          ) : (
            <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
          )}
        </Box>
      ),
    },
    {
      field: 'stockCode',
      headerName: 'Stok Kodu',
      width: 130,
    },
    {
      field: 'name',
      headerName: 'Ürün Adı',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'brand',
      headerName: 'Marka',
      width: 120,
    },
    {
      field: 'category',
      headerName: 'Kategori',
      width: 120,
    },
    {
      field: 'erpListPrice',
      headerName: 'Liste Fiyatı',
      width: 120,
      align: 'right',
      valueFormatter: (value: any) => `${Number(value || 0).toFixed(2)} ₺`,
    },
    {
      field: 'stocks',
      headerName: 'Stok',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const stocks = params.row.stocks || [];
        const availableCount = stocks.filter((s: any) => s.isAvailable).length;
        const totalCount = stocks.length;

        return (
          <Box>
            <Chip
              label={availableCount > 0 ? 'Stokta' : 'Stok Yok'}
              size="small"
              color={availableCount > 0 ? 'success' : 'error'}
            />
            <Typography variant="caption" display="block" color="textSecondary">
              {availableCount}/{totalCount} depo
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'isVisibleInB2B',
      headerName: 'Görünürlük',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => toggleVisibilityMutation.mutate({
            productId: params.row.id,
            visible: !params.row.isVisibleInB2B,
          })}
          disabled={toggleVisibilityMutation.isPending}
        >
          {params.row.isVisibleInB2B ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="disabled" />}
        </IconButton>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => setDrawerProduct(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Ürünleri"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Ürünler' },
      ]}
    >
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          id="b2b-product-search"
          placeholder="Ürün, stok kodu ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Görünürlük:
          </Typography>
          <Button
            size="small"
            variant={visibilityFilter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setVisibilityFilter('all')}
          >
            Tümü
          </Button>
          <Button
            size="small"
            variant={visibilityFilter === 'visible' ? 'contained' : 'outlined'}
            onClick={() => setVisibilityFilter('visible')}
          >
            Görünür
          </Button>
          <Button
            size="small"
            variant={visibilityFilter === 'hidden' ? 'contained' : 'outlined'}
            onClick={() => setVisibilityFilter('hidden')}
          >
            Gizli
          </Button>
        </Box>

        {selectedIds.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkToggle(true)}
            >
              Seçilenleri Göster ({selectedIds.length})
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleBulkToggle(false)}
            >
              Seçilenleri Gizle ({selectedIds.length})
            </Button>
          </Box>
        )}

        {/* Senkronizasyon Durumu */}
        {syncStatus?.lastSyncedAt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: selectedIds.length > 0 ? 0 : 'auto' }}>
            <Typography variant="body2" color="textSecondary">
              Son Senk:
            </Typography>
            <Chip
              label={new Date(syncStatus.lastSyncedAt).toLocaleString('tr-TR')}
              size="small"
              color="info"
            />
            {syncStatus.recentLogs?.[0]?.productCount && (
              <Chip
                label={`${syncStatus.recentLogs[0].productCount} ürün`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Senkronizasyon Butonu */}
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={() => {
            setIsSyncing(true);
            syncMutation.mutate();
          }}
          disabled={isSyncing}
          sx={{ ml: syncStatus?.lastSyncedAt ? 1 : 'auto' }}
        >
          {isSyncing ? 'Senkronize Ediliyor...' : 'Ürünleri Senkronize Et'}
        </Button>
      </Box>

      <DataGrid
        rows={products}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          setSelectedIds(newSelection as unknown as string[]);
        }}
        disableRowSelectionOnClick
        autoHeight
        loading={isLoading}
        getRowClassName={(params) =>
          !params.row.isVisibleInB2B ? 'hidden-row' : ''
        }
        sx={{
          '& .hidden-row': {
            opacity: 0.5,
          },
        }}
      />

      {/* Product Detail Drawer */}
      {drawerProduct && (
        <ProductDrawer
          product={drawerProduct}
          onClose={() => setDrawerProduct(null)}
          onUpdate={(data) => updateProductMutation.mutate({
            productId: drawerProduct.id,
            data,
          })}
          loading={updateProductMutation.isPending}
        />
      )}
    </StandardPage>
  );
}

interface ProductDrawerProps {
  product: ProductRow;
  onClose: () => void;
  onUpdate: (data: any) => void;
  loading: boolean;
}

function ProductDrawer({ product, onClose, onUpdate, loading }: ProductDrawerProps) {
  const [minOrderQuantity, setMinOrderQuantity] = useState(product.minOrderQuantity);
  const [isVisibleInB2B, setIsVisibleInB2B] = useState(product.isVisibleInB2B);
  const [imageUrl, setImageUrl] = useState(product.imageUrl || null);

  const handleSave = () => {
    onUpdate({
      minOrderQuantity,
      isVisibleInB2B,
      imageUrl,
    });
  };

  return (
    <B2bDrawerWithActions
      open={!!product}
      onClose={onClose}
      title={product.name}
      width={500}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            Kaydet
          </Button>
        </>
      }
    >
      <Grid container spacing={2}>
        {/* ERP Data Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            ERP Verileri
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.disabledBackground' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  Stok Kodu
                </Typography>
                <Typography variant="body2">{product.stockCode}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">
                  ERP ID
                </Typography>
                <Typography variant="body2">{product.erpProductId}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">
                  Marka / Kategori
                </Typography>
                <Typography variant="body2">
                  {product.brand || '—'} / {product.category || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="textSecondary">
                  Liste Fiyatı
                </Typography>
                <Typography variant="body2">
                  {Number(product.erpListPrice || 0).toFixed(2)} ₺
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Stock Availability */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Stok Durumu
          </Typography>
          <Grid container spacing={1}>
            {(product.stocks || []).map((stock, idx) => (
              <Grid size={{ xs: 6 }} key={idx}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="textSecondary">
                      {stock.warehouseName}
                    </Typography>
                    <Chip
                      label={stock.isAvailable ? 'Stokta' : 'Stok Yok'}
                      size="small"
                      color={stock.isAvailable ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* B2B Settings */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            B2B Ayarları
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isVisibleInB2B}
                      onChange={(e) => setIsVisibleInB2B(e.target.checked)}
                    />
                  }
                  label="B2B'de Göster"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Sipariş Miktarı"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(parseInt(e.target.value) || 1)}
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Product Image */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Ürün Görseli
          </Typography>
          <ImageUpload
            value={imageUrl}
            onChange={(file) => setImageUrl(file ? URL.createObjectURL(file) : null)}
            accept="image/*"
            height={200}
          />
        </Grid>
      </Grid>
    </B2bDrawerWithActions>
  );
}
