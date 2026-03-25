'use client';

import React, { useState } from 'react';
import { TextField } from '@mui/material';
import axios from '@/lib/axios';
import { usePosStore } from '@/stores/posStore';
import { SelectorBox } from './SelectorBox';
import { CartItemRow } from './CartItemRow';
import { ItemDiscountModal } from './ItemDiscountModal';
import { GlobalDiscountBar } from './GlobalDiscountBar';
import { PaymentModal } from './PaymentModal';
import type { CartItem, PosPayment, SelectedPerson } from '../types/pos.types';
import { AxiosError } from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

// ─────────────────────────────────────────────────────────────────────────────
// SVG İkonları
// ─────────────────────────────────────────────────────────────────────────────
function EmptyBagIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: 'pos-spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CartPanel
// ─────────────────────────────────────────────────────────────────────────────
export function CartPanel() {
  const store = usePosStore();

  // Modal durumları
  const [discountItem, setDiscountItem] = useState<CartItem | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'transfer' | 'other' | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Snackbar callback (üst page.tsx'den gelecek yerine store'dan toast ref kullanılır)
  // CartPanel kendi toast'ını yönetir - basit implementasyon
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }

  // ── Müşteri Arama ─────────────────────────────────────────────────────────
  async function fetchCustomers(search: string): Promise<SelectedPerson[]> {
    try {
      const res = await axios.get('/account', {
        params: { search, limit: 20 },
      });
      const data = res.data?.data ?? res.data ?? [];
      return data.map((d: { id: string; code: string; title: string }) => ({
        id: d.id,
        code: d.code,
        title: d.title,
      }));
    } catch {
      return [];
    }
  }

  // ── Satış Elemanı Arama ───────────────────────────────────────────────────
  async function fetchSalespeople(search: string): Promise<SelectedPerson[]> {
    try {
      const res = await axios.get('/pos/sales-agents', {
        params: { search },
      });
      const data = res.data ?? [];
      return data.map((d: { id: string; fullName: string }) => ({
        id: d.id,
        code: '', // and code is optional/not needed for selection display
        title: d.fullName,
      }));
    } catch {
      return [];
    }
  }

  // ── İndirim Modal ─────────────────────────────────────────────────────────
  function openDiscountModal(productId: string) {
    const item = store.cart.find((i) => i.productId === productId);
    if (item) {
      setDiscountItem(item);
      setDiscountModalOpen(true);
    }
  }

  // ── Ödeme Modal ───────────────────────────────────────────────────────────
  function openPaymentModal(method: 'cash' | 'credit_card' | 'transfer' | 'other') {
    if (store.cart.length === 0) {
      showToast('Sepet boş', 'warning');
      return;
    }
    setPaymentMethod(method);
    setPaymentModalOpen(true);
  }

  function handlePaymentConfirm(payment: PosPayment) {
    store.addPayment(payment);
    showToast('Ödeme eklendi', 'success');
  }

  // ── Sepeti Temizle ────────────────────────────────────────────────────────
  function handleClearCart() {
    if (store.cart.length === 0) return;
    if (confirm('Sepet ve ödemeler temizlensin mi?')) {
      store.clearCart();
      showToast('Sepet temizlendi', 'info');
    }
  }

  // ── Ödeme Tamamla ─────────────────────────────────────────────────────────
  async function handleCheckout() {
    setLoading(true);
    try {
      await store.completeCheckout();
      showToast('Satış tamamlandı', 'success');
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message ?? err.message
          : err instanceof Error
            ? err.message
            : 'Satış tamamlanamadı';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Ödeme durumu ──────────────────────────────────────────────────────────
  const totalPaid = store.payments.reduce((s, p) => s + p.amount, 0);
  const grandTotal = store.cartTotals.grandTotal;
  const isFullyPaid = store.payments.length > 0 && Math.abs(totalPaid - grandTotal) < 0.01;
  const canComplete =
    store.cart.length > 0 &&
    store.selectedCustomer !== null &&
    isFullyPaid;

  // Ödeme butonu renk sınıfları
  const payBtnColor: Record<string, { border: string; bg: string; color: string }> = {
    cash: { border: 'var(--green)', bg: 'var(--green-d)', color: 'var(--green)' },
    credit_card: { border: 'var(--blue)', bg: 'var(--blue-d)', color: 'var(--blue)' },
    transfer: { border: 'var(--amber)', bg: 'var(--amber-d)', color: 'var(--amber)' },
    other: { border: 'var(--pink)', bg: 'var(--pink-d)', color: 'var(--pink)' },
  };

  function isMethodActive(method: string) {
    return store.payments.some((p) => p.method === method);
  }

  return (
    <div
      className="pos-cartpanel-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      <div className="pos-cartpanel-grid">
        {/* Sol Kolon: Seçiciler + Sepet + Not */}
        <div className="pos-cartpanel-col pos-cartpanel-col-left">
          {/* ── 1. Seçiciler ─────────────────────────────────────────────────── */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <SelectorBox
              label="Cari Hesap"
              placeholder="Cari hesap seçin..."
              value={store.selectedCustomer}
              onSelect={store.setSelectedCustomer}
              onClear={() => store.setSelectedCustomer(null)}
              fetchOptions={fetchCustomers}
              accentColor="accent"
              icon="person"
            />
            <SelectorBox
              label="Satış Elemanı"
              placeholder="Satış elemanı seçin..."
              value={store.selectedSalesperson}
              onSelect={store.setSelectedSalesperson}
              onClear={() => store.setSelectedSalesperson(null)}
              fetchOptions={fetchSalespeople}
              accentColor="pink"
              icon="salesperson"
            />
          </div>

          {/* ── 2. Sepet Öğeleri ─────────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--surface3) transparent',
            }}
          >
            {store.cart.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 10,
                  opacity: 0.25,
                }}
              >
                <EmptyBagIcon />
                <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>Sepet boş</div>
              </div>
            ) : (
              store.cart.map((item) => (
                <CartItemRow
                  key={item.productId + (item.variantId ?? '')}
                  item={item}
                  onQuantityChange={store.updateQuantity}
                  onRemove={store.removeFromCart}
                  onDiscountClick={openDiscountModal}
                />
              ))
            )}
          </div>

          {/* ── 3. Fatura Notu ────────────────────────────────────────────────── */}
          <div
            style={{
              padding: '10px 16px 14px',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <TextField
              multiline
              rows={1}
              maxRows={2}
              fullWidth
              placeholder="Fatura notu ekle..."
              value={store.cartNote}
              onChange={(e) => store.setCartNote(e.target.value)}
              size="small"
              id="pos-note-input"
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'var(--surface2)',
                  fontSize: 12.5,
                  color: 'var(--muted)',
                  fontFamily: "'DM Sans', sans-serif",
                  '& fieldset': { borderColor: 'var(--border)' },
                  '&:hover fieldset': { borderColor: 'var(--border-h)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--border-h)' },
                  '&.Mui-focused': { color: 'var(--text)' },
                },
                '& .MuiOutlinedInput-input': {
                  '&::placeholder': { color: 'var(--dim)', opacity: 1 },
                },
              }}
            />
          </div>
        </div>

        {/* Sağ Kolon: İndirim + Toplam + Ödeme + Tamamla */}
        <div className="pos-cartpanel-col pos-cartpanel-col-right">
          {/* ── 4. Genel İndirim Çubuğu ──────────────────────────────────────── */}
          <GlobalDiscountBar
            discount={store.globalDiscount}
            cartSubtotal={store.cartTotals.subtotal - store.cartTotals.itemDiscountTotal}
            onApply={store.applyGlobalDiscount}
            onClear={store.clearGlobalDiscount}
          />

          {/* ── 5. Toplamlar ─────────────────────────────────────────────────── */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              background: 'var(--surface2)',
            }}
          >
            {/* Ara toplam */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Ara toplam</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: 'var(--muted)' }}>
                {fmt(store.cartTotals.subtotal)}
              </span>
            </div>

            {/* İndirim (varsa) */}
            {store.cartTotals.totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ fontSize: 12.5, color: 'var(--amber)' }}>İndirim</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: 'var(--amber)' }}>
                  −{fmt(store.cartTotals.totalDiscount)}
                </span>
              </div>
            )}

            {/* KDV */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>KDV</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: 'var(--muted)' }}>
                {fmt(store.cartTotals.vatAmount)}
              </span>
            </div>

            {/* Genel toplam */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 7,
                paddingTop: 10,
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 650, color: 'var(--text)' }}>Genel Toplam</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                {fmt(store.cartTotals.grandTotal)}
              </span>
            </div>
          </div>

          {/* ── 6. Ödeme Yöntemleri ──────────────────────────────────────────── */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                marginBottom: 9,
              }}
            >
              Ödeme Yöntemi
            </div>

            {/* 2×2 ızgara */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {(
                [
                  {
                    method: 'cash' as const,
                    label: 'Nakit',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    ),
                  },
                  {
                    method: 'credit_card' as const,
                    label: 'Kredi Kartı',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    ),
                  },
                  {
                    method: 'transfer' as const,
                    label: 'Havale / EFT',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                      </svg>
                    ),
                  },
                  {
                    method: 'other' as const,
                    label: 'Diğer',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4l2 2" />
                      </svg>
                    ),
                  },
                ] as const
              ).map(({ method, label, icon }) => {
                const active = isMethodActive(method);
                const colors = payBtnColor[method];
                return (
                  <button
                    key={method}
                    onClick={() => openPaymentModal(method)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '11px 12px',
                      background: active ? colors.bg : 'var(--surface2)',
                      border: `1px solid ${active ? colors.border : 'var(--border)'}`,
                      borderRadius: 'var(--rs)',
                      cursor: 'pointer',
                      fontSize: 13.5,
                      fontWeight: 650,
                      color: active ? colors.color : 'var(--muted)',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-h)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                      }
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (store.cart.length === 0) {
                  showToast('Sepet boş', 'warning');
                  return;
                }
                store.setPaymentDialogOpen(true);
              }}
              style={{
                width: '100%',
                marginBottom: 10,
                padding: '10px 12px',
                borderRadius: 'var(--rs)',
                border: '1px dashed var(--border-h)',
                background: 'var(--surface2)',
                color: 'var(--muted)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Detaylı ödeme penceresi (çoklu / çek-senet / hediye kartı)
            </button>

            {/* Eklenmiş ödemeler listesi */}
            {store.payments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {store.payments.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--surface3)',
                      borderRadius: 'var(--rs)',
                      fontSize: 12.5,
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>{p.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 650,
                          color: 'var(--text)',
                        }}
                      >
                        {fmt(p.amount)}
                      </span>
                      <button
                        onClick={() => store.removePayment(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--dim)',
                          fontSize: 14,
                          padding: '0 2px',
                          transition: 'color .1s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Kalan / Ödeme tam badge */}
            {store.payments.length > 0 && grandTotal > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 11px',
                  borderRadius: 'var(--rs)',
                  marginTop: 8,
                  fontSize: 12.5,
                  background: isFullyPaid ? 'var(--green-d)' : 'var(--amber-d)',
                  border: isFullyPaid
                    ? '1px solid rgba(16,185,129,0.2)'
                    : '1px solid rgba(245,158,11,0.2)',
                  color: isFullyPaid ? 'var(--green)' : 'var(--amber)',
                }}
              >
                <span style={{ fontWeight: 650 }}>{isFullyPaid ? '✓ Ödeme tam' : 'Kalan tutar'}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 750 }}>
                  {isFullyPaid ? '' : fmt(store.remaining)}
                </span>
              </div>
            )}
          </div>

          {/* ── 7. Tamamla Bölümü ────────────────────────────────────────────── */}
          <div style={{ padding: '14px 16px', flexShrink: 0 }}>
            <button
              disabled={!canComplete || loading}
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: 16,
                background: canComplete ? 'var(--accent)' : 'var(--surface3)',
                border: 'none',
                borderRadius: 'var(--r)',
                color: '#fff',
                fontSize: 15.5,
                fontWeight: 750,
                fontFamily: "'DM Sans', sans-serif",
                cursor: canComplete && !loading ? 'pointer' : 'not-allowed',
                opacity: canComplete ? 1 : 0.3,
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (canComplete && !loading) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-l)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px var(--accent-g)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = canComplete
                  ? 'var(--accent)'
                  : 'var(--surface3)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? <SpinIcon /> : <CheckIcon />}
              {loading ? 'İşleniyor...' : 'Satışı Tamamla'}
            </button>

            {/* Aksiyon satırı */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {/* İndirim */}
              <button
                onClick={() => {
                  // GlobalDiscountBar'a odaklan (input ref olmadığı için toast ile yönlendir)
                  showToast('İndirim çubuğu aktif — tutarı girin', 'info');
                }}
                style={{
                  flex: 1,
                  padding: 10,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rs)',
                  color: 'var(--muted)',
                  fontSize: 12.5,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontWeight: 650,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-h)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 14 6-6" />
                  <circle cx="9.5" cy="9.5" r=".5" fill="currentColor" />
                  <circle cx="14.5" cy="14.5" r=".5" fill="currentColor" />
                </svg>
                İndirim
              </button>

              {/* Ön izle */}
              <button
                onClick={() => {
                  if (store.cart.length === 0) { showToast('Sepet boş', 'warning'); return; }
                  store.setReceiptDialogOpen(true);
                }}
                style={{
                  flex: 1,
                  padding: 10,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rs)',
                  color: 'var(--muted)',
                  fontSize: 12.5,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontWeight: 650,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-h)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Ön izle
              </button>

              {/* Temizle */}
              <button
                onClick={handleClearCart}
                style={{
                  flex: 1,
                  padding: 10,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rs)',
                  color: 'var(--muted)',
                  fontSize: 12.5,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontWeight: 650,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-d)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modaller ─────────────────────────────────────────────────────── */}
      <ItemDiscountModal
        open={discountModalOpen}
        item={discountItem}
        onClose={() => setDiscountModalOpen(false)}
        onApply={(productId, type, value) => {
          store.applyItemDiscount(productId, type, value);
          showToast('İndirim uygulandı', 'success');
        }}
      />

      <PaymentModal
        open={paymentModalOpen}
        method={paymentMethod}
        remaining={store.remaining}
        cartTotal={store.cartTotals.grandTotal}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            padding: '9px 16px',
            borderRadius: 'var(--r)',
            fontSize: 12.5,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: 'var(--shadow-md)',
            whiteSpace: 'nowrap',
            fontFamily: "'DM Sans', sans-serif",
            background:
              toast.type === 'success'
                ? 'var(--green)'
                : toast.type === 'error'
                  ? 'var(--red)'
                  : toast.type === 'warning'
                    ? 'var(--amber)'
                    : 'var(--accent)',
            color: toast.type === 'warning' ? '#1a1000' : '#fff',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── CSS Animasyonları ────────────────────────────────────────────── */}
      <style>{`
        @keyframes pos-spin { to { transform: rotate(360deg); } }

        /* Desktop: CartPanel 2-column layout inside right panel */
        .pos-cartpanel-grid {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        @media (min-width: 1280px) {
          .pos-cartpanel-root {
            background: var(--bg);
          }

          .pos-cartpanel-grid {
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 12px;
            padding: 12px;
            background: transparent;
          }

          .pos-cartpanel-col {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--rl);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}