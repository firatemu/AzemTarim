'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Fade,
  Zoom,
  Card,
  CardContent,
  alpha,
  Stack,
} from '@mui/material';
import { Delete, Edit, Add, AutoAwesome, TrendingUp } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface Marka {
  markaAdi: string;
  urunSayisi: number;
}

export default function MarkaYonetimiPage() {
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
      const markalar = (response.data || []).map((marka: any) => ({
        markaAdi: marka.brandName || '',
        urunSayisi: marka.productCount || 0,
      }));
      console.log('[MarkaYonetimiPage] Yüklenen marka sayısı:', markalar.length);
      setMarkalar(markalar);
    } catch (error: any) {
      console.error('[MarkaYonetimiPage] Markalar yüklenemedi:', error);
      console.error('[MarkaYonetimiPage] Hata detayı:', error.response?.data);
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
    if (!marka) {
      return;
    }

    // Eğer markaya ait ürün varsa, silme yapılamaz
    if (marka.urunSayisi > 0) {
      alert(`❌ Bu markaya ait ${marka.urunSayisi} ürün bulunmaktadır.\n\nÜrünü olan markalar silinemez. Önce ürünlerden markayı kaldırmanız veya ürünleri silmeniz gerekmektedir.`);
      return;
    }

    // Ürünü olmayan markalar için onay iste
    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeleting(markaAdi);
      // URL encoding kullan
      const encodedMarkaAdi = encodeURIComponent(markaAdi);
      await axios.delete(`/brand/${encodedMarkaAdi}`);

      // Başarı mesajı
      alert(`✅ Marka "${markaAdi}" başarıyla silindi.`);

      // Listeyi yenile
      await fetchMarkalar();
    } catch (error: any) {
      console.error('Marka silinemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka silinirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
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
    if (!yeniMarkaInput.trim()) {
      return;
    }

    // Bu marka zaten var mı kontrol et
    const existingMarka = markalar.find(
      (m) => m.markaAdi.toLowerCase() === yeniMarkaInput.trim().toLowerCase()
    );

    if (existingMarka) {
      alert(`❌ Marka "${yeniMarkaInput.trim()}" zaten mevcut`);
      return;
    }

    try {
      setCreating(true);
      await axios.post('/brand', {
        brandName: yeniMarkaInput.trim(),
      });

      // Listeyi yenile
      await fetchMarkalar();
      setAddDialogOpen(false);
      setYeniMarkaInput('');
    } catch (error: any) {
      console.error('Marka eklenemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka eklenirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMarka = async () => {
    if (!editingMarka || !yeniMarkaAdi.trim()) {
      return;
    }

    // Eğer yeni marka adı aynıysa, hata göster
    if (yeniMarkaAdi.trim() === editingMarka.markaAdi) {
      alert('Yeni marka adı mevcut marka adı ile aynı olamaz');
      return;
    }

    try {
      setUpdating(true);
      const encodedMarkaAdi = encodeURIComponent(editingMarka.markaAdi);
      await axios.put(`/brand/${encodedMarkaAdi}`, {
        newBrandName: yeniMarkaAdi.trim(),
      });

      alert(`✅ Marka "${editingMarka.markaAdi}" başarıyla "${yeniMarkaAdi.trim()}" olarak güncellendi.`);

      // Listeyi yenile
      await fetchMarkalar();
      handleCloseEditDialog();
    } catch (error: any) {
      console.error('Marka güncellenemedi:', error);
      const errorMessage = error.response?.data?.message || 'Marka güncellenirken bir hata oluştu';
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const getMarkaInitials = (markaAdi: string | undefined) => {
    if (!markaAdi || typeof markaAdi !== 'string') {
      return '?';
    }
    return markaAdi
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      {/* Dark mode gradient background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 0%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
            <Fade in timeout={600}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #a855f7 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    mb: 0.5,
                  }}
                >
                  Marka Yönetimi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                  }}
                >
                  Sistemdeki markaları görüntüleyin ve yönetin
                </Typography>
              </Box>
            </Fade>
          </Box>

          <Zoom in timeout={800}>
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => {
                setYeniMarkaInput('');
                setAddDialogOpen(true);
              }}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Yeni Marka Ekle
            </Button>
          </Zoom>
        </Box>

        {/* Stats Cards - Glassmorphism */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Fade in timeout={700} style={{ transitionDelay: '100ms' }}>
              <Card
                sx={{
                  background: (theme) => alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
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
                <CardContent sx={{ p: 2.5 }}>
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
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          fontSize: '2.5rem',
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1,
                        }}
                      >
                        {markalar.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                        Toplam Marka
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Fade in timeout={700} style={{ transitionDelay: '200ms' }}>
              <Card
                sx={{
                  background: (theme) => alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
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
                <CardContent sx={{ p: 2.5 }}>
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
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          fontSize: '2.5rem',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1,
                        }}
                      >
                        {markalar.reduce((sum, m) => sum + (m.urunSayisi || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                        Toplam Ürün
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={400}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                background: (theme) => alpha(theme.palette.error.main, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'error.main',
                '& .MuiAlert-icon': {
                  color: 'error.main',
                },
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Brand List - Glassmorphism Table */}
        <Fade in timeout={800} style={{ transitionDelay: '300ms' }}>
          <Paper
            sx={{
              background: (theme) => alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: (theme) => alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <TableCell width="60" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                      Marka Adı
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                      Ürün Sayısı
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                      İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <CircularProgress
                          size={48}
                          sx={{
                            color: 'primary.main',
                            mb: 2,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Markalar yükleniyor...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : markalar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AutoAwesome
                            sx={{
                              fontSize: 48,
                              color: 'text.disabled',
                              mb: 2,
                              opacity: 0.5,
                            }}
                          />
                          <Typography variant="body1" color="text.secondary">
                            Henüz marka eklenmemiş
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    markalar.map((marka, index) => (
                      <TableRow
                        key={marka.markaAdi}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            background: (theme) => alpha(theme.palette.primary.main, 0.04),
                          },
                          '&:hover .action-buttons': {
                            opacity: 1,
                          },
                        }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: 48,
                              height: 48,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                fontSize: '1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                border: '2px solid',
                                borderColor: 'background.paper',
                              }}
                            >
                              {getMarkaInitials(marka.markaAdi)}
                            </Avatar>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '0.95rem',
                            }}
                          >
                            {marka.markaAdi}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Chip
                            label={marka.urunSayisi || 0}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              background: (theme) =>
                                marka.urunSayisi && marka.urunSayisi > 0
                                  ? 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)'
                                  : alpha(theme.palette.text.secondary, 0.1),
                              color: marka.urunSayisi && marka.urunSayisi > 0 ? '#fff' : 'text.secondary',
                              borderRadius: 1.5,
                              px: 1.5,
                              boxShadow: marka.urunSayisi && marka.urunSayisi > 0
                                ? '0 2px 8px rgba(6, 182, 212, 0.3)'
                                : 'none',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Box
                            className="action-buttons"
                            sx={{
                              display: 'flex',
                              gap: 1,
                              justifyContent: 'center',
                              opacity: 0.7,
                              transition: 'opacity 0.2s ease-in-out',
                            }}
                          >
                            <Tooltip title="Markayı Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(marka)}
                                sx={{
                                  background: (theme) => alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    background: (theme) => alpha(theme.palette.primary.main, 0.2),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <Edit fontSize="small" sx={{ color: 'primary.main' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                marka.urunSayisi > 0
                                  ? `Bu markaya ait ${marka.urunSayisi} ürün bulunmaktadır. Ürünü olan markalar silinemez.`
                                  : 'Markayı Sil'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(marka.markaAdi)}
                                  disabled={deleting === marka.markaAdi || marka.urunSayisi > 0}
                                  sx={{
                                    background: (theme) => alpha(theme.palette.error.main, 0.1),
                                    '&:hover': {
                                      background: (theme) => alpha(theme.palette.error.main, 0.2),
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                  }}
                                >
                                  {deleting === marka.markaAdi ? (
                                    <CircularProgress size={16} sx={{ color: 'error.main' }} />
                                  ) : (
                                    <Delete fontSize="small" sx={{ color: 'error.main' }} />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>

        {/* Marka Düzenleme Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: (theme) => alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle component="div">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Marka Düzenle
            </Typography>
          </DialogTitle>
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
                placeholder="Yeni marka adını girin"
                required
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && yeniMarkaAdi.trim() && !updating) {
                    handleUpdateMarka();
                  }
                }}
              />
              {editingMarka && editingMarka.urunSayisi > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: (theme) => alpha(theme.palette.info.main, 0.1),
                    border: '1px solid',
                    borderColor: 'info.main',
                  }}
                >
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 500 }}>
                    ℹ️ Bu markaya ait {editingMarka.urunSayisi} ürün bulunmaktadır. Marka adı değiştirildiğinde, bu {editingMarka.urunSayisi} üründeki marka adı da güncellenecektir.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button
              onClick={handleCloseEditDialog}
              disabled={updating}
              sx={{ borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              onClick={handleUpdateMarka}
              variant="contained"
              disabled={!yeniMarkaAdi.trim() || yeniMarkaAdi.trim() === editingMarka?.markaAdi || updating}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                },
                '&:disabled': {
                  background: 'action.disabledBackground',
                },
              }}
            >
              {updating ? <CircularProgress size={20} sx={{ color: 'common.white' }} /> : 'Güncelle'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Yeni Marka Ekleme Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: (theme) => alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle component="div">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesome sx={{ fontSize: 24, color: '#fff' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Yeni Marka Ekle
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Marka Adı"
                value={yeniMarkaInput}
                onChange={(e) => setYeniMarkaInput(e.target.value)}
                placeholder="Örn: Bosch, Valeo, Brembo"
                required
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && yeniMarkaInput.trim() && !creating) {
                    handleCreateMarka();
                  }
                }}
              />
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: (theme) => alpha(theme.palette.info.main, 0.08),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  💡 Bu marka, stok eklerken kullanabileceğiniz markalar listesine eklenecektir.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button
              onClick={() => {
                setAddDialogOpen(false);
                setYeniMarkaInput('');
              }}
              disabled={creating}
              sx={{ borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateMarka}
              variant="contained"
              disabled={!yeniMarkaInput.trim() || creating}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                },
                '&:disabled': {
                  background: 'action.disabledBackground',
                },
              }}
            >
              {creating ? <CircularProgress size={20} sx={{ color: 'common.white' }} /> : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}

