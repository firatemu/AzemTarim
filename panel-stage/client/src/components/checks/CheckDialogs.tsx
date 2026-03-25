'use client';

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Button, TextField, Typography, Alert, CircularProgress,
    Box, MenuItem, Divider, Grid, Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { CheckBill, CheckBillStatus } from '@/types/check-bill';
import { formatDate, formatAmount } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/labels';
import { TURKISH_BANKS } from '@/constants/bankalar';

/**
 * Silme Onay Dialogu
 * Herhangi bir kayıt için yeniden kullanılabilir onay isteğe bağlı uyarı içerir.
 */
interface DeleteConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, title, description, loading, onCancel, onConfirm }: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="error" />
                {title ?? 'Silme Onayı'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {description ?? 'Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>Vazgeç</Button>
                <Button variant="contained" color="error" startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />} onClick={onConfirm} disabled={loading}>
                    {loading ? 'Siliniyor...' : 'Sil'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * Evrak Durum Değişiklik Dialogu (İade, İptal, Portföye Al vb.)
 */
interface CheckStatusActionDialogProps {
    open: boolean;
    check: CheckBill | null;
    targetStatus: CheckBillStatus | null;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: (notes: string) => void;
}

const STATUS_ACTION_LABEL: Partial<Record<CheckBillStatus, { label: string; color: 'warning' | 'error' | 'info' | 'success' }>> = {
    [CheckBillStatus.RETURNED]: { label: 'İade Et', color: 'warning' },
    [CheckBillStatus.IN_PORTFOLIO]: { label: 'Portföye Al', color: 'info' },
    [CheckBillStatus.WITHOUT_COVERAGE]: { label: 'Karşılıksız İşle', color: 'error' },
    [CheckBillStatus.PROTESTED]: { label: 'Protesto Et', color: 'error' },
};

export function CheckStatusActionDialog({ open, check, targetStatus, loading, onCancel, onConfirm }: CheckStatusActionDialogProps) {
    const [notes, setNotes] = useState('');

    const actionInfo = targetStatus ? STATUS_ACTION_LABEL[targetStatus] : null;

    const handleConfirm = () => {
        onConfirm(notes);
        setNotes('');
    };

    const handleCancel = () => {
        setNotes('');
        onCancel();
    };

    if (!check || !targetStatus) return null;

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
            <DialogTitle>{actionInfo?.label ?? STATUS_LABEL[targetStatus]}</DialogTitle>
            <DialogContent>
                <Alert severity={actionInfo?.color ?? 'info'} sx={{ mb: 2 }}>
                    <strong>{check.checkNo || '-'}</strong> numaralı evrakın durumu{' '}
                    <strong>{STATUS_LABEL[check.status]}</strong> → <strong>{STATUS_LABEL[targetStatus]}</strong>{' '}
                    olarak değiştirilecektir.
                </Alert>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Vade Tarihi</Typography>
                        <Typography variant="body2">{formatDate(check.dueDate)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Tutar</Typography>
                        <Typography variant="body2" fontWeight="bold">{formatAmount(check.amount)}</Typography>
                    </Grid>
                </Grid>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Açıklama / Not (İsteğe Bağlı)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mt: 2 }}
                    placeholder="İşlem hakkında not ekleyebilirsiniz..."
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleCancel} disabled={loading}>Vazgeç</Button>
                <Button
                    variant="contained"
                    color={actionInfo?.color === 'error' ? 'error' : actionInfo?.color === 'warning' ? 'warning' : 'primary'}
                    onClick={handleConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                >
                    {loading ? 'İşleniyor...' : (actionInfo?.label ?? 'Onayla')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * Evrak Düzenleme Dialogu
 * Çek/Senet bilgilerini (banka, no, vade, not) günceller.
 */
interface CheckEditDialogProps {
    open: boolean;
    check: CheckBill | null;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: (data: { checkNo?: string; bank?: string; branch?: string; accountNo?: string; dueDate?: string; notes?: string; amount?: number }) => void;
}

export function CheckEditDialog({ open, check, loading, onCancel, onConfirm }: CheckEditDialogProps) {
    const [form, setForm] = useState<{ checkNo: string; bank: string; branch: string; accountNo: string; notes: string; dueDate: string; amount: string }>({
        checkNo: '',
        bank: '',
        branch: '',
        accountNo: '',
        notes: '',
        dueDate: '',
        amount: '',
    });

    React.useEffect(() => {
        if (check) {
            setForm({
                checkNo: check.checkNo ?? '',
                bank: check.bank ?? '',
                branch: check.branch ?? '',
                accountNo: check.accountNo ?? '',
                notes: check.notes ?? '',
                dueDate: check.dueDate ? new Date(check.dueDate).toISOString().split('T')[0] : '',
                amount: check.amount !== undefined ? String(check.amount) : '',
            });
        }
    }, [check]);

    const handleConfirm = () => {
        onConfirm({
            checkNo: form.checkNo || undefined,
            bank: form.bank || undefined,
            branch: form.branch || undefined,
            accountNo: form.accountNo || undefined,
            notes: form.notes || undefined,
            dueDate: form.dueDate || undefined,
            amount: form.amount ? Number(form.amount) : undefined,
        });
    };

    if (!check) return null;

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Evrak Düzenle</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="Çek / Senet No"
                                value={form.checkNo}
                                onChange={(e) => setForm((f) => ({ ...f, checkNo: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Vade Tarihi"
                                value={form.dueDate}
                                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Tutar"
                                value={form.amount}
                                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Autocomplete
                                freeSolo
                                options={TURKISH_BANKS}
                                value={form.bank}
                                onChange={(_, newValue) => setForm((f) => ({ ...f, bank: newValue || '' }))}
                                onInputChange={(_, newInputValue) => setForm((f) => ({ ...f, bank: newInputValue }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="Banka" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="Şube"
                                value={form.branch}
                                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Hesap No"
                                value={form.accountNo}
                                onChange={(e) => setForm((f) => ({ ...f, accountNo: e.target.value }))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Notlar"
                                value={form.notes}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} disabled={loading}>Vazgeç</Button>
                <Button variant="contained" onClick={handleConfirm} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
