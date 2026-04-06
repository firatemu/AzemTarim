'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { StandardPage, StandardCard } from '@/components/common';
import axios from '@/lib/axios';
import WorkOrderAssignmentForm from '@/components/servis/WorkOrderAssignmentForm';
import type { CustomerVehicle } from '@/types/servis';
import type { CreateWorkOrderDto } from '@/types/servis';
import { useTabStore } from '@/stores/tabStore';

function YeniIsEmriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTab } = useTabStore();
  const prefilledVehicleId = searchParams.get('customerVehicleId') ?? '';
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const [form, setForm] = useState<CreateWorkOrderDto>({
    customerVehicleId: prefilledVehicleId,
    cariId: '',
    technicianId: '',
    description: '',
    estimatedCompletionDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    addTab({ id: 'service-work-orders-new', label: 'Yeni İş Emri', path: '/service/work-orders/yeni' });
    const fetch = async () => {
      try {
        setFetching(true);
        const [vRes, cRes] = await Promise.all([
          axios.get('/customer-vehicles', { params: { limit: 500 } }),
          axios.get('/account', { params: { limit: 1000 } }),
        ]);
        const vData = vRes.data?.data ?? vRes.data;
        const cData = cRes.data?.data ?? cRes.data;
        setVehicles(Array.isArray(vData) ? vData : []);
        setCariler(Array.isArray(cData) ? cData : []);
      } catch {
        setSnackbar({ open: true, message: 'Veriler yüklenemedi', severity: 'error' });
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (prefilledVehicleId && vehicles.length) {
      const v = vehicles.find((x) => x.id === prefilledVehicleId);
      if (v) setForm((p) => ({ ...p, customerVehicleId: v.id, cariId: v.cariId }));
    }
  }, [prefilledVehicleId, vehicles]);

  const selectedVehicle = vehicles.find((v) => v.id === form.customerVehicleId);
  const selectedCari = cariler.find((c) => c.id === form.cariId);

  const handleVehicleChange = (v: CustomerVehicle | null) => {
    if (v) {
      setForm((p) => ({
        ...p,
        customerVehicleId: v.id,
        cariId: v.cariId,
      }));
    } else {
      setForm((p) => ({ ...p, customerVehicleId: '', cariId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerVehicleId || !form.cariId) {
      setSnackbar({ open: true, message: 'Araç ve müşteri seçimi zorunludur', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/work-orders', {
        customerVehicleId: form.customerVehicleId,
        cariId: form.cariId,
        technicianId: form.technicianId || undefined,
        description: form.description || undefined,
        estimatedCompletionDate: form.estimatedCompletionDate || undefined,
      });
      const wo = res.data?.data ?? res.data;
      const woId = typeof wo === 'object' ? wo?.id : wo;
      setSnackbar({ open: true, message: 'İş emri oluşturuldu', severity: 'success' });
      if (woId) setTimeout(() => router.push(`/service/work-orders/${woId}`), 1000);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'İş emri oluşturulamadı',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  return (
    <StandardPage>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.back()} variant="outlined">Geri</Button>
          <Typography variant="h5" fontWeight="800">Yeni İş Emri</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          disabled={loading}
          onClick={handleSubmit}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {loading ? 'Kaydediliyor...' : 'İş Emri Oluştur'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StandardCard>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Araç ve Müşteri Bilgileri</Typography>
            <Stack spacing={2.5}>
              <Autocomplete
                options={vehicles}
                getOptionLabel={(v) => `${v.plaka} - ${v.aracMarka} ${v.aracModel}${v.cari?.unvan ? ` (${v.cari.unvan})` : ''}`.trim()}
                value={selectedVehicle ?? null}
                onChange={(_, v) => handleVehicleChange(v)}
                renderInput={(params) => <TextField {...params} label="Araç" required />}
              />
              <Autocomplete
                options={cariler}
                getOptionLabel={(c) => `${c.cariKodu || ''} - ${c.unvan || c.id}`.trim() || c.id}
                value={selectedCari ?? null}
                onChange={(_, v) => setForm((p) => ({ ...p, cariId: v?.id ?? '' }))}
                renderInput={(params) => <TextField {...params} label="Müşteri (Cari)" required />}
              />
            </Stack>
          </StandardCard>

          <StandardCard sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>İş Emir Detayları</Typography>
            <Stack spacing={2.5}>
              <TextField
                label="Şikayet/Yapılacaklar"
                multiline
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Müşteri şikayeti veya yapılacak işlemleri buraya yazın..."
              />
            </Stack>
          </StandardCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StandardCard>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Planlama</Typography>
            <Stack spacing={2.5}>
              <WorkOrderAssignmentForm
                technicianId={form.technicianId || null}
                onChange={(technicianId) => setForm((p) => ({ ...p, technicianId: technicianId ?? '' }))}
              />
              <TextField
                label="Tahmini Bitiş"
                type="datetime-local"
                value={form.estimatedCompletionDate ? form.estimatedCompletionDate.slice(0, 16) : ''}
                onChange={(e) => setForm((p) => ({ ...p, estimatedCompletionDate: e.target.value ? `${e.target.value}:00` : '' }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </StandardCard>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}

export default function YeniIsEmriPage() {
  return (
    <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>}>
      <YeniIsEmriContent />
    </React.Suspense>
  );
}
