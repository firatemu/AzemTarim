'use client';

import StandardPage from '@/components/common/StandardPage';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import Link from 'next/link';

const cards = [
  { title: 'Ayarlar', desc: 'Domain, lisans, depo görünümü', href: '/b2b-admin/settings' },
  { title: 'B2B cariler', desc: 'Portal kullanıcıları, FIFO raporu', href: '/b2b-admin/customers' },
  { title: 'Müşteri sınıfları', desc: 'İskonto oranları', href: '/b2b-admin/customer-classes' },
  { title: 'Plasiyerler', desc: 'Saha kullanıcıları', href: '/b2b-admin/salespersons' },
  { title: 'Ürünler', desc: 'B2B görünürlük, görseller', href: '/b2b-admin/products' },
  { title: 'İndirimler', desc: 'Kampanyalar', href: '/b2b-admin/discounts' },
  { title: 'Siparişler', desc: 'Onay / durum', href: '/b2b-admin/orders' },
  { title: 'Teslimat', desc: 'Teslimat yöntemleri', href: '/b2b-admin/delivery-methods' },
  { title: 'Reklamlar', desc: 'Banner ve duyurular', href: '/b2b-admin/advertisements' },
  { title: 'Raporlar', desc: 'Özet ve Excel çıktıları', href: '/b2b-admin/reports' },
  { title: 'Senkron', desc: 'ERP eşitleme durumu', href: '/b2b-admin/sync' },
];

export default function B2bAdminHomePage() {
  return (
    <StandardPage
      title="B2B Yönetimi"
      breadcrumbs={[{ label: 'B2B Yönetimi' }]}
    >
      <Typography variant="body1" sx={{ color: 'var(--muted-foreground)', mb: 2 }}>
        Tüm sayfalar üst menüden de erişilebilir. Veriler oturumdaki tenant ve B2B lisansı ile
        yüklenir.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {cards.map((c) => (
          <Card
            key={c.href}
            variant="outlined"
            sx={{ borderColor: 'var(--border)', bgcolor: 'var(--card)' }}
          >
            <CardActionArea component={Link} href={c.href}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color="var(--foreground)">
                  {c.title}
                </Typography>
                <Typography variant="body2" color="var(--muted-foreground)">
                  {c.desc}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </StandardPage>
  );
}
