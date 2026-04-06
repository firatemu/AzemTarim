'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Stack,
  alpha,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, DirectionsCar } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import CustomerVehicleDialog from '@/components/servis/CustomerVehicleDialog';
import type { CustomerVehicle } from '@/types/servis';
import { StandardPage, StandardCard } from '@/components/common';

export default function MusteriAraclariPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchCariler = async () => {
      try {
        const res = await axios.get('/account', { params: { limit: 1000 } });
        const data = res.data?.data ?? res.data;
        setCariler(Array.isArray(data) ? data : []);
      } catch {
        setSnackbar({ open: true, message: 'Cari listesi yüklenemedi', severity: 'error' });
      }
    };
    fetchCariler();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/customer-vehicles', {
        params: { search: debouncedSearch, limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setSnackbar({ open: true, message: 'Araç listesi yüklenemedi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setOpenDialog(true);
  };

  const handleEdit = (v: CustomerVehicle) => {
    setSelectedVehicle(v);
    setOpenDialog(true);
  };

  const handleDeleteClick = (v: CustomerVehicle) => {
    setSelectedVehicle(v);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    try {
      await axios.delete(`/customer-vehicle/${selectedVehicle.id}`);
      showSnackbar('Araç silindi', 'success');
      setOpenDelete(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Silme işlemi başarısız', 'error');
    }
  };

  const handleDialogSubmit = async (data: any) => {
    if (selectedVehicle) {
      await axios.patch(`/customer-vehicle/${selectedVehicle.id}`, data);
      showSnackbar('Araç güncellendi', 'success');
    } else {
      await axios.post('/customer-vehicles', data);
      showSnackbar('Araç eklendi', 'success');
    }
    fetchVehicles();
  };

  return (
    <StandardPage>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DirectionsCar sx={{ fontSize: 32, color: 'primary.main' }} />
            Müşteri Araçları
          </Typography>
          <Typography variant="body2" color="text.secondary">Servis kaydı açılacak müşteri araçlarını yönetin.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ borderRadius: 2 }}
        >
          Yeni Araç
        </Button>
      </Box>

      <StandardCard sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Plaka, şase no, marka veya model ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha('#000', 0.02) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Plaka</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Şase No</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Marka / Model</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Yıl</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>KM</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Müşteri</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <DirectionsCar sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={700}>Henüz araç kaydı bulunmuyor</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ bgcolor: alpha('#6366f1', 0.08), px: 1, py: 0.5, borderRadius: 1.5, display: 'inline-block', border: '1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                        <Typography variant="body2" fontWeight="800" color="primary">{v.plaka}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{v.saseno || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight="600">{`${v.aracMarka} ${v.aracModel}`}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{v.yil ?? '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{v.km != null ? v.km.toLocaleString('tr-TR') : '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{v.cari?.unvan ?? v.cari?.cariKodu ?? '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Detay">
                          <IconButton size="small" onClick={() => router.push(`/service/customer-vehicles/${v.id}`)} sx={{ borderRadius: 1.5 }}>
                            <Visibility fontSize="small" color="action" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton size="small" onClick={() => handleEdit(v)} sx={{ borderRadius: 1.5 }}>
                            <Edit fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton size="small" onClick={() => handleDeleteClick(v)} sx={{ borderRadius: 1.5 }}>
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StandardCard>

      <CustomerVehicleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleDialogSubmit}
        vehicle={selectedVehicle}
        cariler={cariler}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            <Typography component="span" fontWeight="800" color="error">{selectedVehicle?.plaka}</Typography> plakalı araç silinecek. <br />
            Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity as any} sx={{ borderRadius: 2, boxShadow: 3 }} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
