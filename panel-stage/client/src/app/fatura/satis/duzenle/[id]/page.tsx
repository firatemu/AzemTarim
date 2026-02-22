'use client';

import React, { useState, useEffect } from 'react';
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
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Select,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete, Save, ArrowBack, ToggleOn, ToggleOff } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vadeSuresi?: number;
  satisElemaniId?: string;
}

interface SatisElemani {
  id: string;
  adSoyad: string;
}

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
  satisFiyati: number;
  kdvOrani: number;
  barkod?: string;
  miktar: number;
}

interface FaturaKalemi {
  stokId: string;
  stok?: Stok;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
  iskontoOran: number;
  iskontoTutar: number;
  cokluIskonto?: boolean;
  iskontoFormula?: string;
}

export default function DuzenleSatisFaturasiPage() {
  const router = useRouter();
  const params = useParams();
  const faturaId = params.id as string;

  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<Stok[]>([]);
  const [satisElemanlari, setSatisElemanlari] = useState<SatisElemani[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    faturaNo: '',
    faturaTipi: 'SATIS' as 'SATIS' | 'ALIS',
    cariId: '',
    warehouseId: '',
    tarih: '',
    vade: '',
    durum: 'ACIK' as 'ACIK' | 'ONAYLANDI' | 'IPTAL',
    genelIskontoOran: 0,
    genelIskontoTutar: 0,
    aciklama: '',
    irsaliyeNo: '',
    siparisNo: '',
    satisElemaniId: '',
    dovizCinsi: 'TRY' as 'TRY' | 'USD' | 'EUR' | 'GBP',
    dovizKuru: 1,
    kalemler: [] as FaturaKalemi[],
  });

  const [originalDurum, setOriginalDurum] = useState<'ACIK' | 'ONAYLANDI' | 'IPTAL'>('ACIK');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [autocompleteOpenStates, setAutocompleteOpenStates] = useState<Record<number, boolean>>({});
  const [stockErrorDialog, setStockErrorDialog] = useState<{
    open: boolean;
    products: Array<{
      stokKodu: string;
      stokAdi: string;
      mevcutStok: number;
      talep: number;
    }>;
  }>({ open: false, products: [] });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCariler();
    fetchStoklar();
    fetchSatisElemanlari();
    fetchWarehouses();
    fetchFatura();
  }, [faturaId]);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouse?active=true');
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Ambar listesi alınamadı:', error);
    }
  };

  const fetchFatura = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/fatura/${faturaId}`);
      const fatura = response.data;

      const durumValue = fatura.durum || 'ACIK';
      setOriginalDurum(durumValue);
      setFormData({
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        cariId: fatura.cariId,
        warehouseId: fatura.warehouseId || '',
        tarih: new Date(fatura.tarih).toISOString().split('T')[0],
        vade: fatura.vade ? new Date(fatura.vade).toISOString().split('T')[0] : '',
        durum: durumValue,
        genelIskontoOran: 0,
        genelIskontoTutar: fatura.iskonto || 0,
        aciklama: fatura.aciklama || '',
        irsaliyeNo: fatura.irsaliye?.irsaliyeNo || '',
        siparisNo: fatura.irsaliye?.kaynakSiparis?.siparisNo || fatura.siparisNo || '',
        satisElemaniId: fatura.satisElemaniId || '',
        dovizCinsi: fatura.dovizCinsi || 'TRY',
        dovizKuru: fatura.dovizKuru || 1,
        kalemler: fatura.kalemler.map((k: any) => {
          const baseAmount = k.miktar * k.birimFiyat;
          const iskOran = k.iskontoOrani || 0;
          return {
            stokId: k.stokId,
            stok: k.stok ? {
              id: k.stok.id,
              stokKodu: k.stok.stokKodu,
              stokAdi: k.stok.stokAdi,
              satisFiyati: k.stok.satisFiyati,
              kdvOrani: k.stok.kdvOrani,
              miktar: 0,
            } : undefined,
            miktar: k.miktar,
            birimFiyat: k.birimFiyat,
            kdvOrani: k.kdvOrani,
            iskontoOran: iskOran,
            iskontoTutar: k.iskontoTutari || (baseAmount * iskOran) / 100,
            cokluIskonto: false,
            iskontoFormula: '',
          };
        }),
      });
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Fatura yüklenirken hata oluştu', 'error');
      router.push('/fatura/satis');
    } finally {
      setLoading(false);
    }
  };

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', { params: { limit: 1000 } });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchSatisElemanlari = async () => {
    try {
      const response = await axios.get('/satis-elemani');
      setSatisElemanlari(response.data || []);
    } catch (error) {
      console.error('Satış elemanları yüklenirken hata:', error);
    }
  };

  const fetchStoklar = async () => {
    try {
      const response = await axios.get('/stok', { params: { limit: 1000 } });
      setStoklar(response.data.data || []);
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateMultiDiscount = (baseAmount: number, formula: string): { finalAmount: number; totalDiscount: number; effectiveRate: number } => {
    const discounts = formula.split('+').map(d => parseFloat(d.trim())).filter(d => !isNaN(d) && d > 0);
    if (discounts.length === 0) return { finalAmount: baseAmount, totalDiscount: 0, effectiveRate: 0 };

    let currentAmount = baseAmount;
    let totalDiscount = 0;
    for (const discount of discounts) {
      const discountAmount = (currentAmount * discount) / 100;
      currentAmount -= discountAmount;
      totalDiscount += discountAmount;
    }
    const effectiveRate = baseAmount > 0 ? (totalDiscount / baseAmount) * 100 : 0;
    return { finalAmount: currentAmount, totalDiscount, effectiveRate };
  };

  const handleAddKalem = () => {
    setFormData(prev => ({
      ...prev,
      kalemler: [...prev.kalemler, {
        stokId: '',
        miktar: 1,
        birimFiyat: 0,
        kdvOrani: 20,
        iskontoOran: 0,
        iskontoTutar: 0,
        cokluIskonto: false,
        iskontoFormula: '',
      }],
    }));
  };

  const handleRemoveKalem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kalemler: prev.kalemler.filter((_, i) => i !== index),
    }));
  };

  const handleKalemChange = (index: number, field: keyof FaturaKalemi, value: any) => {
    setFormData(prev => {
      const newKalemler = [...prev.kalemler];
      const kalem = { ...newKalemler[index] };

      if (field === 'stokId') {
        const stok = stoklar.find(s => s.id === value);
        if (stok) {
          kalem.stokId = value;
          kalem.birimFiyat = stok.satisFiyati;
          kalem.kdvOrani = stok.kdvOrani;
        }
      } else if (field === 'cokluIskonto') {
        kalem.cokluIskonto = value;
        if (!value) {
          kalem.iskontoFormula = '';
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        } else if (kalem.iskontoOran > 0) {
          kalem.iskontoFormula = kalem.iskontoOran.toString();
        }
      } else if (field === 'iskontoFormula') {
        kalem.iskontoFormula = value;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const result = calculateMultiDiscount(araToplam, value);
        kalem.iskontoTutar = result.totalDiscount;
        kalem.iskontoOran = result.effectiveRate;
      } else if (field === 'iskontoOran') {
        if (kalem.cokluIskonto) {
          kalem.iskontoFormula = value;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          const result = calculateMultiDiscount(araToplam, value);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoOran = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else if (field === 'iskontoTutar') {
        if (!kalem.cokluIskonto) {
          kalem.iskontoTutar = parseFloat(value) || 0;
          const araToplam = kalem.miktar * kalem.birimFiyat;
          kalem.iskontoOran = araToplam > 0 ? (kalem.iskontoTutar / araToplam) * 100 : 0;
        }
      } else if (field === 'miktar' || field === 'birimFiyat') {
        kalem[field] = parseFloat(value) || 0;
        const araToplam = kalem.miktar * kalem.birimFiyat;
        if (kalem.cokluIskonto && kalem.iskontoFormula) {
          const result = calculateMultiDiscount(araToplam, kalem.iskontoFormula);
          kalem.iskontoTutar = result.totalDiscount;
          kalem.iskontoOran = result.effectiveRate;
        } else {
          kalem.iskontoTutar = (araToplam * kalem.iskontoOran) / 100;
        }
      } else {
        kalem[field] = value;
      }

      newKalemler[index] = kalem;
      return { ...prev, kalemler: newKalemler };
    });
  };

  const calculateKalemTutar = (kalem: FaturaKalemi) => {
    const araToplam = kalem.miktar * kalem.birimFiyat;
    const netTutar = araToplam - kalem.iskontoTutar;
    const kdv = (netTutar * kalem.kdvOrani) / 100;
    return netTutar + kdv;
  };

  const calculateTotals = () => {
    let araToplam = 0;
    let toplamKalemIskontosu = 0;
    let toplamKdv = 0;

    formData.kalemler.forEach(kalem => {
      const kalemAraToplam = kalem.miktar * kalem.birimFiyat;
      araToplam += kalemAraToplam;
      toplamKalemIskontosu += kalem.iskontoTutar;
      const netTutar = kalemAraToplam - kalem.iskontoTutar;
      const kdv = (netTutar * kalem.kdvOrani) / 100;
      toplamKdv += kdv;
    });

    const genelIskonto = formData.genelIskontoTutar || 0;
    const toplamIskonto = toplamKalemIskontosu + genelIskonto;
    const netToplam = araToplam - toplamKalemIskontosu - genelIskonto;
    const genelToplam = netToplam + toplamKdv;

    return { araToplam, toplamKalemIskontosu, genelIskonto, toplamIskonto, toplamKdv, netToplam, genelToplam };
  };

  const handleGenelIskontoOranChange = (value: string) => {
    const oran = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const tutar = (araToplam * oran) / 100;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleGenelIskontoTutarChange = (value: string) => {
    const tutar = parseFloat(value) || 0;
    const araToplam = formData.kalemler.reduce((sum, k) => sum + (k.miktar * k.birimFiyat - k.iskontoTutar), 0);
    const oran = araToplam > 0 ? (tutar / araToplam) * 100 : 0;
    setFormData(prev => ({ ...prev, genelIskontoOran: oran, genelIskontoTutar: tutar }));
  };

  const handleCurrencyChange = async (currency: 'TRY' | 'USD' | 'EUR' | 'GBP') => {
    if (currency === 'TRY') {
      setFormData(prev => ({ ...prev, dovizCinsi: currency, dovizKuru: 1 }));
      return;
    }
    try {
      setFormData(prev => ({ ...prev, dovizCinsi: currency }));
      const response = await axios.get('/fatura/exchange-rate', { params: { currency } });
      if (response.data.rate) {
        setFormData(prev => ({ ...prev, dovizKuru: response.data.rate }));
      }
    } catch (error) {
      console.error('Kur alınamadı:', error);
      showSnackbar('Döviz kuru alınamadı, lütfen manuel giriniz.', 'info');
      setFormData(prev => ({ ...prev, dovizKuru: 0 }));
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.cariId) return showSnackbar('Cari seçimi zorunludur', 'error');
      if (!formData.warehouseId) return showSnackbar('Ambar seçimi zorunludur', 'error');
      const validKalemler = formData.kalemler.filter(k => k.stokId && k.stokId.trim() !== '');
      if (validKalemler.length === 0) return showSnackbar('En az bir kalem eklemelisiniz', 'error');

      setSaving(true);
      await axios.put(`/fatura/${faturaId}`, {
        tarih: new Date(formData.tarih).toISOString(),
        vade: formData.vade ? new Date(formData.vade).toISOString() : null,
        iskonto: Number(formData.genelIskontoTutar) || 0,
        aciklama: formData.aciklama || null,
        warehouseId: formData.warehouseId || null,
        satisElemaniId: formData.satisElemaniId || null,
        dovizCinsi: formData.dovizCinsi,
        dovizKuru: formData.dovizKuru,
        kalemler: validKalemler.map(k => ({
          stokId: k.stokId,
          miktar: Number(k.miktar),
          birimFiyat: Number(k.birimFiyat),
          kdvOrani: Number(k.kdvOrani),
          iskontoOrani: Number(k.iskontoOran) || 0,
          iskontoTutari: Number(k.iskontoTutar) || 0,
        })),
      });

      if (formData.durum !== originalDurum) {
        await axios.put(`/fatura/${faturaId}/durum`, { durum: formData.durum });
      }

      showSnackbar('Fatura başarıyla güncellendi', 'success');
      setTimeout(() => router.push('/fatura/satis'), 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'İşlem sırasında hata oluştu';
      if (msg.includes('Yetersiz stok!') && msg.includes('•')) {
        const products = msg.split('\n').filter((l: string) => l.trim().startsWith('•')).map((l: string) => {
          const m = l.match(/•\s*(.+?)\s*-\s*(.+?):\s*Mevcut stok\s*(\d+),\s*talep edilen\s*(\d+)/);
          return m ? { stokKodu: m[1].trim(), stokAdi: m[2].trim(), mevcutStok: parseInt(m[3]), talep: parseInt(m[4]) } : null;
        }).filter((p: any) => p !== null);
        if (products.length > 0) setStockErrorDialog({ open: true, products });
        else showSnackbar(msg, 'error');
      } else {
        showSnackbar(msg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: formData.dovizCinsi === 'TRY' ? 'TRY' : formData.dovizCinsi
    }).format(amount);
  };

  const totals = calculateTotals();

  const MobileItemCard = ({ kalem, index }: { kalem: FaturaKalemi, index: number }) => (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', position: 'relative', bgcolor: 'var(--card)' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            size="small"
            open={autocompleteOpenStates[index] || false}
            onOpen={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: true }))}
            onClose={() => setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }))}
            value={stoklar.find(s => s.id === kalem.stokId) || null}
            onChange={(_, newValue) => {
              handleKalemChange(index, 'stokId', newValue?.id || '');
              setAutocompleteOpenStates(prev => ({ ...prev, [index]: false }));
            }}
            options={stoklar}
            getOptionLabel={(option) => `${option.stokKodu} - ${option.stokAdi}`}
            renderInput={(params) => <TextField {...params} label="Stok / Hizmet" placeholder="Birim fiyat için de stok seçilmeli" />}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
        <IconButton size="small" color="error" onClick={() => handleRemoveKalem(index)} sx={{ ml: 1, mt: 0.5 }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField label="Miktar" type="number" size="small" value={kalem.miktar} onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)} />
        <TextField label="Birim Fiyat" type="number" size="small" value={kalem.birimFiyat} onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField label="KDV %" type="number" size="small" value={kalem.kdvOrani} onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Çoklu İskonto:</Typography>
          <IconButton size="small" onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)} sx={{ color: kalem.cokluIskonto ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {kalem.cokluIskonto ? <ToggleOn /> : <ToggleOff />}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        {kalem.cokluIskonto ? (
          <TextField label="İskonto (10+5)" size="small" value={kalem.iskontoFormula || ''} onChange={(e) => /^[\d+]*$/.test(e.target.value) && handleKalemChange(index, 'iskontoFormula', e.target.value)} helperText={kalem.iskontoOran > 0 ? `%${kalem.iskontoOran.toFixed(2)}` : ''} />
        ) : (
          <TextField label="İskonto Oranı %" type="number" size="small" value={kalem.iskontoOran || ''} onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)} />
        )}
        <TextField label="İskonto Tutarı" type="number" size="small" value={kalem.iskontoTutar || ''} onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)} disabled={kalem.cokluIskonto} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px dashed var(--border)', mt: 1 }}>
        <Typography variant="subtitle2" color="var(--muted-foreground)">Satır Toplamı:</Typography>
        <Typography variant="subtitle1" fontWeight="700" color="var(--primary)">{formatCurrency(calculateKalemTutar(kalem))}</Typography>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Fatura yükleniyor...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => router.push('/fatura/satis')}
            sx={{ bgcolor: 'var(--secondary)', color: 'var(--secondary-foreground)', '&:hover': { bgcolor: 'var(--secondary-hover)' }, width: isMobile ? 40 : 48, height: isMobile ? 40 : 48 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" sx={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Satış Faturası Düzenle
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--muted-foreground)' }}>{formData.faturaNo}</Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', bgcolor: 'var(--card)' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)', mb: 2 }}>Fatura Bilgileri</Typography>
            <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <TextField label="Fatura No" value={formData.faturaNo} disabled fullWidth />
            <TextField type="date" label="Tarih" value={formData.tarih} onChange={(e) => setFormData(p => ({ ...p, tarih: e.target.value }))} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField type="date" label="Vade" value={formData.vade} onChange={(e) => setFormData(p => ({ ...p, vade: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />

            <FormControl required fullWidth>
              <InputLabel>Ambar</InputLabel>
              <Select value={formData.warehouseId} onChange={(e) => setFormData(p => ({ ...p, warehouseId: e.target.value }))} label="Ambar">
                {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name} {w.isDefault && '(Varsayılan)'}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl required fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select value={formData.durum} onChange={(e) => setFormData(p => ({ ...p, durum: e.target.value as any }))} label="Durum">
                <MenuItem value="ACIK">Beklemede</MenuItem>
                <MenuItem value="ONAYLANDI">Onaylandı</MenuItem>
                <MenuItem value="IPTAL">İptal</MenuItem>
              </Select>
            </FormControl>

            <FormControl required fullWidth>
              <InputLabel>Döviz</InputLabel>
              <Select value={formData.dovizCinsi} onChange={(e) => handleCurrencyChange(e.target.value as any)} label="Döviz">
                <MenuItem value="TRY">Türk Lirası (₺)</MenuItem>
                <MenuItem value="USD">Amerikan Doları ($)</MenuItem>
                <MenuItem value="EUR">Euro (€)</MenuItem>
                <MenuItem value="GBP">İngiliz Sterlini (£)</MenuItem>
              </Select>
            </FormControl>

            <TextField type="number" label="Döviz Kuru" value={formData.dovizKuru} onChange={(e) => setFormData(p => ({ ...p, dovizKuru: parseFloat(e.target.value) || 0 }))} disabled={formData.dovizCinsi === 'TRY'} required fullWidth inputProps={{ step: "0.0001", min: "0" }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            <Box sx={{ flex: isMobile ? '1 1 100%' : '2 1 400px' }}>
              <Autocomplete
                fullWidth
                value={cariler.find(c => c.id === formData.cariId) || null}
                onChange={(_, newValue) => setFormData(p => ({ ...p, cariId: newValue?.id || '', satisElemaniId: newValue?.satisElemaniId || p.satisElemaniId }))}
                options={cariler}
                getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                renderInput={(p) => <TextField {...p} label="Cari Seçiniz" required />}
              />
            </Box>
            <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 200px' }}>
              <Autocomplete
                fullWidth
                value={satisElemanlari.find(s => s.id === formData.satisElemaniId) || null}
                onChange={(_, newValue) => setFormData(p => ({ ...p, satisElemaniId: newValue?.id || '' }))}
                options={satisElemanlari}
                getOptionLabel={(o) => o.adSoyad}
                renderInput={(p) => <TextField {...p} label="Satış Elemanı" />}
              />
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Fatura Kalemleri</Typography>
              <Button variant="contained" onClick={handleAddKalem} sx={{ bgcolor: 'var(--primary)', fontWeight: 600, textTransform: 'none' }}>+ Yeni Kalem Ekle</Button>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />

            {isMobile ? (
              <Box>{formData.kalemler.map((kalem, index) => <MobileItemCard key={index} kalem={kalem} index={index} />)}</Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="25%" sx={{ fontWeight: 600 }}>Stok</TableCell>
                      <TableCell width="8%" sx={{ fontWeight: 600 }}>Miktar</TableCell>
                      <TableCell width="10%" sx={{ fontWeight: 600 }}>Birim Fiyat</TableCell>
                      <TableCell width="8%" sx={{ fontWeight: 600 }}>KDV %</TableCell>
                      <TableCell width="12%" sx={{ fontWeight: 600 }}>İskonto</TableCell>
                      <TableCell width="12%" sx={{ fontWeight: 600 }}>İsk. Tutar</TableCell>
                      <TableCell width="12%" align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                      <TableCell width="5%" align="center" sx={{ fontWeight: 600 }}>Sil</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.kalemler.map((kalem, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            value={stoklar.find(s => s.id === kalem.stokId) || null}
                            onChange={(_, newValue) => handleKalemChange(index, 'stokId', newValue?.id || '')}
                            options={stoklar}
                            getOptionLabel={(o) => `${o.stokKodu} - ${o.stokAdi}`}
                            renderInput={(p) => <TextField {...p} placeholder="Stok ara..." />}
                          />
                        </TableCell>
                        <TableCell><TextField fullWidth type="number" size="small" value={kalem.miktar} onChange={(e) => handleKalemChange(index, 'miktar', e.target.value)} /></TableCell>
                        <TableCell><TextField fullWidth type="number" size="small" value={kalem.birimFiyat} onChange={(e) => handleKalemChange(index, 'birimFiyat', e.target.value)} /></TableCell>
                        <TableCell><TextField fullWidth type="number" size="small" value={kalem.kdvOrani} onChange={(e) => handleKalemChange(index, 'kdvOrani', e.target.value)} /></TableCell>
                        <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TextField fullWidth size="small" value={kalem.cokluIskonto ? (kalem.iskontoFormula || '') : (kalem.iskontoOran || '')} onChange={(e) => handleKalemChange(index, 'iskontoOran', e.target.value)} />
                          <IconButton size="small" onClick={() => handleKalemChange(index, 'cokluIskonto', !kalem.cokluIskonto)} color={kalem.cokluIskonto ? "primary" : "default"}>
                            {kalem.cokluIskonto ? <ToggleOn /> : <ToggleOff />}
                          </IconButton>
                        </TableCell>
                        <TableCell><TextField fullWidth type="number" size="small" value={kalem.iskontoTutar} onChange={(e) => handleKalemChange(index, 'iskontoTutar', e.target.value)} disabled={kalem.cokluIskonto} /></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight="bold" color="primary">{formatCurrency(calculateKalemTutar(kalem))}</Typography></TableCell>
                        <TableCell align="center"><IconButton size="small" color="error" onClick={() => handleRemoveKalem(index)}><Delete fontSize="small" /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, maxWidth: isMobile ? '100%' : 400 }}>
              <TextField fullWidth multiline rows={4} label="Açıklama / Notlar" value={formData.aciklama} onChange={(e) => setFormData(p => ({ ...p, aciklama: e.target.value }))} placeholder="Fatura ile ile ilgili notlarınızı buraya ekleyebilirsiniz..." />
            </Box>

            <Box sx={{ flex: 1, maxWidth: isMobile ? '100%' : 400 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>Hesap Özeti</Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="var(--muted-foreground)">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatCurrency(totals.araToplam)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="var(--muted-foreground)">Toplam İskonto:</Typography>
                    <Typography variant="body2" fontWeight="600" color="error">-{formatCurrency(totals.toplamIskonto)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="var(--muted-foreground)">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="800">Genel Toplam:</Typography>
                    <Typography variant="h6" fontWeight="800" color="var(--primary)">{formatCurrency(totals.genelToplam)}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="outlined" size="large" onClick={() => router.push('/fatura/satis')} sx={{ borderRadius: 'var(--radius)', px: 4, textTransform: 'none' }}>İptal</Button>
            <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} disabled={saving} sx={{ bgcolor: 'var(--primary)', borderRadius: 'var(--radius)', px: 4, textTransform: 'none', '&:hover': { bgcolor: 'var(--primary-hover)' } }}>
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Dialog open={stockErrorDialog.open} onClose={() => setStockErrorDialog({ open: false, products: [] })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'var(--destructive)', fontWeight: 700 }}>⚠️ Yetersiz Stok Uyarısı</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Fatura oluşturulurken bazı ürünlerin stok miktarının yetersiz olduğu tespit edildi:</DialogContentText>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead><TableRow><TableCell>Ürün</TableCell><TableCell align="right">Mevcut</TableCell><TableCell align="right">Talep</TableCell><TableCell align="right">Fark</TableCell></TableRow></TableHead>
              <TableBody>
                {stockErrorDialog.products.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell><Typography variant="body2" fontWeight="600">{p.stokAdi}</Typography><Typography variant="caption" color="text.secondary">{p.stokKodu}</Typography></TableCell>
                    <TableCell align="right">{p.mevcutStok}</TableCell>
                    <TableCell align="right">{p.talep}</TableCell>
                    <TableCell align="right" sx={{ color: 'var(--destructive)', fontWeight: 600 }}>{p.mevcutStok - p.talep}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setStockErrorDialog({ open: false, products: [] })} variant="contained">Anladım</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 'var(--radius)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
}
