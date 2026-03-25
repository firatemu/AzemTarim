'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, RadioGroup, FormControlLabel, Radio, LinearProgress, Alert } from '@mui/material';
import { useCheck } from '@/hooks/use-checks';
import { useCollectionAction } from '@/hooks/use-collection-action';
import { formatAmount } from '@/lib/format';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CashboxSelect from '@/components/common/CashboxSelect';
import BankAccountSelect from '@/components/common/BankAccountSelect';

export default function CollectionClient({ checkId }: { checkId: string }) {
    const router = useRouter();
    const { data: check, isLoading } = useCheck(checkId);
    const collectionAction = useCollectionAction();

    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [targetType, setTargetType] = useState<'KASA' | 'BANKA'>('KASA');
    const [cashboxId, setCashboxId] = useState<string | null>(null);
    const [bankAccountId, setBankAccountId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    // Pre-fill amount when check data is loaded
    React.useEffect(() => {
        if (check && amount === '') {
            setAmount(check.remainingAmount);
        }
    }, [check, amount]);

    if (isLoading) return <Typography>Yükleniyor...</Typography>;
    if (!check) return <Typography>Evrak bulunamadı.</Typography>;

    const collectedAmount = check.amount - check.remainingAmount;
    const progressPercent = (collectedAmount / check.amount) * 100;

    const handleFullCollection = () => {
        setAmount(check.remainingAmount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || amount <= 0 || amount > check.remainingAmount) return;
        if (targetType === 'KASA' && !cashboxId) return;
        if (targetType === 'BANKA' && !bankAccountId) return;

        const isFullCollection = Number(amount) === check.remainingAmount;
        const newStatus = isFullCollection ? 'COLLECTED' : 'PARTIAL_PAID';

        collectionAction.mutate(
            {
                checkBillId: checkId,
                transactionAmount: Number(amount),
                date: new Date(date).toISOString(),
                newStatus,
                cashboxId: targetType === 'KASA' && cashboxId ? cashboxId : undefined,
                bankAccountId: targetType === 'BANKA' && bankAccountId ? bankAccountId : undefined,
                notes,
            },
            {
                onSuccess: () => {
                    router.push(`/checks/${checkId}`);
                }
            }
        );
    };

    const isFormValid = !!amount && amount > 0 && amount <= check.remainingAmount && (targetType === 'KASA' ? !!cashboxId : !!bankAccountId);

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
                Geri Dön
            </Button>

            {/* Summary Banner */}
            <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.default' }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Typography variant="body2" color="text.secondary">Evrak Özeti</Typography>
                            <Typography variant="h6">{check.account?.title}</Typography>
                            <Typography variant="body2">Çek No: {check.checkNo || '-'} | Banka: {check.bank || '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                            <Typography variant="h5" color="primary">{formatAmount(check.amount)}</Typography>
                            <Typography variant="body2" color="text.secondary">Kalan: {formatAmount(check.remainingAmount)}</Typography>
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <LinearProgress variant="determinate" value={progressPercent} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block" textAlign="right">
                            {progressPercent.toFixed(1)}% Tahsil Edildi
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Form */}
            <Card variant="outlined">
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Tahsil Edilen Tutar"
                                    type="number"
                                    inputProps={{ step: "0.01", max: check.remainingAmount, min: 0.01 }}
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                    helperText={
                                        <Box component="span" display="flex" justifyContent="space-between">
                                            <span>Maksimum: {formatAmount(check.remainingAmount)}</span>
                                            <Button onClick={handleFullCollection} size="small" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}>Tamamını Al</Button>
                                        </Box>
                                    }
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Tahsilat Tarihi"
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Tahsilat Yeri</Typography>
                                <RadioGroup row value={targetType} onChange={(e) => setTargetType(e.target.value as 'KASA' | 'BANKA')}>
                                    <FormControlLabel value="KASA" control={<Radio />} label="Kasa (Nakit)" />
                                    <FormControlLabel value="BANKA" control={<Radio />} label="Banka Hesabı" />
                                </RadioGroup>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                {targetType === 'KASA' ? (
                                    <CashboxSelect
                                        value={cashboxId}
                                        onChange={setCashboxId}
                                        required
                                        isRetail={false}
                                        helperText="Tutarın gireceği kasayı seçin (Perakende kasalar hariç)"
                                    />
                                ) : (
                                    <BankAccountSelect
                                        value={bankAccountId}
                                        onChange={setBankAccountId}
                                        required
                                        type="DEMAND_DEPOSIT"
                                        helperText="Tutarın gireceği vadesiz banka hesabını seçin"
                                    />
                                )}
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Notlar (Opsiyonel)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </Grid>

                            {collectionAction.isError && (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="error">İşlem sırasında bir hata oluştu: {(collectionAction.error as any)?.message || 'Bilinmeyen hata'}</Alert>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    disabled={!isFormValid || collectionAction.isPending}
                                >
                                    {collectionAction.isPending ? 'İşleniyor...' : 'Tahsilatı Kaydet'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
