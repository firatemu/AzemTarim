'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  AccountBalance,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Visibility,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { turkiyeBankalari, kartTipleri } from '@/lib/banks';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Kasa {
  id: string;
  code: string;
  name: string;
  type: 'CASH' | 'BANK' | 'COMPANY_CREDIT_CARD';
  balance: number;
  isActive: boolean;
  bankAccounts?: BankAccount[];
  companyCreditCards?: CompanyCreditCard[];
}

interface BankAccount {
  id: string;
  code: string;
  name: string;
  bankName: string;
  branchCode?: string;
  branchName?: string;
  accountNo?: string;
  iban?: string;
  type: 'VADESIZ' | 'POS';
  balance: number;
  isActive: boolean;
}

interface CompanyCreditCard {
  id: string;
  code: string;
  name: string;
  bankName: string;
  cardType?: string;
  lastFourDigits?: string;
  limit?: number;
  balance: number;
  cutoffDate?: string;
  dueDate?: string;
  isActive: boolean;
}

interface Tahsilat {
  id: string;
  type: 'COLLECTION' | 'PAYMENT';
  amount: number;
  date: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD';
  notes?: string;
  createdAt?: string;
  account: {
    code: string;
    title: string;
  };
  cashbox: {
    code: string;
    name: string;
    type: string;
  } | null;
}

interface BankaHavale {
  id: string;
  hareketTipi: 'GELEN' | 'GIDEN';
  bankaHesabiId: string;
  cariId: string;
  tutar: number;
  tarih: string;
  aciklama?: string;
  referansNo?: string;
  cari: {
    cariKodu: string;
    unvan: string;
  };
}

interface KasaHareketi {
  id: string;
  hareketTipi: 'TAHSILAT' | 'ODEME' | 'GELEN_HAVALE' | 'GIDEN_HAVALE';
  tutar: number;
  tarih: string | Date;
  cari?: {
    cariKodu: string;
    unvan: string;
  } | null;
  aciklama?: string;
  odemeTipi?: 'CASH' | 'CREDIT_CARD';
  referansNo?: string;
}

interface BankaHesapHareket {
  id: string;
  hareketTipi: string; // HAVALE_GELEN, HAVALE_GIDEN, KREDI_KARTI_TAHSILAT
  tutar: number;
  bakiye: number;
  tarih: string;
  aciklama?: string;
  referansNo?: string;
  cari?: {
    id: string;
    cariKodu: string;
    unvan: string;
  };
}

interface BankaHesabiWithKasa {
  id: string;
  hesapKodu: string;
  hesapAdi?: string;
  bankaAdi: string;
  bakiye: number;
  kasaId: string;
  kasa?: {
    id: string;
    kasaKodu: string;
    kasaAdi: string;
  };
}

// Banka Hesabı Hareketleri Component
interface BankaHesabiHareketleriProps {
  bankaHesabiId: string;
}

