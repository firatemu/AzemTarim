'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Stack,
  alpha,
  Divider,
} from '@mui/material';
import { Search, Visibility, Add, ArrowBack, Receipt, ReceiptLong, Timer, DirectionsCar, Inventory, Engineering, Build } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import { StandardPage, StandardCard } from '@/components/common';
import type { ServiceInvoice, WorkOrder, WorkOrderItem } from '@/types/servis';

type WorkOrderOption = {
  id: string;
  workOrderNo: string;
  description?: string;
  grandTotal: number;
  customerVehicle?: { plaka?: string; aracMarka?: string; aracModel?: string };
  cari?: { unvan?: string; cariKodu?: string };
};

type ItemPriceEdit = { id: string; unitPrice: number; taxRate: number };

function ServisFaturalariContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [invoiceStep, setInvoiceStep] = useState<1 | 2>(1);
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [itemPrices, setItemPrices] = useState<ItemPriceEdit[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [debouncedSearch]);

  useEffect(() => {
    const woId = searchParams.get('workOrderId');
    const open = searchParams.get('newInvoice');
    if (open === '1' && woId) {
      setNewInvoiceOpen(true);
      setInvoiceStep(1);
      setSelectedWorkOrderId(woId);
      setCreateError(null);
      axios.get('/work-orders', { params: { readyForInvoice: true, limit: 50 } })
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setWorkOrders(Array.isArray(data) ? data : []);
        })
        .catch(() => setWorkOrders([]));
      axios.get(`/work-order/${woId}`)
        .then((res) => {
          const wo = res.data;
          setSelectedWorkOrder(wo);
          setItemPrices((wo.items ?? []).map((i: WorkOrderItem) => ({
            id: i.id,
            unitPrice: Number(i.unitPrice) || 0,
            taxRate: i.taxRate ?? 20,
          })));
          setInvoiceStep(2);
        })
        .catch(() => setCreateError('İş emri yüklenemedi'));
    }
  }, [searchParams]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/service-invoices', {
        params: { search: debouncedSearch || undefined, limit: 100 },
      });
      const data = res.data?.data ?? res.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const openNewInvoiceDialog = async (preselectId?: string) => {
    setNewInvoiceOpen(true);
    setInvoiceStep(1);
    setSelectedWorkOrderId(preselectId ?? null);
    setSelectedWorkOrder(null);
    setItemPrices([]);
    setCreateError(null);
    try {
      const res = await axios.get('/work-orders', {
        params: { readyForInvoice: true, limit: 50 },
      });
      const data = res.data?.data ?? res.data;
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch {
      setWorkOrders([]);
    }
  };

  const handleSelectWorkOrder = async (woId: string) => {
    setSelectedWorkOrderId(woId);
    setCreateError(null);
    try {
      const res = await axios.get(`/work-order/${woId}`);
      const wo = res.data;
      setSelectedWorkOrder(wo);
      setItemPrices((wo.items ?? []).map((i: WorkOrderItem) => ({
        id: i.id,
        unitPrice: Number(i.unitPrice) || 0,
        taxRate: i.taxRate ?? 20,
      })));
      setInvoiceStep(2);
    } catch {
      setCreateError('İş emri yüklenemedi');
    }
  };

  const updateItemPrice = (itemId: string, field: 'unitPrice' | 'taxRate', value: number) => {
    setItemPrices((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, [field]: value } : p))
    );
  };

  const handleCreateInvoice = async () => {
    if (!selectedWorkOrderId || !selectedWorkOrder) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      for (const p of itemPrices) {
        await axios.patch(`/work-order-item/${p.id}`, {
          unitPrice: p.unitPrice,
          taxRate: p.taxRate,
        });
      }
      const res = await axios.post(`/service-invoice/from-work-order/${selectedWorkOrderId}`);
      const invoice = res.data?.data ?? res.data;
      const id = typeof invoice === 'object' ? invoice?.id : invoice;
      setNewInvoiceOpen(false);
      setInvoiceStep(1);
      setSelectedWorkOrder(null);
      setItemPrices([]);
      fetchInvoices();
      if (id) router.push(`/service/invoices/${id}`);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? 'Fatura oluşturulamadı');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  return (
    <StandardPage>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptLong sx={{ fontSize: 32, color: 'primary.main' }} />
            Servis Faturaları
          </Typography>
          <Typography variant="body2" color="text.secondary">Tüm servis operasyonlarına ait faturaları görüntüleyin ve yönetin.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openNewInvoiceDialog()}
          sx={{ px: 3, py: 1, fontWeight: 700, borderRadius: 2 }}
        >
          Yeni Fatura
        </Button>
      </Box>

      <StandardCard sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5) }}>
          <TextField
            size="small"
            placeholder="Fatura no veya iş emri no ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 400 } }}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'background.paper' }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>FATURA NO</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>İŞ EMRİ NO</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>ARAÇ / MÜŞTERİ</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }}>TARİH</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 2 }} align="right">TOPLAM</TableCell>
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
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Stack spacing={1} alignItems="center">
                      <Receipt sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography color="text.secondary" fontWeight={600}>Kayıt bulunamadı</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{inv.invoiceNo}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{(inv as any).workOrder?.workOrderNo ?? '-'}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={700}>
                          {(inv as any).workOrder?.customerVehicle
                            ? `${(inv as any).workOrder.customerVehicle.plaka}`
                            : '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {inv.cari?.unvan ?? inv.cari?.cariKodu ?? '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDate(inv.issueDate)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(inv.grandTotal)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/service/invoices/${inv.id}`)}
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

      <Dialog
        open={newInvoiceOpen}
        onClose={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }}
        maxWidth={invoiceStep === 2 ? 'md' : 'sm'}
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, p: 3, pb: 2 }}>
          {invoiceStep === 1 ? 'Yeni Fatura Oluştur' : 'Kalem Fiyatlarını Girin'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 4 }}>
          <Stepper activeStep={invoiceStep - 1} sx={{ mb: 4 }} alternativeLabel>
            <Step><StepLabel>İş Emri Seçimi</StepLabel></Step>
            <Step><StepLabel>Fiyatlandırma</StepLabel></Step>
          </Stepper>

          {createError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          )}

          {invoiceStep === 1 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
                Faturalanacak iş emrini seçin. Listede sadece <Typography component="span" fontWeight={800} color="success.main">"Araç Hazır"</Typography> durumundaki iş emirleri gösterilmektedir.
              </Typography>
              <List sx={{ maxHeight: 350, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {workOrders.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <DirectionsCar sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Faturalanabilir iş emri bulunamadı</Typography>
                  </Box>
                ) : (
                  workOrders.map((wo) => (
                    <ListItemButton
                      key={wo.id}
                      selected={selectedWorkOrderId === wo.id}
                      onClick={() => handleSelectWorkOrder(wo.id)}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 },
                        '&.Mui-selected': { bgcolor: alpha('#6366f1', 0.08) }
                      }}
                    >
                      <Stack spacing={0.5} sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight={800} color="primary.main">{wo.workOrderNo}</Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ bgcolor: alpha('#6366f1', 0.1), px: 1, py: 0.5, borderRadius: 1 }}>
                            {wo.customerVehicle?.plaka ?? '-'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}</Typography>
                      </Stack>
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          )}

          {invoiceStep === 2 && selectedWorkOrder && (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha('#6366f1', 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>İŞ EMRİ</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedWorkOrder.workOrderNo}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>PLAKA</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedWorkOrder.customerVehicle?.plaka ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MÜŞTERİ</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedWorkOrder.cari?.unvan ?? selectedWorkOrder.cari?.cariKodu ?? '-'}</Typography>
                  </Box>
                </Stack>
              </Box>

              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha('#000', 0.02) }}>
                      <TableCell sx={{ fontWeight: 800 }}>TİP</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>AÇIKLAMA / STOK</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">MİKTAR</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">BİRİM FİYAT</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">KDV %</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="right">TOPLAM</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedWorkOrder.items ?? []).map((item) => {
                      const priceEdit = itemPrices.find((p) => p.id === item.id);
                      const unitPrice = priceEdit?.unitPrice ?? Number(item.unitPrice) ?? 0;
                      const taxRate = priceEdit?.taxRate ?? item.taxRate ?? 20;
                      const total = item.quantity * unitPrice * (1 + taxRate / 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.type === 'LABOR' ? <Engineering sx={{ fontSize: 16, color: 'info.main' }} /> : <Inventory sx={{ fontSize: 16, color: 'warning.main' }} />}
                              <Typography variant="caption" fontWeight={700}>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{item.description}</Typography>
                            {item.stok && (
                              <Typography variant="caption" color="text.secondary">{item.stok.stokKodu}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{item.quantity}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={unitPrice}
                              onChange={(e) => updateItemPrice(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, step: 0.01, sx: { textAlign: 'right', fontWeight: 700 } }}
                              sx={{ width: 110 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={taxRate}
                              onChange={(e) => updateItemPrice(item.id, 'taxRate', parseInt(e.target.value, 10) || 20)}
                              inputProps={{ min: 0, max: 100, sx: { textAlign: 'center', fontWeight: 700 } }}
                              sx={{ width: 60 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, px: 4 }}>
          {invoiceStep === 2 ? (
            <>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => { setInvoiceStep(1); setSelectedWorkOrder(null); setItemPrices([]); }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Geri Dön
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                onClick={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateInvoice}
                disabled={createLoading || (selectedWorkOrder?.items ?? []).length === 0}
                startIcon={createLoading ? <CircularProgress size={18} color="inherit" /> : <Build />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
              >
                {createLoading ? 'Fatura Kesiliyor...' : 'Kes ve Tamamla'}
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ flex: 1 }} />
              <Button
                onClick={() => { setNewInvoiceOpen(false); setInvoiceStep(1); }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
              >
                İptal
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </StandardPage>
  );
}

export default function ServisFaturalariPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={32} />
        </Box>
      }
    >
      <ServisFaturalariContent />
    </Suspense>
  );
}
