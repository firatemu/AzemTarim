'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  alpha,
  Stack,
} from '@mui/material';
import { Delete, Edit, Add, AutoAwesome, TrendingUp } from '@mui/icons-material';
import { StandardPage, StandardCard } from '@/components/common';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';

interface Marka {
  markaAdi: string;
  urunSayisi: number;
}

export default function MarkaYonetimiPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [markalar, setMarkalar] = useState<Marka[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingMarka, setEditingMarka] = useState<Marka | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [yeniMarkaAdi, setYeniMarkaAdi] = useState('');
  const [updating, setUpdating] = useState(false);

  // Yeni marka ekleme state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [yeniMarkaInput, setYeniMarkaInput] = useState('');
  const [creating, setCreating] = useState(false);

  // Markaları backend'den yükle
  const fetchMarkalar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[MarkaYonetimiPage] Markalar yükleniyor...');
      const response = await axios.get('/brand');
      console.log('[MarkaYonetimiPage] API yanıtı:', response.data);
      const mappedMarkalar = (response.data || []).map((marka: any) => ({
        markaAdi: marka.brandName || '',
        urunSayisi: marka.productCount || 0,
      }));
      console.log('[MarkaYonetimiPage] Yüklenen marka sayısı:', mappedMarkalar.length);
      setMarkalar(mappedMarkalar);
    } catch (error: any) {
      console.error('[MarkaYonetimiPage] Markalar yüklenemedi:', error);
      setError(error.response?.data?.message || 'Markalar yüklenirken bir hata oluştu');
      setMarkalar([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkalar();
  }, [fetchMarkalar]);

  const handleDelete = async (markaAdi: string) => {
    const marka = markalar.find(m => m.markaAdi === markaAdi);
    if (!marka) return;

    if (marka.urunSayisi > 0) {
      enqueueSnackbar(`Bu markaya ait ${marka.urunSayisi} ürün bulunmaktadır. Ürünü olan markalar silinemez.`, { variant: 'error' });
      return;
    }

    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) return;

    try {
      setDeleting(markaAdi);
      const encodedMarkaAdi = encodeURIComponent(markaAdi);
      await axios.delete(`/brand/${encodedMarkaAdi}`);
      await fetchMarkalar();
    } catch (error: any) {
      console.error('Marka silinemedi:', error);
      setError(error.response?.data?.message || 'Marka silinirken bir hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenEditDialog = (marka: Marka) => {
    setEditingMarka(marka);
    setYeniMarkaAdi(marka.markaAdi);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMarka(null);
    setYeniMarkaAdi('');
  };

  const handleCreateMarka = async () => {
    if (!yeniMarkaInput.trim()) return;

    const exists = markalar.find(
      (m) => m.markaAdi.toLowerCase() === yeniMarkaInput.trim().toLowerCase()
    );

    if (exists) {
      enqueueSnackbar(`Marka "${yeniMarkaInput.trim()}" zaten mevcut`, { variant: 'error' });
      return;
    }

    try {
      setCreating(true);
      await axios.post('/brand', {
        brandName: yeniMarkaInput.trim(),
      });
      await fetchMarkalar();
      setAddDialogOpen(false);
      setYeniMarkaInput('');
    } catch (error: any) {
      console.error('Marka eklenemedi:', error);
      setError(error.response?.data?.message || 'Marka eklenirken bir hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMarka = async () => {
    if (!editingMarka || !yeniMarkaAdi.trim()) return;

    if (yeniMarkaAdi.trim() === editingMarka.markaAdi) {
      enqueueSnackbar('Yeni marka adı mevcut marka adı ile aynı olamaz', { variant: 'warning' });
      return;
    }

    try {
      setUpdating(true);
      const encodedMarkaAdi = encodeURIComponent(editingMarka.markaAdi);
      await axios.put(`/brand/${encodedMarkaAdi}`, {
        newBrandName: yeniMarkaAdi.trim(),
      });
      await fetchMarkalar();
      handleCloseEditDialog();
    } catch (error: any) {
      console.error('Marka güncellenemedi:', error);
      setError(error.response?.data?.message || 'Marka güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const getMarkaInitials = (markaAdi: string | undefined) => {
    if (!markaAdi || typeof markaAdi !== 'string') return '?';
    return markaAdi
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StandardPage
      title="Marka Yönetimi"
      subtitle="Sistemdeki markaları görüntüleyin ve yönetin"
      headerActions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setYeniMarkaInput('');
            setAddDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Yeni Marka Ekle
        </Button>
      }
    >
      {/* İstatistik Kartları */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <StandardCard
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesome sx={{ fontSize: 28, color: '#a855f7' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {markalar.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Toplam Marka
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <StandardCard
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%)',
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp sx={{ fontSize: 28, color: '#06b6d4' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {markalar.reduce((sum, m) => sum + (m.urunSayisi || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Toplam Ürün
                </Typography>
              </Box>
            </Stack>
          </StandardCard>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Marka Listesi */}
      <StandardCard title="Marka Listesi">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell width="80"></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Marka Adı</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Ürün Sayısı</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Yükleniyor...</Typography>
                  </TableCell>
                </TableRow>
              ) : markalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Henüz marka bulunmuyor</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                markalar.map((marka) => (
                  <TableRow key={marka.markaAdi} hover>
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        }}
                      >
                        {getMarkaInitials(marka.markaAdi)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{marka.markaAdi}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={marka.urunSayisi || 0}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          background: (theme) => marka.urunSayisi > 0 ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                          color: 'info.main',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(marka)}
                          sx={{ color: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(marka.markaAdi)}
                          disabled={deleting === marka.markaAdi || marka.urunSayisi > 0}
                          sx={{ color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.1) }}
                        >
                          {deleting === marka.markaAdi ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StandardCard>

      {/* Dialoglar */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Marka Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Mevcut Marka Adı"
              value={editingMarka?.markaAdi || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Yeni Marka Adı"
              value={yeniMarkaAdi}
              onChange={(e) => setYeniMarkaAdi(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleUpdateMarka}
            disabled={!yeniMarkaAdi.trim() || updating}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Yeni Marka Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Marka Adı"
              value={yeniMarkaInput}
              onChange={(e) => setYeniMarkaInput(e.target.value)}
              placeholder="Örn: Bosch, Valeo"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreateMarka}
            disabled={!yeniMarkaInput.trim() || creating}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </StandardPage>
  );
}
