'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Stack,
    Autocomplete,
    Paper,
    Alert,
    LinearProgress,
    Tooltip,
    Collapse,
    Snackbar,
    alpha,
    useTheme,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import {
    Add,
    Edit,
    Delete,
    AccountBalance,
    Search,
    Visibility,
    RefreshOutlined,
    AccountBalanceWallet,
    Download,
    FilterList,
    Close,
    TrendingUp,
    TrendingDown,
    Person,
    Business,
    Refresh,
} from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from '@/lib/axios';
import CreateAccountDialog from '@/components/Banka/CreateAccountDialog';
import { TURKISH_BANKS, getBankLogo } from '@/constants/bankalar';
import { StandardPage, StandardCard } from '@/components/common';

// Constants moved to @/constants/bankalar

// Interfaces
interface Banka {
    id: string;
    name: string;
    branch?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    logo?: string;
    isActive: boolean;
    _count?: {
        accounts: number;
    };
}

// Service
const fetchBankalar = async () => {
    const res = await axios.get('/banks');
    return res.data;
};

const createBanka = async (data: any) => {
    const res = await axios.post('/banks', data);
    return res.data;
};

const updateBanka = async (id: string, data: any) => {
    const res = await axios.put(`/banks/${id}`, data);
    return res.data;
};

const deleteBanka = async (id: string) => {
    const res = await axios.delete(`/banks/${id}`);
    return res.data;
};

// Validation Schema
const bankaSchema = z.object({
    name: z.string().min(1, 'Banka adı zorunludur'),
    branch: z.string().optional(),
    city: z.string().optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean(),
});

type BankaFormValues = z.infer<typeof bankaSchema>;

