'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Stack,
  Tooltip,
  Grid,
} from '@mui/material';
import { Add, Search, Visibility, Download, FilterList } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import { useDebounce } from '@/hooks/useDebounce';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';
import WorkOrderStatusChip from '@/components/servis/WorkOrderStatusChip';
import PartWorkflowStatusChip from '@/components/servis/PartWorkflowStatusChip';
import { useAuthStore } from '@/stores/authStore';
import { StandardPage, StandardCard } from '@/components/common';
import type { WorkOrder, WorkOrderStatus, PartWorkflowStatus } from '@/types/servis';
import { useTabStore } from '@/stores/tabStore';

const STATUS_OPTIONS: { value: '' | WorkOrderStatus; label: string }[] = [
  { value: '', label: 'Tümü' },
  { value: 'WAITING_DIAGNOSIS', label: 'Beklemede' },
  { value: 'PENDING_APPROVAL', label: 'Müşteri Onayı Bekliyor' },
  { value: 'APPROVED_IN_PROGRESS', label: 'Yapım Aşamasında' },
  { value: 'PART_WAITING', label: 'Parça Bekliyor' },
  { value: 'PARTS_SUPPLIED', label: 'Parçalar Tedarik Edildi' },
  { value: 'VEHICLE_READY', label: 'Araç Hazır' },
  { value: 'INVOICED_CLOSED', label: 'Fatura Oluşturuldu' },
  { value: 'CLOSED_WITHOUT_INVOICE', label: 'Faturasız Kapandı' },
  { value: 'CANCELLED', label: 'İptal' },
];

