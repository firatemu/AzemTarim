'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Button,
  Box,
  Stack,
  alpha,
  Divider,
} from '@mui/material';
import { Visibility, Receipt, Close, AccountBalance, ErrorOutline } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { StandardPage, StandardCard } from '@/components/common';

type ReadyWorkOrder = {
  id: string;
  workOrderNo: string;
  customerVehicle?: { plaka?: string; aracMarka?: string; aracModel?: string };
  cari?: { unvan?: string; cariKodu?: string };
};

export default function MuhasebeKayitlariPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [readyWorkOrders, setReadyWorkOrders] = useState<ReadyWorkOrder[]>([]);
  const [readyLoading, setReadyLoading] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
    fetchReadyWorkOrders();
  }, []);

  const fetchReadyWorkOrders = async () => {
    try {
      setReadyLoading(true);
      const res = await axios.get('/work-orders', {
        params: { readyForInvoice: true, limit: 50 },
      });
      const data = res.data?.data ?? res.data;
      setReadyWorkOrders(Array.isArray(data) ? data : []);
    } catch {
      setReadyWorkOrders([]);
    } finally {
      setReadyLoading(false);
    }
  };

  const handleFaturaKes = (workOrderId: string) => {
    router.push(`/service/invoices?newInvoice=1&workOrderId=${workOrderId}`);
  };

  const handleIsEmriniKapat = async (workOrderId: string) => {
    try {
      setClosingId(workOrderId);
      await axios.patch(`/work-order/${workOrderId}/status`, { status: 'CLOSED_WITHOUT_INVOICE' });
      fetchReadyWorkOrders();
    } catch {
      // ignore
    } finally {
      setClosingId(null);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/journal-entries', {
        params: { referenceType: 'SERVICE_INVOICE', limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  const getLinesSummary = (lines: any[]) => {
    if (!lines || lines.length === 0) return '-';
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    return `Borç: ${formatCurrency(totalDebit)} / Alacak: ${formatCurrency(totalCredit)}`;
  };

  return (
    <StandardPage>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
          Muhasebe Kayıtları
        </Typography>
        <Typography variant="body2" color="text.secondary">Servis faturalarına ait muhasebe kayıtlarını ve bekleyen işlemleri yönetin.</Typography>
      </Box>

      {readyWorkOrders.length > 0 && (
        <StandardCard sx={{ mb: 4, p: 0, overflow: 'hidden', border: '1px solid', borderColor: 'warning.light' }}>
          <Box sx={{ p: 2.5, bgcolor: alpha('#f59e0b', 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                Faturalanacak İş Emirleri
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Araç hazır durumundaki iş emirlerini faturalandırın veya faturasız kapatın.
              </Typography>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#f59e0b', 0.02) }}>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>İŞ EMRİ NO</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>ARAÇ</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>MÜŞTERİ</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, py: 1.5 }}>İŞLEMLER</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readyLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  readyWorkOrders.map((wo) => (
                    <TableRow key={wo.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{wo.workOrderNo}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {wo.customerVehicle
                            ? `${wo.customerVehicle.plaka ?? ''} - ${wo.customerVehicle.aracMarka ?? ''} ${wo.customerVehicle.aracModel ?? ''}`.trim()
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Receipt fontSize="small" />}
                            onClick={() => handleFaturaKes(wo.id)}
                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                          >
                            Fatura Kes
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Close fontSize="small" />}
                            onClick={() => handleIsEmriniKapat(wo.id)}
                            disabled={closingId === wo.id}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            {closingId === wo.id ? <CircularProgress size={16} color="inherit" /> : 'İş Emrini Kapat'}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </StandardCard>
      )}

      <StandardCard sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#000', 0.02) }}>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>KAYIT NO</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>TARİH</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>REFERANS</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>AÇIKLAMA</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>BORÇ / ALACAK ÖZETİ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, py: 2 }}>İŞLEM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1} alignItems="center">
                      <ErrorOutline sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography color="text.secondary" fontWeight={600}>Muhasebe kaydı bulunamadı</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{entry.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{formatDate(entry.entryDate)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary.main" fontWeight={700}>
                        {entry.serviceInvoice?.invoiceNo ?? `${entry.referenceType} / ${entry.referenceId?.slice(0, 8)}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', fontSize: '13px' }}>
                        {getLinesSummary(entry.lines ?? [])}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/service/accounting-records/${entry.id}`)}
                        sx={{ color: 'primary.main', bgcolor: alpha('#6366f1', 0.05), '&:hover': { bgcolor: alpha('#6366f1', 0.1) } }}
                        title="Detay Görüntüle"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StandardCard>
    </StandardPage>
  );
}
