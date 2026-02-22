'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  CircularProgress,
  Grid,
  Typography,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Description as RuhsatIcon,
  Build as TechIcon,
  CloudUpload,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import type { CustomerVehicle, CreateCustomerVehicleDto, UpdateCustomerVehicleDto } from '@/types/servis';

const YAKIT_TIPLERI = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit', 'Plug-in Hibrit', 'CNG'];
const SANZIMAN_TIPLERI = ['Manuel', 'Otomatik', 'Yarı Otomatik', 'CVT', 'DCT', 'Tiptronik'];
const MOTOR_HACIMLARI = ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.5', '3.0', '3.5', '4.0', '5.0'];

const initialForm: CreateCustomerVehicleDto = {
  cariId: '',
  plaka: '',
  saseno: '',
  yil: undefined,
  km: undefined,
  aracMarka: '',
  aracModel: '',
  aracMotorHacmi: '',
  aracYakitTipi: '',
  ruhsatNo: '',
  tescilTarihi: '',
  ruhsatSahibi: '',
  motorGucu: undefined,
  sanziman: '',
  renk: '',
  aciklama: '',
  ruhsatPhotoUrl: '',
};

interface CustomerVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerVehicleDto | UpdateCustomerVehicleDto) => Promise<void>;
  vehicle?: CustomerVehicle | null;
  cariler: { id: string; cariKodu?: string; unvan?: string }[];
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="var(--foreground)">
        {title}
      </Typography>
    </Box>
  );
}