export default function IsEmirleriPage() {
  const router = useRouter();
  const { addTab } = useTabStore();
  const { user } = useAuthStore();
  const isTechnician = user?.role === 'TECHNICIAN';

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | WorkOrderStatus>('');
  const [cariId, setCariId] = useState('');
  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [cariler, setCariler] = useState<{ id: string; cariKodu?: string; unvan?: string }[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    addTab({ id: 'service-work-orders', label: 'İş Emirleri', path: '/service/work-orders' });
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [debouncedSearch, statusFilter, cariId, createdAtFrom, createdAtTo, paginationModel]);

  useEffect(() => {
    const fetchCariler = async () => {
      try {
        const res = await axios.get('/account', { params: { limit: 500 } });
        const d = res.data?.data ?? res.data;
        setCariler(Array.isArray(d) ? d : []);
      } catch {
        setCariler([]);
      }
    };
    fetchCariler();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/work-orders', {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          cariId: cariId || undefined,
          createdAtFrom: createdAtFrom || undefined,
          createdAtTo: createdAtTo || undefined,
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        },
      });
      const data = res.data?.data ?? res.data;
      setWorkOrders(Array.isArray(data) ? data : []);
      setRowCount(res.data?.meta?.total || (Array.isArray(data) ? data.length : 0));
    } catch {
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.get('/work-orders', {
        params: {
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          cariId: cariId || undefined,
          createdAtFrom: createdAtFrom || undefined,
          createdAtTo: createdAtTo || undefined,
          limit: 5000,
        },
      });
      const list = res.data?.data ?? res.data;
      const rows = Array.isArray(list) ? list : [];
      const PART_LABELS: Record<string, string> = {
        NOT_STARTED: 'Henüz başlamadı',
        PARTS_SUPPLIED_DIRECT: 'Parçalar temin edildi',
        PARTS_PENDING: 'Parça bekleniyor',
        PARTIALLY_SUPPLIED: 'Kısmi tedarik edildi',
        ALL_PARTS_SUPPLIED: 'Tüm parçalar tedarik edildi',
      };
      const partStatusLabel = (wo: WorkOrder) => {
        const s = wo.partWorkflowStatus ?? (wo.status === 'PART_WAITING' ? 'PARTS_PENDING' : wo.status === 'PARTS_SUPPLIED' ? 'ALL_PARTS_SUPPLIED' : 'NOT_STARTED');
        return PART_LABELS[s] ?? s;
      };
      const cols = ['İş Emri No', 'Araç', 'Müşteri', 'Teknisyen', 'Servis durumu', 'Parça Durumu', 'Tarih'];
      const data = [
        cols,
        ...rows.map((wo: WorkOrder) => [
          wo.workOrderNo,
          wo.customerVehicle ? `${wo.customerVehicle.plaka} - ${wo.customerVehicle.aracMarka} ${wo.customerVehicle.aracModel}` : '-',
          wo.cari?.unvan ?? wo.cari?.cariKodu ?? '-',
          wo.technician?.fullName ?? '-',
          wo.status,
          partStatusLabel(wo),
          new Date(wo.createdAt).toLocaleDateString('tr-TR'),
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'İş Emirleri');
      XLSX.writeFile(wb, `is-emirleri_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      // ignore
    }
  };

  const columns: GridColDef[] = [
    { field: 'workOrderNo', headerName: 'İş Emri No', width: 130, renderCell: (p: any) => <Typography fontWeight="600">{p.value}</Typography> },
    {
      field: 'vehicle', headerName: 'Araç', width: 220, renderCell: (p: any) => {
        const v = p.row.customerVehicle;
        return v ? `${v.plaka} - ${v.aracMarka} ${v.aracModel}` : '-';
      }
    },
    { field: 'customer', headerName: 'Müşteri', flex: 1, minWidth: 200, renderCell: (p: any) => p.row.cari?.unvan || p.row.cari?.cariKodu || '-' },
    { field: 'technician', headerName: 'Teknisyen', width: 180, renderCell: (p: any) => p.row.technician?.fullName || '-' },
    { field: 'status', headerName: 'Durum', width: 180, renderCell: (p: any) => <WorkOrderStatusChip status={p.value} /> },
    {
      field: 'partStatus', headerName: 'Parça Durumu', width: 180, renderCell: (p: any) => {
        const s = p.row.partWorkflowStatus ?? (p.row.status === 'PART_WAITING' ? 'PARTS_PENDING' : p.row.status === 'PARTS_SUPPLIED' ? 'ALL_PARTS_SUPPLIED' : 'NOT_STARTED');
        return <PartWorkflowStatusChip status={s} />
      }
    },
    { field: 'createdAt', headerName: 'Tarih', width: 120, renderCell: (p: any) => new Date(p.value).toLocaleDateString('tr-TR') },
    {
      field: 'actions',
      headerName: 'İşlem',
      width: 80,
      sortable: false,
      align: 'right',
      renderCell: (params: any) => (
        <Tooltip title="Detay">
          <IconButton
            size="small"
            onClick={() => router.push(`/service/work-orders/${params.row.id}`)}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <StandardPage>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>İş Emirleri</Typography>
          <Typography variant="body2" color="text.secondary">Servis iş emirlerini oluşturun ve takip edin</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel} sx={{ borderRadius: 2 }}>Excel</Button>
          {!isTechnician && (
            <Button variant="contained" startIcon={<Add />} onClick={() => router.push('/service/work-orders/yeni')} sx={{ borderRadius: 2, px: 3 }}>Yeni İş Emri</Button>
          )}
        </Stack>
      </Box>

      <StandardCard sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ara..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select value={statusFilter} label="Durum" onChange={(e: any) => setStatusFilter(e.target.value as any)}>
                {STATUS_OPTIONS.map(o => <MenuItem key={o.value || 'all'} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              size="small"
              options={cariler}
              getOptionLabel={(c: any) => `${c.cariKodu || ''} - ${c.unvan || c.id}`.trim()}
              value={cariler.find((c: any) => c.id === cariId) || null}
              onChange={(_: any, v: any) => setCariId(v?.id || '')}
              renderInput={(p: any) => <TextField {...p} label="Müşteri" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="date" label="Başlangıç" value={createdAtFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatedAtFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="date" label="Bitiş" value={createdAtTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatedAtTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
      </StandardCard>

      <StandardCard padding={0}>
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={workOrders}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid var(--border)',
              },
            }}
          />
        </Box>
      </StandardCard>
    </StandardPage>
  );
}
