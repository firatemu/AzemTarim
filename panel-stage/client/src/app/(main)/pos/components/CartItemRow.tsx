'use client';

import React, { memo } from 'react';
import type { CartItem } from '../types/pos.types';

interface CartItemRowProps {
    item: CartItem;
    onQuantityChange: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
    onDiscountClick: (productId: string) => void;
}

const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

export const CartItemRow = memo(function CartItemRow({
    item,
    onQuantityChange,
    onRemove,
    onDiscountClick,
}: CartItemRowProps) {
    const lineRaw = item.quantity * item.unitPrice;
    const lineNet = lineRaw - item.discountAmount;
    const hasDiscount = item.discountValue > 0;

    const discLabel = hasDiscount
        ? item.discountType === 'pct'
            ? `${item.discountValue}%`
            : `−${fmt(item.discountValue)}`
        : '+ İndirim';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                transition: 'background .1s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
        >
            {/* Sol: isim + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {item.name}
                    {item.variantName && (
                        <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                            {' '}· {item.variantName}
                        </span>
                    )}
                </div>
            </div>

            {/* Ortada: Birim Fiyat ve İndirim */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingRight: 12 }}>
                <span
                    style={{
                        fontSize: 14,
                        color: 'var(--muted)',
                        fontFamily: "'DM Mono', monospace",
                    }}
                >
                    {fmt(item.unitPrice)}
                </span>
                <span
                    onClick={() => onDiscountClick(item.productId)}
                    title="İndirim uygula"
                    style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: hasDiscount
                            ? '1px solid rgba(245,158,11,0.2)'
                            : '1px solid transparent',
                        background: hasDiscount ? 'var(--amber-d)' : 'transparent',
                        color: hasDiscount ? 'var(--amber)' : 'var(--muted)',
                        opacity: hasDiscount ? 1 : 0.4,
                        fontWeight: hasDiscount ? 600 : 400,
                        transition: 'all .15s',
                        userSelect: 'none',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.background = 'var(--amber)';
                        (e.currentTarget as HTMLSpanElement).style.color = '#0a0c10';
                        (e.currentTarget as HTMLSpanElement).style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.background = hasDiscount
                            ? 'var(--amber-d)'
                            : 'transparent';
                        (e.currentTarget as HTMLSpanElement).style.color = hasDiscount
                            ? 'var(--amber)'
                            : 'var(--muted)';
                        (e.currentTarget as HTMLSpanElement).style.opacity = hasDiscount ? '1' : '0.4';
                    }}
                >
                    {discLabel}
                </span>
            </div>

            {/* Adet kontrolleri */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                    onClick={() => onQuantityChange(item.productId, -1)}
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--surface3)',
                        color: 'var(--muted)',
                        fontSize: 16,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                    }}
                >
                    −
                </button>

                <span
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 15,
                        fontWeight: 600,
                        minWidth: 24,
                        textAlign: 'center',
                        color: 'var(--text)',
                    }}
                >
                    {item.quantity}
                </span>

                <button
                    onClick={() => onQuantityChange(item.productId, 1)}
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--surface3)',
                        color: 'var(--muted)',
                        fontSize: 16,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                    }}
                >
                    +
                </button>
            </div>

            {/* Satır tutarı */}
            <div
                style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 15,
                    fontWeight: 600,
                    minWidth: 70,
                    textAlign: 'right',
                    flexShrink: 0,
                }}
            >
                {hasDiscount && (
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--dim)',
                            textDecoration: 'line-through',
                            lineHeight: 1.2,
                        }}
                    >
                        {fmt(lineRaw)}
                    </div>
                )}
                <div style={{ color: 'var(--text)' }}>{fmt(lineNet)}</div>
            </div>

            {/* Sil butonu */}
            <button
                onClick={() => onRemove(item.productId)}
                style={{
                    width: 26,
                    height: 26,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: 6,
                    transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-d)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)';
                }}
            >
                <TrashIcon />
            </button>
        </div>
    );
});