export default function CustomerVehicleDialog({
  open,
  onClose,
  onSubmit,
  vehicle,
  cariler,
}: CustomerVehicleDialogProps) {
  const [form, setForm] = useState<CreateCustomerVehicleDto>(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cariInput, setCariInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const selectedCari = cariler.find((c) => c.id === form.cariId);

  useEffect(() => {
    if (vehicle) {
      // Normalize values to match Select options
      let normalizedFuel = vehicle.aracYakitTipi ?? '';
      if (normalizedFuel.toLowerCase() === 'benzi') normalizedFuel = 'Benzin';
      if (!YAKIT_TIPLERI.includes(normalizedFuel)) normalizedFuel = '';

      let normalizedEngine = vehicle.aracMotorHacmi ?? '';
      if (normalizedEngine === '1000') normalizedEngine = '1.0';
      if (!MOTOR_HACIMLARI.includes(normalizedEngine)) normalizedEngine = '';

      let normalizedSanziman = vehicle.sanziman ?? '';
      if (!SANZIMAN_TIPLERI.includes(normalizedSanziman)) normalizedSanziman = '';

      setForm({
        cariId: vehicle.cariId,
        plaka: vehicle.plaka,
        saseno: vehicle.saseno ?? '',
        yil: vehicle.yil ?? undefined,
        km: vehicle.km ?? undefined,
        aracMarka: vehicle.aracMarka,
        aracModel: vehicle.aracModel,
        aracMotorHacmi: normalizedEngine,
        aracYakitTipi: normalizedFuel,
        ruhsatNo: vehicle.ruhsatNo ?? '',
        tescilTarihi: vehicle.tescilTarihi ? vehicle.tescilTarihi.slice(0, 10) : '',
        ruhsatSahibi: vehicle.ruhsatSahibi ?? '',
        motorGucu: vehicle.motorGucu ?? undefined,
        sanziman: normalizedSanziman,
        renk: vehicle.renk ?? '',
        aciklama: vehicle.aciklama ?? '',
        ruhsatPhotoUrl: vehicle.ruhsatPhotoUrl ?? '',
      });
    } else {
      setForm(initialForm);
    }
  }, [vehicle, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cariId || !form.plaka || !form.aracMarka || !form.aracModel) return;
    setLoading(true);
    try {
      const dataToSend: any = {
        ...form,
        saseno: form.saseno || undefined,
        yil: form.yil || undefined,
        km: form.km || undefined,
        aracMotorHacmi: form.aracMotorHacmi || undefined,
        aracYakitTipi: form.aracYakitTipi || undefined,
        ruhsatNo: form.ruhsatNo || undefined,
        tescilTarihi: form.tescilTarihi || undefined,
        ruhsatSahibi: form.ruhsatSahibi || undefined,
        motorGucu: form.motorGucu || undefined,
        sanziman: form.sanziman || undefined,
        renk: form.renk || undefined,
        aciklama: form.aciklama || undefined,
        ruhsatPhotoUrl: form.ruhsatPhotoUrl || undefined,
      };
      await onSubmit(dataToSend);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof CreateCustomerVehicleDto, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 'var(--radius)', maxHeight: '95vh' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--foreground)',
            borderBottom: '1px solid var(--border)',
            py: 2,
          }}
        >
          {vehicle ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
        </DialogTitle>
        <DialogContent sx={{ mt: 0, p: 0 }}>
          <Box sx={{ p: 3, overflow: 'auto', maxHeight: 'calc(95vh - 180px)' }}>
            {/* Müşteri Bilgileri */}
            <Box sx={{ mb: 3 }}>
              <SectionHeader icon={PersonIcon} title="Müşteri Bilgileri" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={cariler}
                    getOptionLabel={(opt) => `${opt.cariKodu || ''} - ${opt.unvan || opt.id}`.trim() || opt.id}
                    value={selectedCari ?? null}
                    inputValue={cariInput}
                    onInputChange={(_, v) => setCariInput(v)}
                    onChange={(_, v) => update('cariId', v?.id ?? '')}
                    renderInput={(params) => (
                      <TextField {...params} label="Müşteri (Cari)" required placeholder="Müşteri seçin" />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Araç Bilgileri */}
            <Box sx={{ mb: 3 }}>
              <SectionHeader icon={CarIcon} title="Araç Bilgileri" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Plaka"
                    value={form.plaka}
                    onChange={(e) => update('plaka', e.target.value.toUpperCase())}
                    required
                    fullWidth
                    placeholder="34 ABC 123"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Marka"
                    value={form.aracMarka}
                    onChange={(e) => update('aracMarka', e.target.value)}
                    required
                    fullWidth
                    placeholder="Toyota, Honda, Ford..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Model"
                    value={form.aracModel}
                    onChange={(e) => update('aracModel', e.target.value)}
                    required
                    fullWidth
                    placeholder="Corolla, Civic, Focus..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Model Yılı"
                    type="number"
                    value={form.yil ?? ''}
                    onChange={(e) => update('yil', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
                    fullWidth
                    placeholder="2024"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Renk"
                    value={form.renk}
                    onChange={(e) => update('renk', e.target.value)}
                    fullWidth
                    placeholder="Beyaz, Siyah, Gri..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Kilometre (KM)"
                    type="number"
                    value={form.km ?? ''}
                    onChange={(e) => update('km', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    inputProps={{ min: 0 }}
                    fullWidth
                    placeholder="45000"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Ruhsat Bilgileri */}
            <Box sx={{ mb: 3 }}>
              <SectionHeader icon={RuhsatIcon} title="Ruhsat Bilgileri" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="Şase No (VIN)"
                    value={form.saseno}
                    onChange={(e) => update('saseno', e.target.value)}
                    fullWidth
                    placeholder="17 karakterlik VIN"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="Ruhsat No"
                    value={form.ruhsatNo}
                    onChange={(e) => update('ruhsatNo', e.target.value)}
                    fullWidth
                    placeholder="Ruhsat belge numarası"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="Tescil Tarihi"
                    type="date"
                    value={form.tescilTarihi ? form.tescilTarihi.slice(0, 10) : ''}
                    onChange={(e) => update('tescilTarihi', e.target.value ? `${e.target.value}T00:00:00` : '')}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                  <TextField
                    label="Ruhsat Sahibi"
                    value={form.ruhsatSahibi}
                    onChange={(e) => update('ruhsatSahibi', e.target.value)}
                    fullWidth
                    placeholder="Ruhsat üzerindeki sahip adı"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Ruhsat Fotoğrafı
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || file.size > 5 * 1024 * 1024) return;
                        setUploadingPhoto(true);
                        try {
                          const fd = new FormData();
                          fd.append('file', file);
                          const res = await axios.post('/customer-vehicle/upload-ruhsat', fd, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          update('ruhsatPhotoUrl', res.data?.url ?? '');
                        } finally {
                          setUploadingPhoto(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={uploadingPhoto ? <CircularProgress size={18} /> : <CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      sx={{ textTransform: 'none' }}
                    >
                      {uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                    </Button>
                    {form.ruhsatPhotoUrl && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          component="img"
                          src={form.ruhsatPhotoUrl}
                          alt="Ruhsat"
                          sx={{
                            maxWidth: 120,
                            maxHeight: 90,
                            borderRadius: 1,
                            border: '1px solid var(--border)',
                            objectFit: 'cover',
                          }}
                        />
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => update('ruhsatPhotoUrl', '')}
                          sx={{ textTransform: 'none' }}
                        >
                          Kaldır
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Araç Teknik Bilgiler */}
            <Box sx={{ mb: 3 }}>
              <SectionHeader icon={TechIcon} title="Araç Teknik Bilgileri" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Motor Hacmi</InputLabel>
                    <Select
                      value={form.aracMotorHacmi || ''}
                      label="Motor Hacmi"
                      onChange={(e) => update('aracMotorHacmi', e.target.value)}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {MOTOR_HACIMLARI.map((h) => (
                        <MenuItem key={h} value={h}>{h}L</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      value={form.aracYakitTipi || ''}
                      label="Yakıt Tipi"
                      onChange={(e) => update('aracYakitTipi', e.target.value)}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {YAKIT_TIPLERI.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Motor Gücü (HP)"
                    type="number"
                    value={form.motorGucu ?? ''}
                    onChange={(e) => update('motorGucu', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    inputProps={{ min: 0 }}
                    fullWidth
                    placeholder="150"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Şanzıman</InputLabel>
                    <Select
                      value={form.sanziman || ''}
                      label="Şanzıman"
                      onChange={(e) => update('sanziman', e.target.value)}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {SANZIMAN_TIPLERI.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Açıklama / Notlar"
                    value={form.aciklama}
                    onChange={(e) => update('aciklama', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Araç hakkında ek bilgiler, özel notlar..."
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid var(--border)',
            bgcolor: 'var(--muted)',
            gap: 1,
          }}
        >
          <Button onClick={onClose} disabled={loading} variant="outlined" sx={{ textTransform: 'none' }}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : vehicle ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
