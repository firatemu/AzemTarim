'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
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
  Grid,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Payment,
  TrendingUp,
  TrendingDown,
  Badge,
  Person,
  ContactPhone,
  LocationOn,
  Work,
  AccountBalance,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import StandardCard from '@/components/common/StandardCard';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import MaasTab from './components/MaasTab';
import AvansTab from './components/AvansTab';

interface Personel {
  id: string;
  personelKodu: string;
  tcKimlikNo: string;
  ad: string;
  soyad: string;
  dogumTarihi: string | null;
  cinsiyet: 'ERKEK' | 'KADIN' | 'BELIRTILMEMIS' | null;
  medeniDurum: 'BEKAR' | 'EVLI' | null;
  telefon: string;
  email: string | null;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  pozisyon: string;
  departman: string | null;
  iseBaslamaTarihi: string;
  istenCikisTarihi: string | null;
  aktif: boolean;
  maas: number;
  prim: number | null;
  maasGunu: number | null;
  sgkNo: string | null;
  ibanNo: string | null;
  bakiye: number;
  aciklama: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: string; fullName: string; username: string };
  updatedByUser?: { id: string; fullName: string; username: string };
  _count?: { odemeler: number };
}

interface Stats {
  toplamPersonel: number;
  toplamMaasBordro: number;
  toplamBakiye: number;
  departmanlar: Array<{
    departman: string;
    personelSayisi: number;
    toplamMaas: number;
  }>;
}

