'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    Grid,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
    ArrowBack,
    Payment,
    Edit,
    History,
    ExpandMore,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

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

const getJournalTypeLabel = (type: string) => {
    switch (type) {
        case 'CUSTOMER_DOCUMENT_ENTRY': return 'Müşteri Evrak Girişi';
        case 'RETURN_PAYROLL': return 'İade Bordrosu';
        case 'OWN_DOCUMENT_EXIT': return 'Borç Evrak Çıkışı';
        case 'ACCOUNT_DOCUMENT_ENDORSEMENT': return 'Cariye Evrak Cirosu';
        case 'BANK_COLLECTION_ENDORSEMENT': return 'Bankaya Tahsil Cirosu';
        case 'BANK_GUARANTEE_ENDORSEMENT': return 'Bankaya Teminat Cirosu';
        default: return type?.replace(/_/g, ' ') || 'İşlem';
    }
};

export default function CekDetayPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };
    const { enqueueSnackbar } = useSnackbar();

    const [cek, setCek] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Tahsilat State
    const [openTahsilat, setOpenTahsilat] = useState(false);
    const [kasalar, setKasalar] = useState<any[]>([]);
    const [bankalar, setBankalar] = useState<any[]>([]);
    const [tahsilatForm, setTahsilatForm] = useState({
        tarih: new Date().toISOString().split('T')[0],
        tutar: 0,
        hedef: 'KASA' as 'KASA' | 'BANKA',
        kasaId: '',
        bankaHesapId: '',
        aciklama: '',
    });

    const fetchCekDetay = async () => {
        try {
            const response = await axios.get(`/checks-promissory-notes/${id}`);
            const data = response.data;
            setCek(data);
            setTahsilatForm(prev => ({ ...prev, tutar: Number(data.remainingAmount) }));
        } catch (error) {
            console.error('Çek detay yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFinansData = async () => {
        try {
            const [kRes, bRes] = await Promise.all([
                axios.get('/cashbox?isRetail=false'),
                axios.get('/bank-accounts?type=DEMAND_DEPOSIT'),
            ]);
            setKasalar(kRes.data?.data ?? kRes.data);
            setBankalar(bRes.data?.data ?? bRes.data);
        } catch (error) {
            console.error('Finans verileri yüklenirken hata:', error);
        }
    };

    const handleTahsilatYap = async () => {
        if (tahsilatForm.tutar <= 0) {
            enqueueSnackbar('Tutar 0\'dan büyük olmalıdır', { variant: 'warning' });
            return;
        }
        if (tahsilatForm.tutar > Number(cek.remainingAmount)) {
            enqueueSnackbar('Tahsilat tutarı kalan tutardan fazla olamaz', { variant: 'warning' });
            return;
        }
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
                checkBillId: cek.id,
                newStatus: 'COLLECTED',
                date: tahsilatForm.tarih,
                notes: tahsilatForm.aciklama,
                transactionAmount: tahsilatForm.tutar,
                cashboxId: tahsilatForm.hedef === 'KASA' ? tahsilatForm.kasaId : undefined,
                bankAccountId: tahsilatForm.hedef === 'BANKA' ? tahsilatForm.bankaHesapId : undefined,
            });
            enqueueSnackbar('Tahsilat başarılı', { variant: 'success' });
            setOpenTahsilat(false);
            fetchCekDetay(); // Detayı yenile
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Hata oluştu', { variant: 'error' });
        }
    };

    useEffect(() => {
        if (id) {
            fetchCekDetay();
            fetchFinansData();
        }
    }, [id]);

    if (loading || !cek) return <Box p={3}>Yükleniyor...</Box>;

    return (
        <MainLayout>
            <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold">
                        Çek Detayı - {cek.checkNo}
                    </Typography>
                    <Chip label={getDurumLabel(cek.status)} color={getDurumColor(cek.status) as any} />
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" mb={2}>Temel Bilgiler</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Evrak No</Typography>
                                    <Typography fontWeight="bold">{cek.checkNo}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Vade Tarihi</Typography>
                                    <Typography fontWeight="bold">{cek.dueDate ? new Date(cek.dueDate).toLocaleDateString('tr-TR') : '—'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tutar</Typography>
                                    <Typography fontWeight="bold" variant="h6">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.amount)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Kalan Tutar</Typography>
                                    <Typography fontWeight="bold" color="error">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.remainingAmount)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Tip</Typography>
                                    <Typography>{cek.type === 'CHECK' ? 'Çek' : cek.type === 'PROMISSORY_NOTE' ? 'Senet' : (cek.type?.replace('_', ' ') || '—')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Çek Sahibi / Borçlu</Typography>
                                    <Typography>{cek.debtor || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Banka</Typography>
                                    <Typography>{cek.bank || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <Typography color="text.secondary">Şube / Hesap</Typography>
                                    <Typography>{cek.branch} / {cek.accountNo}</Typography>
                                </Grid>
                            </Grid>
                        </Card>

                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                                <History /> İşlem Geçmişi
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tarih</TableCell>
                                            <TableCell>İşlem</TableCell>
                                            <TableCell>Bordro</TableCell>
                                            <TableCell align="right">Tutar</TableCell>
                                            <TableCell>Açıklama</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cek.journalItems?.map((islem: any) => (
                                            <TableRow key={islem.id}>
                                                <TableCell>{islem.journal?.date ? new Date(islem.journal.date).toLocaleDateString('tr-TR') : '-'}</TableCell>
                                                <TableCell>{getJournalTypeLabel(islem.journal?.type)}</TableCell>
                                                <TableCell>
                                                    {islem.journal ? (
                                                        <Button size="small" onClick={() => router.push(`/payroll/${islem.journalId}`)}>
                                                            {islem.journal.journalNo}
                                                        </Button>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.amount)}
                                                </TableCell>
                                                <TableCell>{islem.journal?.notes || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Hızlı İşlemler</Typography>
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                startIcon={<Payment />}
                                disabled={Number(cek.remainingAmount) === 0}
                                onClick={() => setOpenTahsilat(true)}
                            >
                                Tahsilat Yap
                            </Button>
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    * Detaylı tahsilat için listedeki "Tahsil Et" butonunu kullanabilirsiniz.
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                <Card sx={{ mt: 3 }}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Denetim Bilgileri
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturan</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {cek.createdByUser?.fullName ?? cek.createdByUser?.username ?? 'Sistem'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Oluşturma Tarihi</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {cek.createdAt ? new Date(cek.createdAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleyen</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {cek.updatedByUser?.fullName ?? cek.updatedByUser?.username ?? '-'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {(cek.updatedAt && cek.updatedAt !== cek.createdAt) ? new Date(cek.updatedAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Card>

                {/* Tahsilat Dialog */}
                <Dialog open={openTahsilat} onClose={() => setOpenTahsilat(false)} maxWidth="sm" fullWidth>
                    <DialogTitle component="div">Tahsilat İşlemi - {cek.checkNo}</DialogTitle>
                    <DialogContent dividers>
                        <Box display="flex" flexDirection="column" gap={2} pt={1}>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Tutar: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.amount)} <br />
                                Kalan Tutar: <b>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cek.remainingAmount)}</b>
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
                                            <MenuItem key={k.id} value={k.id}>{k.name} ({new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(k.balance)})</MenuItem>
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
                                            <MenuItem key={b.id} value={b.id}>{b.name} - {b.bank?.name} ({new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(b.balance)})</MenuItem>
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
                            Tahsilat Yap
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
