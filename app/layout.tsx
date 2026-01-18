import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://otomuhasebe.com'),
  title: {
    default: 'OtoMuhasebe - Muhasebe Süreçlerinizi Otomatikleştirin',
    template: '%s | OtoMuhasebe',
  },
  description: 'Bulut tabanlı muhasebe yazılımı ile faturalarınızı oluşturun, gelir-gider takibi yapın, e-arşiv entegrasyonu ile zaman kazanın.',
  keywords: ['muhasebe yazılımı', 'fatura oluşturma', 'e-arşiv', 'gelir-gider takibi'],
  authors: [{ name: 'OtoMuhasebe' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://otomuhasebe.com',
    title: 'OtoMuhasebe - Muhasebe Süreçlerinizi Otomatikleştirin',
    description: 'Bulut tabanlı muhasebe yazılımı',
    siteName: 'OtoMuhasebe',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OtoMuhasebe',
    description: 'Muhasebe Süreçlerinizi Otomatikleştirin',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://otomuhasebe.com' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
