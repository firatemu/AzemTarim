'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip,
  alpha,
  useTheme,
  Paper,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Campaign as AdIcon,
  Link as LinkIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Event as DateIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import { B2bDrawerWithActions, ImageUpload } from '@/components/b2b-admin';
import axios from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

type AdRow = {
  id: string;
  type: 'HOMEPAGE_BANNER' | 'LOGIN_POPUP';
  imageUrl: string;
  linkUrl?: string | null;
  displayOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
};

export default function B2bAdminAdvertisementsPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [drawerAd, setDrawerAd] = useState<AdRow | 'new' | null>(null);

  const { data: ads = [], isLoading, refetch } = useQuery({
    queryKey: ['b2b-ads'],
    queryFn: async () => {
      const res = await axios.get('/b2b-admin/advertisements');
      return res.data || [];
    },
  });

  const createAdMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post('/b2b-admin/advertisements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-ads'] });
      enqueueSnackbar('Reklam başarıyla oluşturuldu', { variant: 'success' });
      setDrawerAd(null);
    },
    onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || 'Hata', { variant: 'error' }),
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.patch(`/b2b-admin/advertisements/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-ads'] });
      enqueueSnackbar('Reklam güncellendi', { variant: 'success' });
      setDrawerAd(null);
    },
    onError: (err: any) => enqueueSnackbar(err?.response?.data?.message || 'Hata', { variant: 'error' }),
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`/b2b-admin/advertisements/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-ads'] });
      enqueueSnackbar('Reklam görseli yüklendi', { variant: 'success' });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/b2b-admin/advertisements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-ads'] });
      enqueueSnackbar('Reklam silindi', { variant: 'success' });
    },
  });

  const columns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: 'Önizleme',
      width: 140,
      renderCell: (p: GridRenderCellParams) => (
        <Box sx={{ py: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={p.value}
            sx={{ width: '100%', height: 44, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          />
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Reklam Tipi',
      width: 160,
      renderCell: (p: GridRenderCellParams) => {
        const labels: Record<string, string> = { HOMEPAGE_BANNER: 'Ana Sayfa Banner', LOGIN_POPUP: 'Giriş Pop-up' };
        return <Chip label={labels[p.value] || p.value} size="small" variant="outlined" sx={{ fontWeight: 800, borderRadius: 1.5 }} />;
      },
    },
    {
      field: 'linkUrl',
      headerName: 'Yönlendirme',
      flex: 1,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <LinkIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: p.value ? 'primary.main' : 'text.secondary' }}>
            {p.value || '—'}
          </Typography>
        </Stack>
      )
    },
    { field: 'displayOrder', headerName: 'Sıra', width: 80, align: 'center' },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 120,
      renderCell: (p: GridRenderCellParams) => (
        p.value ?
          <Chip icon={<ActiveIcon sx={{ fontSize: '1rem !important' }} />} label="Aktif" color="success" size="small" sx={{ fontWeight: 900, borderRadius: 1.5 }} /> :
          <Chip icon={<InactiveIcon sx={{ fontSize: '1rem !important' }} />} label="Pasif" color="error" size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      align: 'right',
      sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => setDrawerAd(p.row)} sx={{ borderRadius: 1.5 }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteAdMutation.mutate(p.row.id); }} sx={{ borderRadius: 1.5 }}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <StandardPage
      title="B2B Reklam & Banner Yönetimi"
      breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Reklamlar' }]}
      headerActions={
        <Stack direction="row" spacing={1.5}>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()} sx={{ fontWeight: 800 }}>Yenile</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerAd('new')} sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}>Yeni Reklam</Button>
        </Stack>
      }
    >
      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          rows={ads}
          columns={columns}
          loading={isLoading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 900, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
          }}
          slots={{
            loadingOverlay: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress size={24} />
              </Box>
            ),
          }}
        />
      </Paper>

      {drawerAd && (
        <AdvertisementDrawer
          ad={drawerAd === 'new' ? null : drawerAd}
          onClose={() => setDrawerAd(null)}
          onCreate={(formData: FormData) => createAdMutation.mutate(formData)}
          onUpdate={(id: string, data: Partial<AdRow>) => updateAdMutation.mutate({ id, data })}
          onUploadImage={(id: string, file: File) => uploadImageMutation.mutateAsync({ id, file })}
          loading={createAdMutation.isPending || updateAdMutation.isPending || uploadImageMutation.isPending}
        />
      )}
    </StandardPage>
  );
}

interface AdvertisementDrawerProps {
  ad: AdRow | null;
  onClose: () => void;
  onCreate: (formData: FormData) => void;
  onUpdate: (id: string, data: Partial<AdRow>) => void;
  onUploadImage: (id: string, file: File) => Promise<any>;
  loading: boolean;
}

