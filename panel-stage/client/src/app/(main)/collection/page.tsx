'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Stack,
  Tooltip,
  Grid,
  Skeleton,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Badge,
  Collapse,
  Popover,
} from '@mui/material';
import {
  Add,
  Delete,
  AccountBalance,
  CreditCard,
  Payments,
  TrendingDown,
  TrendingUp,
  Print,
  SwapHoriz,
  Close,
  Visibility,
  FilterList,
  Download,
  PictureAsPdf,
  Search,
  ViewCompact,
  TableRows,
  Receipt,
  CheckCircleOutline,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ArrowUpward,
  ArrowDownward,
  CalendarToday,
  RefreshOutlined,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { StandardPage, StandardCard } from '@/components/common';
import { useTheme, alpha } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import CaprazOdemeDialog from './components/CaprazOdemeDialog';
import TahsilatFormDialog from './components/TahsilatFormDialog';
import { TahsilatFormData, CaprazOdemeFormData, Cari, Kasa } from './types';

interface Tahsilat {
  id: string;
  tip: 'COLLECTION' | 'PAYMENT';
  tutar: number;
  tarih: string;
  odemeTipi: 'NAKIT' | 'KREDI_KARTI';
  aciklama?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  cari: {
    cariKodu: string;
    unvan: string;
  };
  kasa: {
    kasaKodu: string;
    kasaAdi: string;
    kasaTipi: string;
  } | null;
  bankaHesap?: {
    id: string;
    hesapAdi: string;
    bankaAdi: string;
  } | null;
  firmaKrediKarti?: {
    id: string;
    kartAdi: string;
    bankaAdi: string;
    kartTipi: string;
  } | null;
}

const normalizeCollectionRow = (row: any): Tahsilat => {
  const type = (row.tip || row.type || 'COLLECTION') as 'COLLECTION' | 'PAYMENT';
  const amount = Number(row.tutar ?? row.amount ?? 0);
  const dateValue = row.tarih || row.date || row.createdAt || new Date().toISOString();
  const paymentMethod = (row.odemeTipi || row.paymentType || 'NAKIT') as string;

  return {
    id: row.id,
    tip: type,
    tutar: amount,
    tarih: String(dateValue),
    odemeTipi: paymentMethod as any,
    aciklama: row.aciklama || row.notes || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy || null,
    updatedBy: row.updatedBy || null,
    cari: row.cari || (row.account ? {
      cariKodu: row.account.code || row.account.cariKodu || '',
      unvan: row.account.title || row.account.unvan || '',
    } : { cariKodu: '', unvan: '' }),
    kasa: row.kasa || (row.cashbox ? {
      kasaKodu: row.cashbox.code || row.cashbox.kasaKodu || '',
      kasaAdi: row.cashbox.name || row.cashbox.kasaAdi || '',
      kasaTipi: row.cashbox.type || row.cashbox.kasaTipi || '',
    } : null),
    bankaHesap: row.bankaHesap || (row.bankAccount ? {
      id: row.bankAccount.id,
      hesapAdi: row.bankAccount.name || row.bankAccount.hesapAdi || '',
      bankaAdi: row.bankAccount.bank?.name || row.bankAccount.bankaAdi || '',
    } : null),
    firmaKrediKarti: row.firmaKrediKarti || (row.companyCreditCard ? {
      id: row.companyCreditCard.id,
      kartAdi: row.companyCreditCard.cardName || row.companyCreditCard.kartAdi || '',
      bankaAdi: row.companyCreditCard.bankName || row.companyCreditCard.bankaAdi || '',
      kartTipi: row.companyCreditCard.cardType || row.companyCreditCard.kartTipi || '',
    } : null),
  };
};

const EMPTY_STATS = {
  totalCollection: 0,
  totalPayment: 0,
  monthlyCollection: 0,
  monthlyPayment: 0,
  cashCollection: 0,
  creditCardCollection: 0,
};

const formatCurrencyFn = (value: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

// ─── Boş Durum ──────────────────────────────────────────────────────────────
const EmptyState = ({ activeTab }: { activeTab: number }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 10,
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: activeTab === 0
          ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
          : 'color-mix(in srgb, var(--destructive) 10%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {activeTab === 0
        ? <TrendingDown sx={{ fontSize: 40, color: 'var(--chart-2)', opacity: 0.6 }} />
        : <TrendingUp sx={{ fontSize: 40, color: 'var(--destructive)', opacity: 0.6 }} />}
    </Box>
    <Typography variant="h6" fontWeight={600} color="text.secondary">
      {activeTab === 0 ? 'Tahsilat kaydı bulunamadı' : 'Ödeme kaydı bulunamadı'}
    </Typography>
    <Typography variant="body2" color="text.disabled">
      Seçili filtrelere uygun kayıt bulunmuyor
    </Typography>
  </Box>
);

// ─── Mini İstatistik Chip ────────────────────────────────────────────────────
const StatBadge = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      px: 2,
      py: 1,
      borderRadius: 2,
      bgcolor: `${color}10`,
      border: `1px solid ${color}30`,
      minWidth: 100,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>
      {formatCurrencyFn(value)}
    </Typography>
  </Box>
);

