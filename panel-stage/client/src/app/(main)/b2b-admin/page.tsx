'use client';

import StandardPage from '@/components/common/StandardPage';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  alpha,
  useTheme,
  Grid
} from '@mui/material';
import Link from 'next/link';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  AssignmentInd as SalespersonIcon,
  Inventory as ProductIcon,
  Campaign as DiscountIcon,
  ShoppingCart as OrderIcon,
  LocalShipping as DeliveryIcon,
  AdUnits as AdvertisementIcon,
  Assessment as ReportIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

const cards = [
  { title: 'Ayarlar', desc: 'Domain, lisans, depo görünümü', href: '/b2b-admin/settings', icon: <SettingsIcon />, color: '#6366f1' },
  { title: 'B2B Cariler', desc: 'Portal kullanıcıları, FIFO raporu', href: '/b2b-admin/customers', icon: <PeopleIcon />, color: '#10b981' },
  { title: 'Müşteri Sınıfları', desc: 'İskonto oranları ve gruplar', href: '/b2b-admin/customer-classes', icon: <ClassIcon />, color: '#f59e0b' },
  { title: 'Plasiyerler', desc: 'Saha kullanıcıları yönetimi', href: '/b2b-admin/salespersons', icon: <SalespersonIcon />, color: '#ec4899' },
  { title: 'Ürünler', desc: 'B2B görünürlük ve görseller', href: '/b2b-admin/products', icon: <ProductIcon />, color: '#8b5cf6' },
  { title: 'İndirimler', desc: 'Kampanya ve promosyonlar', href: '/b2b-admin/discounts', icon: <DiscountIcon />, color: '#f43f5e' },
  { title: 'Siparişler', desc: 'Onay ve durum takibi', href: '/b2b-admin/orders', icon: <OrderIcon />, color: '#3b82f6' },
  { title: 'Teslimat', desc: 'Teslimat yöntemleri ve kargo', href: '/b2b-admin/delivery-methods', icon: <DeliveryIcon />, color: '#06b6d4' },
  { title: 'Reklamlar', desc: 'Banner ve duyuru yönetimi', href: '/b2b-admin/advertisements', icon: <AdvertisementIcon />, color: '#f97316' },
  { title: 'Raporlar', desc: 'Özet ve Excel çıktıları', href: '/b2b-admin/reports', icon: <ReportIcon />, color: '#14b8a6' },
  { title: 'Senkron', desc: 'ERP eşitleme durumu', href: '/b2b-admin/sync', icon: <SyncIcon />, color: '#64748b' },
];

export default function B2bAdminHomePage() {
  const theme = useTheme();

  return (
    <StandardPage
      title="B2B Yönetimi"
      breadcrumbs={[{ label: 'B2B Yönetimi' }]}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02e' }}>
          B2B Portalı <Box component="span" sx={{ color: 'primary.main' }}>Yönetimi</Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
          Müşteri portalı, sipariş akışı ve ERP senkronizasyonunu buradan yönetebilirsiniz.
          Tüm değişiklikler anında B2B arayüzüne yansır.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid key={c.href} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderRadius: 4,
                bgcolor: 'background.paper',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${alpha(c.color, 0.12)}`,
                  borderColor: c.color
                }
              }}
            >
              <CardActionArea
                component={Link}
                href={c.href}
                sx={{ height: '100%', p: 1 }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(c.color, 0.1),
                      color: c.color,
                      mb: 2,
                      '& svg': { fontSize: 28 }
                    }}
                  >
                    {c.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.01e' }}>
                    {c.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {c.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </StandardPage>
  );
}
