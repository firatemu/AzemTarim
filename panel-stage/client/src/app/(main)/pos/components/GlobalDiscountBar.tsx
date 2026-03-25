'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { GlobalDiscount } from '../types/pos.types';

interface GlobalDiscountBarProps {
    discount: GlobalDiscount;
    cartSubtotal: number; // ürün indirimleri sonrası (globalDisc'in hesap tabanı)
    onApply: (type: 'pct' | 'amt', value: number) => void;
    onClear: () => void;
}

export function GlobalDiscountBar({
    discount,
    cartSubtotal,
    onApply,
    onClear,
}: GlobalDiscountBarProps) {
    const [inputVal, setInputVal] = useState(discount.value > 0 ? String(discount.value) : '');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Dışarıdan gelen discount değişirse input'u senkronize et
    useEffect(() => {
        setInputVal(discount.value > 0 ? String(discount.value) : '');
    }, [discount.value]);

    function handleTypeChange(type: 'pct' | 'amt') {
        const val = parseFloat(inputVal) || 0;
        onApply(type, val);
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        setInputVal(raw);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            let val = parseFloat(raw) || 0;
            if (discount.type === 'pct') val = Math.min(val, 100);
            if (discount.type === 'amt') val = Math.min(val, cartSubtotal);
            onApply(discount.type, val);
        }, 150);
    }

    function handleClear() {
        setInputVal('');
        onClear();
    }

    const activeTypeStyle: React.CSSProperties = {
        padding: '6px 14px',
        borderRadius: 8,
        border: '1px solid var(--amber)',
        background: 'var(--amber)',
        color: '#0a0c10',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .15s',
    };
    const inactiveTypeStyle: React.CSSProperties = {
        padding: '6px 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--muted)',
        fontWeight: 600,
        fontSize: 16,
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .15s',
    };

    const hasDiscount = discount.value > 0;

    return (
        <div
            style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            {/* Birinci satır: Başlık + Tür butonları */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Genel İndirim
                </span>

                {/* Tür butonları */}
                <button
                    style={discount.type === 'pct' ? activeTypeStyle : inactiveTypeStyle}
                    onClick={() => handleTypeChange('pct')}
                >
                    %
                </button>
                <button
                    style={discount.type === 'amt' ? activeTypeStyle : inactiveTypeStyle}
                    onClick={() => handleTypeChange('amt')}
                >
                    ₺
                </button>
            </div>

            {/* İkinci satır: Textarea + Sıfırla butonu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Değer inputu */}
                <textarea
                    value={inputVal}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setInputVal(val);

                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        debounceRef.current = setTimeout(() => {
                            let num = parseFloat(val) || 0;
                            if (discount.type === 'pct') num = Math.min(num, 100);
                            if (discount.type === 'amt') num = Math.min(num, cartSubtotal);
                            onApply(discount.type, num);
                        }, 150);
                    }}
                    placeholder="0"
                    rows={1}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '12px 16px',
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: 'var(--text)',
                        fontSize: 18,
                        fontWeight: 600,
                        fontFamily: "'DM Mono', monospace",
                        outline: 'none',
                        transition: 'border-color .15s',
                        resize: 'none',
                        overflow: 'hidden',
                        lineHeight: '1.4',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--amber)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />

                {/* Sıfırla */}
                <button
                    onClick={handleClear}
                    disabled={!hasDiscount}
                    style={{
                        padding: '10px 14px',
                        background: 'var(--surface3)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        color: hasDiscount ? 'var(--muted)' : 'var(--dim)',
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: hasDiscount ? 'pointer' : 'not-allowed',
                        opacity: hasDiscount ? 1 : 0.5,
                        transition: 'all .15s',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                        if (hasDiscount) {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    }}
                >
                    Sıfırla
                </button>
            </div>
        </div>
    );
}
