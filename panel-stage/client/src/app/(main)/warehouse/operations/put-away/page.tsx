'use client';

import React, { Suspense, useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Divider,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Inventory2,
  LocationOn,
  Warehouse as WarehouseIcon,
  Description as DescriptionIcon,
  CheckCircle,
} from '@mui/icons-material';
import { StandardPage, StandardCard } from '@/components/common';
import axios from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Grid from '@mui/material/Grid';

interface Product {
  id: string;
  stokKodu: string;
  stokAdi: string;
  marka?: string;
  birim: string;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

interface Location {
  id: string;
  warehouseId: string;
  code: string;
  barcode: string;
  name?: string;
  active: boolean;
  warehouse: {
    code: string;
    name: string;
  };
}

function PutAwayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLocationId = searchParams.get('locationId');

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const [formData, setFormData] = useState({
    productId: '',
    toWarehouseId: '',
    toLocationId: preselectedLocationId || '',
    qty: 1,
    note: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products', {
        params: { limit: 1000 }
      });
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Ürün listesi alınamadı:', error);
      setProducts([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouses', { params: { active: true } });
      setWarehouses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Depo listesi alınamadı:', error);
      setWarehouses([]);
    }
  };

  const fetchLocations = async (warehouseId: string) => {
    try {
      const response = await axios.get('/location', {
        params: { warehouseId, active: true },
      });
      setLocations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Raf listesi alınamadı:', error);
      setLocations([]);
    }
  };