const BankaHesabiHareketleri: React.FC<BankaHesabiHareketleriProps> = ({ bankaHesabiId }) => {
  // Önce banka hesabı bilgisini al (kasaId'yi öğrenmek için)
  const { data: hesapData, isLoading: hesapLoading } = useQuery<any>({
    queryKey: ['bank-account', bankaHesabiId],
    queryFn: async () => {
      const response = await axios.get(`/bank-accounts/${bankaHesabiId}`);
      return response.data;
    },
    enabled: !!bankaHesabiId,
  });

  // BankaHesapHareket kayıtlarını al (spesifik hesap için)
  const { data: hareketlerData, isLoading: hareketlerLoading } = useQuery<{ movements: any[] }>({
    queryKey: ['bank-account', 'movements', bankaHesabiId],
    queryFn: async () => {
      const response = await axios.get(`/bank-accounts/${bankaHesabiId}`);
      return response.data;
    },
    enabled: !!bankaHesabiId,
  });

  const movements = hareketlerData?.movements || [];

  const isLoading = hesapLoading || hareketlerLoading;

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hesapData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Banka hesabı bilgileri yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'var(--muted)', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Toplam Bakiye
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={hesapData.balance >= 0 ? 'success.main' : 'error.main'}>
            {formatMoney(hesapData.balance)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          Bu banka hesabı için henüz havale işlemi bulunamadı
        </Typography>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2">
            {formatDate(params.row?.date)}
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        return params.row?.date ? new Date(params.row.date).getTime() : 0;
      },
    },
    {
      field: 'type',
      headerName: 'Tip',
      width: 160,
      renderCell: (params: any) => {
        const type = params.row.type;
        const labels: Record<string, string> = {
          HAVALE_GELEN: 'Gelen Havale',
          HAVALE_GIDEN: 'Giden Havale',
          KREDI_KARTI_TAHSILAT: 'Kredi Kartı Tahsilat',
        };
        const colors: Record<string, { bg: string; color: string }> = {
          HAVALE_GELEN: { bg: '#eff6ff', color: '#3b82f6' },
          HAVALE_GIDEN: { bg: '#fef3c7', color: '#f59e0b' },
          KREDI_KARTI_TAHSILAT: { bg: '#ecfdf5', color: '#10b981' },
        };
        const color = colors[type] || { bg: '#f3f4f6', color: '#6b7280' };
        return (
          <Chip
            label={labels[type] || type}
            size="small"
            sx={{
              bgcolor: color.bg,
              color: color.color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: 'account',
      headerName: 'Cari',
      width: 250,
      renderCell: (params: any) => {
        const account = params.row.account;
        if (account) {
          return (
            <Typography variant="body2">
              {account.code} - {account.title}
            </Typography>
          );
        }
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Tutar',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const amount = params.row.amount || 0;
        const type = params.row.type;
        const isPositive = type === 'HAVALE_GELEN' || type === 'KREDI_KARTI_TAHSILAT';
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {isPositive ? '+' : '-'}{formatMoney(amount)}
          </Typography>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Bakiye',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const balance = params.row.balance || 0;
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={balance >= 0 ? 'success.main' : 'error.main'}
          >
            {formatMoney(balance)}
          </Typography>
        );
      },
    },
    {
      field: 'referenceNo',
      headerName: 'Referans No',
      width: 150,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2">
            {params.row?.referenceNo || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'notes',
      headerName: 'Açıklama',
      width: 250,
      renderCell: (params: any) => {
        return (
          <Typography variant="body2">
            {params.row?.notes || '-'}
          </Typography>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2, p: 2, bgcolor: 'var(--muted)', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Toplam Bakiye
        </Typography>
        <Typography variant="h6" fontWeight="bold" color={hesapData.balance >= 0 ? 'success.main' : 'error.main'}>
          {formatMoney(hesapData.balance)}
        </Typography>
      </Box>
      <Paper>
        <DataGrid
          rows={movements}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'var(--muted)',
              fontWeight: 600,
            },
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'tarih', sort: 'desc' }],
            },
          }}
        />
      </Paper>
    </Box>
  );
};

// Kasa Hareketleri Component
interface KasaHareketleriProps {
  kasaId: string;
  kasaType: 'CASH' | 'BANK' | 'COMPANY_CREDIT_CARD';
}

