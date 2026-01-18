'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  IconButton,
  Collapse,
  Button,
  ButtonGroup,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Inventory,
  People,
  Receipt,
  TrendingUp,
  Notifications,
  Payment,
  AttachMoney,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  AccountBalance,
  Description,
  ArrowForward,
  Today,
  Event,
  DateRange,
  NotificationsActive,
  Email,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Stats cards ve sales data artık API'den çekilecek

interface GunlukHatirlatici {
  cekSenetler: any[];
  personelOdemeleri: any[];
  vadesiGecenFaturalar: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [hatirlaticilar, setHatirlaticilar] = useState<GunlukHatirlatici>({
    cekSenetler: [],
    personelOdemeleri: [],
    vadesiGecenFaturalar: [],
  });
  const [hatirlaticiOpen, setHatirlaticiOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filtre, setFiltre] = useState<'bugun' | 'yarin' | 'bu-hafta'>('bugun');
  const [sesAktif, setSesAktif] = useState(false);
  
  // Dashboard istatistikleri
  const [stats, setStats] = useState({
    toplamStok: 0,
    cariSayisi: 0,
    aylikSatis: 0,
    karMarji: 0,
  });
  const [salesData, setSalesData] = useState<Array<{ name: string; satis: number; kar: number }>>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Toplam hatırlatıcı sayısı
  const toplamHatirlatici = 
    hatirlaticilar.cekSenetler.length + 
    hatirlaticilar.personelOdemeleri.length + 
    hatirlaticilar.vadesiGecenFaturalar.length;

  useEffect(() => {
    fetchGunlukHatirlaticilar();
    fetchDashboardStats();
  }, [filtre]);

