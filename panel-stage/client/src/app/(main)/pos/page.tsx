'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import MainLayout from '@/components/Layout/MainLayout';
import ProductGrid from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { ReceiptDialog } from './components/ReceiptDialog';
import PaymentDialog from './components/PaymentDialog';
import { usePosStore } from '@/stores/posStore';
import axios from '@/lib/axios';

// ─────────────────────────────────────────────────────────────────────────────
// Toast tipi
// ─────────────────────────────────────────────────────────────────────────────
interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar — saatli başlık çubuğu
// ─────────────────────────────────────────────────────────────────────────────
function PosTopbar() {
  const [clock, setClock] = useState('--:--');

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 52,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        gap: 14,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Marka */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--rs)',
          background: 'var(--accent)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px var(--accent-g)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <span style={{ color: 'var(--text)' }}>Oto<span style={{ color: 'var(--accent)' }}>Muhasebe</span></span>
      </div>

      {/* Ayırıcı */}
      <div style={{ width: 1, height: 20, background: 'var(--border)', opacity: 0.5 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', opacity: 0.8 }}>Hızlı Satış Ekranı</div>

      {/* Sağ taraf */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 12px',
            background: 'var(--accent-g)',
            border: '1px solid var(--accent)',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent)',
          }}
        >
          <div
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
          />
          VARSAYILAN AMBAR
        </div>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {clock}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POS Ana Sayfa
