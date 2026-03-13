import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
    Paper,
    Divider,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Autocomplete,
    Chip,
    alpha
} from '@mui/material';
import {
    AccountBalance,
    AttachMoney,
    Close,
    PanTool,
    CheckCircle
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';

interface LoanPlan {
    id: string;
    installmentNo: number;
    dueDate: string;
    amount: number;
    paidAmount: number;
    status: string;
}

interface BankAccount {
    id: string;
    name: string;
    code: string;
    balance: number;
    type: string;
}

interface Cashbox {
    id: string;
    name: string;
    code: string;
    balance: number;
}

interface PayInstallmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plan: LoanPlan;
}

type PaymentType = 'BANKA_HAVALESI' | 'NAKIT' | 'ELDEN';

export default function PayInstallmentDialog({ open, onClose, onSuccess, plan }: PayInstallmentDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [paymentType, setPaymentType] = useState<PaymentType>('BANKA_HAVALESI');
    const [amount, setAmount] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [bankAccountId, setBankAccountId] = useState<string | null>(null);
    const [cashboxId, setCashboxId] = useState<string | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
    const [loading, setLoading] = useState(false);

    const remainingAmount = plan.amount - plan.paidAmount;

    useEffect(() => {
        if (open) {
            setAmount(remainingAmount.toString());
            fetchBankAccounts();
            fetchCashboxes();
        }
    }, [open, remainingAmount]);

    const fetchBankAccounts = async () => {
        try {
            const response = await axios.get('/banks/summary');
            const vadesizHesaplar: BankAccount[] = [];
            response.data.bankalar?.forEach((banka: any) => {
                banka.accounts?.forEach((hesap: any) => {
                    if (hesap.type === 'VADESIZ') {
                        vadesizHesaplar.push(hesap);
                    }
                });
            });
            setBankAccounts(vadesizHesaplar);
        } catch (error) {
            console.error('Banka hesapları yüklenemedi:', error);
        }
    };

    const fetchCashboxes = async () => {
        try {
            const response = await axios.get('/cashboxes');
            setCashboxes(response.data.filter((k: Cashbox) => k.name !== 'Silinen Kayıtlar'));
        } catch (error) {
            console.error('Kasalar yüklenemedi:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            enqueueSnackbar('Geçerli bir tutar giriniz', { variant: 'error' });
            return;
        }

        if (parseFloat(amount) > remainingAmount) {
            enqueueSnackbar('Ödeme tutarı kalan tutardan fazla olamaz', { variant: 'error' });
            return;
        }

        if (paymentType === 'BANKA_HAVALESI' && !bankAccountId) {
            enqueueSnackbar('Banka hesabı seçiniz', { variant: 'error' });
            return;
        }

        if (paymentType === 'NAKIT' && !cashboxId) {
            enqueueSnackbar('Kasa seçiniz', { variant: 'error' });
            return;
        }

        // Bakiye kontrolü
        if (paymentType === 'BANKA_HAVALESI') {
            const hesap = bankAccounts.find(h => h.id === bankAccountId);
            if (hesap && hesap.balance < parseFloat(amount)) {
                enqueueSnackbar('Banka hesabında yeterli bakiye yok', { variant: 'error' });
                return;
            }
        }

        if (paymentType === 'NAKIT') {
            const kasa = cashboxes.find(k => k.id === cashboxId);
            if (kasa && kasa.balance < parseFloat(amount)) {
                enqueueSnackbar('Kasada yeterli bakiye yok', { variant: 'error' });
                return;
            }
        }

        setLoading(true);
        try {
            await axios.post(`/banks/loan-plans/${plan.id}/payments`, {
                paymentType,
                amount: parseFloat(amount),
                bankAccountId: paymentType === 'BANKA_HAVALESI' ? bankAccountId : undefined,
                cashboxId: paymentType === 'NAKIT' ? cashboxId : undefined,
                notes: notes || undefined,
                paymentDate
            });
            enqueueSnackbar('Ödeme başarıyla kaydedildi', { variant: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Ödeme kaydedilemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const selectedHesap = bankAccounts.find(h => h.id === bankAccountId);
    const selectedKasa = cashboxes.find(k => k.id === cashboxId);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, bgcolor: 'var(--muted)' }
            }}
        >
            <DialogTitle component="div" sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney />
                    <Typography variant="h6" fontWeight="700">Taksit Ödemesi</Typography>
                </Box>
                <Button
                    onClick={onClose}
                    sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
                >
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: 'var(--muted)' }}>
                <Stack spacing={3}>
                    {/* Taksit Bilgileri */}
                    <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Taksit Bilgileri</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Taksit No</Typography>
                                <Typography variant="body1" fontWeight="600">#{plan.installmentNo}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Vade Tarihi</Typography>
                                <Typography variant="body1" fontWeight="600">{formatDate(plan.dueDate)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Taksit Tutarı</Typography>
                                <Typography variant="body1" fontWeight="700" color="primary">{formatCurrency(plan.amount)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Kalan Tutar</Typography>
                                <Typography variant="body1" fontWeight="700" color="error">{formatCurrency(remainingAmount)}</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Ödeme Tipi Seçimi */}
                    <FormControl>
                        <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Ödeme Yöntemi</FormLabel>
                        <RadioGroup value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)}>
                            <Paper sx={{ p: 1.5, mb: 1, border: '2px solid', borderColor: paymentType === 'BANKA_HAVALESI' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="BANKA_HAVALESI"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountBalance sx={{ color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Banka Havalesi (Virman)</Typography>
                                                <Typography variant="caption" color="text.secondary">Vadesiz hesaptan ödeme</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                            <Paper sx={{ p: 1.5, mb: 1, border: '2px solid', borderColor: paymentType === 'NAKIT' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="NAKIT"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoney sx={{ color: 'success.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Nakit (Kasa)</Typography>
                                                <Typography variant="caption" color="text.secondary">Kasadan ödeme</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                            <Paper sx={{ p: 1.5, border: '2px solid', borderColor: paymentType === 'ELDEN' ? 'primary.main' : 'divider', borderRadius: 2 }}>
                                <FormControlLabel
                                    value="ELDEN"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PanTool sx={{ color: 'warning.main' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">Elden Ödeme</Typography>
                                                <Typography variant="caption" color="text.secondary">Bakiye hareketi olmaz</Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </Paper>
                        </RadioGroup>
                    </FormControl>

                    {/* Banka Hesabı Seçimi */}
                    {paymentType === 'BANKA_HAVALESI' && (
                        <Autocomplete
                            options={bankAccounts}
                            getOptionLabel={(option) => `${option.name} (${option.code}) - ${formatCurrency(option.balance)}`}
                            value={bankAccounts.find(h => h.id === bankAccountId) || null}
                            onChange={(_, newValue) => setBankAccountId(newValue?.id || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Banka Hesabı"
                                    required
                                    helperText={selectedHesap && `Bakiye: ${formatCurrency(selectedHesap.balance)}`}
                                />
                            )}
                        />
                    )}

                    {/* Kasa Seçimi */}
                    {paymentType === 'NAKIT' && (
                        <Autocomplete
                            options={cashboxes}
                            getOptionLabel={(option) => `${option.name} (${option.code}) - ${formatCurrency(option.balance)}`}
                            value={cashboxes.find(k => k.id === cashboxId) || null}
                            onChange={(_, newValue) => setCashboxId(newValue?.id || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Kasa"
                                    required
                                    helperText={selectedKasa && `Bakiye: ${formatCurrency(selectedKasa.balance)}`}
                                />
                            )}
                        />
                    )}

                    {/* Tutar */}
                    <TextField
                        label="Ödeme Tutarı"
                        type="number"
                        fullWidth
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        InputProps={{
                            endAdornment: <Typography variant="body2" color="text.secondary">TL</Typography>
                        }}
                        helperText={`Maksimum: ${formatCurrency(remainingAmount)}`}
                    />

                    {/* Ödeme Tarihi */}
                    <TextField
                        label="Ödeme Tarihi"
                        type="date"
                        fullWidth
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Açıklama */}
                    <TextField
                        label="Açıklama (Opsiyonel)"
                        multiline
                        rows={2}
                        fullWidth
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    {/* Bakiye Uyarısı */}
                    {paymentType === 'BANKA_HAVALESI' && selectedHesap && selectedHesap.balance < parseFloat(amount || '0') && (
                        <Alert severity="error">Banka hesabında yeterli bakiye yok!</Alert>
                    )}
                    {paymentType === 'NAKIT' && selectedKasa && selectedKasa.balance < parseFloat(amount || '0') && (
                        <Alert severity="error">Kasada yeterli bakiye yok!</Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>İptal</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={<CheckCircle />}
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        px: 4
                    }}
                >
                    {loading ? 'Ödeniyor...' : 'Ödemeyi Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