// Memoized dialog component
const PersonelDialog = memo(({
  personel,
  onSave,
  onClose
}: {
  personel: Partial<Personel> | null;
  onSave: (data: any) => void;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const isEdit = !!personel?.id;
  const [formData, setFormData] = useState({
    personelKodu: personel?.personelKodu || '',
    tcKimlikNo: personel?.tcKimlikNo || '',
    ad: personel?.ad || '',
    soyad: personel?.soyad || '',
    dogumTarihi: personel?.dogumTarihi ? personel.dogumTarihi.split('T')[0] : '',
    cinsiyet: personel?.cinsiyet || 'BELIRTILMEMIS',
    medeniDurum: personel?.medeniDurum || '',
    telefon: personel?.telefon || '',
    email: personel?.email || '',
    adres: personel?.adres || '',
    il: personel?.il || '',
    ilce: personel?.ilce || '',
    pozisyon: personel?.pozisyon || '',
    departman: personel?.departman || '',
    iseBaslamaTarihi: personel?.iseBaslamaTarihi ? personel.iseBaslamaTarihi.split('T')[0] : new Date().toISOString().split('T')[0],
    istenCikisTarihi: personel?.istenCikisTarihi ? personel.istenCikisTarihi.split('T')[0] : '',
    maas: personel?.maas?.toString() || '',
    prim: personel?.prim?.toString() || '',
    maasGunu: personel?.maasGunu?.toString() || '',
    sgkNo: personel?.sgkNo || '',
    ibanNo: personel?.ibanNo || '',
    aciklama: personel?.aciklama || '',
  });

  // personel değiştiğinde formData'yı güncelle
  useEffect(() => {
    setFormData({
      personelKodu: personel?.personelKodu || '',
      tcKimlikNo: personel?.tcKimlikNo || '',
      ad: personel?.ad || '',
      soyad: personel?.soyad || '',
      dogumTarihi: personel?.dogumTarihi ? personel.dogumTarihi.split('T')[0] : '',
      cinsiyet: personel?.cinsiyet || 'BELIRTILMEMIS',
      medeniDurum: personel?.medeniDurum || '',
      telefon: personel?.telefon || '',
      email: personel?.email || '',
      adres: personel?.adres || '',
      il: personel?.il || '',
      ilce: personel?.ilce || '',
      pozisyon: personel?.pozisyon || '',
      departman: personel?.departman || '',
      iseBaslamaTarihi: personel?.iseBaslamaTarihi ? personel.iseBaslamaTarihi.split('T')[0] : new Date().toISOString().split('T')[0],
      istenCikisTarihi: personel?.istenCikisTarihi ? personel.istenCikisTarihi.split('T')[0] : '',
      maas: personel?.maas?.toString() || '',
      prim: personel?.prim?.toString() || '',
      maasGunu: personel?.maasGunu?.toString() || '',
      sgkNo: personel?.sgkNo || '',
      ibanNo: personel?.ibanNo || '',
      aciklama: personel?.aciklama || '',
    });
  }, [personel]);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      personelKodu: formData.personelKodu && formData.personelKodu.trim().length > 0 ? formData.personelKodu : undefined,
      tcKimlikNo: formData.tcKimlikNo && formData.tcKimlikNo.trim().length > 0 ? formData.tcKimlikNo : undefined,
      telefon: formData.telefon && formData.telefon.trim().length > 0 ? formData.telefon : undefined,
      email: formData.email && formData.email.trim().length > 0 ? formData.email : undefined,
      adres: formData.adres && formData.adres.trim().length > 0 ? formData.adres : undefined,
      il: formData.il && formData.il.trim().length > 0 ? formData.il : undefined,
      ilce: formData.ilce && formData.ilce.trim().length > 0 ? formData.ilce : undefined,
      pozisyon: formData.pozisyon && formData.pozisyon.trim().length > 0 ? formData.pozisyon : undefined,
      departman: formData.departman && formData.departman.trim().length > 0 ? formData.departman : undefined,
      sgkNo: formData.sgkNo && formData.sgkNo.trim().length > 0 ? formData.sgkNo : undefined,
      ibanNo: formData.ibanNo && formData.ibanNo.trim().length > 0 ? formData.ibanNo : undefined,
      aciklama: formData.aciklama && formData.aciklama.trim().length > 0 ? formData.aciklama : undefined,
      maas: formData.maas && formData.maas.trim().length > 0 ? parseFloat(formData.maas) : undefined,
      prim: formData.prim && formData.prim.trim().length > 0 ? parseFloat(formData.prim) : undefined,
      maasGunu: formData.maasGunu && formData.maasGunu.trim().length > 0 ? parseInt(formData.maasGunu) : undefined,
      dogumTarihi: formData.dogumTarihi || undefined,
      iseBaslamaTarihi: formData.iseBaslamaTarihi || undefined,
      istenCikisTarihi: formData.istenCikisTarihi || undefined,
      cinsiyet: formData.cinsiyet && formData.cinsiyet !== 'BELIRTILMEMIS' ? formData.cinsiyet : undefined,
      medeniDurum: formData.medeniDurum || undefined,
    };
    onSave(submitData);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle component="div" sx={{ bgcolor: 'background.neutral', pb: 2 }}>
        <Typography variant="h6" fontWeight={800}>{isEdit ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</Typography>
        <Typography variant="caption" color="text.secondary">Personel temel ve finansal bilgilerini yönetin</Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Kimlik Bilgileri */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Kimlik Bilgileri
              </Typography>
            </Box>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Personel Kodu"
              value={formData.personelKodu}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('personelKodu', e.target.value)}
              placeholder="Otomatik"
              helperText={formData.personelKodu ? "Önerilen kod (değiştirilebilir veya silinebilir)" : "Otomatik üretilecek"}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="TC Kimlik No"
              value={formData.tcKimlikNo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tcKimlikNo', e.target.value)}
              inputProps={{ maxLength: 11 }}
              placeholder="11 haneli TC no"
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Ad"
              value={formData.ad}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ad', e.target.value)}
              required
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Soyad"
              value={formData.soyad}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('soyad', e.target.value)}
              required
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Doğum Tarihi"
              value={formData.dogumTarihi}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dogumTarihi', e.target.value)}
              InputLabelProps={{ shrink: true }}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Cinsiyet</InputLabel>
              <Select
                value={formData.cinsiyet}
                onChange={(e: any) => handleChange('cinsiyet', e.target.value)}
                label="Cinsiyet"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="BELIRTILMEMIS">Belirtilmemiş</MenuItem>
                <MenuItem value="ERKEK">Erkek</MenuItem>
                <MenuItem value="KADIN">Kadın</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Medeni Durum</InputLabel>
              <Select
                value={formData.medeniDurum}
                onChange={(e: any) => handleChange('medeniDurum', e.target.value)}
                label="Medeni Durum"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Belirtilmemiş</MenuItem>
                <MenuItem value="BEKAR">Bekar</MenuItem>
                <MenuItem value="EVLI">Evli</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* İletişim Bilgileri */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
              <ContactPhone color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                İletişim Bilgileri
              </Typography>
            </Box>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Telefon"
              value={formData.telefon}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('telefon', e.target.value)}
              placeholder="05xx xxxx xxx"
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="email"
              label="E-posta"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
              placeholder="ornek@mail.com"
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Adres"
              value={formData.adres}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('adres', e.target.value)}
              multiline
              rows={2}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="İl"
              value={formData.il}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('il', e.target.value)}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="İlçe"
              value={formData.ilce}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ilce', e.target.value)}
              className="form-control-textfield"
            />
          </Grid>

          {/* İş Bilgileri */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
              <Work color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                İş Bilgileri
              </Typography>
            </Box>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Pozisyon"
              value={formData.pozisyon}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('pozisyon', e.target.value)}
              placeholder="Örn: Kıdemli Yazılım Geliştirici"
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Departman"
              value={formData.departman}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('departman', e.target.value)}
              placeholder="Örn: Bilgi Teknolojileri"
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="İşe Başlama Tarihi"
              value={formData.iseBaslamaTarihi}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('iseBaslamaTarihi', e.target.value)}
              InputLabelProps={{ shrink: true }}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="İşten Çıkış Tarihi"
              value={formData.istenCikisTarihi}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('istenCikisTarihi', e.target.value)}
              InputLabelProps={{ shrink: true }}
              className="form-control-textfield"
            />
          </Grid>

          {/* Maaş Bilgileri */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
              <AccountBalance color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Maaş ve Banka Bilgileri
              </Typography>
            </Box>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Maaş"
              value={formData.maas}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('maas', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Prim (Aylık)"
              value={formData.prim}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('prim', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Maaş Ödeme Günü</InputLabel>
              <Select
                value={formData.maasGunu}
                onChange={(e: any) => handleChange('maasGunu', e.target.value)}
                label="Maaş Ödeme Günü"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                <MenuItem value="0">Ay Sonu</MenuItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <MenuItem key={day} value={day.toString()}>
                    Her Ayın {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="SGK No"
              value={formData.sgkNo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('sgkNo', e.target.value)}
              className="form-control-textfield"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="IBAN"
              value={formData.ibanNo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('ibanNo', e.target.value)}
              className="form-control-textfield"
            />
          </Grid>

          {/* Açıklama */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Açıklama"
              value={formData.aciklama}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('aciklama', e.target.value)}
              multiline
              rows={3}
              className="form-control-textfield"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            borderRadius: 2,
            px: 4,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          {isEdit ? 'Güncelle' : 'Personel Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PersonelDialog.displayName = 'PersonelDialog';

export default function PersonelPage() {
  const theme = useTheme();
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(null);
  const [viewPersonel, setViewPersonel] = useState<Personel | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Personel | null>(null);
  const { enqueueSnackbar } = useSnackbar();


  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAktif, setFilterAktif] = useState<string>('');
  const [filterDepartman, setFilterDepartman] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filterAktif, filterDepartman]);

  const fetchPersoneller = async () => {
    try {
      const params: Record<string, any> = {};
      if (filterAktif !== '') params.aktif = filterAktif;
      if (filterDepartman) params.departman = filterDepartman;

      const response = await axios.get('/employees', { params });
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setPersoneller(data);
    } catch (error) {
      console.error('Personeller yüklenirken hata:', error);
      enqueueSnackbar('Personeller yüklenemedi', { variant: 'error' });
    }
  };

  const fetchStats = async () => {
    try {
      const params: Record<string, any> = {};
      if (filterAktif !== '') params.aktif = filterAktif;
      if (filterDepartman) params.departman = filterDepartman;

      const response = await axios.get('/employees/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPersoneller(), fetchStats()]);
    setLoading(false);
  };

  const handleOpenDialog = async (personel?: Personel) => {
    if (!personel) {
      // Yeni kayıt için bir sonraki kodu backend'den al
      let nextCode = '';
      try {
        const response = await axios.get('/code-templates/preview-code/PERSONNEL');
        nextCode = response.data.nextCode || '';
      } catch (error) {
        console.log('Otomatik kod alınamadı, boş bırakılacak');
      }

      // Kod ile yeni bir partial personel objesi oluştur
      setSelectedPersonel({ personelKodu: nextCode || '' } as any);
    } else {
      setSelectedPersonel(personel);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPersonel(null);
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedPersonel?.id) {
        await axios.put(`/employees/${selectedPersonel.id}`, formData);
        enqueueSnackbar('Personel başarıyla güncellendi', { variant: 'success' });
      } else {
        await axios.post('/employees', formData);
        enqueueSnackbar('Personel başarıyla eklendi', { variant: 'success' });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Kayıt sırasında bir hata oluştu',
        { variant: 'error' }
      );
    }
  };

  const handleView = async (personel: Personel) => {
    try {
      const response = await axios.get(`/employees/${personel.id}`);
      setViewPersonel(response.data);
      setActiveTab(0);
      setOpenViewDialog(true);
    } catch (error) {
      console.error('Personel detayları yüklenirken hata:', error);
      enqueueSnackbar('Detaylar yüklenemedi', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`/employees/${deleteTarget.id}`);
      enqueueSnackbar('Personel kaydı silindi', { variant: 'success' });
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      console.error('Silme hatası:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Silme sırasında bir hata oluştu',
        { variant: 'error' }
      );
    }
  };

  const filteredPersoneller = useMemo(() => {
    return personeller.filter((p: Personel) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.ad.toLowerCase().includes(searchLower) ||
        p.soyad.toLowerCase().includes(searchLower) ||
        p.personelKodu.toLowerCase().includes(searchLower) ||
        p.tcKimlikNo.includes(searchTerm) ||
        (p.pozisyon && p.pozisyon.toLowerCase().includes(searchLower)) ||
        (p.departman && p.departman.toLowerCase().includes(searchLower))
      );
    });
  }, [personeller, searchTerm]);

  const departmanlar = useMemo<string[]>(() => {
    const depts = new Set(
      personeller
        .map((p: Personel) => p.departman)
        .filter((dept): dept is string => Boolean(dept))
    );
    return Array.from(depts);
  }, [personeller]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StandardPage maxWidth={false}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              Personel Yönetimi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Şirket çalışanlarınızın bilgilerini, maaşlarını ve bakiyelerini takip edin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              fontWeight: 800,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
              '&:hover': {
                boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.32)}`,
              }
            }}
          >
            Yeni Personel Ekle
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StandardCard variant="neutral">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Person sx={{ color: 'primary.main', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                    Toplam Personel
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {stats.toplamPersonel}
                </Typography>
              </StandardCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StandardCard variant="neutral">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <Payment sx={{ color: 'secondary.main', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                    Aylık Maaş Bordrosu
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                  ₺{Number(stats.toplamMaasBordro).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </StandardCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StandardCard variant="neutral">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                    Toplam Bakiye
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: Number(stats.toplamBakiye) >= 0 ? 'success.main' : 'error.main' }}>
                  ₺{Number(stats.toplamBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Typography>
              </StandardCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StandardCard variant="neutral">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <Work sx={{ color: 'info.main', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                    Departman Sayısı
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
                  {stats.departmanlar.length}
                </Typography>
              </StandardCard>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <StandardCard sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Personel ara... (Ad, Soyad, Kod, TC, Pozisyon)"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              size="small"
              className="form-control-textfield"
            />
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterAktif}
                onChange={(e: any) => setFilterAktif(e.target.value)}
                label="Durum"
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="true">Aktif</MenuItem>
                <MenuItem value="false">Pasif</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Departman</InputLabel>
              <Select
                value={filterDepartman}
                onChange={(e: any) => setFilterDepartman(e.target.value)}
                label="Departman"
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {departmanlar.map((dept: string) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </StandardCard>

        {/* Table */}
        <StandardCard noPadding>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Personel</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>TC Kimlik No</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Pozisyon / Departman</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>İletişim</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Maaş</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Bakiye</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Durum</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPersoneller.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        Kayıt bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPersoneller.map((personel: Personel) => (
                    <TableRow key={personel.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{personel.ad} {personel.soyad}</Typography>
                        <Typography variant="caption" color="text.secondary">{personel.personelKodu}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{personel.tcKimlikNo || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{personel.pozisyon}</Typography>
                        {personel.departman && (
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>{personel.departman}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{personel.telefon}</Typography>
                        <Typography variant="caption" color="text.secondary">{personel.email}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₺{Number(personel.maas).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`₺${Number(personel.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                          size="small"
                          color={Number(personel.bakiye) >= 0 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={personel.aktif ? 'Aktif' : 'Pasif'}
                          color={personel.aktif ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Görüntüle">
                            <IconButton size="small" onClick={() => handleView(personel)} sx={{ color: 'info.main' }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => handleOpenDialog(personel)} sx={{ color: 'warning.main' }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              sx={{ color: 'error.main' }}
                              onClick={() => {
                                setDeleteTarget(personel);
                                setOpenDeleteDialog(true);
                              }}
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

        {/* Add/Edit Dialog */}
        {openDialog && (
          <PersonelDialog
            personel={selectedPersonel}
            onSave={handleSave}
            onClose={handleCloseDialog}
          />
        )}

        {/* View Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle component="div" sx={{ bgcolor: 'background.neutral', pb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Personel Detayları</Typography>
            <Typography variant="caption" color="text.secondary">Personel kartı ve işlem geçmişi</Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {viewPersonel && (
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={(_: any, val: number) => setActiveTab(val)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 3,
                    bgcolor: 'background.neutral',
                    '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                  }}
                >
                  <Tab label="Genel Bilgiler" sx={{ fontWeight: 700, py: 2 }} />
                  <Tab label="Maaş Planları" sx={{ fontWeight: 700, py: 2 }} />
                  <Tab label="Avanslar" sx={{ fontWeight: 700, py: 2 }} />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && (
                    <Grid container spacing={4}>
                      {/* Kişisel Bilgiler */}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Person color="primary" fontSize="small" />
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                            Kişisel Bilgiler
                          </Typography>
                        </Box>
                        <Divider />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Personel Kodu</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.personelKodu}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>TC Kimlik No</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.tcKimlikNo || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Durum</Typography>
                        <Box>
                          <Chip
                            label={viewPersonel.aktif ? 'AKTİF' : 'PASİF'}
                            color={viewPersonel.aktif ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 800, borderRadius: 1 }}
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Ad Soyad</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.ad} {viewPersonel.soyad}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Doğum Tarihi</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {viewPersonel.dogumTarihi ? new Date(viewPersonel.dogumTarihi).toLocaleDateString('tr-TR') : '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Cinsiyet / Medeni Durum</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.cinsiyet || '-'} / {viewPersonel.medeniDurum || '-'}</Typography>
                      </Grid>

                      {/* İletişim Bilgileri */}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                          <ContactPhone color="primary" fontSize="small" />
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                            İletişim Bilgileri
                          </Typography>
                        </Box>
                        <Divider />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Telefon</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{viewPersonel.telefon || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>E-posta</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.email || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Adres</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {viewPersonel.adres || '-'} {viewPersonel.ilce && `${viewPersonel.ilce}/`}{viewPersonel.il}
                        </Typography>
                      </Grid>

                      {/* İş Bilgileri */}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                          <Work color="primary" fontSize="small" />
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                            İş Bilgileri
                          </Typography>
                        </Box>
                        <Divider />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Pozisyon</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.pozisyon || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Departman</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.departman || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>İşe Başlama / Ayrılış</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {new Date(viewPersonel.iseBaslamaTarihi).toLocaleDateString('tr-TR')}
                          {viewPersonel.istenCikisTarihi && ` - ${new Date(viewPersonel.istenCikisTarihi).toLocaleDateString('tr-TR')}`}
                        </Typography>
                      </Grid>

                      {/* Maaş ve Finans */}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                          <AccountBalance color="primary" fontSize="small" />
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                            Maaş ve Finans Bilgileri
                          </Typography>
                        </Box>
                        <Divider />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Maaş</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'info.main' }}>
                          ₺{Number(viewPersonel.maas).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Bakiye</Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 800 }}
                          color={Number(viewPersonel.bakiye) >= 0 ? 'success.main' : 'error.main'}
                        >
                          ₺{Number(viewPersonel.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Maaş Günü</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {viewPersonel.maasGunu === 0 ? 'Ay Sonu' : `Her Ayın ${viewPersonel.maasGunu}. Günü`}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SGK No</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{viewPersonel.sgkNo || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>IBAN</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewPersonel.ibanNo || '-'}</Typography>
                      </Grid>

                      {/* Açıklama */}
                      {viewPersonel.aciklama && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Açıklama</Typography>
                          <Typography variant="body2" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1.5, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                            {viewPersonel.aciklama}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {activeTab === 1 && <MaasTab personelId={viewPersonel.id} />}
                  {activeTab === 2 && <AvansTab personelId={viewPersonel.id} />}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Button onClick={() => setOpenViewDialog(false)} variant="contained" sx={{ borderRadius: 1.5 }}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Delete color="error" />
              <Typography variant="h6" fontWeight={800} color="error.main">Personel Silinecek</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {deleteTarget && `${deleteTarget.ad} ${deleteTarget.soyad}`} adlı personeli silmek istediğinizden emin misiniz?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bu işlem personelin tüm kayıtlarını sistemden kalıcı olarak silecektir.
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, border: '1px dashed', borderColor: 'error.main' }}>
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ⚠️ BU İŞLEM GERİ ALINAMAZ!
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" color="inherit" sx={{ borderRadius: 1.5, fontWeight: 700 }}>İptal</Button>
            <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 800, px: 3 }}>
              Evet, Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </StandardPage>
  );
}