// ─────────────────────────────────────────────────────────────────────────────
export default function PosPage() {
  const store = usePosStore();
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function showToast(message: string, severity: ToastState['severity'] = 'info') {
    setToast({ open: true, message, severity });
  }

  // ── Barkod Tarayıcı Handler ─────────────────────────────────────────────
  const processBarcode = useCallback(
    async (barcode: string) => {
      if (!barcode.trim()) return;
      try {
        const res = await axios.get(`/pos/products/barcode/${encodeURIComponent(barcode)}`);
        const data: Array<{
          id: string;
          name: string;
          salePrice: number;
          vatRate: number;
          hasVariants?: boolean;
          productVariants?: unknown[];
          stock?: number;
        }> = Array.isArray(res.data) ? res.data : [res.data];

        if (data.length === 0) {
          showToast('Ürün bulunamadı', 'error');
          return;
        }

        const product = data[0];

        if (product.productVariants && product.productVariants.length > 0) {
          showToast('Varyantlı ürün — lütfen menüden seçin', 'info');
          return;
        }

        store.addToCart({
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.salePrice) || 0,
          vatRate: product.vatRate ?? 20,
          quantity: 1,
        });
        showToast(`${product.name} sepete eklendi`, 'success');
      } catch {
        showToast('Ürün bulunamadı', 'error');
      }
    },
    [store]
  );

  // ── Klavye dinleyici (Barkod) ────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          e.preventDefault();
          const b = bufferRef.current;
          bufferRef.current = '';
          processBarcode(b);
        }
        return;
      }

      if (e.key === 'Escape') {
        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        bufferRef.current += e.key;
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 0) {
            const b = bufferRef.current;
            bufferRef.current = '';
            processBarcode(b);
          }
          timeoutRef.current = null;
        }, 500);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [processBarcode]);

  // ── Receipt Dialog ────────────────────────────────────────────────────────
  // Checkout sonrası store boşaltıldığı için verileri ReceiptDialog'a prop olarak geçirmek yerine
  // dialog null data ile preview modunda açılır (fiş verisi completeCheckout'tan önce yakalanır)
  function handleReceiptClose() {
    store.setReceiptDialogOpen(false);
    store.clearCart();
  }

  return (
    <MainLayout>
      <div
        id="pos-root"
        style={{
          display: 'flex',
          flexDirection: 'column',
          // Header + TabBar yüksekliğini yaklaşık çıkarıyoruz.
          // Mobilde adres çubuğu dinamik olduğu için `100dvh` tercih edildi.
          height: 'calc(100dvh - 112px)',
          background: 'var(--bg)',
          color: 'var(--text)',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Topbar */}
        <PosTopbar />

        {/* Ana Bölünmüş Düzen */}
        <div className="pos-main-split" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sol: Ürün Kataloğu */}
          <div
            className="pos-left-panel"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid var(--border)',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            <ProductGrid />
          </div>

          {/* Sağ: Sepet */}
          <div
            className="pos-right-panel"
            style={{
              width: 520,
              maxWidth: '100%',
              flexBasis: 520,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <CartPanel />
          </div>
        </div>
      </div>

      {/* MUI Snackbar — barkod bildirimleri */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          sx={{ minWidth: 300, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          onClose={() => setToast((s) => ({ ...s, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={store.receiptDialogOpen}
        data={null}
        onClose={handleReceiptClose}
      />

      <PaymentDialog />

      {/* Global CSS değişkenleri ve tipografi */}
      <style>{`
        /* === POS THEME VARIABLES === */
        #pos-root {
          /* Light mode (POS follows app theme) */
          --bg: #f7fafc;
          --surface: #ffffff;
          --surface2: #f3f6fb;
          --surface3: #e9eef7;
          --border: rgba(15, 23, 42, 0.10);
          --border-h: rgba(79, 70, 229, 0.28);
          --text: #0f172a;
          --muted: rgba(15, 23, 42, 0.62);
          --dim: rgba(15, 23, 42, 0.42);
          --accent: #4f46e5;
          --accent-g: rgba(79, 70, 229, 0.10);
          --accent-l: #6366f1;
          --green: #10b981;
          --green-d: #eafff4;
          --amber: #f59e0b;
          --amber-d: #fff7e6;
          --red: #ef4444;
          --red-d: #fff1f1;
          --blue: #3b82f6;
          --blue-d: #edf4ff;
          --pink: #ec4899;
          --pink-d: #fff0f7;

          --shadow-sm: 0 1px 2px rgba(2, 6, 23, 0.06);
          --shadow-md: 0 10px 20px rgba(2, 6, 23, 0.10);
          --shadow-lg: 0 24px 48px rgba(2, 6, 23, 0.16);
          --backdrop: rgba(2, 6, 23, 0.48);

          --receipt-paper: #ffffff;
          --receipt-ink: #0f172a;
          --receipt-ink-muted: rgba(15, 23, 42, 0.60);
          --receipt-header: #0b1220;

          --r: 12px;
          --rs: 8px;
          --rl: 16px;
        }

        .dark #pos-root {
          /* Dark mode */
          --bg: #0b1220;
          --surface: #0f172a;
          --surface2: #111c32;
          --surface3: #162444;
          --border: rgba(148, 163, 184, 0.14);
          --border-h: rgba(99, 102, 241, 0.40);
          --text: rgba(241, 245, 249, 0.92);
          --muted: rgba(241, 245, 249, 0.62);
          --dim: rgba(241, 245, 249, 0.40);
          --accent: #7c7bff;
          --accent-g: rgba(124, 123, 255, 0.14);
          --accent-l: #9a99ff;
          --green-d: rgba(16, 185, 129, 0.14);
          --amber-d: rgba(245, 158, 11, 0.14);
          --red-d: rgba(239, 68, 68, 0.14);
          --blue-d: rgba(59, 130, 246, 0.14);
          --pink-d: rgba(236, 72, 153, 0.14);

          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.35);
          --shadow-md: 0 12px 22px rgba(0, 0, 0, 0.42);
          --shadow-lg: 0 32px 64px rgba(0, 0, 0, 0.60);
          --backdrop: rgba(0, 0, 0, 0.72);

          --receipt-paper: #0f172a;
          --receipt-ink: rgba(241, 245, 249, 0.92);
          --receipt-ink-muted: rgba(241, 245, 249, 0.62);
          --receipt-header: #070b14;
        }

        /* POS: masaüstünde 2 kolon, dar ekranlarda üst üste */
        .pos-main-split {
          width: 100%;
        }

        @media (max-width: 980px) {
          .pos-main-split {
            flex-direction: column;
          }

          .pos-left-panel {
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
          }

          .pos-right-panel {
            width: 100% !important;
            flex-basis: auto !important;
            flex: 1 1 auto !important;
          }
        }

        @media (min-width: 1280px) {
          .pos-right-panel {
            width: 620px !important;
            flex-basis: 620px !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
