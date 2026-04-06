'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
  Collapse,
  IconButton,
  Chip,
  InputAdornment,
  Stack,
  alpha,
  Divider,
  Paper,
} from '@mui/material';
import {
  Inventory2,
  LocalShipping,
  Visibility,
  Add,
  ExpandMore,
  ExpandLess,
  Search,
  Assignment,
  Build,
  Message,
  DirectionsCar,
  Timer,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import { StandardPage, StandardCard } from '@/components/common';
import PartRequestStatusChip from '@/components/servis/PartRequestStatusChip';
import SupplyPartRequestDialog from '@/components/servis/SupplyPartRequestDialog';
import AddPartDirectDialog from '@/components/servis/AddPartDirectDialog';
import type {
  WorkOrder,
  PartRequest,
  PartWorkflowStatus,
  VehicleWorkflowStatus,
  CreateWorkOrderItemDto,
} from '@/types/servis';

const PART_WORKFLOW_LABELS: Record<PartWorkflowStatus, string> = {
  NOT_STARTED: 'Henüz başlamadı',
  PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
  PARTS_PENDING: 'Parça bekleniyor',
  PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
  ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
};

const VEHICLE_WORKFLOW_LABELS: Record<VehicleWorkflowStatus, string> = {
  WAITING: 'Bekleme',
  IN_PROGRESS: 'Yapım aşamasında',
  READY: 'Hazır',
  DELIVERED: 'Teslim edildi',
};

export default function ParcaTedarikYonetimiPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [partWorkflowFilter, setPartWorkflowFilter] = useState<'' | PartWorkflowStatus>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openSupplyDialog, setOpenSupplyDialog] = useState(false);
  const [supplyPartRequest, setSupplyPartRequest] = useState<PartRequest | null>(null);
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [addPartWorkOrder, setAddPartWorkOrder] = useState<WorkOrder | null>(null);
  const [stoklar, setStoklar] = useState<{ id: string; stokKodu?: string; stokAdi?: string }[]>([]);
  const [detailLoadedIds, setDetailLoadedIds] = useState<Set<string>>(new Set());
  const [responseNotesByWo, setResponseNotesByWo] = useState<Record<string, string>>({});
  const [responseSubmittingId, setResponseSubmittingId] = useState<string | null>(null);

  const fetchWorkOrderDetail = async (id: string) => {
    if (detailLoadedIds.has(id)) return;
    try {
      const res = await axios.get(`/work-order/${id}`);
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === id
            ? {
              ...wo,
              ...res.data,
              items: res.data.items ?? wo.items,
              partRequests: res.data.partRequests ?? wo.partRequests,
              vehicleWorkflowStatus: res.data.vehicleWorkflowStatus ?? wo.vehicleWorkflowStatus,
              partWorkflowStatus: res.data.partWorkflowStatus ?? wo.partWorkflowStatus,
            }
            : wo
        )
      );
      setDetailLoadedIds((prev) => new Set(prev).add(id));
    } catch {
      // ignore
    }
  };

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setDetailLoadedIds(new Set());
      try {
        const res = await axios.get('/work-orders/for-parts-management', {
          params: {
            page,
            limit,
            search: debouncedSearch || undefined,
            partWorkflowStatus: partWorkflowFilter || undefined,
          },
        });
        const list = res.data?.data ?? res.data;
        // Ensure vehicleWorkflowStatus is included in each work order
        const workOrdersWithStatus = Array.isArray(list)
          ? list.map((wo: any) => ({
            ...wo,
            vehicleWorkflowStatus: wo.vehicleWorkflowStatus ?? 'WAITING',
            partWorkflowStatus: wo.partWorkflowStatus ?? 'NOT_STARTED',
          }))
          : [];
        setWorkOrders(workOrdersWithStatus);
        setTotal(res.data?.total ?? workOrdersWithStatus.length ?? 0);
      } catch (err: any) {
        // Fallback: if endpoint doesn't exist (404), use regular endpoint and filter client-side
        // This is expected if backend hasn't been restarted with the new endpoint
        if (err.response?.status === 404) {
          // Silently handle 404 - fallback will be used
          try {
            const res = await axios.get('/work-orders', {
              params: {
                page: 1,
                limit: 500,
                search: debouncedSearch || undefined,
              },
            });
            const list = res.data?.data ?? res.data;
            const fullList = Array.isArray(list) ? list : [];
            const incomplete = fullList.filter(
              (wo: WorkOrder) =>
                wo.status !== 'CANCELLED' &&
                wo.status !== 'INVOICED_CLOSED' &&
                wo.status !== 'CLOSED_WITHOUT_INVOICE' &&
                (wo as any).vehicleWorkflowStatus !== 'DELIVERED'
            );
            const filtered =
              partWorkflowFilter && partWorkflowFilter.length > 0
                ? incomplete.filter((wo: WorkOrder) => (wo as any).partWorkflowStatus === partWorkflowFilter)
                : incomplete;
            // Ensure vehicleWorkflowStatus is included
            const paged = filtered
              .slice((page - 1) * limit, page * limit)
              .map((wo: any) => ({
                ...wo,
                vehicleWorkflowStatus: wo.vehicleWorkflowStatus ?? 'WAITING',
                partWorkflowStatus: wo.partWorkflowStatus ?? 'NOT_STARTED',
              }));
            setWorkOrders(paged);
            setTotal(filtered.length);
          } catch (fallbackErr: any) {
            // If fallback also fails, show empty list
            console.warn('Failed to fetch work orders:', fallbackErr.message);
            setWorkOrders([]);
            setTotal(0);
          }
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Error fetching work orders:', err.message);
      setWorkOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page, partWorkflowFilter, debouncedSearch]);

  useEffect(() => {
    expandedIds.forEach((id) => fetchWorkOrderDetail(id));
  }, [expandedIds]);

  useEffect(() => {
    const fetchStok = async () => {
      try {
        const res = await axios.get('/products', { params: { limit: 1000 } });
        const d = res.data?.data ?? res.data;
        setStoklar(Array.isArray(d) ? d : []);
      } catch {
        setStoklar([]);
      }
    };
    fetchStok();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSupplySubmit = async (suppliedQty: number, stokId: string) => {
    if (!supplyPartRequest) return;
    try {
      await axios.post(`/part-request/${supplyPartRequest.id}/supply`, { suppliedQty, stokId });
      showSnackbar('Parça tedarik edildi', 'success');
      setOpenSupplyDialog(false);
      setSupplyPartRequest(null);
      fetchWorkOrders();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Tedarik başarısız', 'error');
    }
  };

  const handleAddPartSubmit = async (data: CreateWorkOrderItemDto) => {
    try {
      await axios.post('/work-orders-item', data);
      showSnackbar('Parça eklendi', 'success');
      setOpenAddPartDialog(false);
      setAddPartWorkOrder(null);
      fetchWorkOrders();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Parça eklenemedi', 'error');
      throw err;
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const partItems = (wo: WorkOrder) => wo.items?.filter((i) => i.type === 'PART') ?? [];
  const pendingRequests = (wo: WorkOrder) =>
    wo.partRequests?.filter((pr) => pr.status === 'REQUESTED') ?? [];

  const handleSendResponse = async (woId: string) => {
    const text = (responseNotesByWo[woId] ?? '').trim();
    if (!text) {
      setSnackbar({ open: true, message: 'Yanıt metni girin', severity: 'error' });
      return;
    }
    setResponseSubmittingId(woId);
    try {
      await axios.patch(`/work-order/${woId}`, { supplyResponseNotes: text });
      setSnackbar({ open: true, message: 'Yanıt gönderildi', severity: 'success' });
      setResponseNotesByWo((prev) => {
        const next = { ...prev };
        delete next[woId];
        return next;
      });
      setDetailLoadedIds((prev) => {
        const next = new Set(prev);
        next.delete(woId);
        return next;
      });
      const res = await axios.get(`/work-order/${woId}`);
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.id === woId ? { ...wo, ...res.data, supplyResponseNotes: res.data.supplyResponseNotes } : wo
        )
      );
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Yanıt gönderilemedi', severity: 'error' });
    } finally {
      setResponseSubmittingId(null);
    }
  };

  return (
    <StandardPage>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Inventory2 sx={{ fontSize: 32, color: 'primary.main' }} />
          Parça Tedarik ve Yönetimi
        </Typography>
        <Typography variant="body2" color="text.secondary">Tamamlanmamış iş emirlerine parça ekleyin ve teknisyen taleplerini karşılayın.</Typography>
      </Box>

      <StandardCard sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            id="parts-supply-search"
            size="small"
            placeholder="İş emri no, plaka veya açıklama ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 350 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="part-workflow-filter-label">Parça Durumu</InputLabel>
            <Select
              labelId="part-workflow-filter-label"
              id="part-workflow-filter-select"
              value={partWorkflowFilter}
              label="Parça Durumu"
              onChange={(e) => {
                setPartWorkflowFilter(e.target.value as '' | PartWorkflowStatus);
                setPage(1);
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Tümü</MenuItem>
              {Object.entries(PART_WORKFLOW_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </StandardCard>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : workOrders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <Inventory2 sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tamamlanmamış iş emri bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Parça yönetimi yapılacak açık iş emri bulunmuyor
          </Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={3}>
            {workOrders.map((wo) => {
              const expanded = expandedIds.has(wo.id);
              const partItemsList = partItems(wo);
              const partRequestsList = wo.partRequests ?? [];
              const pendingList = pendingRequests(wo);

              return (
                <StandardCard
                  key={wo.id}
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: expanded ? 'primary.light' : 'divider',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)' }
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: expanded ? alpha('#6366f1', 0.02) : 'transparent' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Visibility />}
                        onClick={() => router.push(`/service/work-orders/${wo.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 800, color: 'primary.main', fontSize: '0.925rem' }}
                      >
                        {wo.workOrderNo}
                      </Button>
                      <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {wo.customerVehicle
                            ? `${wo.customerVehicle.plaka} - ${wo.customerVehicle.aracMarka} ${wo.customerVehicle.aracModel}`
                            : '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }} noWrap>
                          {wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                        <Chip
                          size="small"
                          icon={<DirectionsCar sx={{ fontSize: '14px !important' }} />}
                          label={VEHICLE_WORKFLOW_LABELS[(wo as any).vehicleWorkflowStatus as VehicleWorkflowStatus ?? 'WAITING']}
                          color={
                            (wo as any).vehicleWorkflowStatus === 'IN_PROGRESS'
                              ? 'info'
                              : (wo as any).vehicleWorkflowStatus === 'READY'
                                ? 'success'
                                : 'default'
                          }
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, height: 24 }}
                        />
                        <Chip
                          size="small"
                          icon={<Inventory2 sx={{ fontSize: '14px !important' }} />}
                          label={PART_WORKFLOW_LABELS[wo.partWorkflowStatus ?? 'NOT_STARTED']}
                          color={
                            pendingList.length > 0 ||
                              wo.partWorkflowStatus === 'PARTS_PENDING' ||
                              wo.partWorkflowStatus === 'PARTIALLY_SUPPLIED'
                              ? 'warning'
                              : wo.partWorkflowStatus === 'ALL_PARTS_SUPPLIED' || wo.partWorkflowStatus === 'PARTS_SUPPLIED_DIRECT'
                                ? 'success'
                                : 'default'
                          }
                          sx={{ fontWeight: 700, borderRadius: 1.5, height: 24 }}
                        />
                        {pendingList.length > 0 && (
                          <Chip
                            size="small"
                            icon={<Timer sx={{ fontSize: '14px !important' }} />}
                            label={`${pendingList.length} TALEP`}
                            color="warning"
                            variant="contained"
                            sx={{ fontWeight: 800, borderRadius: 1.5, height: 24 }}
                          />
                        )}
                      </Stack>
                    </Stack>
                    <IconButton onClick={() => toggleExpand(wo.id)} size="small" sx={{ ml: 2, bgcolor: alpha('#000', 0.02) }}>
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>

                  <Collapse in={expanded}>
                    <Box sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Stack spacing={4}>
                        {/* Teknisyen Yazışması */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 800, color: 'text.secondary' }}>
                            <Message fontSize="small" /> TEKNİSYEN & TEDARİK YAZIŞMASI
                          </Typography>

                          {(wo.diagnosisNotes || wo.supplyResponseNotes) ? (
                            <Stack spacing={2} sx={{ mb: 3 }}>
                              {wo.diagnosisNotes && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                  <Box sx={{
                                    p: 2,
                                    bgcolor: alpha('#6366f1', 0.05),
                                    borderRadius: '16px 16px 16px 4px',
                                    border: '1px solid',
                                    borderColor: alpha('#6366f1', 0.1),
                                    maxWidth: '85%'
                                  }}>
                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, display: 'block', mb: 0.5 }}>TEKNİSYEN İSTEĞİ</Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{wo.diagnosisNotes}</Typography>
                                  </Box>
                                </Box>
                              )}
                              {wo.supplyResponseNotes && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <Box sx={{
                                    p: 2,
                                    bgcolor: alpha('#10b981', 0.05),
                                    borderRadius: '16px 16px 4px 16px',
                                    border: '1px solid',
                                    borderColor: alpha('#10b981', 0.1),
                                    maxWidth: '85%'
                                  }}>
                                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800, display: 'block', mb: 0.5 }}>TEDARİK YANITI</Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{wo.supplyResponseNotes}</Typography>
                                  </Box>
                                </Box>
                              )}
                            </Stack>
                          ) : (
                            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                              Henüz bir yazışma kaydı bulunmuyor.
                            </Alert>
                          )}

                          <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#eff6ff', 0.5), borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>TEKNİSYENE YANIT YAZIN</Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              placeholder="Parça durumu, tahmini süre veya diğer açıklamaları yazın..."
                              value={responseNotesByWo[wo.id] ?? ''}
                              onChange={(e) => setResponseNotesByWo((prev) => ({ ...prev, [wo.id]: e.target.value }))}
                              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              disabled={responseSubmittingId === wo.id}
                              onClick={() => handleSendResponse(wo.id)}
                              startIcon={responseSubmittingId === wo.id ? <CircularProgress size={16} /> : <Message />}
                              sx={{ fontWeight: 700, borderRadius: 1.5, px: 3 }}
                            >
                              {responseSubmittingId === wo.id ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                            </Button>
                          </Box>
                        </Box>

                        {/* Eklenen Parçalar */}
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: 'text.secondary' }}>
                              <Assignment fontSize="small" /> İŞ EMRİNE EKLENEN PARÇALAR
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Add />}
                              variant="outlined"
                              onClick={() => {
                                setAddPartWorkOrder(wo);
                                setOpenAddPartDialog(true);
                              }}
                              sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
                            >
                              Stoktan Parça Ekle
                            </Button>
                          </Box>
                          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: alpha('#000', 0.02) }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>AÇIKLAMA</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>STOK</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }} align="right">MİKTAR</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {partItemsList.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                                      Henüz parça eklenmedi
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  partItemsList.map((item) => (
                                    <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                                          {item.stok ? `${item.stok.stokKodu}` : '-'}
                                        </Typography>
                                        {item.stok?.stokAdi && (
                                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{item.stok.stokAdi}</Typography>
                                        )}
                                      </TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 800 }}>{item.quantity}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>

                        {/* Parça Talepleri */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 800, color: 'text.secondary' }}>
                            <LocalShipping fontSize="small" /> TEKNİSYEN PARÇA TALEPLERİ
                          </Typography>
                          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: alpha('#000', 0.02) }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>AÇIKLAMA</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>STOK ADAYI</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }} align="right">MİKTAR</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>TALEP EDEN</TableCell>
                                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>DURUM</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 800, py: 1.5 }}>İŞLEM</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {partRequestsList.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                                      Parça talebi bulunmuyor
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  partRequestsList.map((pr) => (
                                    <TableRow key={pr.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                      <TableCell sx={{ fontWeight: 600 }}>{pr.description}</TableCell>
                                      <TableCell>
                                        {pr.stok ? (
                                          <Typography variant="body2" color="primary.main" fontWeight={700}>
                                            {pr.stok.stokKodu}
                                          </Typography>
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">Stok seçilmedi</Typography>
                                        )}
                                      </TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 800 }}>{pr.requestedQty}</TableCell>
                                      <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{pr.requestedByUser?.fullName ?? '-'}</Typography>
                                      </TableCell>
                                      <TableCell>
                                        <PartRequestStatusChip status={pr.status} />
                                      </TableCell>
                                      <TableCell align="right">
                                        {pr.status === 'REQUESTED' && (
                                          <Button
                                            size="small"
                                            variant="contained"
                                            color="warning"
                                            startIcon={<LocalShipping />}
                                            onClick={() => {
                                              setSupplyPartRequest(pr);
                                              setOpenSupplyDialog(true);
                                            }}
                                            sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
                                          >
                                            Tedarik Et
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>
                </StandardCard>
              );
            })}
          </Stack>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p: number) => setPage(p)}
                color="primary"
                size="large"
                sx={{ '& .MuiPaginationItem-root': { fontWeight: 700 } }}
              />
            </Box>
          )}
        </>
      )}

      <SupplyPartRequestDialog
        open={openSupplyDialog}
        onClose={() => {
          setOpenSupplyDialog(false);
          setSupplyPartRequest(null);
        }}
        onSubmit={handleSupplySubmit}
        partRequest={supplyPartRequest}
        stoklar={stoklar}
      />

      <AddPartDirectDialog
        open={openAddPartDialog}
        onClose={() => {
          setOpenAddPartDialog(false);
          setAddPartWorkOrder(null);
        }}
        onSubmit={handleAddPartSubmit}
        workOrderId={addPartWorkOrder?.id ?? ''}
        workOrderNo={addPartWorkOrder?.workOrderNo}
        stoklar={stoklar}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p: any) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p: any) => ({ ...p, open: false }))}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
