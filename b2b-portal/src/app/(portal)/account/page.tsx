'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tab,
  Tabs,
  TextField,
  Stack,
  IconButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { b2bFetch } from '@/lib/b2b-fetch';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

type AccountSummary = {
  customer: {
    id: string;
    name: string;
    email: string;
    vatDays: number;
  };
  erpAccount: {
    title: string;
    balance: string;
    creditLimit: string | null;
    creditStatus: string | null;
  } | null;
  overdue: {
    pastDueLineCount: number;
    sumDebit: string;
    sumCredit: string;
  };
  fifo: {
    totalDebit: string;
    totalCredit: string;
    balance: string;
    overdueAmount: string;
    oldestOverdueDate: string | null;
    pastDueMovementCount: number;
  };
  openOrdersCount: number;
  placeOrderWithCurrentCart: {
    blocked: boolean;
    reason: string | null;
  };
};

type MovementRow = {
  id: string;
  date: string;
  type: string;
  description: string | null;
  debit: string;
  credit: string;
  balance: string;
  erpInvoiceNo: string | null;
  fifoDueDate?: string | null;
  fifoRemainingDebit?: string | null;
  fifoIsPastDue?: boolean;
};

export default function AccountPage() {
  const [exporting, setExporting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const summary = useQuery({
    queryKey: ['b2b', 'account', 'summary'],
    queryFn: async () => {
      const r = await b2bFetch('account/summary');
      if (!r.ok) throw new Error('Ozet alinamadi');
      return r.json() as Promise<AccountSummary>;
    },
  });

  const movements = useQuery({
    queryKey: ['b2b', 'account', 'movements', 'fifo', dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageSize: '50',
        page: '1',
        includeFifo: 'true',
      });
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const r = await b2bFetch(`account/movements?${params.toString()}`);
      if (!r.ok) throw new Error('Hareketler');
      return r.json() as Promise<{ data: MovementRow[]; meta: { total: number } }>;
    },
  });

  if (summary.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (summary.isError || !summary.data) {
    return (
      <Alert severity="error">
        Cari ozeti yuklenemedi. <Link href="/dashboard">Panele don</Link>
      </Alert>
    );
  }

  const s = summary.data;
  const fmt = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return n.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const downloadExcel = async () => {
    setExporting(true);
    try {
      const r = await b2bFetch('account/movements/export');
      if (!r.ok) throw new Error('Excel alinamadi');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'b2b-account-movements.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hesap Bilgileri
        </Typography>
      </Box>

      {/* Risk Warning */}
      {s.placeOrderWithCurrentCart.blocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {s.placeOrderWithCurrentCart.reason ??
            'Mevcut sepet ile sipariş risk kontrolünden geçemeyebilir.'}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
          <Tab label="Hesap Özeti" />
          <Tab label="Hesap Hareketleri" />
        </Tabs>
      </Box>

      {/* Tab 0: Account Summary */}
      {currentTab === 0 && (
        <Stack spacing={3}>
          {/* Stats Cards */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0,
              }}
            >
              {[
                {
                  label: 'FIFO Bakiye (B2B Hareket)',
                  value: `${fmt(s.fifo.balance)} ₺`,
                },
                {
                  label: 'Gecikmiş Tutar (FIFO)',
                  value: `${fmt(s.fifo.overdueAmount)} ₺`,
                },
                {
                  label: 'Vadesi Geçen Satır',
                  value: String(s.fifo.pastDueMovementCount),
                },
                {
                  label: 'Açık Sipariş',
                  value: String(s.openOrdersCount),
                },
              ].map((item, i, arr) => (
                <Box
                  key={item.label}
                  sx={{
                    flex: '1 1 140px',
                    px: 2,
                    py: 1,
                    borderRight: i < arr.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Customer & ERP Info */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Müşteri
                </Typography>
                <Typography fontWeight={600}>{s.customer.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.customer.email}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Vade Günü: <strong>{s.customer.vatDays}</strong>
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ERP Cari
                </Typography>
                {s.erpAccount ? (
                  <>
                    <Typography fontWeight={600}>{s.erpAccount.title}</Typography>
                    <Typography variant="body2">
                      Bakiye: {fmt(String(s.erpAccount.balance))} ₺
                    </Typography>
                    {s.erpAccount.creditLimit != null && (
                      <Typography variant="body2" color="text.secondary">
                        Limit: {fmt(String(s.erpAccount.creditLimit))} ₺
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">Bağlı cari yok</Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}

      {/* Tab 1: Account Movements */}
      {currentTab === 1 && (
        <Stack spacing={2}>
          {/* Date Range Filter */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tarih Filtresi
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                type="date"
                label="Başlangıç"
                size="small"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <TextField
                type="date"
                label="Bitiş"
                size="small"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                disabled={!dateFrom && !dateTo}
              >
                Temizle
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                size="small"
                disabled={exporting}
                onClick={() => void downloadExcel()}
                startIcon={<CalendarIcon />}
              >
                {exporting ? 'İndiriliyor...' : 'Excel İndir (FIFO)'}
              </Button>
            </Stack>
          </Paper>

          {/* Movements Table */}
          {movements.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : movements.isError ? (
            <Alert severity="info">Hareket listesi yüklenemedi.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell align="right">Borç</TableCell>
                    <TableCell align="right">Alacak</TableCell>
                    <TableCell>FIFO Vade</TableCell>
                    <TableCell align="right">Kalan (FIFO)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(movements.data?.data ?? []).map((m) => (
                    <TableRow
                      key={m.id}
                      hover
                      sx={m.fifoIsPastDue ? { bgcolor: 'error.light' } : undefined}
                    >
                      <TableCell>
                        {new Date(m.date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {m.type}
                          {m.fifoIsPastDue && (
                            <Chip label="Gecikme" size="small" color="error" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{fmt(m.debit)}</TableCell>
                      <TableCell align="right">{fmt(m.credit)}</TableCell>
                      <TableCell>
                        {m.fifoDueDate
                          ? new Date(m.fifoDueDate).toLocaleDateString('tr-TR')
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {m.fifoRemainingDebit != null ? fmt(m.fifoRemainingDebit) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Total Count */}
          {movements.data && (
            <Typography variant="caption" color="text.secondary">
              Toplam: {movements.data.meta.total} kayıt
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
