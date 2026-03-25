'use client';

import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { QrCode } from '@/lib/qrcodegen';

export interface ReceiptItem {
    name: string;
    quantity: number;
    unitPrice: number;
    originalPrice: number | null;
    discountRate: number | null;
    lineTotal: number;
}

export interface ReceiptData {
    companyName: string;
    companySubtitle: string;
    date: string;
    time: string;
    cashRegister: string;
    documentNo: string;
    currentAccount: string | null;
    items: ReceiptItem[];
    subtotal: number;
    generalDiscount: number | null;
    generalDiscountRate: number | null;
    vatAmount: number;
    vatRate: number;
    grandTotal: number;
    paymentMethod: string;
    amountPaid: number | null;
    companyFullName: string;
    address: string;
    phone: string;
}

interface ReceiptSlipProps {
    data: ReceiptData;
}

const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
};

export const ReceiptSlip: React.FC<ReceiptSlipProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !data.documentNo) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const text = data.documentNo;
        const cell = 3;
        const quiet = 2;

        try {
            // @ts-ignore
            const qr = QrCode.encodeText(text, QrCode.Ecc.MEDIUM);
            const n = qr.size + quiet * 2;
            canvas.width = n * cell;
            canvas.height = n * cell;

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';

            for (let r = 0; r < qr.size; r++) {
                for (let c = 0; c < qr.size; c++) {
                    if (qr.getModule(c, r)) {
                        ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
                    }
                }
            }
        } catch (e) {
            console.error('QR generation failed', e);
            canvas.style.display = 'none';
        }
    }, [data.documentNo]);

    return (
        <>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

                .receipt-container {
                    --paper: #ffffff;
                    --ink: #000000;
                    --ink-light: #000000;
                    --ink-faint: #999999;
                    --receipt-width: 302px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: 'IBM Plex Mono', monospace;
                }

                .tear-top {
                    width: var(--receipt-width);
                    height: 14px;
                    background: var(--paper);
                    clip-path: polygon(
                        0% 100%, 2.5% 0%, 5% 100%, 7.5% 0%, 10% 100%, 12.5% 0%,
                        15% 100%, 17.5% 0%, 20% 100%, 22.5% 0%, 25% 100%, 27.5% 0%,
                        30% 100%, 32.5% 0%, 35% 100%, 37.5% 0%, 40% 100%, 42.5% 0%,
                        45% 100%, 47.5% 0%, 50% 100%, 52.5% 0%, 55% 100%, 57.5% 0%,
                        60% 100%, 62.5% 0%, 65% 100%, 67.5% 0%, 70% 100%, 72.5% 0%,
                        75% 100%, 77.5% 0%, 80% 100%, 82.5% 0%, 85% 100%, 87.5% 0%,
                        90% 100%, 92.5% 0%, 95% 100%, 97.5% 0%, 100% 100%
                    );
                }

                .tear-bottom {
                    width: var(--receipt-width);
                    height: 14px;
                    background: var(--paper);
                    clip-path: polygon(
                        0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%,
                        15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%,
                        30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%,
                        45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%,
                        60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%,
                        75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%,
                        90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%
                    );
                }

                .receipt-body-wrapper {
                    width: var(--receipt-width);
                    background: var(--paper);
                    font-size: 8px;
                    color: var(--ink);
                    line-height: 1.45;
                }

                .receipt-header {
                    background: #000;
                    color: #fff;
                    padding: 13px 14px 11px;
                    text-align: center;
                }

                .company-name {
                    font-family: 'IBM Plex Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }

                .company-sub {
                    font-size: 6.5px;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.85);
                    text-transform: uppercase;
                    margin-bottom: 9px;
                }

                .header-rule {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.15);
                    margin: 0 0 8px;
                }

                .header-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    font-size: 6.5px;
                    color: rgba(255,255,255,0.9);
                    letter-spacing: 0.3px;
                    margin-bottom: 9px;
                }
                .header-grid span:nth-child(2) { text-align: center; }
                .header-grid span:nth-child(3) { text-align: right; }

                .bilgi-fisi-badge {
                    display: inline-block;
                    background: #fff;
                    color: #000;
                    font-family: 'IBM Plex Sans', sans-serif;
                    font-size: 7.5px;
                    font-weight: 700;
                    letter-spacing: 3.5px;
                    text-transform: uppercase;
                    padding: 3px 12px;
                    border-radius: 2px;
                }

                .receipt-content { padding: 11px 13px; }

                .info-section { margin-bottom: 9px; }
                .info-row { display: flex; justify-content: space-between; font-size: 7.5px; line-height: 1.7; }
                .info-row .lbl { color: var(--ink-light); font-size: 6.5px; text-transform: uppercase; letter-spacing: 0.4px; flex-shrink: 0; min-width: 76px; }
                .info-row .val { text-align: right; font-weight: 600; color: var(--ink); }

                .dash { border: none; border-top: 1px dashed var(--ink-faint); margin: 8px 0; }

                .sec-label { font-size: 6.5px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-light); margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
                .sec-label::after { content: ''; flex: 1; height: 1px; background: #ddd; }

                .items-header { display: grid; grid-template-columns: 1fr 24px 50px 50px; gap: 2px; font-size: 6px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink-light); padding-bottom: 4px; border-bottom: 1px solid #ddd; margin-bottom: 5px; }
                .items-header span:not(:first-child) { text-align: right; }

                .item-row { margin-bottom: 7px; }
                .item-top { font-size: 8px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 4px; margin-bottom: 1px; }
                .discount-tag { font-size: 6px; font-weight: 700; border: 1px solid #000; padding: 0 2px; border-radius: 1px; letter-spacing: 0.3px; line-height: 1.4; }
                .item-detail { display: grid; grid-template-columns: 1fr 24px 50px 50px; gap: 2px; font-size: 7px; color: var(--ink); }
                .item-detail span:not(:first-child) { text-align: right; }
                .strike { text-decoration: line-through; color: var(--ink-faint); font-size: 6.5px; }

                .total-row { display: flex; justify-content: space-between; font-size: 7.5px; color: var(--ink); line-height: 1.85; }
                .total-row .tl { font-size: 6.5px; text-transform: uppercase; letter-spacing: 0.4px; }
                .total-row .tv { font-weight: 600; color: var(--ink); }

                .grand-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 5px; padding-top: 7px; border-top: 2px solid #000; }
                .grand-lbl { font-family: 'IBM Plex Sans', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
                .grand-amt { font-family: 'IBM Plex Sans', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }

                .pay-box { border: 1px solid #000; padding: 7px 9px; margin-top: 9px; }
                .pay-box-title { font-size: 6px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-light); margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px dashed #ddd; }
                .pay-row { display: flex; justify-content: space-between; font-size: 7.5px; line-height: 1.7; }
                .pay-row .pl { color: var(--ink); }
                .pay-row .pv { font-weight: 700; }

                .receipt-footer { border-top: 1px dashed #ccc; padding: 10px 13px 14px; text-align: center; }
                .qr-wrap { display: flex; flex-direction: column; align-items: center; margin: 4px 0 11px; }
                #qr-canvas { display: block; image-rendering: pixelated; }
                .qr-label { font-size: 6.5px; color: var(--ink-light); letter-spacing: 2px; margin-top: 5px; font-family: 'IBM Plex Mono', monospace; }
                .footer-company { font-size: 7px; color: var(--ink); line-height: 1.8; margin-bottom: 9px; }
                .footer-company strong { font-family: 'IBM Plex Sans', sans-serif; font-size: 8px; font-weight: 700; color: var(--ink); letter-spacing: 0.5px; display: block; margin-bottom: 1px; }
                .footer-disclaimer { font-size: 6.5px; color: var(--ink-light); line-height: 1.8; border-top: 1px dashed #ccc; padding-top: 8px; font-style: italic; }
                .footer-bye { font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-top: 11px; color: var(--ink); }
                
                @media print {
                    .receipt-container { margin: 0; padding: 0; box-shadow: none; }
                    .tear-top, .tear-bottom { display: none !important; }
                }
            `}</style>

            <div className="receipt-container" id="printable-receipt">
                <div className="tear-top"></div>

                <div className="receipt-body-wrapper">
                    {/* HEADER */}
                    <div className="receipt-header">
                        <div className="company-name">{data.companyName}</div>
                        <div className="company-sub">{data.companySubtitle}</div>
                        <hr className="header-rule" />
                        <div className="header-grid">
                            <span>{data.date}</span>
                            <span>{data.time}</span>
                            <span>{data.cashRegister}</span>
                        </div>
                        <div className="bilgi-fisi-badge">BİLGİ FİŞİ</div>
                    </div>

                    {/* BODY */}
                    <div className="receipt-content">
                        <div className="info-section">
                            {data.currentAccount && (
                                <div className="info-row">
                                    <span className="lbl">Cari Hesap</span>
                                    <span className="val">{data.currentAccount}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="lbl">Belge No</span>
                                <span className="val">{data.documentNo}</span>
                            </div>
                        </div>

                        <hr className="dash" />

                        <div className="sec-label">Ürünler</div>

                        <div className="items-header">
                            <span>Ürün Adı</span>
                            <span>Adet</span>
                            <span>Birim</span>
                            <span>Toplam</span>
                        </div>

                        {data.items.map((item, index) => (
                            <div className="item-row" key={index}>
                                <div className="item-top">
                                    {item.name} {item.discountRate != null && <span className="discount-tag">%{(item.discountRate).toFixed(0)}</span>}
                                </div>
                                <div className="item-detail">
                                    <span></span>
                                    <span>{item.quantity}</span>
                                    <span>
                                        {item.originalPrice != null && <span className="strike">{formatCurrency(item.originalPrice)}</span>}{' '}
                                        {formatCurrency(item.unitPrice)}
                                    </span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(item.lineTotal)}</span>
                                </div>
                            </div>
                        ))}

                        <hr className="dash" />

                        <div className="total-row">
                            <span className="tl">Ara Toplam</span>
                            <span className="tv">{formatCurrency(data.subtotal)}</span>
                        </div>

                        {data.generalDiscount != null && data.generalDiscount > 0 && (
                            <div className="total-row">
                                <span className="tl">Genel İndirim {data.generalDiscountRate ? `(%${data.generalDiscountRate})` : ''}</span>
                                <span className="tv">−{formatCurrency(data.generalDiscount)}</span>
                            </div>
                        )}

                        <div className="total-row">
                            <span className="tl">KDV (%{data.vatRate})</span>
                            <span className="tv">{formatCurrency(data.vatAmount)}</span>
                        </div>

                        <div className="grand-row">
                            <span className="grand-lbl">Genel Toplam</span>
                            <span className="grand-amt">{formatCurrency(data.grandTotal)}</span>
                        </div>

                        <div className="pay-box">
                            <div className="pay-box-title">Ödeme Detayı</div>
                            <div className="pay-row">
                                <span className="pl">Ödeme Yöntemi</span>
                                <span className="pv">{data.paymentMethod}</span>
                            </div>
                            {data.amountPaid != null && (
                                <div className="pay-row">
                                    <span className="pl">Ödenen Tutar</span>
                                    <span className="pv">{formatCurrency(data.amountPaid)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="receipt-footer">
                        <div className="qr-wrap">
                            <canvas ref={canvasRef} id="qr-canvas"></canvas>
                            <div className="qr-label">{data.documentNo}</div>
                        </div>

                        <div className="footer-company">
                            <strong>{data.companyFullName}</strong>
                            {data.address.split('\n').map((line, i) => React.cloneElement(<span>{line}<br /></span>, { key: i }))}
                            Tel: {data.phone}
                        </div>

                        <div className="footer-disclaimer">
                            Bu fiş bilgi amaçlı yazdırılmış olup<br />
                            herhangi bir mali değeri yoktur.
                        </div>

                        <div className="footer-bye">İyi Günler</div>
                    </div>
                </div>

                <div className="tear-bottom"></div>
            </div>
        </>
    );
};
