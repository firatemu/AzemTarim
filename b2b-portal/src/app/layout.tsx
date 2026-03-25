import type { Metadata } from 'next';
import { AppProviders } from '@/components/AppProviders';

export const metadata: Metadata = {
  title: 'B2B Portal',
  description: 'Bayi siparis portalı',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
