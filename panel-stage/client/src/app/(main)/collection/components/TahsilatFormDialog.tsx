"use client";

import React, { useState, useMemo, useEffect, memo } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  Close,
  CreditCard,
  Notes,
  Person,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';
import { BankaHesap, Cari, FirmaKrediKarti, Kasa, TahsilatFormData } from '../types';
import axios from '@/lib/axios';

interface TahsilatFormDialogProps {
  open: boolean;
  initialFormData: TahsilatFormData;
  cariler: Cari[];
  bankaHesaplari: BankaHesap[];
  kasalar: Kasa[];
  carilerLoading: boolean;
  bankaHesaplariLoading: boolean;
  kasalarLoading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: TahsilatFormData) => void;
  formatMoney: (value: number) => string;
}

const TahsilatFormDialog = memo(({
  open,
  initialFormData,
  cariler,
  bankaHesaplari,
  kasalar,
  carilerLoading,
  bankaHesaplariLoading,
  kasalarLoading,
  submitting,
  onClose,
  onSubmit,
  formatMoney,
}: TahsilatFormDialogProps) => {
  const [localFormData, setLocalFormData] = useState<TahsilatFormData>(initialFormData);
  const [firmaKrediKartlari, setFirmaKrediKartlari] = useState<FirmaKrediKarti[]>([]);
  const [firmaKrediKartlariLoading, setFirmaKrediKartlariLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalFormData(initialFormData);
    setErrors({});
    setTouched({});
  }, [initialFormData, open]);

  const posBankaHesaplariFiltered = useMemo(() => {
    if (localFormData.tip === 'COLLECTION' && localFormData.odemeTipi === 'KREDI_KARTI') {
      return bankaHesaplari.filter((h) => h.hesapTipi === 'POS');
    }
    return [];
  }, [bankaHesaplari, localFormData.tip, localFormData.odemeTipi]);

  const availableKasalar = useMemo(() => {
    if (localFormData.odemeTipi === 'NAKIT') return kasalar.filter((k) => k.kasaTipi === 'NAKIT');
    if (localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.tip === 'PAYMENT') {
      return kasalar.filter((k) => k.kasaTipi === 'FIRMA_KREDI_KARTI');
    }
    return [];
  }, [kasalar, localFormData.odemeTipi, localFormData.tip]);

  useEffect(() => {
    const fetchFirmaKrediKartlari = async () => {
      if (localFormData.tip === 'PAYMENT' && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId) {
        try {
          setFirmaKrediKartlariLoading(true);
          const response = await axios.get('/firma-kredi-karti', { params: { kasaId: localFormData.kasaId } });
          setFirmaKrediKartlari(response.data || []);
        } catch {
          setFirmaKrediKartlari([]);
        } finally {
          setFirmaKrediKartlariLoading(false);
        }
      } else {
        setFirmaKrediKartlari([]);
        setLocalFormData((prev) => ({
          ...prev,
          firmaKrediKartiId: undefined,
          kartSahibi: '',
          kartSonDort: '',
          bankaAdi: '',
        }));
      }
    };
    void fetchFirmaKrediKartlari();
  }, [localFormData.tip, localFormData.odemeTipi, localFormData.kasaId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!localFormData.cariId) newErrors.cariId = 'Cari seçimi zorunludur';
    const tutarNum = typeof localFormData.tutar === 'string' ? parseFloat(localFormData.tutar) : localFormData.tutar;
    if (tutarNum === undefined || Number.isNaN(tutarNum) || tutarNum <= 0) newErrors.tutar = 'Tutar 0\'dan büyük olmalıdır';
    if (!localFormData.tarih) newErrors.tarih = 'Tarih seçimi zorunludur';

    if (localFormData.odemeTipi === 'NAKIT' && !localFormData.kasaId) newErrors.kasaId = 'Kasa seçimi zorunludur';

    if (localFormData.odemeTipi === 'KREDI_KARTI') {
      if (localFormData.tip === 'COLLECTION' && !localFormData.bankaHesapId) {
        newErrors.bankaHesapId = 'POS hesabı seçimi zorunludur';
      }
      if (localFormData.tip === 'COLLECTION') {
        const installmentValue = Number(localFormData.installmentCount || 1);
        if (!Number.isInteger(installmentValue) || installmentValue < 1) {
          newErrors.installmentCount = 'Taksit sayısı en az 1 olmalıdır';
        }
      }
      if (localFormData.tip === 'PAYMENT') {
        if (!localFormData.kasaId) newErrors.kasaId = 'Kart kasası seçimi zorunludur';
        if (!localFormData.firmaKrediKartiId) newErrors.firmaKrediKartiId = 'Kredi kartı seçimi zorunludur';
      }
    }

    setErrors(newErrors);
    setTouched({ cariId: true, tutar: true, tarih: true, kasaId: true, bankaHesapId: true, firmaKrediKartiId: true, installmentCount: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleLocalChange = (field: keyof TahsilatFormData, value: any) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'firmaKrediKartiId' && value) {
      const selectedKart = firmaKrediKartlari.find((kart) => kart.id === value);
      if (selectedKart) {
        setLocalFormData((prev) => ({
          ...prev,
          [field]: value,
          kartSahibi: selectedKart.kartAdi || '',
          kartSonDort: selectedKart.sonDortHane || '',
          bankaAdi: selectedKart.bankaAdi || '',
        }));
        return;
      }
    }

    if (field === 'odemeTipi') {
      setLocalFormData((prev) => ({
        ...prev,
        [field]: value,
        kasaId: '',
        bankaHesapId: '',
        installmentCount: 1,
      }));
      return;
    }

    setLocalFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalSubmit = () => {
    if (validateForm()) {
      const tutarNum = typeof localFormData.tutar === 'string' ? parseFloat(localFormData.tutar) : localFormData.tutar;
      onSubmit({ ...localFormData, tutar: tutarNum || 0 });
    }
  };

  if (!open) return null;
  const isTahsilat = localFormData.tip === 'COLLECTION';
  const actionColor = isTahsilat ? 'var(--chart-2)' : 'var(--destructive)';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          py: 1.25,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'var(--muted)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="var(--foreground)">
            {isTahsilat ? 'Tahsilat Ekle' : 'Ödeme Ekle'}
          </Typography>
          <Typography variant="caption" color="var(--muted-foreground)">
            {isTahsilat ? 'Müşteriden tahsilat kaydı oluştur' : 'Tedarikçi ödeme kaydı oluştur'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'var(--muted-foreground)' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, display: 'flex', overflowY: 'hidden' }}>
        <Box sx={{ width: '100%', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', pr: 0.5 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Ödeme Tipi</InputLabel>
                      <Select
                        value={localFormData.odemeTipi}
                        label="Ödeme Tipi"
                        onChange={(e) => handleLocalChange('odemeTipi', e.target.value)}
                        startAdornment={<InputAdornment position="start"><CreditCard fontSize="small" /></InputAdornment>}
                        className="form-control-select"
                      >
                        <MenuItem value="NAKIT">Nakit</MenuItem>
                        <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tutar"
                      value={localFormData.tutar}
                      onChange={(e) => handleLocalChange('tutar', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      error={!!errors.tutar && touched.tutar}
                      helperText={touched.tutar ? (errors.tutar || 'Tutar 0\'dan büyük olmalıdır') : 'Tutar 0\'dan büyük olmalıdır'}
                      className="form-control-textfield"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      sx={{
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="İşlem Tarihi"
                      value={localFormData.tarih}
                      onChange={(e) => handleLocalChange('tarih', e.target.value)}
                      error={!!errors.tarih && touched.tarih}
                      helperText={touched.tarih ? errors.tarih : ''}
                      className="form-control-textfield"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={cariler}
                      getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.cariKodu} - {option.unvan}
                        </li>
                      )}
                      loading={carilerLoading}
                      value={cariler.find((c) => c.id === localFormData.cariId) || null}
                      onChange={(_, value) => handleLocalChange('cariId', value?.id || '')}

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cari"
                          error={!!errors.cariId && touched.cariId}
                          helperText={touched.cariId ? errors.cariId : ''}
                          className="form-control-textfield"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'var(--foreground)' }}>
                  Kasa / Hesap Bilgisi
                </Typography>
                <Grid container spacing={2}>
                  {localFormData.odemeTipi === 'KREDI_KARTI' && isTahsilat ? (
                    <Grid size={12}>
                      <FormControl fullWidth error={!!errors.bankaHesapId && touched.bankaHesapId}>
                        <InputLabel>POS Banka Hesabı</InputLabel>
                        <Select
                          value={localFormData.bankaHesapId || ''}
                          label="POS Banka Hesabı"
                          onChange={(e) => handleLocalChange('bankaHesapId', e.target.value)}
                          disabled={bankaHesaplariLoading}
                          startAdornment={<InputAdornment position="start"><AccountBalance fontSize="small" /></InputAdornment>}
                          className="form-control-select"
                        >
                          {posBankaHesaplariFiltered.map((hesap) => (
                            <MenuItem key={hesap.id} value={hesap.id}>
                              {hesap.bankaAdi} - {hesap.hesapAdi}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.bankaHesapId && errors.bankaHesapId && <Typography variant="caption" color="error">{errors.bankaHesapId}</Typography>}
                      </FormControl>
                    </Grid>
                  ) : (
                    <Grid size={12}>
                      <FormControl fullWidth error={!!errors.kasaId && touched.kasaId}>
                        <InputLabel>{localFormData.odemeTipi === 'NAKIT' ? 'Nakit Kasa' : 'Kredi Kartı Kasası'}</InputLabel>
                        <Select
                          value={localFormData.kasaId}
                          label={localFormData.odemeTipi === 'NAKIT' ? 'Nakit Kasa' : 'Kredi Kartı Kasası'}
                          onChange={(e) => handleLocalChange('kasaId', e.target.value)}
                          disabled={kasalarLoading}
                          startAdornment={<InputAdornment position="start"><AccountBalance fontSize="small" /></InputAdornment>}
                          className="form-control-select"
                        >
                          {availableKasalar.map((kasa) => (
                            <MenuItem key={kasa.id} value={kasa.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                                <span>{kasa.kasaAdi}</span>
                                <Chip label={formatMoney(kasa.bakiye)} size="small" variant="outlined" />
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.kasaId && errors.kasaId && <Typography variant="caption" color="error">{errors.kasaId}</Typography>}
                      </FormControl>
                    </Grid>
                  )}

                  {!isTahsilat && localFormData.odemeTipi === 'KREDI_KARTI' && localFormData.kasaId && (
                    <Grid size={12}>
                      <FormControl fullWidth error={!!errors.firmaKrediKartiId && touched.firmaKrediKartiId}>
                        <InputLabel>Firma Kredi Kartı</InputLabel>
                        <Select
                          value={localFormData.firmaKrediKartiId || ''}
                          label="Firma Kredi Kartı"
                          onChange={(e) => handleLocalChange('firmaKrediKartiId', e.target.value)}
                          disabled={firmaKrediKartlariLoading}
                          className="form-control-select"
                        >
                          {firmaKrediKartlari.filter((k) => k.aktif).map((kart) => (
                            <MenuItem key={kart.id} value={kart.id}>
                              {kart.kartAdi} - {kart.bankaAdi} (Son 4: {kart.sonDortHane})
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.firmaKrediKartiId && errors.firmaKrediKartiId && <Typography variant="caption" color="error">{errors.firmaKrediKartiId}</Typography>}
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={2}
                value={localFormData.aciklama}
                onChange={(e) => handleLocalChange('aciklama', e.target.value)}
                className="form-control-textfield"
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: 1.5 }}><Notes fontSize="small" /></InputAdornment> }}
              />
            </Grid>

            {isTahsilat && localFormData.odemeTipi === 'KREDI_KARTI' && (
              <Grid size={12}>
                <Alert severity="info" icon={<CreditCard />}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField fullWidth size="small" label="Kart Sahibi" value={localFormData.kartSahibi} onChange={(e) => handleLocalChange('kartSahibi', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField fullWidth size="small" label="Son 4 Hane" inputProps={{ maxLength: 4 }} value={localFormData.kartSonDort} onChange={(e) => handleLocalChange('kartSonDort', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField fullWidth size="small" label="Banka Adı" value={localFormData.bankaAdi} onChange={(e) => handleLocalChange('bankaAdi', e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Taksit Sayısı"
                        value={localFormData.installmentCount ?? 1}
                        onChange={(e) => handleLocalChange('installmentCount', parseInt(e.target.value) || 1)}
                        error={!!errors.installmentCount && touched.installmentCount}
                        helperText={touched.installmentCount ? (errors.installmentCount || 'En az 1') : 'En az 1'}
                        inputProps={{ min: 1, step: 1 }}
                        sx={{
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                          '& input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          '& input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, bgcolor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <Button onClick={onClose} disabled={submitting} variant="outlined" size="small">
          İptal
        </Button>
        <Button
          onClick={handleLocalSubmit}
          variant="contained"
          disabled={submitting}
          size="small"
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : (isTahsilat ? <TrendingDown /> : <TrendingUp />)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: actionColor,
            color: 'var(--primary-foreground)',
            '&:hover': { bgcolor: `color-mix(in srgb, ${actionColor} 85%, black)` },
          }}
        >
          {submitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

TahsilatFormDialog.displayName = 'TahsilatFormDialog';

export default TahsilatFormDialog;