const KasaHareketleri: React.FC<KasaHareketleriProps> = ({ kasaId, kasaType }) => {
  // Tahsilat/Ödeme hareketleri
  const { data: tahsilatHareketleri, isLoading: tahsilatLoading } = useQuery<Tahsilat[]>({
    queryKey: ['tahsilat', 'kasa', kasaId],
    queryFn: async () => {
      const response = await axios.get('/collections', {
        params: {
          page: 1,
          limit: 1000,
          cashboxId: kasaId,
        },
      });
      return response.data?.data ?? [];
    },
    enabled: !!kasaId,
  });

  // Banka havale hareketleri (sadece BANKA kasası için)
  const { data: havaleHareketleri, isLoading: havaleLoading } = useQuery<any[]>({
    queryKey: ['bank-account-movement', 'kasa', kasaId],
    queryFn: async () => {
      const response = await axios.get('/bank-accounts', {
        params: {
          cashboxId: kasaId,
        },
      });
      return response.data ?? [];
    },
    enabled: !!kasaId && kasaType === 'BANK',
  });

  // Birleştirilmiş hareketler
  const hareketler: KasaHareketi[] = useMemo(() => {
    const allHareketler: KasaHareketi[] = [];

    // Tahsilat/Ödeme hareketlerini ekle
    if (tahsilatHareketleri) {
      tahsilatHareketleri.forEach((tahsilat) => {
        allHareketler.push({
          id: `tahsilat-${tahsilat.id}`,
          hareketTipi: tahsilat.type === 'COLLECTION' ? 'TAHSILAT' : 'ODEME',
          tutar: tahsilat.amount,
          tarih: tahsilat.date,
          cari: {
            cariKodu: tahsilat.account.code,
            unvan: tahsilat.account.title,
          },
          aciklama: tahsilat.notes,
          odemeTipi: tahsilat.paymentMethod,
        });
      });
    }

    // Banka havale hareketlerini ekle (sadece BANKA kasası için)
    if (kasaType === 'BANK' && havaleHareketleri) {
      havaleHareketleri.forEach((havale) => {
        allHareketler.push({
          id: `havale-${havale.id}`,
          hareketTipi: havale.type === 'GELEN' ? 'GELEN_HAVALE' : 'GIDEN_HAVALE',
          tutar: havale.amount,
          tarih: havale.date,
          cari: havale.account ? {
            cariKodu: havale.account.code,
            unvan: havale.account.title,
          } : null,
          aciklama: havale.notes,
          referansNo: havale.referenceNo,
        });
      });
    }

    // Tarihe göre sırala (yeni -> eski)
    return allHareketler.sort((a, b) => {
      const dateA = new Date(a.tarih).getTime();
      const dateB = new Date(b.tarih).getTime();
      return dateB - dateA;
    });
  }, [tahsilatHareketleri, havaleHareketleri, kasaType]);

  const isLoading = tahsilatLoading || (kasaType === 'BANK' && havaleLoading);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'tarih',
      headerName: 'Tarih',
      width: 120,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {formatDate(row?.tarih as string)}
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        const row = params.row as KasaHareketi;
        return row?.tarih ? new Date(row.tarih).getTime() : 0;
      },
    },
    {
      field: 'hareketTipi',
      headerName: 'Tip',
      width: 140,
      renderCell: (params: any) => {
        const tip = params.row.hareketTipi;
        const labels: Record<string, string> = {
          TAHSILAT: 'Tahsilat',
          ODEME: 'Ödeme',
          GELEN_HAVALE: 'Gelen Havale',
          GIDEN_HAVALE: 'Giden Havale',
        };
        const colors: Record<string, { bg: string; color: string }> = {
          TAHSILAT: { bg: '#ecfdf5', color: '#10b981' },
          ODEME: { bg: '#fef2f2', color: '#ef4444' },
          GELEN_HAVALE: { bg: '#eff6ff', color: '#3b82f6' },
          GIDEN_HAVALE: { bg: '#fef3c7', color: '#f59e0b' },
        };
        const color = colors[tip] || { bg: '#f3f4f6', color: '#6b7280' };
        return (
          <Chip
            label={labels[tip] || tip}
            size="small"
            sx={{
              bgcolor: color.bg,
              color: color.color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: 'cari',
      headerName: 'Cari',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        if (row?.cari) {
          return (
            <Typography variant="body2">
              {row.cari.cariKodu} - {row.cari.unvan}
            </Typography>
          );
        }
        return (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
      valueGetter: (params: any) => {
        return params.row?.cari ? `${params.row.cari.cariKodu} - ${params.row.cari.unvan}` : '';
      },
    },
    {
      field: 'tutar',
      headerName: 'Tutar',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        const tutar = row?.tutar || 0;
        const tip = row?.hareketTipi;
        const isPositive = tip === 'TAHSILAT' || tip === 'GELEN_HAVALE';
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {isPositive ? '+' : '-'}{formatMoney(tutar)}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.tutar || 0,
    },
    {
      field: 'odemeTipi',
      headerName: 'Ödeme Tipi',
      width: 130,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        const tip = row.odemeTipi;
        if (!tip) return null;
        return (
          <Chip
            label={tip === 'CASH' ? 'Nakit' : 'Kredi Kartı'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'aciklama',
      headerName: 'Açıklama',
      width: 250,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {row?.aciklama || '-'}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.aciklama || '',
    },
    {
      field: 'referansNo',
      headerName: 'Referans No',
      width: 150,
      renderCell: (params: any) => {
        const row = params.row as KasaHareketi;
        return (
          <Typography variant="body2">
            {row?.referansNo || '-'}
          </Typography>
        );
      },
      valueGetter: (params: any) => params?.row?.referansNo || '',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hareketler || hareketler.length === 0) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Bu kasa için henüz hareket bulunamadı
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <DataGrid
        rows={hareketler}
        columns={columns}
        getRowId={(row) => row.id}
        autoHeight
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'var(--muted)',
            fontWeight: 600,
          },
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'tarih', sort: 'desc' }],
          },
        }}
      />
    </Paper>
  );
};

