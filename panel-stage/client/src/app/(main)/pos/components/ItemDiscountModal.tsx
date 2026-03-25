'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@mui/material';
import type { CartItem } from '../types/pos.types';

interface ItemDiscountModalProps {
    open: boolean;
    item: CartItem | null;
    onClose: () => void;
    onApply: (productId: string, type: 'pct' | 'amt', value: number) => void;
}

const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

export function ItemDiscountModal({ open, item, onClose, onApply }: ItemDiscountModalProps) {
    const [discType, setDiscType] = useState<'pct' | 'amt'>('pct');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Modalı başlatırken mevcut indirimi doldur
    useEffect(() => {
        if (open && item) {
            setDiscType(item.discountType);
            setValue(item.discountValue > 0 ? String(item.discountValue) : '');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, item]);

    // Önizleme hesapla
    const numVal = parseFloat(value) || 0;
    const lineRaw = item ? item.quantity * item.unitPrice : 0;
    const discAmt =
        item && numVal > 0
            ? discType === 'pct'
                ? lineRaw * (numVal / 100)
                : Math.min(numVal * item.quantity, lineRaw)
            : 0;
    const lineNet = lineRaw - discAmt;
    const showPreview = numVal > 0 && item != null;

    function validate(): boolean {
        if (numVal <= 0) {
            setError('Geçerli bir değer girin');
            return false;
        }
        if (discType === 'pct' && numVal > 100) {
            setError('Yüzde 100\'den büyük olamaz');
            return false;
        }
        if (discType === 'amt' && item && numVal > item.unitPrice) {
            setError(`Tutar birim fiyatı aşamaz (${fmt(item.unitPrice)})`);
            return false;
        }
        setError('');
        return true;
    }

    function handleApply() {
        if (!item || !validate()) return;
        onApply(item.productId, discType, numVal);
        onClose();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleApply();
        if (e.key === 'Escape') onClose();
    }

    const tabActiveStyle: React.CSSProperties = {
        flex: 1,
        padding: '8px',
        borderRadius: '10px',
        border: '1px solid var(--amber)',
        background: 'var(--amber)',
        color: '#0a0c10',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .15s',
        textAlign: 'center',
    };
    const tabInactiveStyle: React.CSSProperties = {
        flex: 1,
        padding: '8px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface3)',
        color: 'var(--muted)',
        fontSize: 12.5,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .15s',
        textAlign: 'center',
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    background: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible',
                },
            }}
            BackdropProps={{
                sx: { backdropFilter: 'blur(4px)', background: 'var(--backdrop)' },
            }}
        >
            <style>{`
                .item-discount-modal-root {
                    --surface: #ffffff;
                    --surface2: #f3f6fb;
                    --surface3: #e9eef7;
                    --border: rgba(15, 23, 42, 0.10);
                    --text: #0f172a;
                    --muted: rgba(15, 23, 42, 0.62);
                    --shadow-lg: 0 24px 48px rgba(2, 6, 23, 0.16);
                    --backdrop: rgba(2, 6, 23, 0.48);
                    --amber: #f59e0b;
                    --red: #ef4444;
                }
            `}</style>
            <div
                className="item-discount-modal-root"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    width: 330,
                    boxShadow: 'var(--shadow-lg)',
                }}
                onKeyDown={handleKeyDown}
            >
                {/* Başlık */}
                <div
                    style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}
                >
                    Ürün İndirimi
                </div>
                <div
                    style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}
                >
                    İndirim türü ve miktarını seçin
                </div>

                {/* Ürün adı */}
                {item && (
                    <div
                        style={{
                            padding: '8px 10px',
                            background: 'var(--surface2)',
                            borderRadius: '10px',
                            fontSize: 12,
                            color: 'var(--muted)',
                            marginBottom: 14,
                            border: '1px solid var(--border)',
                        }}
                    >
                        {item.name}
                    </div>
                )}

                {/* Tür seçimi */}
                <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
                    <button
                        style={discType === 'pct' ? tabActiveStyle : tabInactiveStyle}
                        onClick={() => { setDiscType('pct'); setError(''); }}
                    >
                        Yüzdesel (%)
                    </button>
                    <button
                        style={discType === 'amt' ? tabActiveStyle : tabInactiveStyle}
                        onClick={() => { setDiscType('amt'); setError(''); }}
                    >
                        Tutar (₺)
                    </button>
                </div>

                {/* Input */}
                <div style={{ position: 'relative' }}>
                    <span
                        style={{
                            position: 'absolute',
                            left: 13,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 13,
                            color: 'var(--muted)',
                            fontFamily: "'DM Mono', monospace",
                            pointerEvents: 'none',
                        }}
                    >
                        {discType === 'pct' ? '%' : '₺'}
                    </span>
                    <input
                        ref={inputRef}
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError('');
                        }}
                        style={{
                            width: '100%',
                            padding: '12px 38px 12px 26px',
                            background: 'var(--surface2)',
                            border: `2px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                            borderRadius: '10px',
                            fontSize: 20,
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                            color: 'var(--text)',
                            textAlign: 'right',
                            outline: 'none',
                            transition: 'border-color .15s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            if (!error) e.currentTarget.style.borderColor = 'var(--amber)';
                        }}
                        onBlur={(e) => {
                            if (!error) e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            right: 13,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 13,
                            color: 'var(--muted)',
                            fontFamily: "'DM Mono', monospace",
                            pointerEvents: 'none',
                        }}
                    >
                        {discType === 'pct' ? '%' : '₺'}
                    </span>
                </div>

                {/* Hata */}
                {error && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5, paddingLeft: 4 }}>{error}</div>
                )}

                {/* Önizleme */}
                {showPreview && !error && (
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, paddingLeft: 2 }}>
                        {fmt(lineRaw)} → <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(lineNet)}</span>
                        <div style={{ marginTop: 2, fontSize: 10.5 }}>İndirim: {fmt(discAmt)}</div>
                    </div>
                )}

                {/* Aksiyonlar */}
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
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
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                        }}
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleApply}
                        style={{
                            flex: 1.5,
                            padding: '11px',
                            background: 'var(--amber)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#0a0c10',
                            fontSize: 13,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.filter = 'none';
                        }}
                    >
                        Uygula
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
