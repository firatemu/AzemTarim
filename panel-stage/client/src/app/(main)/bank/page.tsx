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
} from '@mui/material';
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

    return (
        <StandardPage maxWidth={false}>
            {/* Header & Aksiyon Butonları */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AccountBalanceWallet sx={{ color: 'var(--primary-foreground)', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="var(--foreground)">
                        Bankalar
                    </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={handleCreate}
                        sx={{
                            bgcolor: 'var(--secondary)',
                            color: 'var(--secondary-foreground)',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: 'var(--secondary-hover)', boxShadow: 'none' },
                        }}
                    >
                        Yeni Banka Ekle
                    </Button>
                </Stack>
            </Box>

            {/* Loading bar */}
            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 3 }} />}

            {/* KPI Kartları */}
            <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {[
                    { label: 'Toplam Banka', value: bankalar.length },
                    { label: 'Aktif Banka', value: activeBanks },
                    { label: 'Toplam Hesap', value: totalAccounts },
                ].map((item, i) => (
                    <Box
                        key={item.label}
                        sx={{
                            flex: '1 1 120px',
                            px: 1.5,
                            borderRight: i < 2 ? '1px solid var(--divider, var(--border))' : 'none',
                        }}
                    >
                        <Typography variant="caption" color="var(--muted-foreground)" fontWeight={500}>
                            {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--foreground)' }}>
                            {item.value}
                        </Typography>
                    </Box>
                ))}
            </Paper>

            {/* Toolbar ve Tablo */}
            <StandardCard padding={0} sx={{ boxShadow: 'none', overflow: 'hidden' }}>
                {/* Toolbar */}
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', borderBottom: '1px solid var(--border)', bgcolor: 'var(--card)' }}>
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
                            <IconButton size="small" onClick={loadBankalar}>
                                <RefreshOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Tablo Satır Özeti */}
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Toplam <b>{filteredBankalar.length}</b> banka listeleniyor
                    </Typography>
                </Box>

                {/* Tablo */}
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Banka Adı</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Şube - Şehir</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Yetkili / Telefon</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Hesap Sayısı</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBankalar.map((banka) => (
                                <TableRow
                                    key={banka.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => router.push(`/bank/${banka.id}`)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                bgcolor: 'var(--background)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--primary)',
                                                overflow: 'hidden',
                                                border: '1px solid var(--border)'
                                            }}>
                                                {getBankLogo(banka.name, banka.logo) ? (
                                                    <Box component="img" src={getBankLogo(banka.name, banka.logo)!} sx={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                ) : (
                                                    <AccountBalance />
                                                )}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {banka.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{banka.branch || '-'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{banka.city || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{banka.contactName || '-'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{banka.phone || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${banka._count?.accounts || 0} Hesap`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={banka.isActive ? 'Aktif' : 'Pasif'}
                                            color={banka.isActive ? 'success' : 'default'}
                                            size="small"
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            title="Hesapları İncele"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/bank/${banka.id}`);
                                            }}
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(banka);
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            title="Hesap Ekle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBankaForAccount(banka);
                                                setAccountDialogOpen(true);
                                            }}
                                        >
                                            <Add fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBanka(banka);
                                                setDeleteConfirmOpen(true);
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredBankalar.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery ? 'Arama sonucunda banka bulunamadı' : 'Henüz banka eklenmemiş'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