export default function BankaPage() {
    const router = useRouter();
    const [bankalar, setBankalar] = useState<Banka[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedBanka, setSelectedBanka] = useState<Banka | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [selectedBankaForAccount, setSelectedBankaForAccount] = useState<Banka | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

    const { control, handleSubmit, reset, setValue } = useForm<BankaFormValues>({
        resolver: zodResolver(bankaSchema),
        defaultValues: {
            name: '',
            branch: '',
            city: '',
            contactName: '',
            phone: '',
            isActive: true,
        },
    });

    const loadBankalar = async () => {
        try {
            setLoading(true);
            const data = await fetchBankalar();
            setBankalar(data);
        } catch (error) {
            setSnackbar({ open: true, message: 'Bankalar yüklenirken bir hata oluştu', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBankalar();
    }, []);

    const onSubmit = async (values: BankaFormValues) => {
        try {
            const logo = getBankLogo(values.name);
            const dataToSubmit = { ...values, logo };

            if (selectedBanka) {
                await updateBanka(selectedBanka.id, dataToSubmit);
                setSnackbar({ open: true, message: 'Banka güncellendi', severity: 'success' });
            } else {
                await createBanka(dataToSubmit);
                setSnackbar({ open: true, message: 'Banka oluşturuldu', severity: 'success' });
            }
            setDialogOpen(false);
            loadBankalar();
            reset();
            setSelectedBanka(null);
        } catch (error) {
            setSnackbar({ open: true, message: 'İşlem başarısız oldu', severity: 'error' });
        }
    };

    const handleEdit = (banka: Banka) => {
        setSelectedBanka(banka);
        setValue('name', banka.name);
        setValue('branch', banka.branch || '');
        setValue('city', banka.city || '');
        setValue('contactName', banka.contactName || '');
        setValue('phone', banka.phone || '');
        setValue('isActive', banka.isActive);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedBanka) return;
        try {
            await deleteBanka(selectedBanka.id);
            setSnackbar({ open: true, message: 'Banka silindi', severity: 'success' });
            setDeleteConfirmOpen(false);
            setSelectedBanka(null);
            loadBankalar();
        } catch (error) {
            setSnackbar({ open: true, message: 'Silme işlemi başarısız', severity: 'error' });
        }
    };

    const filteredBankalar = bankalar.filter(banka =>
        banka.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banka.branch?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedBanka(null);
        reset({
            name: '',
            branch: '',
            city: '',
            contactName: '',
            phone: '',
            isActive: true,
        });
        setDialogOpen(true);
    };

    // İstatistik hesaplamaları
    const totalAccounts = useMemo(() => bankalar.reduce((sum, b) => sum + (b._count?.accounts || 0), 0), [bankalar]);
    const activeBanks = bankalar.filter(b => b.isActive).length;

    const theme = useTheme();

    const headerActions = (
        <Stack direction="row" spacing={1}>
            <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={handleCreate}
                sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: theme.palette.secondary.dark, boxShadow: 'none' },
                }}
            >
                Yeni Banka Ekle
            </Button>
        </Stack>
    );

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Banka Adı',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 2 }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                    }}>
                        {getBankLogo(params.row.name, params.row.logo) ? (
                            <Box component="img" src={getBankLogo(params.row.name, params.row.logo)!} sx={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        ) : (
                            <AccountBalance sx={{ fontSize: 18 }} />
                        )}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'branch',
            headerName: 'Şube - Şehir',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.city || '-'}</Typography>
                </Box>
            ),
        },
        {
            field: 'contactName',
            headerName: 'Yetkili / Telefon',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2">{params.value || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.phone || '-'}</Typography>
                </Box>
            ),
        },
        {
            field: '_count',
            headerName: 'Hesap Sayısı',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={`${params.value?.accounts || 0} Hesap`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                />
            ),
        },
        {
            field: 'isActive',
            headerName: 'Durum',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Aktif' : 'Pasif'}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        borderRadius: 1.5,
                        bgcolor: params.value ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1),
                        color: params.value ? theme.palette.success.main : theme.palette.grey[700],
                    }}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 180,
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, alignItems: 'center', height: '100%' }}>
                    <Tooltip title="Detay">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/bank/${params.row.id}`);
                            }}
                            sx={{ color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.05) }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(params.row);
                            }}
                            sx={{ color: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.05) }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Hesap Ekle">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBankaForAccount(params.row);
                                setAccountDialogOpen(true);
                            }}
                            sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                        >
                            <Add fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBanka(params.row);
                                setDeleteConfirmOpen(true);
                            }}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <StandardPage title="Banka Yönetimi" headerActions={headerActions}>
            {/* KPI Kartları - MODERNIZE */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Toplam Banka', value: bankalar.length, icon: Business, color: theme.palette.primary.main },
                    { label: 'Aktif Banka', value: activeBanks, icon: TrendingUp, color: theme.palette.success.main },
                    { label: 'Toplam Hesap', value: totalAccounts, icon: AccountBalance, color: theme.palette.info.main },
                ].map((item, i) => (
                    <Grid item xs={12} sm={4} key={i}>
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
                                        {item.value}
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

            {/* Toolbar ve Tablo */}
            <StandardCard padding={0}>
                {/* Toolbar */}
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <TextField
                        size="small"
                        placeholder="Banka veya şube ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                            endAdornment: searchQuery && (
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <Close fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Yenile">
                            <IconButton
                                size="small"
                                onClick={loadBankalar}
                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                            >
                                <RefreshOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ height: 'auto', minHeight: 400, width: '100%' }}>
                    <DataGrid
                        rows={filteredBankalar}
                        columns={columns}
                        getRowId={(row) => row.id}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 15, page: 0 },
                            },
                        }}
                        pageSizeOptions={[15, 30, 50]}
                        disableRowSelectionOnClick
                        loading={loading}
                        localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
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
                        onRowClick={(params) => router.push(`/bank/${params.row.id}`)}
                    />
                </Box>
            </StandardCard>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle component="div">
                    {selectedBanka ? 'Banka Düzenle' : 'Yeni Banka Ekle'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field: { onChange, value, ...field }, fieldState }) => (
                                    <Autocomplete
                                        freeSolo
                                        options={TURKISH_BANKS}
                                        value={value || ''}
                                        onChange={(_, newValue) => onChange(newValue)}
                                        onInputChange={(_, newInputValue) => onChange(newInputValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                {...field}
                                                label="Banka Adı"
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="branch"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} fullWidth label="Şube" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="city"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} fullWidth label="Şehir" />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="contactName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} fullWidth label="Yetkili" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} fullWidth label="Telefon" />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        }
                                        label="Aktif"
                                    />
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>İptal</Button>
                        <Button type="submit" variant="contained">Kaydet</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle component="div">Banka Silinecek</DialogTitle>
                <DialogContent>
                    <Typography>
                        "{selectedBanka?.name}" bankasını silmek istediğinize emin misiniz? Bu işlem bankaya bağlı hesapları da silecektir.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Sil</Button>
                </DialogActions>
            </Dialog>

            {/* Create Account Dialog */}
            <CreateAccountDialog
                open={accountDialogOpen}
                onClose={() => setAccountDialogOpen(false)}
                onSuccess={loadBankalar}
                bankaId={selectedBankaForAccount?.id || ''}
                bankaAdi={selectedBankaForAccount?.name || ''}
            />

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
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StandardPage>
    );
}
