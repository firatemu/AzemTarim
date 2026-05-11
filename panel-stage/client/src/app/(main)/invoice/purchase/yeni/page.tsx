'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Autocomplete,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save, ArrowBack, QrCodeScanner, Description, AccountBalanceWallet, Delete } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import DocumentItemTable, { DocumentItem } from '@/components/Form/DocumentItemTable';
import axios from '@/lib/axios';
import { useTabStore } from '@/stores/tabStore';
import { useInvoiceDraftStore, InvoiceDraft } from '@/stores/invoiceDraftStore';

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  vadeSuresi?: number;
}

interface Warehouse {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface OdemePlaniItem {
  vade: string;
  tutar: number;
  odemeTipi: string;
  aciklama: string;
  odendi: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function SatinAlmaFaturaForm({ faturaId: editFaturaId, onBack }: { faturaId?: string; onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const irsaliyeId = searchParams.get('irsaliyeId');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { drafts, updateDraft, clearDraft } = useInvoiceDraftStore();
  const draft = drafts.purchase;
  const [formData, setFormData] = useState<InvoiceDraft>(
    draft || {
      faturaNo: '',
      faturaTipi: 'PURCHASE',
      cariId: '',
      warehouseId: '',
      tarih: new Date().toISOString().split('T')[0],
      vade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durum: 'APPROVED',
      genelIskontoOran: 0,
      genelIskontoTutar: 0,
      aciklama: '',
      kalemler: [],
      eScenario: 'TICARI_FATURA',
      eInvoiceType: 'PURCHASE',
      gonderimSekli: 'ELEKTRONIK',
      odemePlani: [],
    }
  );

  // Update store whenever formData changes
  useEffect(() => {
    if (!editFaturaId) {
      updateDraft('purchase', formData);
    }
  }, [formData, editFaturaId, updateDraft]);

  const { addTab, setActiveTab, removeTab } = useTabStore();
  const [tabValue, setTabValue] = useState(0);
  const [cariler, setCariler] = useState<Cari[]>([]);
  const [stoklar, setStoklar] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [openOdemePlaniDialog, setOpenOdemePlaniDialog] = useState(false);
  const [taksitSayisi, setTaksitSayisi] = useState(1);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carilerRes, stoklarRes, warehousesRes] = await Promise.all([
          axios.get('/account', { params: { limit: 1000 } }),
          axios.get('/products', { params: { limit: 1000 } }),
          axios.get('/warehouses?active=true')
        ]);

        setCariler((carilerRes.data.data || []).map((c: any) => ({
          id: c.id,
          cariKodu: c.code,
          unvan: c.title,
          vadeSuresi: c.dueDays || 0,
        })));

        setStoklar((stoklarRes.data.data || []).map((s: any) => ({
          id: s.id,
          stokKodu: s.code,
          stokAdi: s.name,
          satisFiyati: Number(s.purchasePrice) || Number(s.salePrice) || 0,
          kdvOrani: Number(s.vatRate) || 20,
          barkod: s.barcode,
          birim: s.unit || 'ADET',
          miktar: Number(s.quantity ?? 0),
        })));

        const warehouseList = warehousesRes.data || [];
        setWarehouses(warehouseList);

        // Sadece yeni faturaysa ve daha önce ambar seçilmemişse varsayılanı ata
        if (!editFaturaId && !formData.warehouseId) {
          const defaultWarehouse = warehouseList.find((w: any) => w.isDefault);
          if (defaultWarehouse) {
            setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
          } else if (warehouseList.length === 1) {
            setFormData(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
          }
        }

        if (editFaturaId) {
          const res = await axios.get(`/invoices/${editFaturaId}`);
          const f = res.data;
          setFormData({
            faturaNo: f.invoiceNo || '',
            faturaTipi: f.invoiceType || 'PURCHASE',
            cariId: f.accountId || '',
            warehouseId: f.warehouseId || '',
            tarih: f.date ? new Date(f.date).toISOString().split('T')[0] : '',
            vade: f.dueDate ? new Date(f.dueDate).toISOString().split('T')[0] : '',
            durum: f.status,
            genelIskontoOran: 0,
            genelIskontoTutar: Number(f.discount) || 0,
            aciklama: f.notes || '',
            eScenario: f.eScenario || 'TICARI_FATURA',
            eInvoiceType: f.eInvoiceType || 'PURCHASE',
            gonderimSekli: f.gonderimSekli || 'ELEKTRONIK',
            odemePlani: f.paymentPlan || [],
            kalemler: (f.items || []).map((k: any) => ({
              stokId: k.productId,
              stok: k.product ? {
                id: k.product.id,
                stokKodu: k.product.code,
                stokAdi: k.product.name,
                satisFiyati: Number(k.product.purchasePrice) || Number(k.product.salePrice) || 0,
                kdvOrani: Number(k.product.vatRate) || 20,
                birim: k.product.unit || 'ADET',
              } : undefined,
              miktar: Number(k.quantity) || 0,
              birimFiyat: Number(k.unitPrice) || 0,
              kdvOrani: Number(k.vatRate) || 0,
              iskontoOran: Number(k.discountRate) || 0,
              iskontoTutar: Number(k.discountAmount) || 0,
              birim: k.unit || 'ADET',
            })),
          });
        } else if (irsaliyeId) {
          const res = await axios.get(`/purchase-waybills/${irsaliyeId}`);
          const irs = res.data;
          setFormData(prev => ({
            ...prev,
            cariId: irs.accountId || '',
            warehouseId: irs.warehouseId || '',
            kalemler: (irs.items || []).map((k: any) => ({
              stokId: k.productId,
              stok: k.product ? {
                id: k.product.id,
                stokKodu: k.product.code,
                stokAdi: k.product.name,
                satisFiyati: Number(k.product.purchasePrice) || Number(k.product.salePrice) || 0,
                kdvOrani: Number(k.product.vatRate) || 20,
              } : undefined,
              miktar: Number(k.quantity) || 0,
              birimFiyat: Number(k.unitPrice) || 0,
              kdvOrani: Number(k.vatRate) || 0,
              birim: k.unit || 'ADET',
            })),
          }));
          if (!formData.faturaNo) generateFaturaNo();
        } else {
          if (!formData.faturaNo) generateFaturaNo();
        }

        if (!editFaturaId) {
          addTab({ id: 'purchase-invoice-yeni', label: 'Yeni Satın Alma Faturası', path: '/invoice/purchase/yeni' });
          setActiveTab('purchase-invoice-yeni');
        }
      } catch (error: any) {
        showSnackbar('Veriler yüklenirken hata oluştu', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [editFaturaId, irsaliyeId]);

  const generateFaturaNo = async () => {
    try {
      const res = await axios.get('/code-templates/preview-code/INVOICE_PURCHASE');
      if (res.data?.nextCode) {
        setFormData(prev => ({ ...prev, faturaNo: res.data.nextCode }));
      }
    } catch (e) {
      console.warn('Numara üretilemedi');
    }
  };

  const totals = useMemo(() => {
    let araToplam = 0, kalemIskonto = 0, toplamKdv = 0;
    formData.kalemler.forEach(k => {
      const lineTotal = k.miktar * k.birimFiyat;
      araToplam += lineTotal;
      kalemIskonto += (k.iskontoTutar || 0);
      const net = lineTotal - (k.iskontoTutar || 0);
      toplamKdv += (net * k.kdvOrani) / 100;
    });
    const genelIskonto = formData.genelIskontoTutar || 0;
    const netToplam = araToplam - kalemIskonto - genelIskonto;
    return { araToplam, kalemIskonto, genelIskonto, toplamIskonto: kalemIskonto + genelIskonto, toplamKdv, genelToplam: netToplam + toplamKdv };
  }, [formData.kalemler, formData.genelIskontoTutar]);

  const handleTaksitHesapla = () => {
    const toplam = totals.genelToplam;
    if (toplam <= 0 || taksitSayisi <= 0) return;

    const taksitTutari = Math.floor((toplam / taksitSayisi) * 100) / 100;
    const fark = Math.round((toplam - (taksitTutari * taksitSayisi)) * 100) / 100;

    const yeniPlan: OdemePlaniItem[] = [];
    let currentVade = new Date(formData.tarih);

    for (let i = 0; i < taksitSayisi; i++) {
      currentVade = new Date(currentVade);
      currentVade.setMonth(currentVade.getMonth() + 1);

      yeniPlan.push({
        vade: currentVade.toISOString().split('T')[0],
        tutar: i === taksitSayisi - 1 ? taksitTutari + fark : taksitTutari,
        odemeTipi: 'KREDI_KARTI',
        aciklama: `${i + 1}. Taksit`,
        odendi: false,
      });
    }

    setFormData(prev => ({ ...prev, odemePlani: yeniPlan }));
  };

  const handleSave = async () => {
    try {
      if (!formData.cariId || formData.kalemler.length === 0) {
        showSnackbar('Lütfen zorunlu alanları doldurun', 'error');
        return;
      }
      setSaving(true);
      const payload = {
        invoiceNo: formData.faturaNo,
        type: 'PURCHASE',
        accountId: formData.cariId,
        warehouseId: formData.warehouseId,
        date: new Date(formData.tarih).toISOString(),
        dueDate: formData.vade ? new Date(formData.vade).toISOString() : null,
        discount: totals.toplamIskonto,
        notes: formData.aciklama,
        eScenario: formData.eScenario,
        eInvoiceType: formData.eInvoiceType,
        gonderimSekli: formData.gonderimSekli,
        items: formData.kalemler.map(k => ({
          productId: k.stokId,
          quantity: k.miktar,
          unitPrice: k.birimFiyat,
          vatRate: k.kdvOrani,
          discountRate: k.iskontoOran,
          discountAmount: k.iskontoTutar,
          unit: k.birim,
        })),
        paymentPlan: formData.odemePlani,
        status: formData.durum,
      };

      if (editFaturaId) {
        await axios.put(`/invoices/${editFaturaId}`, payload);
        showSnackbar('Fatura güncellendi', 'success');
      } else {
        await axios.post('/invoices', payload);
        showSnackbar('Fatura oluşturuldu', 'success');
        clearDraft('purchase'); // Yeni fatura başarıyla kaydedildiğinde taslağı temizle
      }

      setTimeout(() => {
        if (editFaturaId) removeTab(`purchase-invoice-edit-${editFaturaId}`);
        else removeTab('purchase-invoice-yeni');

        if (onBack) onBack();
        else router.push('/invoice/purchase');
      }, 1500);
    } catch (e: any) {
      showSnackbar(e.response?.data?.message || 'Kaydedilirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBarcodeSubmit = (barkod: string) => {
    if (!barkod) return;
    const stok = stoklar.find(s => s.barkod === barkod.trim());
    if (stok) {
      const existingIndex = formData.kalemler.findIndex(k => k.stokId === stok.id);
      if (existingIndex > -1) {
        const newKalemler = [...formData.kalemler];
        newKalemler[existingIndex].miktar += 1;
        setFormData(prev => ({ ...prev, kalemler: newKalemler }));
      } else {
        setFormData(prev => ({
          ...prev,
          kalemler: [...prev.kalemler, {
            stokId: stok.id,
            stok: stok,
            miktar: 1,
            birimFiyat: stok.satisFiyati,
            kdvOrani: stok.kdvOrani,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: stok.birim || 'ADET',
          }]
        }));
      }
      setBarcode('');
      showSnackbar(`${stok.stokAdi} eklendi`, 'success');
    } else {
      showSnackbar('Barkod bulunamadı', 'error');
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) return (
    <MainLayout>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    </MainLayout>
  );

  return (
    <MainLayout>
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
          mb: 2
        }}>
          {/* Back button removed */}
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'var(--foreground)' }}>
              {editFaturaId ? 'Satın Alma Faturası Düzenle' : 'Yeni Satın Alma Faturası'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alımlarınızı faturalandırın
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', bgcolor: 'var(--card)' }}>
        <Stack spacing={3}>
          {warehouses.length === 0 && (
            <Alert severity="error">
              Sistemde tanımlı ambar bulunmamaktadır. İşlem yapabilmek için lütfen önce ambar tanımlayınız.
            </Alert>
          )}

          {/* Tab Interface - Desktop only */}
          {!isMobile && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }
                }}
              >
                <Tab icon={<Description />} label="Genel Bilgiler" iconPosition="start" />
              </Tabs>
            </Box>
          )}