  const fetchPreselectedLocation = async () => {
    if (preselectedLocationId) {
      try {
        const response = await axios.get(`/location/${preselectedLocationId}`);
        const location = response.data;
        setSelectedLocation(location);
        setSelectedWarehouse({
          id: location.warehouseId,
          code: location.warehouse.code,
          name: location.warehouse.name,
          active: true,
        });
        setFormData({
          ...formData,
          toWarehouseId: location.warehouseId,
          toLocationId: location.id,
        });
        fetchLocations(location.warehouseId);
      } catch (error) {
        console.error('Raf bilgisi alınamadı:', error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    if (preselectedLocationId) {
      fetchPreselectedLocation();
    }
  }, [preselectedLocationId]);

  const handleWarehouseChange = (warehouse: Warehouse | null) => {
    setSelectedWarehouse(warehouse);
    setSelectedLocation(null);
    setFormData({
      ...formData,
      toWarehouseId: warehouse?.id || '',
      toLocationId: '',
    });

    if (warehouse) {
      fetchLocations(warehouse.id);
    } else {
      setLocations([]);
    }
  };

  const handleLocationChange = (location: Location | null) => {
    setSelectedLocation(location);
    setFormData({
      ...formData,
      toLocationId: location?.id || '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.toWarehouseId || !formData.toLocationId) {
      setSnackbar({ open: true, message: 'Lütfen ürün, depo ve raf seçin', severity: 'error' });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        productId: formData.productId,
        toWarehouseId: formData.toWarehouseId,
        toLocationId: formData.toLocationId,
        note: formData.note || undefined,
      };

      await axios.post('/stock-movements/assign-location', payload);

      setSnackbar({ open: true, message: 'Raf adresi başarıyla tanımlandı', severity: 'success' });

      setTimeout(() => {
        if (preselectedLocationId) {
          setSelectedProduct(null);
          setFormData({
            ...formData,
            productId: '',
            qty: 1,
            note: '',
          });
        } else {
          setSelectedProduct(null);
          setSelectedWarehouse(null);
          setSelectedLocation(null);
          setFormData({
            productId: '',
            toWarehouseId: '',
            toLocationId: '',
            qty: 1,
            note: '',
          });
          setLocations([]);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Put-Away işlemi başarısız:', error);
      const message = error.response?.data?.message || 'Put-Away işlemi başarısız';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardPage>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Geri
          </Button>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Inventory2 sx={{ fontSize: 32, color: 'primary.main' }} />
              Put-Away İşlemi
            </Typography>
            <Typography variant="body2" color="text.secondary">Ürünün hangi rafta bulunduğunu kaydedin (raf adresi tanımlama).</Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <StandardCard>
            <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <DescriptionIcon sx={{ fontSize: 18 }} /> İşlem Bilgileri
            </Typography>

            <Stack spacing={3}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
                value={selectedProduct}
                onChange={(_, newValue) => {
                  setSelectedProduct(newValue);
                  setFormData((prev) => ({ ...prev, productId: newValue?.id || '' }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ürün *"
                    placeholder="Ürün ara..."
                    helperText="Ürün koduna veya adına göre arama yapın"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.stokKodu}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.stokAdi} {option.marka && `• ${option.marka}`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={warehouses}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={selectedWarehouse}
                    onChange={(_, newValue) => handleWarehouseChange(newValue)}
                    disabled={!!preselectedLocationId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hedef Depo *"
                        placeholder="Depo seç..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={locations}
                    getOptionLabel={(option) => `${option.code} ${option.name ? `- ${option.name}` : ''}`}
                    value={selectedLocation}
                    onChange={(_, newValue) => handleLocationChange(newValue)}
                    disabled={!formData.toWarehouseId || !!preselectedLocationId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hedef Raf *"
                        placeholder="Raf seç..."
                        helperText={!formData.toWarehouseId ? 'Önce depo seçin' : ''}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box component="li" key={key} {...otherProps}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {option.code}
                            </Typography>
                            {option.name && (
                              <Typography variant="caption" color="text.secondary">
                                {option.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Not (opsiyonel)"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                multiline
                rows={3}
                placeholder="Ek açıklama veya not ekleyin..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.productId ||
                  !formData.toWarehouseId ||
                  !formData.toLocationId
                }
                sx={{ borderRadius: 2, height: 50, fontWeight: 700 }}
              >
                {loading ? 'Kaydediliyor...' : 'Raf Adresini Kaydet'}
              </Button>
            </Stack>
          </StandardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <StandardCard sx={{ bgcolor: alpha('#6366f1', 0.05), borderColor: alpha('#6366f1', 0.1) }}>
              <Typography variant="subtitle2" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, fontWeight: 800 }}>
                <Inventory2 sx={{ fontSize: 18 }} /> İşlem Özeti
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Seçili Ürün</Typography>
                  {selectedProduct ? (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" fontWeight="700">{selectedProduct.stokKodu}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">{selectedProduct.stokAdi}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mt: 0.5 }}>Ürün seçilmedi</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Hedef Lokasyon</Typography>
                  {selectedWarehouse ? (
                    <Stack sx={{ mt: 0.5 }} spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarehouseIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="600">{selectedWarehouse.name}</Typography>
                      </Box>
                      {selectedLocation ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'primary.main' }} />
                          <Chip
                            label={selectedLocation.code}
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, borderRadius: 1 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Raf seçilmedi</Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mt: 0.5 }}>Depo seçilmedi</Typography>
                  )}
                </Box>
              </Stack>

              {!selectedProduct && !selectedWarehouse && (
                <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                  <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Formu doldurdukça özet veriler burada görünecektir.
                  </Typography>
                </Box>
              )}
            </StandardCard>

            <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="subtitle2" fontWeight="800" gutterBottom>Nedir bu Put-Away?</Typography>
              <Typography variant="caption" display="block">
                Bu işlem, malzemenin depo içerisindeki fiziksel raf adresini sisteme tanımlar.
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 14, color: 'info.main' }} />
                <Typography variant="caption" fontWeight={700}>Stok miktarını değiştirmez.</Typography>
              </Box>
              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 14, color: 'info.main' }} />
                <Typography variant="caption" fontWeight={700}>Sadece konum bilgisi günceller.</Typography>
              </Box>
            </Alert>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: 3 }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}

export default function PutAwayPage() {
  return (
    <Suspense
      fallback={(
        <StandardPage>
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </StandardPage>
      )}
    >
      <PutAwayPageContent />
    </Suspense>
  );
}