export default function KasaDetayPage() {
  const params = useParams();
  const router = useRouter();
  const kasaId = params.id as string;

  const [kasa, setKasa] = useState<Kasa | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openHareketlerDialog, setOpenHareketlerDialog] = useState(false);
  const [selectedBankaHesabi, setSelectedBankaHesabi] = useState<BankAccount | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Banka Hesabı Form
  const [bankaHesapForm, setBankaHesapForm] = useState({
    code: '',
    name: '',
    bankName: '',
    branchCode: '',
    branchName: '',
    accountNo: '',
    iban: '',
    type: 'VADESIZ' as 'VADESIZ' | 'POS',
    isActive: true,
  });

  // Firma Kredi Kartı Form
  const [firmaKartForm, setFirmaKartForm] = useState({
    code: '',
    name: '',
    bankName: '',
    cardType: '',
    lastFourDigits: '',
    limit: 0,
    cutoffDate: '',
    dueDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchKasa();
  }, [kasaId]);

  const fetchKasa = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/cashbox/${kasaId}`);
      setKasa(response.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Kasa yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  // ==================== BANKA HESAP YÖNETİMİ ====================

  const handleOpenBankaHesapDialog = (hesap?: BankAccount) => {
    if (hesap) {
      setEditingItem(hesap);
      setBankaHesapForm({
        code: hesap.code || '',
        name: hesap.name || '',
        bankName: hesap.bankName || '',
        branchCode: hesap.branchCode || '',
        branchName: hesap.branchName || '',
        accountNo: hesap.accountNo || '',
        iban: hesap.iban || '',
        type: hesap.type,
        isActive: hesap.isActive,
      });
    } else {
      setEditingItem(null);
      setBankaHesapForm({
        code: '',
        name: '',
        bankName: '',
        branchCode: '',
        branchName: '',
        accountNo: '',
        iban: '',
        type: 'VADESIZ',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveBankaHesap = async () => {
    try {
      if (editingItem) {
        await axios.put(`/bank-accounts/${editingItem.id}`, bankaHesapForm);
        showSnackbar('Banka hesabı güncellendi', 'success');
      } else {
        await axios.post('/bank-accounts', { ...bankaHesapForm, cashboxId: kasaId });
        showSnackbar('Banka hesabı eklendi', 'success');
      }
      setOpenDialog(false);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDeleteBankaHesap = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`/bank-accounts/${deleteTarget.id}`);
      showSnackbar('Banka hesabı silindi', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  // ==================== FİRMA KREDİ KARTI YÖNETİMİ ====================

  const handleOpenFirmaKartDialog = (kart?: CompanyCreditCard) => {
    if (kart) {
      setEditingItem(kart);
      setFirmaKartForm({
        code: kart.code || '',
        name: kart.name || '',
        bankName: kart.bankName || '',
        cardType: kart.cardType || '',
        lastFourDigits: kart.lastFourDigits || '',
        limit: kart.limit || 0,
        cutoffDate: kart.cutoffDate ? new Date(kart.cutoffDate).toISOString().split('T')[0] : '',
        dueDate: kart.dueDate ? new Date(kart.dueDate).toISOString().split('T')[0] : '',
        isActive: kart.isActive,
      });
    } else {
      setEditingItem(null);
      setFirmaKartForm({
        code: '',
        name: '',
        bankName: '',
        cardType: '',
        lastFourDigits: '',
        limit: 0,
        cutoffDate: '',
        dueDate: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleSaveFirmaKart = async () => {
    try {
      if (editingItem) {
        await axios.put(`/company-credit-cards/${editingItem.id}`, firmaKartForm);
        showSnackbar('Firma kredi kartı güncellendi', 'success');
      } else {
        await axios.post('/company-credit-cards', { ...firmaKartForm, cashboxId: kasaId });
        showSnackbar('Firma kredi kartı eklendi', 'success');
      }
      setOpenDialog(false);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDeleteFirmaKart = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`/company-credit-cards/${deleteTarget.id}`);
      showSnackbar('Firma kredi kartı silindi', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchKasa();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!kasa) {
    return (
      <MainLayout>
        <Alert severity="error">Kasa bulunamadı</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/cash')}
            sx={{ mb: 2 }}
          >
            Kasalara Dön
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {kasa.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {kasa.code} - {kasa.type === 'CASH' ? 'Nakit Kasa' : kasa.type}
              </Typography>
            </Box>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Toplam Bakiye
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={kasa.balance >= 0 ? 'success.main' : 'error.main'}>
                  {formatMoney(kasa.balance)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* NAKİT KASA */}
        {kasa.type === 'CASH' && (
          <Alert severity="info">
            💵 Nakit kasa için doğrudan tahsilat ve ödeme işlemleri yapılır.
            <br />
            <strong>Tahsilat & Ödeme</strong> menüsünden işlem yapabilirsiniz.
          </Alert>
        )}



        {/* KASA HAREKETLERİ - Tüm kasa tipleri için */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            💰 Kasa Hareketleri
          </Typography>
          <KasaHareketleri kasaId={kasaId} kasaType={kasa.type} />
        </Box>

        {/* BANKA KASASI - Banka Hesapları */}
        {kasa.type === 'BANK' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                🏦 Banka Hesapları
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenBankaHesapDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                }}
              >
                Yeni Hesap Ekle
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Banka / Şube</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hesap No / IBAN</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Bakiye</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!kasa.bankAccounts || kasa.bankAccounts.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Henüz banka hesabı eklenmemiş
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kasa.bankAccounts.map((hesap: any) => (
                      <TableRow key={hesap.id} hover>
                        <TableCell>
                          <Chip
                            label={hesap.type}
                            size="small"
                            color={hesap.type === 'POS' ? 'warning' : 'info'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {hesap.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{hesap.name}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{hesap.bankName}</Typography>
                            {hesap.branchName && (
                              <Typography variant="caption" color="text.secondary">
                                {hesap.branchName}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {hesap.accountNo && (
                              <Typography variant="body2">{hesap.accountNo}</Typography>
                            )}
                            {hesap.iban && (
                              <Typography variant="caption" color="text.secondary">
                                {hesap.iban}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color={hesap.balance >= 0 ? 'success.main' : 'error.main'}>
                            {formatMoney(hesap.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setSelectedBankaHesabi(hesap);
                              setOpenHareketlerDialog(true);
                            }}
                            title="Hareketleri Görüntüle"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenBankaHesapDialog(hesap)}
                            title="Düzenle"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteTarget(hesap);
                              setOpenDeleteDialog(true);
                            }}
                            title="Sil"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* FİRMA KREDİ KARTI KASASI - Kredi Kartları */}
        {kasa.type === 'COMPANY_CREDIT_CARD' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                💳 Firma Kredi Kartları
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenFirmaKartDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                Yeni Kart Ekle
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Kart Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Kart Adı</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Banka / Kart Tipi</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Son 4 Hane</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Limit</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Harcanan</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Kalan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!kasa.companyCreditCards || kasa.companyCreditCards.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Henüz kredi kartı eklenmemiş
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kasa.companyCreditCards.map((kart: any) => (
                      <TableRow key={kart.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {kart.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{kart.name}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{kart.bankName}</Typography>
                            {kart.cardType && (
                              <Typography variant="caption" color="text.secondary">
                                {kart.cardType}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {kart.lastFourDigits && (
                            <Chip label={`****${kart.lastFourDigits}`} size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {kart.limit ? formatMoney(kart.limit) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="error.main">
                            {formatMoney(kart.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color={kart.limit ? 'success.main' : 'text.secondary'}>
                            {kart.limit ? formatMoney(kart.limit - kart.balance) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenFirmaKartDialog(kart)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeleteTarget(kart);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* BANKA HESAP DIALOG */}
        <Dialog open={openDialog && kasa.type === 'BANK'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle component="div" sx={{ bgcolor: '#3b82f6', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              {editingItem ? 'Banka Hesabı Düzenle' : 'Yeni Banka Hesabı Ekle'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap Kodu"
                  value={bankaHesapForm.code || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, code: e.target.value })}
                  placeholder="Otomatik"
                  helperText="Boş bırakılırsa otomatik"
                  disabled={!!editingItem}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap Adı"
                  value={bankaHesapForm.name || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, name: e.target.value })}
                  placeholder="Hesap adı (opsiyonel)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={turkiyeBankalari}
                  value={bankaHesapForm.bankName || ''}
                  onChange={(e, value) => setBankaHesapForm({ ...bankaHesapForm, bankName: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banka Adı *"
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Hesap Tipi</InputLabel>
                  <Select
                    value={bankaHesapForm.type}
                    label="Hesap Tipi"
                    onChange={(e: any) => setBankaHesapForm({ ...bankaHesapForm, type: e.target.value })}
                    disabled={!!editingItem}
                  >
                    <MenuItem value="VADESIZ">
                      <Box>
                        <Typography variant="body2">💰 Vadesiz Hesap</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gelen/giden havale işlemleri
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="POS">
                      <Box>
                        <Typography variant="body2">💳 POS Hesabı</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Kredi kartı tahsilatları
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Şube Kodu"
                  value={bankaHesapForm.branchCode || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, branchCode: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Şube Adı"
                  value={bankaHesapForm.branchName || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, branchName: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Hesap No"
                  value={bankaHesapForm.accountNo || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, accountNo: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IBAN"
                  value={bankaHesapForm.iban || ''}
                  onChange={(e) => setBankaHesapForm({ ...bankaHesapForm, iban: e.target.value })}
                  placeholder="TR..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveBankaHesap} disabled={!bankaHesapForm.bankName}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FİRMA KREDİ KARTI DIALOG */}
        <Dialog open={openDialog && kasa.type === 'COMPANY_CREDIT_CARD'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle component="div" sx={{ bgcolor: '#ef4444', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              {editingItem ? 'Firma Kredi Kartı Düzenle' : 'Yeni Firma Kredi Kartı Ekle'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kart Kodu"
                  value={firmaKartForm.code || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, code: e.target.value })}
                  placeholder="Otomatik"
                  helperText={editingItem ? "Kart kodu değiştirilemez" : "Boş bırakılırsa otomatik oluşturulur"}
                  disabled={!!editingItem}
                  sx={{ mt: 1 }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kart Adı"
                  value={firmaKartForm.name || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, name: e.target.value })}
                  placeholder="Örn: Ziraat Visa - Ahmet Bey"
                  required
                  sx={{ mt: 1 }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                      '&.Mui-error': {
                        color: 'error.main',
                      },
                    },
                  }}
                  error={!firmaKartForm.name}
                  helperText={!firmaKartForm.name ? "Kart adı zorunludur" : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={turkiyeBankalari}
                  value={firmaKartForm.bankName || ''}
                  onChange={(e, value) => setFirmaKartForm({ ...firmaKartForm, bankName: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banka Adı"
                      required
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip',
                          maxWidth: '100%',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                          '&.Mui-error': {
                            color: 'error.main',
                          },
                        },
                      }}
                      error={!firmaKartForm.bankName}
                      helperText={!firmaKartForm.bankName ? "Banka adı zorunludur" : ""}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={kartTipleri}
                  value={firmaKartForm.cardType || ''}
                  onChange={(e, value) => setFirmaKartForm({ ...firmaKartForm, cardType: value || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kart Tipi"
                      placeholder="Visa, MasterCard vb."
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          textOverflow: 'clip',
                          maxWidth: '100%',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Son 4 Hane"
                  value={firmaKartForm.lastFourDigits || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  inputProps={{ maxLength: 4 }}
                  placeholder="1234"
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Kart numarasının son 4 hanesi"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kart Limiti"
                  value={firmaKartForm.limit}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFirmaKartForm({ ...firmaKartForm, limit: value === '' ? 0 : Math.max(0, parseFloat(value) || 0) });
                  }}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 0.01,
                    },
                  }}
                  helperText={firmaKartForm.limit === 0 ? "0 = Limitsiz (limitsiz harcama)" : "Kartın maksimum harcama limiti"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hesap Kesim Tarihi"
                  value={firmaKartForm.cutoffDate || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, cutoffDate: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Kredi kartı hesap kesim tarihi"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Son Ödeme Tarihi"
                  value={firmaKartForm.dueDate || ''}
                  onChange={(e) => setFirmaKartForm({ ...firmaKartForm, dueDate: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      maxWidth: '100%',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  helperText="Kredi kartı son ödeme tarihi"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleSaveFirmaKart} disabled={!firmaKartForm.name}>
              {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* BANKA HESABI HAREKETLER DIALOG */}
        <Dialog
          open={openHareketlerDialog}
          onClose={() => setOpenHareketlerDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle component="div">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              {selectedBankaHesabi
                ? `${selectedBankaHesabi.bankName} - ${selectedBankaHesabi.name || selectedBankaHesabi.code} Hareketleri`
                : 'Banka Hesabı Hareketleri'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedBankaHesabi && (
              <BankaHesabiHareketleri
                bankaHesabiId={selectedBankaHesabi.id}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHareketlerDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* SİLME ONAY DIALOG */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle component="div">Silme Onayı</DialogTitle>
          <DialogContent>
            <Alert severity="warning">
              <Typography>
                <strong>{deleteTarget?.name}</strong> kaydını silmek istediğinizden emin misiniz?
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
            <Button
              onClick={kasa.type === 'BANK' ? handleDeleteBankaHesap : handleDeleteFirmaKart}
              color="error"
              variant="contained"
            >
              Sil
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
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
