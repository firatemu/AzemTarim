'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  ChevronRight,
  ChevronLeft,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';

interface ErpProduct {
  id: string;
  code: string;
  name: string;
  brand?: string;
  category?: string;
}

interface ErpProductTransferDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId?: string;
}

export function ErpProductTransferDialog({
  open,
  onClose,
  onSuccess,
  tenantId,
}: ErpProductTransferDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [availableProducts, setAvailableProducts] = useState<ErpProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ErpProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  // Fetch available products from ERP
  const fetchAvailableProducts = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await axios.get<ErpProduct[]>('/b2b-admin/products/erp/available', {
        params: { search: searchQuery, limit: 100 },
      });
      setAvailableProducts(res.data || []);
    } catch (error) {
      enqueueSnackbar('ERP ürünleri yüklenirken hata', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fetch products when dialog opens
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedProducts([]);
      setLeftChecked(new Set());
      setRightChecked(new Set());
      fetchAvailableProducts('');
    }
  }, [open, fetchAvailableProducts]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        fetchAvailableProducts(search);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, open, fetchAvailableProducts]);

  // Get products not yet selected
  const leftPaneProducts = availableProducts.filter(
    (p) => !selectedProducts.some((sp) => sp.id === p.id)
  );

  // Handle left pane checkbox toggle
  const handleLeftToggle = (productId: string) => {
    const newChecked = new Set(leftChecked);
    if (newChecked.has(productId)) {
      newChecked.delete(productId);
    } else {
      newChecked.add(productId);
    }
    setLeftChecked(newChecked);
  };

  // Handle right pane checkbox toggle
  const handleRightToggle = (productId: string) => {
    const newChecked = new Set(rightChecked);
    if (newChecked.has(productId)) {
      newChecked.delete(productId);
    } else {
      newChecked.add(productId);
    }
    setRightChecked(newChecked);
  };

  // Move selected products from left to right
  const handleMoveRight = () => {
    const productsToMove = leftPaneProducts.filter((p) => leftChecked.has(p.id));
    setSelectedProducts([...selectedProducts, ...productsToMove]);
    setLeftChecked(new Set());
  };

  // Move selected products from right to left
  const handleMoveLeft = () => {
    const productsToRemove = selectedProducts.filter((p) => rightChecked.has(p.id));
    setSelectedProducts(selectedProducts.filter((p) => !rightChecked.has(p.id)));
    setRightChecked(new Set());
  };

  // Select all products in left pane
  const handleSelectAllLeft = () => {
    if (leftChecked.size === leftPaneProducts.length && leftPaneProducts.length > 0) {
      // Deselect all if all are selected
      setLeftChecked(new Set());
    } else {
      // Select all
      setLeftChecked(new Set(leftPaneProducts.map((p) => p.id)));
    }
  };

  // Deselect all products in left pane
  const handleDeselectAllLeft = () => {
    setLeftChecked(new Set());
  };

  // Select all products in right pane
  const handleSelectAllRight = () => {
    if (rightChecked.size === selectedProducts.length && selectedProducts.length > 0) {
      // Deselect all if all are selected
      setRightChecked(new Set());
    } else {
      // Select all
      setRightChecked(new Set(selectedProducts.map((p) => p.id)));
    }
  };

  // Save selected products to B2B
  const handleSave = async () => {
    if (selectedProducts.length === 0) return;

    setSaving(true);
    try {
      await axios.post('/b2b-admin/products/erp/add-batch', {
        erpProductIds: selectedProducts.map((p) => p.id),
      });
      enqueueSnackbar(`${selectedProducts.length} ürün başarıyla eklendi`, { variant: 'success' });
      onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar('Ürün eklenirken hata', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Render list item
  const renderItem = (product: ErpProduct, checked: boolean, onToggle: () => void) => (
    <ListItem
      key={product.id}
      dense
      onClick={onToggle}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        mb: 0.5,
        bgcolor: checked ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        border: checked ? '1px solid' : '1px solid transparent',
        borderColor: checked ? 'primary.main' : 'divider',
        '&:hover': {
          bgcolor: checked ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.04),
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Checkbox
          edge="start"
          checked={checked}
          tabIndex={-1}
          disableRipple
          size="small"
        />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
            {product.code}
          </Typography>
        }
        secondary={
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {product.name}
          </Typography>
        }
      />
    </ListItem>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
          ERP'den Ürün Ekle
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Ürün ara (stok kodu veya ürün adı)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />,
              sx: { borderRadius: 2.5, bgcolor: 'background.paper' }
            }}
            size="small"
          />

          {/* Transfer Lists Container */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {/* Left Pane - Available Products */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                  ERP'de Mevcut ({leftPaneProducts.length})
                </Typography>
                {leftPaneProducts.length > 0 && (
                  <Button
                    size="small"
                    onClick={handleSelectAllLeft}
                    sx={{ fontWeight: 800, textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {leftChecked.size === leftPaneProducts.length ? 'Seçimi Kaldır' : 'Hepsini Seç'}
                  </Button>
                )}
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : leftPaneProducts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      {search ? 'Ürün bulunamadı' : 'Tüm ürünler zaten B2B\'de mevcut'}
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {leftPaneProducts.map((product) => {
                      const checked = leftChecked.has(product.id);
                      return (
                        <div key={product.id}>
                          {renderItem(product, checked, () => handleLeftToggle(product.id))}
                        </div>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Paper>

            {/* Transfer Controls */}
            <Stack sx={{ justifyContent: 'center', gap: 1 }}>
              <IconButton
                onClick={handleMoveRight}
                disabled={leftChecked.size === 0}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  '&:disabled': { bgcolor: 'action.disabledBackground' },
                }}
              >
                <ChevronRight />
              </IconButton>
              <IconButton
                onClick={handleMoveLeft}
                disabled={rightChecked.size === 0}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                  '&:disabled': { bgcolor: 'action.disabledBackground' },
                }}
              >
                <ChevronLeft />
              </IconButton>
            </Stack>

            {/* Right Pane - Selected Products */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.success.main, 0.02),
                borderColor: 'success.main',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderBottom: '1px solid',
                  borderColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main' }}>
                  B2B'ye Eklenecek ({selectedProducts.length})
                </Typography>
                {selectedProducts.length > 0 && (
                  <Button
                    size="small"
                    onClick={handleSelectAllRight}
                    sx={{ fontWeight: 800, textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {rightChecked.size === selectedProducts.length ? 'Seçimi Kaldır' : 'Hepsini Seç'}
                  </Button>
                )}
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {selectedProducts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      Henüz ürün seçilmedi
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {selectedProducts.map((product) => {
                      const checked = rightChecked.has(product.id);
                      return (
                        <div key={product.id}>
                          {renderItem(product, checked, () => handleRightToggle(product.id))}
                        </div>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} sx={{ fontWeight: 800 }} disabled={saving}>
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={selectedProducts.length === 0 || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ fontWeight: 900, borderRadius: 2.5, px: 3 }}
        >
          {saving ? 'Ekleniyor...' : `${selectedProducts.length} Ürünü Ekle`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
