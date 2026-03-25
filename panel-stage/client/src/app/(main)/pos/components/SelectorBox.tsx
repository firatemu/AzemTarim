'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SelectedPerson } from '../types/pos.types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface SelectorBoxProps {
    label: string;
    placeholder: string;
    value: SelectedPerson | null;
    onSelect: (person: SelectedPerson) => void;
    onClear: () => void;
    fetchOptions: (search: string) => Promise<SelectedPerson[]>;
    accentColor?: 'accent' | 'pink';
    icon: 'person' | 'salesperson';
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG İkonları
// ─────────────────────────────────────────────────────────────────────────────
function PersonIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function SalespersonIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton satır
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div
            style={{
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                animation: 'pos-pulse 1.2s ease-in-out infinite',
            }}
        >
            <div
                style={{
                    height: 10,
                    width: '60%',
                    background: 'var(--surface3)',
                    borderRadius: 3,
                }}
            />
            <div
                style={{
                    height: 8,
                    width: '30%',
                    background: 'var(--surface3)',
                    borderRadius: 3,
                }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SelectorBox
// ─────────────────────────────────────────────────────────────────────────────
export function SelectorBox({
    label,
    placeholder,
    value,
    onSelect,
    onClear,
    fetchOptions,
    accentColor = 'accent',
    icon,
}: SelectorBoxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<SelectedPerson[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Dışarı tıklayınca kapat
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Açılınca boş arama yap ve input'a odaklan
    useEffect(() => {
        if (open) {
            setQuery('');
            doFetch('');
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const doFetch = useCallback(
        async (q: string) => {
            setLoading(true);
            try {
                const result = await fetchOptions(q);
                setOptions(result);
            } catch {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        },
        [fetchOptions]
    );

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const q = e.target.value;
        setQuery(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doFetch(q), 300);
    }

    function handleSelect(person: SelectedPerson) {
        onSelect(person);
        setOpen(false);
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation();
        onClear();
    }

    const hasValue = value !== null;
    const accentBorder = accentColor === 'pink' ? 'var(--pink)' : 'var(--accent)';
    const accentBg = accentColor === 'pink' ? 'var(--pink-d)' : 'var(--accent-g)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Üst etiket */}
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </div>

            {/* Ana kutu */}
            <div ref={containerRef} style={{ position: 'relative' }}>
                <div
                    onClick={() => setOpen((o) => !o)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '7px 10px',
                        background: hasValue ? accentBg : 'var(--surface2)',
                        border: `1px solid ${hasValue ? accentBorder : 'var(--border)'}`,
                        borderRadius: 'var(--rs)',
                        cursor: 'pointer',
                        transition: 'border-color .15s',
                    }}
                    onMouseEnter={(e) => {
                        if (!hasValue)
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-h)';
                    }}
                    onMouseLeave={(e) => {
                        if (!hasValue)
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                    }}
                >
                    <span style={{ color: 'var(--muted)', flexShrink: 0, display: 'flex' }}>
                        {icon === 'person' ? <PersonIcon /> : <SalespersonIcon />}
                    </span>

                    <span
                        style={{
                            flex: 1,
                            fontSize: 12.5,
                            color: hasValue ? 'var(--text)' : 'var(--muted)',
                            fontWeight: hasValue ? 500 : 400,
                            userSelect: 'none',
                        }}
                    >
                        {hasValue ? value.title : placeholder}
                    </span>

                    {hasValue && (
                        <button
                            onClick={handleClear}
                            style={{
                                width: 17,
                                height: 17,
                                borderRadius: '50%',
                                background: 'var(--surface3)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--muted)',
                                fontSize: 11,
                                flexShrink: 0,
                                transition: 'all .15s',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-d)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface3)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Dropdown */}
                {open && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--rs)',
                            zIndex: 100,
                            maxHeight: 180,
                            overflowY: 'auto',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        {/* Arama inputu */}
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={handleSearchChange}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Ara..."
                            style={{
                                width: '100%',
                                padding: '7px 9px',
                                background: 'var(--surface3)',
                                border: 'none',
                                borderBottom: '1px solid var(--border)',
                                color: 'var(--text)',
                                fontSize: 12,
                                fontFamily: "'DM Sans', sans-serif",
                                outline: 'none',
                            }}
                        />

                        {/* Seçenekler */}
                        {loading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : options.length === 0 ? (
                            <div
                                style={{
                                    padding: '10px',
                                    fontSize: 12,
                                    color: 'var(--muted)',
                                    textAlign: 'center',
                                }}
                            >
                                Sonuç bulunamadı
                            </div>
                        ) : (
                            options.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => handleSelect(opt)}
                                    style={{
                                        padding: '7px 10px',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'background .1s',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{opt.title}</span>
                                    <span
                                        style={{
                                            fontSize: 10.5,
                                            color: 'var(--muted)',
                                            fontFamily: "'DM Mono', monospace",
                                        }}
                                    >
                                        {opt.code}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Pulse animasyonu */}
            <style>{`
        @keyframes pos-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
