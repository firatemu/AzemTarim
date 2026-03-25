# ERP Check/Bill Frontend — Cursor/Windsurf Prompt Paketi

## Kullanım Talimatları

Bu klasörde 5 prompt dosyası var. Her birini Cursor/Windsurf'a **sırayla** ve **ayrı ayrı** ver.
Bir phase bitmeden sonrakine geçme.

---

## Dosyalar ve Sıra

| # | Dosya | Kapsam | Tahmini Süre |
|---|-------|--------|--------------|
| 0 | `phase-0-foundation.md` | Proje kurulumu, design system, AppShell, tip sistemi | ~20 dk |
| 1 | `phase-1-payroll.md` | Bordro listesi, detay, timeline, tahsilat sheet | ~20 dk |
| 2 | `phase-2-wizard.md` | 4 adımlı yeni bordro sihirbazı | ~25 dk |
| 3 | `phase-3-checks.md` | Çek/senet listesi, detay, ciro zinciri, log | ~25 dk |
| 4 | `phase-4-5-6-7.md` | Evrak CRUD, yazdırma, raporlar, ayarlar, polish | ~35 dk |

---

## Cursor / Windsurf'ta Kullanım

1. Projeyi oluştur: `npx create-next-app@latest check-bill-erp ...`
2. Her phase için:
   - Agent mode'u aç
   - Prompt dosyasını `@phase-N-xxx.md` olarak referans ver
   - Tek mesaj: `Execute all tasks in @phase-N-xxx.md`
   - Bitmesini bekle, hatalar varsa agent'ın düzeltmesine izin ver
   - `npm run build` çalıştır — 0 hata olduğunu doğrula
   - Sonraki phase'e geç

---

## Ekran Haritası

```
/                          → Dashboard
/payroll                   → Bordro Listesi
/payroll/new               → Yeni Bordro (4 adımlı sihirbaz)
/payroll/[id]              → Bordro Detayı + Tahsilat
/payroll/print/[id]        → Yazdırılabilir Bordro (A4)
/checks                    → Çek/Senet Listesi (CREDIT | DEBIT)
/checks/new                → Tekil Evrak Girişi
/checks/[id]               → Evrak Detayı + Durum Makinesi
/checks/[id]/edit          → Evrak Düzenleme
/checks/[id]/collection    → Tahsilat Sayfası
/checks/[id]/receipt       → Tahsilat Makbuzu (A4)
/reports/portfolio         → Portföy Durum Raporu
/reports/maturity          → Vade Analizi
/reports/account           → Cari Bazlı Özet
/reports/bank              → Banka Dağılımı
/reports/collection        → Tahsilat Performansı
/reports/overdue           → Vadesi Geçmiş
/settings/check-bill       → Modül Ayarları
```

---

## Backend Bağlantısı

`NEXT_PUBLIC_API_URL=http://localhost:3001/api` environment variable ile configure edilir.
Tüm API çağrıları `src/lib/api.ts` üzerinden geçer.

Backend prompt (ayrı dosya): `check-bill-erp-refactor.md`
