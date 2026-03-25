'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
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
    MenuItem,
    Stack,
    Skeleton
} from '@mui/material';
import {
    Add,
    ArrowBack,
    Delete,
    Visibility,
    AccountBalance,
    CreditCard,
    Payment,
    BusinessCenter
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import CreateAccountDialog, { accountTypes } from '@/components/Banka/CreateAccountDialog';
import CreateCreditDialog from '@/components/Banka/CreateCreditDialog';
import CreditPlanDialog from '@/components/Banka/CreditPlanDialog';
import { getBankLogo } from '@/constants/bankalar';

// Interfaces matching the new Prisma schema
interface BankAccount {
    id: string;
    name: string;
    code: string;
    type: 'DEMAND_DEPOSIT' | 'POS' | 'LOAN' | 'COMPANY_CREDIT_CARD';
    accountNo?: string;
    iban?: string;
    balance: number;
    isActive: boolean;
    // POS specific
    commissionRate?: number;
    // Credit specific
    creditLimit?: number;
    usedLimit?: number;
    // Credit card specific
    cardLimit?: number;
    statementDay?: number;
    paymentDueDay?: number;
    loans?: BankLoan[];
}

interface BankLoanPlan {
    id: string;
    installmentNo: number;
    dueDate: string;
    paid: number;
    status: string;
    amount: number;
}

interface BankLoan {
    id: string;
    amount: number;
    totalRepayment: number;
    description?: string;
    status: string;
    plans?: BankLoanPlan[];
}

interface Bank {
    id: string;
    name: string;
    branch?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    logo?: string;
    isActive: boolean;
    accounts: BankAccount[];
    summary?: {
        totalBalance: number;
        typeBasedTotal: Record<string, number>;
    };
}

// API Functions using axios
const fetchBankaDetay = async (id: string) => {
    const res = await axios.get(`/banks/${id}`);
    return res.data;
};

const deleteAccount = async (id: string) => {
    const res = await axios.delete(`/banks/accounts/${id}`);
    return res.data;
};

export default function BankaDetayPage() {
    const router = useRouter();
    const params = useParams();
    const bankaId = params.id as string;
    const { enqueueSnackbar } = useSnackbar();

    const [banka, setBanka] = useState<Bank | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedHesapId, setSelectedHesapId] = useState<string | null>(null);
    const [dialogMode, setDialogMode] = useState<'CREATE' | 'EDIT'>('CREATE');
    const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<any>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchBankaDetay(bankaId);
            setBanka(data);
        } catch (error) {
            enqueueSnackbar('Banka bilgileri yüklenemedi', { variant: 'error' });
            router.push('/bank');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bankaId) loadData();
    }, [bankaId]);


    const handleDeleteAccount = async () => {
        if (!selectedHesapId) return;
        try {
            await deleteAccount(selectedHesapId);
            enqueueSnackbar('Hesap silindi', { variant: 'success' });
            setDeleteDialogOpen(false);
            setSelectedHesapId(null);
            loadData();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', { variant: 'error' });
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const getAccountTypeInfo = (type: string) => {
        return accountTypes.find(t => t.value === type) || accountTypes[0];
    };

    // Calculate totals by type
    const calculateTotals = () => {
        if (!banka) return { total: 0, byType: {} as Record<string, number> };

        // Backend'den gelen özeti kullan
        if (banka.summary) {
            return {
                total: banka.summary.totalBalance,
                byType: banka.summary.typeBasedTotal
            };
        }

        const byType: Record<string, number> = {};
        let total = 0;
        banka.accounts.forEach(h => {
            const balance = Number(h.balance);
            total += balance;
            byType[h.type] = (byType[h.type] || 0) + balance;
        });
        return { total, byType };
    };

    if (loading) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map(i => (
                            <Grid key={i} size={{ xs: 12, md: 3 }}>
                                <Skeleton variant="rectangular" height={100} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MainLayout>
        );
    }

    if (!banka) return null;

    const totals = calculateTotals();

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => router.push('/bank')} sx={{ mb: 2 }}>
                        Bankalar Listesine Dön
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 3,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                p: 1
                            }}>
                                {getBankLogo(banka.name, banka.logo) ? (
                                    <Box component="img" src={getBankLogo(banka.name, banka.logo)!} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <AccountBalance sx={{ fontSize: 32 }} />
                                )}
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{
                                    fontWeight: 700,
                                    color: 'var(--foreground)',
                                    letterSpacing: '-0.025em',
                                }}>
                                    {banka.name}
                                </Typography>
                                <Typography sx={{ color: 'var(--muted-foreground)', mt: 0.5 }}>
                                    {banka.branch && `${banka.branch} Şubesi`} {banka.city && `- ${banka.city}`}
                                </Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => {
                                    setDialogMode('CREATE');
                                    setSelectedAccountForEdit(null);
                                    setDialogOpen(true);
                                }}
                                sx={{
                                    bgcolor: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                    '&:hover': {
                                        bgcolor: 'var(--primary)',
                                        opacity: 0.9,
                                    },
                                    borderRadius: 'var(--radius)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                }}
                            >
                                Yeni Hesap Ekle
                            </Button>
                        </Stack>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={{
                            bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                            borderLeft: '4px solid var(--chart-2)',
                            borderRadius: 'var(--radius)',
                            boxShadow: 'var(--shadow-sm)',
                            height: '100%',
                        }}>
                            <CardContent sx={{ p: '12px !important' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <AccountBalance sx={{ color: 'var(--chart-2)', fontSize: '1rem' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                                        Toplam Borç/Bakiye
                                    </Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'var(--chart-2)', fontWeight: 800 }}>
                                    {formatCurrency(totals.total)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', opacity: 0.8, display: 'block', mt: 0.5 }}>
                                    {banka.accounts.length} Hesap
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {accountTypes.map((type, index) => {
                        const amount = totals.byType[type.value] || 0;
                        const count = banka.accounts.filter(h => h.type === type.value).length;
                        if (count === 0) return null;
                        const Icon = type.icon;
                        const accentColor = 'var(--chart-2)';
                        return (
                            <Grid key={type.value} size={{ xs: 12, sm: 6, md: 2.25 }}>
                                <Card sx={{
                                    bgcolor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                                    borderLeft: `4px solid ${accentColor}`,
                                    borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow-sm)',
                                    height: '100%',
                                }}>
                                    <CardContent sx={{ p: '12px !important' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Icon sx={{ color: accentColor, fontSize: '1rem' }} />
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{type.label}</Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{ color: accentColor, fontWeight: 800 }}>
                                            {formatCurrency(amount)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', opacity: 0.8, display: 'block', mt: 0.5 }}>
                                            {count} Hesap
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Accounts List */}
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 3 }}>Bankaya Bağlı Hesaplar</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Hesap Adı</TableCell>
                                        <TableCell>Hesap Tipi</TableCell>
                                        <TableCell align="right">Bakiye / Toplam Borç</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {banka.accounts.map((hesap: any) => {
                                        const typeInfo = getAccountTypeInfo(hesap.type);
                                        // Kredi hesabı ise kredilerin toplam geri ödeme tutarını göster
                                        let displayAmount = Number(hesap.balance);
                                        const isCreditAccount = hesap.type === 'LOAN';

                                        if (isCreditAccount && hesap.loans && hesap.loans.length > 0) {
                                            displayAmount = hesap.loans.reduce((sum: number, k: any) => sum + Number(k.totalRepayment), 0);
                                        }

                                        return (
                                            <TableRow
                                                key={hesap.id}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => router.push(`/bank/hesap/${hesap.id}`)}
                                            >
                                                <TableCell>
                                                    <Typography fontWeight="500">{hesap.name}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={typeInfo.label}
                                                        size="small"
                                                        color={typeInfo.color as any}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight="bold" color={Number(hesap.balance) < 0 || isCreditAccount ? 'error.main' : 'success.main'}>
                                                        {formatCurrency(displayAmount)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedAccountForEdit(hesap);
                                                            setDialogMode('EDIT');
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        <Payment fontSize="small" sx={{ color: 'var(--primary)' }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/bank/hesap/${hesap.id}`);
                                                        }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedHesapId(hesap.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {banka.accounts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary">Bu bankada henüz hesap bulunmuyor.</Typography>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Add />}
                                                    onClick={() => {
                                                        setDialogMode('CREATE');
                                                        setSelectedAccountForEdit(null);
                                                        setDialogOpen(true);
                                                    }}
                                                    sx={{ mt: 2 }}
                                                >
                                                    İlk Hesabı Oluştur
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Create/Edit Account Dialog */}
                <CreateAccountDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSuccess={loadData}
                    bankaId={bankaId}
                    bankaAdi={banka.name}
                    mode={dialogMode}
                    initialData={selectedAccountForEdit}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle component="div">Hesap Silinecek</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Bu hesabı silmek istediğinize emin misiniz? Hesapta hareket varsa silme işlemi başarısız olacaktır.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleDeleteAccount} color="error" variant="contained">Sil</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </MainLayout>
    );
}
