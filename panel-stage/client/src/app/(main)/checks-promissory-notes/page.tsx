'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Paper,
    Autocomplete,
    Stack,
    Popover,
} from '@mui/material';
import { TURKISH_BANKS } from '@/constants/bankalar';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Visibility,
    Payment,
    Edit,
    Delete,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    History as HistoryIcon,
    InfoOutlined as InfoIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/Layout/MainLayout';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CekSenetPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [rows, setRows] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Tahsilat Dialog State
    const [openTahsilat, setOpenTahsilat] = useState(false);
    const [selectedCek, setSelectedCek] = useState<any>(null);
    const [tahsilatForm, setTahsilatForm] = useState({
        tarih: new Date().toISOString().split('T')[0],
        tutar: 0,
        hedef: 'KASA' as 'KASA' | 'BANKA',
        kasaId: '',
        bankaHesapId: '',
        aciklama: '',
    });

    // Düzenleme Dialog State
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        evrakNo: '',
        vadeTarihi: '',
        banka: '',
        sube: '',
        hesapNo: '',
        aciklama: '',
        tutar: '',
    });
    const [editSaving, setEditSaving] = useState(false);

    // Silme onay
    const [openDelete, setOpenDelete] = useState(false);
    const [cekToDelete, setCekToDelete] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Seçenekler
    const [kasalar, setKasalar] = useState<any[]>([]);
    const [bankalar, setBankalar] = useState<any[]>([]);

    // Audit Popover State
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [auditInfo, setAuditInfo] = useState<any>(null);

    const handleAuditOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
        setAnchorEl(event.currentTarget);
        setAuditInfo(row);
    };

    const handleAuditClose = () => {
        setAnchorEl(null);
        setAuditInfo(null);
    };

    const openAudit = Boolean(anchorEl);

    const fetchCekSenet = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/checks-promissory-notes');
            const data = response.data?.data ?? response.data;
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Çek/Senet yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFinansData = async () => {
        try {
            const [kasaRes, bankaRes] = await Promise.all([
                axios.get('/cashbox?isRetail=false'),
                axios.get('/bank-accounts?type=DEMAND_DEPOSIT')
            ]);
            setKasalar(kasaRes.data?.data || kasaRes.data);
            setBankalar(bankaRes.data?.data || bankaRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCekSenet();
        fetchFinansData();
    }, []);

    // KPI Calculation
    const stats = React.useMemo(() => {
        const total = rows.reduce((acc, row) => acc + Number(row.amount || 0), 0);
        const pending = rows.filter(r => r.status === 'IN_PORTFOLIO' || r.status === 'PARTIAL_PAID')
            .reduce((acc, row) => acc + Number(row.remainingAmount || 0), 0);
        const collected = rows.filter(r => r.status === 'COLLECTED' || r.status === 'PAID')
            .reduce((acc, row) => acc + (Number(row.amount || 0) - Number(row.remainingAmount || 0)), 0);
        const problematic = rows.filter(r => ['WITHOUT_COVERAGE', 'UNPAID'].includes(r.status))
            .reduce((acc, row) => acc + Number(row.remainingAmount || 0), 0);

        return { total, pending, collected, problematic };
    }, [rows]);

    const handleOpenTahsilat = (cek: any) => {
        setSelectedCek(cek);
        setTahsilatForm({
            tarih: new Date().toISOString().split('T')[0],
            tutar: Number(cek.remainingAmount),
            hedef: 'KASA',
            kasaId: '',
            bankaHesapId: '',
            aciklama: `${cek.checkNo || cek.serialNo || 'Çek/Senet'} Tahsilatı`,
        });
        setOpenTahsilat(true);
    };

    const handleOpenEdit = (row: any) => {
        const vade = row.dueDate;
        setSelectedEdit(row);
        setEditForm({
            evrakNo: row.checkNo ?? row.serialNo ?? '',
            vadeTarihi: vade ? new Date(vade).toISOString().split('T')[0] : '',
            banka: row.bank ?? '',
            sube: row.branch ?? '',
            hesapNo: row.accountNo ?? '',
            aciklama: row.notes ?? '',
            tutar: row.amount !== undefined ? String(row.amount) : '',
        });
        setOpenEdit(true);
    };

    const handleEditSave = async () => {
        if (!selectedEdit?.id) return;
        setEditSaving(true);
        try {
            await axios.put(`/checks-promissory-notes/${selectedEdit.id}`, {
                checkNo: editForm.evrakNo || undefined,
                dueDate: editForm.vadeTarihi || undefined,
                bank: editForm.banka || undefined,
                branch: editForm.sube || undefined,
                accountNo: editForm.hesapNo || undefined,
                notes: editForm.aciklama || undefined,
                amount: editForm.tutar ? Number(editForm.tutar) : undefined,
            });
            enqueueSnackbar('Evrak güncellendi', { variant: 'success' });
            setOpenEdit(false);
            fetchCekSenet();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Güncelleme hatası', { variant: 'error' });
        } finally {
            setEditSaving(false);
        }
    };

    const handleOpenDelete = (row: any) => {
        setCekToDelete(row);
        setOpenDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!cekToDelete?.id) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`/checks-promissory-notes/${cekToDelete.id}`);
            enqueueSnackbar('Evrak silindi', { variant: 'success' });
            setOpenDelete(false);
            setCekToDelete(null);
            fetchCekSenet();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Silme hatası', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleTahsilatYap = async () => {
        if (tahsilatForm.tutar <= 0) return;
        if (tahsilatForm.hedef === 'KASA' && !tahsilatForm.kasaId) {
            enqueueSnackbar('Lütfen kasa seçiniz', { variant: 'warning' });
            return;
        }
        if (tahsilatForm.hedef === 'BANKA' && !tahsilatForm.bankaHesapId) {
            enqueueSnackbar('Lütfen banka hesabı seçiniz', { variant: 'warning' });
            return;
        }

        try {
            await axios.post('/checks-promissory-notes/action', {
                checkBillId: selectedCek.id,
                newStatus: 'COLLECTED',
                date: tahsilatForm.tarih,
                notes: tahsilatForm.aciklama,
                transactionAmount: tahsilatForm.tutar,
                cashboxId: tahsilatForm.hedef === 'KASA' ? tahsilatForm.kasaId : undefined,
                bankAccountId: tahsilatForm.hedef === 'BANKA' ? tahsilatForm.bankaHesapId : undefined,
            });
            enqueueSnackbar('Tahsilat başarılı', { variant: 'success' });
            setOpenTahsilat(false);
            fetchCekSenet(); // Listeyi yenile
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Hata oluştu', { variant: 'error' });
        }
    };

    const handleExportExcel = () => {
        const exportData = rows.map((row) => ({
            'Evrak No': row.checkNo ?? row.serialNo ?? '—',
            'Tip': (row.type?.replace('_', ' ') ?? '—').replace('CHECK', 'ÇEK').replace('PROMISSORY', 'SENET'),
            'Vade Tarihi': row.dueDate ? new Date(row.dueDate).toLocaleDateString('tr-TR') : '—',
            'Tutar': row.amount != null ? Number(row.amount) : 0,
            'Kalan Tutar': row.remainingAmount != null ? Number(row.remainingAmount) : 0,
            'Durum': getDurumLabel(row.status) ?? '—',
            'Borçlu / Keşideci': row.account?.title ?? '—',
            'Banka': row.bank ?? '—'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const colWidths = [
            { wpx: 120 }, { wpx: 150 }, { wpx: 120 },
            { wpx: 100 }, { wpx: 100 }, { wpx: 130 },
            { wpx: 250 }, { wpx: 150 }
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cek_Senetler');
        XLSX.writeFile(workbook, `cek_senet_listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getDurumColor = (durum: string) => {
        switch (durum) {
            case 'IN_PORTFOLIO': return 'info';
            case 'COLLECTED': return 'success';
            case 'ENDORSED': return 'warning';
            case 'PAID': return 'success';
            case 'WITHOUT_COVERAGE': return 'error';
            case 'IN_BANK_COLLECTION': return 'secondary';
            case 'IN_BANK_GUARANTEE': return 'secondary';
            case 'RETURNED': return 'default';
            case 'GIVEN_TO_BANK': return 'primary';
            case 'UNPAID': return 'error';
            case 'PARTIAL_PAID': return 'warning';
            default: return 'default';
        }
    };

    const getDurumLabel = (durum: string | undefined | null) => {
        if (!durum) return '—';
        switch (durum) {
            case 'IN_PORTFOLIO': return 'Portföyde';
            case 'COLLECTED': return 'Tahsil Edildi';
            case 'ENDORSED': return 'Ciro Edildi';
            case 'PAID': return 'Ödendi';
            case 'WITHOUT_COVERAGE': return 'Karşılıksız';
            case 'IN_BANK_COLLECTION': return 'Bankada Tahsilde';
            case 'IN_BANK_GUARANTEE': return 'Bankada Teminatta';
            case 'RETURNED': return 'İade Edildi';
            case 'GIVEN_TO_BANK': return 'Bankaya Verildi';
            case 'UNPAID': return 'Ödenmedi';
            case 'PARTIAL_PAID': return 'Kısmi Ödendi';
            default: return durum?.replace(/_/g, ' ') || '—';
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

    const columns: GridColDef[] = [
        {
            field: 'checkNo',
            headerName: 'Evrak No',
            width: 130,
            valueGetter: (value, row) => row?.checkNo ?? row?.serialNo ?? '—',
        },
        {
            field: 'type',
            headerName: 'Tip',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'CHECK' ? 'ÇEK' : params.value === 'PROMISSORY_NOTE' ? 'SENET' : (params.value?.replace('_', ' ') ?? '—')}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'dueDate',
            headerName: 'Vade Tarihi',
            width: 120,
            type: 'date',
            valueGetter: (value, row) => {
                const v = row?.dueDate;
                return v ? new Date(v) : null;
            }
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 130,
            type: 'number',
            valueGetter: (value, row) => {
                const t = row?.amount;
                return t != null ? Number(t) : null;
            },
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? formatCurrency(num) : '—';
            }
        },
        {
            field: 'remainingAmount',
            headerName: 'Kalan',
            width: 130,
            type: 'number',
            valueGetter: (value, row) => {
                const k = row?.remainingAmount;
                return k != null ? Number(k) : null;
            },
            valueFormatter: (value) => {
                const num = value != null ? Number(value) : NaN;
                return Number.isFinite(num) ? formatCurrency(num) : '—';
            }
        },
        {
            field: 'status',
            headerName: 'Durum',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={getDurumLabel(params.value)}
                    color={getDurumColor(params.value) as any}
                    size="small"
                />
            )
        },
        {
            field: 'debtor',
            headerName: 'Borçlu / Keşideci',
            width: 200,
            valueGetter: (value, row) => row?.account?.title ?? '—',
        },
        { field: 'bank', headerName: 'Banka', width: 150, valueGetter: (value, row) => row?.bank ?? '—' },
        {
            field: 'audit',
            headerName: '',
            width: 50,
            sortable: false,
            renderCell: (params) => (
                <IconButton size="small" onClick={(e) => handleAuditOpen(e, params.row)}>
                    <InfoIcon fontSize="small" sx={{ color: 'var(--muted-foreground)', opacity: 0.6 }} />
                </IconButton>
            )
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="Detay">
                        <IconButton size="small" onClick={() => router.push(`/checks-promissory-notes/${params.row.id}`)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {(params.row.status === 'IN_PORTFOLIO' || (params.row.remainingAmount > 0 && !['ENDORSED', 'IN_BANK_GUARANTEE'].includes(params.row.status))) && (
                        <Tooltip title="Tahsil Et">
                            <IconButton size="small" color="success" onClick={() => handleOpenTahsilat(params.row)}>
                                <Payment fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(params.row)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const filteredRows = React.useMemo(() => {
        if (!searchQuery) return rows;
        const lowerQuery = searchQuery.toLowerCase();
        return rows.filter((row) => {
            return (
                row.checkNo?.toLowerCase().includes(lowerQuery) ||
                row.serialNo?.toLowerCase().includes(lowerQuery) ||
                row.account?.title?.toLowerCase().includes(lowerQuery) ||
                row.bank?.toLowerCase().includes(lowerQuery)
            );
        });
    }, [rows, searchQuery]);

    return (
        <MainLayout>
            <Box sx={{ pb: 4 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                        }}>
                            <ReceiptIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                                Çek/Senet Portföyü
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                                Portföydeki tüm kıymetli evrakların takibi ve tahsilatı
                            </Typography>
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={fetchCekSenet}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Yenile
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportExcel}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                        >
                            Excel
                        </Button>
                    </Stack>
                </Box>

                {/* KPI Metrics Strip */}
                <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0, borderRadius: 3, bgcolor: 'var(--card)' }}>
                    <Box sx={{ flex: '1 1 150px', px: 2, borderRight: '1px solid var(--border)' }}>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Toplam Portföy</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>{formatCurrency(stats.total)}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px', px: 2, borderRight: '1px solid var(--border)' }}>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Bekleyen Tahsilat</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(stats.pending)}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px', px: 2, borderRight: '1px solid var(--border)' }}>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Tahsil Edilen</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(stats.collected)}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px', px: 2 }}>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Sorunlu/Vadesi Geçen</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--destructive)' }}>{formatCurrency(stats.problematic)}</Typography>
                    </Box>
                </Paper>

                {/* Toolbar Section */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                            <TextField
                                size="small"
                                placeholder="Evrak no, cari veya banka ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: 'var(--muted-foreground)', mr: 1, fontSize: 20 }} />,
                                }}
                                sx={{
                                    width: { xs: '100%', sm: '320px' },
                                    '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
                                }}
                            />
                            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' } }}>
                                <Chip label="Bugün" size="small" onClick={() => { }} sx={{ borderRadius: 1.5 }} />
                                <Chip label="Bu Hafta" size="small" onClick={() => { }} sx={{ borderRadius: 1.5 }} />
                                <Chip label="Bu Ay" size="small" variant="outlined" onClick={() => { }} sx={{ borderRadius: 1.5 }} />
                                <Chip label="Filtreleri Temizle" size="small" variant="outlined" onClick={() => setSearchQuery('')} sx={{ borderRadius: 1.5 }} />
                            </Stack>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                            {filteredRows.length} Kayıt Bulundu
                        </Typography>
                    </Box>
                </Paper>

                {/* DataGrid Section */}
                <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', height: 600, border: ' none', bgcolor: 'var(--card)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={loading}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: 'var(--muted)',
                                borderBottom: '1px solid var(--border)',
                                color: 'var(--foreground)',
                                fontWeight: 700
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid var(--border)',
                                color: 'var(--foreground)'
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: 'var(--muted)',
                            }
                        }}
                    />
                </Paper>

                {/* Audit Popover */}
                <Popover
                    open={openAudit}
                    anchorEl={anchorEl}
                    onClose={handleAuditClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        sx: { p: 2, width: 220, borderRadius: 3, border: '1px solid var(--border)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Denetim Bilgileri</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', color: 'var(--muted-foreground)', lineHeight: 1 }}>Oluşturma</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{auditInfo?.createdAt ? format(new Date(auditInfo.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr }) : '—'}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Edit sx={{ fontSize: 16, color: 'var(--secondary)' }} />
                            <Box>
                                <Typography variant="caption" sx={{ display: 'block', color: 'var(--muted-foreground)', lineHeight: 1 }}>Son Güncelleme</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{auditInfo?.updatedAt ? format(new Date(auditInfo.updatedAt), 'dd MMMM yyyy HH:mm', { locale: tr }) : '—'}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Popover>

                {/* Düzenleme Dialog */}
                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Evrak Düzenle - {selectedEdit?.checkNo ?? selectedEdit?.serialNo}</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <TextField
                                label="Evrak No"
                                value={editForm.evrakNo}
                                onChange={(e) => setEditForm({ ...editForm, evrakNo: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Vade Tarihi"
                                type="date"
                                value={editForm.vadeTarihi}
                                onChange={(e) => setEditForm({ ...editForm, vadeTarihi: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Tutar"
                                type="number"
                                value={editForm.tutar}
                                onChange={(e) => setEditForm({ ...editForm, tutar: e.target.value })}
                                fullWidth
                            />
                            <Autocomplete
                                freeSolo
                                options={TURKISH_BANKS}
                                value={editForm.banka}
                                onChange={(_, newValue) => setEditForm({ ...editForm, banka: newValue || '' })}
                                onInputChange={(_, newInputValue) => setEditForm({ ...editForm, banka: newInputValue })}
                                renderInput={(params) => <TextField {...params} label="Banka" fullWidth />}
                            />
                            <TextField
                                label="Şube"
                                value={editForm.sube}
                                onChange={(e) => setEditForm({ ...editForm, sube: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Hesap No"
                                value={editForm.hesapNo}
                                onChange={(e) => setEditForm({ ...editForm, hesapNo: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Açıklama"
                                value={editForm.aciklama}
                                onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEdit(false)}>İptal</Button>
                        <Button onClick={handleEditSave} variant="contained" disabled={editSaving}>
                            {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Silme Onay Dialog */}
                <Dialog open={openDelete} onClose={() => !deleteLoading && setOpenDelete(false)}>
                    <DialogTitle>Evrakı silmek istediğinize emin misiniz?</DialogTitle>
                    <DialogContent>
                        <Typography>
                            <strong>{cekToDelete?.checkNo ?? cekToDelete?.serialNo}</strong> numaralı evrak silinecek. Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDelete(false)} disabled={deleteLoading}>İptal</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading}>
                            {deleteLoading ? 'Siliniyor...' : 'Sil'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Tahsilat Dialog */}
                <Dialog open={openTahsilat} onClose={() => setOpenTahsilat(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Tahsilat İşlemi - {selectedCek?.checkNo ?? selectedCek?.serialNo}</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Tutar: {selectedCek?.amount} TL <br />
                                Kalan Tutar: <b>{selectedCek?.remainingAmount} TL</b>
                            </Typography>

                            <TextField
                                label="İşlem Tarihi"
                                type="date"
                                value={tahsilatForm.tarih}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, tarih: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />

                            <TextField
                                label="Tahsil Edilecek Tutar"
                                type="number"
                                value={tahsilatForm.tutar}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, tutar: Number(e.target.value) })}
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>Hedef Hesap</InputLabel>
                                <Select
                                    value={tahsilatForm.hedef}
                                    label="Hedef Hesap"
                                    onChange={(e) => setTahsilatForm({ ...tahsilatForm, hedef: e.target.value as any })}
                                >
                                    <MenuItem value="KASA">Kasa (Nakit)</MenuItem>
                                    <MenuItem value="BANKA">Banka Hesabı</MenuItem>
                                </Select>
                            </FormControl>

                            {tahsilatForm.hedef === 'KASA' && (
                                <FormControl fullWidth>
                                    <InputLabel>Kasa Seçiniz</InputLabel>
                                    <Select
                                        value={tahsilatForm.kasaId}
                                        label="Kasa Seçiniz"
                                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, kasaId: e.target.value })}
                                    >
                                        {kasalar.map(k => (
                                            <MenuItem key={k.id} value={k.id}>{k.name} ({k.balance} TL)</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {tahsilatForm.hedef === 'BANKA' && (
                                <FormControl fullWidth>
                                    <InputLabel>Banka Hesabı Seçiniz</InputLabel>
                                    <Select
                                        value={tahsilatForm.bankaHesapId}
                                        label="Banka Hesabı Seçiniz"
                                        onChange={(e) => setTahsilatForm({ ...tahsilatForm, bankaHesapId: e.target.value })}
                                    >
                                        {bankalar.map(b => (
                                            <MenuItem key={b.id} value={b.id}>{b.name} - {b.bank?.name} ({b.balance} TL)</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                label="Açıklama"
                                value={tahsilatForm.aciklama}
                                onChange={(e) => setTahsilatForm({ ...tahsilatForm, aciklama: e.target.value })}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenTahsilat(false)}>İptal</Button>
                        <Button onClick={handleTahsilatYap} variant="contained" color="success">
                            Tahsil Et
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