export default function CollectionPage() {
  const queryClient = useQueryClient();
  const theme = useTheme();

  // ─── State ────────────────────────────────────────────────────────────────
  const [openDialog, setOpenDialog] = useState(false);
  const [openCaprazOdemeDialog, setOpenCaprazOdemeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTahsilat, setSelectedTahsilat] = useState<Tahsilat | null>(null);
  const [auditAnchorEl, setAuditAnchorEl] = useState<HTMLElement | null>(null);
  const [auditRow, setAuditRow] = useState<Tahsilat | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0=Tahsilat 1=Ödeme
  const [searchQuery, setSearchQuery] = useState('');
  const [denseMode, setDenseMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Tarih filtresi
  const [quickFilter, setQuickFilter] = useState<string>('BU_AY');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  });

  const [initialFormData, setInitialFormData] = useState({
    cariId: '',
    tip: 'COLLECTION' as 'COLLECTION' | 'PAYMENT',
    tutar: '' as string | number,
    tarih: new Date().toISOString().split('T')[0],
    odemeTipi: 'NAKIT' as 'NAKIT' | 'KREDI_KARTI',
    kasaId: '',
    bankaHesapId: '',
    aciklama: '',
    kartSahibi: '',
    kartSonDort: '',
    bankaAdi: '',
    firmaKrediKartiId: '',
    installmentCount: 1,
  });

  const [caprazOdemeFormData, setCaprazOdemeFormData] = useState<CaprazOdemeFormData>({
    tahsilatCariId: '',
    odemeCariId: '',
    tutar: 0,
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // ─── Hızlı Tarih Filtresi ─────────────────────────────────────────────────
  const handleQuickFilter = useCallback((filter: string) => {
    setQuickFilter(filter);
    const today = new Date();
    switch (filter) {
      case 'BUGÜN':
        const todayStr = today.toISOString().split('T')[0];
        setDateRange({ start: todayStr, end: todayStr });
        break;
      case 'BU_HAFTA': {
        const start = new Date(today);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        setDateRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
        break;
      }
      case 'BU_AY': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
        break;
      }
      case 'BU_YIL': {
        const start = new Date(today.getFullYear(), 0, 1);
        setDateRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
        break;
      }
      default:
        setDateRange({ start: '', end: '' });
    }
  }, []);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: tahsilatData = [], isLoading: tahsilatLoading, isFetching: tahsilatFetching, refetch } = useQuery<Tahsilat[]>({
    queryKey: ['collection', 'list', dateRange.start, dateRange.end],
    queryFn: async () => {
      const params: any = { page: 1, limit: 1000 };
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      const response = await axios.get('/collections', { params });
      const rows = response.data?.data ?? [];
      return Array.isArray(rows) ? rows.map(normalizeCollectionRow) : [];
    },
  });

  const { data: stats = EMPTY_STATS, isFetching: statsFetching } = useQuery<typeof EMPTY_STATS>({
    queryKey: ['collection', 'stats'],
    queryFn: async () => {
      const response = await axios.get('/collections/stats');
      const d = response.data ?? {};
      return {
        totalCollection: d.totalCollection ?? 0,
        totalPayment: d.totalPayment ?? 0,
        monthlyCollection: d.monthlyCollection ?? 0,
        monthlyPayment: d.monthlyPayment ?? 0,
        cashCollection: d.cashCollection ?? 0,
        creditCardCollection: d.creditCardCollection ?? 0,
      };
    },
    initialData: EMPTY_STATS,
  });

  const { data: cariler = [] } = useQuery<Cari[]>({
    queryKey: ['cari', 'collection'],
    queryFn: async () => {
      const response = await axios.get('/account', { params: { limit: 1000 } });
      const data = response.data?.data ?? response.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    enabled: openDialog || openCaprazOdemeDialog,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: bankaHesaplari = [] } = useQuery<any[]>({
    queryKey: ['bank', 'accounts', 'collection'],
    queryFn: async () => {
      const response = await axios.get('/banks/summary');
      const hesaplar: any[] = [];
      response.data.bankalar?.forEach((banka: any) => {
        banka.hesaplar?.forEach((hesap: any) => {
          hesaplar.push({ ...hesap, bankaAdi: banka.ad || banka.bankaAdi || '', bankaId: banka.id });
        });
      });
      return hesaplar;
    },
    enabled: openDialog || openCaprazOdemeDialog,
  });

  const { data: kasalar = [] } = useQuery<Kasa[]>({
    queryKey: ['cashbox', 'collection'],
    queryFn: async () => {
      const response = await axios.get('/cashbox', { params: { aktif: true } });
      const rawData = response.data ?? [];
      return Array.isArray(rawData) ? rawData.map((row: any) => ({
        id: row.id,
        kasaKodu: row.code || row.kasaKodu || '',
        kasaAdi: row.name || row.kasaAdi || '',
        bakiye: Number(row.balance ?? row.bakiye ?? 0),
        kasaTipi: row.type === 'CASH'
          ? 'NAKIT'
          : row.type === 'COMPANY_CREDIT_CARD'
            ? 'FIRMA_KREDI_KARTI'
            : row.type === 'POS'
              ? 'POS'
              : row.type === 'BANK'
                ? 'BANKA'
                : row.type || row.kasaTipi,
      })) : [];
    },
    enabled: openDialog || openCaprazOdemeDialog,
  });

  // ─── Filtreleme ───────────────────────────────────────────────────────────
  const filteredData = useMemo<Tahsilat[]>(() => {
    return tahsilatData
      .filter((t: Tahsilat) => (activeTab === 0 ? t.tip === 'COLLECTION' : t.tip === 'PAYMENT'))
      .filter((t: Tahsilat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.cari?.unvan?.toLowerCase().includes(q) ||
          t.cari?.cariKodu?.toLowerCase().includes(q) ||
          t.tutar?.toString().includes(q) ||
          t.aciklama?.toLowerCase().includes(q) ||
          t.kasa?.kasaAdi?.toLowerCase().includes(q) ||
          t.bankaHesap?.hesapAdi?.toLowerCase().includes(q)
        );
      })
      .sort((a: Tahsilat, b: Tahsilat) => {
        const d = new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
        if (d !== 0) return d;
        if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.id.localeCompare(a.id);
      });
  }, [tahsilatData, activeTab, searchQuery]);

  const collections = useMemo(() => tahsilatData.filter((t: Tahsilat) => t.tip === 'COLLECTION'), [tahsilatData]);
  const payments = useMemo(() => tahsilatData.filter((t: Tahsilat) => t.tip === 'PAYMENT'), [tahsilatData]);
  const collectionTotal = useMemo(() => collections.reduce((s: number, t: Tahsilat) => s + Number(t.tutar || 0), 0), [collections]);
  const paymentTotal = useMemo(() => payments.reduce((s: number, t: Tahsilat) => s + Number(t.tutar || 0), 0), [payments]);
  const netBalance = collectionTotal - paymentTotal;

  // ─── Grafik Verisi ────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const dateMap = new Map<string, { date: string; label: string; tahsilat: number; odeme: number }>();
    tahsilatData.forEach((item: Tahsilat) => {
      const date = item.tarih.split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          label: new Date(item.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          tahsilat: 0,
          odeme: 0,
        });
      }
      const entry = dateMap.get(date)!;
      if (item.tip === 'COLLECTION') entry.tahsilat += Number(item.tutar || 0);
      else entry.odeme += Number(item.tutar || 0);
    });
    const all = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    return all.slice(-(trendPeriod === 'WEEKLY' ? 7 : 30));
  }, [tahsilatData, trendPeriod]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenDialog = useCallback((tip: 'COLLECTION' | 'PAYMENT') => {
    setInitialFormData({
      cariId: '', tip, tutar: '',
      tarih: new Date().toISOString().split('T')[0],
      odemeTipi: 'NAKIT', kasaId: '', bankaHesapId: '',
      aciklama: '', kartSahibi: '', kartSonDort: '', bankaAdi: '', firmaKrediKartiId: '',
      installmentCount: 1,
    });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedTahsilat(null);
  }, []);

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['collection'] }),
      queryClient.invalidateQueries({ queryKey: ['cari'] }),
      queryClient.invalidateQueries({ queryKey: ['cashbox'] }),
    ]);
  }, [queryClient]);

  const handleSubmit = useCallback(async (submitFormData: TahsilatFormData) => {
    try {
      const tutarNum = typeof submitFormData.tutar === 'string' ? parseFloat(submitFormData.tutar) : submitFormData.tutar;
      if (!submitFormData.cariId || tutarNum <= 0) {
        showSnackbar('Lütfen tüm zorunlu alanları doldurun', 'warning');
        return;
      }
      if (submitFormData.odemeTipi === 'KREDI_KARTI' && submitFormData.tip === 'COLLECTION') {
        if (!submitFormData.bankaHesapId) {
          showSnackbar('POS tahsilat için banka hesabı seçimi zorunludur', 'warning');
          return;
        }
      } else if (!submitFormData.kasaId) {
        showSnackbar('Kasa seçimi zorunludur', 'warning');
        return;
      }
      setActionLoading(true);
      const dataToSend: any = {
        accountId: submitFormData.cariId,
        type: submitFormData.tip,
        amount: tutarNum,
        date: submitFormData.tarih,
        paymentMethod: submitFormData.odemeTipi === 'NAKIT' ? 'CASH' :
          submitFormData.odemeTipi === 'KREDI_KARTI' ? 'CREDIT_CARD' :
            submitFormData.odemeTipi,
        cashboxId: submitFormData.kasaId || null,
        notes: submitFormData.aciklama,
      };
      if (submitFormData.firmaKrediKartiId) dataToSend.companyCreditCardId = submitFormData.firmaKrediKartiId;
      if (submitFormData.bankaHesapId) dataToSend.bankAccountId = submitFormData.bankaHesapId;
      if (submitFormData.odemeTipi === 'KREDI_KARTI') {
        dataToSend.installmentCount = Number(submitFormData.installmentCount || 1);
      }
      await axios.post('/collections', dataToSend);
      showSnackbar(`${submitFormData.tip === 'COLLECTION' ? 'Tahsilat' : 'Ödeme'} başarıyla kaydedildi`, 'success');
      handleCloseDialog();
      await invalidateAll();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'İşlem başarısız', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [handleCloseDialog, invalidateAll, showSnackbar]);

  const handleDelete = useCallback(async () => {
    if (!selectedTahsilat) return;
    try {
      setActionLoading(true);
      await axios.delete(`/collections/${selectedTahsilat.id}`);
      showSnackbar('Kayıt silindi', 'success');
      setOpenDeleteDialog(false);
      setSelectedTahsilat(null);
      await invalidateAll();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Silme başarısız', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [invalidateAll, selectedTahsilat, showSnackbar]);

  const handleOpenAuditPopover = useCallback((event: React.MouseEvent<HTMLElement>, row: Tahsilat) => {
    setAuditAnchorEl(event.currentTarget);
    setAuditRow(row);
  }, []);

  const handleCloseAuditPopover = useCallback(() => {
    setAuditAnchorEl(null);
    setAuditRow(null);
  }, []);

  const handleCaprazOdeme = useCallback(async () => {
    try {
      if (!caprazOdemeFormData.tahsilatCariId || !caprazOdemeFormData.odemeCariId) {
        showSnackbar('Tahsilat ve ödeme carisi seçilmelidir', 'error');
        return;
      }
      if (caprazOdemeFormData.tahsilatCariId === caprazOdemeFormData.odemeCariId) {
        showSnackbar('Tahsilat ve ödeme carileri farklı olmalıdır', 'error');
        return;
      }
      const tutarNum = typeof caprazOdemeFormData.tutar === 'string' ? parseFloat(caprazOdemeFormData.tutar) : caprazOdemeFormData.tutar;
      if (!tutarNum || tutarNum <= 0) {
        showSnackbar("Tutar 0'dan büyük olmalıdır", 'error');
        return;
      }
      setActionLoading(true);
      await axios.post('/collections/cross-payment', {
        collectionAccountId: caprazOdemeFormData.tahsilatCariId,
        paymentAccountId: caprazOdemeFormData.odemeCariId,
        amount: tutarNum,
        date: caprazOdemeFormData.tarih,
        notes: caprazOdemeFormData.aciklama,
      });
      showSnackbar('Çapraz ödeme başarıyla oluşturuldu', 'success');
      setOpenCaprazOdemeDialog(false);
      setCaprazOdemeFormData({ tahsilatCariId: '', odemeCariId: '', tutar: 0, tarih: new Date().toISOString().split('T')[0], aciklama: '' });
      await invalidateAll();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Çapraz ödeme oluşturulamadı', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [caprazOdemeFormData, invalidateAll, showSnackbar]);

  const getOdemeTipiLabel = useCallback((tip: string) => {
    const map: Record<string, string> = { NAKIT: 'Nakit', KREDI_KARTI: 'Kart', CASH: 'Nakit', CREDIT_CARD: 'Kart', POS: 'POS' };
    return map[tip] || tip;
  }, []);

  const getPaymentSource = useCallback((row: Tahsilat): React.ReactNode => {
    if (row.kasa) return <Typography variant="body2" fontWeight={500}>{row.kasa.kasaAdi}</Typography>;
    if (row.bankaHesap) return <Typography variant="body2" fontWeight={500}>{row.bankaHesap.bankaAdi} › {row.bankaHesap.hesapAdi}</Typography>;
    if (row.firmaKrediKarti) return <Typography variant="body2" fontWeight={500}>{row.firmaKrediKarti.kartAdi}</Typography>;
    return <Typography variant="body2" color="text.disabled">—</Typography>;
  }, []);

  const formatAuditDate = useCallback((value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // ─── DataGrid Kolonları ───────────────────────────────────────────────────
  const columns = useMemo<GridColDef<Tahsilat>[]>(() => [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 110,
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.tarih).toLocaleDateString('tr-TR')}
        </Typography>
      ),
    },
    {
      field: 'cariKodu',
      headerName: 'Cari Kod',
      minWidth: 130,
      flex: 1,
      valueGetter: (_value: any, row: Tahsilat) => row.cari?.cariKodu || '—',
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Typography variant="body2" color="text.secondary">
          {row.cari?.cariKodu || '—'}
        </Typography>
      ),
    },
    {
      field: 'cariUnvan',
      headerName: 'Cari Ünvan',
      minWidth: 220,
      flex: 1.8,
      valueGetter: (_value: any, row: Tahsilat) => row.cari?.unvan || '—',
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
          {row.cari?.unvan || '—'}
        </Typography>
      ),
    },
    {
      field: 'odemeTipi',
      headerName: 'Yöntem',
      width: 100,
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => {
        const isCard = row.odemeTipi === 'KREDI_KARTI' || (row.odemeTipi as string) === 'CREDIT_CARD';
        return (
          <Chip
            icon={isCard ? <CreditCard sx={{ fontSize: '0.9rem !important' }} /> : <Payments sx={{ fontSize: '0.9rem !important' }} />}
            label={getOdemeTipiLabel(row.odemeTipi)}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: isCard
                ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                : 'color-mix(in srgb, var(--chart-2) 12%, transparent)',
              color: isCard ? 'var(--primary)' : 'var(--chart-2)',
              border: `1px solid ${isCard
                ? 'color-mix(in srgb, var(--primary) 35%, transparent)'
                : 'color-mix(in srgb, var(--chart-2) 35%, transparent)'}`,
            }}
          />
        );
      },
    },
    {
      field: 'kasa',
      headerName: 'Kasa / Hesap',
      flex: 1.5,
      minWidth: 140,
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => getPaymentSource(row),
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      width: 145,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
          {row.tip === 'COLLECTION'
            ? <ArrowDownward sx={{ fontSize: 14, color: 'var(--chart-2)' }} />
            : <ArrowUpward sx={{ fontSize: 14, color: 'var(--destructive)' }} />}
          <Typography
            fontWeight={700}
            sx={{ color: row.tip === 'COLLECTION' ? 'var(--chart-2)' : 'var(--destructive)', fontSize: '0.9rem' }}
          >
            {formatCurrencyFn(row.tutar)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      flex: 2,
      minWidth: 120,
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.aciklama || '—'}
        </Typography>
      ),
    },
    {
      field: 'audit',
      headerName: 'Denetim',
      width: 90,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <IconButton
          size="small"
          sx={{ color: 'var(--muted-foreground)' }}
          onClick={(event: React.MouseEvent<HTMLElement>) => handleOpenAuditPopover(event, row)}
        >
          <Visibility fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 96,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }: GridRenderCellParams<Tahsilat>) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Makbuz">
            <IconButton size="small" onClick={() => window.open(`/collection/print/${row.id}`, '_blank')} sx={{ color: 'text.secondary' }}>
              <Print fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton
              size="small"
              color="error"
              onClick={() => { setSelectedTahsilat(row); setOpenDeleteDialog(true); }}
              disabled={actionLoading}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [actionLoading, getOdemeTipiLabel, getPaymentSource, handleOpenAuditPopover]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const isLoading = tahsilatLoading || tahsilatFetching;
  const headerActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        size="small"
        onClick={() => handleOpenDialog('COLLECTION')}
        disabled={actionLoading}
        sx={{
          bgcolor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': { bgcolor: theme.palette.success.dark, boxShadow: 'none' },
        }}
      >
        + Tahsilat
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={() => handleOpenDialog('PAYMENT')}
        disabled={actionLoading}
        sx={{
          bgcolor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: 'none',
          '&:hover': { bgcolor: theme.palette.error.dark, boxShadow: 'none' },
        }}
      >
        + Ödeme
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<SwapHoriz sx={{ fontSize: '0.95rem !important' }} />}
        onClick={() => setOpenCaprazOdemeDialog(true)}
        disabled={actionLoading}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: 'none',
          color: theme.palette.primary.main,
          borderColor: alpha(theme.palette.primary.main, 0.4),
          '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05), boxShadow: 'none' },
        }}
      >
        Çapraz
      </Button>
    </Stack>
  );

  return (
    <StandardPage title="Tahsilat & Ödeme" headerActions={headerActions}>
      {/* Loading bar */}
      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

      {/* KPI Kartları - MODERNIZE */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Net Bakiye', value: netBalance, icon: TrendingDown, color: netBalance >= 0 ? theme.palette.success.main : theme.palette.error.main },
          { label: 'Tahsilat', value: collectionTotal, icon: ArrowDownward, color: theme.palette.success.main },
          { label: 'Ödeme', value: paymentTotal, icon: ArrowUpward, color: theme.palette.error.main },
          { label: 'Toplam Tahsilat', value: stats.totalCollection, icon: AccountBalance, color: theme.palette.info.main },
          { label: 'Toplam Ödeme', value: stats.totalPayment, icon: Payments, color: theme.palette.warning.main },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <StandardCard>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: alpha(item.color as string, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <item.icon sx={{ color: item.color }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="800">
                    {formatCurrencyFn(Math.abs(item.value))}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Stack>
            </StandardCard>
          </Grid>
        ))}
      </Grid>

      {/* Tablo Kartı */}
      <StandardCard padding={0}>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          {/* Tahsilat / Ödeme Toggle */}
          <Box sx={{
            display: 'flex',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}>
            <Button
              disableElevation
              size="small"
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              sx={{
                borderRadius: 0,
                fontWeight: 700,
                px: 2,
                py: 1,
                minWidth: 100,
                bgcolor: activeTab === 0 ? 'var(--chart-2)' : 'transparent',
                color: activeTab === 0 ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 0
                    ? 'color-mix(in srgb, var(--chart-2) 85%, black)'
                    : 'color-mix(in srgb, var(--chart-2) 8%, transparent)',
                },
              }}
            >
              <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
              Tahsilatlar
              <Chip
                label={collections.length}
                size="small"
                sx={{
                  ml: 0.5,
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: activeTab === 0
                    ? 'color-mix(in srgb, var(--background) 25%, transparent)'
                    : 'color-mix(in srgb, var(--chart-2) 12%, transparent)',
                  color: activeTab === 0 ? 'var(--foreground)' : 'var(--chart-2)',
                }}
              />
            </Button>
            <Divider orientation="vertical" flexItem />
            <Button
              disableElevation
              size="small"
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              sx={{
                borderRadius: 0,
                fontWeight: 700,
                px: 2,
                py: 1,
                minWidth: 100,
                bgcolor: activeTab === 1 ? 'var(--destructive)' : 'transparent',
                color: activeTab === 1 ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 1
                    ? 'color-mix(in srgb, var(--destructive) 85%, black)'
                    : 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                },
              }}
            >
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              Ödemeler
              <Chip
                label={payments.length}
                size="small"
                sx={{
                  ml: 0.5,
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: activeTab === 1
                    ? 'color-mix(in srgb, var(--background) 25%, transparent)'
                    : 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                  color: activeTab === 1 ? 'var(--foreground)' : 'var(--destructive)',
                }}
              />
            </Button>
          </Box>

          {/* Arama */}
          <TextField
            size="small"
            placeholder="Cari, tutar veya açıklama ara..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200, maxWidth: 380 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}><Close fontSize="small" /></IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />

          {/* Hızlı Tarih */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {[
              { key: 'BUGÜN', label: 'Bugün' },
              { key: 'BU_HAFTA', label: 'Hafta' },
              { key: 'BU_AY', label: 'Ay' },
              { key: 'BU_YIL', label: 'Yıl' },
              { key: 'TÜMÜ', label: 'Tümü' },
            ].map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                size="small"
                onClick={() => handleQuickFilter(f.key)}
                sx={{
                  fontWeight: quickFilter === f.key ? 700 : 400,
                  bgcolor: quickFilter === f.key ? 'primary.main' : 'transparent',
                  color: quickFilter === f.key ? 'white' : 'text.secondary',
                  border: '1px solid',
                  borderColor: quickFilter === f.key ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: quickFilter === f.key ? 'primary.dark' : 'action.hover' },
                }}
              />
            ))}
          </Stack>

          {/* Özel Tarih */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <TextField
              type="date"
              size="small"
              label="Başlangıç"
              value={dateRange.start}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDateRange({ ...dateRange, start: e.target.value }); setQuickFilter(''); }}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              type="date"
              size="small"
              label="Bitiş"
              value={dateRange.end}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDateRange({ ...dateRange, end: e.target.value }); setQuickFilter(''); }}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>

          {/* Araçlar */}
          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto', flexShrink: 0 }}>
            <Tooltip title="Yenile">
              <IconButton size="small" onClick={() => refetch()} sx={{ color: 'text.secondary' }}>
                <RefreshOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={showChart ? 'Grafiği Gizle' : 'Trendi Göster'}>
              <IconButton
                size="small"
                onClick={() => setShowChart(!showChart)}
                sx={{ color: showChart ? 'primary.main' : 'text.secondary' }}
              >
                {showChart ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={denseMode ? 'Normal Görünüm' : 'Kompakt Görünüm'}>
              <IconButton size="small" onClick={() => setDenseMode(!denseMode)} sx={{ color: 'text.secondary' }}>
                {denseMode ? <TableRows fontSize="small" /> : <ViewCompact fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* ── Trend Grafiği (gizlenebilir) ─────────────────────────────── */}
        <Collapse in={showChart && trendData.length > 0}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                İşlem Trendi
              </Typography>
              <ToggleButtonGroup
                value={trendPeriod}
                exclusive
                onChange={(_: any, val: any) => val && setTrendPeriod(val)}
                size="small"
                sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1.5, fontSize: '0.75rem', fontWeight: 600 } }}
              >
                <ToggleButton value="WEEKLY">7 Gün</ToggleButton>
                <ToggleButton value="MONTHLY">30 Gün</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTahsilat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOdeme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickFormatter={(v: number) => `₺${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={50} />
                <RechartsTooltip
                  formatter={(value: any) => formatCurrencyFn(value)}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 13 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="tahsilat" name="Tahsilat" stroke="var(--chart-2)" strokeWidth={2} fill="url(#gradTahsilat)" dot={false} />
                <Area type="monotone" dataKey="odeme" name="Ödeme" stroke="var(--destructive)" strokeWidth={2} fill="url(#gradOdeme)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Collapse>

        {/* ── Aktif Filtre / Özet Bilgi ─────────────────────────────────── */}
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.default', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {filteredData.length} kayıt
            </Typography>
            {searchQuery && (
              <Chip size="small" label={`"${searchQuery}"`} onDelete={() => setSearchQuery('')} sx={{ fontSize: '0.75rem', height: 22 }} />
            )}
            {quickFilter && quickFilter !== 'TÜMÜ' && (
              <Chip size="small" color="primary" variant="outlined" label={quickFilter === 'BUGÜN' ? 'Bugün' : quickFilter === 'BU_HAFTA' ? 'Bu Hafta' : quickFilter === 'BU_AY' ? 'Bu Ay' : 'Bu Yıl'} onDelete={() => handleQuickFilter('TÜMÜ')} sx={{ fontSize: '0.75rem', height: 22 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Toplam:
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: activeTab === 0 ? 'var(--chart-2)' : 'var(--destructive)' }}>
              {formatCurrencyFn(filteredData.reduce((s: number, t: Tahsilat) => s + Number(t.tutar || 0), 0))}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16 }} />
            <Tooltip title="Excel İndir">
              <IconButton size="small" sx={{ color: 'var(--chart-2)' }}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="PDF İndir">
              <IconButton size="small" sx={{ color: 'var(--destructive)' }}>
                <PictureAsPdf fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── DataGrid ────────────────────────────────────────────────────── */}
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid<Tahsilat>
            rows={filteredData}
            columns={columns}
            loading={isLoading || actionLoading}
            density={denseMode ? 'compact' : 'standard'}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.05,
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                cursor: 'pointer',
              },
            }}
            slots={{
              noRowsOverlay: () => <EmptyState activeTab={activeTab} />,
            }}
          />
        </Box>
      </StandardCard>

      {/* Dialog'lar */}
      <Popover
        open={Boolean(auditAnchorEl)}
        anchorEl={auditAnchorEl}
        onClose={handleCloseAuditPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 1.25,
            borderRadius: 2,
            border: '1px solid var(--border)',
            bgcolor: 'var(--card)',
            minWidth: 220,
          },
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.75, color: 'var(--foreground)' }}>
          Denetim Bilgileri
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3, color: 'var(--muted-foreground)' }}>
          Oluşturma: {formatAuditDate(auditRow?.createdAt)}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3, color: 'var(--muted-foreground)' }}>
          Güncelleme: {formatAuditDate(auditRow?.updatedAt)}
        </Typography>
      </Popover>

      {/* Tahsilat / Ödeme Form Dialog */}
      <TahsilatFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialFormData={initialFormData}
        cariler={cariler}
        kasalar={kasalar}
        bankaHesaplari={bankaHesaplari}
        carilerLoading={false}
        bankaHesaplariLoading={false}
        kasalarLoading={false}
        submitting={actionLoading}
        formatMoney={formatCurrencyFn}
      />

      {/* Çapraz Ödeme Dialog */}
      <CaprazOdemeDialog
        open={openCaprazOdemeDialog}
        onClose={() => setOpenCaprazOdemeDialog(false)}
        onSubmit={handleCaprazOdeme}
        formData={caprazOdemeFormData}
        setFormData={setCaprazOdemeFormData}
        cariler={cariler}
        loading={false}
        submitting={actionLoading}
        carilerError={false}
      />

      {/* Silme Onay Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: 'error.light', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Delete sx={{ fontSize: 18, color: 'error.main' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Kaydı Sil</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>{selectedTahsilat?.cari?.unvan}</strong> carisine ait{' '}
              <strong>{formatCurrencyFn(selectedTahsilat?.tutar || 0)}</strong> tutarındaki{' '}
              {selectedTahsilat?.tip === 'COLLECTION' ? 'tahsilat' : 'ödeme'} kaydını silmek istediğinizden emin misiniz?
            </Typography>
          </Alert>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Bu işlem geri alınamaz. Cari bakiyesi ve kasa bakiyesi otomatik olarak güncellenecektir.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            İptal
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {actionLoading ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