  useEffect(() => {
    // Ses bildirimi (sadece ilk yüklemede ve hatırlatıcı varsa)
    if (sesAktif && toplamHatirlatici > 0) {
      playNotificationSound();
    }
  }, [hatirlaticilar, sesAktif, toplamHatirlatici]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Ses çalınamadı:', err));
    } catch (error) {
      console.log('Ses özelliği desteklenmiyor');
    }
  };

  const fetchGunlukHatirlaticilar = async () => {
    try {
      setLoading(true);
      
      let baslangic = new Date();
      let bitis = new Date();
      
      // Saat bilgisini sıfırla (timezone sorununu önlemek için)
      baslangic.setHours(0, 0, 0, 0);
      bitis.setHours(23, 59, 59, 999);
      
      // Filtre'ye göre tarih aralığı belirle
      if (filtre === 'bugun') {
        // Bugün
      } else if (filtre === 'yarin') {
        baslangic.setDate(baslangic.getDate() + 1);
        bitis.setDate(bitis.getDate() + 1);
      } else if (filtre === 'bu-hafta') {
        bitis.setDate(bitis.getDate() + 7);
      }
      
      // Tarihleri YYYY-MM-DD formatına çevir (yerel saat kullanarak)
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const baslangicStr = formatDate(baslangic);
      const bitisStr = formatDate(bitis);
      
      // Vadesi gelen çek/senetler (TÜM - ödenmemiş olanlar)
      let cekSenetler: any[] = [];
      try {
        console.log('🔍 Çek/Senet sorgusu:', { 
          vadeBaslangic: baslangicStr, 
          vadeBitis: bitisStr
        });
        const cekSenetRes = await axios.get('/cek-senet', {
          params: { 
            vadeBaslangic: baslangicStr,
            vadeBitis: bitisStr,
            // portfoyTip yok - hem ALACAK hem BORC getir
            // durum koşulu yok - hepsini getir, frontend'de filtrele
          },
        });
        // Durumu ODENDI veya TAHSIL_EDILDI olmayanları al
        const allCekler = cekSenetRes.data || [];
        cekSenetler = allCekler.filter((cs: any) => 
          cs.durum !== 'TAHSIL_EDILDI' && // Tahsil edilmiş ALACAK'ları çıkar
          cs.durum !== 'ODENDI'            // Ödenmiş BORC'ları çıkar
        );
        
        console.log('✅ Çek/Senet API yanıtı:', {
          status: cekSenetRes.status,
          dataType: typeof cekSenetRes.data,
          isArray: Array.isArray(cekSenetRes.data),
          totalCount: allCekler.length,
          filteredCount: cekSenetler.length,
          excludedStatuses: ['TAHSIL_EDILDI', 'ODENDI'],
          data: cekSenetler
        });
      } catch (cekSenetError: any) {
        console.error('❌ Çek/Senet hatırlatıcıları yüklenemedi:', {
          message: cekSenetError.message,
          response: cekSenetError.response?.data,
          status: cekSenetError.response?.status
        });
      }

      // Bugün maaş günü olan personeller
      const gun = new Date().getDate();
      const personelRes = await axios.get('/personel', {
        params: { aktif: true },
      });
      const personelOdemeleri = personelRes.data.filter((p: any) => {
        if (!p.maasGunu) return false;
        if (p.maasGunu === 0) {
          // Ay sonu kontrolü
          const sonGun = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          return gun === sonGun;
        }
        return p.maasGunu === gun;
      });

      // Vadesi geçmiş faturalar
      let vadesiGecenFaturalar: any[] = [];
      try {
        const faturaRes = await axios.get('/fatura', {
          params: { limit: 100 },
        });
        
        vadesiGecenFaturalar = faturaRes.data.data?.filter((f: any) => 
          f.vade && 
          new Date(f.vade) < new Date() && 
          f.odenecekTutar && 
          Number(f.odenecekTutar) > 0
        ) || [];
      } catch (faturaError) {
        console.log('Fatura hatırlatıcıları yüklenemedi:', faturaError);
      }

      console.log('📊 Hatırlatıcı Özeti:', {
        cekSenet: cekSenetler.length,
        personel: personelOdemeleri.length,
        fatura: vadesiGecenFaturalar.length,
      });

      setHatirlaticilar({
        cekSenetler: cekSenetler,
        personelOdemeleri,
        vadesiGecenFaturalar: vadesiGecenFaturalar.slice(0, 5),
      });
    } catch (error) {
      console.error('Hatırlatıcılar yüklenirken hata:', error);
      // Hata olsa bile kısmi veri göster
      setHatirlaticilar({
        cekSenetler: [],
        personelOdemeleri: [],
        vadesiGecenFaturalar: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Toplam stok sayısı
      const stokRes = await axios.get('/stok', { params: { limit: 1 } });
      const toplamStok = stokRes.data?.meta?.total || 0;
      
      // Cari sayısı
      const cariRes = await axios.get('/cari', { params: { limit: 1 } });
      const cariSayisi = cariRes.data?.meta?.total || 0;
      
      // Aylık satış (bu ayın satış faturaları)
      const bugun = new Date();
      const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
      const ayBitis = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0, 23, 59, 59);
      
      const faturaRes = await axios.get('/fatura', {
        params: {
          faturaTipi: 'SATIS',
          limit: 1000,
        },
      });
      
      const faturalar = faturaRes.data?.data || [];
      // Bu ayın faturalarını filtrele
      const buAyFaturalar = faturalar.filter((f: any) => {
        if (!f.createdAt && !f.tarih) return false;
        const faturaTarihi = new Date(f.createdAt || f.tarih);
        return faturaTarihi >= ayBaslangic && faturaTarihi <= ayBitis;
      });
      const aylikSatis = buAyFaturalar.reduce((sum: number, f: any) => {
        const tutar = Number(f.genelToplam || f.toplamTutar || 0);
        return sum + tutar;
      }, 0);
      
      // Kâr marjı hesaplama (basit: satış - maliyet / satış * 100)
      // Bu hesaplama için daha detaylı veri gerekebilir, şimdilik basit bir yaklaşım
      const karMarji = aylikSatis > 0 ? ((aylikSatis * 0.15) / aylikSatis * 100) : 0; // Varsayılan %15 kar
      
      // Son 6 ayın satış verileri
      const aylikSatislar: Array<{ name: string; satis: number; kar: number }> = [];
      const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      
      for (let i = 5; i >= 0; i--) {
        const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1);
        const ayBas = new Date(tarih.getFullYear(), tarih.getMonth(), 1);
        const ayBit = new Date(tarih.getFullYear(), tarih.getMonth() + 1, 0, 23, 59, 59);
        
        try {
          const ayFaturaRes = await axios.get('/fatura', {
            params: {
              faturaTipi: 'SATIS',
              limit: 1000,
            },
          });
          
          const tumFaturalar = ayFaturaRes.data?.data || [];
          // İlgili ayın faturalarını filtrele
          const ayFaturalar = tumFaturalar.filter((f: any) => {
            if (!f.createdAt && !f.tarih) return false;
            const faturaTarihi = new Date(f.createdAt || f.tarih);
            return faturaTarihi >= ayBas && faturaTarihi <= ayBit;
          });
          const aySatis = ayFaturalar.reduce((sum: number, f: any) => {
            return sum + Number(f.genelToplam || f.toplamTutar || 0);
          }, 0);
          const ayKar = aySatis * 0.15; // Varsayılan %15 kar
          
          aylikSatislar.push({
            name: ayIsimleri[tarih.getMonth()],
            satis: aySatis,
            kar: ayKar,
          });
        } catch (error) {
          // Hata durumunda 0 değer ekle
          aylikSatislar.push({
            name: ayIsimleri[tarih.getMonth()],
            satis: 0,
            kar: 0,
          });
        }
      }
      
      setStats({
        toplamStok,
        cariSayisi,
        aylikSatis,
        karMarji,
      });
      setSalesData(aylikSatislar);
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler
      setStats({
        toplamStok: 0,
        cariSayisi: 0,
        aylikSatis: 0,
        karMarji: 0,
      });
      setSalesData([
        { name: 'Oca', satis: 0, kar: 0 },
        { name: 'Şub', satis: 0, kar: 0 },
        { name: 'Mar', satis: 0, kar: 0 },
        { name: 'Nis', satis: 0, kar: 0 },
        { name: 'May', satis: 0, kar: 0 },
        { name: 'Haz', satis: 0, kar: 0 },
      ]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Dinamik stats cards
  const statsCards = [
    { 
      title: 'Toplam Stok', 
      value: statsLoading ? '...' : stats.toplamStok.toLocaleString('tr-TR'), 
      icon: Inventory, 
      color: '#06b6d4', 
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' 
    },
    { 
      title: 'Cari Sayısı', 
      value: statsLoading ? '...' : stats.cariSayisi.toLocaleString('tr-TR'), 
      icon: People, 
      color: '#8b5cf6', 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
    },
    { 
      title: 'Aylık Satış', 
      value: statsLoading ? '...' : `₺${stats.aylikSatis.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: Receipt, 
      color: '#10b981', 
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    },
    { 
      title: 'Kâr Marjı', 
      value: statsLoading ? '...' : `%${stats.karMarji.toFixed(1)}`, 
      icon: TrendingUp, 
      color: '#f59e0b', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hoş geldiniz! İşte sistemin genel görünümü
          </Typography>
        </Box>
        
        {/* Hatırlatıcı Bildirimi */}
        <Badge badgeContent={toplamHatirlatici} color="error" max={99}>
          <IconButton 
            onClick={() => setHatirlaticiOpen(!hatirlaticiOpen)}
            sx={{ 
              bgcolor: toplamHatirlatici > 0 ? '#fef3c7' : '#f3f4f6', 
              '&:hover': { bgcolor: toplamHatirlatici > 0 ? '#fde68a' : '#e5e7eb' },
              animation: toplamHatirlatici > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              },
            }}
          >
            <Notifications sx={{ color: toplamHatirlatici > 0 ? '#f59e0b' : '#6b7280' }} />
          </IconButton>
        </Badge>
      </Box>

      {/* Günlük Hatırlatıcılar Paneli */}
      <Collapse in={hatirlaticiOpen}>
        {toplamHatirlatici > 0 ? (
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" fontWeight="bold" color="#92400e">
                  🔔 Hatırlatıcılar
                </Typography>
                <Chip 
                  label={`${toplamHatirlatici} İşlem`} 
                  size="small" 
                  sx={{ bgcolor: '#f59e0b', color: 'white' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Filtre Butonları */}
                <ButtonGroup size="small" variant="outlined">
                  <Button 
                    onClick={() => setFiltre('bugun')}
                    variant={filtre === 'bugun' ? 'contained' : 'outlined'}
                    startIcon={<Today />}
                  >
                    Bugün
                  </Button>
                  <Button 
                    onClick={() => setFiltre('yarin')}
                    variant={filtre === 'yarin' ? 'contained' : 'outlined'}
                    startIcon={<Event />}
                  >
                    Yarın
                  </Button>
                  <Button 
                    onClick={() => setFiltre('bu-hafta')}
                    variant={filtre === 'bu-hafta' ? 'contained' : 'outlined'}
                    startIcon={<DateRange />}
                  >
                    Bu Hafta
                  </Button>
                </ButtonGroup>
                
                {/* Ses Bildirimi Toggle */}
                <Tooltip title={sesAktif ? 'Ses bildirimini kapat' : 'Ses bildirimini aç'}>
                  <IconButton 
                    size="small" 
                    onClick={() => setSesAktif(!sesAktif)}
                    sx={{ 
                      color: sesAktif ? '#10b981' : '#6b7280',
                      bgcolor: sesAktif ? '#d1fae5' : 'transparent',
                    }}
                  >
                    <NotificationsActive />
                  </IconButton>
                </Tooltip>
                
                <IconButton size="small" onClick={() => setHatirlaticiOpen(false)}>
                  <ExpandLess />
                </IconButton>
              </Box>
            </Box>
            
            {/* Bilgi Mesajı */}
            {filtre === 'bu-hafta' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Bu hafta içinde (7 gün) vadesi gelecek işlemler gösteriliyor
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Çek/Senet Hatırlatıcısı */}
              {hatirlaticilar.cekSenetler.length > 0 && (
                <Card sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 280 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Description sx={{ color: '#3b82f6' }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Vadesi Gelen Çek/Senetler
                      </Typography>
                      <Chip label={hatirlaticilar.cekSenetler.length} size="small" color="primary" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Ödenmemiş / Tahsil edilmemiş çek ve senetler
                    </Typography>
                    <List dense>
                      {hatirlaticilar.cekSenetler.slice(0, 3).map((cs: any) => (
                        <ListItem 
                          key={cs.id} 
                          sx={{ 
                            px: 0, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f0f9ff' },
                            borderRadius: 1,
                          }}
                          onClick={() => router.push('/bordro/vade-takvim')}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600">
                                  {cs.tip === 'CEK' ? '📄 Çek' : '📋 Senet'} #{cs.cekNo || cs.seriNo || 'Belge Yok'}
                                </Typography>
                                <Chip 
                                  label={cs.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'} 
                                  size="small" 
                                  color={cs.portfoyTip === 'ALACAK' ? 'success' : 'error'}
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                                <ArrowForward sx={{ fontSize: 14, color: '#3b82f6' }} />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {cs.cari?.unvan} - ₺{Number(cs.tutar).toLocaleString('tr-TR')} - {cs.durum}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.cekSenetler.length > 3 && (
                        <Button 
                          size="small" 
                          fullWidth 
                          onClick={() => router.push('/bordro/vade-takvim')}
                          sx={{ mt: 1 }}
                        >
                          Tümünü Gör ({hatirlaticilar.cekSenetler.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Personel Maaş Hatırlatıcısı */}
              {hatirlaticilar.personelOdemeleri.length > 0 && (
                <Card sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 280 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Payment sx={{ color: '#10b981' }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Maaş Ödeme Günü
                      </Typography>
                      <Chip label={hatirlaticilar.personelOdemeleri.length} size="small" color="success" />
                    </Box>
                    <List dense>
                      {hatirlaticilar.personelOdemeleri.slice(0, 3).map((p: any) => (
                        <ListItem 
                          key={p.id} 
                          sx={{ 
                            px: 0,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f0fdf4' },
                            borderRadius: 1,
                          }}
                          onClick={() => router.push('/ik/personel')}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600">
                                  💰 {p.ad} {p.soyad}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: '#10b981' }} />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                Maaş: ₺{Number(p.maas || 0).toLocaleString('tr-TR')} - 
                                Bakiye: {Number(p.bakiye) >= 0 ? '-' : '+'}₺{Math.abs(Number(p.bakiye)).toLocaleString('tr-TR')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.personelOdemeleri.length > 3 && (
                        <Button 
                          size="small" 
                          fullWidth 
                          onClick={() => router.push('/ik/personel')}
                          sx={{ mt: 1 }}
                        >
                          Tümünü Gör ({hatirlaticilar.personelOdemeleri.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Vadesi Geçmiş Faturalar */}
              {hatirlaticilar.vadesiGecenFaturalar.length > 0 && (
                <Card sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 280 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccountBalance sx={{ color: '#ef4444' }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Vadesi Geçmiş Faturalar
                      </Typography>
                      <Chip label={hatirlaticilar.vadesiGecenFaturalar.length} size="small" color="error" />
                    </Box>
                    <List dense>
                      {hatirlaticilar.vadesiGecenFaturalar.slice(0, 3).map((f: any) => (
                        <ListItem 
                          key={f.id} 
                          sx={{ 
                            px: 0,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#fef2f2' },
                            borderRadius: 1,
                          }}
                          onClick={() => router.push('/fatura/arsiv')}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600">
                                  📋 {f.faturaNo}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: '#ef4444' }} />
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="error">
                                Vade: {new Date(f.vade).toLocaleDateString('tr-TR')} - 
                                Kalan: ₺{Number(f.odenecekTutar).toLocaleString('tr-TR')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.vadesiGecenFaturalar.length > 3 && (
                        <Button 
                          size="small" 
                          fullWidth 
                          onClick={() => router.push('/fatura/arsiv')}
                          sx={{ mt: 1 }}
                        >
                          Tümünü Gör ({hatirlaticilar.vadesiGecenFaturalar.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Notifications sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Hatırlatıcı Yok
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filtre === 'bugun' && 'Bugün için bekleyen işlem bulunmuyor'}
                {filtre === 'yarin' && 'Yarın için bekleyen işlem bulunmuyor'}
                {filtre === 'bu-hafta' && 'Bu hafta için bekleyen işlem bulunmuyor'}
              </Typography>
            </Box>
          </Paper>
        )}
      </Collapse>


      <Stack spacing={3}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {statsCards.map((card, index) => (
            <Box key={index} sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 200 }}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        background: card.gradient,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        boxShadow: `0 4px 12px ${card.color}40`,
                      }}
                    >
                      <card.icon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: card.color }}>
                        {card.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 65%', minWidth: 400 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ 
                  width: 4, 
                  height: 24, 
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                }} />
                <Typography variant="h6" fontWeight="bold">
                  Satış Trendi
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorKar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="satis" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    fill="url(#colorSatis)"
                    dot={{ fill: '#667eea', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="kar" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#colorKar)"
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ 
                  width: 4, 
                  height: 24, 
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                }} />
                <Typography variant="h6" fontWeight="bold">
                  Aylık Karşılaştırma
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                    }} 
                  />
                  <Bar 
                    dataKey="satis" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
}