function AdvertisementDrawer({ ad, onClose, onCreate, onUpdate, onUploadImage, loading }: AdvertisementDrawerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    type: ad?.type || 'HOMEPAGE_BANNER',
    linkUrl: ad?.linkUrl || '',
    displayOrder: ad?.displayOrder || 0,
    startsAt: ad?.startsAt ? ad.startsAt.split('T')[0] : '',
    endsAt: ad?.endsAt ? ad.endsAt.split('T')[0] : '',
    isActive: ad?.isActive ?? true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(ad?.imageUrl || null);

  const handleSave = async () => {
    if (!ad && !selectedFile) {
      enqueueSnackbar('Lütfen bir görsel seçin', { variant: 'warning' });
      return;
    }

    try {
      if (!ad) {
        const fd = new FormData();
        fd.append('file', selectedFile!);
        fd.append('type', formData.type);
        if (formData.linkUrl) fd.append('linkUrl', formData.linkUrl);
        fd.append('displayOrder', formData.displayOrder.toString());
        if (formData.startsAt) fd.append('startsAt', new Date(formData.startsAt).toISOString());
        if (formData.endsAt) fd.append('endsAt', new Date(formData.endsAt).toISOString());
        onCreate(fd);
      } else {
        // If image is changed, wait for upload first
        if (selectedFile) {
          await onUploadImage(ad.id, selectedFile);
        }

        // Update other fields
        onUpdate(ad.id, {
          type: formData.type as any,
          linkUrl: formData.linkUrl || null,
          displayOrder: formData.displayOrder,
          startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
          endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
          isActive: formData.isActive,
        });
      }
    } catch (error) {
      console.error('Error saving advertisement:', error);
    }
  };

  return (
    <B2bDrawerWithActions
      open={true}
      onClose={onClose}
      title={ad ? <Stack direction="row" spacing={1} alignItems="center"><AdIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>Reklam Düzenle</Typography></Stack> : <Stack direction="row" spacing={1} alignItems="center"><AddIcon color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>Yeni Reklam Ekle</Typography></Stack>}
      width={500}
      actions={
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button onClick={onClose} sx={{ fontWeight: 800 }}>Vazgeç</Button>
          <Button variant="contained" fullWidth onClick={handleSave} disabled={loading} sx={{ fontWeight: 900, borderRadius: 2.5 }}>
            {loading ? 'İşleniyor...' : (ad ? 'Güncelle' : 'Oluştur')}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3.5} sx={{ p: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 0.5 }}>REKLAM GÖRSELİ (MAX 5MB)</Typography>
          <ImageUpload
            value={previewUrl}
            onChange={(file) => {
              setSelectedFile(file);
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            height={220}
          />
        </Box>

        <TextField
          select
          fullWidth
          label="Reklam Tipi"
          value={formData.type}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, type: e.target.value })}
          slotProps={{ select: { sx: { fontWeight: 700 } } }}
        >
          <MenuItem value="HOMEPAGE_BANNER" sx={{ fontWeight: 700 }}>Ana Sayfa Banner</MenuItem>
          <MenuItem value="LOGIN_POPUP" sx={{ fontWeight: 700 }}>Giriş Pop-up</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Yönlendirme Linki (URL)"
          placeholder="https://example.com/kampanya"
          value={formData.linkUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, linkUrl: e.target.value })}
          slotProps={{ input: { startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} />, sx: { borderRadius: 2.5, fontWeight: 700 } } }}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            type="number"
            label="Görüntüleme Sırası"
            value={formData.displayOrder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            slotProps={{ input: { sx: { borderRadius: 2.5, fontWeight: 800 } } }}
          />
          {ad && (
            <FormControlLabel
              control={<Switch checked={formData.isActive} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })} color="success" />}
              label={<Typography variant="body2" sx={{ fontWeight: 800 }}>Aktif Mi?</Typography>}
              sx={{ ml: 1 }}
            />
          )}
        </Stack>

        <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#1976d2', 0.02), border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <DateIcon sx={{ fontSize: 14 }} /> YAYIN SÜRESİ
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Başlangıç"
              value={formData.startsAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, startsAt: e.target.value })}
              slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: 2.5, fontWeight: 700 } } }}
            />
            <TextField
              fullWidth
              type="date"
              label="Bitiş (Opsiyonel)"
              value={formData.endsAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, endsAt: e.target.value })}
              slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: 2.5, fontWeight: 700 } } }}
            />
          </Stack>
        </Box>
      </Stack>
    </B2bDrawerWithActions>
  );
}
