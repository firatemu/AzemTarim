'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Box, Typography, TextField, MenuItem, CircularProgress, Alert } from '@mui/material';
import axios from '@/lib/axios';
import type { PosPayment } from '../types/pos.types';

interface PaymentModalProps {
    open: boolean;
    method: 'cash' | 'credit_card' | 'transfer' | 'other' | null;
    remaining: number;
    cartTotal: number;
    onClose: () => void;
    onConfirm: (payment: PosPayment) => void;
}

const METHOD_LABELS: Record<string, string> = {
    cash: 'Nakit',
    credit_card: 'Kredi Kartı',
    transfer: 'Havale / EFT',
    other: 'Diğer',
};

const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export function PaymentModal({
    open,
    method,
    remaining,
    cartTotal,
    onClose,
    onConfirm,
}: PaymentModalProps) {
    const [display, setDisplay] = useState('0');
    const [errorMsg, setErrorMsg] = useState('');
    const [loadingPaymentSource, setLoadingPaymentSource] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<Array<{
        id: string;
        accountName: string;
        iban?: string | null;
        bank?: { name?: string | null };
    }>>([]);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
    const [installmentCount, setInstallmentCount] = useState('1');
    const [retailCashboxId, setRetailCashboxId] = useState('');

    const effectiveRemaining = remaining > 0 ? remaining : cartTotal;

    useEffect(() => {
        if (open) {
            setDisplay(effectiveRemaining.toFixed(2));
            setErrorMsg('');
            setSelectedBankAccountId('');
            setInstallmentCount('1');
            setBankAccounts([]);
            setRetailCashboxId('');
        }
    }, [open, effectiveRemaining]);

    useEffect(() => {
        if (!open || !method) return;

        let cancelled = false;
        async function loadPaymentSource() {
            try {
                setLoadingPaymentSource(true);
                setErrorMsg('');

                if (method === 'cash') {
                    const res = await axios.get('/pos/retail-cashbox');
                    const cashbox = res.data;
                    if (!cashbox?.id) {
                        setErrorMsg('Lütfen Perakende satış kasası tanımlayınız');
                        return;
                    }
                    if (!cancelled) {
                        setRetailCashboxId(cashbox.id);
                    }
                    return;
                }

                if (method === 'credit_card' || method === 'transfer') {
                    const accountType = method === 'credit_card' ? 'POS' : 'DEMAND_DEPOSIT';
                    const res = await axios.get('/pos/bank-accounts', {
                        params: { type: accountType },
                    });
                    const rawAccounts = Array.isArray(res.data) ? res.data : [];
                    const accounts = rawAccounts.map((acc: any) => ({
                        id: acc.id,
                        accountName: acc.accountName || acc.name || '',
                        iban: acc.iban ?? null,
                        bank: { name: acc.bank?.name || '' },
                    }));
                    if (!cancelled) {
                        setBankAccounts(accounts);
                        if (accounts.length === 0) {
                            setErrorMsg(method === 'credit_card'
                                ? 'POS hesabı bulunamadı'
                                : 'Vadesiz hesap bulunamadı');
                        }
                    }
                }
            } catch {
                if (!cancelled) {
                    setErrorMsg('Ödeme kaynakları yüklenemedi');
                }
            } finally {
                if (!cancelled) {
                    setLoadingPaymentSource(false);
                }
            }
        }

        void loadPaymentSource();
        return () => {
            cancelled = true;
        };
    }, [open, method]);

    const handleNp = useCallback((key: string) => {
        setDisplay((prev) => {
            if (key === 'C') return '0';
            if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0';
            if (key === '.') {
                if (prev.includes('.')) return prev;
                return prev + '.';
            }
            const dotIdx = prev.indexOf('.');
            if (dotIdx >= 0 && prev.length - dotIdx > 2) return prev;
            if (prev === '0') return key;
            return prev + key;
        });
        setErrorMsg('');
    }, []);

    useEffect(() => {
        if (!open) return;
        function onKeyDown(e: KeyboardEvent) {
            const k = e.key;
            if (k >= '0' && k <= '9') handleNp(k);
            else if (k === 'Backspace') handleNp('⌫');
            else if (k === 'Enter') handleConfirm();
            else if (k === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, handleNp]); // eslint-disable-line react-hooks/exhaustive-deps

    const baseChips = [50, 100, 200, 500].filter((a) => a >= effectiveRemaining);
    const chips = [...new Set([effectiveRemaining, ...baseChips])].filter((a) => a > 0).slice(0, 5);

    function handleConfirm() {
        if (!method) return;
        const amount = parseFloat(display);
        if (isNaN(amount) || amount <= 0) {
            setErrorMsg('Geçerli tutar girin');
            return;
        }
        const paid = effectiveRemaining;
        if (amount > paid + 0.001) {
            setErrorMsg('Toplam tutarı aşıyor');
            return;
        }

        if (method === 'cash' && !retailCashboxId) {
            setErrorMsg('Lütfen Perakende satış kasası tanımlayınız');
            return;
        }

        if ((method === 'credit_card' || method === 'transfer') && !selectedBankAccountId) {
            setErrorMsg('Lütfen banka hesabı seçin');
            return;
        }

        if (method === 'credit_card') {
            const parsedInstallment = Number(installmentCount);
            if (!Number.isInteger(parsedInstallment) || parsedInstallment < 1) {
                setErrorMsg('Taksit sayısı en az 1 olmalı');
                return;
            }
        }

        onConfirm({
            method,
            label: METHOD_LABELS[method] ?? method,
            amount,
            ...(method === 'cash' ? { cashboxId: retailCashboxId } : {}),
            ...(method === 'credit_card' || method === 'transfer'
                ? { bankAccountId: selectedBankAccountId }
                : {}),
            ...(method === 'credit_card' ? { installmentCount: Number(installmentCount) } : {}),
        });
        onClose();
    }

    const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '⌫'];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' },
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(4px)', background: 'var(--backdrop)' },
            }}
        >
            <style>{`
                .payment-modal-root {
                    --surface: #ffffff;
                    --surface2: #f3f6fb;
                    --surface3: #e9eef7;
                    --border: rgba(15, 23, 42, 0.10);
                    --text: #0f172a;
                    --muted: rgba(15, 23, 42, 0.62);
                    --accent: #4f46e5;
                    --accent-g: rgba(79, 70, 229, 0.10);
                    --accent-l: #6366f1;
                    --red: #ef4444;
                    --shadow-lg: 0 24px 48px rgba(2, 6, 23, 0.16);
                    --backdrop: rgba(2, 6, 23, 0.48);
                }
            `}</style>
            <div
                className="payment-modal-root"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    width: 'min(380px, 92vw)',
                    maxWidth: '92vw',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    {method ? METHOD_LABELS[method] : ''} Ödeme
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
                    Kalan: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(effectiveRemaining)}</span>
                </div>

                <div style={{ position: 'relative', marginBottom: 8 }}>
                    <span
                        style={{
                            position: 'absolute',
                            left: 13,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--muted)',
                            fontFamily: "'DM Mono', monospace",
                            pointerEvents: 'none',
                        }}
                    >
                        ₺
                    </span>
                    <input
                        readOnly
                        value={display}
                        style={{
                            width: '100%',
                            padding: '14px 13px 14px 30px',
                            background: 'var(--surface2)',
                            border: '2px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text)',
                            fontSize: 24,
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                            textAlign: 'right',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {(method === 'credit_card' || method === 'transfer') && (
                    <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 12, color: 'var(--muted)', mb: 0.5 }}>
                            {method === 'credit_card' ? 'POS Hesabı' : 'Vadesiz Hesap'}
                        </Typography>
                        {loadingPaymentSource ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--muted)', py: 0.5 }}>
                                <CircularProgress size={16} />
                                <span style={{ fontSize: 12.5 }}>Hesaplar yükleniyor...</span>
                            </Box>
                        ) : (
                            <TextField
                                select
                                size="small"
                                fullWidth
                                value={selectedBankAccountId}
                                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                            >
                                <MenuItem value="">Hesap seçin</MenuItem>
                                {bankAccounts.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>
                                        {(acc.bank?.name || 'Banka')} - {acc.accountName} {acc.iban ? `(${acc.iban})` : ''}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Box>
                )}

                {method === 'credit_card' && (
                    <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 12, color: 'var(--muted)', mb: 0.5 }}>
                            Taksit Sayısı
                        </Typography>
                        <TextField
                            size="small"
                            type="number"
                            fullWidth
                            value={installmentCount}
                            onChange={(e) => setInstallmentCount(e.target.value)}
                            inputProps={{ min: 1, step: 1 }}
                        />
                    </Box>
                )}

                {method === 'cash' && loadingPaymentSource && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--muted)', py: 0.5, mb: 1 }}>
                        <CircularProgress size={16} />
                        <span style={{ fontSize: 12.5 }}>Perakende satış kasası kontrol ediliyor...</span>
                    </Box>
                )}

                {errorMsg && (
                    <Alert severity="warning" sx={{ mb: 1.2 }}>
                        {errorMsg}
                    </Alert>
                )}

                {chips.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                        {chips.map((a) => (
                            <button
                                key={a}
                                onClick={() => {
                                    setDisplay(a.toFixed(2));
                                    setErrorMsg('');
                                }}
                                style={{
                                    padding: '7px 12px',
                                    background: 'var(--accent-g)',
                                    border: '1px solid var(--accent)',
                                    borderRadius: 20,
                                    color: 'var(--accent)',
                                    fontSize: 12,
                                    fontFamily: "'DM Mono', monospace",
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {fmt(a)}
                            </button>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 7,
                        marginBottom: 14,
                    }}
                >
                    {numpadKeys.map((k) => (
                        <button
                            key={k}
                            onClick={() => handleNp(k)}
                            style={{
                                padding: '12px 11px',
                                background: k === 'C' ? 'rgba(239, 68, 68, 0.08)' : 'var(--surface3)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                color: k === 'C' ? 'var(--red)' : 'var(--text)',
                                fontSize: 16,
                                fontWeight: 600,
                                fontFamily: "'DM Mono', monospace",
                                cursor: 'pointer',
                            }}
                        >
                            {k}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '11px',
                            background: 'var(--surface3)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--muted)',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loadingPaymentSource}
                        style={{
                            flex: 1.5,
                            padding: '11px',
                            background: 'var(--accent)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: loadingPaymentSource ? 'not-allowed' : 'pointer',
                            opacity: loadingPaymentSource ? 0.6 : 1,
                        }}
                    >
                        Ekle
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
