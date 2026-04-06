'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  alpha,
  Divider,
} from '@mui/material';
import { Add, Search, Edit, Delete, Person, PersonOff, Refresh, Engineering } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { StandardPage, StandardCard } from '@/components/common';

const DEPARTMAN_OPTIONS = [
  'Kaporta',
  'Motor',
  'Elektrik',
  'Oto Boya',
  'Klima',
  'Lastik',
  'Şanzıman',
  'Fren',
  'Süspansiyon',
  'Egzoz',
  'Cam',
  'Diğer',
];

interface Technician {
  id: string;
  fullName: string;
  department?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenant?: { id: string; name: string };
}

export default function TeknisyenlerPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore((state: any) => state) as any;
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    department: '',
  });

  const canManage =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'WORKSHOP_MANAGER' ||
    user?.role === 'SERVICE_MANAGER' ||
    user?.role === 'RECEPTION';

  const { data, isLoading } = useQuery({
    queryKey: ['technicians', search],
    queryFn: async () => {
      const res = await axios.get('/technicians', {
        params: { search: search || undefined, limit: 500 },
      });
      return res.data;
    },
    enabled: canManage,
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof createForm) => {
      const res = await axios.post('/technicians', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setCreateOpen(false);
      setCreateForm({ fullName: '', department: '' });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/users/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const technicians: Technician[] = data?.data ?? [];

  const handleCreate = () => {
    if (!createForm.fullName || !createForm.department) return;
    createMutation.mutate(createForm);
  };

  if (!canManage) {
    return (
      <StandardPage>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Bu sayfaya erişim yetkiniz yok.</Alert>
      </StandardPage>
    );
  }

  return (
    <StandardPage>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Engineering sx={{ fontSize: 32, color: 'primary.main' }} />
            Teknisyenler
          </Typography>
          <Typography variant="body2" color="text.secondary">Servis operasyonlarında görev alan teknisyen kadrosunu yönetin.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['technicians'] })}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Yeni Teknisyen
          </Button>
        </Stack>
      </Box>

      <StandardCard sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Ad soyad veya departman ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                <TableCell sx={{ fontWeight: 800, width: 80 }}></TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Departman</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : technicians.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Engineering sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={700}>Henüz teknisyen kaydı bulunmuyor</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                technicians.map((t) => (
                  <TableRow key={t.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: t.isActive ? alpha('#6366f1', 0.1) : alpha('#94a3b8', 0.1),
                          color: t.isActive ? 'primary.main' : 'text.disabled',
                          fontSize: '1rem',
                          fontWeight: 800,
                          border: '1px solid',
                          borderColor: t.isActive ? alpha('#6366f1', 0.2) : alpha('#94a3b8', 0.2),
                        }}
                      >
                        {(t.fullName || '?')[0].toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">{t.fullName || '-'}</Typography>
                      <Typography variant="caption" color="text.disabled">{t.role === 'TECHNICIAN' ? 'Saha Teknisyeni' : t.role}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.department || 'Genel'}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: alpha('#0ea5e9', 0.08), color: '#0ea5e9', border: '1px solid', borderColor: alpha('#0ea5e9', 0.1) }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.isActive ? 'Aktif' : 'Pasif'}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          borderRadius: 1.5,
                          bgcolor: t.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                          color: t.isActive ? 'success.main' : 'error.main',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={t.isActive ? 'Pasifleştir' : 'Aktifleştir'}>
                          <IconButton
                            size="small"
                            onClick={() => suspendMutation.mutate(t.id)}
                            disabled={suspendMutation.isPending}
                            sx={{ borderRadius: 1.5 }}
                          >
                            {t.isActive ? (
                              <PersonOff fontSize="small" color="warning" />
                            ) : (
                              <Person fontSize="small" color="primary" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelected(t);
                              setDeleteOpen(true);
                            }}
                            sx={{ borderRadius: 1.5 }}
                          >
                            <Delete fontSize="small" />
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

      {/* Yeni Teknisyen Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Yeni Teknisyen Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={createForm.fullName}
              onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl fullWidth required>
              <InputLabel>Departman</InputLabel>
              <Select
                value={createForm.department}
                label="Departman"
                onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))}
                sx={{ borderRadius: 2 }}
              >
                {DEPARTMAN_OPTIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              !createForm.fullName ||
              !createForm.department ||
              createMutation.isPending
            }
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Teknisyeni Sil</DialogTitle>
        <DialogContent>
          {selected && (
            <Alert severity="warning" sx={{ borderRadius: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{selected.fullName}</Typography>
              <Typography variant="caption" display="block">Bu teknisyeni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>İptal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => selected && deleteMutation.mutate(selected.id)}
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {deleteMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </StandardPage>
  );
}
