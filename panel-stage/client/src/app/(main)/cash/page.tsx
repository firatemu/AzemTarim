'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Payments,
  CreditCard,
  ToggleOn,
  ToggleOff,
  AccountBalanceWallet,
  RefreshOutlined,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { StandardPage, StandardCard } from '@/components/common';

interface Kasa {
  id: string;
  code: string;
  name: string;
  type: 'CASH';
  balance: number;
  isActive: boolean;
  isRetail: boolean;
  _count?: {
    movements: number;
  };
}

export default function KasaPage() {
  const router = useRouter();
  const [kasalar, setKasalar] = useState<Kasa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedKasa, setSelectedKasa] = useState<Kasa | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'CASH' as const,
    isActive: true,
    isRetail: false,
  });

  useEffect(() => {
    fetchKasalar();
  }, [showInactive]);

  const fetchKasalar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cashbox', {
        params: { isActive: !showInactive },
      });
      setKasalar(response.data || []);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kasalar yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    // Otomatik kod al
    let nextCode = '';
    try {
      const response = await axios.get('/code-templates/preview-code/CASHBOX');
      nextCode = response.data.nextCode || '';
    } catch (error) {
      console.log('Otomatik kod alınamadı');
    }

    setFormData({
      code: nextCode || '',
      name: '',
      type: 'CASH',
      isActive: true,
      isRetail: false,
    });
  };

  const openAddDialog = async () => {
    setEditMode(false);
    await resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (kasa: Kasa) => {
    setFormData({
      code: kasa.code,
      name: kasa.name,
      type: kasa.type,
      isActive: kasa.isActive,
      isRetail: kasa.isRetail,
    });
    setSelectedKasa(kasa);
    setEditMode(true);
    setOpenDialog(true);
  };

  const openDeleteDialog = (kasa: Kasa) => {
    setSelectedKasa(kasa);
    setOpenDelete(true);
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        code: formData.code && formData.code.trim().length > 0 ? formData.code : undefined,
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive === true,
        isRetail: formData.isRetail === true,
      };

      if (editMode && selectedKasa) {
        await axios.put(`/cashbox/${selectedKasa.id}`, dataToSend);
        showSnackbar('Kasa başarıyla güncellendi', 'success');
      } else {
        await axios.post('/cashbox', dataToSend);
        showSnackbar('Kasa başarıyla oluşturuldu', 'success');
      }
      setOpenDialog(false);
      fetchKasalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem sırasında hata oluştu', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedKasa) return;

    try {
      await axios.delete(`/cashbox/${selectedKasa.id}`);
      showSnackbar('Kasa başarıyla silindi', 'success');
      setOpenDelete(false);
      fetchKasalar();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme sırasında hata oluştu', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // İstatistik hesaplamaları
  const totalBalance = useMemo(() => kasalar.reduce((sum, k) => sum + (k.balance || 0), 0), [kasalar]);
  const activeCashbox = kasalar.filter(k => k.isActive && k.type === 'CASH').length;
  const totalMovements = useMemo(() => kasalar.reduce((sum, k) => sum + (k._count?.movements || 0), 0), [kasalar]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const getKasaIcon = (type: string) => {
    return <Payments sx={{ color: 'var(--chart-2)' }} />;
  };

  const getKasaColor = (type: string) => {
    return 'var(--chart-2)';
  };

  const getKasaTipLabel = (type: string) => {
    return 'Nakit Kasa';
  };

  return (
    <StandardPage maxWidth={false}>
      {/* Header & Aksiyon Butonları */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountBalanceWallet sx={{ color: 'var(--primary-foreground)', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="var(--foreground)">
            Kasa Yönetimi
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={showInactive ? <ToggleOff /> : <ToggleOn />}
            onClick={() => setShowInactive(!showInactive)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              color: showInactive ? 'var(--primary)' : 'var(--chart-2)',
              borderColor: showInactive ? 'var(--primary)' : 'var(--chart-2)',
              '&:hover': {
                bgcolor: showInactive
                  ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                  : 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
                boxShadow: 'none',
              },
            }}
          >
            {showInactive ? 'Aktifleri Göster' : 'Pasifleri Göster'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={openAddDialog}
            sx={{
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'var(--secondary-hover)', boxShadow: 'none' },
            }}
          >
            Yeni Kasa Ekle
          </Button>
        </Stack>
      </Box>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

      {/* KPI Kartları */}
      <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
        {[
          { label: 'Toplam Kasa', value: kasalar.length },
          { label: 'Aktif Kasa', value: kasalar.filter(k => k.isActive).length },
          { label: 'Toplam Bakiye', value: formatCurrency(totalBalance) },
          { label: 'Toplam Hareket', value: totalMovements },
        ].map((item, i) => (
          <Box
            key={item.label}
            sx={{
              flex: '1 1 120px',
              px: 1.5,
              borderRight: i < 3 ? '1px solid var(--divider, var(--border))' : 'none',
            }}
          >
            <Typography variant="caption" color="var(--muted-foreground)" fontWeight={500}>
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--foreground)' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Tablo Kartı */}
      <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
        {/* Tablo Satır Özeti */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Toplam <b>{kasalar.length}</b> kasa listeleniyor
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer sx={{ borderRadius: 0 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--muted)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kasa Kodu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kasa Adı</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Durum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : kasalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      {showInactive ? 'Kullanım dışı kasa bulunamadı' : 'Kasa bulunamadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                kasalar.map((kasa) => (
                  <TableRow key={kasa.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getKasaIcon(kasa.type)}
                        <Chip
                          label={getKasaTipLabel(kasa.type)}
                          size="small"
                          sx={{
                            bgcolor: `${getKasaColor(kasa.type)}20`,
                            color: getKasaColor(kasa.type),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {kasa.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {kasa.name}
                        </Typography>
                        {kasa.isRetail && (
                          <Chip
                            label="Perakende"
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              color: 'var(--chart-5)',
                              borderColor: 'var(--chart-5)',
                              bgcolor: 'color-mix(in srgb, var(--chart-5) 5%, transparent)',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="700" color={kasa.balance >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(kasa.balance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={kasa.isActive ? 'Aktif' : 'Pasif'}
                        size="small"
                        color={kasa.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detay / Hesapları Yönet">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/cash/${kasa.id}`)}
                            sx={{
                              color: '#3b82f6',
                              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)' }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(kasa)}
                            sx={{
                              color: '#f59e0b',
                              '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(!kasa._count?.movements || kasa._count.movements === 0) && (
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(kasa)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': { bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StandardCard>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
          {editMode ? 'Kasa Düzenle' : 'Yeni Kasa Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Kasa Tipi artık sabit CASH */}

            <TextField
              fullWidth
              label="Kasa Kodu"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              disabled={editMode}
              placeholder="Otomatik"
              helperText={!editMode && formData.code ? "Önerilen kod (değiştirilebilir)" : "Boş bırakılırsa otomatik"}
              sx={{
                '& .MuiInputBase-input': {
                  color: formData.code && !editMode ? '#0066cc' : 'inherit',
                  fontWeight: formData.code && !editMode ? 500 : 'normal'
                }
              }}
            />

            <TextField
              fullWidth
              label="Kasa Adı"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              autoFocus
              placeholder="Örn: Ana Kasa, Ziraat Bankası, vb."
            />



            <FormControl fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Perakende Kasa</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>POS satışlarında nakit tahsilat için kullanılır</Typography>
                </Box>
                <Select
                  size="small"
                  value={formData.isRetail}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRetail: e.target.value === 'true' }))}
                  sx={{ minWidth: 100 }}
                >
                  <MenuItem value="true">Evet</MenuItem>
                  <MenuItem value="false">Hayır</MenuItem>
                </Select>
              </Box>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                label="Durum"
              >
                <MenuItem value="true">Kullanım İçi</MenuItem>
                <MenuItem value="false">Kullanım Dışı</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            {editMode ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle component="div" sx={{ fontWeight: 'bold' }}>Kasa Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedKasa?.name}</strong> kasasını silmek istediğinizden emin misiniz?
          </Typography>
          {selectedKasa?._count && selectedKasa._count.movements > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Bu kasa hareket görmüştür ve silinemez. Kullanım dışı yapabilirsiniz.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
