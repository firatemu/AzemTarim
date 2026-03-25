'use client';

import React from 'react';
import { Dialog } from '@mui/material';
import { usePosStore } from '@/stores/posStore';

// ─────────────────────────────────────────────────────────────────────────────
// Tipler
// ─────────────────────────────────────────────────────────────────────────────
interface ReceiptItem {
    name: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    lineTotal: number;
}

interface ReceiptData {
    invoiceNumber: string;
    date: Date;
    customerName: string;
    salespersonName?: string;
    items: ReceiptItem[];
    subtotal: number;
    totalDiscount: number;
    vatAmount: number;
    grandTotal: number;
    payments: { label: string; amount: number }[];
    note?: string;
}

interface ReceiptDialogProps {
    open: boolean;
    data: ReceiptData | null;
    onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

// ─────────────────────────────────────────────────────────────────────────────
// ReceiptDialog
// ─────────────────────────────────────────────────────────────────────────────
export function ReceiptDialog({ open, data, onClose }: ReceiptDialogProps) {
    if (!data) return null;

    const dateStr = data.date.toLocaleDateString('tr-TR');
    const timeStr = data.date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' },
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(6px)', background: 'var(--backdrop)', zIndex: 300 },
            }}
        >
            <div
                style={{
                    background: 'var(--receipt-paper)',
                    color: 'var(--receipt-ink)',
                    // Mobilde taşmayı önle
                    width: 'min(310px, 92vw)',
                    maxWidth: '92vw',
                    borderRadius: 'var(--rl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* ── Başlık ─────────────────────────────────────────────────────── */}
                <div
                    style={{
                        background: 'var(--receipt-header)',
                        padding: 18,
                        textAlign: 'center',
                    }}
                >
                    <div style={{ color: 'var(--receipt-ink)', fontSize: 15, fontWeight: 700 }}>OtoMuhasebe</div>
                    <div style={{ color: 'var(--receipt-ink-muted)', fontSize: 10.5, marginTop: 2 }}>
                        {dateStr} {timeStr}
                    </div>
                    <div
                        style={{
                            color: 'var(--receipt-ink-muted)',
                            fontSize: 10,
                            fontFamily: "'DM Mono', monospace",
                            marginTop: 2,
                        }}
                    >
                        {data.invoiceNumber}
                    </div>
                </div>

                {/* ── Gövde ──────────────────────────────────────────────────────── */}
                <div style={{ padding: 14 }}>
                    {/* Müşteri */}
                    <div
                        style={{
                            fontSize: 11.5,
                            color: 'var(--receipt-ink-muted)',
                            marginBottom: 8,
                            paddingBottom: 6,
                            borderBottom: '1px dashed var(--border)',
                        }}
                    >
                        <strong style={{ color: 'var(--receipt-ink)' }}>Müşteri:</strong> {data.customerName}
                    </div>

                    {/* Ürünler */}
                    <div>
                        {data.items.map((it, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '4px 0',
                                    fontSize: 11.5,
                                    borderBottom: '1px dashed var(--border)',
                                }}
                            >
                                <span>
                                    {it.name} ×{it.quantity}
                                    {it.discountAmount > 0 && (
                                        <span style={{ color: 'var(--amber)', fontSize: 10 }}>
                                            {' '}(−{fmt(it.discountAmount)})
                                        </span>
                                    )}
                                </span>
                                <span>{fmt(it.lineTotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* İndirim (varsa) */}
                    {data.totalDiscount > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '4px 0',
                                fontSize: 11.5,
                                color: 'var(--amber)',
                            }}
                        >
                            <span>İndirim</span>
                            <span>−{fmt(data.totalDiscount)}</span>
                        </div>
                    )}

                    {/* KDV */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            fontSize: 11.5,
                            color: 'var(--receipt-ink-muted)',
                        }}
                    >
                        <span>KDV</span>
                        <span>{fmt(data.vatAmount)}</span>
                    </div>

                    {/* Toplam */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '9px 0 5px',
                            fontSize: 15,
                            fontWeight: 700,
                            borderTop: '2px solid var(--receipt-ink)',
                            marginTop: 3,
                        }}
                    >
                        <span>TOPLAM</span>
                        <span>{fmt(data.grandTotal)}</span>
                    </div>

                    {/* Ödemeler */}
                    <div style={{ marginTop: 9, fontSize: 11.5, color: 'var(--receipt-ink-muted)' }}>
                        {data.payments.map((p, idx) => (
                            <div
                                key={idx}
                                style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}
                            >
                                <span>{p.label}</span>
                                <span>{fmt(p.amount)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Not */}
                    {data.note && (
                        <div
                            style={{
                                marginTop: 7,
                                fontSize: 11,
                                color: 'var(--dim)',
                                fontStyle: 'italic',
                            }}
                        >
                            Not: {data.note}
                        </div>
                    )}

                    {/* Satış Elemanı */}
                    {data.salespersonName && (
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--dim)' }}>
                            Satış El.: {data.salespersonName}
                        </div>
                    )}
                </div>

                {/* ── Alt Kısım ──────────────────────────────────────────────────── */}
                <div style={{ padding: '10px 14px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--dim)', marginBottom: 7 }}>
                        Teşekkür ederiz
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '9px 22px',
                            background: 'var(--receipt-header)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 7,
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            marginTop: 6,
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--receipt-header) 82%, var(--receipt-ink) 18%)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--receipt-header)';
                        }}
                    >
                        Yeni Satış Başlat
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Store entegrasyonlu ReceiptDialog wrapper'ı
// pos/page.tsx'den kolayca kullanılabilir
// ─────────────────────────────────────────────────────────────────────────────
export function PosReceiptDialog() {
    const store = usePosStore();

    // Store verileri yoksa gösterme
    const data: ReceiptData | null = null; // Checkout sonrası doldurulacak

    function handleClose() {
        store.setReceiptDialogOpen(false);
        store.clearCart();
    }

    return (
        <ReceiptDialog
            open={store.receiptDialogOpen}
            data={data}
            onClose={handleClose}
        />
    );
}