          {/* Mobile: Single column, Desktop: TabPanel */}
          {isMobile ? (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'var(--foreground)' }}>Genel Bilgiler</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                <TextField
                  className="form-control-textfield"
                  label="Fatura No"
                  value={formData.faturaNo}
                  onChange={e => setFormData(p => ({ ...p, faturaNo: e.target.value }))}
                  required
                  fullWidth
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    className="form-control-textfield"
                    type="date"
                    label="Tarih"
                    value={formData.tarih}
                    onChange={e => setFormData(p => ({ ...p, tarih: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                  />
                  <TextField
                    className="form-control-textfield"
                    type="date"
                    label="Vade"
                    value={formData.vade}
                    onChange={e => setFormData(p => ({ ...p, vade: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <FormControl className="form-control-select" required fullWidth>
                    <InputLabel>Ambar</InputLabel>
                    <Select
                      value={formData.warehouseId}
                      onChange={e => setFormData(p => ({ ...p, warehouseId: e.target.value }))}
                      label="Ambar"
                    >
                      {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  fullWidth
                  options={cariler}
                  getOptionLabel={o => `${o.cariKodu} - ${o.unvan}`}
                  value={cariler.find(c => c.id === formData.cariId) || null}
                  onChange={(_, nv) => {
                    // Cari seçildiğinde vade gününü hesapla
                    if (nv?.vadeSuresi && formData.tarih) {
                      const tarih = new Date(formData.tarih);
                      tarih.setDate(tarih.getDate() + (nv.vadeSuresi || 0));
                      const vadeTarihi = tarih.toISOString().split('T')[0];
                      setFormData(p => ({ ...p, cariId: nv?.id || '', vade: vadeTarihi }));
                    } else {
                      setFormData(p => ({ ...p, cariId: nv?.id || '' }));
                    }
                  }}
                  renderInput={p => <TextField {...p} className="form-control-textfield" label="Tedarikçi Seçiniz" required />}
                />
              </Box>
            </Box>
          ) : (
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2 }}>
                <TextField
                  disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                  className="form-control-textfield"
                  label="Fatura No"
                  value={formData.faturaNo}
                  onChange={e => setFormData(p => ({ ...p, faturaNo: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                  className="form-control-textfield"
                  type="date"
                  label="Tarih"
                  value={formData.tarih}
                  onChange={e => setFormData(p => ({ ...p, tarih: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
                <TextField
                  disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                  className="form-control-textfield"
                  type="date"
                  label="Vade"
                  value={formData.vade}
                  onChange={e => setFormData(p => ({ ...p, vade: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <FormControl className="form-control-select" required fullWidth>
                  <InputLabel>Ambar</InputLabel>
                  <Select
                    disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                    value={formData.warehouseId}
                    onChange={e => setFormData(p => ({ ...p, warehouseId: e.target.value }))}
                    label="Ambar"
                  >
                    {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                  fullWidth
                  options={cariler}
                  getOptionLabel={o => `${o.cariKodu} - ${o.unvan}`}
                  value={cariler.find(c => c.id === formData.cariId) || null}
                  onChange={(_, nv) => {
                    // Cari seçildiğinde vade gününü hesapla
                    if (nv?.vadeSuresi && formData.tarih) {
                      const tarih = new Date(formData.tarih);
                      tarih.setDate(tarih.getDate() + (nv.vadeSuresi || 0));
                      const vadeTarihi = tarih.toISOString().split('T')[0];
                      setFormData(p => ({ ...p, cariId: nv?.id || '', vade: vadeTarihi }));
                    } else {
                      setFormData(p => ({ ...p, cariId: nv?.id || '' }));
                    }
                  }}
                  renderInput={params => <TextField {...params} label="Cari Seçin" required />}
                />
              </Box>

            </TabPanel>
          )}

          {/* Kalemler */}
          <Box>
            <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />

            <Box sx={{ mt: 3, mb: 3 }}>
              <Box sx={{ py: 1, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                    size="small"
                    label="Barkod Okut"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBarcodeSubmit(barcode)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeScanner color="action" /></InputAdornment> }}
                    sx={{ width: 250 }}
                  />
                  <Button
                    disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                    variant="outlined"
                    size="small"
                    startIcon={<AccountBalanceWallet />}
                    onClick={() => setOpenOdemePlaniDialog(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    Ödeme Planı {formData.odemePlani.length > 0 && `(${formData.odemePlani.length})`}
                  </Button>
                </Box>
              </Box>
              <DocumentItemTable
                disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                kalemler={formData.kalemler}
                onChange={ni => setFormData(p => ({ ...p, kalemler: ni }))}
                stoklar={stoklar}
                cariId={formData.cariId}
                onSnackbar={showSnackbar}
              />
            </Box>
          </Box>

          {/* Genel İskonto */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <TextField
              disabled={!!editFaturaId && formData.durum === 'APPROVED'}
              type="number"
              label="Genel İskonto %"
              value={formData.genelIskontoOran || ''}
              onChange={e => handleGenelIskontoOranChange(e.target.value)}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              helperText="İskonto oranı"
              sx={{
                width: { xs: '100%', sm: '200px' },
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
            <TextField
              disabled={!!editFaturaId && formData.durum === 'APPROVED'}
              type="number"
              label="Genel İskonto (₺)"
              value={formData.genelIskontoTutar || ''}
              onChange={e => handleGenelIskontoTutarChange(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="İskonto tutarı"
              sx={{
                width: { xs: '100%', sm: '200px' },
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
          </Box>

          {/* Açıklama ve Özet - Yan Yana */}
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                disabled={!!editFaturaId && formData.durum === 'APPROVED'}
                fullWidth
                multiline
                rows={2}
                label="Açıklama / Notlar"
                value={formData.aciklama}
                onChange={e => setFormData(p => ({ ...p, aciklama: e.target.value }))}
              />
            </Box>

            <Paper variant="outlined" sx={{ flex: 1, p: isMobile ? 2 : 3, bgcolor: 'var(--card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'var(--foreground)' }}>
                Fatura Özeti
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="var(--muted-foreground)">Ara Toplam:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatCurrency(totals.araToplam)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="var(--muted-foreground)">Malzeme İndirimleri:</Typography>
                    <Typography variant="body2" fontWeight="600" color={totals.kalemIskonto > 0 ? "error.main" : "inherit"}>
                      {totals.kalemIskonto > 0 ? '- ' : ''}{formatCurrency(totals.kalemIskonto)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="var(--muted-foreground)">Genel İskonto:</Typography>
                    <Typography variant="body2" fontWeight="600" color={formData.genelIskontoTutar > 0 ? "error.main" : "inherit"}>
                      {formData.genelIskontoTutar > 0 ? '- ' : ''}{formatCurrency(formData.genelIskontoTutar || 0)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="var(--muted-foreground)">KDV Toplamı:</Typography>
                    <Typography variant="body2" fontWeight="600">{formatCurrency(totals.toplamKdv)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="var(--muted-foreground)" fontWeight="bold">Toplam İndirim:</Typography>
                    <Typography variant="body2" fontWeight="bold" color={totals.toplamIskonto > 0 ? "error.main" : "inherit"}>
                      {totals.toplamIskonto > 0 ? '- ' : ''}{formatCurrency(totals.toplamIskonto)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="800">Genel Toplam:</Typography>
                    <Typography
                      variant="h6"
                      fontWeight="900"
                      sx={{
                        color: 'var(--chart-2)',
                      }}
                    >
                      {formatCurrency(totals.genelToplam)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: 2,
              justifyContent: 'flex-end'
            }}>
              {/* Geri button removed */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {formData.durum !== 'APPROVED' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, durum: 'DRAFT' }));
                      setTimeout(handleSave, 100);
                    }}
                    disabled={saving}
                  >
                    Taslak Olarak Kaydet
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={() => {
                    if (formData.durum !== 'APPROVED') {
                      setFormData(prev => ({ ...prev, durum: 'APPROVED' }));
                    }
                    setTimeout(handleSave, 100);
                  }}
                  disabled={saving || (editFaturaId && formData.durum === 'APPROVED')}
                  sx={{
                    bgcolor: formData.durum === 'APPROVED' ? 'var(--muted)' : 'var(--ring)',
                    color: formData.durum === 'APPROVED' ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: isMobile ? '100%' : 150,
                  }}
                >
                  {saving ? 'Kaydediliyor...' : (formData.durum === 'APPROVED' ? 'Fatura Onaylandı' : 'Kaydet')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Ödeme Planı Dialogu */}
      <Dialog
        open={openOdemePlaniDialog}
        onClose={() => setOpenOdemePlaniDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Ödeme Planı
        </DialogTitle>

        <DialogContent>
          {/* Summary Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Fatura Toplamı
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatCurrency(totals.genelToplam)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Planlanan
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatCurrency(formData.odemePlani.reduce((sum, o) => sum + o.tutar, 0))}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Taksit Sayısı
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formData.odemePlani.length}
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          {formData.odemePlani.length === 0 && (
            <>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                {[2, 3, 6, 9, 12].map((ay) => (
                  <Button
                    key={ay}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setTaksitSayisi(ay);
                      handleTaksitHesapla();
                    }}
                    disabled={formData.kalemler.length === 0}
                  >
                    {ay} Ay
                  </Button>
                ))}
                <TextField
                  type="number"
                  size="small"
                  value={taksitSayisi}
                  onChange={e => setTaksitSayisi(parseInt(e.target.value) || 1)}
                  onKeyDown={e => e.key === 'Enter' && handleTaksitHesapla()}
                  inputProps={{ min: 1, max: 36 }}
                  sx={{ width: 80 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleTaksitHesapla}
                  disabled={formData.kalemler.length === 0 || taksitSayisi < 1}
                >
                  Oluştur
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Ödeme planı oluşturmak için taksit sayısı seçin veya girin.
              </Typography>
            </>
          )}

          {/* Payment Plan Table */}
          {formData.odemePlani.length > 0 && (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Taksit</TableCell>
                      <TableCell>Vade Tarihi</TableCell>
                      <TableCell>Tutar</TableCell>
                      <TableCell>Ödeme Tipi</TableCell>
                      <TableCell width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.odemePlani.map((odeme, index) => (
                      <TableRow key={index}>
                        <TableCell>{odeme.aciklama}</TableCell>
                        <TableCell>{new Date(odeme.vade).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={odeme.tutar}
                            onChange={e => {
                              const newPlan = [...formData.odemePlani];
                              newPlan[index].tutar = parseFloat(e.target.value) || 0;
                              setFormData(f => ({ ...f, odemePlani: newPlan }));
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{
                              width: 120,
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
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={[
                              { value: 'NAKIT', label: 'Nakit' },
                              { value: 'KREDI_KARTI', label: 'Kredi Kartı' },
                              { value: 'CEK', label: 'Çek' },
                              { value: 'SENET', label: 'Senet' },
                            ]}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                            value={[
                              { value: 'NAKIT', label: 'Nakit' },
                              { value: 'KREDI_KARTI', label: 'Kredi Kartı' },
                              { value: 'CEK', label: 'Çek' },
                              { value: 'SENET', label: 'Senet' },
                            ].find(opt => opt.value === odeme.odemeTipi) || null}
                            onChange={(_, newValue) => {
                              const newPlan = [...formData.odemePlani];
                              newPlan[index].odemeTipi = newValue?.value || 'NAKIT';
                              setFormData(f => ({ ...f, odemePlani: newPlan }));
                            }}
                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                            sx={{ width: 180 }}
                            renderInput={(params) => <TextField {...params} size="small" />}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setFormData(f => ({ ...f, odemePlani: f.odemePlani.filter((_, i) => i !== index) }))}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Toplam: <strong>{formatCurrency(formData.odemePlani.reduce((sum, o) => sum + o.tutar, 0))}</strong>
                  {Math.abs(formData.odemePlani.reduce((sum, o) => sum + o.tutar, 0) - totals.genelToplam) > 0.01 && (
                    <span style={{ color: 'var(--warning)', marginLeft: 8 }}>
                      Fatura tutarından farklı
                    </span>
                  )}
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setTaksitSayisi(formData.odemePlani.length);
                    handleTaksitHesapla();
                  }}
                >
                  Yeniden Hesapla
                </Button>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenOdemePlaniDialog(false)}>
            Kapat
          </Button>
          {formData.odemePlani.length > 0 && (
            <Button
              onClick={() => setFormData(f => ({ ...f, odemePlani: [] }))}
              color="error"
            >
              Temizle
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default function YeniSatinalmaFaturasiPage() {
  return <SatinAlmaFaturaForm />;
}
